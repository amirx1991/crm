import { Outlet } from 'react-router-dom'
import PatientLayout from './PatientLayout'

const PatientLayoutRoute = () => {
    return (
        <PatientLayout>
            <Outlet />
        </PatientLayout>
    )
}

export default PatientLayoutRoute 