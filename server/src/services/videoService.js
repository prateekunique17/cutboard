import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import path from 'path';
import fs from 'fs';

// --- CONFIG PHASE 7: STATIC BINARIES ---
const finalFfmpegPath = ffmpegPath.path || ffmpegPath;
const finalFfprobePath = ffprobePath.path || ffprobePath;

ffmpeg.setFfmpegPath(finalFfmpegPath);
ffmpeg.setFfprobePath(finalFfprobePath);

export const processVideo = (inputPath, outputFileName) => {
  return new Promise((resolve, reject) => {
    console.log(`[FFmpeg] Analyzing: ${path.basename(inputPath)}`);

    // 1. Get Metadata (Duration)
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        console.error("FFMpeg ffprobe error:", err.message);
        return resolve({ duration: 0, thumbnail: null });
      }
      
      const duration = metadata.format.duration || 0;
      const thumbFileName = `thumb_${outputFileName}.png`;
      const thumbDir = path.join(process.cwd(), 'uploads');
      
      // Ensure uploads directory exists for thumbnails
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      console.log(`[FFmpeg] Generating thumbnail for ${duration}s video...`);

      // 2. Generate Real Thumbnail
      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          folder: thumbDir,
          filename: thumbFileName,
          timestamps: [duration > 1 ? 1 : '10%'] // Snap at 1s or 10%
        })
        .on('end', () => {
          console.log(`[FFmpeg] Success: Thumbnail created at /uploads/${thumbFileName}`);
          resolve({ duration, thumbnail: `/uploads/${thumbFileName}` });
        })
        .on('error', (thumbErr) => {
          console.error("Thumbnail extraction failed:", thumbErr.message);
          resolve({ duration, thumbnail: null });
        });
    });
  });
};
