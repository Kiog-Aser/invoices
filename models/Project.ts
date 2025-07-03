import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// PROJECT SCHEMA
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Custom name set by user (optional)
    customName: {
      type: String,
      trim: true,
    },
    // Stripe account name (auto-fetched)
    stripeAccountName: {
      type: String,
      trim: true,
    },
    // Company information fetched from Stripe
    companyInfo: {
      name: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
      logoUrl: {
        type: String,
        trim: true,
      },
      favicon: {
        type: String,
        trim: true,
      },
      primaryColor: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      lastUpdated: {
        type: Date,
        default: null,
      }
    },
    // Owner of this project
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Stripe restricted API key for this project
    stripeApiKey: {
      type: String,
      required: true,
      private: true, // Don't include in JSON output
    },
    // Unique slug for public access
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Project description (optional)
    description: {
      type: String,
      trim: true,
    },
    // Whether the project is active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Statistics
    totalSearches: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Index for faster queries
projectSchema.index({ userId: 1 });
projectSchema.index({ slug: 1 });

// Virtual for public URL
projectSchema.virtual('publicUrl').get(function() {
  return `/invoice/${this.slug}`;
});

// add plugin that converts mongoose to json
projectSchema.plugin(toJSON);

export default mongoose.models.Project || mongoose.model("Project", projectSchema); 