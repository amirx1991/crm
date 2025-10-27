import { useState } from 'react'

interface SignInFormProps {
    onSignIn: (values: { username: string; password: string }) => void
    loading?: boolean
    error?: string | null
}

const SignInForm = ({ onSignIn, loading, error }: SignInFormProps) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [formError, setFormError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        if (!username.trim()) {
            setFormError('لطفاً نام کاربری را وارد کنید')
            return
        }

        if (!password.trim()) {
            setFormError('لطفاً رمز عبور را وارد کنید')
            return
        }

        onSignIn({ username: username.trim(), password })
    }

    const displayError = formError || error

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="form-label" htmlFor="username">نام کاربری</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    className="form-input w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="نام کاربری خود را وارد کنید"
                />
            </div>
            <div className="space-y-2">
                <label className="form-label" htmlFor="password">رمز عبور</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="رمز عبور خود را وارد کنید"
                />
            </div>
            {displayError && (
                <div className="text-red-500 text-sm text-center">
                    {displayError}
                </div>
            )}
            <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
            >
                {loading ? 'در حال ورود...' : 'ورود به سیستم'}
            </button>
        </form>
    )
}

export default SignInForm 