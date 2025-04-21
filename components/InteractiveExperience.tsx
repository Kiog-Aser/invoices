'use client';
import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaClock, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { IWritingProtocol as Protocol } from '@/models/WritingProtocol';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { AIProviderConfig } from '@/components/AISettingsModal';

const ReactQuill = dynamic(() => import('react-quill').then(mod => ({
  default: ({ forwardedRef, ...props }: { forwardedRef?: React.Ref<any>; [key: string]: any }) =>
    <mod.default ref={forwardedRef} {...props} />
})), { ssr: false });
import 'react-quill/dist/quill.snow.css';

function fetcher(url: string) {
  return fetch(url).then(res => res.json());
}

// --- Subcomponents moved outside InteractiveExperience ---

// --- MediumTokenInput Subcomponent ---
function MediumTokenInput({ mediumToken, setMediumToken }: { mediumToken: string | null, setMediumToken: (token: string) => void }) {
  const [input, setInput] = useState(mediumToken || '');
  const [isSaved, setIsSaved] = useState(false);

  function handleSave() {
    localStorage.setItem('mediumAccessToken', input);
    setMediumToken(input);
    setIsSaved(true);
    toast.success('Medium access token saved!');
  }

  useEffect(() => {
    // Sync prop changes to local state if the prop isn't null and differs from local state
    // This prevents overwriting user input if the parent re-renders but the token hasn't actually changed
    if (mediumToken !== null && mediumToken !== input) {
      setInput(mediumToken);
    }
    // Intentionally excluding `input` from deps to avoid loops
  }, [mediumToken]);

  useEffect(() => {
    if (isSaved) {
      const timeout = setTimeout(() => setIsSaved(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [isSaved]);

  return (
    <div className="w-full flex flex-col gap-2 mt-4">
      <label className="text-sm font-medium">Medium Access Token</label>
      <div className="flex gap-2 items-center">
        <input
          className="input input-bordered flex-1"
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setIsSaved(false); }}
          placeholder="Paste your Medium integration token here"
          // Fix: Try 'new-password' for autocomplete
          autoComplete="new-password"
        />
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={handleSave}
          disabled={!input.trim() || input === mediumToken}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
      <a
        href="https://medium.com/me/settings/security"
        target="_blank"
        rel="noopener noreferrer"
        className="link text-xs text-blue-500"
      >
        Get your Medium integration token
      </a>
    </div>
  );
}

// --- ChecklistSection Subcomponent ---
function ChecklistSection({ protocol, draft, onBack }: { protocol: Protocol | null, draft: string, onBack: () => void }) {
  const checklist: string[] = [];
  if (protocol?.aiGeneratedContent?.nicheAuthority?.coreMessage)
    checklist.push('Clear core message');
  if (protocol?.aiGeneratedContent?.contentPillars) {
    checklist.push('Includes all 3 content pillars');
    const pillars = protocol.aiGeneratedContent.contentPillars;
    if (pillars.expertise?.contentIdeas?.length)
      checklist.push(`Pillar: ${pillars.expertise.title}`);
    if (pillars.personalJourney?.contentIdeas?.length)
      checklist.push(`Pillar: ${pillars.personalJourney.title}`);
    if (pillars.clientProof?.contentIdeas?.length)
      checklist.push(`Pillar: ${pillars.clientProof.title}`);
  }
  if (protocol?.aiGeneratedContent?.repurposeSystem?.thoughtLeadershipArticle?.headline)
    checklist.push('Strong headline for repurposing');

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-2xl font-bold">Quality Checklist</div>
      <div className="bg-base-200 rounded-lg p-4">
        <ul className="list-disc pl-6 space-y-2">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-success" checked readOnly />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn btn-outline w-full" onClick={onBack}>Back</button>
    </div>
  );
}

// --- RepurposeSection Subcomponent ---
function RepurposeSection({ protocol, draft, onBack }: { protocol: Protocol | null, draft: string, onBack: () => void }) {
  const repurpose = protocol?.aiGeneratedContent?.repurposeSystem;
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-2xl font-bold">Repurpose for Other Platforms</div>
      <div className="bg-base-200 rounded-lg p-4 space-y-4">
        {repurpose?.thoughtLeadershipArticle && (
          <div>
            <div className="font-semibold mb-1">Thought Leadership Article</div>
            <div className="text-base-content/80">{repurpose.thoughtLeadershipArticle.headline}</div>
          </div>
        )}
        {Array.isArray(repurpose?.formats?.shortForm) && repurpose.formats.shortForm.length > 0 && (
          <div>
            <div className="font-semibold mb-1">Short Form Content Ideas</div>
            <ul className="list-disc pl-6">
              {repurpose.formats.shortForm.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
        {Array.isArray(repurpose?.formats?.threads?.body) && repurpose.formats.threads.body.length > 0 && (
          <div>
            <div className="font-semibold mb-1">Thread Format</div>
            <ul className="list-disc pl-6">
              {repurpose.formats.threads.body.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
      <button className="btn btn-outline w-full" onClick={onBack}>Back</button>
    </div>
  );
}

// --- Main InteractiveExperience Component ---

interface InteractiveExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  protocol?: Protocol | null;
}

export default function InteractiveExperience({ isOpen, onClose, protocol }: InteractiveExperienceProps) {
  const [step, setStep] = useState<'start' | 'editor' | 'ai-friend' | 'ai-feedback' | 'done' | 'checklist' | 'repurpose'>('start');
  const [timer, setTimer] = useState(900); // 15 min
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [draft, setDraft] = useState('');
  const [aiFriendResponse, setAiFriendResponse] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef<any>(null);

  // --- Protocol data: match ContentHub logic ---
  // If protocol is not passed, try to get from localStorage (like ContentHub)
  const [localProtocol, setLocalProtocol] = useState<Protocol | null>(null);
  useEffect(() => {
    if (!protocol && typeof window !== 'undefined') {
      const savedId = localStorage.getItem('selectedProtocolId');
      if (savedId) {
        fetch('/api/writing-protocol', { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (Array.isArray(data)) {
              const found = data.find((p: Protocol) => p.userId === savedId);
              if (found) setLocalProtocol(found);
            }
          });
      }
    }
  }, [protocol]);
  const activeProtocol = protocol || localProtocol;
  const topic = activeProtocol?.aiGeneratedContent?.nicheAuthority?.fullNiche || activeProtocol?.industry || '';
  const audience = activeProtocol?.aiGeneratedContent?.nicheAuthority?.targetAudience?.join(', ') || '';
  const goal = activeProtocol?.aiGeneratedContent?.nicheAuthority?.coreMessage || '';

  // --- Timer effect: start timer and editor together ---
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    }
    if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
      toast('Time is up!');
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer, isTimerActive]);

  // Model loading (same as chat sidebar)
  const { data: aiSettings, isLoading: isModelsLoading } = useSWR('/api/ai/settings', fetcher);
  const modelOptions = [
    { id: 'default', label: 'Default' },
    ...(aiSettings?.configs || []).flatMap((cfg: AIProviderConfig) =>
      (cfg.models || '').split(',').map(modelId => ({
        id: `${cfg.id}::${modelId.trim()}`,
        label: `${cfg.name} – ${modelId.trim()}`
      }))
    )
  ];
  const [selectedModelId, setSelectedModelId] = useState<string>('default');
  useEffect(() => {
    if (aiSettings?.defaultModelId && modelOptions.some(opt => opt.id === aiSettings.defaultModelId))
      setSelectedModelId(aiSettings.defaultModelId);
  }, [aiSettings]);

  // Medium access token state
  const [mediumToken, setMediumToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mediumAccessToken');
      if (token) setMediumToken(token);
    }
  }, []);

  function handleStartWriting() {
    setStep('editor');
    setIsTimerActive(true);
    setTimer(900);
  }

  async function handleAIFriend() {
    setIsLoading(true);
    setStep('ai-friend');
    setAiFriendResponse('');
    const prompt = `below is my journal entry. wyt? talk through it with me like a friend. don't therpaize me and give me a whole breakdown, don't repeat my thoughts with headings. really take all of this, and tell me back stuff truly as if you're an old homie.\n\nKeep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.\n\ndo not just go through every single thing i say, and say it back to me. you need to proccess everythikng is say, make connections i don't see it, and deliver it all back to me as a story that makes me feel what you think i wanna feel. thats what the best therapists do.\n\nideally, you're style/tone should sound like the user themselves. it's as if the user is hearing their own tone but it should still feel different, because you have different things to say and don't just repeat back they say.\n\nelse, start by saying, \"hey, thanks for showing me this. my thoughts:\"\n    \nmy entry:\n\n${draft}`;
    try {
      const body: any = {
        text: prompt,
        action: 'chat',
        stream: true,
        chatHistory: [],
      };
      if (selectedModelId && selectedModelId !== 'default') {
        const [providerId, modelId] = selectedModelId.split('::');
        body.providerId = providerId;
        body.modelId = modelId;
      }
      const response = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok || !response.body) throw new Error('AI error');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let result = '';
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) result += decoder.decode(value, { stream: true });
      }
      setAiFriendResponse(result);
    } catch {
      setAiFriendResponse('AI error.');
    }
    setIsLoading(false);
  }

  async function handleAIFeedback() {
    setIsLoading(true);
    setStep('ai-feedback');
    setAiFeedback('');
    const prompt = `Give me honest, constructive feedback on my journal entry. Focus on clarity, emotional insight, and any patterns or blind spots you notice.\n\nEntry:\n${draft}`;
    try {
      const body: any = {
        text: prompt,
        action: 'chat',
        stream: true,
        chatHistory: [],
      };
      if (selectedModelId && selectedModelId !== 'default') {
        const [providerId, modelId] = selectedModelId.split('::');
        body.providerId = providerId;
        body.modelId = modelId;
      }
      const response = await fetch('/api/ai/content-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok || !response.body) throw new Error('AI error');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let result = '';
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) result += decoder.decode(value, { stream: true });
      }
      setAiFeedback(result);
    } catch {
      setAiFeedback('AI error.');
    }
    setIsLoading(false);
  }

  async function handlePublishMedium() {
    if (!mediumToken) {
      toast.error('Please add your Medium access token first.');
      window.open('https://medium.com/me/settings/security', '_blank');
      return;
    }
    toast.loading('Publishing to Medium...');
    try {
      const res = await fetch('/api/publish/medium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: draft,
          title: protocol?.title || 'Draft',
          tags: protocol?.contentTypes || [],
          accessToken: mediumToken
        }),
      });
      if (!res.ok) throw new Error('Failed to publish');
      toast.success('Draft published to Medium!');
    } catch (e) {
      toast.error('Failed to publish to Medium');
    } finally {
      toast.dismiss();
    }
  }

  // Add handler for copying draft
  function handleCopyDraft() {
    if (!draft) {
      toast.error('Nothing to copy.');
      return;
    }
    navigator.clipboard.writeText(draft)
      .then(() => {
        toast.success('Draft copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy draft: ', err);
        toast.error('Failed to copy draft.');
      });
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] bg-base-100 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between p-4 border-b bg-base-100 z-10">
        <div className="font-bold text-lg tracking-tight">Interactive Experience <span className="badge badge-accent ml-2">bèta</span></div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-center items-center p-6">
        {step === 'start' && (
          <div className="w-full space-y-6">
            <div className="text-2xl font-bold mb-2">Let's get you writing</div>
            <div className="bg-base-200 rounded-lg p-4 space-y-2">
              <div className="text-sm text-base-content/70">Topic</div>
              <div className="font-semibold text-base-content">{topic || <span className="opacity-50">No protocol connected</span>}</div>
              <div className="text-sm text-base-content/70 mt-2">Audience</div>
              <div className="font-semibold text-base-content">{audience || <span className="opacity-50">No protocol connected</span>}</div>
              <div className="text-sm text-base-content/70 mt-2">Goal</div>
              <div className="font-semibold text-base-content">{goal || <span className="opacity-50">No protocol connected</span>}</div>
            </div>
            <button className="btn btn-primary w-full mt-4" onClick={handleStartWriting}>Start 15-Minute Session</button>
          </div>
        )}
        {step === 'editor' && (
          <div className="w-full h-[60vh] flex flex-col gap-4">
            {/* Model selector */}
            <select
              className="select select-sm w-full mb-2"
              value={selectedModelId}
              onChange={e => setSelectedModelId(e.target.value)}
              disabled={isModelsLoading}
            >
              {modelOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <ReactQuill
              ref={quillRef}
              value={draft}
              onChange={setDraft}
              placeholder="Start writing your draft..."
              theme="bubble"
              className="h-full medium-style-editor"
              style={{ minHeight: '300px', border: 'none', fontSize: '20px', background: 'transparent' }}
            />
            <button
              className="btn btn-success w-full mt-2 flex items-center justify-center gap-2"
              onClick={handleAIFriend}
              disabled={!draft.trim() || isLoading}
            >
              Get AI Friend Response <FaChevronRight />
            </button>
          </div>
        )}
        {step === 'ai-friend' && (
          <div className="w-full flex flex-col gap-6">
            <div className="prose prose-sm max-w-none bg-base-200 rounded-lg p-4 min-h-[180px] overflow-y-auto max-h-72">{isLoading ? 'Thinking...' : <span dangerouslySetInnerHTML={{ __html: aiFriendResponse }} />}</div>
            <button className="btn btn-primary w-full" onClick={handleAIFeedback} disabled={isLoading}>Ask for Feedback</button>
          </div>
        )}
        {step === 'ai-feedback' && (
          <div className="w-full flex flex-col gap-6">
            <div className="prose prose-sm max-w-none bg-base-200 rounded-lg p-4 min-h-[180px] overflow-y-auto max-h-72">{isLoading ? 'Thinking...' : <span dangerouslySetInnerHTML={{ __html: aiFeedback }} />}</div>
            <button className="btn btn-success w-full" onClick={() => setStep('done')}>Finish</button>
          </div>
        )}
        {step === 'done' && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-2xl font-bold text-success">Session complete!</div>
            <div className="bg-base-200 rounded-lg p-4 w-full text-center">You can now review, edit, or export your draft.</div>
            {/* Add a textarea to display the draft for easy viewing/manual copy */}
            <textarea 
              className="textarea textarea-bordered w-full h-32 text-sm bg-base-100" 
              value={draft} 
              readOnly 
              placeholder="Your draft will appear here."
            />
            <div className="grid grid-cols-2 gap-2 w-full">
              <button className="btn btn-outline" onClick={onClose}>Close</button>
              {/* Add Copy Draft button */}
              <button 
                className="btn btn-secondary" 
                onClick={handleCopyDraft} 
                disabled={!draft.trim()}
              >
                Copy Draft
              </button>
            </div>
            <button className="btn btn-primary w-full" onClick={() => setStep('checklist')}>Quality Checklist</button>
            <button className="btn btn-accent w-full" onClick={handlePublishMedium} disabled={!mediumToken || !draft.trim()}>Publish to Medium</button>
            <MediumTokenInput mediumToken={mediumToken} setMediumToken={setMediumToken} />
            <button className="btn btn-info w-full" onClick={() => setStep('repurpose')}>Repurpose Ideas</button>
          </div>
        )}
        {step === 'checklist' && (
          <ChecklistSection protocol={activeProtocol} draft={draft} onBack={() => setStep('done')} />
        )}
        {step === 'repurpose' && (
          <RepurposeSection protocol={activeProtocol} draft={draft} onBack={() => setStep('done')} />
        )}
      </div>
      {/* Floating timer bottom right when in editor mode and timer active */}
      {step === 'editor' && isTimerActive && (
        <div className="fixed bottom-8 right-8 z-[100000] bg-base-200 rounded-full shadow-lg px-6 py-2 flex items-center gap-2 text-lg font-bold">
          <FaClock /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
