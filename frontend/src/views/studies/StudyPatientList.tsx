import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message, Modal, Input } from 'antd'
import { HiOutlineArrowLeft, HiOutlineSearch } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'

interface Patient {
    id: number
    first_name: string
    last_name: string
    national_code: string
    study_submissions: {
        id: number
        created_at: string
        status: string
        study: number
        current_state: {
            id: number
            name: string
        } | null
    }[]
    phone_number: string
}

interface Study {
    id: number
    name: string
    description: string
}

interface TablePagination {
    current: number
    pageSize: number
    total: number
}

const StudyPatientList = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [patients, setPatients] = useState<Patient[]>([])
    const [study, setStudy] = useState<Study | null>(null)
    const [createModalVisible, setCreateModalVisible] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [pagination, setPagination] = useState<TablePagination>({
        current: 1,
        pageSize: 10,
        total: 0
    })

    const fetchStudy = async () => {
        try {
            const response = await axiosInstance.get(`/api/studies/${id}/`)
            setStudy(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات مطالعه')
            navigate('/studies')
        }
    }

    const fetchPatients = async (page: number = 1, pageSize: number = 10, search: string = '') => {
        try {
            console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDD")
            setLoading(true)
            const response = await axiosInstance.get('/api/patients/', {
                params: {
                    page,
                    page_size: pageSize,
                    search
                }
            })
            
            setPatients(response.data.results)
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.data.result_count/pageSize
            })
        } catch (error: any) {
            message.error('خطا در دریافت لیست بیماران')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudy()
        fetchPatients(pagination.current, pagination.pageSize, searchQuery)
    }, [id])

    const handleCreateSubmission = async () => {
        if (!selectedPatient || !study) return

        try {
            await axiosInstance.post('/api/study-submissions/', {
                study: study.id,
                patient_id: selectedPatient.id,
                status: 'pending'
            })
            message.success('مطالعه با موفقیت برای بیمار ایجاد شد')
            setCreateModalVisible(false)
            fetchPatients(pagination.current, pagination.pageSize, searchQuery)
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در ایجاد مطالعه برای بیمار')
        }
    }

    const handleTableChange = (newPagination: any) => {
        fetchPatients(newPagination.current, newPagination.pageSize, searchQuery)
    }

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        // Reset to first page when searching
        fetchPatients(1, pagination.pageSize, value)
    }

    const columns: ColumnDef<Patient>[] = [
        {
            header: 'نام بیمار',
            accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        },
        {
            header: 'کد ملی',
            accessorFn: (row) => row.national_id,
        },
        {
            header: 'وضعیت مطالعه',
            accessorFn: (row) => {
                const submission = row.study_submissions?.find(s => s.study_id === Number(id))
                if (!submission) return 'شروع نشده'
                return submission.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'
            },
        },
        {
            header: 'مرحله فعلی',
            accessorFn: (row) => {
                const submission = row.study_submissions?.find(s => s.study_id === Number(id))
                if (!submission) return '-'
                return submission.current_state?.name || '-'
            },
        },
        {
            header: 'تاریخ شروع',
            accessorFn: (row) => {
                const submission = row.study_submissions?.find(s => s.study_id === Number(id))
                if (!submission) return '-'
                return new Date(submission.created_at).toLocaleDateString('fa-IR')
            },
        },
        {
            header: 'عملیات',
            id: 'action',
            cell: (props) => {
                const submission = props.row.original.study_submissions?.find(s => s.study_id === Number(id))
                
                return (
                    <div className="flex items-center justify-end gap-3">
                        {submission ? (
                            <Button
                                variant="solid"
                                onClick={() => navigate(`/study-submissions/${submission.id}/edit`)}
                            >
                                مدیریت مطالعه
                            </Button>
                        ) : (
                            <Button
                                variant="solid"
                                onClick={() => {
                                    setSelectedPatient(props.row.original)
                                    setCreateModalVisible(true)
                                }}
                            >
                                شروع مطالعه
                            </Button>
                        )}
                    </div>
                )
            },
        },
    ]

    if (loading && !patients.length) {
        return <Loading loading={true} />
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate('/studies')}
                >
                    بازگشت به لیست
                </Button>
            </div>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 className="mb-0">لیست بیماران مطالعه {study?.name}</h3>
                        <div className="w-full md:w-64">
                            <Input
                                prefix={<HiOutlineSearch className="text-gray-400" />}
                                placeholder="جستجو در نام، نام خانوادگی یا کد ملی..."
                                value={searchQuery}
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

                <Modal
                    title="شروع مطالعه برای بیمار"
                    open={createModalVisible}
                    onOk={handleCreateSubmission}
                    onCancel={() => setCreateModalVisible(false)}
                    okText="بله"
                    cancelText="خیر"
                    okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-700' }}
                    cancelButtonProps={{ className: 'bg-gray-100 hover:bg-gray-200 text-gray-700' }}
                >
                    <p className="text-gray-800">
                        آیا می‌خواهید مطالعه {study?.name} را برای بیمار{' '}
                        {selectedPatient?.first_name} {selectedPatient?.last_name} شروع کنید؟
                    </p>
                </Modal>
            </AdaptiveCard>
        </Container>
    )
}

export default StudyPatientList 