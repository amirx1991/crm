import { TbClipboardList } from 'react-icons/tb'

export const navigationConfig = [
    {
        key: 'studies',
        path: '/studies',
        title: 'مطالعات',
        translateKey: 'nav.studies',
        icon: <TbClipboardList />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
    },
] 