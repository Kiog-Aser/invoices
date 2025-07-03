import mongoose, { Document, Schema } from "mongoose";
import toJSON from "./plugins/toJSON";

// Define the interface for a comment on a feature request
export interface CommentDocument extends Document {
  userId: string;
  userEmail: string;
  userName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for a feature request document
export interface FeatureRequestDocument extends Document {
  title: string;
  description: string;
  status: "requested" | "planned" | "in-progress" | "completed" | "rejected";
  votes: string[]; // Array of user IDs
  userId: string; // Creator of the feature request
  userEmail: string; // Email of the creator
  userName: string; // Name of the creator
  comments: CommentDocument[];
  createdAt: Date;
  updatedAt: Date;
}

// Comment schema
const CommentSchema = new Schema(
  {
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
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Feature request schema
const FeatureRequestSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["requested", "planned", "in-progress", "completed", "rejected"],
      default: "requested",
    },
    votes: {
      type: [String], // Array of user IDs
      default: [],
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
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin to transform mongoose to json
FeatureRequestSchema.plugin(toJSON);

export default mongoose.models.FeatureRequest || mongoose.model("FeatureRequest", FeatureRequestSchema);
