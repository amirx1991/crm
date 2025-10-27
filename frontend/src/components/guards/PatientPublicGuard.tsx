import { Navigate, Outlet } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import useAuth from '@/utils/hooks/useAuth'

const { patientAuthenticatedEntryPath } = appConfig

const PatientPublicGuard = () => {
    const { token } = useAuth()

    return !token ? <Outlet /> : <Navigate to={patientAuthenticatedEntryPath} />
}

export default PatientPublicGuard 