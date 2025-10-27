import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message } from 'antd'
import { HiOutlineArrowLeft, HiOutlinePencil } from 'react-icons/hi'
import dayjs from 'dayjs'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'

interface StudyState {
    id: number
    name: string
    order: number
    form?: {
        id: number
        name: string
    } | null
}

interface Study {
    id: number
    name: string
    description: string
    created_at: string
    states: StudyState[]
}

const StudyDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [study, setStudy] = useState<Study | null>(null)

    const fetchStudy = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/api/studies/${id}/`)
            setStudy(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات مطالعه')
            console.error('Error fetching study:', error)
            navigate('/studies')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudy()
    }, [id])

    if (loading) {
        return <Loading loading={true} />
    }

    if (!study) {
        return null
    }

    return (
        <Container>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/studies')}
                    >
                        بازگشت به لیست
                    </Button>
                    <h3>{study.name}</h3>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlinePencil />}
                    onClick={() => navigate(`/studies/${id}/edit`)}
                >
                    ویرایش مطالعه
                </Button>
            </div>

            <div className="grid gap-4">
                <AdaptiveCard>
                    <div className="grid gap-4">
                        <div>
                            <h4 className="mb-2">توضیحات</h4>
                            <p className="text-gray-600">{study.description || '-'}</p>
                        </div>
                        <div>
                            <h4 className="mb-2">تاریخ ایجاد</h4>
                            <p className="text-gray-600">
                                {dayjs(study.created_at).format('YYYY/MM/DD')}
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <h4 className="mb-4">مراحل مطالعه</h4>
                    <div className="space-y-4">
                        {study.states.map((state) => (
                            <div
                                key={state.id}
                                className="p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-medium">{state.name}</h5>
                                        {state.form && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                فرم مرحله: {state.form.name}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        شماره {state.order + 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default StudyDetail 