import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import VideoLibrary from './pages/VideoLibrary';
import VideoReview from './pages/VideoReview';
import ClientReview from './pages/ClientReview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Public Share Link (No Login Required) */}
        <Route path="/share/:id" element={<ClientReview />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="videos" element={<VideoLibrary />} />
          <Route path="videos/:id" element={<VideoReview />} />
          <Route path="settings" element={<div className="text-white p-10 font-bold text-2xl">Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
