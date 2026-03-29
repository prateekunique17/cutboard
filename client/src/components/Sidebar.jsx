import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Columns, Video, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'Projects / Kanban', icon: Columns, path: '/app/projects' },
    { name: 'Videos', icon: Video, path: '/app/videos' }
  ];

  return (
    <aside className="w-64 h-screen bg-cb-dark border-r border-gray-800 flex flex-col pt-6 pb-4">
      <div className="flex items-center space-x-3 px-6 mb-8 text-white">
        <Video size={30} className="text-cb-orange" />
        <span className="text-2xl font-bold tracking-wider">CutBoard</span>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {menu.map((item) => {
          const active = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/app');
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                active 
                  ? 'bg-gradient-to-r from-cb-orange/20 to-transparent text-cb-orange border-l-2 border-cb-orange'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <item.icon size={20} className={active ? 'text-cb-orange drop-shadow-[0_0_8px_rgba(245,92,26,0.8)]' : ''} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button 
          onClick={logout} 
          className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
