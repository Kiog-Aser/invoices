"use client";

// Ensure the page is always rendered dynamically and never statically or cached
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import React, { useState, useRef, useEffect, Suspense, useCallback, Ref, JSX } from 'react'; // Added Ref and JSX
import { FaLightbulb, FaMagic, FaCut, FaPen, FaUserCircle, FaFilter, FaLink, FaTimes, FaCog, FaPlus, FaTrash, FaSave, FaSync, FaBold, FaItalic, FaQuoteLeft, FaHeading, FaRobot, FaCheckCircle, FaChartBar, FaDollarSign, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import dynamicImport from 'next/dynamic';
import { marked } from 'marked'; // Import marked library
import { getReadability, analyzeReadability, ReadabilityResult as DetailedReadabilityResult, ReadabilityIssue } from '@/utils/readability'; // Import ReadabilityIssue

// Import ReactQuill dynamically with SSR disabled
const ReactQuill = dynamicImport(() => import('react-quill').then(mod => ({
  default: ({ forwardedRef, ...props }: { forwardedRef?: React.Ref<any>; [key: string]: any }) => 
    <mod.default ref={forwardedRef} {...props} />
})), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// +++ Define Readability Blot Config (Moved outside client check) +++
const readabilityBlotConfig: { name: string; className: string; color: string }[] = [
  { name: 'readability-very-hard', className: 'readability-highlight-very-hard', color: 'rgba(239, 68, 68, 0.3)' }, // Red
  { name: 'readability-hard', className: 'readability-highlight-hard', color: 'rgba(245, 158, 11, 0.3)' }, // Yellow
  { name: 'readability-passive', className: 'readability-highlight-passive', color: 'rgba(59, 130, 246, 0.2)' }, // Blue
  { name: 'readability-weakener', className: 'readability-highlight-weakener', color: 'rgba(59, 130, 246, 0.2)' }, // Blue
  { name: 'readability-simpler', className: 'readability-highlight-simpler', color: 'rgba(168, 85, 247, 0.2)' } // Purple
];
// +++ End Config +++

// --- Register Custom Quill Format for Grammar Suggestions ---
let Inline: any;
let Quill: any; // Define Quill type
if (typeof window !== 'undefined') {
  // Only import Quill and register the blot on the client
  // @ts-ignore
  Quill = require('quill');
  Inline = Quill.import('blots/inline');

  class GrammarSuggestionBlot extends Inline {
    static blotName = 'grammar-suggestion';
    static tagName = 'span';
    static className = 'grammar-suggestion-underline';

    static create(value: any) {
      let node = super.create() as HTMLElement;
      node.dataset.suggestion = JSON.stringify(value);
      node.addEventListener('click', (event) => {
        event.stopPropagation();
        const root = node.closest('.ql-editor') as EditorRootWithPopupHandlers | null;
        if (root?.showSuggestionPopup && node.dataset.suggestion) {
          try {
            const suggestionData = JSON.parse(node.dataset.suggestion);
            root.showSuggestionPopup(suggestionData, node);
          } catch (e) {
            console.error("Error parsing suggestion data on click", e);
          }
        }
      });
      return node;
    }
    static formats(domNode: HTMLElement) {
      if (domNode.dataset.suggestion) {
        try {
          return JSON.parse(domNode.dataset.suggestion);
        } catch (e) {
          console.error('Error parsing suggestion data from DOM', e);
        }
      }
      return super.formats(domNode);
    }
    format(name: string, value: any) {
      if (name === GrammarSuggestionBlot.blotName && value) {
        (this.domNode as HTMLElement).dataset.suggestion = JSON.stringify(value);
      } else {
        super.format(name, value);
      }
    }
  }
  Quill.register(GrammarSuggestionBlot);

  // +++ Register Readability Highlight Blots +++
  readabilityBlotConfig.forEach(config => {
    class ReadabilityBlot extends Inline {
      static blotName = config.name;
      static tagName = 'span';
      static className = config.className;

      static create(value: any) {
        let node = super.create() as HTMLElement;
        // Store issue details for potential popups later
        if (typeof value === 'object' && value !== null) {
          node.dataset.issue = JSON.stringify(value);
        }
        // Add click listener (optional for now, can add popup later)
        // node.addEventListener('click', (event) => { ... });
        return node;
      }

      static formats(domNode: HTMLElement) {
         if (domNode.dataset.issue) {
           try {
             return JSON.parse(domNode.dataset.issue);
           } catch (e) {
             console.error('Error parsing readability issue data from DOM', e);
           }
         }
         return super.formats(domNode);
      }

      format(name: string, value: any) {
        if (name === ReadabilityBlot.blotName && value) {
          (this.domNode as HTMLElement).dataset.issue = JSON.stringify(value);
        } else {
          super.format(name, value);
        }
      }
    }
    Quill.register(ReadabilityBlot);
  });
  // +++ End Readability Blots +++

}
// --- End Custom Quill Format ---

// +++ Suggestion Popup Component (Updated Design) +++
interface SuggestionPopupProps {
  suggestion: any;
  position: { top: number; left: number };
  onApply: (suggestion: any) => void;
  onDismiss: () => void; // Add dismiss handler prop
}

const SuggestionPopup: React.FC<SuggestionPopupProps> = ({
  suggestion,
  position,
  onApply,
  onDismiss
}) => {
  if (!suggestion) return null;

  const replacement = suggestion.replacements?.[0]?.value;
  const category = suggestion.rule?.category?.name || 'Suggestion'; // Get category name if available

  // Prevent click propagation to avoid closing the popup immediately
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="absolute z-[10000] bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-sm text-gray-700 w-64" // Adjusted width and padding
      style={{ top: position.top, left: position.left }}
      onClick={handlePopupClick} // Prevent clicks inside from closing it
      // Removed onMouseEnter/onMouseLeave as it's click-based now
    >
      {/* Category/Title */}
      <p className="text-xs text-gray-500 mb-2">{category}</p>

      {/* Suggestion Message */}
      <p className="mb-3 font-medium">{suggestion.message}</p>

      {/* Replacement Button */}
      {replacement && (
        <button
          onClick={() => onApply(suggestion)}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-3 rounded text-left mb-3 transition-colors"
        >
          {replacement}
        </button>
      )}

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="w-full flex items-center text-gray-500 hover:text-gray-700 py-1 px-1 rounded transition-colors text-xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line> {/* Corrected attribute x1 -> x2 */}
          <line x1="14" y1="11" x2="14" y2="17"></line> {/* Corrected attribute x1 -> x2 */}
        </svg>
        Dismiss
      </button>
    </div>
  );
};
// +++ End Suggestion Popup Component +++

interface Protocol {
  id: string;
  title: string;
  userRole: string;
  industry: string;
  aiGeneratedContent?: {
    nicheAuthority?: {
      fullNiche?: string;
      coreMessage?: string;
      targetAudience?: string[];
    };
    contentPillars?: {
      expertise?: {
        title?: string;
        contentIdeas?: string[];
      };
    };
  };
}

// Define EditorRootWithPopupHandlers for type safety
interface EditorRootWithPopupHandlers extends HTMLElement {
  showSuggestionPopup?: (suggestionData: any, targetElement: HTMLElement) => void;
}

const ContentHub = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const quillRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null); // Ref for the editor container

  // State for the floating toolbar
  const [floatingToolbar, setFloatingToolbar] = useState<{ visible: boolean; top: number; left: number }>({ visible: false, top: 0, left: 0 });

  // Add tab state for sidebar
  const [activeSidebarTab, setActiveSidebarTab] = useState<'ai' | 'grammar' | 'readability' | 'earning'>('ai');

  // Grammar checker state
  const [grammarSuggestions, setGrammarSuggestions] = useState<any[]>([]);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  const [grammarLoading, setGrammarLoading] = useState(false);

  // +++ State for Suggestion Popup +++
  const [popupSuggestion, setPopupSuggestion] = useState<any | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  // Removed hidePopupTimeoutRef
  // +++ End State +++

  // Readability state
  const [readability, setReadability] = useState<DetailedReadabilityResult | null>(null);
  const [showReadabilityStats, setShowReadabilityStats] = useState(false); // State for stats toggle

  // Earning optimiser AI insights state
  const [aiEarningInsights, setAIEarningInsights] = useState<string | null>(null);

  // +++ Popup Handler Functions (Updated) +++
  // Simple dismiss function - Moved earlier
  const dismissSuggestionPopup = useCallback(() => {
    setPopupSuggestion(null);
    setPopupPosition(null);
  }, []);

  const showSuggestionPopup = useCallback((suggestionData: any, targetElement: HTMLElement) => {
    // If the same suggestion is clicked again, hide it
    if (popupSuggestion?.id === suggestionData.id) {
        setPopupSuggestion(null);
        setPopupPosition(null);
        return;
    }

    const rect = targetElement.getBoundingClientRect();
    const popupTopOffset = 10; // Pixels above the element
    const popupLeftOffset = 0; // Adjust if needed

    setPopupSuggestion(suggestionData);
    setPopupPosition({
      // Position popup slightly above the clicked element
      top: window.scrollY + rect.top - popupTopOffset,
      left: window.scrollX + rect.left + popupLeftOffset
    });
  }, [popupSuggestion]); // Depend on popupSuggestion to toggle visibility

  // Attach show handler to editor root node
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const root = editor.root as EditorRootWithPopupHandlers;
      root.showSuggestionPopup = showSuggestionPopup;

      // Cleanup function
      return () => {
        delete root.showSuggestionPopup;
      };
    }
  }, [quillRef.current, showSuggestionPopup]);

  // Effect to close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the popup and not on an underline
      const target = event.target as HTMLElement;
      const popupElement = document.querySelector('.suggestion-popup-container'); // Add a class to the portal div if needed
      const isUnderline = target.classList.contains('grammar-suggestion-underline');

      if (popupSuggestion && !popupElement?.contains(target) && !isUnderline) {
        dismissSuggestionPopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupSuggestion, dismissSuggestionPopup]); // Re-run if popup state changes

  // +++ End Popup Handler Functions +++

  // +++ Dismiss Suggestion Handler +++
  const handleDismissSuggestion = useCallback((suggestionToDismiss: any) => {
    if (!suggestionToDismiss || !suggestionToDismiss.id) {
      console.error("Cannot dismiss suggestion without data or ID.");
      dismissSuggestionPopup(); // Still hide the popup
      return;
    }

    const { id, offset, length } = suggestionToDismiss;

    // 1. Remove underline from editor
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      // Ensure offset and length are valid numbers before formatting
      if (typeof offset === 'number' && typeof length === 'number' && offset >= 0 && length >= 0) {
         // Check bounds
         const editorLength = editor.getLength();
         if (offset + length <= editorLength) {
            editor.formatText(offset, length, 'grammar-suggestion', false, 'silent');
         } else {
            console.warn("Dismiss failed: Suggestion bounds out of editor range.", suggestionToDismiss);
         }
      } else {
         console.warn("Dismiss failed: Invalid offset/length.", suggestionToDismiss);
      }
    }

    // 2. Update component state
    const updatedSuggestions = grammarSuggestions.filter((s: any) => s.id !== id); // Added type for 's'
    setGrammarSuggestions(updatedSuggestions);

    // 3. Update localStorage cache
    const cacheKey = 'grammarCache';
    try {
      const cachedDataString = localStorage.getItem(cacheKey);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        // Only update cache if the content matches (to avoid stale updates)
        if (quillRef.current && cachedData.content === quillRef.current.getEditor().getText()) { // Added null check for quillRef.current
          const updatedCacheSuggestions = cachedData.suggestions.filter((s: any) => s.id !== id); // Added type for 's'
          localStorage.setItem(cacheKey, JSON.stringify({ ...cachedData, suggestions: updatedCacheSuggestions }));
          console.log("Grammar cache updated after dismissal.");
        } else {
          // Content mismatch, maybe clear cache or log warning
          console.warn("Cache content mismatch during dismissal, not updating cache.");
          // Optionally remove cache if content differs significantly
          // localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.error("Error updating grammar cache after dismissal:", e);
      // Optionally clear cache if corrupted
      // localStorage.removeItem(cacheKey);
    }

    // 4. Hide the popup
    dismissSuggestionPopup();

    toast.success("Suggestion dismissed."); // Optional feedback
  }, [grammarSuggestions, setGrammarSuggestions, dismissSuggestionPopup, quillRef]); // Added dependencies
  // +++ End Dismiss Suggestion Handler +++

  // Fetch user's writing protocols
  useEffect(() => {
    if (status === "authenticated") {
      const fetchProtocols = async () => {
        try {
          const response = await fetch('/api/writing-protocol', {
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch protocols');
          }

          const data = await response.json();
          setProtocols(data);
        } catch (error) {
          console.error('Error fetching protocols:', error);
        }
      };

      fetchProtocols();
    }
  }, [status]);

  // Function to get the current selection or all content
  const getSelectedText = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      
      if (range && range.length > 0) {
        return editor.getText(range.index, range.length);
      } else {
        // No selection, use the paragraph or nearby content
        return editor.getText();
      }
    }
    return '';
  };

  // Function to animate typing effect for AI responses
  const typeTextEffect = (editor: any, text: string, startIndex: number, onComplete: () => void) => {
    let i = 0;
    const typingSpeed = 15; // Speed of typing in milliseconds
    const textLength = text.length;
    
    // Create a typing interval that adds one character at a time
    const typingInterval = setInterval(() => {
      if (i < textLength) {
        const char = text[i];
        
        // Insert the next character
        editor.insertText(startIndex + i, char);
        
        // Update cursor position to follow the typing
        editor.setSelection(startIndex + i + 1, 0);
        
        i++;
      } else {
        // Finished typing, clear the interval
        clearInterval(typingInterval);
        if (onComplete) onComplete();
      }
    }, typingSpeed);
    
    // Return control function to stop typing if needed
    return () => clearInterval(typingInterval);
  };

  // Function to prepare for inserting streaming AI text
  const prepareForStreamingText = () => {
    if (!quillRef.current) return null;
    
    const editor = quillRef.current.getEditor();
    
    // First make sure we have a title (first line with content)
    const titleText = editor.getText(0, 1);
    
    let targetIndex;
    if (!titleText.trim()) {
      // No content yet, add a title first
      editor.insertText(0, "Untitled");
      editor.formatLine(0, 1, 'header', 1);
      editor.insertText(1, "\n\n");
      targetIndex = 3; // After title and double newline
    } else {
      // Find the first paragraph after title
      const text = editor.getText();
      const firstLineBreak = text.indexOf('\n');
      
      if (firstLineBreak >= 0) {
        // There's a title, insert after it with double newline
        targetIndex = firstLineBreak + 1;
        // Ensure we have a blank line
        if (text.charAt(targetIndex) !== '\n') {
          editor.insertText(targetIndex, '\n');
          targetIndex += 1;
        }
      } else {
        // Only title exists, add newlines after it
        targetIndex = text.length;
        editor.insertText(targetIndex, '\n\n');
        targetIndex += 2;
      }
    }
    
    // Ensure we're not in header format
    editor.formatLine(targetIndex, 1, 'header', false);
    
    // Now set the selection at our target position
    editor.setSelection(targetIndex, 0);
    
    return targetIndex;
  };

  // Function to insert streaming text character by character
  const insertStreamingChar = (char: string, insertIndex: number) => {
    if (!quillRef.current) return insertIndex;
    
    const editor = quillRef.current.getEditor();
    
    // Insert the character at current position
    editor.insertText(insertIndex, char);
    
    // Update cursor position to follow the typing
    editor.setSelection(insertIndex + 1, 0);
    
    // Return the next insert position
    return insertIndex + 1;
  };

  // Function to insert text at the current cursor position
  const insertText = (text: string, isAIResponse: boolean = false) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      
      // If this is an AI response, ensure we're not in title format
      if (isAIResponse) {
        // First make sure we have a title (first line with content)
        const titleText = editor.getText(0, 1);
        
        let targetIndex;
        if (!titleText.trim()) {
          // No content yet, add a title first
          editor.insertText(0, "Untitled");
          editor.formatLine(0, 1, 'header', 1);
          editor.insertText(1, "\n\n");
          targetIndex = 3; // After title and double newline
        } else {
          // Find the first paragraph after title
          const text = editor.getText();
          const firstLineBreak = text.indexOf('\n');
          
          if (firstLineBreak >= 0) {
            // There's a title, insert after it with double newline
            targetIndex = firstLineBreak + 1;
            // Ensure we have a blank line
            if (text.charAt(targetIndex) !== '\n') {
              editor.insertText(targetIndex, '\n');
              targetIndex += 1;
            }
          } else {
            // Only title exists, add newlines after it
            targetIndex = text.length;
            editor.insertText(targetIndex, '\n\n');
            targetIndex += 2;
          }
        }
        
        // Ensure we're not in header format
        editor.formatLine(targetIndex, 1, 'header', false);
        
        // Now set the selection at our target position
        
        // Use typing effect animation for AI responses
        typeTextEffect(editor, text, targetIndex, () => {
          // After typing is complete, format any bullet points or lists
          const formattedText = editor.getText();
          
          // Focus back on the editor after typing
          editor.focus();
        });
        
        return; // Exit early since we're handling this with animation
      }
      
      // Normal (non-AI) text insertion without animation:
      if (range) {
        // If there's a selection, replace it
        if (range.length > 0) {
          editor.deleteText(range.index, range.length);
        }
        
        // Insert the new text
        editor.insertText(range.index, text);
        
        // Move the cursor to the end of the inserted text
        editor.setSelection(range.index + text.length, 0);
      } else {
        // If no selection, insert at the end
        const length = editor.getLength();
        editor.insertText(length - 1, text);
        editor.setSelection(length - 1 + text.length, 0);
      }
      
      // Focus back on the editor
      editor.focus();
    }
  };

  // Get personalized prompt based on selected protocol
  const getPersonalizedPrompt = (action: string) => {
    if (!selectedProtocol?.aiGeneratedContent) {
      return {};
    }

    const niche = selectedProtocol.aiGeneratedContent.nicheAuthority?.fullNiche || selectedProtocol.industry;
    const coreMessage = selectedProtocol.aiGeneratedContent.nicheAuthority?.coreMessage || '';
    const contentIdeas = selectedProtocol.aiGeneratedContent.contentPillars?.expertise?.contentIdeas || [];
    
    const personalContext = {
      niche,
      coreMessage,
      industry: selectedProtocol.industry,
      role: selectedProtocol.userRole,
      contentIdeas: contentIdeas.join(', ')
    };
    
    return personalContext;
  };

  // AI enhancement functions
  const generateWithAI = async (action: string) => {
    const selectedText = action === 'ideas' ||
                         action === 'article' ||
                         action === 'social' ||
                         action === 'email' ||
                         action === 'carousel' ||
                         action === 'storytelling' ||
                         action === 'expert-breakdown'
                         ? '' : getSelectedText();

    if (!selectedText.trim() &&
        action !== 'ideas' &&
        action !== 'article' &&
        action !== 'social' &&
        action !== 'email' &&
        action !== 'carousel' &&
        action !== 'storytelling' &&
        action !== 'expert-breakdown') {
      toast.error('Please select some text or write content first for this action.');
      return;
    }

    setLoading(action);
    if (action === 'earning-optimiser') setAIEarningInsights(null); // Reset insights

    try {
      const personalContext = selectedProtocol ? getPersonalizedPrompt(action) : {};

      const response = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          action,
          title, // Pass the current document title
          personalContext,
          stream: true // Explicitly request streaming
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process with AI' }));
        throw new Error(errorData.error || 'Failed to process with AI');
      }

      // Special handling for earning-optimiser: stream and set HTML
      if (action === 'earning-optimiser') {
        let html = '';
        if (!response.body) throw new Error('No response body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulatedMarkdown = '';
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            accumulatedMarkdown += chunk;
            // Handle both sync and async marked
            const htmlResult = marked(accumulatedMarkdown);
            if (htmlResult instanceof Promise) {
              htmlResult.then(res => setAIEarningInsights(res));
            } else {
              setAIEarningInsights(htmlResult);
            }
          }
        }
        // Final update
        const finalHtml = marked(accumulatedMarkdown);
        if (finalHtml instanceof Promise) {
          finalHtml.then(res => setAIEarningInsights(res));
        } else {
          setAIEarningInsights(finalHtml);
        }
        toast.success('Earning optimisation complete!');
        return;
      }

      // Handle the streaming response
      await handleStreamingResponse(response, () => {
        toast.success(`Content ${action} complete!`);
      });

    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Function to handle streaming AI responses
  const handleStreamingResponse = async (response: Response, onComplete?: () => void) => {
    if (!response.body) {
      throw new Error('Response body is null');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let accumulatedMarkdown = ''; // Store raw markdown
    let insertionIndex: number | null = null;
    let initialInsertion = true; // Flag to handle initial insertion differently

    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true); // Get current cursor position
      insertionIndex = range.index; // Store initial insertion point

      // Add null check for insertionIndex before using it
      if (insertionIndex !== null) {
        // Ensure we are not inserting into a header line initially
        const lineFormats = editor.getFormat(insertionIndex);
        if (lineFormats.header) {
          editor.insertText(insertionIndex, '\n'); // Add a newline if cursor is in header
          insertionIndex++;
          editor.formatLine(insertionIndex, 1, 'header', false); // Ensure the new line is not a header
          editor.setSelection(insertionIndex, 0); // Move cursor to the new line
        }
      }
    }

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        accumulatedMarkdown += chunk;

        if (quillRef.current && insertionIndex !== null) {
          const editor = quillRef.current.getEditor();
          // Convert the *entire accumulated* markdown to HTML
          const htmlContent = marked(accumulatedMarkdown);

          // For the first chunk, just insert
          if (initialInsertion) {
            // Use dangerouslyPasteHTML to insert the parsed HTML
            // We need to delete any potential placeholder newline added before
            const currentLength = editor.getLength();
            editor.deleteText(insertionIndex, currentLength - insertionIndex); // Clear anything after initial index
            editor.clipboard.dangerouslyPasteHTML(insertionIndex, htmlContent);
            initialInsertion = false;
          } else {
            // For subsequent chunks, replace the previously inserted HTML
            // Find the length of the previously inserted HTML to replace it
            // This is tricky and might be inefficient. A better approach might involve deltas.
            // Let's try replacing from the initial insertion point.
            const currentLength = editor.getLength();
            editor.deleteText(insertionIndex, currentLength - insertionIndex); // Clear old content
            editor.clipboard.dangerouslyPasteHTML(insertionIndex, htmlContent); // Insert new full content
          }

          // Update cursor position to the end of the inserted content
          // Getting the length *after* paste might be asynchronous, use a small delay
          setTimeout(() => {
            const newLength = editor.getLength();
            editor.setSelection(newLength, 0); // Move cursor to the very end
          }, 0);
        }
      }
    }

    // Final cleanup: Ensure the final HTML is rendered correctly
    if (quillRef.current && insertionIndex !== null && !initialInsertion) {
        const editor = quillRef.current.getEditor();
        const finalHtmlContent = marked(accumulatedMarkdown);
        const currentLength = editor.getLength();
        editor.deleteText(insertionIndex, currentLength - insertionIndex);
        editor.clipboard.dangerouslyPasteHTML(insertionIndex, finalHtmlContent);
        setTimeout(() => {
            const finalLength = editor.getLength();
            editor.setSelection(finalLength, 0);
        }, 0);
    }


    if (onComplete) onComplete();
  };

  // Handle protocol selection
  const selectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setIsProtocolModalOpen(false);
    toast.success(`Connected to "${protocol.title}" protocol`);
  };

  // This function was duplicated. Removed second instance.

  // Custom toolbar that only shows on text selection
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Configure editor with our custom toolbar handler
  const modules = {
    toolbar: null, // Disable default toolbar
    keyboard: {
      bindings: {
        // You could add custom keyboard shortcuts here if needed
      }
    }
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];
  
  // Handle auto-formatting for title and body text
  useEffect(() => {
    // Only run this once when the component is mounted
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    
    // Initial setup - apply h1 header format to first line
    if (!content) {
      // Format the first line as h1 header
      editor.format('header', 1);
    }
    
    // Listen for key events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Check if we're at the beginning (first line)
        const text = editor.getText();
        const selection = editor.getSelection();
        
        if (selection && text.trim() && text.indexOf('\n') === -1) {
          // We're on the first line and pressing Enter
          setTimeout(() => {
            // Reset to normal text for the body content
            editor.format('header', false);
          }, 10);
        }
      }
    };
    
    // Add the event listener
    editor.root.addEventListener('keydown', handleKeyDown);
    
    // Clean up on component unmount
    return () => {
      editor.root.removeEventListener('keydown', handleKeyDown);
    };
  }, [quillRef.current, content]);

  // Custom CSS to apply to the editor
  const editorStyles = {
    border: 'none',
    fontSize: '21px',
    lineHeight: '1.7',
    fontFamily: '"Merriweather", "Georgia", serif',
  };
  
  // Add custom CSS for the placeholder styling and floating toolbar
  useEffect(() => {
    // Add custom CSS to style the placeholder like the title
    const style = document.createElement('style');
    style.textContent = `
      .medium-style-editor .ql-editor.ql-blank::before {
        font-size: 2.25rem;
        font-weight: 700;
        color: rgba(75, 85, 99, 0.4);
        font-style: normal;
        left: 0;
        right: 0;
      }
      
      /* Style h1 elements to match desired title style */
      .medium-style-editor .ql-editor h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 0.75em;
      }
      
      /* Style h2 elements for normal and subtitle cases */
      .medium-style-editor .ql-editor h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.5em;
      }

      /* Add margin to paragraphs for spacing */
      .medium-style-editor .ql-editor p {
        margin-bottom: 1em; /* Adjust as needed */
      }
      
      /* Special styling for subtitle (second line with h2) */
      .medium-style-editor .ql-editor h2,
      .medium-style-editor .ql-editor h2.subtitle {
        color: #9ca3af; /* More grey for subtitle */
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: -0.5em; /* Less space above subtitle */
        margin-bottom: 0.5em; /* Less space below subtitle */
      }
      
      /* Style links with understated black underline */
      .medium-style-editor .ql-editor a {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: all 0.2s;
      }
      
      /* Style blockquotes - making more prominent */
      .medium-style-editor .ql-editor blockquote {
        border-left: 3px solid #d1d5db;
        padding: 0.5rem 1rem;
        margin: 1rem 0;
        color: #4b5563;
        font-style: italic;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 0 4px 4px 0;
      }

      /* Style for grammar suggestion underlines */
      .medium-style-editor .ql-editor .grammar-suggestion-underline {
        text-decoration: underline wavy red;
        text-decoration-skip-ink: none; /* Make sure underline is continuous */
        background-color: rgba(255, 0, 0, 0.05); /* Optional subtle background */
        cursor: pointer; /* Indicate it's interactive */
      }

      /* +++ Readability Highlight Styles +++ */
      .medium-style-editor .ql-editor .readability-highlight-very-hard {
        background-color: ${readabilityBlotConfig.find((c: { name: string }) => c.name === 'readability-very-hard')?.color || 'transparent'};
      }
      .medium-style-editor .ql-editor .readability-highlight-hard {
        background-color: ${readabilityBlotConfig.find((c: { name: string }) => c.name === 'readability-hard')?.color || 'transparent'};
      }
      .medium-style-editor .ql-editor .readability-highlight-passive {
        background-color: ${readabilityBlotConfig.find((c: { name: string }) => c.name === 'readability-passive')?.color || 'transparent'};
      }
      .medium-style-editor .ql-editor .readability-highlight-weakener {
        background-color: ${readabilityBlotConfig.find((c: { name: string }) => c.name === 'readability-weakener')?.color || 'transparent'};
      }
      .medium-style-editor .ql-editor .readability-highlight-simpler {
        background-color: ${readabilityBlotConfig.find((c: { name: string }) => c.name === 'readability-simpler')?.color || 'transparent'};
      }
      /* +++ End Readability Styles +++ */
      
      /* Floating toolbar styles */
      .floating-toolbar {
        position: fixed; /* Use fixed instead of absolute for better positioning */
        z-index: 9999; /* Much higher z-index to ensure visibility */
        display: flex;
        align-items: center;
        background: #333;
        border-radius: 12px; /* Even more rounded edges */
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        padding: 8px;
        transition: opacity 0.2s;
        opacity: 1;
      }

      .floating-toolbar:after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #333;
      }
      
      .floating-toolbar button {
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 16px;
      }
      
      .floating-toolbar button:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .floating-toolbar button.active {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .floating-toolbar .divider {
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.3);
        margin: 0 6px;
      }
      
      /* Editor side labels (Title/Subtitle indicators) */
      .editor-labels-container {
        pointer-events: none;
      }
      .editor-side-label {
        position: absolute;
        left: -85px; /* Position just to the left of editor content */
        display: flex;
        flex-direction: row-reverse; /* Text first, then line */
        align-items: center;
        color: #6b7280;
        padding-right: 2px;
        pointer-events: none;
        z-index: 5;
        /* Remove fixed height to allow container to size based on content */
      }
      
      .editor-side-label .label-line {
        width: 1px; /* Slightly thicker line */
        background-color: #d1d5db;
        position: fixed;
        right: 240;
        /* Height will be determined by parent container */
      }
      
      .editor-side-label span {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 1rem; /* Bigger text */
        white-space: nowrap; /* Prevent text wrapping */
        margin-top: 0.5em; /* Space between line and text */
        margin-bottom: 0.5em; /* Space between line and text */
      }
      
      .title-label {
        font-weight: 600; /* Slightly bolder */
      }
      
      .subtitle-label {
        font-weight: 500; /* Slightly bolder */
        color: #9ca3af;
      }
      .editor-side-label span {
        color: #6b7280;
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
      }
      .editor-side-label.subtitle-label span {
        color: #9ca3af;
        font-weight: 400;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Track if we're in link input mode
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Format handler functions for the floating toolbar
  const handleFormatText = (format: string, value: any = true) => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();
    
    if (selection) {
      if (format === 'link') {
        // Instead of using prompt, switch to link input mode
        setIsLinkMode(true);
        
        // Get existing link, if any
        const format = editor.getFormat(selection);
        if (format.link) {
          setLinkInputValue(format.link);
        } else {
          setLinkInputValue('');
        }

        // Focus the input field after it renders
        setTimeout(() => {
          if (linkInputRef.current) {
            linkInputRef.current.focus();
          }
        }, 10);
        
      } else if (format === 'header') {
        // For headings, check if it's already applied with the same level
        const currentFormat = editor.getFormat(selection.index, selection.length);
        const shouldRemove = currentFormat.header === value;
        
        // Apply header formatting
        editor.format('header', shouldRemove ? false : value);
        
      } else if (format === 'blockquote') {
        // Toggle blockquote formatting
        const currentFormat = editor.getFormat(selection.index, selection.length);
        editor.format('blockquote', !currentFormat.blockquote);
      } else {
        // For other formats, simply toggle them
        const currentFormat = editor.getFormat(selection.index, selection.length);
        editor.format(format, currentFormat[format] ? false : value);
      }
      
      // Re-focus the editor
      if (format !== 'link') {
        setTimeout(() => {
          editor.focus();
        }, 10);
      }
    }
  };
  
  // Check if the currently selected text has a link
  const isTextLinked = () => {
    if (!quillRef.current) return false;
    
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();
    
    if (selection) {
      const format = editor.getFormat(selection);
      return !!format.link;
    }
    
    return false;
  };

  // Apply link to selected text
  const applyLink = (url: string) => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection(true);
    
    if (selection) {
      if (url) {
        // Add http:// if no protocol is specified
        let formattedUrl = url;
        if (url && !/^https?:\/\//i.test(url)) {
          formattedUrl = 'http://' + url;
        }
        
        editor.format('link', formattedUrl);
      } else {
        editor.format('link', false);
      }
      
      // Exit link mode
      setIsLinkMode(false);
      setLinkInputValue('');
      
      // Re-focus the editor
      setTimeout(() => {
        editor.focus();
      }, 10);
    }
  };
  
  // Function to add the title/subtitle indicators
  const addEditorLabels = () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const editorRoot = editor.root;
    const text = editor.getText();
  
    // Remove any existing labels first
    const existingLabels = document.querySelectorAll('.editor-labels-container');
    existingLabels.forEach(label => label.remove());
  
    // Get the current selection
    const selection = editor.getSelection();
    if (!selection) return;
  
    // Find the first line break to determine title and subtitle positions
    const firstLineBreakPos = text.indexOf('\n');
    if (firstLineBreakPos === -1) return;
  
    // Determine if selection is in title or subtitle
    const isInTitle = selection.index <= firstLineBreakPos;
    let isInSubtitle = false;
    let subtitleStart = firstLineBreakPos + 1;
    let subtitleEnd = text.indexOf('\n', subtitleStart);
    if (subtitleEnd === -1) subtitleEnd = text.length;
    if (selection.index >= subtitleStart && selection.index <= subtitleEnd) {
      isInSubtitle = true;
    }
  
    if (!isInTitle && !isInSubtitle) return; // Only show when editing title or subtitle
  
    // Get bounds for title and subtitle
    const titleBounds = editor.getBounds(0, firstLineBreakPos);
    let hasSubtitle = false;
    let subtitleBounds = null;
    const secondLineLength = subtitleEnd - subtitleStart;
    if (secondLineLength > 0) {
      const secondLineFormat = editor.getFormat(subtitleStart, 1);
      if (secondLineFormat.header === 2) {
        hasSubtitle = true;
        subtitleBounds = editor.getBounds(subtitleStart, secondLineLength);
      }
    }
  
    // Create a single container that will hold both labels and a single line
    const labelContainer = document.createElement('div');
    labelContainer.className = 'editor-labels-container';
    labelContainer.style.position = 'absolute'; // Use absolute so it scrolls with content
    labelContainer.style.left = '-25px';
    labelContainer.style.top = `${titleBounds.top}px`;
    labelContainer.style.zIndex = '5';
    labelContainer.style.pointerEvents = 'none';
    labelContainer.style.height = hasSubtitle && subtitleBounds ? `${(subtitleBounds.top + subtitleBounds.height) - titleBounds.top}px` : `${titleBounds.height}px`;
  
    // Create a single line that spans the whole container height
    const labelLine = document.createElement('div');
    labelLine.style.position = 'absolute';
    labelLine.style.right = '0';
    labelLine.style.top = '0';
    labelLine.style.width = '2px';
    labelLine.style.height = '100%';
    labelLine.style.backgroundColor = '#d1d5db';
    labelContainer.appendChild(labelLine);
  
    // Create title label
    const titleLabel = document.createElement('div');
    titleLabel.className = 'editor-side-label title-label';
    titleLabel.innerHTML = '<span>Title</span>';
    titleLabel.style.position = 'absolute';
    titleLabel.style.top = '0';
    titleLabel.style.right = '12px';
    labelContainer.appendChild(titleLabel);
  
    // Create subtitle label if needed
    if (hasSubtitle && subtitleBounds) {
      const subtitleLabel = document.createElement('div');
      subtitleLabel.className = 'editor-side-label subtitle-label';
      subtitleLabel.innerHTML = '<span>Subtitle</span>';
      subtitleLabel.style.position = 'absolute';
      subtitleLabel.style.top = `${subtitleBounds.top - titleBounds.top}px`;
      subtitleLabel.style.right = '12px';
      labelContainer.appendChild(subtitleLabel);
    }
  
    // Attach to the editor root (so it scrolls with content)
    editorRoot.parentElement?.appendChild(labelContainer);
  };

  // Function to handle text selection changes for the floating toolbar
  const handleSelectionChange = useCallback((range: any, oldRange: any, source: string) => {
    console.log('[FloatingToolbar] selection-change', { range, oldRange, source }); // Debug log
    const quill = quillRef.current?.getEditor();
    const editorContainer = editorContainerRef.current;
    if (!quill || !editorContainer) return;
    addEditorLabels();
    if (range && range.length > 0 && source === 'user') {
      const bounds = quill.getBounds(range.index, range.length);
      const toolbarElement = toolbarRef.current;
      const toolbarWidth = 250;
      const toolbarHeight = toolbarElement?.offsetHeight || 40;
      // Always position above selection, with extra space
      const extraSpace = 16; // px
      const editorRoot = quill.root;
      const rootRect = editorRoot.getBoundingClientRect();
      // Calculate position relative to the viewport for position: fixed
      let top = rootRect.top + bounds.top - toolbarHeight - extraSpace;
      let left = rootRect.left + bounds.left + (bounds.width / 2) - (toolbarWidth / 2);
      // Clamp horizontally to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8));
      // Clamp to top of viewport (never below selection)
      top = Math.max(8, top);
      setFloatingToolbar({ visible: true, top, left });
    } else {
      setTimeout(() => {
        const activeElement = document.activeElement;
        const toolbarElement = toolbarRef.current;
        if (toolbarElement && toolbarElement.contains(activeElement)) {
          // Don't hide if focus is inside the toolbar
        } else {
          setFloatingToolbar(prev => ({ ...prev, visible: false }));
        }
      }, 150);
    }

    // Close suggestion popup if selection changes significantly or becomes zero
    if (popupSuggestion && (!range || range.length === 0 || source === 'user')) {
       // Add a small delay to allow applying suggestion without immediate close
       setTimeout(() => {
           // Check if popup is still meant to be open before closing
           if (popupSuggestion) {
               dismissSuggestionPopup();
           }
       }, 100);
    }

  }, [popupSuggestion, dismissSuggestionPopup]); // Add dependencies

  // Register selection-change event whenever quillRef.current or handleSelectionChange changes
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.on('selection-change', handleSelectionChange);
      return () => {
        quill.off('selection-change', handleSelectionChange);
      };
    }
  }, [quillRef.current, handleSelectionChange]);

  // Handle content changes in the editor
  const handleContentChange = (value: string, delta: any, source: string, editor: any) => {
    setContent(value);
    // Title extraction logic removed - Medium uses placeholder text, not first line as title
    // Add auto-save logic here if needed
  };

  // Quill modules - Toolbar is now disabled (null)
  const quillModules = {
    toolbar: null, // Disable default toolbar
    // Consider adding history module for undo/redo if needed
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  // Quill formats - Keep formats you want to support with the floating toolbar
  const quillFormats = [
    'header', 'bold', 'italic', 'link', 'blockquote',
    'grammar-suggestion' // Add our custom format
    // Add other formats as needed (e.g., list, strike)
  ];

  // Function to apply format from floating toolbar
  const applyFormat = (format: string, value?: any) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.format(format, value || !quill.getFormat()[format]); // Toggle boolean formats
      // Keep focus on the editor after applying format
      quill.focus();
      // Optionally hide toolbar immediately after action
      // setFloatingToolbar(prev => ({ ...prev, visible: false }));
    }
  };

  // Helper function to apply underlines based on suggestions
  const applyUnderlines = (suggestions: any[]) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const length = editor.getLength();
  
    // Clear previous underlines first
    editor.formatText(0, length, 'grammar-suggestion', false, 'silent');
  
    // Apply new underlines
    if (suggestions.length > 0) {
      editor.history.cutoff(); // Prevent underlining from being a single undo step
      suggestions.forEach((suggestion: any, index: number) => {
        // Ensure suggestion has a unique ID if it doesn't already
        const suggestionId = suggestion.id || `suggestion-${Date.now()}-${index}`;
        const suggestionData = {
          ...suggestion, // Include all original suggestion data
          id: suggestionId, // Ensure ID is present
          // Make sure offset and length are numbers
          offset: Number(suggestion.offset),
          length: Number(suggestion.length),
        };
        // Check if offset and length are valid before formatting
        if (typeof suggestionData.offset === 'number' && typeof suggestionData.length === 'number' && suggestionData.offset >= 0 && suggestionData.length > 0) {
           // Check bounds to prevent errors
           if (suggestionData.offset + suggestionData.length <= length) {
              editor.formatText(
                suggestionData.offset,
                suggestionData.length,
                'grammar-suggestion',
                suggestionData, // Pass suggestion data as the value
                'silent' // Use silent to prevent triggering text-change event
              );
           } else {
              console.warn("Skipping suggestion underline due to out-of-bounds:", suggestionData);
           }
        } else {
           console.warn("Skipping suggestion underline due to invalid offset/length:", suggestionData);
        }
      });
      editor.history.cutoff();
    }
  };

  // Grammar check function using free LanguageTool public API
  const checkGrammar = async () => {
    if (!quillRef.current) return;
    setGrammarLoading(true);
    // Keep existing suggestions while loading to avoid flicker if cache hit
    // setGrammarSuggestions([]);
    const editor = quillRef.current.getEditor();
    const text = editor.getText();
    const cacheKey = 'grammarCache';

    // --- Check Cache ---
    try {
      const cachedDataString = localStorage.getItem(cacheKey);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        if (cachedData.content === text && Array.isArray(cachedData.suggestions)) {
          console.log("Using cached grammar suggestions.");
          setGrammarSuggestions(cachedData.suggestions);
          applyUnderlines(cachedData.suggestions); // Apply underlines from cache
          setIsGrammarModalOpen(true);
          setActiveSidebarTab('grammar');
          setGrammarLoading(false);
          return; // Exit early
        } else {
          // Content mismatch, remove old cache
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.error("Error reading grammar cache:", e);
      localStorage.removeItem(cacheKey); // Clear potentially corrupted cache
    }
    // --- End Cache Check ---

    // Clear underlines before API call if cache missed
    const length = editor.getLength();
    editor.formatText(0, length, 'grammar-suggestion', false, 'silent');
    setGrammarSuggestions([]); // Clear suggestions state if cache missed

    try {
      const res = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          text,
          language: 'en-US',
        }),
      });
      console.log('Grammar API response:', res);
      if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
      }
      const data = await res.json();
      console.log('Grammar API JSON:', data);
      const suggestions = (data.matches || []).map((suggestion: any, index: number) => ({
          ...suggestion,
          // Ensure each suggestion has a unique ID for reliable filtering later
          id: `suggestion-${Date.now()}-${index}`
      }));

      // --- Store in Cache ---
      try {
          localStorage.setItem(cacheKey, JSON.stringify({ content: text, suggestions }));
      } catch (e: any) { // Use 'any' or define a specific error type
          console.error("Error saving grammar cache:", e);
          // Optionally clear cache if quota is exceeded
          if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
               localStorage.removeItem(cacheKey);
               toast.error("Could not cache grammar results (storage full).");
          }
      }
      // --- End Store Cache ---

      setGrammarSuggestions(suggestions);
      applyUnderlines(suggestions); // Apply underlines from API result

      if (suggestions.length > 0) {
        setIsGrammarModalOpen(true);
        setActiveSidebarTab('grammar');
      } else {
        toast.success('No grammar issues found!');
      }

    } catch (e: any) {
      toast.error(`Grammar check failed: ${e.message || 'Unknown error'}`);
      console.error('Grammar check error:', e);
      setGrammarSuggestions([]); // Clear suggestions on error
      applyUnderlines([]); // Ensure underlines are cleared on error
    } finally {
      setGrammarLoading(false);
    }
  };

  // Apply a single suggestion
  const applyGrammarSuggestion = (suggestion: any) => { // No longer needs async
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const { offset, length, replacements, id } = suggestion;

    if (!id) {
        console.error("Cannot apply suggestion without a unique ID:", suggestion);
        toast.error("Failed to apply suggestion (missing ID).");
        return;
    }

    if (replacements && replacements.length > 0) {
      // --- Dismiss popup ---
      dismissSuggestionPopup();
      // --- End Dismiss ---

      const replacementValue = replacements[0].value;
      const deltaLength = replacementValue.length - length;

      // Apply changes using delta operations for better history and silent updates
      editor.history.cutoff(); // Group changes
      // Important: Remove format *before* deleting text
      editor.formatText(offset, length, 'grammar-suggestion', false, 'silent');
      editor.deleteText(offset, length, 'silent'); // Delete old text silently
      editor.insertText(offset, replacementValue, 'user'); // Insert new text with 'user' source
      editor.history.cutoff(); // End grouping changes

      // --- Adjust remaining suggestions locally ---
      const currentSuggestions = grammarSuggestions; // Get current state
      const updatedSuggestions = currentSuggestions
        .filter(s => s.id !== id) // Remove the applied suggestion
        .map(s => {
          if (s.offset > offset) {
            // Adjust offset if suggestion comes after the change
            return { ...s, offset: s.offset + deltaLength };
          }
          return s; // Keep suggestion as is if it comes before
        });

      // Re-apply underlines with adjusted offsets
      applyUnderlines(updatedSuggestions);

      // Update the state with the adjusted list
      setGrammarSuggestions(updatedSuggestions);

      // --- No API re-check needed here ---
    }
  };

  // Apply all suggestions
   const applyAllGrammarSuggestions = () => {
    if (!quillRef.current) return;

    // --- Dismiss popup ---
    dismissSuggestionPopup();
    // --- End Dismiss ---

    const editor = quillRef.current.getEditor();
    // Sort by offset descending to avoid messing up positions
    const sorted = [...grammarSuggestions].sort((a, b) => b.offset - a.offset);

    editor.history.cutoff(); // Group changes
    sorted.forEach(suggestion => {
      if (suggestion.replacements && suggestion.replacements.length > 0) {
        // Remove the underline format first
        editor.formatText(suggestion.offset, suggestion.length, 'grammar-suggestion', false, 'silent');
        // Apply the text change
        editor.deleteText(suggestion.offset, suggestion.length, 'silent');
        editor.insertText(suggestion.offset, suggestion.replacements[0].value, 'silent'); // Use 'silent' source
      }
    });
    editor.history.cutoff();

    setGrammarSuggestions([]); // Clear suggestions list
    applyUnderlines([]); // Clear underlines from editor
    setIsGrammarModalOpen(false);
    toast.success('All suggestions applied!');

    // --- Invalidate Cache after applying all ---
    try {
        localStorage.removeItem('grammarCache');
    } catch (e) {
        console.error("Error removing grammar cache:", e);
    }
    // --- End Invalidate ---
  };

  // +++ Helper to get Readability Blot Name +++
  const getReadabilityBlotName = (type: ReadabilityIssue['type']): string => {
    switch (type) {
      case 'very-hard': return 'readability-very-hard';
      case 'hard': return 'readability-hard';
      case 'passive': return 'readability-passive';
      case 'weakener': return 'readability-weakener';
      case 'simpler-alternative': return 'readability-simpler';
      default: return '';
    }
  };
  // +++ End Helper +++

  // +++ Helper to apply readability highlights +++
  const applyReadabilityHighlights = (issues: ReadabilityIssue[]) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const length = editor.getLength();

    // Clear previous highlights
    readabilityBlotConfig.forEach((config: { name: string; className: string; color: string }) => {
      editor.formatText(0, length, config.name, false, 'silent');
    });

    // Apply new highlights
    if (issues.length > 0) {
      editor.history.cutoff();
      issues.forEach((issue) => {
        const blotName = getReadabilityBlotName(issue.type);
        if (blotName && typeof issue.index === 'number' && typeof issue.offset === 'number' && issue.index >= 0 && issue.offset > 0) {
          if (issue.index + issue.offset <= length) {
            const highlighted = editor.getText(issue.index, issue.offset);
            console.log(`[Readability Highlight] ${blotName}:`, highlighted, { index: issue.index, offset: issue.offset });
            editor.formatText(issue.index, issue.offset, blotName, issue, 'silent');
          } else {
            console.warn("Skipping readability highlight due to out-of-bounds:", issue);
          }
        } else {
           console.warn("Skipping readability highlight due to invalid data:", issue, blotName);
        }
      });
      editor.history.cutoff();
    }
  };
  // +++ End Helper +++

  // Function to check readability (Updated)
  const checkReadability = () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const text = editor.getText();

    // Clear previous highlights immediately for responsiveness
    applyReadabilityHighlights([]);

    const result = analyzeReadability(text);
    setReadability(result);
    applyReadabilityHighlights(result.issues); // Apply new highlights
    setActiveSidebarTab('readability'); // Switch to readability tab
  };

  // Use dynamic import for ReactDOM.createPortal
  const createPortal = typeof window !== 'undefined' ? require('react-dom').createPortal : () => null;

  // Floating toolbar JSX as a function for portal rendering
  const floatingToolbarJSX = floatingToolbar.visible && (
    <div 
      ref={toolbarRef}
      className="floating-toolbar z-[99999]"
      style={{ 
        top: `${floatingToolbar.top}px`,
        left: `${floatingToolbar.left}px`
      }}
      onMouseDown={e => e.preventDefault()} 
    >
      {isLinkMode ? (
        /* Link input mode - more compact and matches toolbar width */
        <div className="flex items-center w-full">
          <input
            ref={linkInputRef}
            type="text"
            value={linkInputValue}
            onChange={(e) => setLinkInputValue(e.target.value)}
            placeholder="Enter URL..."
            className="text-sm bg-transparent text-white border-b border-white/30 focus:border-white focus:outline-none py-1 px-2 flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink(linkInputValue);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsLinkMode(false);
                setLinkInputValue('');
              }
            }}
            autoFocus
          />
          <button 
            onClick={() => {
              setIsLinkMode(false);
              setLinkInputValue('');
            }} 
            title="Cancel"
            className="ml-2 hover:bg-white/20 p-1 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ) : (
        /* Normal formatting toolbar */
        <>
          {/* Text formatting group */}
          <button onClick={() => handleFormatText('bold')} title="Bold">
            <strong>B</strong>
          </button>
          <button onClick={() => handleFormatText('italic')} title="Italic">
            <em>i</em>
          </button>
          {/* Link button with special color when active */}
          <button 
            onClick={() => handleFormatText('link')} 
            title="Link"
            className={isTextLinked() ? "text-green-400" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </button>
          
          {/* Separator */}
          <div className="divider"></div>
          
          {/* Structure formatting group */}
          <button onClick={() => handleFormatText('header', 1)} title="Title">
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>T</span>
          </button>
          <button onClick={() => handleFormatText('header', 2)} title="Subtitle">
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>T</span>
          </button>
          <button onClick={() => handleFormatText('blockquote')} title="Quote">
            <span style={{ fontSize: '16px' }}>"</span>
          </button>
        </>
      )}
    </div>
  );

  // Ensure only one type of highlight is visible at a time
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    const length = quill?.getLength();
    if (activeSidebarTab === 'readability' && readability) {
      // Clear grammar highlights
      quill?.formatText(0, length, 'grammar-suggestion', false, 'silent');
      applyReadabilityHighlights(readability.issues);
    } else if (activeSidebarTab === 'grammar' && grammarSuggestions.length > 0) {
      // Clear readability highlights
      readabilityBlotConfig.forEach((config) => {
        quill?.formatText(0, length, config.name, false, 'silent');
      });
      applyUnderlines(grammarSuggestions);
    } else {
      // Clear all highlights if not in either tab
      quill?.formatText(0, length, 'grammar-suggestion', false, 'silent');
      readabilityBlotConfig.forEach((config) => {
        quill?.formatText(0, length, config.name, false, 'silent');
      });
    }
  }, [activeSidebarTab, readability, grammarSuggestions]);

  return (
    <div className="min-h-screen bg-base-100 flex relative">
      {/* Floating toolbar for text selection rendered as a portal */}
      {typeof window !== 'undefined' && createPortal(
        floatingToolbarJSX,
        document.body
      )}
      {/* +++ Suggestion Popup Portal (Updated Props) +++ */}
      {typeof window !== 'undefined' && popupSuggestion && popupPosition && createPortal(
        // Add a container div if needed for the outside click listener
        <div className="suggestion-popup-container">
            <SuggestionPopup
              suggestion={popupSuggestion}
              position={popupPosition as { top: number; left: number }}
              onApply={applyGrammarSuggestion}
              onDismiss={() => handleDismissSuggestion(popupSuggestion)} // Pass dismiss handler with suggestion data
              // Removed onMouseEnter/onMouseLeave
            />
        </div>,
        document.body
      )}
      {/* +++ End Suggestion Popup Portal +++ */}
      {/* Sidebar with tabbed navigation */}
      <div className="w-64 border-l border-base-200 h-screen flex flex-col p-4 fixed right-0 overflow-y-auto bg-base-100 z-50">
        {/* Tab bar with icons */}
        <div className="flex mb-4 gap-1 justify-between">
          <button
            className={`flex-1 tab tab-bordered px-0 py-2 flex items-center justify-center text-xl ${activeSidebarTab === 'ai' ? 'tab-active text-primary' : 'text-base-content/60'}`}
            onClick={() => setActiveSidebarTab('ai')}
            title="AI Tools"
          >
            <FaRobot />
          </button>
          <button
            className={`flex-1 tab tab-bordered px-0 py-2 flex items-center justify-center text-xl ${activeSidebarTab === 'grammar' ? 'tab-active text-primary' : 'text-base-content/60'}`}
            onClick={() => setActiveSidebarTab('grammar')}
            title="Grammar Checker"
          >
            <FaCheckCircle />
          </button>
          <button
            className={`flex-1 tab tab-bordered px-0 py-2 flex items-center justify-center text-xl ${activeSidebarTab === 'readability' ? 'tab-active text-primary' : 'text-base-content/60'}`}
            onClick={() => setActiveSidebarTab('readability')}
            title="Readability Grade"
          >
            <FaChartBar />
          </button>
          <button
            className={`flex-1 tab tab-bordered px-0 py-2 flex items-center justify-center text-xl ${activeSidebarTab === 'earning' ? 'tab-active text-primary' : 'text-base-content/60'}`}
            onClick={() => setActiveSidebarTab('earning')}
            title="Earning Optimiser"
          >
            <FaDollarSign />
          </button>
        </div>
        {/* Tab content */}
        {activeSidebarTab === 'ai' && (
          <>
            <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>
            {/* Protocol Selection */}
            <div className="mb-6">
              <button 
                onClick={() => setIsProtocolModalOpen(true)}
                className={`btn ${selectedProtocol ? 'btn-primary' : 'btn-outline'} btn-sm w-full`}
              >
                {selectedProtocol ? (
                  <>
                    <FaLink className="mr-2" /> {selectedProtocol.title}
                  </>
                ) : (
                  <>
                    <FaLink className="mr-2" /> Connect Protocol
                  </>
                )}
              </button>
            </div>
            {/* Enhance Content Section */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-base-content/70 mb-1">Enhance Content</h3>
              <button 
                onClick={() => generateWithAI('improve')}
                disabled={!!loading}
                className={`btn btn-sm w-full justify-start ${loading === 'improve' ? 'btn-primary loading' : 'btn-outline'}`}
              >
                <FaMagic className="mr-2" /> Improve Writing
              </button>
              <button 
                onClick={() => generateWithAI('rewrite')} 
                disabled={!!loading}
                className={`btn btn-sm w-full justify-start ${loading === 'rewrite' ? 'btn-primary loading' : 'btn-outline'}`}
              >
                <FaPen className="mr-2" /> Rewrite Content
              </button>
              <button 
                onClick={() => generateWithAI('shorten')} 
                disabled={!!loading}
                className={`btn btn-sm w-full justify-start ${loading === 'shorten' ? 'btn-primary loading' : 'btn-outline'}`}
              >
                <FaCut className="mr-2" /> Summarize & Shorten
              </button>
            </div>
            {/* Content Generation Section */}
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-base-content/70 mb-1">
                <div className="flex items-center">
                  <FaLightbulb className="mr-2 text-yellow-400" /> Content Generation
                </div>
              </h3>
              <button 
                onClick={() => generateWithAI('ideas')}
                disabled={!!loading}
                className={`btn btn-sm w-full justify-start ${loading === 'ideas' ? 'btn-primary loading' : 'btn-outline'}`}
              >
                Generate Content Ideas
              </button>
              <button 
                onClick={() => generateWithAI('article')}
                disabled={!!loading || !title}
                className={`btn btn-sm w-full justify-start ${loading === 'article' ? 'btn-primary loading' : 'btn-outline'}`}
                title={title ? '' : 'Enter a title in the editor to generate an outline'}
              >
                Generate Outline
              </button>
            </div>
          </>
        )}
        {activeSidebarTab === 'grammar' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Grammar Checker</h2>
            <p className="text-base-content/70 text-sm mb-2">Check your content for grammar issues.</p>
            <button className="btn btn-primary btn-sm w-full mb-2" onClick={checkGrammar} disabled={grammarLoading}>{grammarLoading ? 'Checking...' : 'Check Grammar'}</button>
            {/* Suggestions now in sidebar, not modal */}
            {grammarLoading ? (
              <div className="text-center py-4">Checking grammar...</div>
            ) : grammarSuggestions.length === 0 && !grammarLoading ? null : (
              <div className="mt-2">
                {grammarSuggestions.length === 0 ? (
                  <div className="text-center py-8">No issues found!</div>
                ) : (
                  <>
                    <button className="btn btn-success btn-sm mb-4 w-full" onClick={applyAllGrammarSuggestions}>Apply All</button>
                    <ul className="divide-y">
                      {grammarSuggestions.map((s, i) => (
                        <li key={i} className="py-2">
                          <div className="mb-1 text-base-content/80">{s.message}</div>
                          <div className="mb-1 text-xs text-base-content/60">Context: <span className="font-mono bg-base-200 px-1 rounded">{s.context.text}</span></div>
                          {s.replacements && s.replacements.length > 0 && (
                            <div className="flex gap-2 mt-1 items-center">
                              <button
                                className="btn btn-xs btn-primary max-w-[120px] truncate"
                                style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                onClick={() => applyGrammarSuggestion(s)}
                                title={s.replacements[0].value}
                              >
                                Apply: {s.replacements[0].value}
                              </button>
                              <button
                                className="btn btn-xs btn-ghost text-error px-2"
                                style={{ minWidth: 0 }}
                                onClick={() => handleDismissSuggestion(s)}
                                title="Dismiss"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {activeSidebarTab === 'readability' && (
          <div className="p-4 flex flex-col flex-grow">
            {/* Header */}
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-semibold">Readability</h2>
              {/* Removed settings button */}
            </div>

            {/* Analyze Button */}
            <button className="btn btn-primary btn-sm w-full mb-4" onClick={checkReadability}>Analyze Readability</button>

            {readability ? (
              <div className="space-y-3 flex-grow">
                {/* Overall Grade & Basic Stats */}
                <div className="p-3 rounded-lg bg-base-200 border border-base-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-base-content/80">Grade {readability.fleschKincaidGrade}</span>
                    <span className={`badge badge-sm ${readability.fleschKincaidGrade <= 8 ? 'badge-success' : readability.fleschKincaidGrade <= 12 ? 'badge-warning' : 'badge-error'}`}>
                      {readability.fleschKincaidGrade <= 8 ? 'Good' : readability.fleschKincaidGrade <= 12 ? 'Fair' : 'Hard'}
                    </span>
                  </div>
                  <div className="text-xs text-base-content/60 mb-2">
                    Based on Flesch-Kincaid
                  </div>
                  <hr className="border-base-300 my-2" />
                  <div className="text-xs text-base-content/60 mb-2">
                    {readability.wordCount} Words
                  </div>

                  {/* Collapsible Stats */}
                  <button
                    onClick={() => setShowReadabilityStats(!showReadabilityStats)}
                    className="text-xs text-primary hover:underline flex items-center w-full justify-between"
                  >
                    <span>{showReadabilityStats ? 'Show fewer stats' : 'Show more stats'}</span>
                    {showReadabilityStats ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </button>
                  {showReadabilityStats && (
                    <div className="mt-2 space-y-1 text-xs text-base-content/60">
                      <div>Characters: {readability.characterCount}</div>
                      <div>Sentences: {readability.sentenceCount}</div>
                      <div>Paragraphs: {readability.paragraphCount}</div>
                      <div>Reading time: {readability.readingTimeMinutes} min</div>
                    </div>
                  )}
                </div>

                {/* Detailed Issues */}
                {readability.veryHardSentenceCount > 0 && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/30 flex justify-between items-center">
                    <span className="text-sm font-semibold text-error">
                      {readability.veryHardSentenceCount} of {readability.sentenceCount} sentences is very hard to read.
                    </span>
                    <button className="btn btn-ghost btn-xs text-error" title="View details">
                      <FaEye />
                    </button>
                  </div>
                )}
                {readability.hardSentenceCount > 0 && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex justify-between items-center">
                    <span className="text-sm font-semibold text-warning">
                      {readability.hardSentenceCount} of {readability.sentenceCount} sentences is hard to read.
                    </span>
                    <button className="btn btn-ghost btn-xs text-warning" title="View details">
                      <FaEye />
                    </button>
                  </div>
                )}
                {readability.weakenerCount > 0 && (
                  <div className="p-3 rounded-lg bg-info/10 border border-info/30 flex justify-between items-center">
                    <span className="text-sm font-semibold text-info">
                      {readability.weakenerCount} weakeners.
                    </span>
                    <button className="btn btn-ghost btn-xs text-info" title="View details">
                      <FaEye />
                    </button>
                  </div>
                )}
                 {readability.passiveVoiceCount > 0 && (
                  <div className="p-3 rounded-lg bg-info/10 border border-info/30 flex justify-between items-center">
                    <span className="text-sm font-semibold text-info">
                      {readability.passiveVoiceCount} uses of passive voice.
                    </span>
                    <button className="btn btn-ghost btn-xs text-info" title="View details">
                      <FaEye />
                    </button>
                  </div>
                )}
                {readability.simpleAlternativeCount > 0 && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex justify-between items-center">
                    <span className="text-sm font-semibold text-purple-500">
                      {readability.simpleAlternativeCount} word with a simpler alternative.
                    </span>
                    <button className="btn btn-ghost btn-xs text-purple-500" title="View details">
                      <FaEye />
                    </button>
                  </div>
                )}

                {/* No Issues Message */}
                {readability.issues.length === 0 && (
                   <div className="text-center py-6 text-success">
                     <FaCheckCircle className="inline-block mr-2" /> No readability issues found!
                   </div>
                 )}

              </div>
            ) : (
              <div className="text-center text-base-content/60 mt-8 flex-grow flex flex-col items-center justify-center">
                <FaChartBar size={32} className="mb-2" />
                <p>Click "Analyze Readability" to get feedback.</p>
              </div>
            )}
          </div>
        )}
        {activeSidebarTab === 'earning' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Earning Optimiser</h2>
            <p className="text-base-content/70 text-sm mb-2">
              Get advanced, AI-powered suggestions to maximise your content's earning potential. The AI will analyse your content and provide:
              <ul className="list-disc ml-5 mt-2 text-sm text-base-content/70">
                <li>Actionable CTA improvements for higher conversions</li>
                <li>Affiliate program and partnership recommendations</li>
                <li>Ideas for digital products, services, or offers</li>
                <li>Upsell/cross-sell and funnel suggestions</li>
                <li>Platform-specific monetisation tips</li>
                <li>Audience segmentation and targeting advice</li>
                <li>Lead magnet and content upgrade ideas</li>
                <li>SEO/traffic strategies for monetisation</li>
                <li>Trust-building and authority signals</li>
              </ul>
            </p>
            <button
              className={`btn btn-primary btn-sm w-full mb-4 ${loading === 'earning-optimiser' ? 'loading' : ''}`}
              onClick={() => generateWithAI('earning-optimiser')}
              disabled={!!loading}
            >
              {loading === 'earning-optimiser' ? 'Analysing...' : 'Run Earning Optimiser'}
            </button>
            {loading === 'earning-optimiser' && (
              <div className="text-center py-4">Analysing your content for monetisation opportunities...</div>
            )}
            {activeSidebarTab === 'earning' && !loading && content && aiEarningInsights && (
              <EarningInsightsSidebar markdown={aiEarningInsights} />
            )}
          </div>
        )}
      </div>
      
      {/* Main content area with minimal editor - positioned with proper margins to avoid sidebar overlap */}
      <div ref={editorContainerRef} className="flex-1 px-8 py-8 w-[55%] ml-[20%] mr-[22rem]"> {/* Increased right margin to 22rem to match sidebar width */}
        {/* Clean, borderless editor with clear ending before sidebar */}
        <div className="min-h-[calc(100vh-100px)] max-w-[100%]">
          <ReactQuill
            forwardedRef={quillRef}
            value={content}
            onChange={(value: string) => {
              setContent(value);

              if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                const selection = editor.getSelection();
                if (selection) {
                  const [line, offset] = editor.getLine(selection.index);
                  const lineText = line.domNode.innerText;
                }
                // Always extract the first line of text as the title, regardless of formatting
                const text = editor.getText();
                const firstLine = text.split('\n')[0].trim();
                if (firstLine !== title) {
                  setTitle(firstLine);
                }
              }
            }}
            onFocus={() => {
              // When editor gets focus and is empty, apply heading format
              if (!content && quillRef.current) {
                const editor = quillRef.current.getEditor();
                editor.format('header', 1);
              }
              // Always update indicator on focus
              addEditorLabels();
            }}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Title"
            className="h-full medium-style-editor"
            theme="bubble"
            style={editorStyles}
          />
        </div>
      </div>
      
      {/* Protocol Selection Modal */}
        {isProtocolModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select a Writing Protocol</h3>
                <button 
                  onClick={() => setIsProtocolModalOpen(false)}
                  className="btn btn-sm btn-ghost"
                >
                  ✕
                </button>
              </div>
              
              {protocols.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base-content/70 mb-4">No writing protocols found</p>
                  <button 
                    onClick={() => router.push('/dashboard/create')}
                    className="btn btn-primary btn-sm"
                  >
                    Create a Protocol
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {protocols.map((protocol) => (
                    <div 
                      key={protocol.id}
                      onClick={() => selectProtocol(protocol)}
                      className="py-3 px-2 hover:bg-base-200 cursor-pointer rounded-lg transition-colors"
                    >
                      <h4 className="font-medium">{protocol.title}</h4>
                      <p className="text-sm text-base-content/70">
                        {protocol.userRole} • {protocol.industry}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
};

export default ContentHub;

// Add this component at the bottom of the file
function EarningInsightsSidebar({ markdown }: { markdown: string }) {
  // Parse plain text sections (no markdown)
  function extractSection(title: string) {
    if (title === 'Monetisation Score') {
      const match = markdown.match(/Monetisation Score:\s*(\d{1,3})/i);
      return match ? match[1] : '';
    }
    if (title === 'Score Explanation') {
      const match = markdown.match(/Score Explanation:\s*([\s\S]*?)(?=\n[A-Z][A-Za-z ]+:|$)/i);
      return match ? match[1].trim() : '';
    }
    return '';
  }

  const score = extractSection('Monetisation Score');
  const explanation = extractSection('Score Explanation');

  // Score color logic
  const scoreNum = parseInt(score, 10);
  let scoreColor = 'bg-gray-200 text-gray-700 border-gray-300';
  if (!isNaN(scoreNum)) {
    if (scoreNum >= 80) scoreColor = 'bg-green-50 text-green-700 border-green-400';
    else if (scoreNum >= 60) scoreColor = 'bg-yellow-50 text-yellow-700 border-yellow-400';
    else if (scoreNum >= 40) scoreColor = 'bg-orange-50 text-orange-700 border-orange-400';
    else scoreColor = 'bg-red-50 text-red-700 border-red-400';
  }

  const suggestions = (() => {
    const match = markdown.match(/Suggestions:\s*([\s\S]*?)(?=\n[A-Z][A-Za-z ]+:|$)/i);
    return match ? match[1].trim() : '';
  })();

  // Helper to render suggestions with markdown bold support
  function renderSuggestions(section: string) {
    if (!section || section.trim() === '' || section.trim().toLowerCase() === 'none') {
      return null;
    }
    // Split into lines, filter empty and lines that are just '-', and render markdown bold
    const items = section
      .split(/\n|\r/)
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0 && line !== '-');
    if (items.length === 0) return null;
    return (
      <ul className="list-disc ml-5 text-xs">
        {items.map((line, i) => {
          // Replace **bold** with <strong> for React rendering
          const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <li key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2 w-full">
      {!isNaN(scoreNum) && (
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full text-3xl font-bold shadow-lg border-4 ${scoreColor}`}>
            {scoreNum}
          </div>
          <span className="mt-2 text-xs font-medium text-base-content/70">Monetisation Score</span>
        </div>
      )}
      {explanation && (
        <div className="text-sm text-base-content/80 text-center mb-2">
          {explanation}
        </div>
      )}
      {renderSuggestions(suggestions)}
    </div>
  );
}
