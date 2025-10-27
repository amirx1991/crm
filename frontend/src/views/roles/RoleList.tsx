import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Table, Space, Popconfirm } from 'antd'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { TbShieldPlus } from 'react-icons/tb'
import type { ColumnsType } from 'antd/es/table'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'

interface Role {
    id: number
    name: string
    display_name: string
    permissions: string[]
    created: string
}

const RoleList = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [roles, setRoles] = useState<Role[]>([])

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/roles/')
            setRoles(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت لیست نقش‌ها')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await axiosInstance.delete(`/api/roles/${id}/`)
            message.success('نقش با موفقیت حذف شد')
            fetchRoles()
        } catch (error: any) {
            message.error(error.response?.data?.error || 'خطا در حذف نقش')
        }
    }

    const columns: ColumnsType<Role> = [
        {
            title: 'نام نقش',
            dataIndex: 'name',
            key: 'name',
            className: 'font-medium',
        },
        {
            title: 'نام نمایشی',
            dataIndex: 'display_name',
            key: 'display_name',
        },
        {
            title: 'تعداد دسترسی‌ها',
            key: 'permissions_count',
            render: (_, record) => (
                <span className="text-blue-600 font-medium">
                    {record.permissions.length}
                </span>
            )
        },
        {
            title: 'تاریخ ایجاد',
            dataIndex: 'created',
            key: 'created',
            render: (date) => (
                <span className="text-gray-600">
                    {new Date(date).toLocaleDateString('fa-IR')}
                </span>
            )
        },
        {
            title: 'عملیات',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        variant="plain"
                        size="xs"
                        icon={<HiOutlinePencil className="text-blue-600" />}
                        onClick={() => navigate(`/roles/${record.id}/edit`)}
                    >
                        ویرایش
                    </Button>
                    <Popconfirm
                        title="آیا از حذف این نقش اطمینان دارید؟"
                        onConfirm={() => handleDelete(record.id)}
                        okText="بله"
                        cancelText="خیر"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            variant="plain"
                            size="xs"
                            icon={<HiOutlineTrash className="text-red-600" />}
                        >
                            حذف
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    if (loading) {
        return <Loading loading={true} />
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">مدیریت نقش‌ها</h2>
                <Button
                    variant="solid"
                    onClick={() => navigate('/roles/create')}
                    icon={<TbShieldPlus className="text-lg" />}
                >
                    ایجاد نقش جدید
                </Button>
            </div>

            <AdaptiveCard className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    className="overflow-x-auto"
                    pagination={{
                        hideOnSinglePage: true,
                        showSizeChanger: true,
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50'],
                        className: 'mt-4',
                    }}
                />
            </AdaptiveCard>
        </Container>
    )
}

export default RoleList 
