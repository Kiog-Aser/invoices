import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { z } from "zod";
import Testimonial from "@/models/Testimonial";
import User from "@/models/User";
import connectMongo from "@/libs/mongoose";
import { unlink } from 'fs/promises';
import path from 'path';

// Prevent caching for this route to ensure session is always current
export const dynamic = 'force-dynamic';

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").optional(),
  socialHandle: z.string().optional(),
  socialPlatform: z.enum(['twitter', 'linkedin']).optional(),
  profileImage: z.string().optional(),
  howHelped: z.string().min(1, "This field is required"),
  beforeChallenge: z.string().min(1, "This field is required"),
  afterSolution: z.string().min(1, "This field is required"),
  reviewType: z.enum(['text', 'video']),
  textReview: z.string().optional(),
  videoUrl: z.string().optional(),
});

export async function POST(req: Request) {
  // Set CORS headers to allow credentials
  const origin = req.headers.get('origin');
  
  // Create a headers object to be used in the response
  const headers = new Headers({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  
  // Set the Access-Control-Allow-Origin header
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  try {
    // Get server session with explicit options
    const session = await getServerSession(authOptions);
    console.log("Session in testimonial API:", session); // Debug log
    
    await connectMongo();

    const data = await req.json();
    const validatedData = testimonialSchema.parse(data);

    // Create testimonial
    const testimonial = await Testimonial.create({
      // Set userId if user is logged in
      ...(session?.user?.id && { userId: session.user.id }),
      status: 'pending', // Explicitly set status to pending
      ...validatedData,
    });

    // If user is logged in, update their profile
    if (session?.user?.id) {
      await User.findByIdAndUpdate(session.user.id, {
        hasGivenTestimonial: true,
      });
    }

    return NextResponse.json({ success: true, testimonial }, { headers });
  } catch (error) {
    console.error("Error saving testimonial:", error);

    // If validation or saving fails, clean up any uploaded files
    try {
      const data = await req.json();
      if (data.profileImage?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', data.profileImage);
        await unlink(filePath).catch(() => {});
      }
      if (data.videoUrl?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', data.videoUrl);
        await unlink(filePath).catch(() => {});
      }
    } catch {
      // Ignore JSON parsing errors
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400, headers });
    }
    
    return NextResponse.json(
      { error: "Failed to save testimonial" },
      { status: 500, headers }
    );
  }
}