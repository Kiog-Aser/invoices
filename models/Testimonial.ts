import mongoose from "mongoose";

export interface ITestimonial {
  userId?: string; // Make userId optional
  name: string;
  socialHandle?: string;
  socialPlatform?: 'twitter' | 'linkedin';
  profileImage?: string;
  howHelped: string;
  beforeChallenge: string;
  afterSolution: string;
  reviewType: 'text' | 'video';
  textReview?: string;
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  email?: string; // Add email field for anonymous submissions
}

const testimonialSchema = new mongoose.Schema<ITestimonial>(
  {
    userId: {
      type: String,
      required: false, // Change to optional
    },
    name: {
      type: String,
      required: true,
    },
    socialHandle: String,
    socialPlatform: {
      type: String,
      enum: ['twitter', 'linkedin'],
    },
    profileImage: String,
    howHelped: {
      type: String,
      required: true,
    },
    beforeChallenge: {
      type: String,
      required: true,
    },
    afterSolution: {
      type: String, 
      required: true,
    },
    reviewType: {
      type: String,
      enum: ['text', 'video'],
      required: true,
    },
    textReview: String,
    videoUrl: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    email: String, // Add email field schema
  },
  {
    timestamps: true,
  }
);

const Testimonial = mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", testimonialSchema);

export default Testimonial;