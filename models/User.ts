import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // User's current plan (free or pro)
    plan: {
      type: String,
      enum: {
        values: ['', 'pro'],
        message: 'Plan must be either empty (free) or "pro"'
      },
      default: '',
      set: function(val: string) {
        // Ensure null or undefined becomes empty string
        return val || '';
      }
    },
    // Protocol access configuration
    protocols: {
      tokens: {
        type: Number,
        default: 0,
        min: 0
      },
      isUnlimited: {
        type: Boolean,
        default: false
      },
      purchasedCount: {
        type: Number,
        default: 0
      },
      lastGenerated: {
        type: Date
      }
    },
    provider: {
      type: String,
      required: false, // Make it optional for backward compatibility
    },
    hasGivenTestimonial: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    aiProviderConfigs: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          endpoint: { type: String, required: true },
          models: { type: String, required: true },
          apiKey: { type: String, required: true },
        }
      ],
      default: [],
    },
    defaultAIModelId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Middleware to ensure plan is always set before saving
userSchema.pre('save', function(next) {
  if (this.isModified('customerId') && this.customerId && !this.plan) {
    this.plan = 'pro';
  }
  if (!this.plan) {
    this.plan = '';
  }
  next();
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);