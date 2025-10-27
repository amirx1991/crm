import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Form } from 'antd'
import { TbArrowLeft } from 'react-icons/tb'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const AdminCreate = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true)
            await axiosInstance.post('/api/admins/create/', {
                ...values,
                type_user: 2
            })
            message.success('مشتری با موفقیت ایجاد شد')
            navigate('/users')
        } catch (error: any) {
            message.error(error.response?.data?.error || 'خطا در ایجاد مشتری')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<TbArrowLeft className="text-lg" />}
                    onClick={() => navigate('/admins')}
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
        </Container>
    )
}

export default AdminCreate 