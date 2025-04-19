"use client";

// Ensure the page is always rendered dynamically and never statically or cached
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import React, { useState, useRef, useEffect, Suspense, useCallback, Ref, JSX, useMemo } from 'react'; // Added Ref and JSX
import { FaLightbulb, FaMagic, FaCut, FaPen, FaPaperPlane, FaFilter, FaLink, FaTimes, FaCog, FaPlus, FaTrash, FaSave, FaSync, FaBold, FaItalic, FaQuoteLeft, FaHeading, FaRobot, FaRegCheckCircle, FaChartBar, FaDollarSign, FaEye, FaChevronDown, FaChevronUp, FaCommentDots, FaChevronRight, FaCheckCircle, FaRegClock, FaChevronLeft } from 'react-icons/fa'; // Added FaCommentDots, FaChevronRight, FaCheckCircle, FaRegClock, FaChevronLeft
import { FaWandMagicSparkles, FaSpellCheck, FaBookOpen, FaCoins } from 'react-icons/fa6'; // Use more relevant icons
import dynamicImport from 'next/dynamic';
import Delta from 'quill-delta'; // <<<--- ADD THIS IMPORT
import { marked } from 'marked'; // Import marked library
import { getReadability, analyzeReadability, ReadabilityResult as DetailedReadabilityResult, ReadabilityIssue } from '@/utils/readability'; // Import ReadabilityIssue
import AISettingsModal from '@/components/AISettingsModal'; // Import the new modal
import { type AIProviderConfig } from '@/components/AISettingsModal'; // Adjusted import
import InlineChat from '@/components/InlineChat'; // Import the new chat component
import { useRouter } from 'next/navigation';

// Import ReactQuill dynamically with SSR disabled
const ReactQuill = dynamicImport(() => import('react-quill').then(mod => ({
  default: ({ forwardedRef, ...props }: { forwardedRef?: React.Ref<any>; [key: string]: any }) => 
    <mod.default ref={forwardedRef} {...props} />
})), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

// +++ Define Readability Blot Config (Moved outside client check) +++
const readabilityBlotConfig: { name: string; className: string; color: string }[] = [
  { name: 'readability-very-hard', className: 'readability-highlight-very-hard', color: 'rgba(239, 68, 68, 0.3)' }, // Red
  { name: 'readability-hard', className: 'readability-highlight-hard', color: 'rgba(245, 158, 11, 0.3)' }, // Yellow
  { name: 'readability-passive', className: 'readability-highlight-passive', color: 'rgba(59, 130, 246, 0.2)' }, // Blue
  { name: 'readability-weakener', className: 'readability-highlight-weakener', color: 'rgba(59, 130, 246, 0.2)' }, // Blue
  { name: 'readability-simpler', className: 'readability-highlight-simpler', color: 'rgba(168, 85, 247, 0.2)' } // Purple
];
// +++ End Config +++

// --- Register Custom Quill Format for Grammar Suggestions and Readability Blots ---
let Inline: any;
let Quill: any;
if (typeof window !== 'undefined') {
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
        const root = node.closest('.ql-editor') as any;
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

  readabilityBlotConfig.forEach(config => {
    class ReadabilityBlot extends Inline {
      static blotName = config.name;
      static tagName = 'span';
      static className = config.className;
      static create(value: any) {
        const node = super.create() as HTMLElement;
        if (typeof value === 'object' && value !== null) {
          node.dataset.issue = JSON.stringify(value);
        }
        return node;
      }
      static formats(domNode: HTMLElement) {
        const data = domNode.dataset.issue;
        if (data) {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error("Error parsing readability issue data from DOM", e);
          }
        }
        return super.formats(domNode);
      }
      format(name: string, value: any) {
        if (name === (this.constructor as any).blotName && value) {
          if (typeof value === 'object' && value !== null) {
            (this.domNode as HTMLElement).dataset.issue = JSON.stringify(value);
          } else {
            delete (this.domNode as HTMLElement).dataset.issue;
          }
        } else {
          super.format(name, value);
        }
      }
    }
    Quill.register(ReadabilityBlot);
  });
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
  // --- ALL HOOKS MUST BE HERE ---
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false); // State for AI settings modal
  const [aiConfigs, setAiConfigs] = useState<AIProviderConfig[]>([]); // State for AI configs
  const quillRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null); // Ref for the editor container
  const [selectedModelId, setSelectedModelId] = useState<string>('default'); // Keep this state
  const [isChatVisible, setIsChatVisible] = useState(false); // State for chat visibility
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar open/close state

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

  // State for autosave status and word count <<<--- ADD THESE BACK
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [wordCount, setWordCount] = useState(0);

  // --- Autosave Logic ---
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(() => {
    setSaveStatus('unsaved');
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      console.log("Autosaving content...");
      setTimeout(() => {
        localStorage.setItem('contentHubAutosave', content);
        localStorage.setItem('contentHubTitleAutosave', title);
        setSaveStatus('saved');
        console.log("Content autosaved.");
      }, 1000);
    }, 2000);
  }, [content, title]);

  // Load content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('contentHubAutosave');
    const savedTitle = localStorage.getItem('contentHubTitleAutosave');
    if (savedContent) {
      setContent(savedContent);
       if (quillRef.current) {
         const editor = quillRef.current.getEditor();
         editor.clipboard.dangerouslyPasteHTML(0, savedContent);
         const text = editor.getText();
         setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
       }
    }
    if (savedTitle) {
      setTitle(savedTitle);
    }
    setSaveStatus('saved');
  }, []);

  // Trigger autosave on content change & calculate word count
  useEffect(() => {
    if (status === 'authenticated') {
        triggerAutosave();
    }
    if (quillRef.current) {
        const text = quillRef.current.getEditor().getText();
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [content, status, triggerAutosave]);
  // --- End Autosave Logic ---

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

  // --- Save/load selected protocol to localStorage ---
  useEffect(() => {
    // On mount, try to load protocol from localStorage
    const savedProtocolId = typeof window !== 'undefined' ? localStorage.getItem('selectedProtocolId') : null;
    if (savedProtocolId && protocols.length > 0) {
      const found = protocols.find(p => p.id === savedProtocolId);
      if (found) setSelectedProtocol(found);
    }
  }, [protocols]);

  useEffect(() => {
    // Save protocol to localStorage when changed
    if (selectedProtocol && typeof window !== 'undefined') {
      localStorage.setItem('selectedProtocolId', selectedProtocol.id);
    }
  }, [selectedProtocol]);

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

  // +++ Handle Specific Edit Suggestion Response +++
  const handleEditSuggestionResponse = (suggestion: { replacement: string; index: number; length: number }) => {
    if (!quillRef.current || !suggestion) return;
    const editor = quillRef.current.getEditor();
    const { replacement, index, length } = suggestion;

    // Validate the suggestion range before applying
    const editorLength = editor.getLength();
    if (typeof index !== 'number' || typeof length !== 'number' || index < 0 || length < 0 || index + length > editorLength) {
      console.error("Invalid suggestion range received:", suggestion);
      toast.error("Received an invalid edit suggestion.");
      return;
    }

    editor.history.cutoff(); // Start grouping changes
    // Apply the change: delete original text and insert replacement
    editor.deleteText(index, length, 'silent'); // Delete silently
    editor.insertText(index, replacement, 'user'); // Insert as user action for undo
    editor.setSelection(index, replacement.length); // Select the change
    editor.history.cutoff(); // End grouping changes

    toast.success("Edit applied!");
  };
  // +++ End Handle Specific Edit Suggestion Response +++


  // AI enhancement functions
  const generateWithAI = async (action: string) => {
    const selectedText = action === 'ideas' ||
                         action === 'article' ||
                         action === 'social' ||
                         action === 'email' ||
                         action === 'carousel' ||
                         action === 'storytelling' ||
                         action === 'expert-breakdown'
                         ? '' : getSelectedText(); // getSelectedText now returns the full text if nothing is selected

    // For suggest_edit, we need the selection range as well
    let selectionRange: { index: number; length: number } | null = null;
    if (action === 'suggest_edit' && quillRef.current) {
        const editor = quillRef.current.getEditor();
        selectionRange = editor.getSelection(); // Get current selection { index, length }
        if (!selectionRange || selectionRange.length === 0) {
            toast.error('Please select the text you want to suggest an edit for.');
            return;
        }
    } else if (!selectedText.trim() &&
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
      const body: any = {
        text: selectedText, // The text to work on (full or selection)
        action,
        title, // Pass the current document title
        personalContext,
        // Request non-streaming for suggest_edit, streaming for others
        stream: action !== 'suggest_edit'
      };

      // Add selection range info for suggest_edit
      if (action === 'suggest_edit' && selectionRange) {
        body.selectionIndex = selectionRange.index;
        body.selectionLength = selectionRange.length;
      }


      if (selectedModelId !== 'default') {
        // Parse providerId and modelId from dropdown value
        const [providerId, modelId] = selectedModelId.split('::');
        body.providerId = providerId;
        body.modelId = modelId;
      }
      const response = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process with AI' }));
        throw new Error(errorData.error || 'Failed to process with AI');
      }

      // --- Handle suggest_edit (non-streaming) ---
      if (action === 'suggest_edit') {
        const suggestion = await response.json();
        // **API Change Needed:** The API for 'suggest_edit' should return a JSON like:
        // { replacement: "suggested text", index: original_index, length: original_length }
        // where index/length refer to the *original* document state when the request was made.
        if (suggestion && typeof suggestion.replacement === 'string' && typeof suggestion.index === 'number' && typeof suggestion.length === 'number') {
            handleEditSuggestionResponse(suggestion);
        } else {
            console.error("Invalid response format for suggest_edit:", suggestion);
            toast.error("Could not get a valid edit suggestion.");
        }
        setLoading(null); // Ensure loading state is cleared
        return; // Exit early for non-streaming response
      }
      // --- End suggest_edit handling ---


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
        setLoading(null); // Ensure loading state is cleared here too
        return;
      }

      // Handle the streaming response for other actions
      await handleStreamingResponse(response, () => {
        toast.success(`Content ${action} complete!`);
      });

    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      // setLoading(null); // Already handled within specific action blocks or after await handleStreamingResponse
    }
  };

  // Function to handle streaming AI responses (Ensure loading state is cleared on completion/error)
  const handleStreamingResponse = async (response: Response, onComplete?: () => void) => {
    let success = false;
    let initialInsertion = true;
    let insertionIndex: number | null = null;
    let insertedLength = 0; // Track length of AI inserted content for replacement

    if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        insertionIndex = range.index;

        // Add null check for insertionIndex
        if (insertionIndex !== null) {
            const lineFormats = editor.getFormat(insertionIndex);
            if (lineFormats.header) {
                editor.insertText(insertionIndex, '\n', 'silent'); // Insert newline silently
                insertionIndex++;
                editor.formatLine(insertionIndex, 1, 'header', false, 'silent'); // Format silently
                editor.setSelection(insertionIndex, 0);
            }
        }
    }

    if (insertionIndex === null) {
        console.error("Could not determine insertion index for streaming response.");
        toast.error("Could not insert AI response.");
        setLoading(null);
        return;
    }

    // --- Start Grouping AI Insertion ---
    quillRef.current?.getEditor().history.cutoff();

    try {
        if (!response.body) throw new Error('Response body is null');
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

                if (quillRef.current) {
                    const editor = quillRef.current.getEditor();
                    const htmlContent = marked(accumulatedMarkdown);
                    const delta = editor.clipboard.convert(htmlContent); // Convert HTML to Delta

                    if (initialInsertion) {
                        // Insert the first chunk
                        editor.updateContents([{ retain: insertionIndex }, ...delta.ops], 'silent'); // Insert silently
                        insertedLength = delta.length();
                        initialInsertion = false;
                    } else {
                        // Replace the previously inserted content
                        const replaceDelta = new Delta()
                            .retain(insertionIndex)
                            .delete(insertedLength) // Delete old content
                            .concat(delta); // Insert new content
                        editor.updateContents(replaceDelta, 'silent'); // Replace silently
                        insertedLength = delta.length(); // Update inserted length
                    }

                    // Move cursor to the end of the inserted content (optional, can be jumpy)
                    // editor.setSelection(insertionIndex + insertedLength, 0);
                }
            }
        }

        // --- Finalize and Add to History ---
        if (quillRef.current && !initialInsertion) {
            const editor = quillRef.current.getEditor();
            // Create a delta representing the *final* insertion as a user action
            const finalHtmlContent = marked(accumulatedMarkdown);
            const finalDelta = editor.clipboard.convert(finalHtmlContent);
            const finalUserActionDelta = new Delta()
                .retain(insertionIndex)
                .delete(insertedLength) // Remove the silently inserted content
                .concat(finalDelta); // Add the final content as a user action

            // Apply the final change with 'user' source AFTER the cutoff
            editor.updateContents(finalUserActionDelta, 'user');
            editor.setSelection(insertionIndex + finalDelta.length(), 0); // Move cursor to end
        } else if (quillRef.current && initialInsertion && accumulatedMarkdown) {
             // Handle case where content was generated but loop didn't run subsequent times
             const editor = quillRef.current.getEditor();
             const finalHtmlContent = marked(accumulatedMarkdown);
             const finalDelta = editor.clipboard.convert(finalHtmlContent);
             editor.updateContents([{ retain: insertionIndex }, ...finalDelta.ops], 'user'); // Insert as user action
             editor.setSelection(insertionIndex + finalDelta.length(), 0);
        }

        success = true;
    } catch (error: any) {
        console.error("Error handling streaming response:", error);
        toast.error(`Stream error: ${error.message}`);
        // Attempt to rollback the silent changes if error occurred mid-stream? Difficult.
        // Best effort: rely on the initial cutoff. User might need to undo multiple times if error happens late.
    } finally {
        // --- End Grouping AI Insertion ---
        // Cutoff again AFTER the final 'user' update (if successful) or on error
        quillRef.current?.getEditor().history.cutoff();

        setLoading(null);
        if (success && onComplete) {
            onComplete();
        }
    }
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
    // Add custom CSS to style the editor like Medium and apply requested changes
    const style = document.createElement('style');
    style.textContent = `
      .medium-style-editor .ql-editor {
        font-family: medium-content-sans-serif-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        font-size: 20px;
        line-height: 1.7;
        color: rgba(0,0,0,0.84);
        font-weight: 400;
        letter-spacing: 0;
        font-style: normal;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: transparent;
        padding: 20px 0 0 0; /* Add 20px top padding to ensure first line is visible */
      }
      /* Only the first h1 is the title, first h2 is subtitle */
      .medium-style-editor .ql-editor h1 {
        font-size: 2.8rem; /* Increased title size */
        font-weight: 700;
        margin: 0 0 0.1em 0;
        line-height: 1.15;
        color: #111;
      }
      .medium-style-editor .ql-editor h2 {
        font-size: 1.5rem; /* Increased subtitle size */
        font-weight: 500;
        color: #757575;
        margin: 0 0 1.2em 0;
        line-height: 1.2;
      }
      .medium-style-editor .ql-editor h1:not(:first-of-type),
      .medium-style-editor .ql-editor h2:not(:first-of-type) {
        color: #111;
        margin: 1.5em 0 0.5em 0;
      }
      .medium-style-editor .ql-editor h2:not(:first-of-type) {
        color: #111;
        font-size: 1.15rem;
        font-weight: 600;
        margin: 1.2em 0 0.5em 0;
        line-height: 1.3;
      }
      .medium-style-editor .ql-editor h1 + h2 {
        margin-top: 0;
      }
      .medium-style-editor .ql-editor h3 {
        font-size: 1.15rem;
        font-weight: 600;
        margin: 1.5em 0 0.5em 0;
        line-height: 1.3;
        color: #111;
      }
      .medium-style-editor .ql-editor h4 {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 1.2em 0 0.5em 0;
        line-height: 1.3;
        color: #111;
      }
      .medium-style-editor .ql-editor p {
        margin: 0 0 1.1em 0;
      }
      .medium-style-editor .ql-editor blockquote {
        border-left: 3px solid #d1d5db;
        padding: 0.5rem 1rem;
        margin: 1.5rem 0;
        color: #4b5563;
        font-style: italic;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 0 4px 4px 0;
      }
      /* Floating toolbar: black background, white icons/text */
      .floating-toolbar {
        position: fixed;
        z-index: 100010 !important;
        background: #111;
        border-radius: 8px;
        box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
        border: 1px solid #222;
        padding: 0.5rem 0.75rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
        min-width: 220px;
        min-height: 40px;
        transition: box-shadow 0.2s;
      }
      .floating-toolbar button, .floating-toolbar svg, .floating-toolbar strong, .floating-toolbar em, .floating-toolbar span {
        color: #fff !important;
        fill: #fff !important;
      }
      .floating-toolbar button {
        background: none;
        border: none;
        font-size: 1rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .floating-toolbar button:hover {
        background: #222;
      }
      .floating-toolbar .divider {
        width: 1px;
        height: 24px;
        background: #333;
        margin: 0 0.5rem;
      }
      /* Image hover/select border styles */
      .medium-style-editor .ql-editor img {
        display: block;
        margin: 2.5em auto 0.5em auto;
        max-width: 100%;
        border-radius: 8px;
        box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
        background: #f8f8f8;
        border: 2px solid transparent;
        transition: border-color 0.2s;
      }
      .medium-style-editor .ql-editor img:hover {
        border-color: #22c55e; /* light green */
      }
      .medium-style-editor .ql-editor img.selected {
        border-color: #15803d; /* dark green */
      }
      /* Simple figcaption for image description */
      .medium-style-editor .ql-editor figcaption {
        display: block;
        text-align: center;
        font-size: 0.98em;
        color: #757575;
        margin-top: 0.5em;
        padding: 0 1em;
        outline: none;
        min-height: 1.2em;
        font-style: italic;
      }
      .medium-style-editor .ql-editor figcaption:empty::before {
        content: 'Type caption for image (optional)';
        color: #adb5bd;
        cursor: text;
      }
      /* Remove top gap for editor area */
      .editor-no-top-gap {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .medium-style-editor .ql-editor .grammar-suggestion-underline {
        text-decoration: underline wavy red;
        text-decoration-skip-ink: none;
        background-color: rgba(255, 0, 0, 0.05);
        cursor: pointer;
      }
      .medium-style-editor .ql-editor .readability-highlight-very-hard { background-color: rgba(239, 68, 68, 0.3); }
      .medium-style-editor .ql-editor .readability-highlight-hard { background-color: rgba(245, 158, 11, 0.3); }
      .medium-style-editor .ql-editor .readability-highlight-passive { background-color: rgba(59, 130, 246, 0.2); }
      .medium-style-editor .ql-editor .readability-highlight-weakener { background-color: rgba(59, 130, 246, 0.2); }
      .medium-style-editor .ql-editor .readability-highlight-simpler { background-color: rgba(168, 85, 247, 0.2); }
      /* Editor Placeholder Styling */
      .medium-style-editor .ql-editor.ql-blank::before {
        content: attr(data-placeholder);
        position: absolute;
        left: 0; /* Align with editor padding */
        top: 20px; /* Align with editor padding */
        color: rgba(0,0,0,0.3);
        pointer-events: none;
        font-style: normal;
        font-size: 2.8rem; /* Match h1 size */
        font-weight: 700; /* Match h1 weight */
        line-height: 1.15; /* Match h1 line-height */
      }
      /* Ensure editor container is clickable */
      .medium-style-editor {
        cursor: text;
        min-height: 100px; /* Ensure some minimum clickable height */
      }
      /* Hide scrollbar */
      .scrollbar-hide::-webkit-scrollbar {
          display: none;
      }
      .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // --- Fix paste behavior: only first line is title, rest is normal ---
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault(); // Prevent default paste behavior
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const text = clipboardData.getData('text/plain');
      const html = clipboardData.getData('text/html');

      quill.history.cutoff(); // Group paste operation

      if (html) {
        // If HTML is available, use it but process it
        const delta = quill.clipboard.convert(html); // Convert HTML to Delta
        // Modify the delta if needed (e.g., strip unwanted formats)
        quill.updateContents(delta, 'user'); // Apply delta, source 'user' for undo
      } else if (text) {
        // Fallback to plain text
        const range = quill.getSelection(true);
        quill.insertText(range.index, text, 'user'); // Insert text, source 'user' for undo
      }

      // Ensure formatting is correct after paste (e.g., first line H1)
      // This might need adjustment based on desired paste behavior
      const firstLineFormat = quill.getFormat(0);
      if (!firstLineFormat.header) {
        quill.formatLine(0, 1, 'header', 1, 'silent'); // Re-apply header silently if needed
      }

      quill.history.cutoff(); // End grouping
    };

    quill.root.addEventListener('paste', handlePaste);

    return () => {
      if (quillRef.current) {
         // Check if root exists before removing listener
         const editorRoot = quillRef.current.getEditor()?.root;
         if (editorRoot) {
            editorRoot.removeEventListener('paste', handlePaste);
         }
      }
    };
  }, [quillRef]); // Dependency on quillRef

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

    // + Button logic for empty lines
    if (quill && range) {
      if (range.length === 0 && source === 'user') {
        const [line, offset] = quill.getLine(range.index);
        if (line && line.domNode && line.length() <= 1) {
          const lineBounds = line.domNode.getBoundingClientRect();
          const editorBounds = editorContainerRef.current?.getBoundingClientRect();
          if (editorBounds) {
            setPlusButton({
              visible: true,
              top: editorBounds.top + lineBounds.top + window.scrollY,
              lineNode: line.domNode
            });
          } else {
            setPlusButton({ visible: false, top: 0, lineNode: null });
          }
        } else {
          setPlusButton({ visible: false, top: 0, lineNode: null });
          setPlusMenuVisible(false);
        }
      } else {
        setPlusButton({ visible: false, top: 0, lineNode: null });
        setPlusMenuVisible(false);
      }
    } else {
      setPlusButton({ visible: false, top: 0, lineNode: null });
      setPlusMenuVisible(false);
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

  // --- Image Upload and Paste Logic for FigureBlot ---
  // --- Use Quill's default image handling ---
const imageHandler = useCallback(() => {
  if (typeof window === 'undefined') return;
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!quillRef.current) return;
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, 'image', e.target?.result, 'user');
        editor.setSelection(range.index + 1, 0, 'silent');
      };
      reader.readAsDataURL(file);
    }
  };
}, [quillRef]);

const quillModules = useMemo(() => ({
  toolbar: { container: null, handlers: { image: imageHandler } },
  clipboard: {
    matchers: [
      // Remove custom 'figure' matcher
      // Use default image matcher
    ],
  },
  history: { delay: 2000, maxStack: 500, userOnly: true },
  // --- Explicitly disable tooltip module to remove white input box ---
  tooltip: false,
}), [imageHandler]);

const quillFormats = [
  'header', 'bold', 'italic', 'link', 'blockquote',
  'grammar-suggestion',
  'readability-very-hard',
  'readability-hard',
  'readability-passive',
  'readability-weakener',
  'readability-simpler',
  'image', // Use default image format
  // Add other formats as needed
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

  // Helper to apply underlines based on suggestions
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
        // Ensure length is at least 1
        if (typeof suggestionData.offset === 'number' && typeof suggestionData.length === 'number' && suggestionData.offset >= 0 && suggestionData.length >= 1) {
           // Check bounds to prevent errors
           // Quill's length is often 1 more than expected for the last character due to newline
           const editorContentLength = editor.getLength() -1; // Adjust for potential trailing newline
           if (suggestionData.offset + suggestionData.length <= editorContentLength) {
              // Use offset/length directly
              editor.formatText(
                suggestionData.offset,
                suggestionData.length,
                'grammar-suggestion',
                suggestionData,
                'silent'
              );
           } else if (suggestionData.offset < editorContentLength) {
              // If offset is valid but length goes over, format up to the end
              const adjustedLength = editorContentLength - suggestionData.offset;
              if (adjustedLength > 0) {
                 editor.formatText(
                   suggestionData.offset,
                   adjustedLength,
                   'grammar-suggestion',
                   { ...suggestionData, length: adjustedLength }, // Update data with adjusted length
                   'silent'
                 );
                 console.warn("Adjusted suggestion underline length due to out-of-bounds:", suggestionData);
              } else {
                 console.warn("Skipping suggestion underline, offset valid but length calculation failed:", suggestionData);
              }
           } else {
              console.warn("Skipping suggestion underline due to out-of-bounds offset:", suggestionData);
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
      applyUnderlines([]); // Ensure underlines are cleared on error
    } finally {
      setGrammarLoading(false);
    }
  };

  // Apply a single suggestion
  const applyGrammarSuggestion = (suggestion: any) => { // No longer needs async
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const { offset, length, replacements, id, context } = suggestion;

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
      editor.history.cutoff();
      // Use offset/length directly, no +1
      editor.formatText(offset, length, 'grammar-suggestion', false, 'silent');
      editor.deleteText(offset, length, 'silent');
      editor.insertText(offset, replacementValue, 'user');
      editor.history.cutoff();
      // Update offsets of remaining suggestions
      const deltaLength = replacementValue.length - length;
      const updatedSuggestions = grammarSuggestions
        .filter(s => s.id !== id)
        .map(s => {
          if (s.offset > offset) {
            return { ...s, offset: s.offset + deltaLength };
          }
          return s;
        });
      applyUnderlines(updatedSuggestions);
      setGrammarSuggestions(updatedSuggestions);
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

  // +++ Helper to apply readability highlights (Delta Clearing, Object Apply) +++
  const applyReadabilityHighlights = (issues: ReadabilityIssue[]) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const length = editor.getLength();

    // --- Reset Highlights First (Using Delta) ---
    const resetAttributes: { [key: string]: null } = {};
    readabilityBlotConfig.forEach(config => {
      resetAttributes[config.name] = null;
    });
    const resetDelta = { ops: [{ retain: length, attributes: resetAttributes }] };
    try {
      editor.updateContents(resetDelta, 'silent');
    } catch (e) {
      // ignore
    }

    // Apply new highlights using correct index/length
    if (issues.length > 0) {
      editor.history.cutoff();
      issues.forEach((issue) => {
        const blotName = getReadabilityBlotName(issue.type);
        // Use issue.index and issue.text.length
        const highlightIndex = typeof issue.index === 'number' ? issue.index : 0;
        let highlightLength = issue.text ? issue.text.length : 0;
        // Ensure length is at least 1
        if (
          blotName &&
          highlightIndex >= 0 &&
          highlightLength >= 1
        ) {
          // Check bounds
          const editorContentLength = editor.getLength() - 1; // Adjust for potential trailing newline
          if (highlightIndex + highlightLength <= editorContentLength) {
            try {
              editor.formatText(highlightIndex, highlightLength, blotName, issue, 'silent');
            } catch (e) {
              console.warn("Error applying readability format:", e, issue);
            }
          } else if (highlightIndex < editorContentLength) {
             // Adjust length if it goes over
             const adjustedLength = editorContentLength - highlightIndex;
             if (adjustedLength > 0) {
                try {
                   editor.formatText(highlightIndex, adjustedLength, blotName, { ...issue, text: issue.text.substring(0, adjustedLength) }, 'silent');
                   console.warn("Adjusted readability highlight length due to out-of-bounds:", issue);
                } catch (e) {
                   console.warn("Error applying adjusted readability format:", e, issue);
                }
             } else {
                console.warn("Skipping readability highlight, offset valid but length calculation failed:", issue);
             }
          } else {
             console.warn("Skipping readability highlight due to out-of-bounds offset:", issue);
          }
        } else {
           console.warn("Skipping readability highlight due to invalid index/length:", issue);
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
      onMouseDown={e => e.preventDefault()} // Prevent editor losing focus
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
            className=""
          >
            <FaLink className={isTextLinked() ? "text-green-500" : ""} />
          </button>
          
          {/* Separator */}
          <div className="divider"></div>
          
          {/* Structure formatting group */}
          <button onClick={() => handleFormatText('header', 1)} title="Title">
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>T</span>
          </button>
          <button onClick={() => handleFormatText('header', 2)} title="Subtitle">
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>T</span>
          </button>
          <button onClick={() => handleFormatText('blockquote')} title="Quote">
            <span style={{ fontSize: '16px' }}>"</span>
          </button>

          {/* Separator */}
          <div className="divider"></div>

        </>
      )}
    </div>
  );

  // Ensure readability highlights are always in sync with sidebar
  useEffect(() => {
    if (activeSidebarTab === 'readability' && readability && quillRef.current) {
      applyReadabilityHighlights(readability.issues);
    } else if (quillRef.current) {
      applyReadabilityHighlights([]); // Clear highlights when not in readability tab
    }
  }, [activeSidebarTab, readability]);

  // Ensure only one type of highlight is visible at a time
  useEffect(() => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const length = editor.getLength();
    if (activeSidebarTab === 'readability' && readability) {
      // Clear grammar highlights
      editor.formatText(0, length, 'grammar-suggestion', false, 'silent');
      applyReadabilityHighlights(readability.issues);
    } else if (activeSidebarTab === 'grammar' && grammarSuggestions.length > 0) {
      // Clear readability highlights
      readabilityBlotConfig.forEach((config) => {
        editor.formatText(0, length, config.name, false, 'silent');
      });
      applyUnderlines(grammarSuggestions);
    } else {
      // Clear all highlights if not in either tab
      editor.formatText(0, length, 'grammar-suggestion', false, 'silent');
      readabilityBlotConfig.forEach((config) => {
        editor.formatText(0, length, config.name, false, 'silent');
      });
    }
  }, [activeSidebarTab, readability, grammarSuggestions]);

  // Effect to fetch AI configurations on mount
  useEffect(() => {
    const fetchAiConfigs = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/ai/settings');
          if (response.ok) {
            const data = await response.json();
            // Ensure IDs are generated if missing
            const configsWithIds = (data.configs || []).map((config: any, index: number) => ({
              ...config,
              id: config.id || `config-${Date.now()}-${index}`
            }));
            setAiConfigs(configsWithIds);
            // Ensure defaultModelId exists in the fetched configs or default to 'default'
            const defaultExists = configsWithIds.some((cfg: AIProviderConfig) =>
              (cfg.models || '').split(',').some(m => `${cfg.id}::${m.trim()}` === data.defaultModelId)
            );
            setSelectedModelId(defaultExists ? data.defaultModelId : 'default');

          } else {
            console.error('Failed to fetch AI settings');
            // Set default empty state on failure
             setAiConfigs([]);
             setSelectedModelId('default');
          }
        } catch (error) {
          console.error('Error fetching AI settings:', error);
           // Set default empty state on error
           setAiConfigs([]);
           setSelectedModelId('default');
        }
      } else {
         // Set default empty state if not authenticated
         setAiConfigs([]);
         setSelectedModelId('default');
      }
    };
    fetchAiConfigs();
  }, [status]);

  // Function to save AI configurations
  const handleSaveAISettings = async ({ configs, defaultModelId }: { configs: AIProviderConfig[], defaultModelId: string }) => {
    // Basic validation (optional, can be enhanced)
    const validConfigs = configs.filter(c => c.name && c.endpoint && c.models && c.apiKey);
    if (validConfigs.length !== configs.length) {
       toast.error('Please fill all fields for each provider.');
       throw new Error('Incomplete configuration');
    }

    try {
      const response = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: validConfigs, defaultModelId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save AI settings');
      }

      const saved = await response.json();
      setAiConfigs((saved.configs || []).map((config: any, index: number) => ({
         ...config,
         id: config.id || `${Date.now()}-saved-${index}`
       })));
      setSelectedModelId(saved.defaultModelId || 'default');
      toast.success('AI settings saved successfully!');
      setIsAISettingsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving AI settings:', error);
      toast.error(`Failed to save settings: ${error.message}`);
      throw error;
    }
  };

  // Model selection state
  // Update modelOptions and default selection logic
const defaultAkashModelId = aiConfigs
  .filter((cfg: AIProviderConfig) => cfg.name?.toLowerCase().includes('akash'))
  .flatMap((cfg: AIProviderConfig) =>
    (cfg.models || '').split(',').map((modelId: string) => ({
      id: `${cfg.id}::${modelId.trim()}`,
      label: `${cfg.name} – ${modelId.trim()}`,
      isMetaLlama: modelId.trim() === 'Meta-Llama-4-Maverick-17B-128E-Instruct-FP8'
    }))
  )
  .find((opt: { id: string; label: string; isMetaLlama: boolean }) => opt.isMetaLlama)?.id || 'default';

const modelOptions = [
  { id: defaultAkashModelId, label: 'Meta-Llama-4-Maverick-17B-128E-Instruct-FP8 (Akash)' },
  ...aiConfigs.flatMap((cfg: AIProviderConfig) =>
    (cfg.models || '').split(',').map((modelId: string) => ({
      id: `${cfg.id}::${modelId.trim()}`,
      label: `${cfg.name} – ${modelId.trim()}`
    }))
  )
];

// Set the default model on AI config fetch
useEffect(() => {
  const fetchAiConfigs = async () => {
    if (status === 'authenticated') {
      try {
        const response = await fetch('/api/ai/settings');
        if (response.ok) {
          const data = await response.json();
          const configsWithIds = (data.configs || []).map((config: any, index: number) => ({
            ...config,
            id: config.id || `config-${Date.now()}-${index}`
          }));
          setAiConfigs(configsWithIds);

          // Prefer Meta-Llama-4-Maverick-17B-128E-Instruct-FP8 (Akash) as default
          const akashDefault = configsWithIds
            .filter((cfg: AIProviderConfig) => cfg.name?.toLowerCase().includes('akash'))
            .flatMap((cfg: { models: any; id: any; }) =>
              (cfg.models || '').split(',').map((modelId: string) => ({
                id: `${cfg.id}::${modelId.trim()}`,
                isMetaLlama: modelId.trim() === 'Meta-Llama-4-Maverick-17B-128E-Instruct-FP8'
              }))
            )
            .find((opt: { isMetaLlama: any; }) => opt.isMetaLlama)?.id;

          setSelectedModelId(akashDefault || 'default');
        } else {
          setAiConfigs([]);
          setSelectedModelId('default');
        }
      } catch {
        setAiConfigs([]);
        setSelectedModelId('default');
      }
    } else {
      setAiConfigs([]);
      setSelectedModelId('default');
    }
  };
  fetchAiConfigs();
}, [status]);

  // Function to handle model changes from chat or sidebar
  const handleModelChange = (newModelId: string) => {
    setSelectedModelId(newModelId);
    // Optionally save this as the new default? For now, just update state.
  };

  // Helper to get model display name
  const getModelName = (id: string) => {
    const found = modelOptions.find(opt => opt.id === id);
    return found ? found.label : id;
  };

  // Function to upload image and insert into Quill
   // uploadImageAndInsert dependency

  // Add state for the "+" button
  const [plusButton, setPlusButton] = useState<{ visible: boolean; top: number; lineNode: HTMLElement | null }>({ visible: false, top: 0, lineNode: null });
  const [plusMenuVisible, setPlusMenuVisible] = useState(false);

  // --- Custom Paste Handler for Links ---
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const root = quill.root;
    const handlePaste = (e: ClipboardEvent) => {
      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        const clipboardData = e.clipboardData || (window as any).clipboardData;
        const pastedText = clipboardData?.getData('text');
        if (pastedText && /^https?:\/\//i.test(pastedText.trim())) {
          e.preventDefault();
          quill.format('link', pastedText.trim());
          return;
        }
      }
    };
    root.addEventListener('paste', handlePaste);
    return () => root.removeEventListener('paste', handlePaste);
  }, [quillRef]);

  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  

  // Add this state near the other useState hooks
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatModelId, setChatModelId] = useState(selectedModelId);

  // Handle sending a message to the AI (same logic as InlineChat, but sidebar UI)
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    const apiChatHistory = chatMessages.map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const body: any = {
        text: userMessage.content,
        action: 'chat',
        stream: true,
        chatHistory: apiChatHistory,
      };
      if (chatModelId !== 'default') {
        const [providerId, modelId] = chatModelId.split('::');
        body.providerId = providerId;
        body.modelId = modelId;
      }
      const response = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get response from AI' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      // Streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantResponse = '';
      let hasAssistant = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantResponse += chunk;
          setChatMessages(prev => {
            if (hasAssistant || (prev.length && prev[prev.length - 1].role === 'assistant')) {
              hasAssistant = true;
              return [
                ...prev.slice(0, -1),
                { role: 'assistant', content: assistantResponse }
              ];
            }
            hasAssistant = true;
            return [...prev, { role: 'assistant', content: assistantResponse }];
          });
        }
      }
    } catch (error: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, chatMessages, chatModelId]);

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-80' : 'w-16'} bg-[#f7f8fa] border-r border-[#e3e8f0]`}>
        {/* Sidebar toggle button */}
        <button
          className="absolute top-4 right-[-18px] z-40 bg-blue-500 text-white rounded-full shadow-lg w-8 h-8 flex items-center justify-center hover:bg-blue-600 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          style={{ outline: 'none' }}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'p-8 pb-4' : 'p-2 items-center'}`}>
          {/* Logo/Header */}
          <div className={`flex items-center gap-3 mb-8 ${sidebarOpen ? '' : 'justify-center'}`}>
            <img 
              src='icon128.png' 
              alt="Logo"
              className={`w-8 h-8 rounded-full ${sidebarOpen ? 'block' : 'hidden'}`}
              style={{ filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))' }} // Optional shadow effect  
            />
            {sidebarOpen && <span className="font-bold text-xl tracking-tight text-gray-800">Content Hub</span>}
          </div>
          {/* Protocol Connect */}
          {sidebarOpen && (
            <div className="mb-6">
              <button 
                onClick={() => setIsProtocolModalOpen(true)}
                className={`btn ${selectedProtocol ? 'btn-primary' : 'btn-outline'} btn-sm w-full flex items-center justify-center gap-2`}
              >
                <FaLink className="mr-2" />
                {selectedProtocol ? (
                  <span className="font-semibold text-base-content truncate max-w-[10rem]">{selectedProtocol.title}</span>
                ) : (
                  <span className="text-base-content/60">Connect Protocol</span>
                )}
              </button>
            </div>
          )}
          {/* 4-tab system */}
          <div className={`flex ${sidebarOpen ? 'gap-2 mb-6' : 'flex-col gap-4 mb-4 items-center'}`}>
            <button className={`flex-1 flex items-center justify-center py-2 rounded-full text-sm font-semibold transition ${activeSidebarTab === 'ai' ? 'bg-blue-500 text-white shadow' : 'bg-white/80 text-blue-500 border border-blue-200'} ${sidebarOpen ? '' : 'w-10 h-10 p-0'}`} onClick={() => setActiveSidebarTab('ai')} title="AI Suggestions"><FaWandMagicSparkles className="text-lg" /></button>
            <button className={`flex-1 flex items-center justify-center py-2 rounded-full text-sm font-semibold transition ${activeSidebarTab === 'grammar' ? 'bg-blue-500 text-white shadow' : 'bg-white/80 text-blue-500 border border-blue-200'} ${sidebarOpen ? '' : 'w-10 h-10 p-0'}`} onClick={() => setActiveSidebarTab('grammar')} title="Grammar"><FaSpellCheck className="text-lg" /></button>
            <button className={`flex-1 flex items-center justify-center py-2 rounded-full text-sm font-semibold transition ${activeSidebarTab === 'readability' ? 'bg-blue-500 text-white shadow' : 'bg-white/80 text-blue-500 border border-blue-200'} ${sidebarOpen ? '' : 'w-10 h-10 p-0'}`} onClick={() => setActiveSidebarTab('readability')} title="Readability"><FaBookOpen className="text-lg" /></button>
            <button className={`flex-1 flex items-center justify-center py-2 rounded-full text-sm font-semibold transition ${activeSidebarTab === 'earning' ? 'bg-blue-500 text-white shadow' : 'bg-white/80 text-blue-500 border border-blue-200'} ${sidebarOpen ? '' : 'w-10 h-10 p-0'}`} onClick={() => setActiveSidebarTab('earning')} title="Earning"><FaCoins className="text-lg" /></button>
          </div>
          {/* Tab content (modern, minimal, scrollable) */}
          <div className={`flex-1 overflow-y-auto scrollbar-hide ${sidebarOpen ? 'px-1 pb-4' : 'hidden'}`} style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {activeSidebarTab === 'ai' && (
              <>{/* AI Suggestions tab content (enhance, quick prompts, model select, etc) */}
                <div className="mb-6">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block">AI Model</label>
                    <select
                    className="bg-white border border-gray-300 text-sm text-gray-700 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition max-w-full"
                    value={selectedModelId}
                    onChange={e => handleModelChange(e.target.value)}
                    >
                    {modelOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow hover:scale-[1.03] transition-transform mt-2"
                    onClick={() => setIsAISettingsModalOpen(true)}
                  >
                    <FaCog /> AI Settings
                  </button>
                </div>
                <div className="mb-8">
                  <div className="text-xs text-gray-500 font-semibold mb-2 ml-1">Enhance Content</div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => generateWithAI('improve')} disabled={!!loading} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow-sm hover:scale-[1.03] transition-transform ${loading === 'improve' ? 'opacity-60' : ''}`}><FaMagic className="opacity-80" /> Improve Writing</button>
                    <button onClick={() => generateWithAI('rewrite')} disabled={!!loading} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 text-white font-medium shadow-sm hover:scale-[1.03] transition-transform ${loading === 'rewrite' ? 'opacity-60' : ''}`}><FaPen className="opacity-80" /> Rewrite Content</button>
                    <button onClick={() => generateWithAI('shorten')} disabled={!!loading} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-medium shadow-sm hover:scale-[1.03] transition-transform ${loading === 'shorten' ? 'opacity-60' : ''}`}><FaCut className="opacity-80" /> Summarize & Shorten</button>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="text-xs text-gray-500 font-semibold mb-2 ml-1">Quick Prompts</div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => generateWithAI('ideas')} disabled={!!loading} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-900 font-medium shadow-sm hover:scale-[1.03] transition-transform ${loading === 'ideas' ? 'opacity-60' : ''}`}><FaLightbulb className="opacity-80" /> Content Ideas</button>
                    <button onClick={() => generateWithAI('article')} disabled={!!loading || !title} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-medium shadow-sm hover:scale-[1.03] transition-transform ${loading === 'article' ? 'opacity-60' : ''}`} title={title ? '' : 'Enter a title in the editor to generate an outline'}><FaWandMagicSparkles className="opacity-80" /> Generate Outline</button>
                  </div>
                </div>
              </>
            )}
            {activeSidebarTab === 'grammar' && (
              <div className="p-4 flex flex-col h-full">
                <h2 className="text-lg font-semibold mb-2">Grammar Checker</h2>
                <p className="text-base-content/70 text-sm mb-2">Check your content for grammar issues.</p>
                <button className="btn btn-primary btn-sm w-full mb-2" onClick={checkGrammar} disabled={grammarLoading}>{grammarLoading ? 'Checking...' : 'Check Grammar'}</button>
                {grammarLoading ? (
                  <div className="text-center py-4">Checking grammar...</div>
                ) : grammarSuggestions.length === 0 && !grammarLoading ? (
                  <div className="text-center text-base-content/60 text-sm py-4">No grammar issues found.</div>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-base-content/80">{grammarSuggestions.length} issue{grammarSuggestions.length > 1 ? 's' : ''} found</span>
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={applyAllGrammarSuggestions}
                        disabled={grammarSuggestions.length === 0}
                      >
                        Apply All
                      </button>
                    </div>
                    <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 320 }}>
                      {grammarSuggestions.map((suggestion, idx) => (
                        <div key={suggestion.id || idx} className="rounded-lg border border-base-300 bg-base-100 p-3 mb-2 flex flex-col gap-1 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base-content">{suggestion.message}</span>
                          </div>
                          {suggestion.replacements && suggestion.replacements.length > 0 && (
                            <div className="text-xs text-base-content/70">
                              Suggestion: <span className="font-semibold text-green-700">{suggestion.replacements[0].value}</span>
                            </div>
                          )}
                          {suggestion.context && suggestion.context.text && (
                            <div className="text-xs text-base-content/50 italic">
                              <span className="opacity-70">…{suggestion.context.text}…</span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {suggestion.replacements && suggestion.replacements.length > 0 && (
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => applyGrammarSuggestion(suggestion)}
                              >
                                Apply
                              </button>
                            )}
                            <button
                              className="btn btn-xs btn-outline"
                              onClick={() => handleDismissSuggestion(suggestion)}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSidebarTab === 'readability' && (
              <div className="p-4 flex flex-col h-full">
                <h2 className="text-lg font-semibold mb-2">Readability Analysis</h2>
                <p className="text-base-content/70 text-sm mb-2">Analyze your content for readability and clarity.</p>
                <button className="btn btn-primary btn-sm w-full mb-2" onClick={checkReadability} disabled={loading === 'readability'}>
                  {loading === 'readability' ? 'Analyzing...' : 'Analyze Readability'}
                </button>
                {readability && (
                  <div className="flex flex-col gap-3 mt-2">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex flex-col items-center bg-base-200 rounded-lg p-2">
                        <span className="text-xs text-base-content/60">Grade</span>
                        <span className="font-bold text-lg text-blue-700">{readability.fleschKincaidGrade}</span>
                      </div>
                      <div className="flex flex-col items-center bg-base-200 rounded-lg p-2">
                        <span className="text-xs text-base-content/60">Reading Ease</span>
                        <span className="font-bold text-lg text-green-700">{readability.fleschReadingEase}</span>
                      </div>
                      <div className="flex flex-col items-center bg-base-100 rounded-lg p-2">
                        <span className="text-xs text-base-content/60">Words</span>
                        <span className="font-semibold">{readability.wordCount}</span>
                      </div>
                      <div className="flex flex-col items-center bg-base-100 rounded-lg p-2">
                        <span className="text-xs text-base-content/60">Sentences</span>
                        <span className="font-semibold">{readability.sentenceCount}</span>
                      </div>
                      <div className="flex flex-col items-center bg-base-100 rounded-lg p-2">
                        <span className="text-xs text-base-content/60">Paragraphs</span>
                        <span className="font-semibold">{readability.paragraphCount}</span>
                      </div>
                      <div className="flex flex-col items-center bg-base-100 rounded-lg p-2">
                        <span className="text-xs text-base-content/60">Reading Time</span>
                        <span className="font-semibold">{readability.readingTimeMinutes} min</span>
                      </div>
                    </div>
                    {/* Issues grouped Hemingway-style */}
                    <div className="overflow-y-auto scrollbar-hide flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}> {/* Make issues scrollable and ensure it fills remaining space */}
                      <ReadabilityIssuesHemingway issues={readability.issues} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSidebarTab === 'earning' && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">Earning Optimiser</h2>
                <p className="text-base-content/70 text-sm mb-2">
                  Get advanced, AI-powered suggestions to maximise your content's earning potential.
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
        </div>
        {/* Modern settings button at bottom */}

      </aside>
      {/* Main Content Area (Editor + Right Sidebar) */}
      <main className="flex-1 flex flex-col relative min-h-screen transition-all duration-300" style={{ marginLeft: sidebarOpen ? 320 : 64 }}>
        {/* Editor Container */}
        <div
          ref={editorContainerRef}
          className={`flex-1 px-8 py-8 pb-48 editor-no-top-gap transition-all duration-300 relative`} // removed mx-auto
          style={{
            maxWidth: '700px',
            marginRight: isChatSidebarOpen ? '440px' : 'auto',
            marginLeft: 0, // always left-aligned
          }}
        >
          {/* + Button Portal */}
          {typeof window !== 'undefined' && plusButton.visible && createPortal(
            <div
              className="fixed z-[9990]"
              style={{
                top: `${plusButton.top}px`,
                left: `${((editorContainerRef.current?.getBoundingClientRect()?.left ?? 0) + (editorContainerRef.current?.clientWidth ?? 0) / 2) - (700 / 2) - 40}px`
              }}
              onMouseDown={e => e.preventDefault()}
            >
              <button
                onClick={() => setPlusMenuVisible(!plusMenuVisible)}
                className="btn btn-xs btn-ghost btn-circle border border-base-300 hover:bg-base-200"
                title="Add content"
              >
                <FaPlus size={12} />
              </button>
              {/* "+" Button Menu */}
              {plusMenuVisible && (
                <div className="absolute left-full top-0 ml-2 w-32 bg-base-100 border border-base-300 rounded-md shadow-lg py-1 z-[9991]">
                  <button
                    onClick={() => {
                      imageHandler();
                      setPlusMenuVisible(false);
                    }}
                    className="flex items-center w-full px-3 py-1.5 text-sm hover:bg-base-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Image
                  </button>
                  {/* Add other menu items here later */}
                </div>
              )}
            </div>,
            document.body
          )}

          {/* Floating toolbar portal */}
          {typeof window !== 'undefined' && createPortal(
            floatingToolbarJSX, // Assuming floatingToolbarJSX is defined correctly elsewhere
            document.body
          )}

          {/* Suggestion Popup Portal */}
          {typeof window !== 'undefined' && popupSuggestion && popupPosition && createPortal(
            <div className="suggestion-popup-container">
                <SuggestionPopup
                  suggestion={popupSuggestion}
                  position={popupPosition as { top: number; left: number }}
                  onApply={applyGrammarSuggestion}
                  onDismiss={() => handleDismissSuggestion(popupSuggestion)}
                />
            </div>,
            document.body
          )}

          {/* Inner div for the actual Quill editor */}
          <div ref={editorContainerRef} className="min-h-[calc(100vh-100px)] w-full">
            <ReactQuill
              forwardedRef={quillRef}
              value={content}
              onChange={(value: string, delta: any, source: string, editorInstance: any) => {
                setContent(value);
                const text = editorInstance.getText();
                const firstLine = text.split('\n')[0].trim();
                if (firstLine !== title) {
                  setTitle(firstLine);
                }
                const placeholder = firstLine ? 'Tell your story...' : 'Title';
                if (quillRef.current) {
                  const editor = quillRef.current.getEditor();
                  editor.root.dataset.placeholder = placeholder;
                }
              }}
              onFocus={() => {
                if (!content && quillRef.current) {
                  const editor = quillRef.current.getEditor();
                  editor.formatLine(0, 1, 'header', 1);
                  editor.root.dataset.placeholder = 'Title';
                }
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
        </div> {/* Closing div for the editor container */}

        {/* Chat open button (fixed, right) */}
        {!isChatSidebarOpen && (
          <button
            className="fixed top-8 right-8 z-50 bg-blue-600 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-blue-700 transition"
            onClick={() => setIsChatSidebarOpen(true)}
            title="Open AI Chat"
          >
            <FaCommentDots />
          </button>
        )}

        {/* Chat Sidebar (Right) */}
        {isChatSidebarOpen && (
          <aside className="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-[#e3e8f0] shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#e3e8f0]">
              <span className="font-bold text-lg text-blue-600 flex items-center gap-2">
                <FaCommentDots className="text-blue-400" /> Chat
              </span>
              <button
                className="btn btn-ghost btn-sm btn-circle" // Make it a circle
                onClick={() => setIsChatSidebarOpen(false)}
                title="Close chat"
              >
                <FaTimes />
              </button>
            </div>
            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-6">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-base-content/60 pt-16">
                  <FaCommentDots className="text-4xl mb-4 text-blue-200" />
                  <div className="text-lg font-medium">How can I assist you?</div>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] shadow ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white self-end'
                        : 'bg-base-200 text-base-content self-start'
                    }`}
                    style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={msg.role === 'assistant'
                      ? { __html: typeof msg.content === 'string' ? msg.content : '' }
                      : undefined}
                  >
                    {msg.role === 'user' ? msg.content : null}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 bg-base-200 text-base-content max-w-[80%] shadow animate-pulse">
                    ...
                  </div>
                </div>
              )}
              <div id="chat-bottom" />
            </div>
            {/* Input Area - minimal, no border, compact, matches theme */}
            <form
              className="flex items-center gap-2 px-4 py-3 bg-white"
              style={{ borderTop: 'none' }}
              onSubmit={e => {
                e.preventDefault();
                sendChatMessage();
              }}
            >
              <input
                type="text"
                className="flex-1 bg-white rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Type your request…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isChatLoading}
                autoFocus
                style={{ minWidth: 0 }}
              />
              <select
                className="bg-transparent text-sm text-gray-500 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-200"
                value={selectedModelId}
                style={{ minWidth: 90, maxWidth: 120 }}
                onChange={e => handleModelChange(e.target.value)}
              >
                {modelOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="ml-1 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition disabled:opacity-60"
                disabled={isChatLoading || !chatInput.trim()}
                style={{ minWidth: 36, minHeight: 36 }}
                title="Send"
              >
                {isChatLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <FaPaperPlane size={16} />
                )}
              </button>
            </form>
          </aside>
        )}

        {/* Modals */}
        <AISettingsModal
          isOpen={isAISettingsModalOpen}
          onClose={() => setIsAISettingsModalOpen(false)}
          onSave={handleSaveAISettings}
          initialConfigs={aiConfigs}
          defaultModelId={selectedModelId}
        />
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
      </main> {/* Closing tag for main content area */}

      {/* Status Bar - Placed outside main, but within the root div */}
      <footer
        className="fixed bottom-0 left-0 right-0 h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-4 z-40 transition-all duration-300"
        style={{ paddingLeft: sidebarOpen ? 'calc(320px + 1rem)' : 'calc(64px + 1rem)', paddingRight: isChatSidebarOpen ? 'calc(420px + 1rem)' : '1rem' }} // Adjust padding based on both sidebars
      >
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {saveStatus === 'saved' && <><FaRegCheckCircle className="text-green-500" /><span>Saved</span></>}
          {saveStatus === 'saving' && <><FaSync className="animate-spin" /><span>Saving...</span></>}
          {saveStatus === 'unsaved' && <><FaRegClock className="text-yellow-500" /><span>Unsaved changes</span></>}
        </div>
        <div className="text-xs text-gray-500">
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </div>
      </footer>

    </div> // This closing div matches the opening div of the main return statement
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
    
    // Simply use the raw content directly without fancy processing
    // Only replace markdown bold with HTML strong
    const formattedContent = section.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return (
      <div className="text-xs space-y-2">
        <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
      </div>
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

// Add this component at the bottom of the file
function ReadabilityIssuesHemingway({ issues }: { issues: ReadabilityIssue[] }) {
  // Group issues by type
  const groups: { [type: string]: ReadabilityIssue[] } = {};
  issues.forEach(issue => {
    if (!groups[issue.type]) groups[issue.type] = [];
    groups[issue.type].push(issue);
  });

  // Define display order and labels/colors
  const order: { type: ReadabilityIssue['type'], label: string, color: string }[] = [
    { type: 'very-hard', label: 'Very hard to read', color: 'bg-red-100 text-red-700 border-red-300' },
    { type: 'hard', label: 'Hard to read', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { type: 'passive', label: 'Passive voice', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { type: 'weakener', label: 'Weakening phrase', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { type: 'simpler-alternative', label: 'Simpler alternative', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {order.map(({ type, label, color }) => (
        groups[type] && groups[type].length > 0 && (
          <div key={type}>
            <div className={`flex items-center gap-2 mb-1`}>
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${color}`}>{label}</span>
              <span className="text-xs text-base-content/50">{groups[type].length}</span>
            </div>
            <ul className="ml-2 flex flex-col gap-1">
              {groups[type].map((issue, idx) => (
                <li key={idx} className="text-sm bg-base-100 rounded px-2 py-1 border-l-4" style={{
                  borderColor:
                    type === 'very-hard' ? '#ef4444' :
                    type === 'hard' ? '#f59e0b' :
                    type === 'passive' ? '#3b82f6' :
                    type === 'weakener' ? '#60a5fa' :
                    type === 'simpler-alternative' ? '#a855f7' : '#ddd'
                }}>
                  <span className="font-medium">{issue.text}</span>
                  {issue.suggestion && (
                    <span className="ml-2 text-xs text-green-700">→ {issue.suggestion}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
}