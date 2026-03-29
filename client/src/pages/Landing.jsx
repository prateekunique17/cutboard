import { useNavigate } from 'react-router-dom';
import { Video, Sparkles, Cloud, Users, ArrowRight, Play, CheckCircle2, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cb-black text-white selection:bg-cb-orange/30">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cb-orange opacity-[0.07] blur-[150px] animate-float" />
        <div className="absolute bottom-[0%] right-[-10%] w-[40vw] h-[40vw] bg-cb-amber opacity-[0.05] blur-[120px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-cb-orange group-hover:scale-110 transition-transform duration-300">
            <Video size={32} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gradient">CutBoard</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#ai" className="hover:text-white transition-colors">Gemini AI</a>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cb-orange/10 border border-cb-orange/20 text-cb-orange text-xs font-bold uppercase tracking-widest mb-8 animate-bounce">
          <Sparkles size={14} />
          <span>Now Powered by Gemini 3</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
          Audit Videos at <br />
          <span className="text-gradient">The Speed of AI.</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate workspace for editors and clients. Synchronize feedback, 
          automate visual audits, and deliver pixel-perfect content in half the time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary flex items-center space-x-3 px-10 py-4 text-lg w-full sm:w-auto overflow-hidden group"
          >
            <span>Launch Studio</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center space-x-3 px-10 py-4 text-lg font-semibold text-white/70 hover:text-white transition-all w-full sm:w-auto">
            <Play size={20} />
            <span>Watch Demo</span>
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-10 group hover:bg-cb-dark transition-all duration-500 hover:-translate-y-2 border-white/5 hover:border-cb-orange/30">
            <div className="w-16 h-16 rounded-2xl bg-cb-orange/10 flex items-center justify-center text-cb-orange mb-8 group-hover:scale-110 transition-transform duration-500">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Gemini 3 Audits</h3>
            <p className="text-gray-400 leading-relaxed">
              Automated frame-by-frame analysis with a custom-trained LLM. Detect branding errors and pacing issues instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-10 group hover:bg-cb-dark transition-all duration-500 hover:-translate-y-2 border-white/5 hover:border-blue-500/30">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 transition-transform duration-500">
              <Cloud size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Cloud Native Hub</h3>
            <p className="text-gray-400 leading-relaxed">
              High-speed video hosting powered by Supabase. Access your library from anywhere with real-time browser preview.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-10 group hover:bg-cb-dark transition-all duration-500 hover:-translate-y-2 border-white/5 hover:border-cb-amber/30">
            <div className="w-16 h-16 rounded-2xl bg-cb-amber/10 flex items-center justify-center text-cb-amber mb-8 group-hover:scale-110 transition-transform duration-500">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Client Portals</h3>
            <p className="text-gray-400 leading-relaxed">
              Distraction-free review pages for clients. Socket-powered real-time commenting with automated audit markers.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] mb-12">Built for the next generation of editors</h4>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale hover:opacity-100 transition-opacity duration-700">
            <span className="text-2xl font-black italic">ADOBE</span>
            <span className="text-2xl font-black italic">REDDRAGON</span>
            <span className="text-2xl font-black italic">BLACKMAGIC</span>
            <span className="text-2xl font-black italic">VANTAGE</span>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-8">Ready to cut the noise?</h2>
        <button 
          onClick={() => navigate('/login')}
          className="btn-primary px-12 py-4 rounded-2xl text-xl"
        >
          Get Started for Free
        </button>
        <p className="mt-12 text-gray-600 text-sm">
          &copy; 2026 CutBoard Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
