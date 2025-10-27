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
            const response = await axiosInstance.get(`/api/admins/detail/${id}?type=2`)
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

            await axiosInstance.put(`/api/admins/detail/${id}`, submitData)
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
            await axiosInstance.delete(`/api/admins/detail/${id}`)
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
                    بازگشت به لیست 
                </Button>
                
            </div>

                <AdaptiveCard>
               

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="نام کاربری"
                            name="username"
                            rules={[{ required: true, message: 'لطفاً نام کاربری را وارد کنید' }]}
                        >
                            <Input placeholder="نام کاربری را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="نام"
                            name="first_name"
                            rules={[{ required: true, message: 'لطفاً نام را وارد کنید' }]}
                        >
                            <Input placeholder="نام را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="نام خانوادگی"
                            name="last_name"
                            rules={[{ required: true, message: 'لطفاً نام خانوادگی را وارد کنید' }]}
                        >
                            <Input placeholder="نام خانوادگی را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="شماره تماس"
                            name="phone"
                            rules={[{ required: true, message: 'لطفاً شماره تماس را وارد کنید' }]}
                        >
                            <Input placeholder="شماره تماس را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="رمز عبور"
                            name="password"
                            rules={[{ required: true, message: 'لطفاً رمز عبور را وارد کنید' }]}
                        >
                            <Input type="password" placeholder="رمز عبور را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="تکرار رمز عبور"
                            name="confirm_password"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'لطفاً رمز عبور را تکرار کنید' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('رمز عبور مطابقت ندارد'))
                                    },
                                }),
                            ]}
                        >
                            <Input type="password" placeholder="رمز عبور را تکرار کنید" />
                        </Form.Item>
                    </div>
                    <div>
                         <Form.Item
                            label="آدرس"
                            name="address"
                           
                        >
                            <Input type="text" placeholder="آدرس را وارد کنید" />
                        </Form.Item>

                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button variant="solid" type="submit" loading={loading}>
                            ثبت
                        </Button>
                        <Button
                            variant="plain"
                            type="button"
                            onClick={() => navigate('/admins')}
                        >
                            انصراف
                        </Button>
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