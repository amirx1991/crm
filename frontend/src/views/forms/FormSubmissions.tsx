import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message, Tabs } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbEye, TbPlus, TbEdit } from 'react-icons/tb'

interface FormSubmission {
    id: number
    patient: {
        id: number
        first_name: string
        last_name: string
        national_id: string
    }
    created_at: string
    updated_at: string
}

interface FormDetails {
    id: number
    name: string
    description: string
    fields: Array<{
        id: number
        label: string
        field_type: string
        required: boolean
        options?: string[]
    }>
}

const FormSubmissions = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formDetails, setFormDetails] = useState<FormDetails | null>(null)
    const [submissions, setSubmissions] = useState<FormSubmission[]>([])
    const [activeTab, setActiveTab] = useState('submissions')

    useEffect(() => {
        fetchFormDetails()
        fetchSubmissions()
    }, [id])

    const fetchFormDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/forms/${id}/`)
            setFormDetails(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات فرم')
        }
    }

    const fetchSubmissions = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/api/forms/${id}/submissions/`)
            setSubmissions(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت لیست فرم‌های پر شده')
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnDef<FormSubmission>[] = [
        {
            header: 'نام بیمار',
            accessorFn: (row) => `${row.patient.first_name} ${row.patient.last_name}`,
        },
        {
            header: 'کد ملی',
            accessorKey: 'patient.national_id',
        },
        {
            header: 'تاریخ ثبت',
            accessorKey: 'created_at',
            cell: (props) => new Date(props.getValue() as string).toLocaleDateString('fa-IR'),
        },
        {
            header: 'آخرین ویرایش',
            accessorKey: 'updated_at',
            cell: (props) => new Date(props.getValue() as string).toLocaleDateString('fa-IR'),
        },
        {
            header: 'عملیات',
            id: 'actions',
            cell: (props) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<TbEye />}
                        onClick={() => navigate(`/forms/${id}/submissions/${props.row.original.id}/view`)}
                    >
                        مشاهده
                    </Button>
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<TbEdit />}
                        onClick={() => navigate(`/forms/${id}/submissions/${props.row.original.id}/edit`)}
                    >
                        ویرایش
                    </Button>
                </div>
            ),
        },
    ]

    const handleNewSubmission = () => {
        navigate(`/forms/${id}/new-submission`)
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate('/forms')}
                >
                    بازگشت به لیست فرم‌ها
                </Button>
            </div>
            <AdaptiveCard>
                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <h3>{formDetails?.name}</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<TbPlus />}
                            onClick={handleNewSubmission}
                        >
                            پر کردن فرم برای بیمار جدید
                        </Button>
                    </div>
                    {formDetails?.description && (
                        <p className="text-gray-500 mt-2">{formDetails.description}</p>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={submissions}
                    loading={loading}
                    noData={!loading && submissions.length === 0}
                />
            </AdaptiveCard>
        </Container>
    )
}

export default FormSubmissions 