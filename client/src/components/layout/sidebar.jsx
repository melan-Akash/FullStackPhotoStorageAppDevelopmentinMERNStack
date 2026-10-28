import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Star, FolderPlus, Trash2, Plus, X, HardDrive } from 'lucide-react';
import { useAuth } from '../../context/context';

export default function Sidebar({
    onCreateAlbumClick,
    onUploadClick,
    isMobileOpen = false,
    onCloseMobile,
}) {
    const { stats, fetchStats } = useAuth();

    useEffect(() => {
        fetchStats?.();
    }, [fetchStats]);

    const navItems = [
        { to: '/', label: 'Photos & Videos', icon: Image },
        { to: '/favorites', label: 'Favorites', icon: Star },
        { to: '/albums', label: 'Albums', icon: FolderPlus },
        { to: '/trash', label: 'Trash', icon: Trash2 },
    ];

    const usedMB = stats?.totalBytes ? (stats.totalBytes / 1048576).toFixed(1) : '0.0';
    const percent = stats?.totalBytes
        ? Math.min(100, Math.max(3, Math.round((stats.totalBytes / 104857600) * 100)))
        : 2;

    return (
        <>
            {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
            <aside
                className={`sidebar-container ${isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile-closed'}`}
            >
                <div className="sidebar-mobile-header">
                    <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="" className="size-7" />
                        <span className="font-heading font-semibold text-slate-800 tracking-tight text-base">
                            MY PHOTOS
                        </span>
                    </div>
                    <button
                        onClick={onCloseMobile}
                        className="sidebar-close-btn"
                        title="Close menu"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                onCloseMobile?.();
                                onUploadClick?.();
                            }}
                            className="sidebar-action-btn"
                        >
                            <Plus className="size-4" />
                            <span>Upload Photos</span>
                        </button>
                        <button
                            onClick={() => {
                                onCloseMobile?.();
                                onCreateAlbumClick?.();
                            }}
                            className="sidebar-action-btn"
                        >
                            <FolderPlus className="size-4" />
                            <span>Create Album</span>
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    onClick={() => onCloseMobile?.()}
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'}`
                                    }
                                >
                                    <IconComponent className="size-5 shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="sidebar-storage-card">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-700">
                            <HardDrive className="size-4 text-red-500" />
                            Storage
                        </span>
                        <span className="font-medium text-slate-900">{usedMB} MB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="sidebar-storage-bar" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{stats?.mediaCount ?? stats?.photoCount ?? 0} media saved</span>
                        {stats?.videoCount ? <span>{stats.videoCount} videos</span> : null}
                    </div>
                </div>
            </aside>
        </>
    );
}

