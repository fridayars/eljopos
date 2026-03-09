import { Users } from 'lucide-react'

export function UsersPage() {
    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)' }}>
             {/* Header */}
            <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}
                    >
                        <Users className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>User</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Kelola akses pengguna
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="text-center bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 max-w-md w-full">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center"
                             style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' }}
                        >
                             <Users className="w-10 h-10 opacity-70" style={{ color: '#8B5CF6' }} />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Segera Hadir</h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        Fitur manajemen User saat ini sedang dalam tahap pengembangan.
                    </p>
                </div>
            </div>
            
            {/* Decorative background glows */}
            <div
                className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.03] blur-[80px]"
                style={{ background: '#8B5CF6' }}
            />
            <div
                className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.03] blur-[80px]"
                style={{ background: '#3B82F6' }}
            />
        </div>
    )
}
