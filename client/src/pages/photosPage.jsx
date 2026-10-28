import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Film, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { DUMMY_MEDIA } from '../assets/assets';
import Loading from '../components/common/loading';
import PhotoGrid from '../components/photos/photoGrid';
import PhotoLightbox from '../components/photos/photoLightbox';
import BulkSelectionBar from '../components/photos/bulkSelectionBar';

export default function PhotosPage() {
    const { searchQuery, onOpenUpload, openCreateAlbum } = useOutletContext();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            let result = [...DUMMY_MEDIA];

            if (filter === 'image') {
                result = result.filter((item) => item.mediaType === 'image');
            } else if (filter === 'video') {
                result = result.filter(
                    (item) => item.mediaType === 'video' || item.format === 'mp4'
                );
            }

            if (searchQuery && searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                result = result.filter(
                    (item) =>
                        item.title?.toLowerCase().includes(q) ||
                        item.objects?.some((obj) => obj.toLowerCase().includes(q))
                );
            }

            setPhotos(result);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, filter]);

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleToggleFavorite = (id) => {
        setPhotos((prev) =>
            prev.map((photo) =>
                photo._id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
            )
        );
        toast.success('Favorite status updated');
    };

    const handleTrashPhoto = (id) => {
        setPhotos((prev) => prev.filter((photo) => photo._id !== id));
        if (selectedPhoto?._id === id) {
            setSelectedPhoto(null);
        }
        toast.success('Moved to trash');
    };

    const handleBulkFavorite = () => {
        setPhotos((prev) =>
            prev.map((photo) =>
                selectedIds.includes(photo._id) ? { ...photo, isFavorite: true } : photo
            )
        );
        toast.success(`Marked ${selectedIds.length} item(s) as favorite`);
        setSelectedIds([]);
    };

    const handleBulkTrash = () => {
        setPhotos((prev) => prev.filter((photo) => !selectedIds.includes(photo._id)));
        toast.success(`Moved ${selectedIds.length} item(s) to trash`);
        setSelectedIds([]);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
                <div>
                    <h2 className="text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-2">
                        Photos & Videos
                        {photos.length > 0 && (
                            <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                {photos.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        All your preserved photos and videos, automatically organized by date
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
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
