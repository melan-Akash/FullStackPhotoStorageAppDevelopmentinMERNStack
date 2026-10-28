import { Outlet } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div className="flex h-screen bg-white">
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

