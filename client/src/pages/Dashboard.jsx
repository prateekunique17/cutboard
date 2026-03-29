import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Settings2, Users, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/videos/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="animate-spin text-cb-orange" size={40} />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col pt-8">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold mb-2 text-white">
          Welcome back, <span className="bg-gradient-to-r from-cb-orange to-cb-amber text-transparent bg-clip-text">{user?.name || 'Editor'}</span>
        </h1>
        <p className="text-gray-400">Here's what's happening in your studio today.</p>
      </header>

      {/* Stats & Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-black">
        <div 
          onClick={() => navigate('/app/projects')}
          className="glass-card p-6 flex flex-col justify-between cursor-pointer hover:border-cb-orange/50 transition-all group"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-gray-400 font-medium group-hover:text-cb-orange transition-colors">Active Projects</h3>
            <div className="p-2 bg-cb-orange/10 rounded-lg group-hover:bg-cb-orange/20">
              <Video className="text-cb-orange" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">{stats?.activeProjects || 0}</span>
            <span className="text-gray-400 text-sm ml-2 font-medium italic">Running</span>
          </div>
        </div>
        
        <div 
           onClick={() => navigate('/app/videos')}
           className="glass-card p-6 flex flex-col justify-between cursor-pointer hover:border-green-500/50 transition-all group"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-gray-400 font-medium group-hover:text-green-400">Finished Projects</h3>
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">{stats?.finishedProjects || 0}</span>
            <span className="text-gray-400 text-sm ml-2 font-medium italic">Completed</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/app/projects')}
            className="flex-1 bg-cb-orange hover:bg-cb-orange/90 text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-cb-orange/20"
          >
            📂 Go to Projects
          </button>
          <button 
            onClick={() => navigate('/app/videos')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-bold transition-all border border-gray-700 hover:border-gray-600"
          >
            🎞️ Video Library
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card flex-1 p-8 border border-gray-800/80">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Studio Activity</h2>
        <div className="space-y-6">
          {stats?.recentActivity?.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex space-x-4 pb-6 border-b border-gray-800 last:border-0">
                <div className="w-12 h-12 rounded-lg bg-cb-orange/10 flex items-center justify-center text-cb-orange">
                  {activity.action.includes('comment') ? <MessageSquare size={20} /> : <CheckCircle size={20} />}
                </div>
                <div>
                  <p className="text-white">
                    <span className="font-semibold text-cb-orange">{activity.user}</span> {activity.action} <span className="text-white font-medium">{activity.target}</span>
                  </p>
                  {activity.content && <p className="text-sm text-gray-400 mt-1 italic">"{activity.content}"</p>}
                  <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">{formatTimeAgo(activity.time)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
               <p className="text-gray-500 text-sm">No activity recorded yet in your studio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
