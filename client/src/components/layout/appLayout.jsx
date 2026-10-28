import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Image, Star, FolderPlus, Trash2 } from 'lucide-react';
import Navbar from './navbar';
import Sidebar from './sidebar';
import UploadModal from '../photos/uploadModel';
import CreateAlbumModel from '../albums/createAlbumModel';

export default function AppLayout() {
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [albumModal, setAlbumModal] = useState({ isOpen: false, photoIds: [] });
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleUploadSuccess = () => {
        window.dispatchEvent(new CustomEvent('media-uploaded'));
        window.dispatchEvent(new CustomEvent('photo-uploaded'));
    };

    const handleAlbumCreated = (album) => {
        setAlbumModal({ isOpen: false, photoIds: [] });
        navigate(`/albums/${album._id}`);
    };

    const handleOpenCreateAlbum = (photoIds = []) => {
        setAlbumModal({ isOpen: true, photoIds });
    };

    const bottomNavItems = [
        { to: '/', label: 'Photos', icon: Image },
        { to: '/favorites', label: 'Favorites', icon: Star },
        { to: '/albums', label: 'Albums', icon: FolderPlus },
        { to: '/trash', label: 'Trash', icon: Trash2 },
    ];

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            <Navbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onUploadClick={() => setUploadOpen(true)}
                onToggleSidebar={() => setMobileOpen((prev) => !prev)}
            />
            <div className="flex-1 flex overflow-hidden min-h-0 relative">
                <Sidebar
                    onCreateAlbumClick={() => handleOpenCreateAlbum()}
                    onUploadClick={() => setUploadOpen(true)}
                    isMobileOpen={mobileOpen}
                    onCloseMobile={() => setMobileOpen(false)}
                />
                <main className="app-main-content">
                    <Outlet
                        context={{
                            searchQuery,
                            onOpenUpload: () => setUploadOpen(true),
                            openCreateAlbum: handleOpenCreateAlbum,
                        }}
                    />
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around px-2 select-none shadow-xs">
                {bottomNavItems.map((item) => {
                    const IconComp = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center py-1 px-3 text-[11px] font-medium transition-colors ${
                                    isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'
                                }`
                            }
                        >
                            <IconComp className="size-5 mb-0.5" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <UploadModal
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            <CreateAlbumModel
                isOpen={albumModal.isOpen}
                onClose={() => setAlbumModal({ isOpen: false, photoIds: [] })}
                onAlbumCreated={handleAlbumCreated}
                initialPhotoIds={albumModal.photoIds}
            />
        </div>
    );
}
