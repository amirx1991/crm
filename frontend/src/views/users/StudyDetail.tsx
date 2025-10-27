import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, message } from 'antd'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import patientAxios from '@/utils/patientAxios'

interface StudyState {
    id: number
    name: string
    order: number
    form: {
        id: number
        name: string
    } | null
}

interface StudyDetail {
    id: number
    name: string
    description: string
    status: string
    created_at: string
    current_state: StudyState | null
    states: StudyState[]
}

const PatientStudyDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [study, setStudy] = useState<StudyDetail | null>(null)

    useEffect(() => {
        fetchStudyDetail()
    }, [id])

    const fetchStudyDetail = async () => {
        try {
            setLoading(true)
            const response = await patientAxios.get(`/api/patient/studies/${id}/`)
            setStudy(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات مطالعه')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'in_progress':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
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

    if (!study) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>مطالعه یافت نشد</p>
            </div>
        )
    }

    return (
        <Container>
            <div className="grid grid-cols-12 gap-4">
                {/* اطلاعات مطالعه */}
                <div className="col-span-12 lg:col-span-4">
                    <AdaptiveCard>
                        <div className="flex justify-between items-center mb-6">
                            <h4>اطلاعات مطالعه</h4>
                            <Button
                                variant="plain"
                                onClick={() => navigate('/patient/dashboard')}
                            >
                                بازگشت به داشبورد
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-500">نام مطالعه:</p>
                                <h6 className="mt-1">{study.name}</h6>
                            </div>
                            <div>
                                <p className="text-gray-500">توضیحات:</p>
                                <p className="mt-1">{study.description || 'بدون توضیحات'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">وضعیت:</p>
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(study.status)}`}>
                                    {getStatusText(study.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-500">تاریخ شروع:</p>
                                <p className="mt-1">{new Date(study.created_at).toLocaleDateString('fa-IR')}</p>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                {/* لیست مراحل */}
                <div className="col-span-12 lg:col-span-8">
                    <AdaptiveCard>
                        <h4 className="mb-6">مراحل مطالعه</h4>
                        <div className="space-y-4">
                            {study.states.map(state => (
                                <Card key={state.id} className="shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h6 className="mb-2">{state.name}</h6>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-500">
                                                    مرحله {state.order}
                                                </span>
                                                {state.form && (
                                                    <span className="text-blue-600">
                                                        دارای فرم
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {state.form && (
                                            <Button
                                                variant="solid"
                                                onClick={() => navigate(`/patient/studies/${study.id}/forms/${state.form.id}`)}
                                                disabled={study.current_state?.id !== state.id}
                                            >
                                                {study.current_state?.id === state.id ? 'تکمیل فرم' : 'مشاهده فرم'}
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </AdaptiveCard>
                </div>
            </div>
        </Container>
    )
}

export default PatientStudyDetail 