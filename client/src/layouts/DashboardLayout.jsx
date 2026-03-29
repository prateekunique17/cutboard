import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/useAuthStore';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-cb-black overflow-hidden font-sans text-gray-200">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto p-10 relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cb-orange opacity-[0.02] blur-[100px] pointer-events-none" />
        <div className="w-full max-w-7xl z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
