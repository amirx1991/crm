import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { TbPlus, TbEdit, TbEye } from 'react-icons/tb'
import dayjs from 'dayjs'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'

interface Study {
    id: number
    name: string
    description: string
    created_at: string
    states_count: number
}

const StudyList = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [studies, setStudies] = useState<Study[]>([])

    const fetchStudies = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/studies/')
            setStudies(response.data || [])
        } catch (error: any) {
            message.error('خطا در دریافت لیست مطالعات')
            console.error('Error fetching studies:', error)
            setStudies([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudies()
    }, [])

    const columns: ColumnDef<Study>[] = [
        {
            header: 'نام مطالعه',
            accessorKey: 'name',
        },
        {
            header: 'توضیحات',
            accessorKey: 'description',
            cell: (props) => props.getValue() || '-'
        },
        {
            header: 'تعداد مراحل',
            accessorKey: 'states_count',
        },
        {
            header: 'تاریخ ایجاد',
            accessorKey: 'created_at',
            cell: (props) => dayjs(props.getValue() as string).format('YYYY/MM/DD')
        },
        {
            header: 'عملیات',
            id: 'actions',
            cell: (props) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<TbEye />}
                        onClick={() => navigate(`/studies/${props.row.original.id}`)}
                    >
                        مشاهده
                    </Button>
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<TbEdit />}
                        onClick={() => navigate(`/studies/${props.row.original.id}/edit`)}
                    >
                        ویرایش
                    </Button>
                    <Button
                        variant="solid"
                        onClick={() => navigate(`/studies/${props.row.original.id}/patients`)}
                    >
                        بیماران
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <Container>
            <div className="flex justify-between items-center mb-4">
                <h3>مطالعات</h3>
                <Button
                    variant="solid"
                    icon={<TbPlus />}
                    onClick={() => navigate('/studies/create')}
                >
                    ایجاد مطالعه جدید
                </Button>
            </div>
            <AdaptiveCard>
                <DataTable
                    columns={columns}
                    data={studies}
                    loading={loading}
                    noData={!loading && studies.length === 0}
                />
            </AdaptiveCard>
        </Container>
    )
}

export default StudyList 