import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Video, ArrowRight, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleMockLogin = (e) => {
    e.preventDefault();
    // Bypassing real auth to get straight to product as requested
    setUser({ id: '1', name: 'Demo User', email: email || 'demo@cutboard.com', role: 'EDITOR' }, 'mock-token');
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cb-black p-4 relative overflow-hidden">
      {/* Cinematic Glow Context */}
      <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cb-orange opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-cb-amber opacity-[0.03] blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-card p-10 relative z-10">
        <Link to="/" className="flex items-center justify-center mb-8 space-x-3 hover:opacity-80 transition-all cursor-pointer group">
          <div className="text-cb-orange group-hover:scale-110 transition-transform">
            <Video size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">CutBoard</h1>
        </Link>

        <form onSubmit={handleMockLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Email (Random OK for Demo)</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cb-black/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cb-orange/50 focus:ring-1 focus:ring-cb-orange/50 transition-all placeholder:text-gray-600"
              placeholder="demo@startup.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cb-black/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cb-orange/50 focus:ring-1 focus:ring-cb-orange/50 transition-all placeholder:text-gray-600"
              placeholder="Any password..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary flex items-center justify-center space-x-2 py-3 mt-4"
          >
            <span>Enter Studio</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-500 flex items-center justify-center space-x-1">
          <Lock size={12} />
          <span>Demo authentication bypassed for testing</span>
        </p>
      </div>
    </div>
  );
}
