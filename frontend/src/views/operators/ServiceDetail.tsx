import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Modal, Select, message, Input as AntdInput } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import axiosInstance from '@/utils/axios'
import useAuth from '@/auth/useAuth'

interface ServiceDetail {
    id: number
    title: string
    desc?: string
    status: number
    status_type: string
    created_at: string
    updated_at: string
    user: {
        id: number
        first_name: string
        last_name: string
        phone: string
    }
    operator?: {
        id: number
        first_name: string
        last_name: string
    }
    invoice?: {
        id: number
        material: Array<{
            id: number
            title: string
            count?: number
            price?: number
        }>
        payment_status?: string
        total_amount?: number
    }
}

const SERVICE_STATUS_OPTIONS = [
    { label: 'در حال پیگیری', value: 0 },
    { label: 'اعزام تکنسین', value: 1 },
    { label: 'انجام تعمیرات', value: 2 },
    { label: 'پایان یافته', value: 3 },
]

const OperatorServiceDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [form] = Form.useForm()
    
    const [service, setService] = useState<ServiceDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
    const [materials, setMaterials] = useState<Array<{ label: string; value: number }>>([])
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([])

    useEffect(() => {
        if (id) {
            fetchService()
            fetchMaterials()
        }
    }, [id])

    const fetchService = async () => {
        try {
            setFetching(true)
            const response = await axiosInstance.get(`/api/services/${id}/`)
            setService(response.data)
            form.setFieldsValue({
                status: response.data.status,
                desc: response.data.desc,
            })
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت اطلاعات سرویس')
            navigate('/operators')
        } finally {
            setFetching(false)
        }
    }

    const fetchMaterials = async () => {
        try {
            const res = await axiosInstance.get('/api/materails/')
            const list = res.data?.results ?? res.data ?? []
            setMaterials(list.map((m: any) => ({ label: m.title, value: m.id })))
        } catch (e) {
            // ignore
        }
    }

    const handleUpdateService = async (values: any) => {
        try {
            setLoading(true)
            await axiosInstance.patch(`/api/services/${id}/`, {
                status: values.status,
                desc: values.desc,
            })
            message.success('اطلاعات سرویس با موفقیت به‌روزرسانی شد')
            fetchService()
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در به‌روزرسانی سرویس')
        } finally {
            setLoading(false)
        }
    }

    const openInvoiceModal = () => {
        if (service?.invoice) {
            setSelectedMaterialIds(service.invoice.material.map(m => m.id))
        } else {
            setSelectedMaterialIds([])
        }
        setInvoiceModalOpen(true)
    }

    const handleSubmitInvoice = async () => {
        if (!service) return
        try {
            setLoading(true)
            // Create or update invoice
            const invoiceResp = service.invoice
                ? await axiosInstance.patch(`/api/invoices/${service.invoice.id}/`, { material_ids: selectedMaterialIds })
                : await axiosInstance.post(`/api/invoices/`, { material_ids: selectedMaterialIds })

            const invoiceId = invoiceResp.data.id
            // Link invoice to service
            await axiosInstance.patch(`/api/services/${service.id}/`, { invoice_id: invoiceId })

            message.success('فاکتور با موفقیت ثبت شد')
            setInvoiceModalOpen(false)
            fetchService()
        } catch (e: any) {
            message.error(e?.response?.data?.detail || 'خطا در ثبت فاکتور')
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
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/operators')}
                >
                    بازگشت به لیست
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Information */}
                <AdaptiveCard>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">اطلاعات سرویس</h2>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleUpdateService}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">عنوان سرویس</label>
                                <Input value={service.title} disabled />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">مشتری</label>
                                <Input 
                                    value={`${service.user.first_name} ${service.user.last_name}`} 
                                    disabled 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">شماره تماس مشتری</label>
                                <Input value={service.user.phone} disabled />
                            </div>

                            <Form.Item label="وضعیت" name="status" rules={[{ required: true, message: 'لطفاً وضعیت را انتخاب کنید' }]}>
                                <Select options={SERVICE_STATUS_OPTIONS} placeholder="انتخاب وضعیت" />
                            </Form.Item>

                            <Form.Item label="شرح خدمت انجام شده" name="desc">
                                <AntdInput.TextArea 
                                    rows={6} 
                                    placeholder="شرح کامل خدمت انجام شده، مشکلات شناسایی شده، اقدامات انجام شده و نتیجه کار را بنویسید..." 
                                />
                            </Form.Item>

                            <div className="flex gap-2">
                                <Button variant="solid" type="submit" loading={loading}>
                                    ذخیره تغییرات
                                </Button>
                            </div>
                        </div>
                    </Form>
                </AdaptiveCard>

                {/* Invoice Information */}
                <AdaptiveCard>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">فاکتور و تجهیزات</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">وضعیت فاکتور</label>
                            <Input 
                                value={service.invoice ? 'ثبت شده' : 'ثبت نشده'} 
                                disabled 
                            />
                        </div>

                        {service.invoice && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">وضعیت پرداخت</label>
                                    <div className={`p-2 rounded text-center font-medium ${
                                        service.invoice.payment_status === 'paid' 
                                            ? 'bg-green-100 text-green-800' 
                                            : service.invoice.payment_status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {service.invoice.payment_status === 'paid' ? 'پرداخت شده' : 
                                         service.invoice.payment_status === 'pending' ? 'در انتظار پرداخت' : 'پرداخت نشده'}
                                    </div>
                                </div>

                                {service.invoice.total_amount && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">مبلغ کل فاکتور</label>
                                        <Input value={`${service.invoice.total_amount.toLocaleString()} تومان`} disabled />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">تجهیزات و قطعات استفاده شده</label>
                                    <div className="space-y-2">
                                        {service.invoice.material.map((material) => (
                                            <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                                <div className="flex-1">
                                                    <span className="font-medium">{material.title}</span>
                                                    {material.count && (
                                                        <span className="text-sm text-gray-600 mr-2">تعداد: {material.count}</span>
                                                    )}
                                                </div>
                                                {material.price && (
                                                    <span className="text-sm font-medium text-green-600">
                                                        {material.price.toLocaleString()} تومان
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <Button 
                            variant="solid" 
                            onClick={openInvoiceModal}
                            className="w-full"
                        >
                            {service.invoice ? 'ویرایش فاکتور' : 'ثبت فاکتور'}
                        </Button>
                    </div>
                </AdaptiveCard>
            </div>

            {/* Invoice Modal */}
            <Modal
                title={service.invoice ? 'ویرایش فاکتور' : 'ثبت فاکتور'}
                open={invoiceModalOpen}
                onOk={handleSubmitInvoice}
                onCancel={() => setInvoiceModalOpen(false)}
                confirmLoading={loading}
                okText="ثبت فاکتور"
                cancelText="انصراف"
                width={700}
            >
                <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                        <strong>راهنما:</strong> تجهیزات و قطعاتی که در انجام این خدمت استفاده کرده‌اید را انتخاب کنید. 
                        این فاکتور برای مشتری صادر خواهد شد.
                    </p>
                </div>
                <Form layout="vertical">
                    <Form.Item 
                        label="تجهیزات و قطعات مصرفی" 
                        rules={[{ required: true, message: 'لطفاً حداقل یک مورد را انتخاب کنید' }]}
                    >
                        <Select
                            mode="multiple"
                            options={materials}
                            value={selectedMaterialIds}
                            onChange={(v) => setSelectedMaterialIds(v)}
                            placeholder="انتخاب تجهیزات و قطعات استفاده شده"
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                    
                    {selectedMaterialIds.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600 mb-2">موارد انتخاب شده:</p>
                            <div className="space-y-1">
                                {selectedMaterialIds.map(id => {
                                    const material = materials.find(m => m.value === id)
                                    return material ? (
                                        <div key={id} className="text-sm">• {material.label}</div>
                                    ) : null
                                })}
                            </div>
                        </div>
                    )}
                </Form>
            </Modal>
        </Container>
    )
}

export default OperatorServiceDetail
