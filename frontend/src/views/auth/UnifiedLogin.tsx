import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message, Tabs } from 'antd'
import { useDispatch } from 'react-redux'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { HiOutlinePhone, HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi2'
import OtpInput from '@/components/ui/OtpInput'
import CountdownTimer from '@/components/ui/CountdownTimer'
import patientAxios from '@/utils/patientAxios'
import axiosInstance from '@/utils/axios'
import { setCredentials } from '@/store/slices/authSlice'
import './UnifiedLogin.css'

const UnifiedLogin = () => {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('customer')
    const [showOTP, setShowOTP] = useState(false)
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [canResend, setCanResend] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const dispatch = useDispatch()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const role = localStorage.getItem('role')
        if (token) {
            if (role === 'patient') {
                navigate('/patient/dashboard')
            } else if (role === 'admin' || role === 'operator') {
                navigate('/')
            }
        }
    }, [navigate])

    // Customer Login with Phone + OTP
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

            const token = response.data.token
            const refresh = response.data.refresh
            const userFromApi = response.data.user || null

            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refresh)
            localStorage.setItem('role', 'patient')
            localStorage.setItem('isAuthenticated', 'true')

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

    // Admin/Operator Login with Username + Password
    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!username.trim()) {
            message.error('لطفاً نام کاربری را وارد کنید')
            return
        }

        if (!password.trim()) {
            message.error('لطفاً رمز عبور را وارد کنید')
            return
        }

        setLoading(true)
        try {
            const response = await axiosInstance.post('/api/token', {
                username: username.trim(),
                password: password
            })

            const token = response.data.access
            const userData = response.data.data

            localStorage.setItem('token', token)
            localStorage.setItem('role', userData.type_user === 0 ? 'admin' : 'operator')
            localStorage.setItem('isAuthenticated', 'true')

            const user = {
                id: userData.user_id || null,
                username: username,
                email: userData.email || '',
                firstName: userData.displayName || '',
                lastName: userData.last_name || '',
                isStaff: true,
                type_user: userData.type_user
            }

            dispatch(setCredentials({ user, token }))
            message.success('ورود موفقیت‌آمیز بود')
            navigate('/')
        } catch (err: any) {
            console.error('Admin Login Error:', err.response?.data)
            message.error(err.response?.data?.detail || 'نام کاربری یا رمز عبور اشتباه است')
        } finally {
            setLoading(false)
        }
    }

    const resetCustomerForm = () => {
        setShowOTP(false)
        setOtp('')
        setCanResend(false)
        form.resetFields()
    }

    const tabItems = [
        {
            key: 'customer',
            label: 'ورود مشتری',
            children: (
                <div className="space-y-6">
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
                                    onClick={resetCustomerForm}
                                >
                                    تغییر شماره تلفن
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'admin',
            label: 'ورود ادمین/اپراتور',
            children: (
                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="form-label" htmlFor="username">نام کاربری</label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            prefix={<HiOutlineUser className="text-xl" />}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            placeholder="نام کاربری خود را وارد کنید"
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="form-label" htmlFor="password">رمز عبور</label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            prefix={<HiOutlineLockClosed className="text-xl" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            placeholder="رمز عبور خود را وارد کنید"
                            className="h-11"
                        />
                    </div>
                    <Button
                        block
                        variant="solid"
                        loading={loading}
                        type="submit"
                    >
                        ورود به سیستم
                    </Button>
                </form>
            )
        }
    ]

    return (
        <div className="h-full flex flex-col justify-center items-center bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-md mx-auto">
                    <Card className="shadow-lg">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">ورود به سیستم</h2>
                            <p className="text-gray-600">نوع ورود خود را انتخاب کنید</p>
                        </div>
                        
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            centered
                            className="unified-login-tabs"
                        />
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default UnifiedLogin
