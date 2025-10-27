import Card from '@/components/ui/Card'
import { useState,useEffect, useMemo } from 'react'
import axiosInstance from '@/utils/axios'
import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import { Link } from 'react-router-dom'
import ProgressionBar from './ProgressionBar'
import { useProjectListStore } from '../store/projectListStore'
import { apiGetProjects } from '@/services/ProjectService'
import useSWR from 'swr'
import { TbClipboardCheck, TbStarFilled, TbStar } from 'react-icons/tb'
import type { GetProjectListResponse } from '../types'
import { message, Modal } from 'antd'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef } from '@/components/shared/DataTable'
import { TbPlus, TbEdit, TbEye } from 'react-icons/tb'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import jalaali from 'jalaali-js'
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);


interface Study {
    id: number
    name: string
    description: string
    created_at: string
    states_count: number
}


const ProjectListContent = () => {

    const navigate = useNavigate()
    
    const [projectList, setProjectList] = useState<Study[]>([])

    const [loading, setLoading] = useState(true)
        
    const [error, setError] = useState<string | null>(null)

 const fetchAdmins = async () => {
        try {

            setLoading(true)
            const response = await axiosInstance.get('/api/services/me/')
            setProjectList(response.data)
            setError(null)


           if (response.data > 0) {
          const dynamicColumns: ColumnDef<any>[] = Object.keys(response.data[0]).map(
            (key) => ({
              accessorKey: key,
              header: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            })
          );
        }
        } catch (error: any) {
            message.error('خطا در دریافت لیست ')
            setError('خطا در دریافت لیست ')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        fetchAdmins()

        
        
    }, [])

     const columns: ColumnDef<Study>[] = [
        {
            header: 'عنوان درخواست',
            accessorKey: 'title',
        },
        {
            header: 'توضیحات',
            accessorKey: 'desc',
           cell: (props) => {
            const value = props.getValue() as string
            if (!value) return '---'
            return value.length > 100 ? value.slice(0, 100) + '...' : value
            },
        },
  
        {
            header: 'تاریخ ایجاد',
            accessorKey: 'created_at',
            cell: (props) => {
            const value = props.getValue() as string
            if (!value) return '-'
            const date = new Date(value)
            const j = jalaali.toJalaali(date)
            return `${j.jy}/${j.jm.toString().padStart(2, '0')}/${j.jd.toString().padStart(2, '0')}`
            }        },
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
                    
                </div>
            ),
        },
    ]

    const handleToggleFavorite = (id: string, value: boolean) => {
        updateProjectFavorite({ id, value })
    }

    return (
        <div>
            <div className="mt-8">
                <h5 className="mb-3">درخواست های در حال بررسی</h5>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projectList?.map((project) => (
                            <Card key={project.id} bodyClass="h-full">
                                <div className="flex flex-col justify-between h-full">
                                    
                                    <div className="flex justify-between items-center">
                                        <Link
                                            to={`/concepts/projects/project-details/${project.id}`}
                                        >
                                            <h6 className="font-bold hover:text-primary">
                                                {project.title}
                                            </h6>
                                        </Link>
                                        
                                        {project.status_type}
                                        

                                        {
                                             dayjs(project.created_at)
                                            .calendar('jalali')
                                            .locale('fa')
                                            .format('YYYY/MM/DD HH:mm')
                                        }

                                    </div>
                                    <p className="mt-4">{project.desc}</p>
                                    <div className="mt-3">
                                        <ProgressionBar
                                            progression={project.status*20+20}
                                        />


                                        <div className="flex items-center justify-between mt-2">
                                            <UsersAvatarGroup
                                                users={project.member}
                                            />
                                            
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
            <div className="mt-8">
                <h5 className="mb-3"> همه درخواست ها</h5>
                 <AdaptiveCard>
                <DataTable
                    columns={columns}
                    data={projectList}
                    loading={loading}
                    noData={!loading && projectList.length === 0}
                />
            </AdaptiveCard>
               
            </div>
        </div>
    )
}

export default ProjectListContent
