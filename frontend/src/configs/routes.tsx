import StudyList from '@/views/studies/StudyList'
import StudyCreate from '@/views/studies/StudyCreate'

export const publicRoutes = [
    {
        key: 'studies',
        path: '/studies',
        component: StudyList,
        authority: [],
    },
    {
        key: 'studies.create',
        path: '/studies/create',
        component: StudyCreate,
        authority: [],
    },
    
] 