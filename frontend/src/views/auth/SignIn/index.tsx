import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/hooks/useAuth'
import SignInForm from './SignInForm'

const SignIn = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, error, loading } = useAuth()

    const handleSignIn = async (values: { username: string; password: string }) => {
        console.log('Attempting login with:', values);
        const result = await login({
            username: values.username,
            password: values.password
        })
        console.log('Login result:', result);
        
        if (result?.success) {
            // Get the redirect URL from the location state or default to /forms
            const redirectUrl = location.state?.redirectUrl || '/forms';
            navigate(redirectUrl, { replace: true });
        }
    }

    return (
        <div className="h-full flex flex-col justify-center items-center">
            <div className="card p-8 max-w-[400px] w-full">
                <div className="mb-8 text-center">
                    <h3 className="mb-1 text-2xl font-bold">خوش آمدید!</h3>
                    <p className="text-gray-600">لطفاً برای ورود به سیستم، اطلاعات خود را وارد کنید</p>
                </div>
                <SignInForm 
                    onSignIn={handleSignIn}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    )
}

export default SignIn 