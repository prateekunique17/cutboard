import { supabase } from '../db/supabase.js';
import fs from 'fs';
import path from 'path';

/**
 * Uploads a local file to Supabase Storage and returns the public URL.
 * @param {string} localPath - Absolute path to the local file.
 * @param {string} bucketName - Name of the Supabase bucket.
 * @param {string} destination - Filename/path in the bucket.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export const uploadFileToSupabase = async (localPath, bucketName, destination) => {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    // 1. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(destination, fileBuffer, {
        contentType: destination.endsWith('.png') ? 'image/png' : 'video/mp4',
        upsert: true
      });

    if (error) throw error;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(destination);

    return publicUrl;
  } catch (error) {
    console.error(`Supabase Upload Error for ${destination}:`, error.message);
    throw error;
  }
};

/**
 * Cleanup helper for removing local files after cloud upload.
 */
export const cleanupLocalFile = (localPath) => {
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log(`Cleaned up local file: ${path.basename(localPath)}`);
    }
  } catch (err) {
    console.error("Cleanup Error:", err.message);
  }
};
