import { useEffect, useState } from 'react'
import { Form, message, Modal } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '@/utils/axios'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi'

interface PatientFormData {
    national_id: string
    first_name: string
    last_name: string
    phone: string
    address?: string
}

const PatientEdit = () => {
    const [form] = Form.useForm<PatientFormData>()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [patient, setPatient] = useState<PatientFormData | null>(null)

    const fetchPatient = async () => {

        if (!id) return

        try {

            setLoading(true)
            const response = await axiosInstance.get(`/api/patients/${id}/`)
            const patientData = response.data.data || response.data
            console.log('Fetched patient data:', patientData)
            setPatient(patientData)
            
            // تنظیم مقادیر اولیه فرم
            form.setFieldsValue(patientData)
        } catch (error: any) {
            console.error('Error fetching patient:', error)
            message.error(error.response?.data?.detail || 'خطا در دریافت اطلاعات بیمار')
        } finally {
            setLoading(false)
        }
    }

    // اجرای fetchPatient در زمان mount و تغییر id
    useEffect(() => {

        fetchPatient()
    }, [id])

    const handleSubmit = async (values: PatientFormData) => {
        try {
            console.log('Form submitted with values:', values)
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

            await axiosInstance.put(`/api/patients/${id}/`, submitData)
            message.success('اطلاعات بیمار با موفقیت بروزرسانی شد')
            navigate('/patients')
        } catch (error: any) {
            console.error('Error updating patient:', error)
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
                message.error(error.response?.data?.detail || 'خطا در بروزرسانی اطلاعات بیمار')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setLoading(true)
            await axiosInstance.delete(`/api/patients/${id}/`)
            message.success('بیمار با موفقیت حذف شد')
            navigate('/patients')
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در حذف بیمار')
        } finally {
            setLoading(false)
            setDeleteModalVisible(false)
        }
    }

    if (!patient) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="text-center">در حال بارگذاری...</div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <div className="mb-4 flex justify-between items-center">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate('/patients')}
                >
                    بازگشت به لیست بیماران
                </Button>
                <Button
                    variant="solid"
                    color="red"
                    size="sm"
                    icon={<HiOutlineTrash />}
                    type="button"
                    onClick={() => setDeleteModalVisible(true)}
                >
                    حذف بیمار
                </Button>
            </div>
            <AdaptiveCard>
                <div className="mb-4">
                    <h3>ویرایش بیمار</h3>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={patient}
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
                                بروزرسانی
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

            <Modal
                title="حذف بیمار"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okText="حذف"
                cancelText="انصراف"
                okButtonProps={{ color: 'red' }}
                confirmLoading={loading}
            >
                <p>آیا از حذف بیمار {patient.first_name} {patient.last_name} اطمینان دارید؟</p>
            </Modal>
        </Container>
    )
}

export default PatientEdit 