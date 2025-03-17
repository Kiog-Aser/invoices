import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Testimonial from "@/models/Testimonial";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting to connect...');
      await connectMongo();
    }

    console.log('Fetching approved testimonials...');
    const testimonials = await Testimonial.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .lean()  // Convert to plain JS objects for better performance
      .exec(); // Explicitly execute the query

    console.log(`Found ${testimonials.length} approved testimonials`);
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: errorMessage },
      { status: 500 }
    );
  }
}