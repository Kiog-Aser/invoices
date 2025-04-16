"use client";

// This ensures the page is rendered dynamically at request time, not statically at build time
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { FaLightbulb, FaMagic, FaCut, FaPen, FaUserCircle, FaFilter, FaLink, FaTimes, FaCog, FaPlus, FaTrash, FaSave, FaSync, FaBold, FaItalic, FaQuoteLeft, FaHeading } from 'react-icons/fa';
import dynamicImport from 'next/dynamic';
import { marked } from 'marked'; // Import marked library

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

  // Add state for slash command popup
  const [slashCommand, setSlashCommand] = useState<{show: boolean, top: number, left: number, text: string}>({show: false, top: 0, left: 0, text: ''});

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
      const range = editor.getSelection(true);
      
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
        editor.setSelection(targetIndex, 0);
        
        // Set up for typing animation
        const insertIndex = targetIndex;
        
        // Use typing effect animation for AI responses
        typeTextEffect(editor, text, insertIndex, () => {
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
      .medium-style-editor .ql-editor h2.subtitle {
        color: rgba(75, 85, 99, 0.5); /* More grey to match the subtitle label */
        font-size: 1.75rem;
        font-weight: 600;
        margin-top: -0.75em; /* Reduced spacing to bring it closer to title */
        margin-bottom: 1.25em;
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
      .editor-side-label {
        position: fixed;
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
    const existingLabels = document.querySelectorAll('.editor-side-label');
    existingLabels.forEach(label => label.remove());
    
    // Get the editor bounds
    const editorBounds = editorRoot.getBoundingClientRect();
    const editorContainer = editorRoot.parentElement;
    
    if (!editorContainer) return;
    
    // Find the first line break to determine title and subtitle positions
    const firstLineBreakPos = text.indexOf('\n');
    
    if (firstLineBreakPos !== -1) {
      // We have at least a title
      const titleBounds = editor.getBounds(0, firstLineBreakPos);
      
      // Find if there's a second line that might be a subtitle
      const secondLineBreakPos = text.indexOf('\n', firstLineBreakPos + 1);
      const secondLineLength = secondLineBreakPos === -1 ? 
        text.length - (firstLineBreakPos + 1) : 
        secondLineBreakPos - (firstLineBreakPos + 1);
      
      let hasSubtitle = false;
      let subtitleBounds = null;
      
      // Check if second line exists and is formatted as a subtitle (h2)
      if (secondLineLength > 0) {
        const secondLineFormat = editor.getFormat(firstLineBreakPos + 1, 1);
        
        if (secondLineFormat.header === 2) {
          hasSubtitle = true;
          subtitleBounds = editor.getBounds(firstLineBreakPos + 1, secondLineLength);
        }
      }
      
      // Create a single container that will hold both labels and a single line
      const labelContainer = document.createElement('div');
      labelContainer.className = 'editor-labels-container';
      labelContainer.style.position = 'fixed';
      labelContainer.style.left = '265px';
      labelContainer.style.top = `${titleBounds.top + editorBounds.top}px`;
      labelContainer.style.zIndex = '5';
      labelContainer.style.pointerEvents = 'none';
      
      // Calculate the height to cover both title and subtitle if present
      const containerHeight = hasSubtitle && subtitleBounds ? 
        (subtitleBounds.top + subtitleBounds.height) - titleBounds.top : 
        titleBounds.height;
      
      labelContainer.style.height = `${containerHeight}px`;
      
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
      
      labelContainer.appendChild(titleLabel);
      document.body.appendChild(labelContainer);
    }
  };

  // Function to handle text selection changes for the floating toolbar
  const handleSelectionChange = useCallback((range: any, oldRange: any, source: string) => {
    const quill = quillRef.current?.getEditor();
    const editorContainer = editorContainerRef.current;
    if (!quill || !editorContainer) return;
    if (range && range.length > 0 && source === 'user') {
      const bounds = quill.getBounds(range.index, range.length);
      const editorRect = editorContainer.getBoundingClientRect();
      const toolbarWidth = 250;
      const top = editorRect.top + window.scrollY + bounds.top - 50;
      const left = Math.max(
        editorRect.left + window.scrollX,
        Math.min(
          editorRect.left + window.scrollX + bounds.left + (bounds.width / 2) - (toolbarWidth / 2),
          window.innerWidth + window.scrollX - toolbarWidth - 10
        )
      );
      setFloatingToolbar({ visible: true, top: Math.max(0, top), left: Math.max(0, left) });
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
  }, []);

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.on('selection-change', handleSelectionChange);
      return () => {
        quill.off('selection-change', handleSelectionChange);
      };
    }
  }, [handleSelectionChange]);

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
    'header', 'bold', 'italic', 'link', 'blockquote'
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

  // --- SLASH COMMAND HANDLER ---
  useEffect(() => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    // Attach only once on mount
    const handleSlashCommand = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSlashCommand(s => ({...s, show: false}));
      }
      if (e.key === 'Enter') {
        const selection = editor.getSelection();
        if (selection && selection.length === 0) {
          const [line, offset] = editor.getLine(selection.index);
          const lineText = line.domNode.innerText.trim();
          if (lineText.startsWith('/')) {
            if (lineText === '/ideas') {
              const lineStart = selection.index - offset;
              editor.deleteText(lineStart, lineText.length + 1);
              setTimeout(() => generateWithAI('ideas'), 0);
              setSlashCommand(s => ({...s, show: false}));
              e.preventDefault();
            } else if (lineText === '/outline') {
              const lineStart = selection.index - offset;
              editor.deleteText(lineStart, lineText.length + 1);
              setTimeout(() => generateWithAI('article'), 0);
              setSlashCommand(s => ({...s, show: false}));
              e.preventDefault();
            }
          }
        }
      }
    };
    editor.root.addEventListener('keydown', handleSlashCommand);
    return () => editor.root.removeEventListener('keydown', handleSlashCommand);
  }, []); // Only run once on mount

  // Ensure selection-change handler is always attached when editor is ready
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.on('selection-change', handleSelectionChange);
      return () => {
        quill.off('selection-change', handleSelectionChange);
      };
    }
  }, [quillRef.current, handleSelectionChange]);

  return (
    <div className="min-h-screen bg-base-100 flex relative">
      {/* Floating toolbar for text selection */}
      {floatingToolbar.visible && ( // Use floatingToolbar.visible
        <div 
          ref={toolbarRef}
          className="floating-toolbar"
          style={{ 
            top: `${floatingToolbar.top}px`, // Use floatingToolbar.top
            left: `${floatingToolbar.left}px` // Use floatingToolbar.left
          }}
          // Prevent clicks inside toolbar from causing editor to lose focus/selection
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
      )}
      
      {/* Sidebar with AI tools - now on the right */}
      <div className="w-64 border-l border-base-200 h-screen flex flex-col p-4 fixed right-0 overflow-y-auto">
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
        {/* Enhance Content Section (restored) */}
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
        {/* Only show Ideas and Outline in content generation/templates */}
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
      </div>
      
      {/* Main content area with minimal editor - positioned with proper margins to avoid sidebar overlap */}
      <div ref={editorContainerRef} className="flex-1 px-8 py-8 w-[55%] ml-[20%] mr-[30%]">
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
                  if (lineText.trim().startsWith('/')) {
                    const bounds = editor.getBounds(selection.index);
                    setSlashCommand({
                      show: true,
                      top: bounds.top + bounds.height,
                      left: bounds.left,
                      text: lineText.trim()
                    });
                  } else {
                    setSlashCommand(s => ({...s, show: false}));
                  }
                }
                // Always extract the first line of text as the title, regardless of formatting
                const text = editor.getText();
                const firstLine = text.split('\n')[0].trim();
                if (firstLine !== title) {
                  setTitle(firstLine);
                }
                // Update the title/subtitle indicators
                setTimeout(() => addEditorLabels(), 10);
              }
            }}
            onFocus={() => {
              // When editor gets focus and is empty, apply heading format
              if (!content && quillRef.current) {
                const editor = quillRef.current.getEditor();
                editor.format('header', 1);
              }
            }}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Title"
            className="h-full medium-style-editor"
            theme="bubble"
            style={editorStyles}
          />
          {/* Slash command suggestion popup */}
          {slashCommand.show && (
            <div
              style={{
                position: 'fixed',
                top: slashCommand.top + (editorContainerRef.current?.getBoundingClientRect().top || 0) + window.scrollY,
                left: slashCommand.left + (editorContainerRef.current?.getBoundingClientRect().left || 0) + window.scrollX,
                zIndex: 10000,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                padding: 8,
                minWidth: 180,
              }}
            >
              <div
                className="cursor-pointer hover:bg-base-200 px-2 py-1 rounded"
                onMouseDown={e => {
                  e.preventDefault();
                  setSlashCommand(s => ({...s, show: false}));
                  generateWithAI('ideas');
                }}
              >
                <strong>/ideas</strong> – Generate Content Ideas
              </div>
              <div
                className="cursor-pointer hover:bg-base-200 px-2 py-1 rounded"
                onMouseDown={e => {
                  e.preventDefault();
                  setSlashCommand(s => ({...s, show: false}));
                  generateWithAI('article');
                }}
              >
                <strong>/outline</strong> – Generate Outline
              </div>
            </div>
          )}
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
