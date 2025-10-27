import { useEffect, useState } from 'react'
import { Form, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '@/utils/axios'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { HiOutlineArrowLeft } from 'react-icons/hi'

interface PatientFormData {
    national_id: string
    first_name: string
    last_name: string
    phone: string
    address?: string
}

interface PatientFormProps {
    form: any
    initialValues?: PatientFormData
    onSubmit: (values: PatientFormData) => Promise<void>
    loading?: boolean
    isEdit?: boolean
}

const PatientFormComponent = ({ form, initialValues, onSubmit, loading, isEdit }: PatientFormProps) => {
    const navigate = useNavigate()

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate('/patients')}
                >
                    بازگشت به لیست بیماران
                </Button>
            </div>
            <AdaptiveCard>
                <div className="mb-4">
                    <h3>{isEdit ? 'ویرایش بیمار' : 'ثبت بیمار جدید'}</h3>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onSubmit}
                    initialValues={initialValues}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="national_id"
                            label="کد ملی"
                            rules={[
                                { required: true, message: 'کد ملی الزامی است' },
                                { len: 10, message: 'کد ملی باید 10 رقم باشد' },
                                { pattern: /^\d+$/, message: 'کد ملی باید فقط شامل اعداد باشد' }
                            ]}
                            validateTrigger={['onChange', 'onBlur']}
                            validateFirst
                        >
                            <Input 
                                placeholder="کد ملی را وارد کنید" 
                                maxLength={10}
                            />
                        </Form.Item>

                        <Form.Item
                            name="first_name"
                            label="نام"
                            rules={[
                                { required: true, message: 'نام الزامی است' },
                                { min: 2, message: 'نام باید حداقل 2 کاراکتر باشد' }
                            ]}
                            validateTrigger={['onChange', 'onBlur']}
                            validateFirst
                        >
                            <Input 
                                placeholder="نام را وارد کنید"
                            />
                        </Form.Item>

                        <Form.Item
                            name="last_name"
                            label="نام خانوادگی"
                            rules={[
                                { required: true, message: 'نام خانوادگی الزامی است' },
                                { min: 2, message: 'نام خانوادگی باید حداقل 2 کاراکتر باشد' }
                            ]}
                            validateTrigger={['onChange', 'onBlur']}
                            validateFirst
                        >
                            <Input 
                                placeholder="نام خانوادگی را وارد کنید"
                            />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="شماره تماس"
                            rules={[
                                { required: true, message: 'شماره تماس الزامی است' },
                                { pattern: /^(\+98|0)?9\d{9}$/, message: 'شماره تماس نامعتبر است' }
                            ]}
                            validateTrigger={['onChange', 'onBlur']}
                            validateFirst
                        >
                            <Input 
                                placeholder="شماره تماس را وارد کنید" 
                                dir="ltr"
                            />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            className="col-span-1 md:col-span-2"
                            label="آدرس"
                        >
                            <Input 
                                textArea 
                                placeholder="آدرس را وارد کنید" 
                                rows={4}
                            />
                        </Form.Item>

                        <div className="col-span-1 md:col-span-2 flex gap-2">
                            <Button variant="solid" loading={loading} type="submit">
                                {isEdit ? 'بروزرسانی' : 'ثبت'}
                            </Button>
                            <Button
                                variant="plain"
                                type="button"
                                onClick={() => navigate('/patients')}
                            >
                                انصراف
                            </Button>
                        </div>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    )
}

const PatientForm = () => {
    const [form] = Form.useForm<PatientFormData>()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [initialValues, setInitialValues] = useState<PatientFormData | undefined>(undefined)
    const isEdit = !!id

    useEffect(() => {
        if (isEdit) {
            fetchPatient()
        }
    }, [id])

    const fetchPatient = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/api/patients/${id}/`)
            const patientData = response.data.data || response.data
            setInitialValues(patientData)
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت اطلاعات بیمار')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (values: PatientFormData) => {
        try {
            console.log('Form submitted with values:', values)
            
            // Check if form is empty
            if (!values || Object.keys(values).length === 0) {
                message.error('لطفاً فرم را پر کنید')
                return
            }

            // Validate required fields
            const requiredFields = ['national_id', 'first_name', 'last_name', 'phone']
            const missingFields = requiredFields.filter(field => {
                const value = values[field as keyof PatientFormData]
                console.log(`Checking field ${field}:`, value)
                return !value || value.trim() === ''
            })
            
            console.log('Missing fields:', missingFields)
            
            if (missingFields.length > 0) {
                message.error('لطفاً همه فیلدهای ضروری را پر کنید')
                return
            }

            setLoading(true)
            const submitData = {
                national_id: values.national_id.trim(),
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                phone: values.phone.trim()
                    ? values.phone.trim() 
                    : `0${values.phone.trim()}`,
                address: values.address?.trim() || ''
            }

            console.log('Submitting data:', submitData)

            if (isEdit) {
                await axiosInstance.put(`/api/patients/${id}/`, submitData)
                message.success('اطلاعات بیمار با موفقیت بروزرسانی شد')
            } else {
                await axiosInstance.post('/api/patients/', submitData)
                message.success('بیمار جدید با موفقیت ثبت شد')
            }
            navigate('/patients')
        } catch (error: any) {
            console.error('Error submitting form:', error)
            const errors = error.response?.data
            if (typeof errors === 'object' && errors !== null) {
                Object.keys(errors).forEach(key => {
                    const errorMessages = Array.isArray(errors[key]) ? errors[key] : [errors[key]]
                    form.setFields([{
                        name: key as keyof PatientFormData,
                        errors: errorMessages
                    }])
                })
                message.error('لطفاً خطاهای فرم را بررسی کنید')
            } else {
                message.error(error.response?.data?.detail || 'خطا در ثبت اطلاعات بیمار')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <PatientFormComponent
            form={form}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            loading={loading}
            isEdit={isEdit}
        />
    )
}

export default PatientForm 