import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { marked } from 'marked';
import { toast } from 'sonner';
import { type AIProviderConfig } from '@/components/AISettingsModal'; // Import type

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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-[20%] right-[22rem] z-40 bg-base-200 border-t border-base-300 shadow-lg flex flex-col max-h-[40vh]">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
              {/* Render markdown for assistant messages */}
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: typeof msg.content === 'string' ? msg.content : '' }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
      </div>

      {/* Input Area */}
      <div className="p-2 border-t border-base-300 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask anything..."
          className="input input-bordered input-sm flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <select
          className="select select-bordered select-sm max-w-xs"
          value={internalSelectedModelId}
          onChange={handleModelSelectChange}
          disabled={isLoading}
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
};

export default InlineChat;