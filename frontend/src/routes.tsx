import PatientList from '@/views/users/UserList'
import PatientForm from '@/views/users/PatientForm'
import PatientEdit from '@/views/users/UserEdit'

const routes = [
    {
        path: '/patients',
        element: <PatientList />
    },
    {
        path: '/patients/new',
        element: <PatientForm />
    },
    {
        path: '/patients/:id/edit',
        element: <PatientEdit />
    },
] 