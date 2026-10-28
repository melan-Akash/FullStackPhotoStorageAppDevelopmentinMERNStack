import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/context';
import Loading from '../components/common/loading';
import PhotoGrid from '../components/photos/photoGrid';
import PhotoLightbox from '../components/photos/photoLightbox';
import AddPhotosModal from '../components/albums/addPhotosModal';

export default function AlbumDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchStats } = useAuth();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchAlbum = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/albums/${id}`);
            setAlbum(res.data?.album || null);
        } catch (error) {
            console.error('Failed to load album:', error);
            toast.error(error.response?.data?.message || 'Failed to load album');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAlbum();
    }, [fetchAlbum]);

    const handleRemoveFromAlbum = async (photoId) => {
        try {
            await api.delete(`/api/albums/${id}/photos/${photoId}`);
            setAlbum((prev) => ({
                ...prev,
                photos: prev.photos.filter((p) => p._id !== photoId),
            }));
            toast.success('Removed photo from album');
        } catch (error) {
            toast.error('Failed to remove photo from album');
        }
    };

    const handleToggleFavorite = async (photoId) => {
        try {
            const res = await api.patch(`/api/media/${photoId}/favorite`);
            const updated = res.data?.media;
            setAlbum((prev) => ({
                ...prev,
                photos: prev.photos.map((p) =>
                    p._id === photoId ? { ...p, isFavorite: updated?.isFavorite } : p
                ),
            }));
            if (selectedPhoto?._id === photoId && updated) {
                setSelectedPhoto((prev) => ({ ...prev, isFavorite: updated.isFavorite }));
            }
            toast.success(updated?.isFavorite ? 'Added to favorites ⭐' : 'Removed from favorites');
            fetchStats?.();
        } catch (error) {
            toast.error('Failed to update favorite status');
        }
    };

    const handleDeleteAlbum = async () => {
        if (
            !window.confirm(
                'Are you sure you want to delete this album? Photos inside will remain safe in your library.'
            )
        ) {
            return;
        }
        try {
            await api.delete(`/api/albums/${id}`);
            toast.success('Album deleted successfully');
            fetchStats?.();
            navigate('/albums');
        } catch (error) {
            toast.error('Failed to delete album');
        }
    };

    const handlePhotosAdded = async (addedPhotos) => {
        try {
            const photoIds = addedPhotos.map((p) => p._id);
            const res = await api.post(`/api/albums/${id}/photos`, { photoIds });
            if (res.data?.album) {
                setAlbum(res.data.album);
            } else {
                fetchAlbum();
            }
            toast.success(`Added ${photoIds.length} photo(s) to "${album?.title}"`);
        } catch (error) {
            toast.error('Failed to add photos to album');
        }
    };

    if (loading) {
        return <Loading className="py-20" />;
    }

    if (!album) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">Album not found</p>
                <button
                    onClick={() => navigate('/albums')}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-full text-xs"
                >
                    Back to Albums
                </button>
            </div>
        );
    }

    const existingPhotoIds = album.photos ? album.photos.map((p) => p._id) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/albums')}
                className="flex items-center gap-2 hover:bg-slate-100 rounded-full p-2 px-4 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
                <ArrowLeft className="size-3.5" />
                <span className="text-xs tracking-wider">Back to Albums</span>
            </button>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl text-slate-900 tracking-tight font-medium">
                            {album.title}
                        </h1>
                    </div>
                    {album.description && (
                        <p className="text-sm text-slate-600 max-w-xl">{album.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>
                            {album.photos?.length || 0} {album.photos?.length === 1 ? 'photo' : 'photos'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            Created {new Date(album.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-full transition cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Add Photos</span>
                    </button>
                    <button
                        onClick={handleDeleteAlbum}
                        className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition cursor-pointer"
                        title="Delete Album"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            {album.photos && album.photos.length > 0 ? (
                <PhotoGrid
                    photos={album.photos}
                    selectedIds={selectedIds}
                    onToggleSelect={(photoId) =>
                        setSelectedIds((prev) =>
                            prev.includes(photoId)
                                ? prev.filter((id) => id !== photoId)
                                : [...prev, photoId]
                        )
                    }
                    onToggleFavorite={handleToggleFavorite}
                    onSelectPhoto={(photo) => setSelectedPhoto(photo)}
                    onRemoveFromAlbum={handleRemoveFromAlbum}
                />
            ) : (
                <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto">
                    <h3 className="text-lg font-medium text-slate-800">Album is empty</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Add photos from your existing library to populate this album.
                    </p>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full transition cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Add Photos to Album</span>
                    </button>
                </div>
            )}

            <PhotoLightbox
                photos={album.photos || []}
                currentPhoto={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                onToggleFavorite={handleToggleFavorite}
                onTrashPhoto={(photoId) => handleRemoveFromAlbum(photoId)}
            />

            <AddPhotosModal
                isOpen={isAddOpen}
                albumId={album._id}
                existingPhotoIds={existingPhotoIds}
                onClose={() => setIsAddOpen(false)}
                onPhotosAdded={handlePhotosAdded}
            />
        </div>
    );
}
