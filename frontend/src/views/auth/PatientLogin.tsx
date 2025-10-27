import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
import { useDispatch } from 'react-redux'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { HiOutlinePhone } from 'react-icons/hi'
import OtpInput from '@/components/ui/OtpInput'
import CountdownTimer from '@/components/ui/CountdownTimer'
import patientAxios from '@/utils/patientAxios'
import { setCredentials } from '@/store/slices/authSlice' // مسیر را طبق پروژه تنظیم کنید

const PatientLogin = () => {
    const [loading, setLoading] = useState(false)
    const [showOTP, setShowOTP] = useState(false)
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [canResend, setCanResend] = useState(false)
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const dispatch = useDispatch()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const role = localStorage.getItem('role')
        if (token && role === 'patient') {
            navigate('/patient/dashboard')
        }
    }, [navigate])

    const handleSendOTP = async (values: { phone: string }) => {
        setLoading(true)
        try {
            const formattedPhone = values.phone.startsWith('0') ? values.phone : `${values.phone}`
            await patientAxios.post('/patient/send-otp/', { phone: formattedPhone })
            setPhone(formattedPhone)
            setShowOTP(true)
            setCanResend(false)
            message.success('کد تایید برای شما ارسال شد')
        } catch (err: any) {
            message.error(err.response?.data?.message || 'خطا در ارسال کد تایید')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (otp.length !== 5) {
            return
        }

        setLoading(true)
        try {
            const response = await patientAxios.post('/patient/verify-otp/', {
                phone: phone,
                otp: otp.toString()
            })

            // فرض: پاسخ شامل { token, refresh, user? } است.
            const token = response.data.token
            const refresh = response.data.refresh
            const userFromApi = response.data.user || null

            // ذخیره در localStorage (برای قابلیت persist)
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refresh)
            localStorage.setItem('role', 'patient')
            localStorage.setItem('isAuthenticated', 'true')

            // ساخت شی user امن (اگر API فیلد user نداد، حداقل id را از response می‌گیریم یا null می‌گذاریم)
            const user = userFromApi
                ? {
                      id: userFromApi.id ?? null,
                      username: userFromApi.username ?? '',
                      email: userFromApi.email ?? '',
                      firstName: userFromApi.first_name ?? userFromApi.firstName ?? '',
                      lastName: userFromApi.last_name ?? userFromApi.lastName ?? '',
                      isStaff: false,
                  }
                : { id: null, username: phone, email: '', firstName: '', lastName: '', isStaff: false }

            // بروزرسانی ری‌داکس
            dispatch(setCredentials({ user, token }))

            message.success('ورود موفقیت‌آمیز بود')
            navigate('/patient/dashboard')
        } catch (err: any) {
            console.error('OTP Error:', err.response?.data)
            message.error(err.response?.data?.message || 'کد تایید نامعتبر است')
            setOtp('')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (!canResend) return

        setLoading(true)
        try {
            await patientAxios.post('/patient/send-otp/', { phone })
            setCanResend(false)
            message.success('کد تایید مجدداً ارسال شد')
        } catch (err: any) {
            message.error(err.response?.data?.message || 'خطا در ارسال مجدد کد تایید')
        } finally {
            setLoading(false)
        }
    }

    const handleTimerComplete = () => {
        setCanResend(true)
    }

    return (
        <div className="h-full flex flex-col justify-center items-center">
            <div className="container mx-auto">
                <div className="max-w-md mx-auto">
                    <Card className="mb-4">
                        <div className="text-center mb-6">
                            <h3 className="mb-1">ورود به سیستم</h3>
                            <p>لطفاً شماره تلفن همراه خود را وارد کنید</p>
                        </div>
                        {!showOTP ? (
                            <Form form={form} layout="vertical" onFinish={handleSendOTP}>
                                <Form.Item
                                    name="phone"
                                    rules={[
                                        { required: true, message: 'شماره تلفن را وارد کنید' },
                                        { pattern: /^(0|98|\+98)?9\d{9}$/, message: 'شماره تلفن معتبر نیست' }
                                    ]}
                                >
                                    <Input 
                                        prefix={<HiOutlinePhone className="text-xl" />}
                                        placeholder="شماره تلفن همراه"
                                        className="h-11"
                                    />
                                </Form.Item>
                                <Button
                                    block
                                    variant="solid"
                                    loading={loading}
                                    type="submit"
                                >
                                    دریافت کد تایید
                                </Button>
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="plain"
                                        onClick={() => navigate('/sign-in')}
                                    >
                                        ورود به پنل مدیریت
                                    </Button>
                                </div>
                            </Form>
                        ) : (
                            <div className="space-y-6">
                                <div className="mb-4 text-center">
                                    <p className="text-gray-600 mb-4">کد تایید به شماره {phone} ارسال شد</p>
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                        onComplete={handleVerifyOTP}
                                    />
                                    {!canResend && (
                                        <CountdownTimer
                                            initialSeconds={120}
                                            onComplete={handleTimerComplete}
                                        />
                                    )}
                                </div>
                                <Button
                                    block
                                    variant="solid"
                                    loading={loading}
                                    onClick={handleVerifyOTP}
                                    className="mb-2"
                                >
                                    ورود
                                </Button>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        block
                                        variant="plain"
                                        onClick={handleResendOTP}
                                        disabled={!canResend}
                                    >
                                        ارسال مجدد کد
                                    </Button>
                                    <Button
                                        block
                                        variant="plain"
                                        onClick={() => {
                                            setShowOTP(false)
                                            setOtp('')
                                            setCanResend(false)
                                            form.resetFields()
                                        }}
                                    >
                                        تغییر شماره تلفن
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default PatientLogin
