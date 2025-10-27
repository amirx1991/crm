import dashboardsNavigationConfig from './dashboards.navigation.config'
import uiComponentNavigationConfig from './ui-components.navigation.config'
import conceptsNavigationConfig from './concepts.navigation.config'
import authNavigationConfig from './auth.navigation.config'
import guideNavigationConfig from './guide.navigation.config'
import type { NavigationTree } from '@/@types/navigation'
import { ADMIN, USER } from '@/constants/roles.constant'
import { NAV_ITEM_TYPE_TITLE, NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import useAuth from '@/utils/hooks/useAuth'

const navigationConfig: NavigationTree[] = [
    
    {
        key: 'admins',
        path: '',
        title: 'مدیریت کاربران ',
        translateKey: 'مدیران کاربران',
        icon: 'accountRoleAndPermission',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN],
        meta: {
            horizontalMenu: {
                layout: 'default',
            },
        },
        subMenu: [
            {
                key: 'admins.list',
                path: '/admins',
                title: 'لیست مدیران',
                translateKey: 'nav.admins.list',
                icon: 'customerList',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
            {
                key: 'service-mens.list',
                path: '/repair-men',
                title: 'لیست تعمیرکاران',
                translateKey: 'nav.admins.list',
                icon: 'customerList',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
             {
                key: 'users.list',
                path: '/users',
                title: 'لیست مشتریان',
                translateKey: 'nav.admins.list',
                icon: 'customerList',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },

            // {
            //     key: 'admins.create',
            //     path: '/admins/create',
            //     title: 'ایجاد ادمین جدید',
            //     translateKey: 'nav.admins.create',
            //     icon: 'customerCreate',
            //     type: NAV_ITEM_TYPE_ITEM,
            //     authority: [ADMIN],
            //     subMenu: [],
            // },
            // {
            //     key: 'roles.list',
            //     path: '/roles',
            //     title: 'مدیریت نقش‌ها',
            //     translateKey: 'nav.roles.list',
            //     icon: 'TbShieldLock',
            //     type: NAV_ITEM_TYPE_ITEM,
            //     authority: [ADMIN],
            //     subMenu: [],
            // },
            // {
            //     key: 'roles.create',
            //     path: '/roles/create',
            //     title: 'ایجاد نقش جدید',
            //     translateKey: 'nav.roles.create',
            //     icon: 'TbShieldPlus',
            //     type: NAV_ITEM_TYPE_ITEM,
            //     authority: [ADMIN],
            //     subMenu: [],
            // },
           
        ],
    },
    {
        key: 'services',
        path: '',
        title: 'درخواست ها',
        translateKey: 'مدیریت درخواست ها',
        icon: 'uiFormsFormControl',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'default',
            },
        },
        subMenu: [
            {
                key: 'forms.list',
                path: '/services',
                title: 'لیست درخواست ها',
                translateKey: 'nav.forms.list',
                icon: 'uiDataDisplayTable',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'forms.create',
                path: '/invoices',
                title: 'فاکتور ها',
                translateKey: 'nav.forms.create',
                icon: 'uiFormsInput',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
            
            {
                key: 'forms.create',
                path: '/parts',
                title: 'لیست قطعات',
                translateKey: 'nav.forms.create',
                icon: 'uiFormsInput',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN],
                subMenu: [],
            },
        ],
    },
 
    //...dashboardsNavigationConfig,
    //...conceptsNavigationConfig,
    //...uiComponentNavigationConfig,
    // ...authNavigationConfig,
    // ...guideNavigationConfig,
]

export default navigationConfig
