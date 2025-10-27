import { lazy } from 'react'
import dashboardsRoute from './dashboardsRoute'
import conceptsRoute from './conceptsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import authDemoRoute from './authDemoRoute'
import guideRoute from './guideRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'




// const studyRoutes: Routes = [
//     {
//         key: 'studies',
//         path: '/studies',
//         component: lazy(() => import('@/views/studies/StudyList')),
//         authority: ['admin', 'user'],
//         meta: {
//             header: { title: 'مطالعات' },
//             pageContainerType: 'contained'
//         }
//     },
//     {
//         key: 'study-create',
//         path: '/studies/create',
//         component: lazy(() => import('@/views/studies/StudyCreate')),
//         authority: ['admin'],
//         meta: {
//             header: { title: 'ایجاد مطالعه جدید' },
//             pageContainerType: 'contained'
//         }
//     },
//     {
//         key: 'study-detail',
//         path: '/studies/:id',
//         component: lazy(() => import('@/views/studies/StudyDetail')),
//         authority: ['admin', 'user'],
//         meta: {
//             header: { title: 'جزئیات مطالعه' },
//             pageContainerType: 'contained'
//         }
//     },
//     {
//         key: 'study-edit',
//         path: '/studies/:id/edit',
//         component: lazy(() => import('@/views/studies/StudyEdit')),
//         authority: ['admin'],
//         meta: {
//             header: { title: 'ویرایش مطالعه' },
//             pageContainerType: 'contained'
//         }
//     },
//     {
//         key: 'study-patients',
//         path: '/studies/:id/patients',
//         component: lazy(() => import('@/views/studies/StudyPatientList')),
//         authority: ['admin', 'user'],
//         meta: {
//             header: { title: 'بیماران مطالعه' },
//             pageContainerType: 'contained'
//         }
//     },
//     {
//         key: 'study-submission-edit',
//         path: '/study-submissions/:id/edit',
//         component: lazy(() => import('@/views/studies/StudySubmissionEdit')),
//         authority: ['admin', 'user'],
//         meta: {
//             header: { title: 'مدیریت مطالعه' },
//             pageContainerType: 'contained'
//         }
//     }
// ]

const adminRoutes: Routes = [
    {
        key: 'admins',
        path: '/admins',
        component: lazy(() => import('@/views/admins/AdminList')),
        authority: ['admin'],
        meta: {
            header: { title: '' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'admin-create',
        path: '/admins/create',
        component: lazy(() => import('@/views/admins/AdminCreate')),
        authority: ['admin'],
        meta: {
            header: { title: 'ایجاد ادمین جدید' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'admin-edit',
        path: '/admins/:id/edit',
        component: lazy(() => import('@/views/admins/AdminEdit')),
        authority: ['admin'],
        meta: {
            header: { title: 'ویرایش ادمین' },
            pageContainerType: 'contained'
        }
    }
]


const repairManRoutes: Routes = [
    {
        key: 'repair-men',
        path: '/repair-men',
        component: lazy(() => import('@/views/repairmen/List')),
        authority: ['admin'],
        meta: {
            header: { title: '' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'repair-men-create',
        path: '/repair-men/create',
        component: lazy(() => import('@/views/repairmen/Edit')),
        authority: ['admin'],
        meta: {
            header: { title: 'ایجاد تعمیر کار' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'repair-men-edit',
        path: '/repair-men/:id/edit',
        component: lazy(() => import('@/views/repairmen/Edit')),
        authority: ['admin'],
        meta: {
            header: { title: 'ویرایش تعمیر کار' },
            pageContainerType: 'contained'
        }
    },
     {
         key: 'operators',
         path: '/operators',
         component: lazy(() => import('@/views/operators/Index')),
         authority: ['admin'],
         meta: {
             header: { title: 'لیست سرویس های تخصیص یافته' },
             pageContainerType: 'contained'
         }
     },
     {
         key: 'operator-service-detail',
         path: '/operators/services/:id',
         component: lazy(() => import('@/views/operators/ServiceDetail')),
         authority: ['admin'],
         meta: {
             header: { title: 'جزئیات سرویس' },
             pageContainerType: 'contained'
         }
     }
]

const MaterialsRoutes: Routes = [
    {
        key: 'materials',
        path: '/materails',
        component: lazy(() => import('@/views/materails/List')),
        authority: ['admin'],
        meta: {
            header: { title: 'مدیریت متریال‌ها' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'materials-create',
        path: '/materails/create',
        component: lazy(() => import('@/views/materails/Form')),
        authority: ['admin'],
        meta: {
            header: { title: 'افزودن متریال جدید' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'materials-edit',
        path: '/materails/:id/edit',
        component: lazy(() => import('@/views/materails/Form')),
        authority: ['admin'],
        meta: {
            header: { title: 'ویرایش متریال' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'materials-excel-import',
        path: '/materails/excel-import',
        component: lazy(() => import('@/views/materails/ExcelImport')),
        authority: ['admin'],
        meta: {
            header: { title: 'وارد کردن از اکسل' },
            pageContainerType: 'contained'
        }
    }
]

const  UserRoutes: Routes = [
    {
        key: 'users',
        path: '/users',
        component: lazy(() => import('@/views/users/UserList')),
        authority: ['admin'],
        meta: {
            header: { title: '' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'user-create',
        path: '/user/create',
        component: lazy(() => import('@/views/users/UserCreate')),
        authority: ['admin'],
        meta: {
            header: { title: 'ایجاد مشتری' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'user-edit',
        path: '/user/:id/edit',
        component: lazy(() => import('@/views/users/UserEdit')),
        authority: ['admin'],
        meta: {
            header: { title: ' ویرایش مشتری' },
            pageContainerType: 'contained'
        }
    }
]

const ServiceRequest: Routes = [

    {
        key: 'service-request',
        path: '/services',
        component: lazy(() => import('@/views/services/List')),
        authority: ['admin'],
        meta: {
            header: { title: 'مدیریت درخواست ها' },
            pageContainerType: 'contained'
        }
    },

    {
        key: 'service-edit',
        path: '/services/:id/edit',
        component: lazy(() => import('@/views/services/Edit')),
        authority: ['admin'],
        meta: {
            header: { title: 'ویرایش درخواست' },
            pageContainerType: 'contained'
        }
    },

     {
        key: 'invoce',
        path: '/invoce',
        component: lazy(() => import('@/views/services/invoices')),
        authority: ['admin'],
        meta: {
            header: { title: 'مدیریت درخواست ها' },
            pageContainerType: 'contained'
        }
    },

    {
        key: 'my-service',
        path: '/myservice',
        component: lazy(() => import('@/views/MyServices/ServiceList')),
        authority: ['admin'],
        meta: {
            header: { title: 'درخواست های من' },
            pageContainerType: 'contained'
        }
    }



]


const roleRoutes: Routes = [
    {
        key: 'roles',
        path: '/roles',
        component: lazy(() => import('@/views/roles/RoleList')),
        authority: ['admin'],
        meta: {
            header: { title: 'مدیریت نقش‌ها' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'role-create',
        path: '/roles/create',
        component: lazy(() => import('@/views/roles/RoleCreate')),
        authority: ['admin'],
        meta: {
            header: { title: 'ایجاد نقش جدید' },
            pageContainerType: 'contained'
        }
    },
    {
        key: 'role-edit',
        path: '/roles/:id/edit',
        component: lazy(() => import('@/views/roles/RoleEdit')),
        authority: ['admin'],
        meta: {
            header: { title: 'ویرایش نقش' },
            pageContainerType: 'contained'
        }
    },
     
]

export const publicRoutes: Routes = [
    ...authRoute,
    {
        key: 'landing',
        path: '/',
        component: lazy(() => import('@/views/auth/LandingPage')),
        authority: [],
        meta: {
            header: { title: 'صفحه اصلی' },
            pageContainerType: 'default'
        }
    },
    {
        key: 'unified-login',
        path: '/login',
        component: lazy(() => import('@/views/auth/UnifiedLogin')),
        authority: [],
        meta: {
            header: { title: 'ورود به سیستم' },
            pageContainerType: 'default'
        }
    },
    {
        key: 'login',
        path: '/sign-in',
        component: lazy(() => import('@/views/auth/SignIn')),
        authority: [],
        meta: {
            header: { title: 'ورود' },
            pageContainerType: 'default'
        }
    },

    {
        key: 'auth.patient.login',
        path: `/patient/login`,
        component: lazy(() => import('@/views/auth/PatientLogin')),
        authority: [],
        meta: {
            header: { title: 'ورود بیمار' },
            pageContainerType: 'default'
        }
    },

    {
        key: 'auth.patient.dashboard',
        path: `/patient/dashboard`,
        component: lazy(() => import('@/views/users/Dashboard')),
        authority: ['user'],
        meta: {
            header: { title: 'داشبورد' },
            pageContainerType: 'default'
        }
    },


    
    
    
   

]




export const protectedRoutes: Routes = [
    ...dashboardsRoute,
    ...conceptsRoute,
    ...uiComponentsRoute,
    ...authDemoRoute,
    ...guideRoute,
    ...othersRoute,
    ...adminRoutes,
    ...roleRoutes,
    ...ServiceRequest,
    ...repairManRoutes,
    ...UserRoutes,
    ...MaterialsRoutes


]
