import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

interface TextEditorProps {
  content: string;
  setContent: (content: string) => void;
  placeholder?: string;
}

export default function TextEditor({ content, setContent, placeholder }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<{index: number, length: number} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Detect dark mode from system preferences or CSS variables
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;
    
    // Initial check for dark mode
    const checkDarkMode = () => {
      // First try to detect from data-theme attribute which is how daisyUI works
      const htmlEl = document.documentElement;
      const dataTheme = htmlEl.getAttribute('data-theme');
      
      if (dataTheme) {
        // If theme is specifically set to dark or a dark theme
        const isDark = ['dark', 'night', 'dracula', 'black', 'halloween', 'forest', 'synthwave', 'retro'].includes(dataTheme);
        setIsDarkMode(isDark);
      } else {
        // Fallback to system preference
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);
      }
    };
    
    // Check initially
    checkDarkMode();
    
    // Setup listeners for theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', checkDarkMode);
    
    // Observer for data-theme attribute changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['data-theme'] 
    });
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Initialize your content and event listeners as before
    // Inject minimal required custom CSS that can't be done with Tailwind
    const style = document.createElement('style');
    style.textContent = `
      /* Essential styles that can't be replicated with Tailwind */
      .editor-container .ql-editor::-webkit-scrollbar {
        display: none;
      }
      
      .floating-toolbar {
        position: fixed;
        display: none;
        z-index: 9999;
        gap: 4px;
      }
      
      /* Add specific styling for placeholder in dark mode */
      .dark .editor-container .ql-editor.ql-blank::before {
        color: rgba(255, 255, 255, 0.6) !important;
      }
      
      /* Regular light mode placeholder */
      .editor-container .ql-editor.ql-blank::before {
        color: rgba(55, 65, 81, 0.6); /* gray-700 with opacity */
      }
      
      .floating-toolbar::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #1f2937;
      }
      
      .toolbar-below::after {
        top: auto;
        bottom: 100%;
        border-top: none;
        border-bottom: 6px solid #1f2937;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [content, setContent]);

  useEffect(() => {
    try {
      if (!quillRef.current) return;
      
      const quill = quillRef.current.getEditor();
      if (!quill || !quill.container) return;
      
      // Get the editor container
      const editorContainer = quill.container.querySelector('.ql-editor');
      if (!editorContainer) return;
      
      // Add click event listener for links
      const handleLinkClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A') {
          // Prevent the default link behavior within the editor
          event.preventDefault();
          
          // Get the href attribute
          const href = target.getAttribute('href');
          
          if (href) {
            // Open the link in a new tab
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      };
      
      editorContainer.addEventListener('click', handleLinkClick);
      
      return () => {
        editorContainer.removeEventListener('click', handleLinkClick);
      };
    } catch (error) {
      console.error('Error in link click handler:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (!quillRef.current) return;
      
      const quill = quillRef.current.getEditor();
      if (!quill) return;
      
      // Create toolbar element
      const toolbar = document.createElement('div');
      toolbar.className = 'floating-toolbar bg-gray-800 rounded-lg shadow-lg px-2.5 py-1.5 flex items-center';
      toolbar.id = 'medium-toolbar';
      toolbar.style.display = 'none';
      toolbarRef.current = toolbar;
      
      // Create toolbar HTML
      const createToolbarHTML = (hasLink = false) => {
        // Base toolbar buttons
        let html = `
          <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="bold">B</button>
          <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="italic">I</button>
          <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9,12c0-1.7,1.4-3.1,3.1-3.1h4V7H7c-2.8,0-5,2.2-5,5s2.2,5,5,5h4v-1.9H7C5.3,15.1,3.9,13.7,3.9,12z M8,13h8v-2H8V13z M17,7h-4v1.9h4c1.7,0,3.1,1.4,3.1,3.1s-1.4,3.1-3.1,3.1h-4V17h4c2.8,0,5-2.2,5-5S19.8,7,17,7z"></path>
            </svg>
          </button>
        `;
        
        // Add remove link button if text with a link is selected
        if (hasLink) {
          html += `
            <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="remove-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,4h4v1h-4v-1z M13.7,13.7l2.1-2.1c1.9-1.9,2.1-4.9,0.4-6.6c-1.6-1.7-4.5-1.8-6.2-0.2c-0.3,0.3-0.5,0.5-0.7,0.8l-2.1,2.1l1.7,1.7l2.1-2.1c1-1,2.7-1,3.8,0c1,1,1,2.7,0,3.8l-2.1,2.1L13.7,13.7z M10.4,10.4l-7.1,7.1l1.7,1.7l7.1-7.1L10.4,10.4z M16.4,16.4l-2.1,2.1c-1.9,1.9-4.9,2.1-6.6,0.4c-1.7-1.6-1.8-4.5-0.2-6.2c0.3-0.3,0.5-0.5,0.8-0.7l2.1-2.1l-1.7-1.7l-2.1,2.1c-3,3-2.8,7.9,0.4,10.7c3.1,2.8,7.8,2.7,10.7-0.4l2.1-2.1L16.4,16.4z"></path>
              </svg>
            </button>
          `;
        }
        
        html += `
          <div class="w-px h-5 bg-white/30 mx-1"></div>
          <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="header-1">
            <span class="text-xl font-bold">T</span>
          </button>
          <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="header-2">
            <span class="text-base font-bold">T</span>
          </button>
          <button class="bg-transparent border-0 text-white h-8 w-8 rounded flex items-center justify-center cursor-pointer mx-0.5 hover:bg-white/10 transition-colors" data-format="blockquote">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.17,6L6.35,14h2.58l-1.35,4h3.29l3.29-9.33h-2.58L12.93,6H9.17z M19.04,6l-2.82,8h2.58l-1.35,4h3.29l3.29-9.33h-2.58L22.21,6H19.04z"></path>
            </svg>
          </button>
        `;
        
        return html;
      };
      
      // Link input HTML for when link button is clicked
      const createLinkInputHTML = () => `
        <div class="flex w-full items-center justify-between">
          <input type="text" placeholder="Paste or type a link..." id="link-input" 
            class="flex-1 bg-transparent border-0 outline-none text-white text-sm py-1.5 mx-2" />
          <button id="close-link-input" 
            class="bg-transparent border-0 text-white opacity-80 cursor-pointer text-base px-2">✕</button>
        </div>
      `;
       
      toolbar.innerHTML = createToolbarHTML();
      document.body.appendChild(toolbar);

      // The rest of your toolbar functionality code remains the same
      // I've included the full implementation below for completeness
      
      // Function to switch to link input mode
      const showLinkInput = () => {
        // Save current selection
        savedRangeRef.current = quill.getSelection();
        
        // Switch to link input UI
        toolbar.innerHTML = createLinkInputHTML();
        
        // Focus the input and set up handlers
        setTimeout(() => {
          const linkInput = document.getElementById('link-input');
          if (linkInput) {
            linkInput.focus();
            linkInput.addEventListener('keydown', handleLinkInputKeydown);
          }
          
          // Setup close button handler
          const closeBtn = document.getElementById('close-link-input');
          if (closeBtn) {
            closeBtn.addEventListener('click', restoreToolbar);
          }
        }, 10);
      };
      
      // Function to handle link input keydown events
      const handleLinkInputKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const url = (e.target as HTMLInputElement).value.trim();
          applyLinkAndRestoreToolbar(url);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          restoreToolbar();
        }
      };
      
      // Apply link and restore toolbar
      const applyLinkAndRestoreToolbar = (url: string) => {
        // Then apply the link if URL exists and we have a valid selection
        if (url && savedRangeRef.current) {
          // Restore the selection first
          quill.setSelection(savedRangeRef.current);
          
          // Apply the link with proper URL formatting
          const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
          quill.format('link', formattedUrl);
        }
        
        // Update toolbar with link removal option
        updateToolbar(true);
      };
      
      // Function to remove link from text
      const removeLink = () => {
        if (savedRangeRef.current) {
          quill.setSelection(savedRangeRef.current);
          quill.format('link', false);
          updateToolbar();
        }
      };
      
      // Update toolbar based on current format
      const updateToolbar = (forceCheckLink = false) => {
        try {
          const format = quill.getFormat(savedRangeRef.current || {});
          const hasLink = forceCheckLink || !!format.link;
          
          // Update toolbar HTML to include/exclude remove link button
          toolbar.innerHTML = createToolbarHTML(hasLink);
          
          // Update active states
          updateButtonStates();
        } catch (error) {
          console.error('Error updating toolbar:', error);
        }
      };
      
      // Restore normal toolbar
      const restoreToolbar = () => {
        if (!toolbarRef.current) return;
        
        // Restore selection if available
        if (savedRangeRef.current) {
          try {
            quill.setSelection(savedRangeRef.current);
          } catch (e) {
            console.log('Could not restore selection');
          }
        }
        
        // Update toolbar (which will rebuild it)
        updateToolbar();
      };
      
      // Handle clicks outside the editor to hide toolbar
      const handleOutsideClick = (e: MouseEvent) => {
        const isClickInsideQuill = quill.container.contains(e.target as Node);
        const isClickInsideToolbar = toolbar.contains(e.target as Node);
        
        if (!isClickInsideQuill && !isClickInsideToolbar) {
          toolbar.style.display = 'none';
        }
      };
      
      document.addEventListener('mousedown', handleOutsideClick);
      
      // Handle all toolbar button clicks
      const handleToolbarClick = (e: MouseEvent) => {
        let target = e.target as HTMLElement;
        
        // Navigate up to button if clicked on child element
        while (target && !target.hasAttribute('data-format') && target.id !== 'close-link-input') {
          target = target.parentElement as HTMLElement;
          if (!target || target === toolbar) break;
        }
        
        if (!target || target === toolbar) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Handle close link input
        if (target.id === 'close-link-input') {
          restoreToolbar();
          return;
        }
        
        // Get format action
        const format = target.getAttribute('data-format');
        if (!format) return;
        
        try {
          // Use saved range if we have it
          if (savedRangeRef.current) {
            quill.setSelection(savedRangeRef.current);
          }
          
          // Apply formatting
          if (format === 'bold') {
            quill.format('bold', !quill.getFormat().bold);
          } else if (format === 'italic') {
            quill.format('italic', !quill.getFormat().italic);
          } else if (format === 'header-1') {
            const currentHeader = quill.getFormat().header;
            quill.format('header', currentHeader === 1 ? false : 1);
          } else if (format === 'header-2') {
            const currentHeader = quill.getFormat().header;
            quill.format('header', currentHeader === 2 ? false : 2);
          } else if (format === 'blockquote') {
            quill.format('blockquote', !quill.getFormat().blockquote);
          } else if (format === 'link') {
            showLinkInput();
            return; // Skip updateButtonStates since we're showing the link input
          } else if (format === 'remove-link') {
            removeLink();
          }
          
          updateButtonStates();
        } catch (error) {
          console.error('Error applying formatting:', error);
        }
      };
      
      toolbar.addEventListener('click', handleToolbarClick);
      
      // Update button active states
      const updateButtonStates = () => {
        try {
          const range = quill.getSelection() || savedRangeRef.current;
          if (!range) return;
          
          const format = quill.getFormat(range);
          
          // Reset all buttons
          toolbar.querySelectorAll('[data-format]').forEach(btn => {
            btn.classList.remove('text-sky-400');
          });
          
          // Set active state based on current format
          if (format.bold) {
            const boldBtn = toolbar.querySelector('[data-format="bold"]');
            if (boldBtn) boldBtn.classList.add('text-sky-400');
          }
          if (format.italic) {
            const italicBtn = toolbar.querySelector('[data-format="italic"]');
            if (italicBtn) italicBtn.classList.add('text-sky-400');
          }
          if (format.header === 1) {
            const h1Btn = toolbar.querySelector('[data-format="header-1"]');
            if (h1Btn) h1Btn.classList.add('text-sky-400');
          }
          if (format.header === 2) {
            const h2Btn = toolbar.querySelector('[data-format="header-2"]');
            if (h2Btn) h2Btn.classList.add('text-sky-400');
          }
          if (format.blockquote) {
            const quoteBtn = toolbar.querySelector('[data-format="blockquote"]');
            if (quoteBtn) quoteBtn.classList.add('text-sky-400');
          }
          if (format.link) {
            const linkBtn = toolbar.querySelector('[data-format="link"]');
            if (linkBtn) linkBtn.classList.add('text-sky-400');
          }
        } catch (error) {
          console.error('Error updating button states:', error);
        }
      };
      
      // Handle selection changes
      const handleSelection = (range: {index: number, length: number} | null) => {
        if (!toolbar) return;
        
        // When selection is cleared or empty, hide the toolbar
        if (!range || range.length === 0) {
          // Only hide toolbar when clicking outside selection areas
          // Check if the toolbar itself is not being interacted with
          if (!toolbar.contains(document.activeElement)) {
            toolbar.style.display = 'none';
          }
          return;
        }
        
        // Selection exists and has length
        if (range.length > 0) {
          // Save the selection
          savedRangeRef.current = range;
          
          try {
            // Show and position toolbar
            const bounds = quill.getBounds(range.index, range.length);
            const editorRect = quill.container.getBoundingClientRect();
            
            // Check if format contains a link and update toolbar
            const format = quill.getFormat(range);
            updateToolbar(!!format.link);
            
            toolbar.style.position = 'fixed';
            toolbar.style.display = 'flex';
            
            // Position toolbar above selection
            const selectionCenter = editorRect.left + bounds.left + (bounds.width / 2);
            const selectionTop = editorRect.top + bounds.top;
            
            toolbar.style.left = `${selectionCenter - (toolbar.offsetWidth / 2)}px`;
            toolbar.style.top = `${selectionTop - toolbar.offsetHeight - 10}px`;
            
            // Keep toolbar on screen
            if (parseFloat(toolbar.style.left) < 10) {
              toolbar.style.left = '10px';
            }
            
            const viewportWidth = window.innerWidth;
            if (parseFloat(toolbar.style.left) + toolbar.offsetWidth > viewportWidth - 10) {
              toolbar.style.left = `${viewportWidth - toolbar.offsetWidth - 10}px`;
            }
            
            // Position below if no room above
            if (selectionTop - toolbar.offsetHeight - 10 < 10) {
              toolbar.style.top = `${selectionTop + bounds.height + 10}px`;
              toolbar.classList.add('toolbar-below');
            } else {
              toolbar.classList.remove('toolbar-below');
            }
            
            // Update active states
            updateButtonStates();
          } catch (error) {
            console.error('Error positioning toolbar:', error);
          }
        }
      };
      
      // Register selection handler
      quill.on('selection-change', handleSelection);
      
      // Handle scroll events
      const handleScroll = () => {
        try {
          const selection = quill.getSelection() || savedRangeRef.current;
          if (selection && selection.length > 0) {
            handleSelection(selection);
          }
        } catch (error) {
          console.error('Error during scroll:', error);
        }
      };
      
      // Listen for scroll events
      window.addEventListener('scroll', handleScroll, true);
      
      // Clean up on unmount
      return () => {
        try {
          quill.off('selection-change', handleSelection);
          window.removeEventListener('scroll', handleScroll, true);
          toolbar.removeEventListener('click', handleToolbarClick);
          document.removeEventListener('mousedown', handleOutsideClick);
          
          if (toolbar && toolbar.parentNode) {
            toolbar.parentNode.removeChild(toolbar);
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up toolbar:', error);
      return () => {}; // Empty cleanup function
    }
  }, []);

  const modules = {
    clipboard: { matchVisual: false },
    toolbar: false
  };
  
  const formats = [
    'header', 'bold', 'italic', 'blockquote', 'link', 'image'
  ];

  return (
    <div className={`relative min-h-[400px] rounded-lg transition-all duration-300 ease-in-out mb-5 editor-container ${isDarkMode ? 'dark-editor' : ''}`}>
      <style jsx>{`
        /* Custom styles for ReactQuill that can't be done with Tailwind */
        :global(.editor-container .ql-editor) {
          font-family: Georgia, serif;
          font-size: 18px;
          line-height: 1.8;
          min-height: 400px;
          padding: 0;
          color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
        }
        
        :global(.dark-editor) {
          background-color: #1e293b;
        }
        
        :global(.dark-editor .ql-editor) {
          color: #f1f5f9;
        }
        
        :global(.dark-editor .ql-editor.ql-blank::before) {
          color: rgba(255, 255, 255, 0.4);
        }
        
        :global(.editor-container .ql-editor p) {
          margin-bottom: 1.5em;
        }
        
        :global(.editor-container .ql-editor h1) {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 0.8em;
          margin-top: 1em;
        }
        
        :global(.editor-container .ql-editor h2) {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 0.7em;
          margin-top: 0.9em;
        }
        
        :global(.editor-container .ql-editor blockquote) {
          border-left: 3px solid #ccc;
          padding-left: 16px;
          margin-left: 0;
          color: #555;
        }
        
        :global(.editor-container .ql-editor img) {
          max-width: 100%;
          display: block;
          margin: 1.5em auto;
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="bubble"
        modules={modules}
        formats={formats}
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        className="font-serif text-lg leading-relaxed"
      />
    </div>
  );
}