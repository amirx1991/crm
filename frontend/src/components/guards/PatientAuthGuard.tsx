import { Navigate, Outlet } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import useAuth from '@/utils/hooks/useAuth'

const { patientUnAuthenticatedEntryPath } = appConfig

const PatientAuthGuard = () => {
    const { token } = useAuth()

    return token ? <Outlet /> : <Navigate to={patientUnAuthenticatedEntryPath} />
}

export default PatientAuthGuard 