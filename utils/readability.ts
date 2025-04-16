// utils/readability.ts
// Simple readability utility (Flesch-Kincaid Grade Level and Flesch Reading Ease)

export interface ReadabilityResult {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
}

// Count syllables in a word (very basic, not perfect)
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:e$)/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function getReadability(text: string): ReadabilityResult {
  // Split into sentences (very basic)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  // Split into words
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length || 1;
  // Count syllables
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word);
  }
  // Flesch Reading Ease
  // 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  const fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  // Flesch-Kincaid Grade Level
  // 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
  const fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
  return {
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    wordCount,
    sentenceCount,
    syllableCount,
  };
}
