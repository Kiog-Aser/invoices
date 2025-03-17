import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Testimonial from "@/models/Testimonial";

export async function GET() {
  try {
    await connectMongo();
    const testimonials = await Testimonial.find({ status: 'approved' })
      .sort({ createdAt: -1 });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}