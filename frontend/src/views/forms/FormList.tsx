import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Modal, Input } from 'antd'
import { HiOutlineSearch } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'

interface Form {
    id: number
    name: string
    description: string
    created_at: string
    fields: any[]
}

interface TablePagination {
    current: number
    pageSize: number
    total: number
}

const FormList = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [forms, setForms] = useState<Form[]>([])
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [selectedForm, setSelectedForm] = useState<Form | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [pagination, setPagination] = useState<TablePagination>({
        current: 1,
        pageSize: 10,
        total: 0
    })

    const fetchForms = async (page: number = 1, pageSize: number = 10, search: string = '') => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/api/forms/', {
                params: {
                    page,
                    page_size: pageSize,
                    search
                }
            })
            
            setForms(response.data.results)
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: response.data.result_count
            }))
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در دریافت لیست فرم‌ها')
        } finally {
            setLoading(false)
        }
    }

  useEffect(() => {
        fetchForms(pagination.current, pagination.pageSize, searchQuery)
    }, [])

    const handleDelete = async () => {
        if (!selectedForm) return

        try {
            await axiosInstance.delete(`/api/forms/${selectedForm.id}/`)
            message.success('فرم با موفقیت حذف شد')
            fetchForms(pagination.current, pagination.pageSize, searchQuery)
            setDeleteModalVisible(false)
            setSelectedForm(null)
        } catch (error: any) {
            message.error(error.response?.data?.detail || 'خطا در حذف فرم')
        }
    }

    const handleTableChange = (page: number, pageSize: number) => {

        setPagination(prev => ({
            ...prev,
            current: page.current,
            pageSize: page.pageSize
        }))

        fetchForms(page.current, page.pageSize, searchQuery)
    }

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        setPagination(prev => ({
            ...prev,
            current: 1
        }))
        // Reset to first page when searching
        fetchForms(1, pagination.pageSize, value)
    }

    const columns: ColumnDef<Form>[] = [
      {
        header: 'نام فرم',
        accessorKey: 'name',
        cell: (props) => {
          const { name } = props.row.original;
          return <span className="font-bold heading-text">{name}</span>;
        },
      },
      {
        header: 'توضیحات',
        accessorKey: 'description',
        cell: (props) => {
          const { description } = props.row.original;
          return <span className="text-gray-600">{description || '-'}</span>;
        },
      },
      {
        header: 'تاریخ ایجاد',
        accessorKey: 'created_at',
        cell: (props) => {
          const { created_at } = props.row.original;
          return (
            <span className="text-gray-600">
              {new Date(created_at).toLocaleDateString('fa-IR')}
            </span>
          );
        },
      },
      {
        header: 'تعداد فیلدها',
        accessorKey: 'fields',
        cell: (props) => {
                const { fields = [] } = props.row.original;
          return <span className="font-semibold">{fields.length}</span>;
        },
      },
      {
            header: 'عملیات',
        id: 'action',
        cell: (props) => (
                <div className="flex items-center justify-end gap-3">
              <Button
                variant="plain"
                size="sm"
                        icon={<SearchOutlined />}
                onClick={() => navigate(`/forms/${props.row.original.id}/submissions`)}
              >
                فرم‌های پر شده
              </Button>
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/forms/${props.row.original.id}/edit`)}
                    >
                        ویرایش
                    </Button>
                    <Button
                        variant="plain"
                        size="sm"
                        color="red"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            setSelectedForm(props.row.original)
                            setDeleteModalVisible(true)
                        }}
                    >
                        حذف
                    </Button>
          </div>
        ),
      },
    ]

    if (loading && !forms.length) {
        return <Loading loading={true} />
    }

  return (
    <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 className="mb-0">لیست فرم‌ها</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-full md:w-64">
                                <Input
                                    prefix={<HiOutlineSearch className="text-gray-400" />}
                                    placeholder="جستجو در نام و توضیحات..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
          <Button
            variant="solid"
            size="sm"
                                icon={<PlusOutlined />}
            onClick={() => navigate('/forms/create')}
          >
            ایجاد فرم جدید
          </Button>
        </div>
      </div>
        <DataTable
                        data={forms}
          columns={columns}
          loading={loading}
                        skeletonAvatarColumns={[0]}

                        skeletonAvatarProps={{ width: 28, height: 28 }}

          pagingData={{
                            total: pagination.total,
                            pageIndex: pagination.current,
                            pageSize: pagination.pageSize,
                        }}
                        onPaginationChange={(page) => handleTableChange({ current: page, pageSize: pagination.pageSize })}
                        onSelectChange={(pageSize) => handleTableChange({ current: pagination.current, pageSize })}
                        pageSizes={[10, 25, 50]}


                    />
                </div>
      </AdaptiveCard>

            <Modal
                title="حذف فرم"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false)
                    setSelectedForm(null)
                }}
                okText="حذف"
                cancelText="انصراف"
                okButtonProps={{ className: 'bg-red-600 hover:bg-red-700' }}
                cancelButtonProps={{ className: 'bg-gray-100 hover:bg-gray-200 text-gray-700' }}
            >
                <p className="text-gray-800">
                    آیا از حذف فرم {selectedForm?.name} اطمینان دارید؟
                </p>
            </Modal>
    </Container>
    )
}

export default FormList 