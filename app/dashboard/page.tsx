'use client';

import { useState, useEffect } from 'react';
import ButtonAccount from '@/components/ButtonAccount';
import config from '@/config';

interface Project {
  id: string;
  name: string;
  customName?: string;
  stripeAccountName?: string;
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
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

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

  const handleEditProject = async (projectId: string) => {
    if (!editName.trim()) {
      alert('Please enter a valid name');
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, customName: editName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(projects.map(p => p.id === projectId ? data.project : p));
        setEditingProject(null);
        setEditName('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update project name');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project name');
    }
  };

  const startEditing = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.customName || project.name);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditName('');
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ButtonAccount />
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            Feedback
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Container that takes 70% of page width */}
        <div className="w-[70%] mx-auto">
          <div className="flex gap-8">
            
            {/* Left Timeline Section - 50% of the 70% container */}
            <div className="flex-1">
              
              {/* Step 1 */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-700">1</span>
                </div>
                <div className="flex-1">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer asks</h3>
                    <p className="text-gray-600 italic">"Can I get an invoice?"</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-700">2</span>
                </div>
                <div className="flex-1">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">You reply with the link</h3>
                    <button 
                      onClick={() => projects.length > 0 && copyToClipboard(getFullUrl(projects[0].publicUrl, projects[0].slug))}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
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
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-700">3</span>
                </div>
                <div className="flex-1">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer finds, edits & downloads invoices from these accounts</h3>
                    
                    {projects.length > 0 ? (
                      <div className="space-y-3">
                        {projects.map((project) => (
                          <div key={project.id} className="bg-white border border-gray-200 rounded-lg">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-green-700">
                                    {project.customName ? project.customName[0].toUpperCase() : 'P'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    {project.stripeAccountName && project.stripeAccountName !== project.name && (
                                      <span className="text-blue-600">Stripe: {project.stripeAccountName} • </span>
                                    )}
                                    {project.totalSearches} searches • Created {new Date(project.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <svg 
                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {expandedProject === project.id && (
                              <div className="px-4 pb-4 border-t border-gray-100">
                                <div className="pt-4 space-y-4">
                                  {/* Project Name Editing */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Project Name:
                                    </label>
                                    {editingProject === project.id ? (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={editName}
                                          onChange={(e) => setEditName(e.target.value)}
                                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Enter project name"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleEditProject(project.id);
                                            if (e.key === 'Escape') cancelEditing();
                                          }}
                                        />
                                        <button
                                          onClick={() => handleEditProject(project.id)}
                                          className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md border border-green-300 transition-colors"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={cancelEditing}
                                          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2 items-center">
                                        <span className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50">
                                          {project.name}
                                        </span>
                                        <button
                                          onClick={() => startEditing(project)}
                                          className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md border border-blue-300 transition-colors"
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Customer Access Link */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Customer Access Link:
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={getFullUrl(project.publicUrl, project.slug)}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                      />
                                      <button
                                        onClick={() => copyToClipboard(getFullUrl(project.publicUrl, project.slug))}
                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
                                      >
                                        Copy
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md border border-red-300 transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Share this link with customers so they can find their invoices
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>No accounts connected yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - 50% of the 70% container */}
            <div className="flex-1">
              <div className="bg-red-100 border border-red-200 rounded-lg p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Add Stripe account</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Your customers will be able to search, edit & download invoices under this account.
                </p>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Enter a custom name for your project (optional)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">2.</span>
                    <div>
                      Generate a{' '}
                      <a
                        href="https://dashboard.stripe.com/apikeys/create?name=Invoices&permissions[]=rak_invoice_read&permissions[]=rak_charge_read&permissions[]=rak_customer_read&permissions[]=rak_payment_intent_read&permissions[]=rak_product_read&permissions[]=rak_price_read"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-semibold"
                      >
                        restricted API key
                      </a>
                      {' '}with these permissions:
                    </div>
                  </div>
                  <div className="ml-8 space-y-1 text-xs text-gray-600">
                    <div>• <strong>Required:</strong> Invoices (Read), Charges (Read), Customers (Read)</div>
                    <div>• <strong>Optional:</strong> Payment Intents (Read), Subscriptions (Read)</div>
                    <div>• <strong>Connect:</strong> Enable entire Connect section as READ</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Click [Create Key] at the bottom right of the Stripe page</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">4.</span>
                    <span>Copy and paste the new API key below</span>
                  </div>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Project name (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="rk_live_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stripeApiKey}
                    onChange={(e) => setStripeApiKey(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium disabled:bg-gray-400"
                    disabled={creating || !stripeApiKey}
                  >
                    {creating ? 'Adding...' : 'Add Stripe Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
