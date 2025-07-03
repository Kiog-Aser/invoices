import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // or 'nodejs' if you need Node APIs

export async function POST(req: NextRequest) {
  // Parse the multipart form data
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // In a real app, upload to S3/Cloudinary/etc. Here, return a placeholder image
  // You can later replace this with your own upload logic
  return NextResponse.json({
    url: 'https://placehold.co/600x400/png?text=Uploaded+Image',
  });
}
