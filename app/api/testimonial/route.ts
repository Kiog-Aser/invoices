import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { z } from "zod";
import Testimonial from "@/models/Testimonial";
import User from "@/models/User";
import connectMongo from "@/libs/mongoose";
import { unlink } from 'fs/promises';
import path from 'path';

const testimonialSchema = z.object({
  name: z.string().min(1),
  socialHandle: z.string().optional(),
  socialPlatform: z.enum(['twitter', 'linkedin']).optional(),
  profileImage: z.string().optional(),
  howHelped: z.string().min(1),
  beforeChallenge: z.string().min(1),
  afterSolution: z.string().min(1),
  reviewType: z.enum(['text', 'video']),
  textReview: z.string().optional(),
  videoUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const data = await req.json();
    const validatedData = testimonialSchema.parse(data);

    // Create testimonial with status set to pending
    const testimonial = await Testimonial.create({
      userId: session.user.id,
      status: 'pending', // Explicitly set status to pending
      ...validatedData,
    });

    // Mark user as having given testimonial
    await User.findByIdAndUpdate(session.user.id, {
      hasGivenTestimonial: true,
    });

    return NextResponse.json({ success: true, testimonial });
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
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to save testimonial" },
      { status: 500 }
    );
  }
}