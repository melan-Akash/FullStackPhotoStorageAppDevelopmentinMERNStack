import { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';
import { useAuth } from '../../context/context';

export default function CreateAlbumModel({
    isOpen,
    onClose,
    onAlbumCreated,
    initialPhotoIds = [],
}) {
    const { fetchStats } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/api/albums', {
                title: title.trim(),
                description: description.trim(),
                photoIds: initialPhotoIds,
            });
            const newAlbum = res.data?.album;
            toast.success(`Album "${title}" created successfully`);
            fetchStats?.();
            handleClose();
            onAlbumCreated?.(newAlbum);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create album');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setLoading(false);
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-box-md">
                <div className="modal-header">
                    <div className="flex items-center">
                        <FolderPlus className="size-5 text-red-600 mx-3" />
                        <h3 className="font-medium text-slate-700 text-base">New Album</h3>
                    </div>
                    <button onClick={handleClose} className="p-1.5 cursor-pointer">
                        <X className="size-5 text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 tracking-wider mb-1.5">
                            Album Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Summer Vacation 2026"
                            autoFocus
                            required
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a short note about this album..."
                            rows={3}
                            className="form-input resize-none"
                        />
                    </div>

                    {initialPhotoIds.length > 0 && (
                        <p className="text-xs text-orange-700">
                            {initialPhotoIds.length} photo(s) will be added automatically
                        </p>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button type="button" onClick={handleClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="btn-primary"
                        >
                            {loading ? 'Creating...' : 'Create Album'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
