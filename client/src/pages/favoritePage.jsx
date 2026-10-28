import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/context';
import Loading from '../components/common/loading';
import PhotoGrid from '../components/photos/photoGrid';
import PhotoLightbox from '../components/photos/photoLightbox';

export default function FavoritePage() {
    const { searchQuery } = useOutletContext() || {};
    const { fetchStats } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        try {
            const params = { favorite: 'true' };
            if (searchQuery && searchQuery.trim()) {
                params.query = searchQuery.trim();
            }
            const res = await api.get('/api/media', { params });
            setFavorites(res.data?.media || []);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFavorites();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchFavorites]);

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleToggleFavorite = async (id) => {
        try {
            await api.patch(`/api/media/${id}/favorite`);
            setFavorites((prev) => prev.filter((item) => item._id !== id));
            if (selectedPhoto?._id === id) {
                setSelectedPhoto(null);
            }
            toast.success('Removed from favorites');
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to update favorite status');
        }
    };

    const handleTrashPhoto = async (id) => {
        try {
            await api.patch(`/api/media/${id}/trash`, { restore: false });
            setFavorites((prev) => prev.filter((item) => item._id !== id));
            if (selectedPhoto?._id === id) {
                setSelectedPhoto(null);
            }
            toast.success('Moved to trash');
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to move photo to trash');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div>
                    <h2 className="text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-2">
                        Favorites
                        {favorites.length > 0 && (
                            <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                {favorites.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Your starred photos and videos for quick access
                    </p>
                </div>
            </div>

            {loading ? (
                <Loading className="py-20" />
            ) : favorites.length === 0 ? (
                <div className="empty-state-card">
                    <h3 className="text-lg font-medium text-slate-800">No favorites yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Click the star icon on any photo or video in your collection to add it to your favorites.
                    </p>
                </div>
            ) : (
                <PhotoGrid
                    photos={favorites}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectPhoto={(photo) => setSelectedPhoto(photo)}
                />
            )}

            <PhotoLightbox
                photos={favorites}
                currentPhoto={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                onToggleFavorite={handleToggleFavorite}
                onTrashPhoto={handleTrashPhoto}
            />
        </div>
    );
}
