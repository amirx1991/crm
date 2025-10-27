import axios from 'axios'
import { notification } from 'antd'
import appConfig from '@/configs/app.config'

const { apiPrefix } = appConfig

const patientAxios = axios.create({
    baseURL: apiPrefix,
    timeout: 30000,
})

// Request interceptor
patientAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            console.log("JJJJJJJJJJJJJJJJJJJ",token)

            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.log("EEEEEEEEEEEEEEEEEEEEEEEEEE",error)
        window.location.href = '/patient/login'

        return Promise.reject(error)
    }
)

// Response interceptor
patientAxios.interceptors.response.use(
    
    (response) => response,
    (error) => {
        const { status } = error.response || {}

        // Handle 401 Unauthorized
        if (status === 401) {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            //window.location.href = '/patient/login'
            notification.error({
                message: 'خطای احراز هویت',
                description: 'لطفاً مجدداً وارد شوید'
            })
        }

        // Handle 403 Forbidden
        if (status === 403) {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            //window.location.href = '/patient/login'
           
            notification.error({
                message: 'خطای دسترسی',
                description: 'شما مجوز دسترسی به این بخش را ندارید'
                
            })

        }
        
        // Handle 404 Not Found
        if (status === 404) {
            notification.error({
                message: 'خطای درخواست',
                description: 'منبع مورد نظر یافت نشد'
            })
        }

        // Handle 500 Internal Server Error
        if (status === 500) {
            notification.error({
                message: 'خطای سرور',
                description: 'خطایی در سرور رخ داده است. لطفاً مجدداً تلاش کنید'
            })
        }

        // Handle Network Error
        if (!error.response) {
            notification.error({
                message: 'خطای شبکه',
                description: 'اتصال به سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید'
            })
        }

        return Promise.reject(error)
    }
)

export default patientAxios 