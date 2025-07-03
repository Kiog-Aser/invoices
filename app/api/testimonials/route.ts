import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Testimonial from "@/models/Testimonial";
import mongoose from "mongoose";

// Prevent caching for testimonials endpoint
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting to connect...');
      await connectMongo();
    }

    console.log('Fetching approved testimonials...');
    const testimonials = await Testimonial.find({ 
      status: 'approved' 
    })
      .select({
        _id: 1,
        name: 1,
        socialHandle: 1,
        socialPlatform: 1,
        profileImage: 1,
        reviewType: 1,
        textReview: 1,
        videoUrl: 1,
        createdAt: 1
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`Found ${testimonials.length} approved testimonials`);
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: errorMessage },
      { status: 500 }
    );
  }
}