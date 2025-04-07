"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Protocol {
  _id: string;
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  goals: string[];
  challenges: string[];
  status: 'processing' | 'completed' | 'failed';
  statusMessage?: string;
  modelType?: 'fast' | 'quality';
  createdAt: string;
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
      };
      formats: {
        shortForm: string[];
        threads: {
          hook: string;
          body: string[];
          cta: string;
        };
      };
    };
    contentCalendar: {
      days: {
        monday: Array<{ type: string; title: string; icon?: string }>;
        tuesday: Array<{ type: string; title: string; icon?: string }>;
        wednesday: Array<{ type: string; title: string; icon?: string }>;
        thursday: Array<{ type: string; title: string; icon?: string }>;
        friday: Array<{ type: string; title: string; icon?: string }>;
        saturday: Array<{ type: string; title: string; icon?: string }>;
        sunday: Array<{ type: string; title: string; icon?: string }>;
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
      conversion: {
        goal: string;
        strategies: string[];
        offers: string[];
        callToAction: string;
      };
    };
  };
}

export default function AdminProtocolPage({ params }: { params: { userId: string; protocolId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const fetchProtocol = async () => {
      try {
        const response = await fetch(`/api/writing-protocol/${params.protocolId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch protocol');
        }
        const data = await response.json();
        setProtocol(data);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load protocol');
        toast.error('Failed to load protocol');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchProtocol();
    }
  }, [session, params.protocolId]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!protocol) {
    return null;
  }

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "nicheAuthority", label: "Niche Authority" },
    { id: "contentPillars", label: "Content Pillars" },
    { id: "repurposeSystem", label: "Repurpose System" },
    { id: "contentCalendar", label: "Content Calendar" },
    { id: "conversionFunnel", label: "Conversion Funnel" }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{protocol.title}</h1>
              <div className="breadcrumbs text-sm">
                <ul>
                  <li><Link href="/admin">Admin</Link></li>
                  <li><Link href="/admin/users">Users</Link></li>
                  <li><Link href={`/admin/users/${params.userId}`}>User Details</Link></li>
                  <li>Protocol</li>
                </ul>
              </div>
            </div>
            <Link
              href={`/admin/users/${params.userId}`}
              className="btn btn-outline"
            >
              Back to User
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Role</div>
              <div className="stat-value text-lg">{protocol.userRole}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Industry</div>
              <div className="stat-value truncate text-lg">{protocol.industry}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Created</div>
              <div className="stat-value text-lg">
                {new Date(protocol.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="tabs tabs-boxed">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`tab ${activeSection === section.id ? 'tab-active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-base-200 rounded-lg p-6">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Content Types</h3>
                <div className="flex flex-wrap gap-2">
                  {protocol.contentTypes.map((type, index) => (
                    <span key={index} className="badge badge-primary">{type}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Goals</h3>
                <ul className="list-disc list-inside space-y-1">
                  {protocol.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Challenges</h3>
                <ul className="list-disc list-inside space-y-1">
                  {protocol.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSection === "nicheAuthority" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Full Niche Definition</h3>
                <p className="text-base-content/80">{protocol.aiGeneratedContent.nicheAuthority.fullNiche}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Core Message</h3>
                <p className="text-base-content/80">{protocol.aiGeneratedContent.nicheAuthority.coreMessage}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Unique Mechanism</h3>
                <p className="text-base-content/80">{protocol.aiGeneratedContent.nicheAuthority.uniqueMechanism}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Target Audience</h3>
                <ul className="list-disc list-inside space-y-1">
                  {protocol.aiGeneratedContent.nicheAuthority.targetAudience.map((audience, index) => (
                    <li key={index}>{audience}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeSection === "contentPillars" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Expertise</h3>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h4 className="card-title text-primary">{protocol.aiGeneratedContent.contentPillars.expertise.title}</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {protocol.aiGeneratedContent.contentPillars.expertise.contentIdeas.map((idea, index) => (
                        <li key={index}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Journey</h3>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h4 className="card-title text-primary">{protocol.aiGeneratedContent.contentPillars.personalJourney.title}</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {protocol.aiGeneratedContent.contentPillars.personalJourney.contentIdeas.map((idea, index) => (
                        <li key={index}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Proof</h3>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <h4 className="card-title text-primary">{protocol.aiGeneratedContent.contentPillars.clientProof.title}</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {protocol.aiGeneratedContent.contentPillars.clientProof.contentIdeas.map((idea, index) => (
                        <li key={index}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "repurposeSystem" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Thought Leadership Article</h3>
                <div className="card bg-base-100">
                  <div className="card-body space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Headline</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.repurposeSystem.thoughtLeadershipArticle.headline}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Hook</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.repurposeSystem.thoughtLeadershipArticle.hook}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Storytelling</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.repurposeSystem.thoughtLeadershipArticle.storytelling}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Value Points</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.aiGeneratedContent.repurposeSystem.thoughtLeadershipArticle.valuePoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Call to Action</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.repurposeSystem.thoughtLeadershipArticle.cta}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Short-Form Content</h3>
                <div className="card bg-base-100">
                  <div className="card-body">
                    <ul className="list-disc list-inside space-y-2">
                      {protocol.aiGeneratedContent.repurposeSystem.formats.shortForm.map((content, index) => (
                        <li key={index}>{content}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Thread Format</h3>
                <div className="card bg-base-100">
                  <div className="card-body space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Hook</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.repurposeSystem.formats.threads.hook}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Thread Body</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.aiGeneratedContent.repurposeSystem.formats.threads.body.map((content, index) => (
                          <li key={index}>{content}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Call to Action</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.repurposeSystem.formats.threads.cta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "contentCalendar" && (
            <div className="space-y-6">
              {Object.entries(protocol.aiGeneratedContent.contentCalendar.days).map(([day, items]) => (
                <div key={day}>
                  <h3 className="text-lg font-semibold capitalize mb-3">{day}</h3>
                  {items.length > 0 ? (
                    <div className="grid gap-3">
                      {items.map((item, index) => (
                        <div key={index} className="card bg-base-100">
                          <div className="card-body p-4">
                            <div className="flex items-start gap-3">
                              {item.icon && (
                                <span className="text-xl">{item.icon}</span>
                              )}
                              <div>
                                <span className="font-medium capitalize">{item.type}</span>
                                <p className="text-base-content/80">{item.title}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base-content/60">No content scheduled</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === "conversionFunnel" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Awareness Stage</h3>
                <div className="card bg-base-100">
                  <div className="card-body space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Goal</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.conversionFunnel.awareness.goal}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Content Strategy</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.aiGeneratedContent.conversionFunnel.awareness.contentStrategy.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Lead Magnet</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.conversionFunnel.awareness.leadMagnet}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Outreach Strategy</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.conversionFunnel.awareness.outreach}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Active Followers Stage</h3>
                <div className="card bg-base-100">
                  <div className="card-body space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Goal</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.conversionFunnel.activeFollowers.goal}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Strategies</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.aiGeneratedContent.conversionFunnel.activeFollowers.strategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Conversion Stage</h3>
                <div className="card bg-base-100">
                  <div className="card-body space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Goal</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.conversionFunnel.conversion.goal}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Strategies</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.aiGeneratedContent.conversionFunnel.conversion.strategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Offers</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.aiGeneratedContent.conversionFunnel.conversion.offers.map((offer, index) => (
                          <li key={index}>{offer}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Call to Action</h4>
                      <p className="text-base-content/80">{protocol.aiGeneratedContent.conversionFunnel.conversion.callToAction}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}