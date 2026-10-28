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
            <Toaster position="bottom-right" />
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

}   