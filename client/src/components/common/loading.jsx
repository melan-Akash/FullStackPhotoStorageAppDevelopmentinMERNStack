import { LoaderCircle } from 'lucide-react';

export default function Loading({ className = '', size = 'md', fullScreen = false, inline = false }) {
    const sizeMap = {
        xs: 'size-4',
        sm: 'size-6',
        md: 'size-8',
    };
    const resolvedSize = sizeMap[size] || sizeMap.md;

    if (inline) {
        return <LoaderCircle className={`${resolvedSize} animate-spin ${className || 'text-current'}`} />;
    }

    if (fullScreen) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-slate-50 ${className}`}>
                <LoaderCircle className={`${resolvedSize} animate-spin text-red-600`} />
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <LoaderCircle className={`${resolvedSize} animate-spin text-red-600`} />
        </div>
    );
}
