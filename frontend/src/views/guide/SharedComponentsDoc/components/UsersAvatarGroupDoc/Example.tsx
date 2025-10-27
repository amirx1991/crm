import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'

const data = [
    {
        userName: 'Ron Vargas',
        avatarImg: '/static/img/avatars/thumb-3.jpg',
    },
    {
        userName: 'Carolyn Hanson',
        avatarImg: '/static/img/avatars/thumb-9.jpg',
    },
    {
        userName: 'Samantha Phillips',
        avatarImg: '/static/img/avatars/thumb-6.jpg',
    },
    {
        userName: 'Ella Robinson',
        avatarImg: '/static/img/avatars/thumb-15.jpg',
    },
]

const Example = () => {
    return (
        <UsersAvatarGroup
            nameKey="userName"
            imgKey="avatarImg"
            avatarProps={{ size: 40 }}
            users={data}
        />
    )
}

export default Example
