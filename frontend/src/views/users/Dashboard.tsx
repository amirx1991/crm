import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, message } from 'antd'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import patientAxios from '@/utils/patientAxios'
import axios, { Axios } from 'axios'

interface Patient {
    id: number
    first_name: string
    last_name: string
    national_code: string
    phone: string
    studies: Array<{
        id: number
        name: string
        status: string
        created_at: string
    }>
}

const PatientDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [patient, setPatient] = useState<Patient | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchPatientData()
    }, [])

    const fetchPatientData = async () => {
        try {
            setLoading(true)
            console.log("wwwwwww", localStorage.getItem('token'))
            const token = localStorage.getItem('token')
            const response = await patientAxios.get('/users/profile/',{
              
            })
            console.log(response.data)

            setPatient(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات')
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

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/patient/login')
    }

    if (loading) {
        return <Loading loading={true} />
    }

    if (!patient) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>اطلاعاتی یافت نشد</p>
            </div>
        )
    }

    return (
            <div className="grid grid-cols-12 gap-4">
                {/* اطلاعات بیمار */}
                <div className="col-span-12 lg:col-span-4">
                    <AdaptiveCard>
                        <div className="flex justify-between items-center mb-6">
                            <h4>اطلاعات شما</h4>
                            <Button
                                variant="plain"
                                onClick={handleLogout}
                            >
                                خروج
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-500">نام و نام خانوادگی:</p>
                                <h6 className="mt-1">{patient.first_name} {patient.last_name}</h6>
                            </div>
                           
                            <div>
                                <p className="text-gray-500">شماره تماس:</p>
                                <h6 className="mt-1">{patient.phone}</h6>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                {/* لیست مطالعات */}
                <div className="col-span-12 lg:col-span-8">
                    <AdaptiveCard>
                        <h4 className="mb-6">مطالعات شما</h4>
                    </AdaptiveCard>
                </div>
            </div>
    )
}

export default PatientDashboard 