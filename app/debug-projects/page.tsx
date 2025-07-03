'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Project {
  id: string;
  name: string;
  slug: string;
  stripeAccountName?: string;
}

interface DebugData {
  project: {
    name: string;
    slug: string;
    stripeAccountName?: string;
  };
  account?: {
    id: string;
    country: string;
    email: string;
    business_profile: {
      exists: boolean;
      name: string | null;
      support_email: string | null;
      support_phone: string | null;
      support_address: any;
    };
    settings: {
      exists: boolean;
      dashboard_display_name: string | null;
    };
  };
  extractedBusinessData?: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  recommendations: string[];
  permissions: {
    accountRead: boolean;
    chargesRead: boolean;
    customersRead: boolean;
  };
}

export default function DebugProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const debugProject = async (project: Project) => {
    setLoading(true);
    setError('');
    setSelectedProject(project);
    
    try {
      const response = await fetch(`/api/invoice/${project.slug}/debug-account`);
      const data = await response.json();
      
      if (response.ok) {
        setDebugData(data);
      } else {
        setError(data.error || 'Failed to debug project');
      }
    } catch (error) {
      setError('Network error while debugging project');
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Please sign in</h1>
          <p className="text-gray-600 mt-2">You need to be signed in to debug projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Debug Business Details</h1>
          <p className="text-gray-600 mt-2">
            Debug what business information is available for each of your Stripe accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === project.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => debugProject(project)}
                >
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">Slug: {project.slug}</p>
                  {project.stripeAccountName && (
                    <p className="text-sm text-gray-600">Account: {project.stripeAccountName}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Debug Results */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Results</h2>
            
            {loading && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Debugging project...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {debugData && !loading && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {debugData.project.name}
                  </h3>

                  {/* Permissions Status */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">API Permissions</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          debugData.permissions.accountRead ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        Account Read: {debugData.permissions.accountRead ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          debugData.permissions.chargesRead ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        Charges Read: {debugData.permissions.chargesRead ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          debugData.permissions.customersRead ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        Customers Read: {debugData.permissions.customersRead ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Business Data */}
                  {debugData.extractedBusinessData && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Extracted Business Data</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {debugData.extractedBusinessData.name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {debugData.extractedBusinessData.email || 'Not Available'}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span> {debugData.extractedBusinessData.address || 'Not Available'}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {debugData.extractedBusinessData.phone || 'Not Available'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Details */}
                  {debugData.account && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Stripe Account Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Account ID:</span> {debugData.account.id}
                        </div>
                        <div>
                          <span className="font-medium">Country:</span> {debugData.account.country}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {debugData.account.email || 'Not Available'}
                        </div>
                        
                        <div className="pt-2 border-t border-gray-200">
                          <div className="font-medium mb-1">Business Profile:</div>
                          <div className="pl-2 space-y-1">
                            <div>Exists: {debugData.account.business_profile.exists ? 'Yes' : 'No'}</div>
                            {debugData.account.business_profile.exists && (
                              <>
                                <div>Name: {debugData.account.business_profile.name || 'Not set'}</div>
                                <div>Email: {debugData.account.business_profile.support_email || 'Not set'}</div>
                                <div>Phone: {debugData.account.business_profile.support_phone || 'Not set'}</div>
                                <div>
                                  Address: {debugData.account.business_profile.support_address 
                                    ? 'Configured' 
                                    : 'Not set'}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <div className="font-medium mb-1">Settings:</div>
                          <div className="pl-2 space-y-1">
                            <div>Dashboard Name: {debugData.account.settings.dashboard_display_name || 'Not set'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {debugData.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {debugData.recommendations.map((rec, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start">
                              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <p className="text-yellow-800 text-sm">{rec}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedProject && !loading && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                Select a project from the left to see its debug information
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 