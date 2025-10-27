import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message, Form, Checkbox, Card } from 'antd'
import { TbArrowLeft, TbShieldCheck } from 'react-icons/tb'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Loading from '@/components/shared/Loading'
import { Permission, PERMISSIONS, groupedPermissions } from '@/constants/permissions'

interface Role {
    id: number
    name: string
    display_name: string
    permissions: Array<{
        id: number
        codename: string
        name: string
    }>
    created: string
}

const RoleEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [role, setRole] = useState<Role | null>(null)

    useEffect(() => {
        fetchRole()
    }, [id])

    const fetchRole = async () => {
        try {
            setFetching(true)
            const response = await axiosInstance.get(`/api/roles/${id}/`)
            setRole(response.data)
            
            // گروه‌بندی دسترسی‌ها بر اساس گروه
            const permissionsByGroup = response.data.permissions.reduce((acc: { [key: string]: string[] }, permission: { id: number }) => {
                const foundPermission = PERMISSIONS.find(p => p.id === permission.id)
                if (foundPermission) {
                    const group = foundPermission.group
                    if (!acc[group]) {
                        acc[group] = []
                    }
                    acc[group].push(foundPermission.codename)
                }
                return acc
            }, {})

            // تنظیم مقادیر فرم
            form.setFieldsValue({
                name: response.data.name,
                display_name: response.data.display_name,
                ...Object.keys(groupedPermissions).reduce((acc, group) => ({
                    ...acc,
                    [`permissions_${group}`]: permissionsByGroup[group] || []
                }), {})
            })
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات نقش')
            navigate('/roles')
        } finally {
            setFetching(false)
        }
    }

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true)
            // جمع‌آوری همه دسترسی‌های انتخاب شده از گروه‌های مختلف
            const allPermissions = Object.keys(groupedPermissions).reduce((acc: string[], group) => {
                const groupPermissions = values[`permissions_${group}`] || []
                return [...acc, ...groupPermissions]
            }, [])

            // تبدیل codename به ID
            const permissionIds = allPermissions.map((codename: string) => {
                const permission = PERMISSIONS.find((p: Permission) => p.codename === codename)
                return permission?.id
            }).filter(Boolean)
            
            await axiosInstance.patch(`/api/roles/${id}/`, {
                name: values.name,
                display_name: values.display_name,
                permission_ids: permissionIds
            })
            message.success('نقش با موفقیت به‌روزرسانی شد')
            navigate('/roles')
        } catch (error: any) {
            message.error(error.response?.data?.error || 'خطا در به‌روزرسانی نقش')
        } finally {
            setLoading(false)
        }
    }

    // اضافه کردن دکمه انتخاب همه دسترسی‌ها
    const handleSelectAllPermissions = () => {
        Object.entries(groupedPermissions).forEach(([group, permissions]) => {
            const groupPermissions = permissions.map(p => p.codename)
            form.setFieldValue(`permissions_${group}`, groupPermissions)
        })
    }

    // اضافه کردن دکمه حذف همه دسترسی‌ها
    const handleDeselectAllPermissions = () => {
        Object.keys(groupedPermissions).forEach(group => {
            form.setFieldValue(`permissions_${group}`, [])
        })
    }

    // اضافه کردن امکان انتخاب ترکیبی دسترسی‌ها
    const handleCombinedPermissions = (group: string) => {
        const groupPermissions = groupedPermissions[group]
        if (!groupPermissions) return

        const permissionCodenames = groupPermissions.map(p => p.codename)
        const currentPermissions = form.getFieldValue(`permissions_${group}`) || []
        
        // اگر همه دسترسی‌های گروه انتخاب شده باشند، آنها را حذف کن
        const allSelected = permissionCodenames.every(codename => currentPermissions.includes(codename))
        
        form.setFieldValue(`permissions_${group}`, allSelected ? [] : permissionCodenames)
    }

    // بررسی وضعیت انتخاب گروه
    const getGroupCheckStatus = (group: string) => {
        const groupPermissions = groupedPermissions[group]
        const permissionCodenames = groupPermissions.map(p => p.codename)
        const currentPermissions = form.getFieldValue(`permissions_${group}`) || []
        
        const selectedCount = permissionCodenames.filter(codename => currentPermissions.includes(codename)).length
        
        if (selectedCount === 0) return false
        if (selectedCount === groupPermissions.length) return true
        return 'indeterminate'
    }

    if (fetching) {
        return <Loading loading={true} />
    }

    if (!role) {
        return null
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<TbArrowLeft className="text-lg" />}
                        onClick={() => navigate('/roles')}
                    >
                        بازگشت به لیست
                    </Button>
                    <h2 className="text-2xl font-bold">ویرایش نقش</h2>
                </div>
                <TbShieldCheck className="text-3xl text-blue-600" />
            </div>

            <AdaptiveCard className="shadow-sm">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="max-w-4xl mx-auto"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Form.Item
                            label="نام نقش (به انگلیسی)"
                            name="name"
                            rules={[{ required: true, message: 'لطفاً نام نقش را وارد کنید' }]}
                        >
                            <Input placeholder="مثال: doctor" />
                        </Form.Item>

                        <Form.Item
                            label="نام نمایشی نقش"
                            name="display_name"
                            rules={[{ required: true, message: 'لطفاً نام نمایشی نقش را وارد کنید' }]}
                        >
                            <Input placeholder="مثال: پزشک" />
                        </Form.Item>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">دسترسی‌ها</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={handleSelectAllPermissions}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    انتخاب همه دسترسی‌ها
                                </Button>
                                <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={handleDeselectAllPermissions}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    حذف همه دسترسی‌ها
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                <Card key={group} 
                                    title={
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{group}</span>
                                            <Checkbox
                                                checked={getGroupCheckStatus(group) === true}
                                                indeterminate={getGroupCheckStatus(group) === 'indeterminate'}
                                                onChange={() => handleCombinedPermissions(group)}
                                                className="text-blue-600"
                                            >
                                                انتخاب همه
                                            </Checkbox>
                                        </div>
                                    } 
                                    size="small" 
                                    className="shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <Form.Item name={`permissions_${group}`} noStyle>
                                        <Checkbox.Group className="w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {permissions.map((permission: Permission) => (
                                                    <div key={permission.id} className="bg-gray-50 p-3 rounded-lg">
                                                        <Checkbox value={permission.codename}>
                                                            <div>
                                                                <div className="font-medium">{permission.name}</div>
                                                                <div className="text-gray-500 text-sm mt-1">
                                                                    {permission.description}
                                                                </div>
                                                            </div>
                                                        </Checkbox>
                                                    </div>
                                                ))}
                                            </div>
                                        </Checkbox.Group>
                                    </Form.Item>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <Button 
                            variant="solid" 
                            type="submit" 
                            loading={loading}
                            icon={<TbShieldCheck className="text-lg" />}
                        >
                            ذخیره تغییرات
                        </Button>
                        <Button
                            variant="plain"
                            type="button"
                            onClick={() => navigate('/roles')}
                        >
                            انصراف
                        </Button>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    )
}

export default RoleEdit 