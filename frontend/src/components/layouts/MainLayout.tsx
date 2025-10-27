import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { HiOutlineMenuAlt1 } from 'react-icons/hi'
import { TbLayoutSidebarRight } from 'react-icons/tb'
import UserMenu from '@/components/shared/UserMenu'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Sidebar from '@/components/layouts/Sidebar'

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-sm">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="plain"
                                    size="sm"
                                    icon={sidebarOpen ? <TbLayoutSidebarRight /> : <HiOutlineMenuAlt1 />}
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                />
                                <h1 className="text-xl font-bold">سیستم مدیریت مطالعات بالینی</h1>
                            </div>
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4">
                    <Container>
                        <AdaptiveCard>
                            <Outlet />
                        </AdaptiveCard>
                    </Container>
                </main>
            </div>
        </div>
    )
}

export default MainLayout 