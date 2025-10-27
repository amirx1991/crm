import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'

interface FormSubmission {
    id: number
    patient: {
        id: number
        first_name: string
        last_name: string
        national_id: string
    }
    values: { [key: string]: any }
    created_at: string
    updated_at: string
}

interface FormField {
    id: number
    name: string
    label: string
    field_type: string
    required: boolean
    options?: string[]
    order: number
    visibility_rule?: {
        field_id: number
        value: string | number | boolean
    }
    depends_on?: number
}

interface FormDetails {
    id: number
    name: string
    description: string
    fields: FormField[]
}

const FormSubmissionView = () => {
    const { id, submissionId } = useParams<{ id: string; submissionId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formDetails, setFormDetails] = useState<FormDetails | null>(null)
    const [submission, setSubmission] = useState<FormSubmission | null>(null)

    useEffect(() => {
        fetchFormDetails()
        fetchSubmission()
    }, [id, submissionId])

    const fetchFormDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/forms/${id}/`)
            setFormDetails(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات فرم')
        }
    }

    const fetchSubmission = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/api/submissions/${submissionId}/`)
            setSubmission(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات فرم پر شده')
        } finally {
            setLoading(false)
        }
    }

    const renderFieldValue = (field: FormField) => {
        const value = submission?.values[field.id]
        if (!value) return '-'

        switch (field.field_type) {
            case 'date':
                return new Date(value).toLocaleDateString('fa-IR')
            case 'checkbox':
                return value ? 'بله' : 'خیر'
            case 'select':
                return value
            case 'radio':
                return value
            case 'textarea':
                return value
            default:
                return value
        }
    }

    // Function to check if a field should be visible based on its visibility rule
    const isFieldVisible = (field: FormField) => {
        // If no visibility rule, field is always visible
        if (!field.visibility_rule) return true;
        
        // Get the value of the field this one depends on
        const dependentFieldValue = submission?.values[field.visibility_rule.field_id];
        
        // Check if the value matches the rule
        return dependentFieldValue === field.visibility_rule.value;
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate(`/forms/${id}/submissions`)}
                >
                    بازگشت به لیست
                </Button>
            </div>
            <AdaptiveCard>
                <div className="mb-4">
                    <h3>مشاهده فرم {formDetails?.name}</h3>
                    {formDetails?.description && (
                        <p className="text-gray-500 mt-2">{formDetails.description}</p>
                    )}
                </div>

                {submission && (
                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h4 className="text-lg font-medium mb-2">اطلاعات بیمار</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-gray-500">نام و نام خانوادگی: </span>
                                    <span>{submission.patient.first_name} {submission.patient.last_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">کد ملی: </span>
                                    <span>{submission.patient.national_id}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium mb-4">مقادیر فرم</h4>
                            <div className="grid grid-cols-2 gap-6">
                                {formDetails?.fields
                                    .sort((a, b) => a.order - b.order)
                                    .filter(field => isFieldVisible(field))
                                    .map(field => (
                                        <div key={field.id} className="space-y-1">
                                            <label className="text-gray-500">
                                                {field.label}
                                                {field.required && <span className="text-red-500 mr-1">*</span>}
                                            </label>
                                            <div className="font-medium">
                                                {renderFieldValue(field)}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-6">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                    <span>تاریخ ثبت: </span>
                                    <span>{new Date(submission.created_at).toLocaleDateString('fa-IR')}</span>
                                </div>
                                <div>
                                    <span>آخرین ویرایش: </span>
                                    <span>{new Date(submission.updated_at).toLocaleDateString('fa-IR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AdaptiveCard>
        </Container>
    )
}

export default FormSubmissionView 