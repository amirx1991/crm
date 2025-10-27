import { useState, useEffect } from 'react'
import { Card, Row, Col, message } from 'antd'
import { HiUsers, HiClipboardList, HiDocumentText, HiChartBar } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Loading from '@/components/shared/Loading'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

interface DashboardStats {
    active_studies_count: number
    total_patients_count: number
    forms_count: number
    submissions_count: number
    studies_by_status: {
        status: string
        count: number
    }[]
    recent_submissions: {
        id: number
        patient_name: string
        study_name: string
        form_name: string
        admin_name: string
        created_at: string
    }[]
}

const StudyDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats | null>(null)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/studies/dashboard/')
            console.log('Dashboard Response:', response.data)
            setStats(response.data)
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error)
            message.error(error.response?.data?.error || 'خطا در دریافت اطلاعات داشبورد')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-600'
            case 'in_progress':
                return 'bg-blue-100 text-blue-600'
            case 'completed':
                return 'bg-green-100 text-green-600'
            default:
                return 'bg-gray-100 text-gray-600'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'در انتظار'
            case 'in_progress':
                return 'در حال انجام'
            case 'completed':
                return 'تکمیل شده'
            default:
                return status
        }
    }

    if (loading) {
        return <Loading loading={true} />
    }

    if (!stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">اطلاعات داشبورد در دسترس نیست</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* آمار کلی */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <AdaptiveCard>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-100">
                                <HiChartBar className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">مطالعات فعال</div>
                                <div className="text-xl font-semibold">{stats.active_studies_count}</div>
                            </div>
                        </div>
                    </AdaptiveCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <AdaptiveCard>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-100">
                                <HiUsers className="text-2xl text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">تعداد کل بیماران</div>
                                <div className="text-xl font-semibold">{stats.total_patients_count}</div>
                            </div>
                        </div>
                    </AdaptiveCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <AdaptiveCard>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-100">
                                <HiClipboardList className="text-2xl text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">تعداد فرم‌ها</div>
                                <div className="text-xl font-semibold">{stats.forms_count}</div>
                            </div>
                        </div>
                    </AdaptiveCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <AdaptiveCard>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-orange-100">
                                <HiDocumentText className="text-2xl text-orange-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">فرم‌های تکمیل شده</div>
                                <div className="text-xl font-semibold">{stats.submissions_count}</div>
                            </div>
                        </div>
                    </AdaptiveCard>
                </Col>
            </Row>

            {/* وضعیت مطالعات و فرم‌های اخیر */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <AdaptiveCard>
                        <h4 className="mb-4 text-lg">وضعیت مطالعات</h4>
                        <div className="space-y-4">
                            {stats.studies_by_status.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                                        <span>{getStatusText(item.status)}</span>
                                    </div>
                                    <div className="font-semibold">{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </AdaptiveCard>
                </Col>
                <Col xs={24} lg={12}>
                    <AdaptiveCard>
                        <h4 className="mb-4 text-lg">فرم‌های اخیر</h4>
                        <div className="space-y-4">
                            {stats.recent_submissions.map((submission) => (
                                <div key={submission.id} className="p-3 border rounded-lg">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{submission.patient_name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {submission.study_name} - {submission.form_name}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(submission.created_at).toLocaleDateString('fa-IR')}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            تکمیل شده توسط: {submission.admin_name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdaptiveCard>
                </Col>
            </Row>
        </div>
    )
}

export default StudyDashboard 