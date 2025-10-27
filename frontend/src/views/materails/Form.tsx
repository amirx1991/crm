import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { message, Form, InputNumber } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Material {
    id: number
    title: string
    count?: number
    price?: number
    created_at: string
    updated_at: string
}

const MaterialForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(!!id)
    const [material, setMaterial] = useState<Material | null>(null)

    const isEdit = !!id

    useEffect(() => {
        if (isEdit) {
            fetchMaterial()
        }
    }, [id])

    const fetchMaterial = async () => {
        try {
            setFetching(true)
            const response = await axiosInstance.get(`/api/materails/${id}/`)
            setMaterial(response.data)
            form.setFieldsValue({
                title: response.data.title,
                count: response.data.count,
                price: response.data.price,
            })
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت اطلاعات متریال')
            navigate('/materails')
        } finally {
            setFetching(false)
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true)
            if (isEdit) {
                await axiosInstance.patch(`/api/materails/${id}/`, values)
                message.success('متریال با موفقیت به‌روزرسانی شد')
            } else {
                await axiosInstance.post('/api/materails/', values)
                message.success('متریال با موفقیت ایجاد شد')
            }
            navigate('/materails')
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در ذخیره متریال')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <Loading loading={true} />
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/materails')}
                >
                    بازگشت به لیست
                </Button>
            </div>

            <AdaptiveCard>
                <div className="mb-6">
                    <h2 className="text-xl font-bold">
                        {isEdit ? 'ویرایش متریال' : 'افزودن متریال جدید'}
                    </h2>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="max-w-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label="عنوان متریال"
                            name="title"
                            rules={[{ required: true, message: 'لطفاً عنوان متریال را وارد کنید' }]}
                        >
                            <Input placeholder="عنوان متریال را وارد کنید" />
                        </Form.Item>

                        <Form.Item
                            label="تعداد"
                            name="count"
                            rules={[{ required: false }]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="تعداد موجود"
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            label="قیمت (تومان)"
                            name="price"
                            rules={[{ required: false }]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="قیمت واحد"
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button variant="solid" type="submit" loading={loading}>
                            {isEdit ? 'ذخیره تغییرات' : 'ایجاد متریال'}
                        </Button>
                        <Button
                            variant="plain"
                            type="button"
                            onClick={() => navigate('/materails')}
                        >
                            انصراف
                        </Button>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    )
}

export default MaterialForm


