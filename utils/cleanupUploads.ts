import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Cleanup unused uploaded files that are older than MAX_AGE
 * This should be run periodically (e.g., daily) via a cron job
 */
export async function cleanupUploads() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    // Get all subdirectories (images and videos)
    const subdirs = await readdir(uploadsDir);
    
    for (const subdir of subdirs) {
      const subdirPath = path.join(uploadsDir, subdir);
      const files = await readdir(subdirPath);
      
      for (const file of files) {
        const filePath = path.join(subdirPath, file);
        const fileStat = await stat(filePath);
        
        // Check if file is older than MAX_AGE
        if (Date.now() - fileStat.mtime.getTime() > MAX_AGE) {
          try {
            await unlink(filePath);
            console.log(`Deleted old file: ${filePath}`);
          } catch (error) {
            console.error(`Failed to delete file ${filePath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    // Ignore if uploads directory doesn't exist yet
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error cleaning up uploads:', error);
    }
  }
}