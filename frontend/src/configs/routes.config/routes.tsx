import { lazy } from 'react'
import type { Routes } from '@/@types/routes'
import PatientLayout from '@/components/layouts/PatientLayout'
import AppLayout from '@/components/layouts/AppLayout'

const publicRoutes: Routes = [
    {
        key: 'auth.patient',
        path: `/patient`,
        component: PatientLayout,
        authority: [],
        children: [
            {
                key: 'auth.patient.login',
                path: `/patient/login`,
                component: lazy(() => import('@/views/auth/PatientLogin')),
                authority: [],
            }
        ]
    },
    {
        key: 'auth.admin',
        path: `/sign-in`,
        component: lazy(() => import('@/views/auth/SignIn')),
        authority: [],
    }
]

const protectedRoutes: Routes = [
    // Admin routes
    {
        key: 'admin',
        path: '/',
        component: AppLayout,
        authority: ['admin', 'user'],
        children: [
            {
                key: 'admin.dashboard',
                path: '/dashboard',
                component: lazy(() => import('@/views/dashboard')),
                authority: ['admin', 'user'],
            }
        ]
    },
    // Patient routes
    {
        key: 'patient',
        path: `/patient`,
        component: PatientLayout,
        authority: ['patient'],
        children: [
            {
                key: 'patient.dashboard',
                path: `/patient/dashboard`,
                component: lazy(() => import('@/views/users/Dashboard')),
                authority: ['patient'],
            },
         
            {
                key: 'patient.study-forms',
                path: `/patient/studies/:id`,
                component: lazy(() => import('@/views/users/StudyForms')),
                authority: ['patient'],
            }
        ]
    }
]

export { publicRoutes, protectedRoutes } 