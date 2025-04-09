import OpenAI from "openai";

// Get the GitHub token from environment variables
const githubToken = process.env.GITHUB_TOKEN;
const githubEndpoint = "https://models.inference.ai.azure.com";
const githubModelName = "gpt-4o";

// Get the Akash tokens from environment variables (primary + backups)
const akashPrimaryToken = process.env.AKASH_API_KEY;
const akashBackupTokens = [
  process.env.AKASH_API_KEY_BACKUP_1,
  process.env.AKASH_API_KEY_BACKUP_2,
  process.env.AKASH_API_KEY_BACKUP_3,
  process.env.AKASH_API_KEY_BACKUP_4,
].filter(Boolean) as string[]; // Filter out any undefined tokens and assert as string[]

const akashEndpoint = "https://chatapi.akash.network/api/v1";
// Updated to use an allowed model from the error message
const akashModelName = "Meta-Llama-4-Maverick-17B-128E-Instruct-FP8"; // Updated model that's in the allowed list

// Check if we should use Akash or GitHub AI
const useAkash = process.env.USE_AKASH === "true" || (!githubToken && akashPrimaryToken);
const useGithubAI = process.env.USE_GITHUB_AI === "true" || !useAkash;

// For quality selections, favor DeepSeek-R1 which is also in the allowed list
export const QUALITY_MODEL = "DeepSeek-R1";

if (!githubToken && !akashPrimaryToken && process.env.NODE_ENV === "production") {
  console.error("Neither GITHUB_TOKEN nor AKASH_API_KEY is set in production environment");
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

// Create the appropriate client based on configuration
export const githubAIClient = (() => {
  if (useAkash && akashPrimaryToken) {
    console.log("Using Akash Chat API for AI completions");
    return new OpenAI({ 
      baseURL: akashEndpoint, 
      apiKey: akashPrimaryToken 
    });
  } else if (useGithubAI && githubToken) {
    console.log("Using GitHub AI for completions");
    return new OpenAI({ 
      baseURL: githubEndpoint, 
      apiKey: githubToken 
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
  if (!useAkash) {
    return null;
  }

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

// Export model names for reference
export const models = {
  github: githubModelName,
  akash: akashModelName
};