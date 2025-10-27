import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message } from 'antd'
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

interface Patient {
    id: number
    first_name: string
    last_name: string
    national_id: string
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

const FormSubmissionCreate = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [formDetails, setFormDetails] = useState<FormDetails | null>(null)
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [visibleFields, setVisibleFields] = useState<number[]>([])

    useEffect(() => {
        fetchFormDetails()
        fetchPatients()
    }, [id])

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

    const fetchPatients = async () => {
        try {
            const response = await axiosInstance.get('/api/patients/')
            setPatients(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت لیست بیماران')
        }
    }

    const handlePatientSelect = (value: number) => {
        const patient = patients.find(p => p.id === value)
        setSelectedPatient(patient || null)
    }

    const renderFormField = (field: FormField) => {
        const handleFieldChange = (value: any) => {
            if (!formDetails) return

            const newVisibleFields = [...visibleFields]
            
            // Check for dependent fields that depend on this field
            formDetails.fields.forEach((dependentField: FormField) => {
                if (dependentField.depends_on === field.id && dependentField.visibility_rule) {
                    const shouldBeVisible = value.value == dependentField.visibility_rule.value
                    console.log('dependentField', shouldBeVisible,dependentField.visibility_rule.value, value.value)
                    if (shouldBeVisible) {
                        if (!newVisibleFields.includes(dependentField.id)) {
                            newVisibleFields.push(dependentField.id)
                            // اضافه کردن مقدار فیلد به فرم
                            console.log('dependentField', shouldBeVisible,dependentField)
                            form.setFieldValue(['fields', dependentField.id.toString()], '')
                        }
                    } else {
                        const index = newVisibleFields.indexOf(dependentField.id)
                        if (index > -1) {
                            newVisibleFields.splice(index, 1)
                            // پاک کردن مقدار فیلد از فرم
                            form.setFieldValue(['fields', dependentField.id.toString()], undefined)
                        }
                    }
                }
            })

            setVisibleFields(newVisibleFields)
        }

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
                        onChange={handleFieldChange}
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
                        onChange={handleFieldChange}
                    />
                )
            case 'checkbox':
                return <Checkbox />
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
            
            // Convert fields object to the correct format
            const formattedValues: { [key: string]: any } = {}
            Object.keys(values.fields || {}).forEach(fieldId => {
                formattedValues[fieldId] = values.fields[fieldId]
            })

            const submitData = {
                patient_id: values.patient_id.value,
                values: formattedValues,
                form: Number(id)  // Add form ID from URL params
            }

            await axiosInstance.post(`/api/submissions/`, submitData)
            message.success('فرم با موفقیت ثبت شد')
            navigate(`/forms/${id}/submissions`)
        } catch (error: any) {
            console.error('Error submitting form:', error.response?.data)
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
                message.error(error.response?.data?.detail || 'خطا در ثبت فرم')
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
                    <h3>پر کردن فرم {formDetails?.name}</h3>
                    {formDetails?.description && (
                        <p className="text-gray-500 mt-2">{formDetails.description}</p>
                    )}
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        fields: {}
                    }}
                    onValuesChange={handleFieldChange}
                >
                    <Form.Item
                        name="patient_id"
                        label="انتخاب بیمار"
                        rules={[{ required: true, message: 'لطفاً بیمار را انتخاب کنید' }]}
                    >
                        <Select
                            placeholder="بیمار را انتخاب کنید"
                            options={patients.map(patient => ({
                                value: patient.id,
                                label: `${patient.first_name} ${patient.last_name} (${patient.national_id})`
                            }))}
                        />
                    </Form.Item>

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

                    <div className="flex gap-2">
                        <Button variant="solid" loading={loading} type="submit">
                            ثبت فرم
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
            </AdaptiveCard>
        </Container>
    )
}

export default FormSubmissionCreate 