import { ReactNode } from 'react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCurrentRouteKey } from '@/store/slices/themeSlice'
import useAuth from '@/utils/hooks/useAuth'
import useDirection from '@/utils/hooks/useDirection'
import LayoutProvider from './LayoutProvider'
import { THEME_ENUM } from '@/constants/theme.constant'

interface PatientLayoutProps {
    children: ReactNode
}

const PatientLayout = ({ children }: PatientLayoutProps) => {
    const dispatch = useDispatch()
    const { signOut } = useAuth()
    const { direction } = useDirection()

    useEffect(() => {
        dispatch(setCurrentRouteKey('patient.layout'))
    }, [dispatch])

    return (
        <LayoutProvider 
            mode={THEME_ENUM.LIGHT} 
            layout="blank"
            direction={direction}
        >
            <div className="app-layout-blank flex flex-auto flex-col h-[100vh]">
                <div className="flex flex-auto flex-col justify-center">
                    {children}
                </div>
            </div>
        </LayoutProvider>
    )
}

export default PatientLayout 