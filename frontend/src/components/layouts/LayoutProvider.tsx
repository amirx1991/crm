import { createContext, useContext, ReactNode } from 'react'
import { THEME_ENUM } from '@/constants/theme.constant'

export type LayoutContextValue = {
    type: THEME_ENUM
    direction: 'rtl' | 'ltr'
    mode: THEME_ENUM
    sideNavCollapse: boolean
    sideNavWidth: number
    currentRouteKey: string
}

const LayoutContext = createContext<LayoutContextValue>({
    type: THEME_ENUM.BLANK,
    direction: 'rtl',
    mode: THEME_ENUM.LIGHT,
    sideNavCollapse: false,
    sideNavWidth: 0,
    currentRouteKey: ''
})

export const useLayout = () => {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider')
    }
    return context
}

type LayoutProviderProps = {
    children: ReactNode
    mode?: THEME_ENUM
    layout?: 'blank' | 'default'
    direction?: 'rtl' | 'ltr'
}

const LayoutProvider = ({ 
    children,
    mode = THEME_ENUM.LIGHT,
    layout = 'default',
    direction = 'rtl'
}: LayoutProviderProps) => {
    const value: LayoutContextValue = {
        type: layout === 'blank' ? THEME_ENUM.BLANK : THEME_ENUM.DEFAULT,
        direction,
        mode,
        sideNavCollapse: false,
        sideNavWidth: 0,
        currentRouteKey: 'patient.layout'
    }

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    )
}

export default LayoutProvider 