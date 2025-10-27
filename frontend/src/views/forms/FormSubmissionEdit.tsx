import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message, FormInstance } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import DatePicker from '@/components/ui/DatePicker'
import { isFieldVisible, updateVisibleFields } from '@/utils/formUtils'

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
    form?: any
}

interface FormField {
    id: number
    label: string
    field_type: string
    required: boolean
    options?: string[]
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

const FormSubmissionEdit = () => {
    const { id, submissionId } = useParams<{ id: string; submissionId: string }>()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [formDetails, setFormDetails] = useState<FormDetails | null>(null)
    const [submission, setSubmission] = useState<FormSubmission | null>(null)
    const [visibleFields, setVisibleFields] = useState<number[]>([])

    useEffect(() => {
        fetchFormDetails()
    }, [id])

    useEffect(() => {
        if (formDetails) {
            fetchSubmission()
        }
    }, [formDetails, submissionId])

    const fetchFormDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/forms/${id}/`)
            setFormDetails(response.data)
            // Initialize visible fields with non-dependent fields
            const initialVisibleFields = response.data.fields
                .filter((field: FormField) => !field.depends_on)
                .map((field: FormField) => field.id)
            setVisibleFields(initialVisibleFields)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات فرم')
        }
    }

    const fetchSubmission = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/api/submissions/${submissionId}/`)
            setSubmission(response.data)
            
            if (!formDetails) return;
            
            // Convert date strings to Date objects for date fields
            const formattedValues = { ...response.data.values }
            formDetails.fields.forEach(field => {
                if (field.field_type === 'date' && formattedValues[field.id]) {
                    try {
                        const date = new Date(formattedValues[field.id])
                        if (!isNaN(date.getTime())) {
                            formattedValues[field.id] = date.toISOString()
                        }
                    } catch (e) {
                        console.error('Error parsing date:', e)
                    }
                }
            })
            
            // Set initial form values
            form.setFieldsValue({
                fields: formattedValues
            })

            // Check for dependent fields visibility on initial load
            const initialVisibleFields = [...visibleFields]
            formDetails.fields.forEach((field: FormField) => {
                if (field.depends_on) {
                    const hasValue = formattedValues[field.id] !== undefined && formattedValues[field.id] !== null
                    const meetsVisibilityRule = field.visibility_rule && 
                        formattedValues[field.depends_on] === field.visibility_rule.value

                    if (hasValue || meetsVisibilityRule) {
                        if (!initialVisibleFields.includes(field.id)) {
                            initialVisibleFields.push(field.id)
                        }
                    }
                }
            })
            setVisibleFields(initialVisibleFields)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات فرم پر شده')
        } finally {
            setLoading(false)
        }
    }

    const handleFieldValueChange = (field: FormField, value: any) => {
        console.log("DDDDDDDDDDDDDDDDDDDDDD", formDetails)
        if (!formDetails) return

        const newVisibleFields = [...visibleFields]
        
        // Check for dependent fields that depend on this field
        formDetails.fields.forEach((dependentField: FormField) => {
            if (dependentField.depends_on === field.id && dependentField.visibility_rule) {
                const shouldBeVisible = value.value === dependentField.visibility_rule.value
                const hasValue = form.getFieldValue(['fields', dependentField.id.toString()]) !== undefined
                if (shouldBeVisible || hasValue) {
                console.log("DDDDDDDDDDDDDDDDDDDDDDDD", newVisibleFields )

                    if (!newVisibleFields.includes(dependentField.id)) {
                        newVisibleFields.push(dependentField.id)    
                        
                        // Get the current value from the form
                        const currentValue = form.getFieldValue(['fields', dependentField.id.toString()])
                        if (currentValue === undefined) {
                            form.setFieldValue(['fields', dependentField.id.toString()], '')
                        }
                    }
                } else {
                    const index = newVisibleFields.indexOf(dependentField.id)
                    if (index > -1) {
                        newVisibleFields.splice(index, 1)
                        // Don't clear the value, just hide the field
                        form.setFieldValue(['fields', dependentField.id.toString()], undefined)
                    }
                }
            }
        })

        setVisibleFields(newVisibleFields)
    }

    const renderFormField = (field: FormField) => {
        switch (field.field_type) {
            case 'text':
                return (
                    <Input placeholder={`${field.label} را وارد کنید`} />
                )
            case 'number':
                return (
                    <Input type="number" placeholder={`${field.label} را وارد کنید`} />
                )
            case 'textarea':
                return (
                    <Input textArea rows={4} placeholder={`${field.label} را وارد کنید`} />
                )
            case 'select':
                return (
                    <Select
                        options={field.options?.map(option => ({
                            value: option,
                            label: option
                        }))}
                        placeholder={`${field.label} را انتخاب کنید`}
                        onChange={(value) => handleFieldValueChange(field, value)}
                    />
                )
            case 'radio':
                return (
                    <Select
                        options={field.options?.map(option => ({
                            value: option,
                            label: option
                        }))}
                        placeholder={`${field.label} را انتخاب کنید`}
                        onChange={(value) => handleFieldValueChange(field, value)}
                    />
                )
            case 'checkbox':
                return <Checkbox onChange={(checked) => handleFieldValueChange(field, checked)} />
            case 'date':
                return <DatePicker placeholder={`${field.label} را انتخاب کنید`} />
            case 'label':
                return (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-700 whitespace-pre-wrap">{field.label}</div>
                    </div>
                )
            default:
                return <Input placeholder={`${field.label} را وارد کنید`} />
        }
    }

    const onFinish = async (values: any) => {
        try {
            setLoading(true)
            const formattedValues = { ...values.fields }
            
            // Convert Date objects to ISO strings for date fields
            formDetails?.fields.forEach(field => {
                if (field.field_type === 'date' && formattedValues[field.id]) {
                    formattedValues[field.id] = new Date(formattedValues[field.id]).toISOString()
                }
            })

            await axiosInstance.put(`/api/submissions/${submissionId}/`, {
                values: formattedValues,
                form: submission?.form,
                patient_id: submission?.patient.id
            })
            message.success('فرم با موفقیت بروزرسانی شد')
            navigate(`/forms/${id}/submissions`)
        } catch (error: any) {
            console.error('Error updating form:', error.response?.data)
            if (error.response?.data) {
                const errors = error.response.data
                Object.keys(errors).forEach(key => {
                    form.setFields([{
                        name: key.split('.'),
                        errors: Array.isArray(errors[key]) ? errors[key] : [errors[key]]
                    }])
                })
                message.error('لطفاً خطاهای فرم را بررسی کنید')
            } else {
                message.error(error.response?.data?.detail || 'خطا در بروزرسانی فرم')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFieldChange = (changedFields: any, allFields: any) => {
        if (!formDetails) return

        const newVisibleFields = [...visibleFields]
        
        // Check each field for dependencies
        formDetails.fields.forEach((field: FormField) => {
            if (field.depends_on) {
                const parentField = formDetails.fields.find(f => f.id === field.depends_on)
                if (parentField) {
                    const parentValue = allFields[`fields.${parentField.id}`]
                    const shouldBeVisible = parentValue === field.visibility_rule?.value

                    if (shouldBeVisible && !newVisibleFields.includes(field.id)) {
                        newVisibleFields.push(field.id)
                    }
                }
            }
        })

        setVisibleFields(newVisibleFields)
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
                    <h3>ویرایش فرم {formDetails?.name}</h3>
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

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onValuesChange={handleFieldChange}
                        >
                            <div className="grid grid-cols-2 gap-6">
                                {formDetails?.fields.map(field => (
                                    visibleFields.includes(field.id) && (
                                        <Form.Item
                                            key={field.id}
                                            name={['fields', field.id.toString()]}
                                            label={field.label}
                                            rules={[
                                                {
                                                    required: field.required,
                                                    message: `لطفاً ${field.label} را وارد کنید`
                                                }
                                            ]}
                                        >
                                            {renderFormField(field)}
                                        </Form.Item>
                                    )
                                ))}
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button variant="solid" loading={loading} type="submit">
                                    ذخیره تغییرات
                                </Button>
                                <Button
                                    variant="plain"
                                    type="button"
                                    onClick={() => navigate(`/forms/${id}/submissions`)}
                                >
                                    انصراف
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </AdaptiveCard>
        </Container>
    )
}

export default FormSubmissionEdit 