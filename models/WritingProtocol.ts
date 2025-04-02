import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// Interface defining the structure for a writing protocol document
export interface IWritingProtocol {
  userId: string;
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  goals: string[];
  challenges: string[];
  aiGeneratedContent: {
    nicheAuthority: {
      fullNiche: string;
      coreMessage: string;
      uniqueMechanism: string;
      targetAudience: string[];
    };
    contentPillars: {
      expertise: {
        title: string;
        contentIdeas: string[];
      };
      personalJourney: {
        title: string;
        contentIdeas: string[];
      };
      clientProof: {
        title: string;
        contentIdeas: string[];
      };
    };
    repurposeSystem: {
      thoughtLeadershipArticle: {
        headline: string;
        hook: string;
        storytelling: string;
        valuePoints: string[];
        cta: string;
        frequency?: number; // How many times per week
      };
      formats: {
        shortForm: string[];
        shortFormFrequency?: number; // How many times per week
        threads: {
          hook: string;
          body: string[];
          cta: string;
          frequency?: number; // How many times per week
        };
      };
    };
    contentCalendar: {
      days: {
        monday: Array<{ type: string; title: string; icon?: string }>;
        tuesday: Array<{ type: string; title: string; icon?: string }>;
        wednesday: Array<{ type: string; title: string; icon?: string }>;
        thursday: Array<{ type: string; title: string; icon?: string }>;
        friday: Array<{ type: string; title: string; icon?: string }>;
        saturday: Array<{ type: string; title: string; icon?: string }>;
        sunday: Array<{ type: string; title: string; icon?: string }>;
      };
    };
    conversionFunnel: {
      awareness: {
        goal: string;
        contentStrategy: string[];
        leadMagnet: string;
        outreach: string;
      };
      activeFollowers: {
        goal: string;
        strategies: string[];
      };
      conversion?: {
        goal?: string;
        strategies?: string[];
        offers?: string[];
        callToAction?: string;
      };
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema definition for the WritingProtocol model
const writingProtocolSchema = new mongoose.Schema<IWritingProtocol>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    contentTypes: [{
      type: String,
      required: true,
    }],
    goals: [{
      type: String,
      required: true,
    }],
    challenges: [{
      type: String,
      required: true,
    }],
    aiGeneratedContent: {

      // New structure
      nicheAuthority: {
        fullNiche: String,
        coreMessage: String,
        uniqueMechanism: String,
        targetAudience: [String],
      },
      contentPillars: {
        expertise: {
          title: String,
          contentIdeas: [String],
        },
        personalJourney: {
          title: String,
          contentIdeas: [String],
        },
        clientProof: {
          title: String,
          contentIdeas: [String],
        },
      },
      repurposeSystem: {
        thoughtLeadershipArticle: {
          headline: String,
          hook: String,
          storytelling: String,
          valuePoints: [String],
          cta: String,
          frequency: Number, // How many times per week
        },
        formats: {
          shortForm: [String],
          shortFormFrequency: Number, // How many times per week
          threads: {
            hook: String,
            body: [String],
            cta: String,
            frequency: Number, // How many times per week
          },
        },
      },
      contentCalendar: {
        days: {
          monday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
          tuesday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
          wednesday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
          thursday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
          friday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
          saturday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
          sunday: [{ type: { type: String }, title: { type: String }, icon: { type: String, required: false } }],
        },
      },
      conversionFunnel: {
        awareness: {
          goal: String,
          contentStrategy: [String],
          leadMagnet: String,
          outreach: String,
        },
        activeFollowers: {
          goal: String,
          strategies: [String],
        },
        conversion: {
          goal: String,
          strategies: [String],
          offers: [String],
          callToAction: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add the toJSON plugin for consistent document transformations
writingProtocolSchema.plugin(toJSON as any);

// Create the model (use existing one if already defined)
const WritingProtocol = mongoose.models.WritingProtocol || 
  mongoose.model<IWritingProtocol>("WritingProtocol", writingProtocolSchema);

export default WritingProtocol;