import { supabase } from '../db/supabase.js';
import { processVideo } from '../services/videoService.js';
import { uploadFileToSupabase, cleanupLocalFile } from '../services/storageService.js';
import path from 'path';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { filename, path: filepath, originalname } = req.file;
    const metadata = await processVideo(filepath, filename);

    // Defensive fetch for user - don't use .single() if it might be empty
    let { data: users, error: userError } = await supabase.from('user').select('*').limit(1);
    if (userError) throw userError;
    
    let u = users?.[0];
    if (!u) {
       console.log("No demo user found, creating mock-user...");
       const { data: newU, error: createError } = await supabase.from('user').insert([{
         email: 'mock@demo.com', 
         name: 'Demo User', 
         passwordhash: 'mocked'
       }]).select();
       
       if (createError) throw createError;
       u = newU[0];
    }

    // Defensive fetch for project
    let { data: projects, error: projError } = await supabase.from('project').select('*').eq('title', 'Demo Project').limit(1);
    if (projError) throw projError;
    
    let demoProject = projects?.[0];
    if (!demoProject) {
      const { data: newProj, error: cpError } = await supabase.from('project').insert([{
        title: "Demo Project", ownerid: u.id, status: "ACTIVE"
      }]).select();
      if (cpError) throw cpError;
      demoProject = newProj[0];
    }

    // --- NEW: Always create a unique Card for every upload ---
    const { data: newCard, error: ccError } = await supabase.from('card').insert([{
      projectid: demoProject.id, 
      title: originalname.replace(/\.[^/.]+$/, ""), // Use filename without extension as title
      status: "RAW_FOOTAGE", 
      order: 0
    }]).select();
    
    if (ccError) throw ccError;
    const rawCard = newCard[0];

    // --- NEW: PHASE 5 SUPABASE STORAGE ---
    console.log("=== UPLOADING TO SUPABASE CLOUD ===");
    
    // 1. Upload Video
    const videoUrl = await uploadFileToSupabase(filepath, 'videos', filename);
    
    // 2. Upload Thumbnail (if exists)
    let thumbUrl = null;
    if (metadata.thumbnail) {
      const localThumbPath = path.join(process.cwd(), metadata.thumbnail.replace('/uploads', 'uploads'));
      try {
        thumbUrl = await uploadFileToSupabase(localThumbPath, 'videos', `thumbs/${filename}.png`);
        cleanupLocalFile(localThumbPath);
      } catch (err) {
        console.error("Thumbnail Upload Failed:", err.message);
      }
    }

    const { data: videoVersion, error: vvError } = await supabase.from('videoversion').insert([{
      cardid: rawCard.id,
      versionnum: 1,
      originalname: originalname,
      videourl: videoUrl, 
      thumbnailurl: thumbUrl,
      duration: metadata.duration
    }]).select();

    if (vvError) throw vvError;
    if (!videoVersion || videoVersion.length === 0) throw new Error("Video insert failed to return data");

    // 3. Cleanup Video from /uploads (Disabled for now to support AI Scan)
    // cleanupLocalFile(filepath);

    console.log("[UPLOAD] SUCCESS: Video linked to project card.");
    res.status(201).json({ message: 'Upload successful (Stored in Cloud)', video: videoVersion[0] });
  } catch (error) {
    console.error("UPLOAD FATAL ERROR:", error);
    res.status(500).json({ error: 'Server Crash during upload', details: error.message || error });
  }
};

export const getVideos = async (req, res) => {
  try {
    console.log("[GET-VIDEOS] Fetching project-centric cards...");
    const { data: cards, error } = await supabase
      .from('card')
      .select(`
        *,
        videoversion ( * )
      `)
      .order('createdat', { ascending: false });

    if (error) throw error;

    // 2. Format each card to include its "Latest" video metadata for the board
    const formattedCards = (cards || []).map(card => {
       const versions = card.videoversion || [];
       const latest = [...versions].sort((a,b) => b.versionnum - a.versionnum)[0] || {};
       return {
         id: latest.id || card.id, 
         cardId: card.id,
         title: card.title || latest.originalname || "Untitled Project",
         originalname: latest.originalname || "Project",
         status: card.status,
         duration: latest.duration || '0:00',
         versionnum: latest.versionnum || 1,
         videourl: latest.videourl,
         thumbnail: latest.thumbnailurl,
         createdat: latest.createdat || card.createdat
       };
    });

    const todo   = formattedCards.filter(c => c.status === 'TODO');
    const active  = formattedCards.filter(c => c.status === 'RAW_FOOTAGE' || c.status === 'IN_PROGRESS');
    const review  = formattedCards.filter(c => c.status === 'IN_REVIEW');
    const done    = formattedCards.filter(c => c.status === 'APPROVED');

    res.status(200).json({ todo, active, review, done });
  } catch (error) {
    console.error("GET VIDEOS SYSTEM ERROR:", error);
    res.status(500).json({ error: 'Internal system error', details: error.message });
  }
};

export const updateVideoStatus = async (req, res) => {
  try {
    const { cardId, status } = req.body;
    
    // Map Kanban column IDs to DB status values
    const dbStatusMap = {
      todo:   'TODO',
      active: 'RAW_FOOTAGE',
      review: 'IN_REVIEW',
      done:   'APPROVED'
    };

    const dbStatus = dbStatusMap[status] || status;

    const { error } = await supabase
      .from('card')
      .update({ status: dbStatus })
      .eq('id', cardId);
      
    if (error) throw error;

    res.status(200).json({ message: 'Status updated' });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
};

export const getVideoMarkers = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: markers, error } = await supabase
      .from('marker')
      .select('*')
      .eq('videoid', id)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    res.status(200).json(markers);
  } catch (error) {
    console.error("GET MARKERS ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch markers' });
  }
};export const getVideoComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: comments, error } = await supabase
      .from('comment')
      .select('*')
      .eq('videoid', id)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    res.status(200).json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Get cards counts
    const { data: cards, error: cErr } = await supabase.from('card').select('status');
    if (cErr) throw cErr;

    const activeProjectCount = cards ? cards.filter(c => c.status !== 'APPROVED').length : 0;
    const finishedProjectCount = cards ? cards.filter(c => c.status === 'APPROVED').length : 0;
    const pendingReviewCount = cards ? cards.filter(c => c.status === 'IN_REVIEW').length : 0;

    // 2. Get total comments count
    const { count: feedbackCount, error: fErr } = await supabase
      .from('comment')
      .select('*', { count: 'exact', head: true });
    if (fErr) throw fErr;

    // 3. Get recent activity (Joined with video title)
    const { data: activity, error: aErr } = await supabase
      .from('comment')
      .select('id, content, createdat, videoid, videoversion!videoid(originalname, card(title))')
      .order('createdat', { ascending: false })
      .limit(5);

    if (aErr) throw aErr;

    res.status(200).json({
      activeProjects: activeProjectCount,
      finishedProjects: finishedProjectCount,
      pendingReviews: pendingReviewCount,
      totalFeedback: feedbackCount || 0,
      recentActivity: activity.map(a => ({
        id: a.id,
        user: 'You', 
        action: 'left a comment on',
        target: a.videoversion?.card?.title || a.videoversion?.originalname || 'Video',
        content: a.content,
        time: a.createdat
      }))
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch video to get card ID
    const { data: video, error: vError } = await supabase.from('videoversion').select('cardid').eq('id', id).single();
    if (vError) throw vError;

    // 2. Delete the video version
    const { error: dError } = await supabase.from('videoversion').delete().eq('id', id);
    if (dError) throw dError;

    // 3. Delete the associated card (to keep DB clean)
    if (video?.cardid) {
       await supabase.from('card').delete().eq('id', video.cardid);
    }

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error("DELETE VIDEO ERROR:", error);
    res.status(500).json({ error: 'Delete failed', details: error.message });
  }
};
