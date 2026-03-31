import { useState, useEffect } from 'react';
import { Search, Play, Clock, Loader2, Trash2, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

export default function VideoLibrary() {
  const [videos, setVideos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode]       = useState('grid'); // 'grid' | 'list'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/videos`);
        if (res.ok) {
          const data = await res.json();
          setVideos([...(data.active || []), ...(data.done || [])]);
        }
      } catch (err) {
        console.error('Fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this video? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const fmtDuration = (d) => {
    if (!d) return '0:00';
    const mins = Math.floor(d / 60);
    const secs = Math.floor(d % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-cb-dim" strokeWidth={1.5} />
          <p className="text-xs text-cb-faint font-mono tracking-widest uppercase">Loading library…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-cb-text leading-none mb-1">
            Video Library
          </h1>
          <p className="text-xs text-cb-faint font-mono">
            {filtered.length} video{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cb-faint" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cb-surface border border-cb-border rounded-lg pl-8 pr-4 py-2 text-xs text-cb-text placeholder:text-cb-faint focus:outline-none focus:border-cb-subtle transition-colors w-52"
            />
          </div>

          {/* View toggle */}
          <div className="flex border border-cb-border rounded-lg overflow-hidden">
            {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 transition-colors ${
                  viewMode === mode
                    ? 'bg-cb-muted text-cb-text'
                    : 'text-cb-faint hover:text-cb-dim'
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-cb-border rounded-xl text-center py-20">
          <div className="w-12 h-12 rounded-xl border border-cb-border bg-cb-panel flex items-center justify-center mb-4">
            <Play size={20} className="text-cb-faint" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-cb-text mb-1">No videos found</p>
          <p className="text-xs text-cb-faint mb-5">
            {searchQuery ? 'Try a different search term.' : 'Upload your first footage on the board.'}
          </p>
          {!searchQuery && (
            <button onClick={() => navigate('/app/projects')} className="btn-ghost text-xs">
              Go to Board
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
          <AnimatePresence>
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/app/videos/${v.id}`)}
                className="card card-hover group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="aspect-video bg-cb-muted relative overflow-hidden">
                  {v.thumbnailurl ? (
                    <img
                      src={v.thumbnailurl}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                      alt=""
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={24} className="text-cb-faint group-hover:text-cb-dim transition-colors" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-cb-panel/60 to-transparent" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-cb-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-cb-dim backdrop-blur-sm">
                    <Clock size={9} />
                    {fmtDuration(v.duration)}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, v.id)}
                    className="absolute top-2 right-2 p-1.5 bg-cb-red/80 hover:bg-cb-red text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={11} strokeWidth={2} />
                  </button>
                </div>

                <div className="p-3 flex flex-col gap-1">
                  <h3 className="text-[13px] font-medium text-cb-text truncate">{v.title}</h3>
                  <p className="text-[10px] font-mono text-cb-faint">
                    {new Date(v.createdat).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List */
        <div className="flex flex-col divide-y divide-cb-border border border-cb-border rounded-xl overflow-hidden">
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/app/videos/${v.id}`)}
              className="flex items-center gap-4 px-4 py-3 bg-cb-surface hover:bg-cb-panel cursor-pointer group transition-colors"
            >
              <div className="w-16 h-10 rounded-md bg-cb-muted relative overflow-hidden shrink-0">
                {v.thumbnailurl
                  ? <img src={v.thumbnailurl} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" alt="" />
                  : <Play size={14} className="absolute inset-0 m-auto text-cb-faint" strokeWidth={1.5} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-cb-text truncate">{v.title}</p>
                <p className="text-[10px] font-mono text-cb-faint mt-0.5">{new Date(v.createdat).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-cb-faint shrink-0">
                <Clock size={10} strokeWidth={1.8} />
                {fmtDuration(v.duration)}
              </div>
              <button
                onClick={(e) => handleDelete(e, v.id)}
                className="shrink-0 p-1.5 text-cb-faint hover:text-cb-red transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
