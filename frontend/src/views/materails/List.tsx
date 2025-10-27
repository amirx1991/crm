import { useEffect, useState } from 'react'
import { message, Modal, Upload, Button as AntdButton } from 'antd'
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { ColumnDef } from '@/components/shared/DataTable'

interface Material {
    id: number
    title: string
    count?: number
    price?: number
    created_at: string
    updated_at: string
}

interface PaginationState {
    current: number
    pageSize: number
    total: number
}

const MaterialsList = () => {
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
    const [pagination, setPagination] = useState<PaginationState>({
        current: 1,
        pageSize: 10,
        total: 0
    })

    const fetchMaterials = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/materails/', {
                params: {
                    page,
                    page_size: pageSize
                }
            })
            
            setMaterials(response.data.results || response.data || [])
            setPagination(prev => ({
                ...prev,
                current: response.data.page_number || page,
                pageSize: response.data.page_count || pageSize,
                total: response.data.result_count || response.data.length || 0
            }))
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت لیست متریال‌ها')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMaterials(pagination.current, pagination.pageSize)
    }, [])

    const handleTableChange = (newPagination: PaginationState) => {
        fetchMaterials(newPagination.current, newPagination.pageSize)
    }

    const handleDelete = async () => {
        if (!selectedMaterial) return

        try {
            setLoading(true)
            await axiosInstance.delete(`/api/materails/${selectedMaterial.id}/`)
            message.success('متریال با موفقیت حذف شد')
            fetchMaterials(pagination.current, pagination.pageSize)
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در حذف متریال')
        } finally {
            setLoading(false)
            setDeleteModalVisible(false)
            setSelectedMaterial(null)
        }
    }

    const handleExcelUpload = async (file: File) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('file', file)

            await axiosInstance.post('/api/materails/import-excel/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            
            message.success('فایل اکسل با موفقیت وارد شد')
            fetchMaterials(pagination.current, pagination.pageSize)
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در وارد کردن فایل اکسل')
        } finally {
            setLoading(false)
        }
        return false // Prevent default upload
    }

    const ActionColumn = ({ row }: { row: { original: Material } }) => {
        return (
            <div className="flex items-center justify-end gap-2">
                <Button
                    onClick={() => window.open(`/materails/${row.original.id}/edit`, '_blank')}
                    size="xs"
                    variant="plain"
                    icon={<EditOutlined />}
                />
                <Button
                    onClick={() => {
                        setSelectedMaterial(row.original)
                        setDeleteModalVisible(true)
                    }}
                    size="xs"
                    variant="plain"
                    color="red"
                    icon={<DeleteOutlined />}
                />
            </div>
        )
    }

    const columns: ColumnDef<Material>[] = [
        {
            header: 'عنوان متریال',
            accessorKey: 'title',
        },
        {
            header: 'تعداد',
            accessorKey: 'count',
            cell: (props) => {
                const value = props.getValue() as number
                return value ? value.toLocaleString() : '—'
            },
        },
        {
            header: 'قیمت',
            accessorKey: 'price',
            cell: (props) => {
                const value = props.getValue() as number
                return value ? `${value.toLocaleString()} تومان` : '—'
            },
        },
        {
            header: 'تاریخ ایجاد',
            accessorKey: 'created_at',
            cell: (props) => {
                const value = props.getValue() as string
                if (!value) return '—'
                const date = new Date(value)
                return date.toLocaleDateString('fa-IR')
            },
        },
        {
            header: 'عملیات',
            id: 'actions',
            cell: ActionColumn,
        },
    ]

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold">مدیریت متریال‌ها</h2>
                            <p className="text-gray-600">لیست تمام متریال‌ها و تجهیزات موجود</p>
                        </div>
                        <div className="flex gap-2">
                            <Upload
                                beforeUpload={handleExcelUpload}
                                accept=".xlsx,.xls"
                                showUploadList={false}
                            >
                                <AntdButton icon={<UploadOutlined />} loading={loading}>
                                    وارد کردن از اکسل
                                </AntdButton>
                            </Upload>
                            <Button
                                variant="solid"
                                icon={<PlusOutlined />}
                                onClick={() => window.open('/materails/create', '_blank')}
                            >
                                افزودن متریال جدید
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        data={materials}
                        columns={columns}
                        loading={loading}
                        noData={!loading && materials.length === 0}
                        pagingData={{
                            total: pagination.total,
                            pageIndex: pagination.current,
                            pageSize: pagination.pageSize
                        }}
                        onPaginationChange={(page) => handleTableChange({ current: page, pageSize: pagination.pageSize })}
                        onSelectChange={(pageSize) => handleTableChange({ current: pagination.current, pageSize })}
                        pageSizes={[10, 25, 50]}
                    />
                </div>
            </AdaptiveCard>

            <Modal
                title="حذف متریال"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false)
                    setSelectedMaterial(null)
                }}
                okText="حذف"
                cancelText="انصراف"
                okButtonProps={{ color: 'red' }}
                confirmLoading={loading}
            >
                <p>آیا از حذف متریال "{selectedMaterial?.title}" اطمینان دارید؟</p>
            </Modal>
        </Container>
    )
}

export default MaterialsList


