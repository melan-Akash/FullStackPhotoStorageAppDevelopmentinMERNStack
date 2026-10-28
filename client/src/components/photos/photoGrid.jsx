import { useMemo } from 'react';
import { CircleCheck } from 'lucide-react';
import PhotoCard from './photoCard';

export default function PhotoGrid({
    photos,
    selectedIds,
    onToggleSelect,
    onToggleFavorite,
    onSelectPhoto,
    onRemoveFromAlbum,
}) {
    const groupedPhotos = useMemo(() => {
        const groups = {};
        const todayStr = new Date().toDateString();
        const yesterdayStr = new Date(Date.now() - 864e5).toDateString();

        photos.forEach((photo) => {
            const date = new Date(photo.createdAt);
            const dateStr = date.toDateString();
            let label = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
            if (dateStr === todayStr) label = 'Today';
            else if (dateStr === yesterdayStr) label = 'Yesterday';

            if (!groups[label]) groups[label] = [];
            groups[label].push(photo);
        });

        return groups;
    }, [photos]);

    const handleSelectDay = (dayPhotos) => {
        const allSelected = dayPhotos.every((p) => selectedIds.includes(p._id));
        dayPhotos.forEach((p) => {
            if ((allSelected && selectedIds.includes(p._id)) || (!allSelected && !selectedIds.includes(p._id))) {
                onToggleSelect(p._id);
            }
        });
    };

    if (photos.length === 0) return null;

    return (
        <div className="space-y-8 pb-16">
            {Object.entries(groupedPhotos).map(([dateLabel, dayPhotos]) => {
                const isAllDaySelected =
                    dayPhotos.length > 0 && dayPhotos.every((p) => selectedIds.includes(p._id));

                return (
                    <div key={dateLabel} className="space-y-3">
                        <div className="flex items-center gap-2 backdrop-blur-xs py-2 z-20">
                            <button
                                onClick={() => handleSelectDay(dayPhotos)}
                                className={`group/btn flex items-center gap-2 text-sm font-medium tracking-tight transition cursor-pointer ${
                                    isAllDaySelected
                                        ? 'text-red-600'
                                        : 'text-slate-800 hover:text-red-600'
                                }`}
                                title="Select all in this day"
                            >
                                <span className="size-5 rounded-full border border-slate-300 group-hover/btn:border-red-500 flex items-center justify-center text-xs">
                                    <CircleCheck
                                        className={`size-4 transition ${
                                            isAllDaySelected
                                                ? 'text-red-600 fill-red-100'
                                                : 'text-transparent group-hover/btn:text-slate-300'
                                        }`}
                                    />
                                </span>
                                <span>{dateLabel}</span>
                            </button>
                            <span className="text-xs text-slate-400 font-medium">
                                ({dayPhotos.length})
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {dayPhotos.map((photo) => (
                                <PhotoCard
                                    key={photo._id}
                                    photo={photo}
                                    isSelected={selectedIds.includes(photo._id)}
                                    onToggleSelect={() => onToggleSelect(photo._id)}
                                    onToggleFavorite={() => onToggleFavorite(photo._id)}
                                    onClick={() => onSelectPhoto(photo)}
                                    onRemoveFromAlbum={
                                        onRemoveFromAlbum ? () => onRemoveFromAlbum(photo._id) : undefined
                                    }
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

