"use client";
// This is a new version of the Content Hub page, redesigned to match the provided design examples.
// All features are preserved, but the UI/UX is completely overhauled for a modern, professional look.
// Implementation will follow in subsequent steps.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamicImport from 'next/dynamic';
import { toast } from 'sonner';
import { marked } from 'marked';
import InlineChat from '@/components/InlineChat';
import { FaMagic, FaBookOpen, FaPlus, FaSearch, FaRegFileAlt, FaRegClock, FaRegCheckCircle, FaChevronRight } from 'react-icons/fa';

// Import ReactQuill dynamically with SSR disabled and forwardedRef support
const ReactQuill = dynamicImport(() => import('react-quill').then(mod => ({
  default: ({ forwardedRef, ...props }: { forwardedRef?: React.Ref<any>; [key: string]: any }) => <mod.default ref={forwardedRef} {...props} />
})), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
import 'react-quill/dist/quill.snow.css';

const mockProtocols = [
  { id: 'protocol-1', name: 'Growth Protocol', color: 'from-blue-400 to-blue-600' },
  { id: 'protocol-2', name: 'Authority Protocol', color: 'from-purple-400 to-purple-600' },
];

// Use a valid AIProviderConfig shape for mockAIConfigs
const mockAIConfigs = [
  {
    id: 'default',
    name: 'Default AI',
    endpoint: 'https://api.akash.ai',
    models: 'gpt-4',
    apiKey: 'demo-key',
  },
  {
    id: 'fast',
    name: 'Fast Mode',
    endpoint: 'https://api.akash.ai',
    models: 'gpt-3.5-turbo',
    apiKey: 'demo-key',
  },
];

const ContentHubRedesign = () => {
  // State for chat visibility and selected AI model
  const [chatVisible, setChatVisible] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('default');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const quillRef = useRef<any>(null);

  // Autosave simulation
  useEffect(() => {
    if (content) {
      // Simulate autosave
      const timeout = setTimeout(() => toast.success('Autosaved!'), 1200);
      return () => clearTimeout(timeout);
    }
  }, [content]);

  // AI streaming handler (simplified for demo)
  const handleAIAction = useCallback(async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, action, stream: true }),
      });
      if (!response.ok || !response.body) throw new Error('AI error');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aiText = '';
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          aiText += decoder.decode(value, { stream: true });
          setContent(prev => prev + decoder.decode(value, { stream: true }));
        }
      }
      toast.success('AI completed!');
    } catch (e) {
      toast.error('AI failed');
    } finally {
      setLoading(false);
    }
  }, [content]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf0fa] to-[#c9e7f2] font-sans">
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl flex overflow-hidden border border-[#e3e8f0]">
        {/* Sidebar */}
        <aside className="w-80 bg-white/60 border-r border-[#e3e8f0] p-0 flex flex-col justify-between relative z-10">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-8">
              <FaBookOpen className="text-blue-500 text-2xl" />
              <span className="font-bold text-xl tracking-tight text-gray-800">Content Hub</span>
            </div>
            <div className="mb-6">
              <button className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow hover:scale-[1.03] transition-transform">
                <FaPlus /> New Content
              </button>
            </div>
            <div className="mb-8">
              <div className="text-xs text-gray-500 font-semibold mb-2 ml-1">Protocols</div>
              <ul className="space-y-2">
                {mockProtocols.map(p => (
                  <li key={p.id}>
                    <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${p.color} text-white font-medium shadow-sm hover:scale-[1.03] transition-transform`}>
                      <FaMagic className="opacity-80" />
                      {p.name}
                      <FaChevronRight className="ml-auto opacity-60" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-8">
              <div className="text-xs text-gray-500 font-semibold mb-2 ml-1">Quick Actions</div>
              <div className="flex gap-2">
                <button className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white/80 border border-blue-100 shadow hover:bg-blue-50 transition">
                  <FaSearch className="text-blue-400 text-lg" />
                  <span className="text-xs font-medium text-gray-700">Search</span>
                </button>
                <button className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white/80 border border-blue-100 shadow hover:bg-blue-50 transition">
                  <FaRegFileAlt className="text-blue-400 text-lg" />
                  <span className="text-xs font-medium text-gray-700">Drafts</span>
                </button>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-gray-500 font-semibold mb-2 ml-1">Status</div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"><FaRegCheckCircle /> Published</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold"><FaRegClock /> Draft</span>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-[#e3e8f0] bg-white/70">
            <div className="text-xs text-gray-400">© 2025 CreatiFun</div>
          </div>
        </aside>
        {/* Editor Area */}
        <main className="flex-1 p-12 flex flex-col relative">
          <div className="flex items-center gap-4 mb-8">
            <input
              className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-200 rounded-lg px-2 py-1 w-full max-w-xl text-gray-800 placeholder-gray-400"
              placeholder="Untitled Content..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <span className="ml-auto text-xs text-gray-400">{loading ? 'Saving...' : 'Autosaved'}</span>
          </div>
          <div className="flex-1 bg-white/80 rounded-2xl shadow-inner border border-[#e3e8f0] p-0 min-h-[400px] focus-within:ring-2 focus-within:ring-blue-200 transition-all overflow-hidden">
            <ReactQuill
              forwardedRef={quillRef}
              value={content}
              onChange={setContent}
              placeholder="Start writing or use AI to generate content…"
              className="h-full medium-style-editor border-none bg-transparent px-8 py-8 text-lg"
              theme="snow"
              modules={{ toolbar: false }}
            />
          </div>
          {/* AI Actions Toolbar */}
          <div className="flex gap-3 mt-6">
            <button
              className="btn btn-primary rounded-xl shadow"
              onClick={() => handleAIAction('improve')}
              disabled={loading}
            >
              Improve
            </button>
            <button
              className="btn btn-secondary rounded-xl shadow"
              onClick={() => handleAIAction('expand')}
              disabled={loading}
            >
              Expand
            </button>
            <button
              className="btn btn-accent rounded-xl shadow"
              onClick={() => handleAIAction('summarize')}
              disabled={loading}
            >
              Summarize
            </button>
          </div>
          {/* Floating Chat Button */}
          <button
            className="fixed bottom-10 right-10 z-50 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition-transform border-4 border-white/80"
            onClick={() => setChatVisible(true)}
            style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }}
            aria-label="Open AI Assistant"
          >
            <FaMagic />
          </button>
          {/* InlineChat Modal */}
          <InlineChat
            aiConfigs={mockAIConfigs}
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
            isVisible={chatVisible}
          />
        </main>
      </div>
    </div>
  );
};

export default ContentHubRedesign;
