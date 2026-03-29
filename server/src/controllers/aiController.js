import { supabase } from '../db/supabase.js';
import { scanVideoWithAI } from '../services/aiService.js';
import path from 'path';

export const auditVideo = async (req, res) => {
  try {
    const { videoId, brief } = req.body;
    
    // 1. Fetch video details to get local path
    const { data: video, error: vError } = await supabase
      .from('videoversion')
      .select('*')
      .eq('id', videoId)
      .single();
      
    if (vError || !video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // 2. Extract filename from URL (since we store it locally in /uploads)
    // URL format: http://localhost:5000/uploads/filename.mp4
    const filename = video.videourl.split('/').pop();
    const videoPath = path.join(process.cwd(), 'uploads', filename);

    // 3. Perform AI Scan
    console.log(`Starting AI Scan for ${filename} with brief: ${brief}`);
    const analysis = await scanVideoWithAI(videoPath, brief);

    // 4. Save Audit Points as Markers in Supabase
    if (analysis.auditPoints && analysis.auditPoints.length > 0) {
      const markers = analysis.auditPoints.map(p => ({
        videoid: videoId,
        type: p.type === 'error' ? 'AI_ERROR' : (p.type === 'warning' ? 'AI_WARNING' : 'AI_SUCCESS'),
        content: p.message,
        timestamp: p.time
      }));

      const { error: mError } = await supabase.from('marker').insert(markers);
      if (mError) throw mError;
    }

    res.status(200).json({
      message: 'AI Audit Complete',
      score: analysis.score,
      summary: analysis.summary,
      points: analysis.auditPoints
    });

  } catch (error) {
    console.error("AUDIT CONTROLLER ERROR:", error);
    res.status(500).json({ error: 'AI Audit Failed', details: error.message });
  }
};
