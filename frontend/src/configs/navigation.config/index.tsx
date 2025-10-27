import { TeamOutlined, FormOutlined, UserOutlined } from '@ant-design/icons'

const navigationConfig = [
    // ... existing menu items ...
    {
        key: 'patients',
        path: '/patients',
        title: 'بیماران',
        icon: <TeamOutlined />,
        type: 'item',
        authority: [],
    },
]

export default navigationConfig 