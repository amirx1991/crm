import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { HiOutlineUser, HiOutlinePhone, HiOutlineCog } from 'react-icons/hi'

const LandingPage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is already logged in
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        سیستم مدیریت خدمات
                    </h1>
                    <p className="text-xl text-gray-600">
                        به سیستم مدیریت خدمات خوش آمدید
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer Login */}
                    <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlinePhone className="text-2xl text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                ورود مشتری
                            </h3>
                            <p className="text-gray-600">
                                با شماره تلفن همراه و کد تایید وارد شوید
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="lg"
                            onClick={() => navigate('/login')}
                            className="w-full"
                        >
                            ورود به عنوان مشتری
                        </Button>
                    </Card>

                    {/* Admin/Operator Login */}
                    <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineCog className="text-2xl text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                ورود ادمین/اپراتور
                            </h3>
                            <p className="text-gray-600">
                                با نام کاربری و رمز عبور وارد شوید
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="lg"
                            onClick={() => navigate('/login')}
                            className="w-full"
                        >
                            ورود به پنل مدیریت
                        </Button>
                    </Card>
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-500">
                        برای ورود به سیستم، نوع کاربری خود را انتخاب کنید
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LandingPage


