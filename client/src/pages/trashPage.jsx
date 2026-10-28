import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { DUMMY_MEDIA } from '../assets/assets';
import Loading from '../components/common/loading';

export default function TrashPage() {
    const [trashItems, setTrashItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            // Demo trash items (e.g. items 8 to 11)
            setTrashItems(DUMMY_MEDIA.slice(8, 11));
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleRestore = (id) => {
        setTrashItems((prev) => prev.filter((item) => item._id !== id));
        toast.success('Restored to library');
    };

    const handleDeleteForever = (id) => {
        setTrashItems((prev) => prev.filter((item) => item._id !== id));
        toast.success('Permanently deleted');
    };

    const handleClearTrash = () => {
        if (window.confirm('Are you sure you want to permanently clear all items in the trash?')) {
            setTrashItems([]);
            toast.success('Trash emptied');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div>
                    <h2 className="text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-2">
                        <Trash2 className="size-6 text-red-500" />
                        Trash
                        {trashItems.length > 0 && (
                            <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                {trashItems.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Items in trash can be restored or permanently removed
                    </p>
                </div>
                {trashItems.length > 0 && (
                    <button
                        onClick={handleClearTrash}
                        className="flex items-center px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-full transition cursor-pointer"
                    >
                        <Trash2 className="size-4 mr-2" />
                        <span>Clear Trash</span>
                    </button>
                )}
            </div>

            {loading ? (
                <Loading className="py-20" />
            ) : trashItems.length === 0 ? (
                <div className="empty-state-card">
                    <h3 className="text-lg font-medium text-slate-800">Trash is empty</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Deleted photos and videos will be safely stored here before permanent removal.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {trashItems.map((item) => {
                        const isVideo =
                            item.mediaType === 'video' ||
                            item.format === 'mp4' ||
                            item.format === 'mov' ||
                            item.format === 'webm' ||
                            item.url?.endsWith('.mp4');

                        return (
                            <div
                                key={item._id}
                                className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 flex flex-col"
                            >
                                <div className="aspect-square relative overflow-hidden bg-slate-100">
                                    <img
                                        src={item.thumbnailUrl || item.url}
                                        alt={item.title}
                                        className="size-full object-cover"
                                    />
                                    {isVideo && (
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs text-white rounded text-[10px] font-medium pointer-events-none">
                                            <Play className="size-2.5 fill-white" />
                                            <span>Video</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2.5 flex items-center justify-between bg-white border-t border-slate-100">
                                    <span className="text-xs font-medium text-slate-700 truncate pr-2">
                                        {item.title}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleRestore(item._id)}
                                            className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg transition cursor-pointer"
                                            title="Restore to library"
                                        >
                                            <RotateCcw className="size-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteForever(item._id)}
                                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                                            title="Delete permanently"
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
