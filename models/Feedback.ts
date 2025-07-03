import mongoose, { Document, Schema } from "mongoose";
import toJSON from "./plugins/toJSON";

// Define the interface for a feedback document
export interface FeedbackDocument extends Document {
  content: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: "pending" | "reviewed" | "resolved";
  isPublic: boolean;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Feedback schema
const FeedbackSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    adminResponse: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin to transform mongoose to json
FeedbackSchema.plugin(toJSON);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
