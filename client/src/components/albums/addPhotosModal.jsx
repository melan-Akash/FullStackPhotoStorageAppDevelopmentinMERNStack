import { useState, useEffect } from 'react';
import { X, Check, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { DUMMY_MEDIA } from '../../assets/assets';
import Loading from '../common/loading';

export default function AddPhotosModal({
    isOpen,
    albumId,
    existingPhotoIds = [],
    onClose,
    onPhotosAdded,
}) {
    const [availablePhotos, setAvailablePhotos] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setTimeout(() => {
                // Filter out photos already in the album
                const filtered = DUMMY_MEDIA.filter((p) => !existingPhotoIds.includes(p._id));
                setAvailablePhotos(filtered.length > 0 ? filtered : DUMMY_MEDIA);
                setSelectedIds([]);
                setLoading(false);
            }, 300);
        }
    }, [isOpen, existingPhotoIds]);

    if (!isOpen) return null;

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleAddSelected = async () => {
        if (selectedIds.length === 0) return;
        setAdding(true);
        try {
            const addedPhotos = DUMMY_MEDIA.filter((p) => selectedIds.includes(p._id));
            toast.success(`Added ${selectedIds.length} photo(s) to album`);
            onPhotosAdded?.(addedPhotos);
            onClose();
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-box-xl">
                <div className="modal-header">
                    <div className="flex items-center gap-2.5">
                        <h3 className="font-medium text-slate-800 text-base">
                            Add Photos to Album
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <Loading className="py-16" size="sm" />
                    ) : availablePhotos.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 space-y-2">
                            <p className="font-medium text-sm text-slate-600">
                                No additional photos available
                            </p>
                            <p className="text-xs">
                                All your photos are already in this album, or upload more photos first.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {availablePhotos.map((photo) => {
                                const isSelected = selectedIds.includes(photo._id);
                                const isVideo =
                                    photo.mediaType === 'video' ||
                                    photo.format === 'mp4' ||
                                    photo.format === 'mov' ||
                                    photo.format === 'webm' ||
                                    photo.url?.endsWith('.mp4');

                                return (
                                    <div
                                        key={photo._id}
                                        onClick={() => handleToggleSelect(photo._id)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                                            isSelected
                                                ? 'border-red-600'
                                                : 'border-transparent hover:border-slate-300'
                                        }`}
                                    >
                                        <img
                                            src={photo.thumbnailUrl || photo.url}
                                            alt={photo.title}
                                            className="size-full object-cover"
                                        />
                                        {isVideo && (
                                            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-white rounded text-[10px] font-medium pointer-events-none">
                                                <Play className="size-2.5 fill-white" />
                                                <span>Video</span>
                                            </div>
                                        )}
                                        <div
                                            className={`absolute top-2 right-2 size-6 rounded-full flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? 'bg-red-600 text-white scale-100'
                                                    : 'bg-black/40 text-transparent group-hover:text-white group-hover:bg-black/60'
                                            }`}
                                        >
                                            <Check className="size-3.5 stroke-3" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="modal-footer justify-between">
                    <span className="text-xs text-slate-600 font-medium">
                        {selectedIds.length} item(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={handleAddSelected}
                            disabled={adding || selectedIds.length === 0}
                            className="btn-primary"
                        >
                            {adding ? (
                                <Loading inline size="xs" />
                            ) : (
                                `Add Selected (${selectedIds.length})`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

