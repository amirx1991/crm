// frontend/src/views/auth/PatientLogin.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import axiosInstance from '@/utils/axios'

const PatientLogin = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleLogin = async (values: { phone: string }) => {
    setLoading(true)
    try {
      // فرض: API شما endpoint ورود با شماره تلفن دارد
      const res = await axiosInstance.post('/api/patient-login/', { phone: values.phone })
      // فرض: توکن را در پاسخ دریافت می‌کنید
      localStorage.setItem('token', res.data.token)
      message.success('ورود موفقیت‌آمیز بود')
      navigate('/dashboard') // یا هر صفحه‌ای که می‌خواهید
    } catch (err: any) {
      message.error(err.response?.data?.error || 'ورود ناموفق بود')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">ورود بیماران</h2>
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="phone"
            label="شماره تلفن همراه"
            rules={[
              { required: true, message: 'شماره تلفن را وارد کنید' },
              { pattern: /^09\d{9}$/, message: 'شماره تلفن معتبر نیست' }
            ]}
          >
            <Input placeholder="مثلاً 09123456789" />
          </Form.Item>
          <Button
            type="submit"
            variant="solid"
            className="w-full"
            loading={loading}
          >
            ورود
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default PatientLogin