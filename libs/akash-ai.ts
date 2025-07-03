import OpenAI from "openai";

// Get the Akash tokens from environment variables (primary + backups)
const akashPrimaryToken = process.env.AKASH_API_KEY;
const akashBackupTokens = [
  process.env.AKASH_API_KEY_BACKUP_1,
  process.env.AKASH_API_KEY_BACKUP_2,
  process.env.AKASH_API_KEY_BACKUP_3,
  process.env.AKASH_API_KEY_BACKUP_4,
].filter(Boolean) as string[]; // Filter out any undefined tokens and assert as string[]

const akashEndpoint = "https://chatapi.akash.network/api/v1";
// Use DeepSeek model for all operations
const AKASH_MODEL = "DeepSeek-R1";

// For quality selections, use DeepSeek-R1
export const QUALITY_MODEL = "DeepSeek-R1";

if (!akashPrimaryToken && process.env.NODE_ENV === "production") {
  console.error("AKASH_API_KEY is not set in production environment");
}

// Tracking active requests per Akash API key
const akashKeyUsage = new Map<string, number>();

// Initialize key usage tracking for all available keys
if (akashPrimaryToken) {
  akashKeyUsage.set(akashPrimaryToken, 0);
}

akashBackupTokens.forEach(token => {
  akashKeyUsage.set(token, 0);
});

// Function to get the next available Akash API key
function getAvailableAkashKey(): string | null {
  // First check if primary key is available
  if (akashPrimaryToken && (akashKeyUsage.get(akashPrimaryToken) || 0) < 3) {
    return akashPrimaryToken;
  }
  
  // Look for an available backup key
  for (const token of akashBackupTokens) {
    if ((akashKeyUsage.get(token) || 0) < 3) {
      return token;
    }
  }
  
  // If all keys are at capacity, return the primary key (will likely fail)
  // but at least we tried all options
  return akashPrimaryToken || null;
}

// Create an Akash client with the first available key
function createAkashClient() {
  const availableKey = getAvailableAkashKey();
  
  if (!availableKey) {
    console.error("No available Akash API keys found");
    return null;
  }
  
  return {
    client: new OpenAI({
      baseURL: akashEndpoint,
      apiKey: availableKey
    }),
    apiKey: availableKey
  };
}

// Create the default client for AI completions
export const defaultAIClient = (() => {
  if (akashPrimaryToken) {
    console.log("Using Akash Chat API for AI completions");
    return new OpenAI({ 
      baseURL: akashEndpoint, 
      apiKey: akashPrimaryToken 
    });
  }
  return null;
})();

// Define the interface for the client return type to ensure proper typing
export interface RotatingClient {
  client: OpenAI;
  release: () => void;
}

// For direct access to the Akash client with rotation capability
export async function getRotatingAkashClient(): Promise<RotatingClient | null> {
  const akashClientInfo = createAkashClient();
  if (!akashClientInfo) {
    return null;
  }

  const { client, apiKey } = akashClientInfo;
  
  // Increment usage counter for this key
  akashKeyUsage.set(apiKey, (akashKeyUsage.get(apiKey) || 0) + 1);
  
  // Return both the client and a release function
  return {
    client,
    release: () => {
      // Decrement usage counter when done
      const currentCount = akashKeyUsage.get(apiKey) || 0;
      if (currentCount > 0) {
        akashKeyUsage.set(apiKey, currentCount - 1);
      }
    }
  };
}

// For backward compatibility
export const akashClient = akashPrimaryToken ? new OpenAI({ 
  baseURL: akashEndpoint, 
  apiKey: akashPrimaryToken 
}) : null;

// Export model names for reference (only Akash model now)
export const models = {
  akash: AKASH_MODEL
};
