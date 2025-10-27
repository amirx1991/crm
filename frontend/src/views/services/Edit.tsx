import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message, Form, Select, Input as AntdInput } from 'antd'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ServiceItem {
    id: number
    title: string
    desc?: string
    status: number
    status_type: string
    created_at: string
    operator?: number | null
}

const SERVICE_STATUS_OPTIONS = [
    { label: 'در حال پیگیری', value: 0 },
    { label: 'اعزام تکنسین', value: 1 },
    { label: 'انجام تعمیرات', value: 2 },
    { label: 'پایان یافته', value: 3 },
]

const ServiceEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [service, setService] = useState<ServiceItem | null>(null)
    const [operators, setOperators] = useState<Array<{ label: string; value: number }>>([])

    useEffect(() => {
        fetchService()
        fetchOperators()
    }, [id])

    const fetchService = async () => {
        try {
            setFetching(true)
            const response = await axiosInstance.get(`/api/services/${id}/`)
            setService(response.data)

            form.setFieldsValue({
                title: response.data.title,
                desc: response.data.desc,
                status: response.data.status,
                operator: response.data.operator ?? undefined,
            })
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت اطلاعات درخواست')
        } finally {
            setFetching(false)
        }
    }

    const fetchOperators = async () => {
        try {
            const res = await axiosInstance.get(`/api/admins/list`, { params: { type: 1 } })
            const list = res.data?.results ?? res.data ?? []
            const opts = list.map((u: any) => ({
                label: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.username,
                value: u.id,
            }))
            setOperators(opts)
        } catch (e) {
            // ignore
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true)
            await axiosInstance.patch(`/api/services/${id}/`, {
                status: values.status,
                operator: values.operator,
            })
            message.success('درخواست با موفقیت به‌روزرسانی شد')
            navigate('/services')
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در به‌روزرسانی درخواست')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <Loading loading={true} />
    }

    if (!service) {
        return null
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="mb-6">
                    <h2 className="text-xl font-bold">ویرایش درخواست</h2>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item label="عنوان" name="title">
                            <Input placeholder="عنوان درخواست" disabled />
                        </Form.Item>

                        <Form.Item label="وضعیت" name="status" rules={[{ required: true, message: 'لطفاً وضعیت را انتخاب کنید' }]}>
                            <Select options={SERVICE_STATUS_OPTIONS} placeholder="انتخاب وضعیت" />
                        </Form.Item>

                        <Form.Item label="توضیحات" name="desc">
                            <AntdInput.TextArea rows={4} placeholder="توضیحات" disabled />
                        </Form.Item>

                        <Form.Item label="انتخاب تکنسین" name="operator">
                            <Select options={operators} showSearch optionFilterProp="label" placeholder="انتخاب تکنسین" allowClear />
                        </Form.Item>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button variant="solid" type="submit" loading={loading}>
                            ثبت تغییرات و ارسال به تکنسین
                        </Button>
                        <Button variant="plain" type="button" onClick={() => navigate('/services')}>
                            انصراف
                        </Button>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    )
}

export default ServiceEdit

