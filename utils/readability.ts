// utils/readability.ts
// Enhanced readability utility inspired by Hemingway

// Basic list of words with simpler alternatives
const simpleAlternatives: { [key: string]: string } = {
  'utilize': 'use',
  'facilitate': 'help',
  'numerous': 'many',
  'individual': 'person',
  'sufficient': 'enough',
  'attempt': 'try',
  'initiate': 'start',
  'terminate': 'end',
  'endeavor': 'try',
  'approximately': 'about',
  'demonstrate': 'show',
  'implement': 'do',
  'objective': 'goal',
  'possess': 'have',
  'require': 'need',
  'transmit': 'send',
  // Add more pairs as needed
};

// +++ Add lists for custom detection +++
// Common forms of 'to be' for passive voice check
const formsOfToBe = ['am', 'is', 'are', 'was', 'were', 'been', 'being'];
// Common past participles (simplified list, can be expanded)
// Note: This is very basic and won't catch irregular verbs well.
const commonPastParticiples = /(\w+ed)\b/g;
// List of common weakener words/phrases
const weakenerWords = [
  'just', 'maybe', 'stuff', 'things', 'really', 'very', 'quite', 'somewhat',
  'actually', 'literally', 'basically', 'generally', 'usually', 'often',
  'i think', 'i feel', 'i believe', 'in my opinion', 'it seems', 'it appears'
  // Add more as needed
];
const weakenerRegex = new RegExp(`\\b(${weakenerWords.join('|')})\\b`, 'gi');
// +++ End lists +++

export interface ReadabilityIssue {
  index: number;
  offset: number;
  reason: string;
  text: string; // The specific text causing the issue
  type: 'hard' | 'very-hard' | 'passive' | 'weakener' | 'simpler-alternative';
  suggestion?: string; // For simpler alternatives
}

export interface ReadabilityResult {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  characterCount: number; // Added
  paragraphCount: number; // Added
  readingTimeMinutes: number; // Added
  // New detailed issues
  issues: ReadabilityIssue[];
  hardSentenceCount: number;
  veryHardSentenceCount: number;
  passiveVoiceCount: number;
  weakenerCount: number; // Includes adverbs and other write-good suggestions
  simpleAlternativeCount: number;
}

// Count syllables in a word (very basic, not perfect)
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  // Improved regex to handle silent 'e' better and common vowel combinations
  word = word.replace(/e$/, ''); // Remove silent 'e' at the end
  word = word.replace(/[^laeiouy]es$/, ''); // Remove 'es' if not preceded by l,a,e,i,o,u,y
  word = word.replace(/[^laeiouy]ed$/, ''); // Remove 'ed' if not preceded by l,a,e,i,o,u,y

  // Handle special cases like 'ion'
  if (word.endsWith('ion')) {
      word = word.substring(0, word.length - 3) + 'io'; // Treat 'ion' as two syllables usually
  }

  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllableEstimate = vowelGroups ? vowelGroups.length : 0;

  // Adjust for common cases where vowel groups don't mean separate syllables
  if (word.endsWith('le') && word.length > 2 && /[bcdfghjklmnpqrstvwxz]$/.test(word.charAt(word.length - 3))) {
      syllableEstimate++; // Like 'table', 'handle'
  }

  // Minimum 1 syllable
  return Math.max(1, syllableEstimate);
}

// Enhanced function to analyze readability like Hemingway
export function analyzeReadability(text: string): ReadabilityResult {
  const issues: ReadabilityIssue[] = [];
  let hardSentenceCount = 0;
  let veryHardSentenceCount = 0;
  let passiveVoiceCount = 0; // Reset to 0, will be incremented by new logic
  let weakenerCount = 0; // Reset to 0, will be incremented by new logic
  let simpleAlternativeCount = 0;

  // --- Improved Sentence Detection ---
  const sentenceRegex = /[^.!?\n]+[.!?]+["')\]]*|[^.!?\n]+$/g;
  let match;
  const sentences: { text: string; start: number; end: number }[] = [];
  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentenceText = match[0];
    const start = match.index;
    const end = start + sentenceText.length;
    sentences.push({ text: sentenceText, start, end });
  }

  const sentenceCount = sentences.length || 1;
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length || 1;
  let syllableCount = 0;
  words.forEach(word => syllableCount += countSyllables(word));

  // --- New Stats ---
  const characterCount = text.length;
  const paragraphCount = text.trim() ? text.split(/\n{2,}/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  // --- End New Stats ---

  const fleschReadingEase = Math.round((206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)) * 10) / 10;
  const fleschKincaidGrade = Math.round((0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59) * 10) / 10;

  // --- Analyze Issues ---

  // 1. Hard and Very Hard Sentences (by word count)
  const HARD_THRESHOLD = 20;
  const VERY_HARD_THRESHOLD = 25;
  sentences.forEach(sentence => {
    const sentenceWords = sentence.text.match(/\b\w+\b/g) || [];
    const sentenceWordCount = sentenceWords.length;
    if (sentenceWordCount > VERY_HARD_THRESHOLD) {
      issues.push({
        index: sentence.start,
        offset: sentence.end - sentence.start,
        reason: `Sentence has ${sentenceWordCount} words (>25).`,
        text: sentence.text,
        type: 'very-hard',
      });
      veryHardSentenceCount++;
    } else if (sentenceWordCount > HARD_THRESHOLD) {
      issues.push({
        index: sentence.start,
        offset: sentence.end - sentence.start,
        reason: `Sentence has ${sentenceWordCount} words (>20).`,
        text: sentence.text,
        type: 'hard',
      });
      hardSentenceCount++;
    }
  });

  // 2. Passive Voice (Basic Custom Detection)
  sentences.forEach(sentence => {
    const sentenceLower = sentence.text.toLowerCase();
    formsOfToBe.forEach(verb => {
      const verbIndex = sentenceLower.indexOf(` ${verb} `); // Look for verb surrounded by spaces
      if (verbIndex !== -1) {
        // Very basic check: look for a word ending in 'ed' shortly after
        const potentialParticipleMatch = sentence.text.substring(verbIndex + verb.length + 1).match(commonPastParticiples);
        if (potentialParticipleMatch) {
          // Find the actual index of the participle within the original sentence text
          const participleIndexInSentence = sentence.text.indexOf(potentialParticipleMatch[0], verbIndex + verb.length + 1);
          if (participleIndexInSentence !== -1) {
             const issueIndex = sentence.start + verbIndex + 1; // Start index in full text
             const issueOffset = (participleIndexInSentence + potentialParticipleMatch[0].length) - (verbIndex + 1); // Length from 'be' verb to end of participle

             // Avoid adding duplicate issues for the same spot
             if (!issues.some(i => i.index === issueIndex && i.type === 'passive')) {
                 issues.push({
                   index: issueIndex,
                   offset: issueOffset,
                   reason: `Potential passive voice: "${sentence.text.substring(verbIndex + 1, participleIndexInSentence + potentialParticipleMatch[0].length)}"`,
                   text: sentence.text.substring(verbIndex + 1, participleIndexInSentence + potentialParticipleMatch[0].length),
                   type: 'passive',
                 });
                 passiveVoiceCount++;
             }
          }
        }
      }
    });
  });

  // 3. Weakeners (Basic Custom Detection)
  let weakenerMatch;
  while ((weakenerMatch = weakenerRegex.exec(text)) !== null) {
    // Avoid adding duplicate issues for the same spot
    if (!issues.some(i => i.index === weakenerMatch!.index && i.type === 'weakener')) {
        issues.push({
          index: weakenerMatch.index,
          offset: weakenerMatch[0].length,
          reason: `Weakener word: "${weakenerMatch[0]}"`,
          text: weakenerMatch[0],
          type: 'weakener',
        });
        weakenerCount++;
    }
    // Ensure regex progresses
    if (weakenerMatch.index === weakenerRegex.lastIndex) {
        weakenerRegex.lastIndex++;
    }
  }

  // 4. Simpler Alternatives (using regex and word list) - Renumbered
  const wordRegex = /\b(\w+)\b/g;
  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[1].toLowerCase();
    if (simpleAlternatives[word]) {
      // Avoid adding duplicate issues for the same spot
      if (!issues.some(i => i.index === match!.index && i.type === 'simpler-alternative')) {
          issues.push({
            index: match.index,
            offset: match[1].length,
            reason: `"${match[1]}" has a simpler alternative.`,
            text: match[1],
            type: 'simpler-alternative',
            suggestion: simpleAlternatives[word],
          });
          simpleAlternativeCount++;
      }
    }
    // Ensure regex progresses
    if (match.index === wordRegex.lastIndex) {
        wordRegex.lastIndex++;
    }
  }

  // Sort issues by index
  issues.sort((a, b) => a.index - b.index);

  return {
    fleschKincaidGrade,
    fleschReadingEase,
    wordCount,
    sentenceCount,
    syllableCount,
    characterCount, // Added
    paragraphCount, // Added
    readingTimeMinutes, // Added
    issues,
    hardSentenceCount,
    veryHardSentenceCount,
    passiveVoiceCount, // Now updated by custom logic
    weakenerCount, // Now updated by custom logic
    simpleAlternativeCount,
  };
}

// Keep the old function for compatibility if needed, or remove it
export function getReadability(text: string): Omit<ReadabilityResult, 'issues' | 'hardSentenceCount' | 'veryHardSentenceCount' | 'passiveVoiceCount' | 'weakenerCount' | 'simpleAlternativeCount'> {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length || 1;
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word);
  }
  const fleschReadingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  const fleschKincaidGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
  // --- New Stats ---
  const characterCount = text.length;
  const paragraphCount = text.trim() ? text.split(/\n{2,}/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  // --- End New Stats ---
  return {
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    wordCount,
    sentenceCount, // Added missing property
    syllableCount, // Added missing property
    characterCount,
    paragraphCount,
    readingTimeMinutes,
  };
}
