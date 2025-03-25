import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cleanupUploads } from "@/utils/cleanupUploads";

// Prevent caching for this route to ensure session is always current
export const dynamic = 'force-dynamic';

// 5MB file size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Run cleanup every 24 hours
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
let lastCleanup = Date.now();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run periodic cleanup if it's time
    if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
      lastCleanup = Date.now();
      cleanupUploads().catch(console.error);
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') as string;
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const validTypes = type === 'video' ? validVideoTypes : validImageTypes;

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Must be ${type === 'video' ? 'MP4 or WebM' : 'JPEG, PNG, GIF or WebP'}` 
      }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const fileType = type === 'video' ? 'videos' : 'images';
    const relativePath = `/uploads/${fileType}/${fileName}`;
    
    // Ensure directories exist
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads', fileType);
    await mkdir(uploadsDir, { recursive: true });

    try {
      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, new Uint8Array(buffer));

      return NextResponse.json({
        success: true,
        url: relativePath
      });
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json({ 
        error: "Failed to save file" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json({ 
      error: "Failed to handle file upload" 
    }, { status: 500 });
  }
}