import { useState, useEffect } from 'react';
import { Search, Filter, Play, Clock, MessageSquare, MoreVertical, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VideoLibrary() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/videos');
        if (response.ok) {
          const data = await response.json();
          const all = [...(data.active || []), ...(data.done || [])];
          setVideos(all);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this video? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-cb-orange" />
        <p>Opening Vault...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-6 pb-2">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Video Library</h1>
          <p className="text-gray-400 text-sm">All uploaded sequences and raw footage.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cb-orange/50 w-64"
            />
          </div>
          <button className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {filteredVideos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl p-20 text-center">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
            <Play size={40} className="text-gray-700" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No videos found</h2>
          <p className="text-gray-500 max-w-sm">No matches or the library is empty. Go to Projects to upload your first footage.</p>
          <button 
            onClick={() => navigate('/app/projects')}
            className="mt-6 btn-primary px-8 py-2"
          >
            Go to Kanban
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {filteredVideos.map((v) => (
            <div 
              key={v.id} 
              onClick={() => navigate(`/app/videos/${v.id}`)}
              className="glass-card group cursor-pointer hover:border-cb-orange/50 transition-all overflow-hidden flex flex-col"
            >
              <div className="aspect-video bg-gray-900 relative overflow-hidden">
                {/* Thumbnail Layer */}
                {v.thumbnailurl ? (
                  <img src={v.thumbnailurl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={32} className="text-gray-700 group-hover:text-cb-orange transition-colors" />
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1 backdrop-blur-sm">
                  <Clock size={10} /> {v.duration ? `${Math.floor(v.duration / 60)}:${Math.floor(v.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                </div>
                
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-cb-orange text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">v{v.versionnum}</span>
                  <button 
                    onClick={(e) => handleDelete(e, v.id)}
                    className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Video"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-white font-medium text-sm line-clamp-1 flex-1">{v.title}</h3>
                  <button className="text-gray-600 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </div>
                
                <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between text-gray-500 text-[10px]">
                  <div className="flex items-center gap-1"><MessageSquare size={12} /> 0</div>
                  <div className="font-mono">{new Date(v.createdat).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
