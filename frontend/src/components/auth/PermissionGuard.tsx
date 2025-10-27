import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
    permission?: string
    studyId?: number
    children: React.ReactNode
    fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    studyId,
    children,
    fallback = null
}) => {
    const { user } = useAuth()

    if (!user) {
        return fallback
    }

    // اگر کاربر مدیر کل باشد، همه دسترسی‌ها را دارد
    if (user.role === 'super_admin') {
        return <>{children}</>
    }

    // اگر دسترسی خاصی نیاز نباشد
    if (!permission) {
        return <>{children}</>
    }

    // بررسی دسترسی عمومی
    const hasPermission = user.permissions?.includes(permission)
    
    // اگر دسترسی مربوط به یک مطالعه خاص باشد
    if (studyId && hasPermission) {
        const hasStudyPermission = user.study_permissions?.some(
            perm => perm.study_id === studyId && perm.permissions.includes(permission)
        )
        if (!hasStudyPermission) {
            return fallback
        }
    } else if (!hasPermission) {
        return fallback
    }

    return <>{children}</>
}

export default PermissionGuard 
 