import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Upload, Button as AntdButton, Card, Alert } from 'antd'
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import axiosInstance from '@/utils/axios'

const ExcelImport = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [fileList, setFileList] = useState<any[]>([])

    const handleUpload = async (file: File) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('file', file)

            const response = await axiosInstance.post('/api/materails/import-excel/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            
            message.success(`فایل با موفقیت وارد شد. ${response.data?.imported_count || 0} رکورد اضافه شد.`)
            navigate('/materails')
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در وارد کردن فایل اکسل')
        } finally {
            setLoading(false)
        }
        return false // Prevent default upload
    }

    const downloadTemplate = () => {
        // Create a simple Excel template
        const templateData = [
            ['عنوان', 'تعداد', 'قیمت'],
            ['مثال: کابل شبکه', '10', '50000'],
            ['مثال: سوکت', '20', '15000']
        ]
        
        const csvContent = templateData.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'materials_template.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/materails')}
                >
                    بازگشت به لیست
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdaptiveCard>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">وارد کردن از فایل اکسل</h2>
                        <p className="text-gray-600">فایل اکسل حاوی متریال‌ها را آپلود کنید</p>
                    </div>

                    <div className="space-y-4">
                        <Alert
                            message="راهنمای فرمت فایل"
                            description="فایل اکسل باید شامل ستون‌های زیر باشد: عنوان، تعداد، قیمت"
                            type="info"
                            showIcon
                        />

                        <Upload
                            beforeUpload={handleUpload}
                            accept=".xlsx,.xls,.csv"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            showUploadList={true}
                        >
                            <AntdButton 
                                icon={<UploadOutlined />} 
                                loading={loading}
                                size="large"
                                className="w-full"
                            >
                                انتخاب فایل اکسل
                            </AntdButton>
                        </Upload>

                        <div className="text-center text-gray-500">
                            <p>فرمت‌های پشتیبانی شده: .xlsx, .xls, .csv</p>
                        </div>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">دانلود قالب فایل</h2>
                        <p className="text-gray-600">قالب استاندارد برای وارد کردن متریال‌ها</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium mb-2">ساختار فایل:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• ستون اول: عنوان متریال</li>
                                <li>• ستون دوم: تعداد (اختیاری)</li>
                                <li>• ستون سوم: قیمت (اختیاری)</li>
                            </ul>
                        </div>

                        <Button
                            variant="solid"
                            icon={<DownloadOutlined />}
                            onClick={downloadTemplate}
                            className="w-full"
                        >
                            دانلود قالب CSV
                        </Button>

                        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                <strong>نکته:</strong> ردیف اول فایل باید شامل نام ستون‌ها باشد
                            </p>
                        </div>
                    </div>
                </AdaptiveCard>
            </div>

            <AdaptiveCard className="mt-6">
                <div className="mb-4">
                    <h3 className="text-lg font-bold">نمونه فایل</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-2 text-right">عنوان</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">تعداد</th>
                                <th className="border border-gray-300 px-4 py-2 text-right">قیمت</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">کابل شبکه</td>
                                <td className="border border-gray-300 px-4 py-2">10</td>
                                <td className="border border-gray-300 px-4 py-2">50000</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">سوکت RJ45</td>
                                <td className="border border-gray-300 px-4 py-2">20</td>
                                <td className="border border-gray-300 px-4 py-2">15000</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-4 py-2">پچ پنل</td>
                                <td className="border border-gray-300 px-4 py-2">5</td>
                                <td className="border border-gray-300 px-4 py-2">200000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default ExcelImport


