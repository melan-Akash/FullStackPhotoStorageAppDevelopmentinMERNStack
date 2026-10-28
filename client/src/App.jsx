import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/context';
import AuthPage from './pages/authPage';
import AppLayout from './components/layout/appLayout';
import PhotosPage from './pages/photosPage';
import FavoritePage from './pages/favoritePage';
import AlbumsPage from './pages/albumsPage';
import AlbumDetailPage from './pages/albumDetailPage';
import TrashPage from './pages/trashPage';
import Loading from './components/common/loading';

export default function App() {
    const { token, loading } = useAuth();

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <>
            <Toaster position="bottom-right" />
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />

                {/* If authenticated go to /photos, otherwise redirect to /login */}
                <Route
                    path="/"
                    element={token ? <Navigate to="/photos" replace /> : <Navigate to="/login" replace />}
                />

                <Route element={token ? <AppLayout /> : <Navigate to="/login" replace />}>
                    <Route path="/photos" element={<PhotosPage />} />
                    <Route path="/favorites" element={<FavoritePage />} />
                    <Route path="/albums" element={<AlbumsPage />} />
                    <Route path="/albums/:id" element={<AlbumDetailPage />} />
                    <Route path="/trash" element={<TrashPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}