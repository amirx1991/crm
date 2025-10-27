import { ComponentType } from 'react'
import { PageHeaderProps } from '@/components/shared/PageHeader'
import { LayoutType } from './theme'

export type Meta = {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    pageBackgroundType?: 'default' | 'plain'
    header?: PageHeaderProps
    footer?: boolean
    layout?: LayoutType
}

export type Route = {
    key: string
    path: string
    component: ComponentType
    authority: string[]
    children?: Route[]
    meta?: Meta
}

export type Routes = Route[] 