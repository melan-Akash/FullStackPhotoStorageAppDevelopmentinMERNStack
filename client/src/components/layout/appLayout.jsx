import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
