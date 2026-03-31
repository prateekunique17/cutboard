import { useState } from 'react';
import { X, Upload, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }


  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (f) => {
    if (!f.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await fetch(`${API_URL}/api/videos/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onUploadSuccess(data.video);
      onClose();
      setFile(null);
    } catch {
      setError('Upload failed. Make sure the server is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cb-surface border border-cb-border w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cb-border">
              <div className="flex items-center gap-2.5">
                <Upload size={15} className="text-cb-dim" strokeWidth={1.8} />
                <h2 className="text-sm font-semibold text-cb-text">Upload footage</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-cb-faint hover:text-cb-text transition-colors p-1 rounded-md hover:bg-cb-muted"
              >
                <X size={15} strokeWidth={1.8} />
              </button>
            </div>

            {/* Drop zone */}
            <div className="p-5">
              <div
                onDragEnter={handleDrag}
                className={`relative border border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all duration-200 ${dragActive
                    ? 'border-cb-accent/70 bg-cb-accent/5'
                    : file
                      ? 'border-cb-green/50 bg-cb-green/5'
                      : 'border-cb-border hover:border-cb-subtle bg-cb-panel/40'
                  }`}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleChange}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  accept="video/*"
                />

                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 rounded-xl border border-cb-border bg-cb-muted flex items-center justify-center mb-4">
                        <Film size={20} className="text-cb-faint" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-cb-text mb-1">
                        Drop video here or click to browse
                      </p>
                      <p className="text-xs text-cb-faint">MP4, MOV, WebM — max 500 MB</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 rounded-xl border border-cb-green/30 bg-cb-green/10 flex items-center justify-center mb-4">
                        <CheckCircle2 size={20} className="text-cb-green" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-cb-text mb-1 max-w-[240px] truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-cb-faint mb-3">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-cb-faint hover:text-cb-dim underline-offset-2 hover:underline transition-colors"
                      >
                        Change file
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex items-center gap-2 text-cb-red text-xs bg-cb-red/8 border border-cb-red/20 rounded-lg px-3 py-2.5"
                  >
                    <AlertCircle size={13} strokeWidth={1.8} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-cb-border">
              <button onClick={handleClose} className="btn-ghost text-xs">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className={`btn-primary text-xs ${(!file || uploading) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
