import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize2, MessageSquare, Scissors, Smile, Download, ArrowLeft, Loader2, X, Brain, CheckCircle, AlertTriangle, AlertCircle, Share2, Copy } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('cutboard-production.up.railway.app'); 

export default function VideoReview() {
  const { id: videoId } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); 
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [markers, setMarkers] = useState([]);
  
  // AI Audit States
  const [showAIModal, setShowAIModal] = useState(false);
  const [brief, setBrief] = useState("");
  const [scanning, setScanning] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  // Audio States
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(`cutboard-production.up.railway.app/api/videos`);
        if (response.ok) {
          const data = await response.json();
          const allVideos = [...(data.active || []), ...(data.done || [])];
          const found = allVideos.find(v => v.id === videoId);
          if (found) {
            setVideoData(found);
            setDuration(prev => prev || found.duration || 0);

            // Fetch markers (AI)
            const mRes = await fetch(`cutboard-production.up.railway.app/api/videos/${videoId}/markers`);
            if (mRes.ok) {
              const mData = await mRes.json();
              setMarkers(mData);
            }

            // Fetch user comments/cuts
            const cRes = await fetch(`cutboard-production.up.railway.app/api/videos/${videoId}/comments`);
            if (cRes.ok) {
              const cData = await cRes.json();
              setComments(cData.map(c => ({
                id: c.id,
                user: 'You', 
                text: c.content,
                time: c.timestamp,
                type: c.content.includes('✂️') ? 'cut' : 'comment'
              })));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch video details");
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
    
    return () => {
      socket.off('receive_comment', handleNewComment);
    };
  }, [videoId]);

  const handleRunAIScan = async () => {
    if (!brief.trim()) return;
    setScanning(true);
    try {
      const res = await fetch('cutboard-production.up.railway.app/api/ai/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, brief })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        const newMarkers = data.points.map((p, i) => ({
          id: `ai-${Date.now()}-${i}`,
          type: p.type === 'error' ? 'AI_ERROR' : (p.type === 'warning' ? 'AI_WARNING' : 'AI_SUCCESS'),
          content: p.message,
          timestamp: p.time
        }));
        setMarkers(prev => [...prev, ...newMarkers]);
        setShowAIModal(false);
      }
    } catch (err) {
      console.error("AI Scan failed", err);
    } finally {
      setScanning(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-cb-dark text-white">
      <Loader2 className="animate-spin text-cb-orange" size={40} />
    </div>
  );

  if (!videoData && !loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-cb-dark text-white p-10">
      <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
      <button onClick={() => navigate('/app/projects')} className="btn-primary px-6 py-2">Back to Projects</button>
    </div>
  );

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    socket.emit('new_comment', {
      videoId,
      user: 'You',
      text: commentText,
      time: currentTime,
      type: 'comment'
    });
    setCommentText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleMarkCut = () => {
    socket.emit('new_comment', {
      videoId,
      user: 'You',
      text: '✂️ Cut marked',
      time: currentTime,
      type: 'cut'
    });
  };

  const handleTimestampComment = () => {
    const ts = `[${formatTime(currentTime)}] `;
    setCommentText(prev => ts + prev);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.log("Playback interrupted/prevented:", error.message);
          });
      }
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60 || 0);
    const sec = Math.floor(seconds % 60 || 0);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleApprove = async () => {
    if (!window.confirm("Approve this project? This will move it to the Finished column.")) return;
    try {
      const res = await fetch('cutboard-production.up.railway.app/api/videos/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: videoData.cardId, status: 'done' })
      });
      if (res.ok) {
        navigate('/app/projects');
      }
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const handleExport = () => {
    // 1. Trigger Video Download
    const link = document.createElement('a');
    link.href = videoData.videourl;
    link.setAttribute('download', `${videoData.title}.mp4`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Generate and Download Audit Log (TXT)
    const auditText = `CREATIVE AUDIT REPORT: ${videoData.title}\n` +
                     `Date: ${new Date().toLocaleDateString()}\n` +
                     `Version: ${videoData.versionnum}\n` +
                     `------------------------------------------\n\n` +
                     `AI SCAN POINTS:\n` +
                     markers.filter(m => m.type.startsWith('AI_')).map(m => `[${formatTime(m.timestamp)}] ${m.type.replace('AI_', '')}: ${m.content}`).join('\n') +
                     '\n\nUSER FEEDBACK & CUTS:\n' +
                     comments.map(c => `[${formatTime(c.time)}] ${c.user}: ${c.text}`).join('\n');
    
    const blob = new Blob([auditText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoData.title}_audit_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col -m-10 p-4 relative"> 
      
      {/* AI Brief Modal */}
      {showAIModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-cb-dark border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cb-orange/10 flex items-center justify-center text-cb-orange">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Creative Audit</h3>
                  <p className="text-xs text-gray-500">Paste your brief to scan for compliance.</p>
                </div>
              </div>
              <button onClick={() => !scanning && setShowAIModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Creative Brief / Requirements</label>
              <textarea 
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Example: Must be 30s long. Brand logo must appear in first 5s. Tone should be high-energy Nike style..."
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cb-orange/50 h-40 resize-none transition-all"
              ></textarea>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setShowAIModal(false)}
                  disabled={scanning}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRunAIScan}
                  disabled={scanning || !brief.trim()}
                  className="flex-[2] py-3 bg-cb-orange hover:bg-cb-orange-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-cb-orange/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {scanning ? (
                    <> <Loader2 className="animate-spin" size={20} /> Analyzing Frames... </>
                  ) : (
                    <> <Brain size={20} /> Run AI Audit </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-4 px-6 py-2 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/app/projects')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={18} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {videoData.title || videoData.originalname} 
              <span className="bg-cb-orange/20 text-cb-orange text-xs px-2 py-0.5 rounded uppercase tracking-wider">
                 {videoData.status?.replace('_', ' ') || 'ACTIVE'}
              </span>
            </h1>
            <p className="text-sm text-gray-400">Version {videoData.versionnum} • {new Date(videoData.createdat).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 bg-cb-orange/10 hover:bg-cb-orange/20 text-cb-orange border border-cb-orange/30 px-4 py-2 rounded-xl transition-all"
          >
            <Brain size={18} />
            <span className="text-sm font-bold uppercase tracking-tight">AI Brief Scan</span>
          </button>

          <button 
            onClick={() => {
              const url = `${window.location.origin}/share/${videoId}`;
              navigator.clipboard.writeText(url);
              setShowCopyToast(true);
              setTimeout(() => setShowCopyToast(false), 2000);
            }}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl transition-all relative"
          >
            {showCopyToast ? <CheckCircle size={18} className="text-green-500" /> : <Share2 size={18} />}
            <span className="text-sm font-bold">{showCopyToast ? "Link Copied!" : "Share Link"}</span>
          </button>

          <button 
            onClick={handleExport}
            className="btn-primary px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 shadow-none"
          >
            Export
          </button>
          <button 
            onClick={handleApprove}
            className="btn-primary px-4 py-2 text-sm"
          >
            Approve
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col px-6">
          <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center group">
            <video 
              ref={videoRef}
              src={videoData.videourl}
              className="w-full h-full object-contain cursor-pointer"
              onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
              onLoadedMetadata={(e) => {
                const realDuration = e.target.duration;
                if (realDuration && realDuration > 0) {
                  setDuration(realDuration);
                }
              }}
              onClick={handlePlayPause}
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col transition-opacity opacity-0 group-hover:opacity-100 z-20">
              <div 
                className="relative w-full h-1.5 bg-gray-600 rounded-full mb-4 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  videoRef.current.currentTime = (x / rect.width) * duration;
                }}
              >
                <div className="absolute top-0 left-0 h-full bg-cb-orange rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-cb-orange" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
                
                {/* AI Markers on Timeline */}
                {markers.map(m => (
                  <div 
                    key={m.id}
                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded-sm cursor-help hover:scale-150 transition-transform ${
                      m.type === 'AI_ERROR' ? 'bg-red-500 shadow-[0_0_8px_red]' : 
                      m.type === 'AI_WARNING' ? 'bg-yellow-500 shadow-[0_0_8px_yellow]' : 'bg-green-500 shadow-[0_0_8px_green]'
                    }`}
                    style={{ left: `${(m.timestamp / duration) * 100}%` }}
                    title={m.content}
                  ></div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button onClick={handlePlayPause} className="text-white hover:text-cb-orange transition-colors">
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                  </button>
                  
                  <div className="flex items-center group/volume relative">
                    <button onClick={toggleMute} className="text-white hover:text-cb-orange transition-colors mr-2">
                      {isMuted || volume === 0 ? <VolumeX size={24} /> : volume < 0.5 ? <Volume1 size={24} /> : <Volume2 size={24} />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 accent-cb-orange h-1.5 rounded-full cursor-pointer bg-gray-600"
                    />
                  </div>
                  
                  <span className="text-sm font-mono text-gray-300">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <button className="text-gray-300 hover:text-white"><Maximize2 size={22} /></button>
              </div>
            </div>
          </div>
          
          <div className="h-16 mt-4 glass-card p-2 flex items-center justify-between shrink-0">
            <div className="flex space-x-2">
               {['❤️', '🔥', '😮'].map(emoji => (
                 <button key={emoji} onClick={() => { setCommentText(emoji); handleSendComment(); }} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl transition-transform hover:scale-125">{emoji}</button>
               ))}
            </div>
            <div className="flex items-center space-x-3 border-l border-gray-700 pl-4">
               <button 
                 onClick={handleMarkCut}
                 className="flex items-center space-x-2 text-sm text-gray-300 hover:text-cb-orange bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 transition-colors"
               >
                 <Scissors size={18} /> <span>Mark Cut</span>
               </button>
               <button 
                 onClick={handleTimestampComment}
                 className="flex items-center space-x-2 text-sm text-gray-300 hover:text-cb-orange bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 transition-colors"
               >
                 <MessageSquare size={18} /> <span>Timestamp Comment</span>
               </button>
            </div>
          </div>
        </div>

        {/* Sidebar Audit Log */}
        <div className="w-80 h-full flex flex-col border-l border-gray-800 bg-cb-dark/30 backdrop-blur-md">
          <div className="scroll-y-auto flex-1 p-4 space-y-4 custom-scrollbar overflow-y-auto">
            
            {/* AI Report Header */}
            {aiResult && (
              <div className="bg-cb-orange/5 border border-cb-orange/20 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cb-orange font-black text-xl">{aiResult.score}% <span className="text-[10px] font-normal uppercase">Match</span></span>
                  <CheckCircle size={20} className="text-cb-orange" />
                </div>
                <p className="text-[11px] text-gray-400 italic leading-relaxed">"{aiResult.summary}"</p>
              </div>
            )}

            {/* AI Timeline Feed */}
            {markers.length > 0 && <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">AI Audit Events</h4>}
            {markers.filter(m => m.type.startsWith('AI_')).map((m) => (
              <div key={m.id} className={`p-4 rounded-2xl border transition-all hover:bg-white/5 cursor-pointer ${
                m.type === 'AI_ERROR' ? 'bg-red-500/5 border-red-500/20' : 
                m.type === 'AI_WARNING' ? 'bg-yellow-500/5 border-yellow-500/20' : 
                'bg-green-500/5 border-green-500/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {m.type === 'AI_ERROR' ? <AlertCircle size={14} className="text-red-500" /> : 
                     m.type === 'AI_WARNING' ? <AlertTriangle size={14} className="text-yellow-500" /> : 
                     <CheckCircle size={14} className="text-green-500" />}
                    <span className="text-[10px] font-mono text-gray-400">{formatTime(m.timestamp)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">{m.content}</p>
              </div>
            ))}

            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 pt-4">User Comments</h4>
            {comments.map((c) => (
              <div key={c.id} className={`glass-card p-4 group cursor-pointer hover:border-gray-600 ${c.type === 'cut' ? 'border-cb-orange/30 bg-cb-orange/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {c.type === 'cut' && <Scissors size={14} className="text-cb-orange" />}
                    <span className="font-bold text-xs text-white">{c.user} <span className="font-normal text-gray-500 ml-1">at {formatTime(c.time)}</span></span>
                  </div>
                </div>
                <p className={`text-xs ${c.type === 'cut' ? 'text-cb-orange italic' : 'text-gray-400'}`}>{c.text}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 bg-cb-black">
            <textarea 
              ref={commentInputRef}
              placeholder="Type your feedback..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cb-orange/50 mb-3 resize-none h-24 transition-all"
            ></textarea>
            <button onClick={handleSendComment} className="w-full btn-primary py-3 rounded-xl font-bold">Post Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
