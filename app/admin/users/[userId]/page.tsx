"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Protocol {
  id: string;
  title: string;
  createdAt: string;
  modelType: string;
  contentTypes: string[];
  goals: string[];
  industry: string;
  content: string;
}

interface UserDetail {
  id: string;
  email: string;
  name: string;
  plan: string;
  protocolCount: number;
  tokens: number;
  isUnlimited: boolean;
  lastGenerated: string | null;
}

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.userId}/protocols`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch user data');
        }
        const data = await response.json();
        setUser(data.user);
        setProtocols(data.protocols);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user data');
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchUserData();
    }
  }, [session, params.userId]);

  if (status === "loading" || (session?.user?.isAdmin && isLoading)) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    router.push('/dashboard');
    return null;
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

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <div className="breadcrumbs text-sm mt-2">
              <ul>
                <li><Link href="/admin">Admin</Link></li>
                <li><Link href="/admin/users">Users</Link></li>
                <li>{user?.name || 'User'}</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users" className="btn btn-outline">Back to Users</Link>
            {protocols.length > 0 && (
              <Link 
                href={`/admin/users/${params.userId}/protocols`}
                className="btn btn-primary"
              >
                View All Protocols
              </Link>
            )}
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Section */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">User Profile</h2>
                <div className="flex flex-col items-center mb-6">
                  <div className="avatar mb-4">
                    <div className="w-24 h-24 rounded-full">
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-primary">
                          {user.name?.[0] || user.email?.[0] || '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{user.name}</h3>
                  <p className="text-sm opacity-70">{user.email}</p>
                </div>
                
                <div className="divider"></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Plan:</span>
                    <span className={`badge ${user.plan === 'pro' ? 'badge-primary' : 'badge-ghost'}`}>
                      {user.plan === 'pro' ? 'PRO' : 'Free'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Protocols Generated:</span>
                    <span>{user.protocolCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Available Tokens:</span>
                    {user.isUnlimited ? (
                      <span className="badge badge-success">Unlimited</span>
                    ) : (
                      <span>{user.tokens}</span>
                    )}
                  </div>
                  
                  {user.lastGenerated && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Last Generated:</span>
                      <span>{new Date(user.lastGenerated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Protocols List */}
            <div className="lg:col-span-2">
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title text-xl">User Protocols</h2>
                    {protocols.length > 0 && (
                      <Link 
                        href={`/admin/users/${params.userId}/protocols`}
                        className="btn btn-sm btn-outline"
                      >
                        View All
                      </Link>
                    )}
                  </div>
                  
                  {protocols.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-base-content/70">No protocols found for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {protocols.slice(0, 5).map((protocol) => (
                        <Link 
                          key={protocol.id} 
                          href={`/admin/users/${params.userId}/protocols/${protocol.id}`}
                          className="card bg-base-100 cursor-pointer hover:bg-base-100/80 transition-colors"
                        >
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold">{protocol.title}</h3>
                                <p className="text-sm opacity-70">
                                  Created on {new Date(protocol.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="badge badge-outline">{protocol.modelType}</span>
                                  <span className="badge badge-outline">
                                    <span className="max-w-[120px] truncate inline-block">{protocol.industry}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-primary text-sm underline">View Details</div>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {protocols.length > 5 && (
                        <div className="text-center pt-2">
                          <Link 
                            href={`/admin/users/${params.userId}/protocols`}
                            className="btn btn-outline btn-sm"
                          >
                            View All {protocols.length} Protocols
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}