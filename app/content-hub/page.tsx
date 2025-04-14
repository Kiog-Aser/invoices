"use client";

// This ensures the page is rendered dynamically at request time, not statically at build time
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { FaLightbulb, FaMagic, FaCut, FaPen, FaUserCircle, FaFilter, FaLink } from 'react-icons/fa';
import dynamicImport from 'next/dynamic';

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
  const enhanceWithAI = async (action: string) => {
    const selectedText = getSelectedText();
    
    // For ideas generation, we don't need any text selected
    if (!selectedText.trim() && action !== 'ideas') {
      toast.error('Please select some text or write content first');
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
          title,
          personalContext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process with AI');
      }

      const data = await response.json();
      
      if (data.text) {
        insertText(data.text, true); // Mark as AI response
        toast.success(`Content ${action} complete!`);
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };
  
  // Handle protocol selection
  const selectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setIsProtocolModalOpen(false);
    toast.success(`Connected to "${protocol.title}" protocol`);
  };

  // Get template prompt for specialized content
  const getSpecializedPrompt = (type: string) => {
    if (!selectedProtocol?.aiGeneratedContent) {
      return "Generate professional content...";
    }

    const niche = selectedProtocol.aiGeneratedContent.nicheAuthority?.fullNiche || selectedProtocol.industry;
    const role = selectedProtocol.userRole;
    const coreMessage = selectedProtocol.aiGeneratedContent.nicheAuthority?.coreMessage || '';
    const targetAudience = selectedProtocol.aiGeneratedContent.nicheAuthority?.targetAudience || [];

    switch(type) {
      case 'article':
        return `Generate a structured outline for an article titled "${title || '[Insert Title]'}" for a ${role} in the ${niche} industry.

1. **Hook**: Write a bold, curiosity-driven opening that addresses the reader's pain points or goals.
2. **Core Message**: Summarize the article's key lesson or value proposition in 1 sentence.
3. **Actionable Sections**: Include 3-5 subheadings with practical advice (e.g., step-by-step systems, frameworks, or relatable stories).
4. **Closing**: End with a strong call-to-action encouraging immediate next steps.`;
      
      case 'ideas':
        return `Generate 3-5 content ideas (1-2 sentences each) for a ${role} in the ${niche} industry.
${coreMessage ? `Core message: ${coreMessage}` : ''}
${targetAudience.length > 0 ? `Target audience: ${targetAudience.join(', ')}` : ''}

Include:
1. Expertise ideas (frameworks, step-by-step guides, tips)
2. Personal journey ideas (your story, lessons learned, case studies)
3. Client proof ideas (success stories, results, transformations)`;
      
      
      default:
        return `Generate professional content about "${title || '[topic]'}" for a ${role} in the ${niche} industry.`;
    }
  };

  // Custom toolbar that only shows on text selection
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Configure editor with our custom toolbar handler
  const modules = {
    toolbar: false, // Hide the default toolbar
    keyboard: {
      bindings: {
        // You could add custom keyboard shortcuts here if needed
      }
    }
  };
  
  // Track if we need to apply subtitle styling
  const [isSecondLine, setIsSecondLine] = useState(false);

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
  
  // Handle text selection to show the toolbar
  useEffect(() => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const editorRoot = editor.root;
    
    const checkSelection = () => {
      // Get current selection
      const selection = editor.getSelection();
      
      if (selection && selection.length > 0) {
        // Text is selected, position the toolbar above the selection
        const bounds = editor.getBounds(selection.index, selection.length);
        
        // Make sure we have valid bounds
        if (bounds && bounds.width > 0) {
          setTimeout(() => {
            // Get the toolbar width (or use an estimated width if not yet rendered)
            const toolbarWidth = toolbarRef.current ? toolbarRef.current.offsetWidth : 250;
            const editorBounds = editorRoot.getBoundingClientRect();
            
            // Calculate position centered above the selection
            const left = Math.max(
              0, 
              Math.min(
                editorBounds.left + bounds.left + (bounds.width / 2) - (toolbarWidth / 2),
                window.innerWidth - toolbarWidth - 20
              )
            );
            
            // Set position and show toolbar
            setToolbarPosition({
              left,
              top: editorBounds.top + bounds.top - 45 // Position above with offset
            });
            
            setShowToolbar(true);
            
            // Detect if we're on the second line
            const text = editor.getText();
            const firstLineBreakPos = text.indexOf('\n');
            
            // If there's a line break and our selection starts after it
            if (firstLineBreakPos !== -1 && selection.index > firstLineBreakPos && 
                // But before any possible second line break
                (text.indexOf('\n', firstLineBreakPos + 1) === -1 || 
                 selection.index < text.indexOf('\n', firstLineBreakPos + 1))) {
              setIsSecondLine(true);
            } else {
              setIsSecondLine(false);
            }
          }, 0);
        }
      } else {
        setShowToolbar(false);
      }
    };
    
    // Check selection on mouse up and key combinations
    editorRoot.addEventListener('mouseup', checkSelection);
    editorRoot.addEventListener('keyup', (e: KeyboardEvent) => {
      // Only check on certain keys that might modify selection
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift'];
      if (e.key && keys.includes(e.key)) {
        checkSelection();
      }
    });
    
    // Explicitly check after mousedown to catch selection changes
    editorRoot.addEventListener('mousedown', () => {
      setTimeout(checkSelection, 10);
    });
    
    // Hide toolbar when clicking outside editor
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node) && e.target !== editorRoot) {
        setShowToolbar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      editorRoot.removeEventListener('mouseup', checkSelection);
      editorRoot.removeEventListener('mousedown', () => {
        setTimeout(checkSelection, 10);
      });
      editorRoot.removeEventListener('keyup', checkSelection);
      document.removeEventListener('mousedown', handleClickOutside);
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
        
        // Special case: if this is the second line and we're applying h2 (small T)
        if (value === 2 && isSecondLine && !shouldRemove) {
          // We need to add the subtitle class
          setTimeout(() => {
            // Find the H2 element that was just created
            const h2Elements = editor.root.querySelectorAll('h2');
            h2Elements.forEach((h2: HTMLHeadingElement) => {
              // Only add class if it doesn't already have it
              if (!h2.classList.contains('subtitle')) {
                h2.classList.add('subtitle');
              }
            });
          }, 10);
        }
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

  return (
    <div className="min-h-screen bg-base-100 flex relative">
      {/* Floating toolbar for text selection */}
      {showToolbar && (
        <div 
          ref={toolbarRef}
          className="floating-toolbar"
          style={{ 
            top: `${toolbarPosition.top}px`, 
            left: `${toolbarPosition.left}px` 
          }}
          onClick={e => e.preventDefault()}
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
      <div className="w-64 border-l border-base-200 h-screen flex flex-col p-4 fixed right-0">
        <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>
        
        {/* Protocol Selection */}
        <div className="mb-6">
          <button 
            onClick={() => setIsProtocolModalOpen(true)}
            className="btn btn-outline btn-sm w-full"
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
        
        {/* AI Tools */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-medium text-base-content/70 mb-1">Enhance</h3>
          <button 
            onClick={() => enhanceWithAI('improve')}
            disabled={!!loading}
            className={`btn btn-sm w-full justify-start ${loading === 'improve' ? 'loading' : ''}`}
          >
            <FaMagic className="mr-2" /> Improve Writing
          </button>
          <button 
            onClick={() => enhanceWithAI('ideas')}
            disabled={!!loading}
            className={`btn btn-sm w-full justify-start ${loading === 'ideas' ? 'loading' : ''}`}
          >
            <FaLightbulb className="mr-2" /> Generate Ideas
          </button>
          <button 
            onClick={() => enhanceWithAI('shorten')} 
            disabled={!!loading}
            className={`btn btn-sm w-full justify-start ${loading === 'shorten' ? 'loading' : ''}`}
          >
            <FaCut className="mr-2" /> Shorten
          </button>
          <button 
            onClick={() => enhanceWithAI('rewrite')} 
            disabled={!!loading}
            className={`btn btn-sm w-full justify-start ${loading === 'rewrite' ? 'loading' : ''}`}
          >
            <FaPen className="mr-2" /> Rewrite
          </button>
        </div>
        
        {/* Template Buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-base-content/70 mb-1">Templates</h3>
          <button 
            onClick={() => insertText(getSpecializedPrompt('article'))}
            className="btn btn-sm btn-outline w-full justify-start"
          >
            Article Template
          </button>
          <button 
            onClick={() => insertText(getSpecializedPrompt('social'))}
            className="btn btn-sm btn-outline w-full justify-start"
          >
            Social Media Template
          </button>
          <button 
            onClick={() => insertText(getSpecializedPrompt('email'))}
            className="btn btn-sm btn-outline w-full justify-start"
          >
            Email Template
          </button>
          <button 
            onClick={() => insertText(getSpecializedPrompt('carousel'))}
            className="btn btn-sm btn-outline w-full justify-start"
          >
            Carousel Template
          </button>
        </div>
      </div>
      
      {/* Main content area with minimal editor - positioned with proper margins to avoid sidebar overlap */}
      <div className="flex-1 px-8 py-8 w-[55%] ml-[20%] mr-[30%]">
        {/* Clean, borderless editor with clear ending before sidebar */}
        <div className="min-h-[calc(100vh-100px)] max-w-[100%]">
          <ReactQuill
            forwardedRef={quillRef}
            value={content}
            onChange={(value: string) => {
              setContent(value);
              
              // Automatically extract first line as title if it's formatted as heading
              if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                const delta = editor.getContents();
                
                // Check if first line is formatted as a heading
                if (delta.ops && delta.ops.length > 0) {
                  // If first line is a heading, extract it as title
                  const firstOp = delta.ops[0];
                  if (firstOp.insert && typeof firstOp.insert === 'string' && 
                      firstOp.attributes && firstOp.attributes.header) {
                    const firstLine = firstOp.insert.split('\n')[0].trim();
                    if (firstLine !== title) {
                      setTitle(firstLine);
                    }
                  }
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
            modules={modules}
            formats={formats}
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
