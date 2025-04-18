import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { marked } from 'marked';
import { toast } from 'sonner';
import { type AIProviderConfig } from '@/components/AISettingsModal'; // Import type
import Modal from './Modal';
import { FaExpand, FaTimes } from 'react-icons/fa';

interface InlineChatProps {
  aiConfigs: AIProviderConfig[];
  selectedModelId: string; // ID from parent (e.g., "providerId::modelId" or "default")
  onModelChange: (newModelId: string) => void; // Function to update parent state
  isVisible: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const InlineChat: React.FC<InlineChatProps> = ({
  aiConfigs,
  selectedModelId: parentSelectedModelId,
  onModelChange,
  isVisible,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalSelectedModelId, setInternalSelectedModelId] = useState(parentSelectedModelId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal model selection when parent changes
  useEffect(() => {
    setInternalSelectedModelId(parentSelectedModelId);
  }, [parentSelectedModelId]);

  // Focus input when chat becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcut: Cmd+Shift+I to toggle chat
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        onModelChange(''); // Optionally reset model
        if (isModalOpen) setIsModalOpen(false);
        else if (!isVisible) onModelChange(parentSelectedModelId); // Show chat if hidden
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isModalOpen, isVisible, onModelChange, parentSelectedModelId]);

  // Flattened model options for dropdown
  const modelOptions = [
    { id: 'default', label: 'Default' },
    ...aiConfigs.flatMap(cfg =>
      (cfg.models || '').split(',').map(modelId => ({
        id: `${cfg.id}::${modelId.trim()}`,
        label: `${cfg.name} – ${modelId.trim()}`
      })).filter(opt => opt.label.includes('–') && opt.id.includes('::')) // Ensure valid options
    )
  ];

  const handleModelSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = event.target.value;
    setInternalSelectedModelId(newModelId);
    onModelChange(newModelId); // Notify parent
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare chat history for API (only previous assistant/user pairs)
    const apiChatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const body: any = {
        text: userMessage.content,
        action: 'chat',
        stream: true,
        chatHistory: apiChatHistory, // Send previous messages
      };

      if (internalSelectedModelId !== 'default') {
        const [providerId, modelId] = internalSelectedModelId.split('::');
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

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantResponse = '';
      let currentAssistantMessage: ChatMessage | null = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantResponse += chunk;

          // Update the last message (assistant's response) in real-time
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              // Update existing assistant message
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: assistantResponse }
              ];
            } else {
              // Add new assistant message
              currentAssistantMessage = { role: 'assistant', content: assistantResponse };
              return [...prev, currentAssistantMessage];
            }
          });
        }
      }
       // Final update just in case
       setMessages(prev => {
         const lastMessage = prev[prev.length - 1];
         if (lastMessage?.role === 'assistant') {
           return [
             ...prev.slice(0, -1),
             { ...lastMessage, content: assistantResponse }
           ];
         }
         return prev; // Should not happen if streaming worked correctly
       });


    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(`Chat error: ${error.message}`);
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
      // Refocus input after sending/receiving
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, internalSelectedModelId, aiConfigs]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Helper to render the chat UI (for both inline and modal)
  const ChatUI = (props?: { modal?: boolean }) => (
    <div
      className={`relative w-full h-full flex flex-col rounded-2xl bg-base-100/95 shadow-xl border border-base-300 ${props?.modal ? 'max-h-[70vh] max-w-2xl' : 'max-h-[40vh] max-w-xl'} mx-auto`}
      style={props?.modal ? { boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' } : {}}
    >
      {/* Expand/Close button */}
      {props?.modal ? (
        <button
          className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle z-10"
          onClick={() => setIsModalOpen(false)}
          title="Close chat"
          tabIndex={-1}
        >
          <FaTimes />
        </button>
      ) : (
        <button
          className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle z-10"
          onClick={() => setIsModalOpen(true)}
          title="Expand chat"
          tabIndex={-1}
        >
          <FaExpand />
        </button>
      )}
      {/* Chat History - Added scrollbar-hide */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: typeof msg.content === 'string' ? msg.content : '' }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="p-2 flex items-center gap-2 border-t border-base-200 bg-base-100 rounded-b-2xl">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask anything..."
          className="input input-sm flex-1 bg-transparent border-none focus:ring-0 focus:outline-none shadow-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={{ boxShadow: 'none' }}
        />
        <select
          className="select select-sm bg-transparent border-none focus:ring-0 focus:outline-none shadow-none max-w-xs"
          value={internalSelectedModelId}
          onChange={handleModelSelectChange}
          disabled={isLoading}
          style={{ boxShadow: 'none' }}
        >
          {modelOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
        <button
          className="btn btn-primary btn-sm btn-square"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );

  // Centered at bottom of editor area (not full page)
  if (!isVisible) return null;

  return (
    <>
      {/* Render inline chat only if visible and modal is NOT open */}
      {isVisible && !isModalOpen && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-40 w-full max-w-xl px-2 flex justify-center"
        >
          <div className="w-full pointer-events-auto">
            {ChatUI()}
          </div>
        </div>
      )}
      {/* Modal for expanded chat: Pass prop to remove default modal styling */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} removeStyling>
        <div className="flex flex-col justify-end h-[70vh]">
          {ChatUI({ modal: true })}
        </div>
      </Modal>
    </>
  );
};

export default InlineChat;