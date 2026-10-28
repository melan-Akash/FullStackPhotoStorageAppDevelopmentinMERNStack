import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FolderPlus, Plus, Image, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DUMMY_ALBUMS_DATA } from '../assets/assets';
import Loading from '../components/common/loading';

export default function AlbumsPage() {
    const { openCreateAlbum } = useOutletContext() || {};
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setAlbums(DUMMY_ALBUMS_DATA);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleDeleteAlbum = (e, albumId) => {
        e.stopPropagation();
        setAlbums((prev) => prev.filter((a) => a._id !== albumId));
        toast.success('Album deleted');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div>
                    <h2 className="text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-2">
                        <FolderPlus className="size-6 text-red-600" />
                        Albums
                        {albums.length > 0 && (
                            <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                {albums.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Group your photos into beautiful stories
                    </p>
                </div>
                <button
                    onClick={() => openCreateAlbum?.()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full transition cursor-pointer"
                >
                    <Plus className="size-4" />
                    <span>New Album</span>
                </button>
            </div>

            {loading ? (
                <Loading className="py-20" />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    <div onClick={() => openCreateAlbum?.()} className="album-card-create">
                        <div className="size-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                            <Plus className="size-6" />
                        </div>
                        <span className="text-sm text-slate-700 group-hover:text-red-600 font-medium">
                            New Album
                        </span>
                    </div>

                    {albums.map((album) => {
                        const coverPhoto =
                            album.photos && album.photos.length > 0 ? album.photos[0] : null;
                        const coverUrl =
                            coverPhoto && typeof coverPhoto === 'object'
                                ? coverPhoto.thumbnailUrl || coverPhoto.url
                                : null;
                        const count = album.photos ? album.photos.length : 0;

                        return (
                            <div
                                key={album._id}
                                onClick={() => navigate(`/albums/${album._id}`)}
                                className="group album-card"
                            >
                                <div className="aspect-4/3 w-full bg-slate-100 relative overflow-hidden">
                                    {coverUrl ? (
                                        <img
                                            src={coverUrl}
                                            alt={album.title}
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="size-full flex flex-col items-center justify-center text-slate-300 bg-linear-to-br from-slate-100 to-slate-200/70">
                                            <Image className="size-10 mb-1" />
                                            <span className="text-[11px] font-medium text-slate-400">
                                                No photos yet
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 pb-3 py-2 flex items-center justify-between">
                                    <div className="truncate pr-2">
                                        <h4 className="text-slate-800 text-sm truncate group-hover:text-red-600 transition font-medium">
                                            {album.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {count} {count === 1 ? 'item' : 'items'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={(e) => handleDeleteAlbum(e, album._id)}
                                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                            title="Delete album"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
