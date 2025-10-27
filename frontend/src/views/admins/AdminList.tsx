import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Modal } from 'antd'
import { TbPencil, TbPlus, TbTrash } from 'react-icons/tb'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import type { ColumnDef } from '@/components/shared/DataTable'

interface Admin {
    id: number
    username: string
    first_name: string
    last_name: string
    phone: string
}

const AdminList = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [admins, setAdmins] = useState<Admin[]>([])
    const [error, setError] = useState<string | null>(null)

    const fetchAdmins = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/admins/list?type=0')
            setAdmins(response.data.results)
            setError(null)
        } catch (error: any) {
            message.error('خطا در دریافت لیست ادمین‌ها')
            setError('خطا در دریافت لیست ادمین‌ها')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
        
    }, [])

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'حذف ادمین',
            content: 'آیا از حذف این ادمین اطمینان دارید؟',
            okText: 'بله',
            cancelText: 'خیر',
            onOk: async () => {
                try {
                    await axiosInstance.delete(`/api/admins/detail/${id}`)
                    message.success('ادمین با موفقیت حذف شد')
                    fetchAdmins()
                } catch (error: any) {
                    message.error('خطا در حذف ادمین')
                }
            },
        })
    }

    const columns: ColumnDef<Admin>[] = useMemo(
        () => [
            {
                header: 'نام کاربری',
                accessorKey: 'username',
                cell: (props) => {
                    const { username } = props.row.original
                    return <span className="font-bold heading-text">{username}</span>
                },
            },
            {
                header: 'نام',
                accessorKey: 'first_name',
                cell: (props) => {
                    const { first_name } = props.row.original
                    return <span className="text-gray-600">{first_name}</span>
                },
            },
            {
                header: 'نام خانوادگی',
                accessorKey: 'last_name',
                cell: (props) => {
                    const { last_name } = props.row.original
                    return <span className="text-gray-600">{last_name}</span>
                },
            },
            {
                header: 'شماره تماس',
                accessorKey: 'phone',
                cell: (props) => {
                    const { phone } = props.row.original
                    return <span className="text-gray-600">{phone}</span>
                },
            },
            {
                header: 'عملیات',
                id: 'action',
                cell: (props) => (
                    <div className="flex items-center gap-2">
                        <Tooltip title="ویرایش">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<TbPencil className="text-lg" />}
                                onClick={() => navigate(`/admins/${props.row.original.id}/edit`)}
                            >
                                ویرایش
                            </Button>
                        </Tooltip>
                        <Tooltip title="حذف">
                            <Button
                                variant="plain"
                                size="sm"
                                color="danger"
                                icon={<TbTrash className="text-lg" />}
                                onClick={() => handleDelete(props.row.original.id)}
                            >
                                حذف
                            </Button>
                        </Tooltip>
                    </div>
                ),
            },
        ],
        []
    )

    return (
        <Container>
            <div className="flex justify-between items-center mb-4">
                <h3>لیست ادمین‌ها</h3>
                <div className="flex gap-2">
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<TbPlus className="text-lg" />}
                        onClick={() => navigate('/admins/create')}
                    >
                        افزودن ادمین جدید
                    </Button>
                </div>
            </div>

            <AdaptiveCard>
                <DataTable
                    columns={columns}
                    data={error ? [] : admins}
                    loading={loading}
                    noData={!loading && (admins.length === 0 || !!error)}
                    pagingData={{
                        total: error ? 0 : admins.length,
                        pageIndex: 1,
                        pageSize: 10,
                    }}
                />
            </AdaptiveCard>
        </Container>
    )
}

export default AdminList 