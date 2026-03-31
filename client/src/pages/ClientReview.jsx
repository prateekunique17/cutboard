import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Volume2, Maximize2, MessageSquare, Send, Loader2, Brain, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { supabase } from '../supabase';
import { SOCKET_URL } from '../config';

const socket = io(SOCKET_URL); 

export default function ClientReview() {
  const { id: videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); 
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [markers, setMarkers] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const { data: video, error } = await supabase
          .from('videoversion')
          .select('*')
          .eq('id', videoId)
          .single();

        if (error) throw error;
        if (video) {
          setVideoData(video);
          
          // Fetch markers
          const { data: markersData, error: mError } = await supabase
            .from('marker')
            .select('*')
            .eq('videoid', videoId)
            .order('timestamp', { ascending: true });

          if (!mError) setMarkers(markersData);
        }
      } catch (err) {
        console.error("Failed to fetch shared video directly from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
      socket.emit('joinVideo', videoId);
    }

    const handleNewComment = (newComment) => {
      setComments((prev) => {
        if (prev.find(c => c.id === newComment.id)) return prev;
        return [...prev, newComment].sort((a, b) => a.time - b.time);
      });
    };

    socket.on('receive_comment', handleNewComment);
    return () => socket.off('receive_comment', handleNewComment);
  }, [videoId]);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    socket.emit('new_comment', {
      videoId,
      user: 'Client',
      text: commentText,
      time: currentTime,
      type: 'comment'
    });
    setCommentText('');
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505] text-white">
      <Loader2 className="animate-spin text-cb-orange" size={40} />
    </div>
  );

  if (!videoData) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-10 text-center">
      <h2 className="text-3xl font-black mb-4">Link Expired or Invalid</h2>
      <p className="text-gray-500 max-w-md">Please contact your project manager for a new share link.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {/* Client Brand Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-cb-orange rounded-lg flex items-center justify-center font-black text-black text-sm italic">C</div>
          <div className="h-4 w-px bg-white/10"></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{videoData.originalname}</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Client Review Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-bold text-cb-orange bg-cb-orange/10 px-3 py-1 rounded-full uppercase">Review Request Open</span>
        </div>
      </header>

      {/* Main Review Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Playback Side */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex-1 bg-black rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
            <video 
              ref={videoRef}
              src={videoData.videourl}
              className="w-full h-full object-contain"
              onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
            />
            
            {/* Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
              <div 
                className="w-full h-1.5 bg-white/10 rounded-full mb-6 cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
                }}
              >
                <div className="absolute top-0 left-0 h-full bg-cb-orange rounded-full" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                {markers.map(m => (
                  <div 
                    key={m.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white/40 rounded-full"
                    style={{ left: `${(m.timestamp/duration)*100}%` }}
                  ></div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button onClick={() => { if(isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); }}>
                    {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                  </button>
                  <Volume2 size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                  <span className="font-mono text-sm text-gray-300">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <Maximize2 size={22} className="text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="h-16 mt-6 flex items-center justify-center gap-3">
             <button className="bg-white/5 border border-white/10 text-white font-bold py-3 px-8 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Approve Concept
             </button>
             <button className="bg-cb-orange/10 border border-cb-orange/20 text-cb-orange font-bold py-3 px-8 rounded-2xl hover:bg-cb-orange/20 transition-all flex items-center gap-2">
                <MessageSquare size={18} /> Request Changes
             </button>
          </div>
        </div>

        {/* Comment Side */}
        <div className="w-[400px] border-l border-white/5 flex flex-col bg-white/[0.02] backdrop-blur-3xl shrink-0">
          <div className="p-6 border-b border-white/5">
             <h3 className="text-lg font-bold">Feedback Feed</h3>
             <p className="text-[10px] text-gray-500 uppercase font-black mt-1">Leave comments on the timeline</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Markers (Internal Audit shown to Client) */}
            {markers.length > 0 && <div className="text-[10px] font-bold text-cb-orange uppercase mb-2 px-2">Director's Notes</div>}
            {markers.map(m => (
              <div key={m.id} className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 scale-95 opacity-80">
                 <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 font-mono">
                    {m.type === 'AI_ERROR' ? <AlertCircle size={12} className="text-red-500" /> : <CheckCircle size={12} className="text-green-500" />}
                    {formatTime(m.timestamp)}
                 </div>
                 <p className="text-xs text-gray-300 leading-relaxed font-medium">{m.content}</p>
              </div>
            ))}

            <div className="h-px bg-white/5 my-4"></div>

            {comments.map((c) => (
              <div key={c.id} className="p-4 rounded-3xl bg-white/[0.05] border border-white/10 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{c.user} <span className="text-[10px] font-normal text-gray-500 ml-1">{formatTime(c.time)}</span></span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 bg-black/60">
             <div className="relative">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Click play and then type your feedback..."
                  className="w-full bg-[#101010] border border-white/10 rounded-3xl p-5 text-sm text-white focus:outline-none focus:border-cb-orange/50 transition-all h-32 resize-none shadow-inner"
                ></textarea>
                <div className="absolute bottom-4 right-4 text-[10px] text-gray-500 font-bold">
                   at {formatTime(currentTime)}
                </div>
             </div>
             <button onClick={handleSendComment} className="w-full mt-4 bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5">
                <Send size={18} /> Submit Feedback
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
