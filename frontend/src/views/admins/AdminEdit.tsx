import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message, Form } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Admin {
    id: number
    username: string
    first_name: string
    last_name: string
    phone: string
    type_user: number
    created: string
}

const AdminEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [admin, setAdmin] = useState<Admin | null>(null)

    useEffect(() => {
        fetchAdmin()
    }, [id])

    const fetchAdmin = async () => {
        try {
            setFetching(true)
            const response = await axiosInstance.get(`/api/admins/detail/${id}`)
            setAdmin(response.data)
            form.setFieldsValue({
                username: response.data.username,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                phone: response.data.phone,
            })
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات ادمین')
            navigate('/admins')
        } finally {
            setFetching(false)
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true)
            await axiosInstance.patch(`/api/admins/detail/${id}`, {
                ...values,
                type_user: 0
            })
            message.success('اطلاعات ادمین با موفقیت به‌روزرسانی شد')
            navigate('/admins')
        } catch (error: any) {
            message.error(error.response?.data?.error || 'خطا در به‌روزرسانی اطلاعات ادمین')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <Loading loading={true} />
    }

    if (!admin) {
        return null
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/admins')}
                >
                    بازگشت به لیست
                </Button>
            </div>

            <AdaptiveCard>
                <div className="mb-6">
                    <h2 className="text-xl font-bold">ویرایش ادمین</h2>
                </div>

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
                            label="رمز عبور جدید"
                            name="password"
                            rules={[{ required: false }]}
                        >
                            <Input type="password" placeholder="رمز عبور جدید را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="تکرار رمز عبور جدید"
                            name="confirm_password"
                            dependencies={['password']}
                            rules={[
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
                            <Input type="password" placeholder="رمز عبور جدید را تکرار کنید" />
                        </Form.Item>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button variant="solid" type="submit" loading={loading}>
                            ذخیره تغییرات
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

export default AdminEdit 