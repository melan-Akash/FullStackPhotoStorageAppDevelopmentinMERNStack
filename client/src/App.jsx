import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/authPage';
import AppLayout from './components/layout/appLayout';
import PhotosPage from './pages/photosPage';
import FavoritePage from './pages/favoritePage';
import AlbumsPage from './pages/albumsPage';
import AlbumDetailPage from './pages/albumDetailPage';
import TrashPage from './pages/trashPage';

export default function App() {
    return (
        <>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#0f172a',
                        color: '#f8fafc',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                        padding: '12px 18px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />

                <Route element={<AppLayout />}>
                    <Route path="/" element={<PhotosPage />} />
                    <Route path="/photos" element={<PhotosPage />} />
                    <Route path="/favorites" element={<FavoritePage />} />
                    <Route path="/albums" element={<AlbumsPage />} />
                    <Route path="/albums/:id" element={<AlbumDetailPage />} />
                    <Route path="/trash" element={<TrashPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
   