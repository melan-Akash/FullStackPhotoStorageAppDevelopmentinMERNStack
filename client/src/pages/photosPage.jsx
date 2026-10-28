import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Film, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/context';
import Loading from '../components/common/loading';
import PhotoGrid from '../components/photos/photoGrid';
import PhotoLightbox from '../components/photos/photoLightbox';
import BulkSelectionBar from '../components/photos/bulkSelectionBar';

export default function PhotosPage() {
    const { searchQuery, onOpenUpload, openCreateAlbum } = useOutletContext();
    const { fetchStats } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchPhotos = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery && searchQuery.trim()) {
                params.query = searchQuery.trim();
            }
            if (filter !== 'all') {
                params.type = filter;
            }

            const res = await api.get('/api/media', { params });
            setPhotos(res.data?.media || []);
        } catch (error) {
            console.error('Failed to fetch media:', error);
            toast.error(error.response?.data?.message || 'Failed to load photos');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPhotos();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPhotos]);

    // Listen to media-uploaded events
    useEffect(() => {
        const handleUploaded = () => {
            fetchPhotos();
            fetchStats?.();
        };
        window.addEventListener('media-uploaded', handleUploaded);
        window.addEventListener('photo-uploaded', handleUploaded);
        return () => {
            window.removeEventListener('media-uploaded', handleUploaded);
            window.removeEventListener('photo-uploaded', handleUploaded);
        };
    }, [fetchPhotos, fetchStats]);

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleToggleFavorite = async (id) => {
        try {
            const res = await api.patch(`/api/media/${id}/favorite`);
            const updated = res.data?.media;
            setPhotos((prev) =>
                prev.map((photo) =>
                    photo._id === id ? { ...photo, isFavorite: updated?.isFavorite } : photo
                )
            );
            if (selectedPhoto?._id === id && updated) {
                setSelectedPhoto((prev) => ({ ...prev, isFavorite: updated.isFavorite }));
            }
            toast.success(updated?.isFavorite ? 'Added to favorites ⭐' : 'Removed from favorites');
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to update favorite status');
        }
    };

    const handleTrashPhoto = async (id) => {
        try {
            await api.patch(`/api/media/${id}/trash`, { restore: false });
            setPhotos((prev) => prev.filter((photo) => photo._id !== id));
            if (selectedPhoto?._id === id) {
                setSelectedPhoto(null);
            }
            toast.success('Moved to trash');
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to move photo to trash');
        }
    };

    const handleBulkFavorite = async () => {
        try {
            await Promise.all(selectedIds.map((id) => api.patch(`/api/media/${id}/favorite`)));
            setPhotos((prev) =>
                prev.map((photo) =>
                    selectedIds.includes(photo._id) ? { ...photo, isFavorite: true } : photo
                )
            );
            toast.success(`Updated ${selectedIds.length} item(s)`);
            setSelectedIds([]);
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to favorite selected items');
        }
    };

    const handleBulkTrash = async () => {
        try {
            await Promise.all(
                selectedIds.map((id) => api.patch(`/api/media/${id}/trash`, { restore: false }))
            );
            setPhotos((prev) => prev.filter((photo) => !selectedIds.includes(photo._id)));
            toast.success(`Moved ${selectedIds.length} item(s) to trash`);
            setSelectedIds([]);
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to move items to trash');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200/60">
                <div>
                    <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-2">
                        Photos & Videos
                        {photos.length > 0 && (
                            <span className="text-xs sm:text-sm font-semibold text-slate-400 bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-full">
                                {photos.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        All your preserved photos and videos, automatically organized by date
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
                    <div className="flex items-center bg-slate-100 p-1 rounded-full text-xs font-medium text-slate-600">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-full transition cursor-pointer ${
                                filter === 'all'
                                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                                    : 'hover:text-slate-900'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('image')}
                            className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                                filter === 'image'
                                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                                    : 'hover:text-slate-900'
                            }`}
                        >
                            <Image className="size-3" />
                            <span>Photos</span>
                        </button>
                        <button
                            onClick={() => setFilter('video')}
                            className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                                filter === 'video'
                                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                                    : 'hover:text-slate-900'
                            }`}
                        >
                            <Film className="size-3" />
                            <span>Videos</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <Loading className="py-20" />
            ) : photos.length === 0 ? (
                <div className="empty-state-card">
                    <h3 className="text-lg font-medium text-slate-800">
                        {searchQuery ? 'No matching media' : 'Your media library is empty'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        {searchQuery
                            ? `No media found for "${searchQuery}". Try a different keyword.`
                            : 'Upload high quality photos and videos from your computer.'}
                    </p>
                    <button
                        onClick={onOpenUpload}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full transition cursor-pointer"
                    >
                        <Upload className="size-4" />
                        <span>Upload Media Now</span>
                    </button>
                </div>
            ) : (
                <PhotoGrid
                    photos={photos}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectPhoto={(photo) => setSelectedPhoto(photo)}
                />
            )}

            <PhotoLightbox
                photos={photos}
                currentPhoto={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                onToggleFavorite={handleToggleFavorite}
                onTrashPhoto={handleTrashPhoto}
                onAddToAlbum={(photo) => openCreateAlbum?.([photo._id])}
            />

            <BulkSelectionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                onFavorite={handleBulkFavorite}
                onAddToAlbum={() => openCreateAlbum?.(selectedIds)}
                onTrash={handleBulkTrash}
            />
        </div>
    );
}
