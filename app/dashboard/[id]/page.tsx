'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaArrowLeft, FaChevronRight, FaHome, FaPrint, FaDownload, FaSpinner, FaCopy, FaCalendarPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";

interface Section {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
  content?: string;
}

interface Protocol {
  _id: string;
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  goals: string[];
  challenges: string[];
  aiGeneratedContent: {
    nicheAuthority: {
      fullNiche: string;
      coreMessage: string;
      uniqueMechanism: string;
      targetAudience: string[];
    };
    contentPillars: {
      expertise: {
        title: string;
        contentIdeas: string[];
      };
      personalJourney: {
        title: string;
        contentIdeas: string[];
      };
      clientProof: {
        title: string;
        contentIdeas: string[];
      };
    };
    repurposeSystem: {
      thoughtLeadershipArticle: {
        headline: string;
        hook: string;
        storytelling: string;
        valuePoints: string[];
        cta: string;
        frequency?: number;
      };
      formats: {
        shortForm: string[];
        shortFormFrequency?: number;
        threads: {
          hook: string;
          body: string[];
          cta: string;
          frequency?: number;
        };
      };
    };
    contentCalendar: {
      days: {
        monday: Array<{type: string; title: string; icon?: string}>;
        tuesday: Array<{type: string; title: string; icon?: string}>;
        wednesday: Array<{type: string; title: string; icon?: string}>;
        thursday: Array<{type: string; title: string; icon?: string}>;
        friday: Array<{type: string; title: string; icon?: string}>;
        saturday: Array<{type: string; title: string; icon?: string}>;
        sunday: Array<{type: string; title: string; icon?: string}>;
      };
    };
    conversionFunnel: {
      awareness: {
        goal: string;
        contentStrategy: string[];
        leadMagnet: string;
        outreach: string;
      };
      activeFollowers: {
        goal: string;
        strategies: string[];
      };
      conversion?: {
        goal: string;
        strategies: string[];
        offers: string[];
        callToAction: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

const SECTIONS: Section[] = [
  {
    id: 'niche',
    title: '1. Niche Authority Growth System',
    subsections: [
      { id: 'niche-full', title: 'Full Niche' },
      { id: 'niche-message', title: 'Core Message' },
      { id: 'niche-mechanism', title: 'Unique Mechanism' },
      { id: 'niche-audience', title: 'Target Audience' }
    ],
  },
  {
    id: 'pillars',
    title: '2. The 3 Main Content Pillars',
    subsections: [
      { id: 'pillars-expertise', title: '1. Expertise (Skills & Knowledge)' },
      { id: 'pillars-journey', title: '2. Personal Journey' },
      { id: 'pillars-proof', title: '3. Client Proof & Credibility' }
    ],
  },
  {
    id: 'repurpose',
    title: '3. The Repurpose System',
    subsections: [
      { id: 'repurpose-article', title: 'Thought-Leadership Article' },
      { id: 'repurpose-formats', title: 'Repurposed Content Formats' }
    ],
  },
  {
    id: 'calendar',
    title: '4. The 1-Week Content Calendar',
  },
  {
    id: 'funnel',
    title: '5. The Conversion Funnel',
    subsections: [
      { id: 'funnel-awareness', title: '1. Awareness (Attract Leads)' },
      { id: 'funnel-followers', title: '2. Active Followers' }
    ],
  },
  {
    id: 'creation',
    title: '6. Content Creation System With Prompts',
    subsections: [
      { id: 'creation-step1', title: 'Step 1 - Creating Long-Form Content' },
      { id: 'creation-step2', title: 'Step 2 - Generating Social Posts' },
      { id: 'creation-step3', title: 'Step 3 - Creating Visuals' },
      { id: 'creation-step4', title: 'Step 4 - Community Engagement' },
      { id: 'creation-step5', title: 'Step 5 - Cross-Platform Adaptation' }
    ]
  }
];

function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState('');
  const [activeSubsection, setActiveSubsection] = useState('');

  useEffect(() => {
    const observers = new Map();
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -75% 0px', // Start detecting when section is 20% from top and 75% from bottom
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          // If it's a main section
          if (sectionIds.includes(sectionId)) {
            setActiveSection(sectionId);
          } else {
            // It's a subsection
            setActiveSubsection(sectionId);
          }
        }
      });
    };

    // Create observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe main sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        observers.set(id, element);
      }
    });

    // Observe subsections
    document.querySelectorAll('h3[id]').forEach(element => {
      observer.observe(element);
      observers.set(element.id, element);
    });

    return () => {
      observers.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [sectionIds]);

  return { activeSection, activeSubsection, setActiveSection, setActiveSubsection };
}

function ContentCreationSystem() {
  return (
    <div className="prose max-w-none">
      <h2 className="text-3xl font-bold mt-12 mb-6 scroll-mt-20" id="creation">6. Content Creation System With Prompts</h2>
      
      <h3 className="text-2xl font-semibold mt-8 mb-4" id="creation-step1">Step 1. Creating Long-Form Content</h3>
      <p>The first step is writing out a Medium article. Feeling uninspired? Here's a prompt to generate ideas:</p>

      <div className="relative bg-base-200/50 rounded-2xl overflow-hidden group flex items-center my-4">
        <pre className="px-4 py-4 text-left text-sm font-mono w-full whitespace-pre-wrap">
          <code>{`Generate 3-5 content ideas (1-2 sentences each) across the **Expertise**, **Personal Journey**, and **Client Proof** pillars for my systemise writing framwork. Ensure ideas:  
1. Target aspiring [Target Audience]
2. Align with the core message: [Core Message] 
4. Use the keywords and tone from each pillar:  
   - **Expertise**: Mistakes, frameworks, step-by-step guides, habit science.  
   - **Personal Journey**: My story, lessons learned, mindset shifts, relatable struggles.  
   - **Client Proof**: Case studies, viral results, life transformations.  

Examples for inspiration:  
- **Expertise**: *'Why "Write Every Day" Advice Fails Most Creators (And What Works Instead)'* – Debunk myths and position the SS Community's accountability system as the fix.  
- **Personal Journey**: *'How I Went from 0 Followers to 10K in 6 Months (Without Burning Out)'* – Highlight community support and habit frameworks.  
- **Client Proof**: *'How [Name] Grew a 5K Newsletter Using the SS Community's Feedback System'* – Showcase peer review and collaborative growth.  

Structure each idea with a catchy title and a 1-sentence hook.`}</code>
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(`Generate 3-5 content ideas (1-2 sentences each) across the **Expertise**, **Personal Journey**, and **Client Proof** pillars for my systemise writing framwork. Ensure ideas:  
1. Target aspiring [Target Audience]
2. Align with the core message: [Core Message] 
4. Use the keywords and tone from each pillar:  
   - **Expertise**: Mistakes, frameworks, step-by-step guides, habit science.  
   - **Personal Journey**: My story, lessons learned, mindset shifts, relatable struggles.  
   - **Client Proof**: Case studies, viral results, life transformations.  

Examples for inspiration:  
- **Expertise**: *'Why "Write Every Day" Advice Fails Most Creators (And What Works Instead)'* – Debunk myths and position the SS Community's accountability system as the fix.  
- **Personal Journey**: *'How I Went from 0 Followers to 10K in 6 Months (Without Burning Out)'* – Highlight community support and habit frameworks.  
- **Client Proof**: *'How [Name] Grew a 5K Newsletter Using the SS Community's Feedback System'* – Showcase peer review and collaborative growth.  

Structure each idea with a catchy title and a 1-sentence hook.`)}
          className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Copy to clipboard"
        >
          <FaCopy size={15} />
        </button>
      </div>

      <p>If that doesn't get the flow going, try the following prompt to generate an outline for your piece:</p>

      <div className="relative bg-base-200/50 rounded-2xl overflow-hidden group flex items-center my-4">
        <pre className="px-4 py-4 text-left text-sm font-mono w-full whitespace-pre-wrap">
          <code>{`Generate a structured outline for an article titled **'[Insert Title]'** with the subtitle **'[Insert Subtitle]'**. Use this framework:  

1. **Hook**: Write a bold, curiosity-driven opening that addresses the reader's pain points or goals.  
2. **Core Message**: Summarize the article's key lesson or value proposition in 1 sentence.  
3. **Actionable Sections**:  
   - Include **3-5 subheadings** with practical advice (e.g., step-by-step systems, frameworks, or relatable stories).  
   - Add **1 data point, case study, or personal anecdote** to reinforce credibility.  
4. **Closing**: End with a strong call-to-action (CTA) that encourages immediate next steps (e.g., applying the advice or joining a community).  

**Rules**:  
- Keep the tone clear and motivational.  
- Prioritize actionable takeaways over theory.
- Use subheadings that promise specific value (e.g., 'How to…', 'Why…', '3 Mistakes to Avoid').`}</code>
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(`Generate a structured outline for an article titled **'[Insert Title]'** with the subtitle **'[Insert Subtitle]'**. Use this framework:  

1. **Hook**: Write a bold, curiosity-driven opening that addresses the reader's pain points or goals.  
2. **Core Message**: Summarize the article's key lesson or value proposition in 1 sentence.  
3. **Actionable Sections**:  
   - Include **3-5 subheadings** with practical advice (e.g., step-by-step systems, frameworks, or relatable stories).  
   - Add **1 data point, case study, or personal anecdote** to reinforce credibility.  
4. **Closing**: End with a strong call-to-action (CTA) that encourages immediate next steps (e.g., applying the advice or joining a community).  

**Rules**:  
- Keep the tone clear and motivational.  
- Prioritize actionable takeaways over theory.
- Use subheadings that promise specific value (e.g., 'How to…', 'Why…', '3 Mistakes to Avoid').`)}
          className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Copy to clipboard"
        >
          <FaCopy size={15} />
        </button>
      </div>

      <h4 className="text-xl font-semibold mt-6 mb-3" id="content-quality-checklist">Content Quality Checklist</h4>

      <div className="form-control space-y-2">
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">My piece has a great title and subtitle (<a href="https://www.isitwp.com/headline-analyzer/" className="link link-primary" target="_blank" rel="noopener noreferrer">Use this tool</a>)</span>
        </label>
        
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">I start my piece with a beautiful image (Can't find a good one? Use AI.)</span>
        </label>
        
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">The piece has a strong and captivating hook</span>
        </label>
        
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">I've made sure the piece is readable (<a href="https://hemingwayapp.com" className="link link-primary" target="_blank" rel="noopener noreferrer">Check readability grade here</a>)</span>
        </label>
        
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">There are no more grammar mistakes (<a href="https://quillbot.com" className="link link-primary" target="_blank" rel="noopener noreferrer">Edit with QuillBot</a>)</span>
        </label>
        
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">A clear CTA has been added to the end of my piece</span>
        </label>
        
        <label className="label cursor-pointer justify-start gap-4">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <span className="label-text">Someone (a human) has read and reviewed my article</span>
        </label>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-4" id="creation-step2">Step 2. Generating Social Posts</h3>

      <p>After creating your long-form content, it's time to repurpose it into social media posts. Here's a powerful prompt for generating engaging tweets:</p>

      <div className="relative bg-base-200/50 rounded-2xl overflow-hidden group flex items-center my-4">
        <pre className="px-4 py-4 text-left text-sm font-mono w-full whitespace-pre-wrap">
          <code>{`**Instructions:**  
Act as a **master Twitter content creator** specializing in distilling complex ideas into sharp, actionable tweets. Convert key insights from any submitted long-form piece into standalone, high-impact tweets that follow the style and tone below.

### Core Requirements:
1. **Voice/Tone:**
   - Direct, urgent, and slightly provocative. Avoid fluff or jargon.
   - Use rhetorical questions, counterintuitive statements, and "harsh truth" framing.
    
2. **Formatting Rules:**
   - No bold text, dashes, or markdown. Only plain text and bullet points (•) allowed.
   - Each tweet must be self-contained (no thread continuity).
   - Format each tweet in code blocks for easy copying.
    
3. **Structure:**
   - Start with a clear headline/phrase (e.g., "The Harsh Truth").
   - Follow with 1-2 concise sentences and/or bullet points.
   - End with a reflection question, CTA, or punchy closing line.

### Style Templates:
- "Why Most People Fail: They chase X instead of Y."
- "The Secret Nobody Tells You: [Counterintuitive insight]"
- "What I Wish I Knew at 20: [Lesson]"
- "Stop Doing X. Do Y Instead."

### Example Output:
Success Isn't What You Think  
It's not about luck. Not about talent.  
It's about who starts first.  
The best time was yesterday. The second best? Right. Now.  
• Start small.  
• Stay consistent.

### Notes:
- Generate 10-20 standalone tweets per article
- Prioritize originality over generic advice
- Keep tweets under 280 characters`}</code>
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(`**Instructions:**  
Act as a **master Twitter content creator** specializing in distilling complex ideas into sharp, actionable tweets. Convert key insights from any submitted long-form piece into standalone, high-impact tweets that follow the style and tone below.

### Core Requirements:
1. **Voice/Tone:**
   - Direct, urgent, and slightly provocative. Avoid fluff or jargon.
   - Use rhetorical questions, counterintuitive statements, and "harsh truth" framing.
    
2. **Formatting Rules:**
   - No bold text, dashes, or markdown. Only plain text and bullet points (•) allowed.
   - Each tweet must be self-contained (no thread continuity).
   - Format each tweet in code blocks for easy copying.
    
3. **Structure:**
   - Start with a clear headline/phrase (e.g., "The Harsh Truth").
   - Follow with 1-2 concise sentences and/or bullet points.
   - End with a reflection question, CTA, or punchy closing line.

### Style Templates:
- "Why Most People Fail: They chase X instead of Y."
- "The Secret Nobody Tells You: [Counterintuitive insight]"
- "What I Wish I Knew at 20: [Lesson]"
- "Stop Doing X. Do Y Instead."

### Example Output:
Success Isn't What You Think  
It's not about luck. Not about talent.  
It's about who starts first.  
The best time was yesterday. The second best? Right. Now.  
• Start small.  
• Stay consistent.

### Notes:
- Generate 10-20 standalone tweets per article
- Prioritize originality over generic advice
- Keep tweets under 280 characters`)}
          className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Copy to clipboard"
        >
          <FaCopy size={15} />
        </button>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-4" id="creation-step3">Step 3. Creating Visuals</h3>

      <p>Transform your key points into engaging visuals using this AI prompt:</p>

      <div className="relative bg-base-200/50 rounded-2xl overflow-hidden group flex items-center my-4">
        <pre className="px-4 py-4 text-left text-sm font-mono w-full whitespace-pre-wrap">
          <code>{`**Instructions for AI:**  
Act as a content analyst and visual metaphor designer. Your task is to:  
1. **Summarize the article's core message** in 1–2 sentences.  
2. **Extract 3–5 key ideas** (themes, arguments, data points, or metaphors) that could translate into simple visuals.  
3. For each key idea, **suggest 1–3 minimalist visual concepts** (e.g., charts, objects, symbols) that represent it. Prioritize:  
   - **Symbolic simplicity**: Everyday objects (arrows, trees, scales), basic charts (bar, pie, line), or abstract shapes.  
   - **Emotional impact**: Pair visuals with a short, powerful message.  
   - **Universality**: Concepts that resonate across audiences.  
4. Provide a **final summary table** of ideas and visuals for quick reference.  

**Guidelines:**
- Avoid text-heavy visuals
- Use minimalist charts for data
- Consider color symbolism`}</code>
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(`**Instructions for AI:**  
Act as a content analyst and visual metaphor designer. Your task is to:  
1. **Summarize the article's core message** in 1–2 sentences.  
2. **Extract 3–5 key ideas** (themes, arguments, data points, or metaphors) that could translate into simple visuals.  
3. For each key idea, **suggest 1–3 minimalist visual concepts** (e.g., charts, objects, symbols) that represent it. Prioritize:  
   - **Symbolic simplicity**: Everyday objects (arrows, trees, scales), basic charts (bar, pie, line), or abstract shapes.  
   - **Emotional impact**: Pair visuals with a short, powerful message.  
   - **Universality**: Concepts that resonate across audiences.  
4. Provide a **final summary table** of ideas and visuals for quick reference.  

**Guidelines:**
- Avoid text-heavy visuals
- Use minimalist charts for data
- Consider color symbolism`)}
          className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Copy to clipboard"
        >
          <FaCopy size={15} />
        </button>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-4" id="creation-step4">Step 4. Community Engagement</h3>

      <div className="alert alert-info shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h4 className="font-bold">Engagement Guidelines</h4>
            <ul className="mt-2">
              <li>• Respond to comments within 24 hours</li>
              <li>• Share others' content regularly (aim for 1:1 ratio)</li>
              <li>• Join relevant discussions with valuable insights</li>
              <li>• Build genuine connections (3-5 new connections per week)</li>
              <li>• Support fellow creators through thoughtful engagement</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-4" id="creation-step5">Step 5. Cross-Platform Adaptation</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">LinkedIn</h3>
            <ul className="list-disc list-inside">
              <li>Focus on professional insights</li>
              <li>Add industry statistics</li>
              <li>Share business lessons</li>
              <li>Use formal tone</li>
            </ul>

            <div className="relative bg-base-300/50 rounded-lg overflow-hidden group flex items-center mt-4 p-3">
              <pre className="text-left text-sm font-mono w-full whitespace-pre-wrap">
                <code>{`**LinkedIn Post Framework:**
1. Hook (First 2-3 lines visible):
   - Start with a business insight/statistic
   - Share a contrarian view
   - Ask a thought-provoking question

2. Structure:
   - Problem → Solution → Validation
   - Personal story → Lesson → Application
   - Statistic → Analysis → Implication

3. Format:
   • Use short paragraphs (1-2 lines)
   • Add 3-5 bullet points
   • Include relevant hashtags (3-5)
   • End with a question/CTA

Example:
"73% of professionals feel stuck in their careers.
But the real problem isn't lack of opportunities.
It's [unexpected insight].

Here's what I mean:
• [Point 1]
• [Point 2]
• [Point 3]

The solution?
[Your unique mechanism/approach]

What's holding YOU back from [desired outcome]?

#CareerGrowth #Leadership #PersonalDevelopment"`}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(`**LinkedIn Post Framework:**
1. Hook (First 2-3 lines visible):
   - Start with a business insight/statistic
   - Share a contrarian view
   - Ask a thought-provoking question

2. Structure:
   - Problem → Solution → Validation
   - Personal story → Lesson → Application
   - Statistic → Analysis → Implication

3. Format:
   • Use short paragraphs (1-2 lines)
   • Add 3-5 bullet points
   • Include relevant hashtags (3-5)
   • End with a question/CTA

Example:
"73% of professionals feel stuck in their careers.
But the real problem isn't lack of opportunities.
It's [unexpected insight].

Here's what I mean:
• [Point 1]
• [Point 2]
• [Point 3]

The solution?
[Your unique mechanism/approach]

What's holding YOU back from [desired outcome]?

#CareerGrowth #Leadership #PersonalDevelopment`)}
                className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy to clipboard"
              >
                <FaCopy size={15} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Instagram</h3>
            <ul className="list-disc list-inside">
              <li>Create 3-5 slide carousels</li>
              <li>Use visually appealing templates</li>
              <li>Include clear takeaways</li>
              <li>End with strong CTA</li>
            </ul>

            <div className="relative bg-base-300/50 rounded-lg overflow-hidden group flex items-center mt-4 p-3">
              <pre className="text-left text-sm font-mono w-full whitespace-pre-wrap">
                <code>{`**Instagram Carousel Framework:**
1. Cover Slide:
   • Bold headline (problem/promise)
   • Sub-headline (benefit)
   • Clean, relevant visual
   • Your branding

2. Content Flow (3-5 slides):
   Slide 1: Problem/Hook
   • What's the pain point?
   • Why should they care?
   
   Slide 2-4: Core Content
   • One key point per slide
   • Simple visuals/icons
   • Max 2-3 bullet points
   
   Final Slide: CTA
   • Clear next step
   • Your handle/brand
   • "Save this post if..."

3. Caption Template:
   • Hook question/statement
   • Preview value
   • Break down key points
   • End with engaging question
   • 
   Hashtags (in first comment):
   #PersonalGrowth #Motivation
   #Success #SelfImprovement`}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(`**Instagram Carousel Framework:**
1. Cover Slide:
   • Bold headline (problem/promise)
   • Sub-headline (benefit)
   • Clean, relevant visual
   • Your branding

2. Content Flow (3-5 slides):
   Slide 1: Problem/Hook
   • What's the pain point?
   • Why should they care?
   
   Slide 2-4: Core Content
   • One key point per slide
   • Simple visuals/icons
   • Max 2-3 bullet points
   
   Final Slide: CTA
   • Clear next step
   • Your handle/brand
   • "Save this post if..."

3. Caption Template:
   • Hook question/statement
   • Preview value
   • Break down key points
   • End with engaging question
   • 
   Hashtags (in first comment):
   #PersonalGrowth #Motivation
   #Success #SelfImprovement`)}
                className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy to clipboard"
              >
                <FaCopy size={15} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">YouTube</h3>
            <ul className="list-disc list-inside">
              <li>Convert articles to video scripts</li>
              <li>Break down into 3-5 key points</li>
              <li>Add personal stories</li>
              <li>Include b-roll suggestions</li>
            </ul>

            <div className="relative bg-base-300/50 rounded-lg overflow-hidden group flex items-center mt-4 p-3">
              <pre className="text-left text-sm font-mono w-full whitespace-pre-wrap">
                <code>{`**YouTube Script Template:**
1. Hook (First 30 seconds):
   • Pattern interrupt opening
   • State problem/promise
   • Preview key takeaways
   • "Stay until the end for..."

2. Content Structure:
   Intro (0:00-1:00)
   • Your credibility
   • Why this matters
   • What they'll learn

   Main Points (1:00-7:00)
   • 3-5 key sections
   • Story → Lesson format
   • B-roll suggestions per point
   
   Conclusion (7:00-8:00)
   • Recap key points
   • Share success story
   • Clear CTA

3. B-Roll Checklist:
   • Talking head shots
   • Screen recordings
   • Stock footage moments
   • Text overlays
   • Visual metaphors

4. Video Description Template:
   • Timestamp chapters
   • Resource links
   • Social media links
   • Keywords/tags`}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(`**YouTube Script Template:**
1. Hook (First 30 seconds):
   • Pattern interrupt opening
   • State problem/promise
   • Preview key takeaways
   • "Stay until the end for..."

2. Content Structure:
   Intro (0:00-1:00)
   • Your credibility
   • Why this matters
   • What they'll learn

   Main Points (1:00-7:00)
   • 3-5 key sections
   • Story → Lesson format
   • B-roll suggestions per point
   
   Conclusion (7:00-8:00)
   • Recap key points
   • Share success story
   • Clear CTA

3. B-Roll Checklist:
   • Talking head shots
   • Screen recordings
   • Stock footage moments
   • Text overlays
   • Visual metaphors

4. Video Description Template:
   • Timestamp chapters
   • Resource links
   • Social media links
   • Keywords/tags`)}
                className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy to clipboard"
              >
                <FaCopy size={15} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Newsletter</h3>
            <ul className="list-disc list-inside">
              <li>Package content as exclusive insights</li>
              <li>Add personal updates</li>
              <li>Include behind-the-scenes content</li>
              <li>End with next week's preview</li>
            </ul>

            <div className="relative bg-base-300/50 rounded-lg overflow-hidden group flex items-center mt-4 p-3">
              <pre className="text-left text-sm font-mono w-full whitespace-pre-wrap">
                <code>{`**Newsletter Framework:**
1. Subject Line Formulas:
   • "Inside: [Intriguing Topic]"
   • "The Truth About [Topic]"
   • "[Number] Lessons From [Experience]"
   • "What Nobody Tells You About..."

2. Content Structure:
   Opening (Personality)
   • Personal story/update
   • Behind-the-scenes moment
   • Current challenge/win

   Main Content (Value)
   • Key insight of the week
   • Resource breakdown
   • Step-by-step guide
   • Case study/example

   Community Corner
   • Member spotlight
   • Q&A response
   • Challenge updates

   Closing
   • Next week's preview
   • Quick action step
   • Engagement question

3. Formatting Tips:
   • Short paragraphs
   • Use subheadings
   • Add bullet points
   • Include one CTA
   • Keep mobile-friendly`}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(`**Newsletter Framework:**
1. Subject Line Formulas:
   • "Inside: [Intriguing Topic]"
   • "The Truth About [Topic]"
   • "[Number] Lessons From [Experience]"
   • "What Nobody Tells You About..."

2. Content Structure:
   Opening (Personality)
   • Personal story/update
   • Behind-the-scenes moment
   • Current challenge/win

   Main Content (Value)
   • Key insight of the week
   • Resource breakdown
   • Step-by-step guide
   • Case study/example

   Community Corner
   • Member spotlight
   • Q&A response
   • Challenge updates

   Closing
   • Next week's preview
   • Quick action step
   • Engagement question

3. Formatting Tips:
   • Short paragraphs
   • Use subheadings
   • Add bullet points
   • Include one CTA
   • Keep mobile-friendly`)}
                className="absolute top-3 right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy to clipboard"
              >
                <FaCopy size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Update the main component to use ContentCreationSystem
export default function WritingProtocolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { status } = useSession();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Keep SECTIONS for sidebar structure, but don't use content property
  const sections = useMemo(() => SECTIONS, []);
  
  // We'll track which sections have content separately
  const [sectionsWithContent, setSectionsWithContent] = useState<Record<string, string>>({});
  
  // Function to generate calendar links for different services
  const generateCalendarLink = (service: 'google' | 'apple' | 'outlook' | 'ical') => {
    if (!protocol || !protocol.aiGeneratedContent?.contentCalendar?.days) {
      toast.error('Cannot generate calendar events: No calendar data available');
      return;
    }
    
    try {
      // Get the current date and set it to Monday of the current week for default start
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(today.setDate(diff));
      
      // Format dates for calendar
      const formatDate = (date: Date, includeTime = false): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        if (includeTime) {
          return `${year}${month}${day}T090000`;  // Default to 9:00 AM
        }
        return `${year}${month}${day}`;
      };
      
      // Create events from the content calendar
      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const events = [];
      
      for (let i = 0; i < dayKeys.length; i++) {
        const dayKey = dayKeys[i];
        const dayContent = protocol.aiGeneratedContent.contentCalendar.days[dayKey as keyof typeof protocol.aiGeneratedContent.contentCalendar.days] || [];
        
        if (dayContent.length > 0) {
          // Create a date for this day of the week
          const eventDate = new Date(monday);
          eventDate.setDate(monday.getDate() + i);
          
          for (const item of dayContent) {
            events.push({
              title: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ${item.title || 'Content Creation'}`,
              description: `Content type: ${item.type}\nPart of your content calendar from NotiFast Writing Protocol`,
              start: formatDate(eventDate, true),
              end: formatDate(eventDate, true).replace('090000', '100000'),  // End 1 hour later
              location: '',
              date: eventDate
            });
          }
        }
      }
      
      if (events.length === 0) {
        toast.error('No events found in your content calendar');
        return;
      }
      
      // Generate link based on the service
      switch (service) {
        case 'google': {
          // Generate Google Calendar links
          for (const event of events) {
            const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}`;
            window.open(googleUrl, '_blank');
            break; // Just open the first event for testing
          }
          toast.success('Opening Google Calendar');
          break;
        }
        
        case 'outlook': {
          // Generate Outlook Calendar links
          for (const event of events) {
            const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.date.toISOString()}&enddt=${new Date(event.date.getTime() + 3600000).toISOString()}&body=${encodeURIComponent(event.description)}`;
            window.open(outlookUrl, '_blank');
            break; // Just open the first event for testing
          }
          toast.success('Opening Outlook Calendar');
          break;
        }
        
        case 'apple': {
          // For Apple Calendar, suggest downloading the iCal file
          generateICalFile(events);
          toast.success('Downloading iCal file for Apple Calendar');
          break;
        }
        
        case 'ical': {
          // Generate an iCal file for download
          generateICalFile(events);
          toast.success('Downloading iCal file');
          break;
        }
        
        default:
          toast.error('Unsupported calendar service');
      }
    } catch (error) {
      console.error('Error generating calendar link:', error);
      toast.error('Failed to generate calendar link');
    }
  };
  
  // Function to generate and download an iCal file
  const generateICalFile = (events: Array<{title: string, description: string, start: string, end: string, location: string}>) => {
    let iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NotiFast//Writing Protocol Calendar//EN'
    ];
    
    events.forEach(event => {
      iCalContent = iCalContent.concat([
        'BEGIN:VEVENT',
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
        `DTSTART:${event.start}`,
        `DTEND:${event.end}`,
        `LOCATION:${event.location}`,
        'END:VEVENT'
      ]);
    });
    
    iCalContent.push('END:VCALENDAR');
    
    const blob = new Blob([iCalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Fix: Add null check for protocol
    link.setAttribute('download', `${protocol?.title?.replace(/\s+/g, '_') || 'writing-protocol'}_calendar.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    const fetchProtocol = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fix: Properly validate and log ID
        if (!params || !params.id) {
          console.error('Missing ID parameter');
          throw new Error('Invalid protocol ID');
        }
        
        // Ensure ID is not the string "undefined" or "null"
        if (params.id === 'undefined' || params.id === 'null') {
          console.error('Invalid ID value:', params.id);
          throw new Error('Invalid protocol ID');
        }
        
        // Log the ID we're trying to fetch
        console.log('Fetching protocol with ID:', params.id);
        
        // Use explicit string ID to avoid any typing issues
        const protocolId = String(params.id).trim();
        
        const response = await fetch(`/api/writing-protocol/${protocolId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch protocol');
        }
        
        const data = await response.json();
        console.log('Protocol data received:', data);
        
        setProtocol(data);
        
        // Update sections content with AI-generated content
        if (data && data.aiGeneratedContent) {
          const contentMap: Record<string, string> = {};
          
          // Update Section 1: Niche Authority Growth System
          if (data.aiGeneratedContent.nicheAuthority) {
            const { fullNiche, coreMessage, uniqueMechanism, targetAudience } = data.aiGeneratedContent.nicheAuthority;
            
            contentMap['niche'] = `
## 1. Niche Authority Growth System

### **Full Niche:**

${fullNiche || 'Not specified'}

### **Core Message:**

${coreMessage || 'Not specified'}

### **Unique Mechanism:**

${uniqueMechanism || 'Not specified'}

### **Target Audience:**

${Array.isArray(targetAudience) ? targetAudience.map(audience => `- ${audience}`).join('\n') : '- Not specified'}`;
          }
          
          // Update Section 2: The 3 Main Content Pillars
          if (data.aiGeneratedContent.contentPillars) {
            const { expertise, personalJourney, clientProof } = data.aiGeneratedContent.contentPillars;
            
            contentMap['pillars'] = `
## 2. The 3 Main Content Pillars

### **1. Expertise (Skills & Knowledge)**

Keywords: Mistakes, Tips & Tricks, Skills, Lessons, Frameworks, Step-by-step guide, Course

**Content Ideas:**

${expertise?.contentIdeas ? expertise.contentIdeas.map((idea: string) => `- **${idea}**`).join('\n') : '- No content ideas provided'}

### **2. Personal Journey (Storytelling & Relatability)**

Keywords: My Story, My Mistakes, How I, I Learned, X Lessons I Learned, My Framework

**Content Ideas:**

${personalJourney?.contentIdeas ? personalJourney.contentIdeas.map((idea: string) => `- **${idea}**`).join('\n') : '- No content ideas provided'}

### **3. Client Proof & Credibility (Results & Social Proof)**

Keywords: How My Friend, I helped this guy, I achieved, I became the number one

**Content Ideas:**

${clientProof?.contentIdeas ? clientProof.contentIdeas.map((idea: string) => `- **${idea}**`).join('\n') : '- No content ideas provided'}`;
          }
          
          // Update Section 3: The Repurpose System
          if (data.aiGeneratedContent.repurposeSystem) {
            const { thoughtLeadershipArticle, formats } = data.aiGeneratedContent.repurposeSystem;
            
            contentMap['repurpose'] = `
## 3. The Repurpose System

### **Thought-Leadership Article (${thoughtLeadershipArticle?.frequency || 3}x/week)**

**Headline:** "${thoughtLeadershipArticle?.headline || 'No headline provided'}"

**Breakdown:**

1. **Hook** – "${thoughtLeadershipArticle?.hook || 'No hook provided'}"
2. **Storytelling** – ${thoughtLeadershipArticle?.storytelling || 'No storytelling approach provided'}
3. **Value Points** – ${Array.isArray(thoughtLeadershipArticle?.valuePoints) ? 
    thoughtLeadershipArticle.valuePoints.map((point: string, index: number) => `\n   - **Point ${index+1}:** ${point}`).join('') : 
    '\n   - No value points provided'}
4. **CTA** – "${thoughtLeadershipArticle?.cta || 'No call-to-action provided'}"

### **Repurposed Content Formats**

### **1. Short-Form Content (${formats?.shortFormFrequency || 7}x/week)**

A simple daily quote, insight, or micro-tip.

${Array.isArray(formats?.shortForm) ? formats.shortForm.map((item: string) => `- ${item}`).join('\n') : '- No short-form content provided'}

### **2. Thread Structure (${formats?.threads?.frequency || 3}x/week)**

**Hook:** "${formats?.threads?.hook || 'No hook provided'}"

**Body:**
${Array.isArray(formats?.threads?.body) ? formats.threads.body.map((point: string) => `- ${point}`).join('\n') : '- No thread body provided'}

**CTA:** "${formats?.threads?.cta || 'No call-to-action provided'}"`;
          }
          
          // Update Section 4: Content Calendar
          contentMap['calendar'] = `## **4. The 1-Week Content Calendar**`;
          
          // Update Section 5: Conversion Funnel
          if (data.aiGeneratedContent.conversionFunnel) {
            const { awareness, activeFollowers, conversion } = data.aiGeneratedContent.conversionFunnel;
            
            let conversionContent = '';
            if (conversion && (conversion.goal || conversion.strategies?.length || conversion.offers?.length)) {
              conversionContent = `
### **3. Conversion (Close Sales)**

**Goal:** ${conversion.goal || 'No goal specified'}

**Strategies:**
${Array.isArray(conversion.strategies) ? conversion.strategies.map((strategy: string) => `- ${strategy}`).join('\n') : '- No strategies specified'}

${conversion.offers?.length ? `**Offers:**
${Array.isArray(conversion.offers) ? conversion.offers.map((offer: string) => `- ${offer}`).join('\n') : ''}` : ''}

${conversion.callToAction ? `**Call To Action:** ${conversion.callToAction}` : ''}`;
            }
            
            contentMap['funnel'] = `
## 5. The Conversion Funnel

### **1. Awareness (Attract Leads)**

**Goal:** ${awareness?.goal || 'No goal specified'}

- **Content Strategy:** ${Array.isArray(awareness?.contentStrategy) ? awareness.contentStrategy.join(', ') : 'Not specified'}
- **Lead Magnet:** ${awareness?.leadMagnet || 'Not specified'}
- **Outreach:** ${awareness?.outreach || 'Not specified'}

### **2. Active Followers (Nurture & Qualify)**

**Goal:** ${activeFollowers?.goal || 'No goal specified'}

**Strategies:**
${Array.isArray(activeFollowers?.strategies) ? activeFollowers.strategies.map((strategy: string) => `- ${strategy}`).join('\n') : '- No strategies specified'}
${conversionContent}`;
          }
          
          // Update Section 6: Content Creation System
          contentMap['creation'] = ''; // This is handled by the ContentCreationSystem component
          
          setSectionsWithContent(contentMap);
        }
      } catch (error) {
        console.error('Error fetching protocol:', error);
        setError(error instanceof Error ? error.message : 'Failed to load writing protocol');
        toast.error('Failed to load writing protocol');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchProtocol();
    }
  }, [params.id, router, status, sections]); // Track sections in dependencies

  const { activeSection, activeSubsection, setActiveSection, setActiveSubsection } = useActiveSection(
    sections.map(s => s.id)
  );

  const handleScrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrint = () => {
    // Temporarily hide the sidebar and adjust layout for printing
    const sidebar = document.querySelector('.sidebar-navigation') as HTMLElement;
    const mainContent = document.querySelector('.main-content-wrapper') as HTMLElement;
    
    if (sidebar && mainContent) {
      // Save original classes to restore after print
      const originalSidebarDisplay = sidebar.style.display;
      const originalMainContentClass = mainContent.className;
      
      // Adjust for printing
      sidebar.style.display = 'none';
      mainContent.className = 'print-layout';
      
      // Trigger print
      window.print();
      
      // Restore original layout after print dialog closes
      setTimeout(() => {
        sidebar.style.display = originalSidebarDisplay;
        mainContent.className = originalMainContentClass;
      }, 1000);
    } else {
      // Fallback if elements aren't found
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (!protocol) return;
    
    try {
      setIsGeneratingPDF(true);
      toast.loading('Generating PDF...');
      
      // We'll use jsPDF directly with a text-based approach since html2canvas has OKLCH color issues
      const { jsPDF } = await import('jspdf');
      
      // First, prepare the content for capture
      const sidebar = document.querySelector('.sidebar-navigation') as HTMLElement;
      const mainContent = document.querySelector('.main-content-wrapper') as HTMLElement;
      
      if (sidebar && mainContent) {
        // Save original styles to restore later
        const originalSidebarDisplay = sidebar.style.display;
        const originalMainContentClass = mainContent.className;
        
        try {
          // Hide sidebar and adjust content for PDF
          sidebar.style.display = 'none';
          mainContent.className = 'print-layout';
          
          // Create a text-based PDF
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Add title page
          pdf.setFontSize(24);
          pdf.text(protocol.title, pageWidth / 2, 30, { align: 'center' });
          
          // Add metadata
          pdf.setFontSize(12);
          pdf.text(`Role: ${protocol.userRole}`, 20, 50);
          pdf.text(`Industry: ${protocol.industry}`, 20, 58);
          pdf.text(`Last updated: ${new Date(protocol.updatedAt).toLocaleDateString()}`, 20, 66);
          
          // Add each section - Start with a new page after title
          pdf.addPage();
          
          // Section 1: Niche Authority
          let currentY = 20;
          if (protocol.aiGeneratedContent?.nicheAuthority) {
            const { fullNiche, coreMessage, uniqueMechanism, targetAudience } = protocol.aiGeneratedContent.nicheAuthority;
            
            pdf.setFontSize(18);
            pdf.text('1. Niche Authority Growth System', 20, currentY);
            currentY += 12;
            
            pdf.setFontSize(14);
            pdf.text('Full Niche:', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            const fullNicheText = pdf.splitTextToSize(fullNiche || 'Not specified', pageWidth - 40);
            pdf.text(fullNicheText, 20, currentY);
            currentY += fullNicheText.length * 6 + 6;
            
            pdf.setFontSize(14);
            pdf.text('Core Message:', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            const coreMessageText = pdf.splitTextToSize(coreMessage || 'Not specified', pageWidth - 40);
            pdf.text(coreMessageText, 20, currentY);
            currentY += coreMessageText.length * 6 + 6;
            
            pdf.setFontSize(14);
            pdf.text('Unique Mechanism:', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            const uniqueMechanismText = pdf.splitTextToSize(uniqueMechanism || 'Not specified', pageWidth - 40);
            pdf.text(uniqueMechanismText, 20, currentY);
            currentY += uniqueMechanismText.length * 6 + 6;
            
            pdf.setFontSize(14);
            pdf.text('Target Audience:', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            if (Array.isArray(targetAudience) && targetAudience.length > 0) {
              targetAudience.forEach(audience => {
                const audienceText = pdf.splitTextToSize(`• ${audience}`, pageWidth - 40);
                pdf.text(audienceText, 20, currentY);
                currentY += audienceText.length * 6 + 4;
              });
            } else {
              pdf.text('• Not specified', 20, currentY);
              currentY += 6;
            }
          }
          
          // Add a new page for the next section
          pdf.addPage();
          currentY = 20;
          
          // Section 2: Content Pillars
          if (protocol.aiGeneratedContent?.contentPillars) {
            const { expertise, personalJourney, clientProof } = protocol.aiGeneratedContent.contentPillars;
            
            pdf.setFontSize(18);
            pdf.text('2. The 3 Main Content Pillars', 20, currentY);
            currentY += 12;
            
            // Expertise
            pdf.setFontSize(14);
            pdf.text('1. Expertise (Skills & Knowledge)', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            pdf.text('Content Ideas:', 20, currentY);
            currentY += 6;
            
            if (expertise?.contentIdeas && expertise.contentIdeas.length > 0) {
              expertise.contentIdeas.forEach(idea => {
                const ideaText = pdf.splitTextToSize(`• ${idea}`, pageWidth - 40);
                pdf.text(ideaText, 20, currentY);
                currentY += ideaText.length * 6 + 4;
                
                // If we're getting close to the bottom of the page, start a new page
                if (currentY > pageHeight - 30) {
                  pdf.addPage();
                  currentY = 20;
                }
              });
            } else {
              pdf.text('• No content ideas provided', 20, currentY);
              currentY += 6;
            }
            
            // If we're getting close to the bottom of the page, start a new page
            if (currentY > pageHeight - 60) {
              pdf.addPage();
              currentY = 20;
            } else {
              currentY += 10;
            }
            
            // Personal Journey
            pdf.setFontSize(14);
            pdf.text('2. Personal Journey (Storytelling & Relatability)', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            pdf.text('Content Ideas:', 20, currentY);
            currentY += 6;
            
            if (personalJourney?.contentIdeas && personalJourney.contentIdeas.length > 0) {
              personalJourney.contentIdeas.forEach(idea => {
                const ideaText = pdf.splitTextToSize(`• ${idea}`, pageWidth - 40);
                pdf.text(ideaText, 20, currentY);
                currentY += ideaText.length * 6 + 4;
                
                // If we're getting close to the bottom of the page, start a new page
                if (currentY > pageHeight - 30) {
                  pdf.addPage();
                  currentY = 20;
                }
              });
            } else {
              pdf.text('• No content ideas provided', 20, currentY);
              currentY += 6;
            }
            
            // If we're getting close to the bottom of the page, start a new page
            if (currentY > pageHeight - 60) {
              pdf.addPage();
              currentY = 20;
            } else {
              currentY += 10;
            }
            
            // Client Proof
            pdf.setFontSize(14);
            pdf.text('3. Client Proof & Credibility (Results & Social Proof)', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            pdf.text('Content Ideas:', 20, currentY);
            currentY += 6;
            
            if (clientProof?.contentIdeas && clientProof.contentIdeas.length > 0) {
              clientProof.contentIdeas.forEach(idea => {
                const ideaText = pdf.splitTextToSize(`• ${idea}`, pageWidth - 40);
                pdf.text(ideaText, 20, currentY);
                currentY += ideaText.length * 6 + 4;
                
                // If we're getting close to the bottom of the page, start a new page
                if (currentY > pageHeight - 30) {
                  pdf.addPage();
                  currentY = 20;
                }
              });
            } else {
              pdf.text('• No content ideas provided', 20, currentY);
              currentY += 6;
            }
          }
          
          // Add a new page for the next section
          pdf.addPage();
          currentY = 20;
          
          // Section 3: Repurpose System
          if (protocol.aiGeneratedContent?.repurposeSystem) {
            const { thoughtLeadershipArticle, formats } = protocol.aiGeneratedContent.repurposeSystem;
            
            pdf.setFontSize(18);
            pdf.text('3. The Repurpose System', 20, currentY);
            currentY += 12;
            
            pdf.setFontSize(14);
            pdf.text(`Thought-Leadership Article (${thoughtLeadershipArticle?.frequency || 3}x/week)`, 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            pdf.text(`Headline: "${thoughtLeadershipArticle?.headline || 'No headline provided'}"`, 20, currentY);
            currentY += 6;
            
            pdf.text(`Hook: "${thoughtLeadershipArticle?.hook || 'No hook provided'}"`, 20, currentY);
            currentY += 6;
            
            const storytellingText = pdf.splitTextToSize(`Storytelling: ${thoughtLeadershipArticle?.storytelling || 'No storytelling approach provided'}`, pageWidth - 40);
            pdf.text(storytellingText, 20, currentY);
            currentY += storytellingText.length * 6 + 6;
            
            pdf.text('Value Points:', 20, currentY);
            currentY += 6;
            
            if (Array.isArray(thoughtLeadershipArticle?.valuePoints) && thoughtLeadershipArticle.valuePoints.length > 0) {
              thoughtLeadershipArticle.valuePoints.forEach((point, index) => {
                const pointText = pdf.splitTextToSize(`• Point ${index+1}: ${point}`, pageWidth - 40);
                pdf.text(pointText, 20, currentY);
                currentY += pointText.length * 6 + 4;
                
                // If we're getting close to the bottom of the page, start a new page
                if (currentY > pageHeight - 30) {
                  pdf.addPage();
                  currentY = 20;
                }
              });
            } else {
              pdf.text('• No value points provided', 20, currentY);
              currentY += 6;
            }
            
            pdf.text(`CTA: "${thoughtLeadershipArticle?.cta || 'No call-to-action provided'}"`, 20, currentY);
            currentY += 10;
            
            // If we're getting close to the bottom of the page, start a new page
            if (currentY > pageHeight - 60) {
              pdf.addPage();
              currentY = 20;
            }
            
            pdf.setFontSize(14);
            pdf.text('Repurposed Content Formats', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(12);
            pdf.text(`1. Short-Form Content (${formats?.shortFormFrequency || 7}x/week)`, 20, currentY);
            currentY += 6;
            
            pdf.setFontSize(11);
            pdf.text('A simple daily quote, insight, or micro-tip.', 20, currentY);
            currentY += 6;
            
            if (Array.isArray(formats?.shortForm) && formats.shortForm.length > 0) {
              formats.shortForm.forEach(item => {
                const itemText = pdf.splitTextToSize(`• ${item}`, pageWidth - 40);
                pdf.text(itemText, 20, currentY);
                currentY += itemText.length * 6 + 4;
                
                // If we're getting close to the bottom of the page, start a new page
                if (currentY > pageHeight - 30) {
                  pdf.addPage();
                  currentY = 20;
                }
              });
            } else {
              pdf.text('• No short-form content provided', 20, currentY);
              currentY += 6;
            }
            
            // If we're getting close to the bottom of the page, start a new page
            if (currentY > pageHeight - 60) {
              pdf.addPage();
              currentY = 20;
            } else {
              currentY += 10;
            }
            
            pdf.setFontSize(12);
            pdf.text(`2. Thread Structure (${formats?.threads?.frequency || 3}x/week)`, 20, currentY);
            currentY += 6;
            
            pdf.setFontSize(11);
            pdf.text(`Hook: "${formats?.threads?.hook || 'No hook provided'}"`, 20, currentY);
            currentY += 6;
            
            pdf.text('Body:', 20, currentY);
            currentY += 6;
            
            if (Array.isArray(formats?.threads?.body) && formats.threads.body.length > 0) {
              formats.threads.body.forEach(point => {
                const pointText = pdf.splitTextToSize(`• ${point}`, pageWidth - 40);
                pdf.text(pointText, 20, currentY);
                currentY += pointText.length * 6 + 4;
                
                // If we're getting close to the bottom of the page, start a new page
                if (currentY > pageHeight - 30) {
                  pdf.addPage();
                  currentY = 20;
                }
              });
            } else {
              pdf.text('• No thread body provided', 20, currentY);
              currentY += 6;
            }
            
            pdf.text(`CTA: "${formats?.threads?.cta || 'No call-to-action provided'}"`, 20, currentY);
          }
          
          // Add a new page for the next section
          pdf.addPage();
          currentY = 20;
          
          // Section 4: Content Calendar (simplified representation)
          pdf.setFontSize(18);
          pdf.text('4. The 1-Week Content Calendar', 20, currentY);
          currentY += 12;
          
          if (protocol.aiGeneratedContent?.contentCalendar?.days) {
            const days = protocol.aiGeneratedContent.contentCalendar.days;
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            dayNames.forEach(dayName => {
              const dayKey = dayName.toLowerCase() as keyof typeof days;
              const dayContent = days[dayKey] || [];
              
              pdf.setFontSize(14);
              pdf.text(dayName, 20, currentY);
              currentY += 8;
              
              pdf.setFontSize(11);
              if (dayContent.length > 0) {
                dayContent.forEach(item => {
                  const itemText = pdf.splitTextToSize(`• ${item.type}: ${item.title}`, pageWidth - 40);
                  pdf.text(itemText, 20, currentY);
                  currentY += itemText.length * 6 + 4;
                });
              } else {
                pdf.text('• No content planned', 20, currentY);
                currentY += 6;
              }
              
              currentY += 4;
              
              // If we're getting close to the bottom of the page, start a new page
              if (currentY > pageHeight - 40 && dayName !== 'Sunday') {
                pdf.addPage();
                currentY = 20;
              }
            });
          } else {
            pdf.setFontSize(11);
            pdf.text('No calendar data available', 20, currentY);
          }
          
          // Add a new page for the next section
          pdf.addPage();
          currentY = 20;
          
          // Section 5: Conversion Funnel
          if (protocol.aiGeneratedContent?.conversionFunnel) {
            const { awareness, activeFollowers, conversion } = protocol.aiGeneratedContent.conversionFunnel;
            
            pdf.setFontSize(18);
            pdf.text('5. The Conversion Funnel', 20, currentY);
            currentY += 12;
            
            pdf.setFontSize(14);
            pdf.text('1. Awareness (Attract Leads)', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            pdf.text(`Goal: ${awareness?.goal || 'No goal specified'}`, 20, currentY);
            currentY += 6;
            
            pdf.text(`Content Strategy: ${Array.isArray(awareness?.contentStrategy) ? awareness.contentStrategy.join(', ') : 'Not specified'}`, 20, currentY);
            currentY += 6;
            
            pdf.text(`Lead Magnet: ${awareness?.leadMagnet || 'Not specified'}`, 20, currentY);
            currentY += 6;
            
            pdf.text(`Outreach: ${awareness?.outreach || 'Not specified'}`, 20, currentY);
            currentY += 10;
            
            // If we're getting close to the bottom of the page, start a new page
            if (currentY > pageHeight - 60) {
              pdf.addPage();
              currentY = 20;
            }
            
            pdf.setFontSize(14);
            pdf.text('2. Active Followers (Nurture & Qualify)', 20, currentY);
            currentY += 8;
            
            pdf.setFontSize(11);
            pdf.text(`Goal: ${activeFollowers?.goal || 'No goal specified'}`, 20, currentY);
            currentY += 6;
            
            pdf.text('Strategies:', 20, currentY);
            currentY += 6;
            
            if (Array.isArray(activeFollowers?.strategies) && activeFollowers.strategies.length > 0) {
              activeFollowers.strategies.forEach(strategy => {
                const strategyText = pdf.splitTextToSize(`• ${strategy}`, pageWidth - 40);
                pdf.text(strategyText, 20, currentY);
                currentY += strategyText.length * 6 + 4;
              });
            } else {
              pdf.text('• No strategies specified', 20, currentY);
              currentY += 6;
            }
            
            // If conversion exists and we have enough space, add it
            if (conversion && (conversion.goal || conversion.strategies?.length || conversion.offers?.length)) {
              // If we're getting close to the bottom of the page, start a new page
              if (currentY > pageHeight - 60) {
                pdf.addPage();
                currentY = 20;
              } else {
                currentY += 10;
              }
              
              pdf.setFontSize(14);
              pdf.text('3. Conversion (Close Sales)', 20, currentY);
              currentY += 8;
              
              pdf.setFontSize(11);
              pdf.text(`Goal: ${conversion.goal || 'No goal specified'}`, 20, currentY);
              currentY += 6;
              
              pdf.text('Strategies:', 20, currentY);
              currentY += 6;
              
              if (Array.isArray(conversion.strategies) && conversion.strategies.length > 0) {
                conversion.strategies.forEach(strategy => {
                  const strategyText = pdf.splitTextToSize(`• ${strategy}`, pageWidth - 40);
                  pdf.text(strategyText, 20, currentY);
                  currentY += strategyText.length * 6 + 4;
                });
              } else {
                pdf.text('• No strategies specified', 20, currentY);
                currentY += 6;
              }
              
              if (Array.isArray(conversion.offers) && conversion.offers.length > 0) {
                currentY += 4;
                pdf.text('Offers:', 20, currentY);
                currentY += 6;
                
                conversion.offers.forEach(offer => {
                  const offerText = pdf.splitTextToSize(`• ${offer}`, pageWidth - 40);
                  pdf.text(offerText, 20, currentY);
                  currentY += offerText.length * 6 + 4;
                });
              }
              
              if (conversion.callToAction) {
                currentY += 4;
                const ctaText = pdf.splitTextToSize(`Call To Action: ${conversion.callToAction}`, pageWidth - 40);
                pdf.text(ctaText, 20, currentY);
              }
            }
          }
          
          // Save PDF and show success message
          pdf.save(`${protocol.title.replace(/\s+/g, '_')}.pdf`);
          toast.dismiss();
          toast.success('PDF downloaded successfully');
        } finally {
          // IMPORTANT: Make sure to always restore the original layout regardless of success or error
          sidebar.style.display = originalSidebarDisplay;
          mainContent.className = originalMainContentClass;
        }
      } else {
        // Fallback to even simpler PDF if elements aren't found
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        
        // Add title
        pdf.setFontSize(24);
        pdf.text(protocol.title, pageWidth / 2, 20, { align: 'center' });
        
        // Add metadata
        pdf.setFontSize(12);
        pdf.text(`Role: ${protocol.userRole}`, 20, 30);
        pdf.text(`Industry: ${protocol.industry}`, 20, 36);
        pdf.text(`Generated: ${new Date(protocol.createdAt).toLocaleDateString()}`, 20, 42);
        
        // Add basic content
        pdf.setFontSize(14);
        pdf.text("Writing Protocol Content", 20, 60);
        pdf.setFontSize(10);
        pdf.text("This PDF contains a simplified version of your Writing Protocol.", 20, 70);
        pdf.text("For the full interactive version, please view it in the app.", 20, 76);
        
        pdf.save(`${protocol.title.replace(/\s+/g, '_')}.pdf`);
        toast.dismiss();
        toast.success('PDF downloaded successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
      
      // Make sure to restore the view even after error
      const sidebar = document.querySelector('.sidebar-navigation') as HTMLElement;
      const mainContent = document.querySelector('.main-content-wrapper') as HTMLElement;
      
      if (sidebar && sidebar.style.display === 'none') {
        sidebar.style.display = '';
      }
      
      if (mainContent && mainContent.className === 'print-layout') {
        mainContent.className = 'flex-1 pl-72 main-content-wrapper';
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const handleBackToDashboard = () => {
    router.push('/dashboard/writing-protocol');
  };
  
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen bg-base-200 p-4 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Protocol not found</h2>
        <p className="mb-6">{error || "The requested writing protocol could not be found."}</p>
        <button 
          onClick={handleBackToDashboard}
          className="btn btn-primary"
        >
          <FaHome className="mr-2" /> Back to Protocols
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 print:bg-white flex">
      {/* Permanent Sidebar Navigation */}
      <div className="print:hidden w-72 bg-base-200 min-h-screen overflow-y-auto fixed left-0 top-0 p-6 border-r border-base-300 sidebar-navigation">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleBackToDashboard}
            className="btn btn-ghost btn-sm"
          >
            <FaArrowLeft size={12} />
          </button>
          <h3 className="text-lg font-bold">Table of Contents</h3>
        </div>
        <nav className="space-y-1">
          {sections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => {
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  setActiveSection(section.id);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeSection === section.id 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-base-content/70 hover:bg-base-300'
                } rounded-lg transition-colors`}
              >
                <div className="flex items-center">
                  <span className="flex-1">{section.title}</span>
                  {section.subsections && (
                    <FaChevronRight 
                      size={12} 
                      className={`transform transition-transform ${
                        activeSection === section.id ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </div>
              </button>
              
              {section.subsections && activeSection === section.id && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => {
                        document.getElementById(subsection.id)?.scrollIntoView({ behavior: 'smooth' });
                        setActiveSubsection(subsection.id);
                      }}
                      className={`block w-full text-left px-4 py-1.5 text-sm ${
                        activeSubsection === subsection.id 
                          ? 'text-primary font-medium' 
                          : 'text-base-content/60 hover:text-base-content'
                      } rounded-lg transition-colors`}
                                       >
                      {subsection.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 pl-72 main-content-wrapper">
        {/* Header with actions - hide on print */}
        <div className="bg-base-100 border-b border-base-200 sticky top-0 z-10 print:hidden">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-end gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm gap-2"
            >
              <FaPrint size={12} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn btn-primary btn-sm gap-2"
            >
              {isGeneratingPDF ? (
                <><FaSpinner className="animate-spin" size={12} /> Generating...</>
              ) : (
                <><FaDownload size={12} /> Download PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div id="protocol-content" className="max-w-4xl mx-auto px-8 py-8">
          {/* Document header */}
          <div className="mb-12 protocol-header">
            <h1 className="text-4xl font-bold text-center mb-6">{protocol?.title}</h1>
            <div className="flex flex-col items-center gap-2 text-base-content/70">
              <p>Role: {protocol?.userRole}</p>
              <p>Industry: {protocol?.industry}</p>
              <p>Last updated: {protocol ? new Date(protocol.updatedAt).toLocaleDateString() : ''}</p>
            </div>
          </div>

          {/* Document content */}
          <div className="space-y-16">
            {sections.map((section) => {
              if (section.id === 'creation') {
                return <div key={section.id} className="content-section" id={section.id}><ContentCreationSystem /></div>;
              }
              
              if (section.id === 'calendar') {
                return (
                  <div key={section.id} id={section.id} className="prose prose-lg max-w-none content-section">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-bold mt-12 mb-0 scroll-mt-20">4. The 1-Week Content Calendar</h2>
                      
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-sm btn-outline gap-2 mt-12">
                          <FaCalendarPlus size={14} /> Add to Calendar
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                          <li><a onClick={() => generateCalendarLink('google')} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#4285F4"><path d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 5v9h14v-9H5zm0-2h14V7H5v1zm2 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>
                            Google Calendar
                          </a></li>
                          <li><a onClick={() => generateCalendarLink('apple')} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#000000"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-1 5v5h5v2h-7V7h2z"/></svg>
                            Apple Calendar
                          </a></li>
                          <li><a onClick={() => generateCalendarLink('outlook')} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0078D4"><path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08v15.84q0 .36-.25.6-.25.26-.58.26H2.85q-.36 0-.6-.25-.26-.25-.26-.6V4.08q0-.34.26-.58.24-.25.59-.25h18.32M21.17 7.5L12 13.42 2.85 7.5V6.25l9.15 5.92L21.17 6.25v1.25m0 3.33v10.59H2.85V10.83l9.15 5.92z"/></svg>
                            Outlook
                          </a></li>
                          <li><a onClick={() => generateCalendarLink('ical')} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#5D5D5D"><path d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5v-5z"/></svg>
                            Download .ics File
                          </a></li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Calendar component with AI-generated data */}
                    <div className="card bg-base-100 shadow-lg rounded-xl border border-base-300">
                      <div className="card-body p-0">
                        {/* Calendar Header */}
                        <div className="grid grid-cols-7 text-center font-semibold bg-base-200 rounded-t-xl">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="py-3 px-2 first:rounded-tl-xl last:rounded-tr-xl">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid with AI-generated data - Fixed border and centering issues */}
                        <div className="grid grid-cols-7 border-t -mt-2 border-base-300">
                          {Object.entries(protocol.aiGeneratedContent.contentCalendar?.days || {
                            monday: [],
                            tuesday: [],
                            wednesday: [],
                            thursday: [],
                            friday: [],
                            saturday: [],
                            sunday: []
                          }).map(([day, content], index) => (
                            <div 
                              key={day} 
                              className={`p-4 min-h-[180px] hover:bg-base-100/50 transition-colors border-r border-base-300 ${
                                index < 7 ? '' : 'border-t'
                              } ${
                                index === 6 ? 'border-r-0' : ''
                              }`}
                            >
                              <div className="flex flex-col justify-center items-center h-full">
                                {Array.isArray(content) && content.length > 0 ? (
                                  <div className={`flex flex-col ${content.length > 1 ? 'gap-4 justify-around' : 'justify-center'} items-center w-full h-full`}>
                                    {content.map((item, index) => (
                                      <div key={index} className="flex flex-col items-center justify-center">
                                        <span className="text-2xl mb-2" role="img" aria-label={item.type}>
                                          {getContentIcon(item.type)}
                                        </span>
                                        <span className="text-xs text-center font-medium">
                                          {item.type.length > 8 
                                            ? item.type.charAt(0).toUpperCase() + item.type.slice(1, 7) + '...' 
                                            : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex justify-center items-center h-full text-base-content/30">
                                    <span className="text-2xl">—</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Calendar legend */}
                    <div className="mt-6 flex flex-wrap gap-6 justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="article">✍️</span>
                        <span>Article</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="newsletter">📩</span>
                        <span>Newsletter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="thread">🧵</span>
                        <span>Thread</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="short-form">📱</span>
                        <span>Short-form</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="video">🎥</span>
                        <span>Video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="story">📖</span>
                        <span>Story</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label="podcast">🎙️</span>
                        <span>Podcast</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Only render sections that have content
              if (sectionsWithContent[section.id]) {
                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="prose prose-lg max-w-none content-section"
                  >
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-4xl font-bold mt-16 mb-8 scroll-mt-20" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-12 mb-6 scroll-mt-20" {...props} />,
                        h3: ({node, children, ...props}) => {
                          const id = children?.toString()
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-');
                          return (
                            <h3 
                              id={id} 
                              className="text-2xl font-semibold mt-8 mb-4 scroll-mt-20" 
                              {...props}
                            >
                              {children}
                            </h3>
                          );
                        },
                        h4: ({node, ...props}) => <h4 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="pl-2" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-6">
                            <table className="table table-zebra w-full" {...props} />
                          </div>
                        ),
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic my-6" {...props} />
                        ),
                        code: ({node, ...props}: {node?: any; className?: string; children?: React.ReactNode}) => {
                          const isInline = !props.className?.includes('language-');
                          return isInline ? (
                            <code className="px-1 py-0.5 bg-base-200 h-fit rounded text-sm" {...props} />
                          ) : (
                            <pre className="p-4 bg-base-200 rounded-lg overflow-x-auto">
                              <code className="text-sm" {...props} />
                            </pre>
                          );
                        },
                        div: ({node, className, ...props}) => {
                          // Handle grid-based calendar layout
                          if (className?.includes('grid')) {
                            return (
                              <div className={`${className} my-6 shadow-sm print:shadow-none`} {...props} />
                            );
                          }
                          return <div {...props} />;
                        }
                      }}
                    >
                      {sectionsWithContent[section.id]}
                    </ReactMarkdown>
                  </div>
                );
              }
              
              // Return an empty div for sections without content to maintain the id for navigation
              return <div key={section.id} id={section.id} className="content-section"></div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for calendar icons
const getContentIcon = (type: string): string => {
  const contentTypeIcons: Record<string, string> = {
    newsletter: '📩',
    article: '✍️',
    tweet: '🐦',
    'short-form': '📱',
    thread: '🧵',
    video: '🎥',
    story: '📖',
    carousel: '🔄',
    infographic: '📊',
    poll: '📊',
    livestream: '📡',
    podcast: '🎙️',
    reel: '🎬',
    challenge: '🏆'
  };
  
  return contentTypeIcons[type.toLowerCase()] || '📄';
};