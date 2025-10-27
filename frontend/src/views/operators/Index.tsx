import { useEffect, useMemo, useState } from 'react'
import { Form, Modal, Select, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import axiosInstance from '@/utils/axios'
import useAuth from '@/auth/useAuth'

type ServiceRow = {
    id: number
    title: string
    desc?: string
    status_type: string
    created_at: string
    invoice?: { id: number } | null
}

const OperatorIndex = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [services, setServices] = useState<ServiceRow[]>([])
    const [loading, setLoading] = useState(false)

    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
    const [currentService, setCurrentService] = useState<ServiceRow | null>(null)
    const [materials, setMaterials] = useState<Array<{ label: string; value: number }>>([])
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([])

    const columns = useMemo(() => {
        return [
            { header: 'عنوان', accessorKey: 'title' },
            {
                header: 'توضیحات',
                accessorKey: 'desc',
                cell: (props: any) => {
                    const v = props.getValue() as string
                    if (!v) return '—'
                    return v.length > 80 ? v.slice(0, 80) + '…' : v
                },
            },
            { header: 'وضعیت', accessorKey: 'status_type' },
            { header: 'تاریخ ایجاد', accessorKey: 'created_at' },
            {
                header: 'عملیات',
                id: 'actions',
                cell: (props: any) => (
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="sm"
                            variant="plain"
                            onClick={() => navigate(`/operators/services/${props.row.original.id}`)}
                        >
                            مشاهده جزئیات
                        </Button>
                       
                    </div>
                ),
            },
        ]
    }, [navigate])

    useEffect(() => {
        fetchMaterials()
        // For now, we'll fetch all services and filter on the backend
        // The backend should filter by the authenticated user's operator role
        fetchServices()
    }, [])

    const fetchMaterials = async () => {
        try {
            const res = await axiosInstance.get('/api/materails/')
            const list = res.data?.results ?? res.data ?? []
            setMaterials(list.map((m: any) => ({ label: m.title, value: m.id })))
        } catch (e) {
            // ignore
        }
    }

    const fetchServices = async () => {
        try {
            setLoading(true)
            // Use the 'me' endpoint to get services assigned to the current user
            const res = await axiosInstance.get('/api/services/services_assigned_to_operator/')
            const results = res.data || []
            setServices(results)
        } catch (e: any) {
            message.error('خطا در دریافت لیست خدمات تخصیص یافته')
        } finally {
            setLoading(false)
        }
    }

    const openInvoiceModal = (row: ServiceRow) => {
        setCurrentService(row)
        setSelectedMaterialIds([])
        setInvoiceModalOpen(true)
    }

    const handleSubmitInvoice = async () => {
        if (!currentService) return
        try {
            setLoading(true)
            // Create or update invoice
            const invoiceResp = currentService.invoice
                ? await axiosInstance.patch(`/api/invoices/${currentService.invoice.id}/`, { material_ids: selectedMaterialIds })
                : await axiosInstance.post(`/api/invoices/`, { material_ids: selectedMaterialIds })

            const invoiceId = invoiceResp.data.id
            // Link invoice to service
            await axiosInstance.patch(`/api/services/${currentService.id}/`, { invoice_id: invoiceId })

            message.success('فاکتور با موفقیت ثبت شد')
            setInvoiceModalOpen(false)
            fetchServices()
        } catch (e: any) {
            message.error(e?.response?.data?.detail || 'خطا در ثبت فاکتور')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">خدمات تخصیص یافته به شما</h2>
                        <p className="text-gray-600">لیست درخواست‌های خدماتی که به شما تخصیص داده شده است</p>
                    </div>

                    <DataTable
                        data={services}
                        columns={columns as any}
                        loading={loading}
                        noData={!loading && services.length === 0}
                    />
                </div>
            </AdaptiveCard>

            <Modal
                title={currentService?.invoice ? 'ویرایش فاکتور' : 'ثبت فاکتور'}
                open={invoiceModalOpen}
                onOk={handleSubmitInvoice}
                onCancel={() => setInvoiceModalOpen(false)}
                confirmLoading={loading}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Form layout="vertical">
                    <Form.Item label="اقلام مصرفی">
                        <Select
                            mode="multiple"
                            options={materials}
                            value={selectedMaterialIds}
                            onChange={(v) => setSelectedMaterialIds(v)}
                            placeholder="انتخاب اقلام مصرفی"
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Container>
    )
}

export default OperatorIndex



