import OpenAI from "openai";

// Get the GitHub token from environment variables
const githubToken = process.env.GITHUB_TOKEN;
const githubEndpoint = "https://models.inference.ai.azure.com";
const githubModelName = "gpt-4o";

// Get the Akash token from environment variables
const akashToken = process.env.AKASH_API_KEY;
const akashEndpoint = "https://chatapi.akash.network/api/v1";
const akashModelName = "Meta-Llama-3-1-405B-Instruct-FP8"; // One of the best models available on Akash

// Check if we should use Akash or GitHub AI
const useAkash = process.env.USE_AKASH === "true" || (!githubToken && akashToken);
const useGithubAI = process.env.USE_GITHUB_AI === "true" || !useAkash;

if (!githubToken && !akashToken && process.env.NODE_ENV === "production") {
  console.error("Neither GITHUB_TOKEN nor AKASH_API_KEY is set in production environment");
}

// Create the appropriate client based on configuration
export const githubAIClient = (() => {
  if (useAkash && akashToken) {
    console.log("Using Akash Chat API for AI completions");
    return new OpenAI({ 
      baseURL: akashEndpoint, 
      apiKey: akashToken 
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

// For direct access to the Akash client
export const akashClient = akashToken ? new OpenAI({ 
  baseURL: akashEndpoint, 
  apiKey: akashToken 
}) : null;

// Export model names for reference
export const models = {
  github: githubModelName,
  akash: akashModelName
};