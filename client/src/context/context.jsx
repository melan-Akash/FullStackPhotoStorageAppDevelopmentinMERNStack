import { createContext, useContext, useState, useEffect } from 'react';
import { DUMMY_MEDIA, DUMMY_STATS, DUMMY_ALBUMS_DATA } from '../assets/assets';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : { name: 'GreatStack', email: 'user.greatstack@gmail.com' };
    });
    const [loading, setLoading] = useState(false);
    const [media, setMedia] = useState(DUMMY_MEDIA);
    const [albums, setAlbums] = useState(DUMMY_ALBUMS_DATA);
    const [stats, setStats] = useState(DUMMY_STATS);

    const login = (userData, userToken = 'dummy-token') => {
        setToken(userToken);
        const resolvedUser = userData || { name: 'GreatStack', email: 'user.greatstack@gmail.com' };
        setUser(resolvedUser);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(resolvedUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AppContext.Provider
            value={{
                token,
                setToken,
                user,
                setUser,
                loading,
                login,
                logout,
                media,
                setMedia,
                albums,
                setAlbums,
                stats,
                setStats,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AppContext);
    if (!context) {
        return {
            token: null,
            user: null,
            loading: false,
            login: () => {},
            logout: () => {},
        };
    }
    return context;
}

export function useApp() {
    return useContext(AppContext);
}

export default AppContext;

