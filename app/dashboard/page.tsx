'use client';

import { useState, useEffect } from 'react';
import ButtonAccount from '@/components/ButtonAccount';
import config from '@/config';

interface CompanyInfo {
  name?: string;
  website?: string;
  logoUrl?: string;
  favicon?: string;
  primaryColor?: string;
  email?: string;
  country?: string;
  lastUpdated?: string;
}

interface Project {
  id: string;
  name: string;
  customName?: string;
  stripeAccountName?: string;
  companyInfo?: CompanyInfo;
  slug: string;
  description?: string;
  publicUrl?: string;
  createdAt: string;
  totalSearches: number;
  lastUsed?: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeApiKey, setStripeApiKey] = useState('');
  const [customName, setCustomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [updatingCompanyInfo, setUpdatingCompanyInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stripeApiKey, customName: customName.trim() || undefined }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects([data.project, ...projects]);
        setStripeApiKey('');
        setCustomName('');
        
        // Automatically fetch company info for new project
        updateCompanyInfo(data.project.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const updateCompanyInfo = async (projectId: string) => {
    setUpdatingCompanyInfo(projectId);
    try {
      const response = await fetch(`/api/projects/${projectId}/company-info`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => p.id === projectId ? data.project : p));
      }
    } catch (error) {
      console.error('Error updating company info:', error);
    } finally {
      setUpdatingCompanyInfo(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getFullUrl = (publicUrl: string | undefined, slug?: string) => {
    const domain = process.env.NODE_ENV === 'development' 
      ? window.location.origin 
      : `https://${config.domainName}`;
    const url = publicUrl || `/invoice/${slug || 'unknown'}`;
    return `${domain}${url}`;
  };

  const getProjectLogo = (project: Project) => {
    if (project.companyInfo?.logoUrl) {
      return project.companyInfo.logoUrl;
    }
    if (project.companyInfo?.favicon) {
      return project.companyInfo.favicon;
    }
    return null;
  };

  const getProjectDisplayName = (project: Project) => {
    return project.customName || project.companyInfo?.name || project.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <ButtonAccount />
          <button className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-md hover:bg-gray-100">
            Feedback
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-0">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">1</span>
                </div>
                <div className="w-px h-12 bg-gray-300 mt-2"></div>
              </div>
              <div className="flex-1 pb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer asks</h3>
                  <p className="text-gray-600 italic">"Can I get an invoice?"</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">2</span>
                </div>
                <div className="w-px h-12 bg-gray-300 mt-2"></div>
              </div>
              <div className="flex-1 pb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">You reply with the link</h3>
                  <button 
                    onClick={() => projects.length > 0 && copyToClipboard(getFullUrl(projects[0].publicUrl, projects[0].slug))}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">3</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer finds, edits & downloads invoices from these accounts</h3>
                  
                  {projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {getProjectLogo(project) ? (
                                  <img 
                                    src={getProjectLogo(project)!} 
                                    alt={`${getProjectDisplayName(project)} logo`}
                                    className="w-10 h-10 rounded-lg object-cover"
                                    onError={(e) => {
                                      // Fallback to initials if logo fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling!.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center ${getProjectLogo(project) ? 'hidden' : ''}`}>
                                  <span className="text-sm font-bold text-gray-600">
                                    {getProjectDisplayName(project)[0]?.toUpperCase() || 'P'}
                                  </span>
                                </div>
                                {updatingCompanyInfo === project.id && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{getProjectDisplayName(project)}</h4>
                                <p className="text-sm text-gray-500">
                                  {project.totalSearches} searches • Created {new Date(project.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCompanyInfo(project.id)}
                                disabled={updatingCompanyInfo === project.id}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                title="Refresh company info"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button
                                onClick={() => copyToClipboard(getFullUrl(project.publicUrl, project.slug))}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Copy link"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-1 text-red-400 hover:text-red-600"
                                title="Delete project"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p>No Stripe accounts connected yet</p>
                      <p className="text-sm mt-1">Add your first account to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Add Account Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Add Stripe account</h2>
              <p className="text-gray-600 text-sm mb-6">
                Your customers will be able to search, edit & download invoices under this account.
              </p>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-gray-700">1.</span>
                  <span>Enter a custom name for your project (optional)</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-gray-700">2.</span>
                  <div>
                    Generate a{' '}
                    <a
                      href="https://dashboard.stripe.com/apikeys/create?name=Invoices&permissions[]=rak_invoice_read&permissions[]=rak_charge_read&permissions[]=rak_customer_read&permissions[]=rak_payment_intent_read&permissions[]=rak_account_read"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      restricted API key
                    </a>
                    {' '}with these permissions:
                  </div>
                </div>
                <div className="ml-8 space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div>• <strong>Required:</strong> Invoices (Read), Charges (Read), Customers (Read)</div>
                  <div>• <strong>Optional:</strong> Payment Intents (Read), Subscriptions (Read)</div>
                  <div>• <strong>Connect:</strong> Enable entire Connect section as READ</div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-gray-700">3.</span>
                  <span>Click [Create Key] at the bottom right of the Stripe page</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-gray-700">4.</span>
                  <span>Copy and paste the new API key below</span>
                </div>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <input
                  type="text"
                  placeholder="Project name (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="rk_live_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={stripeApiKey}
                  onChange={(e) => setStripeApiKey(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={creating || !stripeApiKey}
                >
                  {creating ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </span>
                  ) : (
                    'Add Stripe Account'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
