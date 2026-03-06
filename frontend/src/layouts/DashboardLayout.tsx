import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'

interface DashboardLayoutProps {
    onLogout: () => void
}

export function DashboardLayout({ onLogout }: DashboardLayoutProps) {
    const navigate = useNavigate()
    const location = useLocation()

    // Extract the current path for active tab matching (e.g. "/sales" -> "sales")
    const pathname = location.pathname.substring(1)

    const handleTabChange = (tab: string) => {
        navigate(`/${tab}`)
    }

    const handleStoreChange = (_storeId: string, _storeName: string) => {
        // Reload the page so all data-fetching components pick up the new store
        window.location.reload()
    }

    return (
        <div
            className="h-screen flex overflow-hidden"
            style={{ background: 'var(--background)' }}
        >
            {/* Decorative background glows */}
            <div
                className="fixed top-0 left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-[0.04] blur-[120px]"
                style={{ background: '#3B82F6' }}
            />
            <div
                className="fixed bottom-0 right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.04] blur-[120px]"
                style={{ background: '#8B5CF6' }}
            />

            <Sidebar activeTab={pathname || 'dashboard'} onTabChange={handleTabChange} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <TopBar onLogout={onLogout} onStoreChange={handleStoreChange} />
                <main className="flex-1 flex overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
