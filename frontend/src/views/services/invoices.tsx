import { useEffect, useState } from 'react'
import { message, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '@/utils/axios'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnDef } from '@/components/shared/DataTable'
import Tooltip from '@/components/ui/Tooltip'

interface Patient {
    id: number
    national_id: string
    first_name: string
    last_name: string
    phone: string
    address: string
    created_at: string
}

interface PaginationState {
    current: number
    pageSize: number
    total: number
}

const Invoices = () => {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [pagination, setPagination] = useState<PaginationState>({
        current: 1,
        pageSize: 10,
        total: 0
    })
    const navigate = useNavigate()

    const fetchPatients = async (page: number = 1, pageSize: number = 10) => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/patients/', {
                params: {
                    page,
                    page_size: pageSize,
                    search: searchText
                }
            })
            
            setPatients(response.data.results)
            setPagination(prev => ({
                ...prev,
                current: response.data.page_number,
                pageSize: response.data.page_count,
                total: response.data.result_count
            }))
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت لیست بیماران')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPatients(pagination.current, pagination.pageSize)
    }, [searchText])

    const handleTableChange = (newPagination: PaginationState) => {
        fetchPatients(newPagination.current, newPagination.pageSize, searchText)
    }

    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination(prev => ({ ...prev, current: 1 }))
        fetchPatients(1, pagination.pageSize)
    }

    const handleDelete = async () => {
        if (!selectedPatient) return

        try {
            setLoading(true)
            await axiosInstance.delete(`/api/patients/${selectedPatient.id}/`)
            message.success('بیمار با موفقیت حذف شد')
            fetchPatients(pagination.current, pagination.pageSize)
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در حذف بیمار')
        } finally {
            setLoading(false)
            setDeleteModalVisible(false)
            setSelectedPatient(null)
        }
    }

    const ActionColumn = ({ row }: { row: { original: Patient } }) => {
        return (
            <div className="flex items-center justify-end gap-3">
                <Tooltip title="ویرایش">
                    <Button
                        onClick={() => navigate(`/patients/${row.original.id}/edit`)}
                        size="xs"
                        variant="plain"
                        icon={<EditOutlined />}
                    />
                </Tooltip>
                <Tooltip title="حذف">
                    <Button
                        size="xs"
                        variant="plain"
                        color="red"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            setSelectedPatient(row.original)
                            setDeleteModalVisible(true)
                        }}
                    />
                </Tooltip>
            </div>
        )
    }

    const columns: ColumnDef<Patient>[] = [
        {
            header: 'کد ملی',
            accessorKey: 'national_id',
        },
        {
            header: 'نام',
            accessorKey: 'first_name',
        },
        {
            header: 'نام خانوادگی',
            accessorKey: 'last_name',
        },
        {
            header: 'شماره تماس',
            accessorKey: 'phone',
        },
        {
            header: 'آدرس',
            accessorKey: 'address',
        },
        {
            header: '',
            id: 'action',
            cell: (props) => <ActionColumn row={props.row} />,
        },
    ]

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="mb-0">بیماران</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/patients/create')}
                        >
                            افزودن بیمار جدید
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex items-center gap-3 w-full md:w-320">
                            <Input
                                prefix={<SearchOutlined className="text-lg" />}
                                placeholder="جستجو..."
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <DataTable
                        data={patients}
                        columns={columns}
                        loading={loading}
                        skeletonAvatarColumns={[0]}
                        skeletonAvatarProps={{ width: 28, height: 28 }}
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
                title="حذف بیمار"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false)
                    setSelectedPatient(null)
                }}
                okText="حذف"
                cancelText="انصراف"
                okButtonProps={{ color: 'red' }}
                confirmLoading={loading}
            >
                <p>آیا از حذف بیمار {selectedPatient?.first_name} {selectedPatient?.last_name} اطمینان دارید؟</p>
            </Modal>
        </Container>
    )
}

export default Invoices