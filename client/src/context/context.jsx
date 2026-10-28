import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        mediaCount: 0,
        imageCount: 0,
        videoCount: 0,
        favoriteCount: 0,
        totalBytes: 0,
        albumCount: 0,
    });

    // Verify token and fetch fresh user profile on initial mount
    const verifyUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/api/auth/me');
            if (res.data?.user) {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }
        } catch (error) {
            console.error('Failed to verify user session:', error);
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyUser();
    }, [verifyUser]);

    // Fetch storage stats
    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get('/api/media/stats');
            if (res.data) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token, fetchStats]);

    // Login action
    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        const { token: userToken, user: userData } = res.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    // Register action
    const register = async (name, email, password) => {
        const res = await api.post('/api/auth/register', { name, email, password });
        const { token: userToken, user: userData } = res.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    // Logout action
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
                user,
                loading,
                login,
                register,
                logout,
                stats,
                fetchStats,
                verifyUser,
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
            login: async () => {},
            register: async () => {},
            logout: () => {},
        };
    }
    return context;
}

export function useApp() {
    return useContext(AppContext);
}

export default AppContext;
