import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X, Sparkle, Upload, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/context';

export default function Navbar({
    searchQuery,
    onSearchChange,
    onUploadClick,
    onToggleSidebar,
}) {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'GS';

    const handleSignOut = () => {
        setDropdownOpen(false);
        if (logout) logout();
        toast.success('Signed out successfully');
        navigate('/login');
    };

    return (
        <>
            <div className="bg-black text-white text-center text-sm p-1">
                This is a sample UI platform designed exclusively for testing and prototyping.
            </div>
            <header className="navbar-header">
                <div className="navbar-brand">
                    <button
                        onClick={onToggleSidebar}
                        className="navbar-menu-btn"
                        title="Toggle menu"
                        aria-label="Toggle navigation menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <img src="/logo.png" alt="" className="size-8" />
                    <h1 className="navbar-brand-text">MY PHOTOS</h1>
                </div>

                <div className="flex-1 max-w-2xl relative">
                    <div className="navbar-search-wrapper">
                        <Search className="size-4 text-slate-500 shrink-0 mr-2 sm:mr-3" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search photos, videos..."
                            className="navbar-search-input"
                        />
                        {searchQuery ? (
                            <button
                                onClick={() => onSearchChange('')}
                                className="hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                            >
                                <X className="size-3.5 sm:size-4 text-slate-800" />
                            </button>
                        ) : (
                            <div className="navbar-ai-badge">
                                AI-Powered Search{' '}
                                <Sparkle className="size-3.5 animate-spin text-slate-600 shrink-0" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={onUploadClick}
                        className="navbar-upload-btn"
                        title="Upload photos & videos"
                    >
                        <Upload className="size-3.5" />
                        <span className="hidden sm:inline">Upload</span>
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className="navbar-avatar-btn"
                            title={user?.name || 'Account'}
                        >
                            {initials}
                        </button>

                        {dropdownOpen && (
                            <div className="navbar-dropdown">
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <p className="font-medium text-slate-800 text-sm truncate">
                                        {user?.name || 'GreatStack'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {user?.email || 'user.greatstack@gmail.com'}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={handleSignOut}
                                        className="navbar-logout-btn"
                                    >
                                        <LogOut className="size-3.5" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

