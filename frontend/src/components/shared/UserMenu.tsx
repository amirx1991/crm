import { useAuth } from '@/utils/hooks/useAuth'
import { PiUserCircleDuotone } from 'react-icons/pi'

const UserMenu = () => {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    return (
        <div className="flex items-center gap-2">
            <PiUserCircleDuotone className="text-xl" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
                {user.username}
            </span>
        </div>
    )
}

export default UserMenu 