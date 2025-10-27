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
import jalaali from 'jalaali-js'
import { TbPlus, TbEdit, TbEye } from 'react-icons/tb'

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

const RepairMenList = () => {
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
            const response = await axiosInstance.get('/api/services/', {
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
            message.error(error.response?.data?.detail || 'خطا در دریافت لیست درخواست ها')
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
                        onClick={() => navigate(`/services/${row.original.id}/edit`)}
                        size="xs"
                        variant="plain"
                        icon={<EditOutlined />}
                    />
                </Tooltip>
               
            </div>
        )
    }

    const columns: ColumnDef<Patient>[] = [
               {
                   header: 'عنوان درخواست',
                   accessorKey: 'title',
               },
               {
                   header: 'توضیحات',
                   accessorKey: 'desc',
                  cell: (props) => {
                   const value = props.getValue() as string
                   if (!value) return '---'
                   return value.length > 100 ? value.slice(0, 100) + '...' : value
                   },
               },
                {
                   header: 'وضعیت',
                   accessorKey: 'status_type',
               },
         
               {
                   header: 'تاریخ ایجاد',
                   accessorKey: 'created_at',
                   cell: (props) => {
                   const value = props.getValue() as string
                   if (!value) return '-'
                   const date = new Date(value)
                   const j = jalaali.toJalaali(date)
                   return `${j.jy}/${j.jm.toString().padStart(2, '0')}/${j.jd.toString().padStart(2, '0')}`
                   }        },
       
                {
            header: 'عملیات',
            id: 'actions',
            cell: (props) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<TbEye />}
                        onClick={() => navigate(`/services/${props.row.original.id}/edit`)}
                    >
                        مشاهده
                    </Button>
                    
                </div>
            ),
        },
    ]

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      
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
                        noData={!loading && (patients.length === 0 )}

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

export default RepairMenList