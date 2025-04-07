"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaSpinner, FaEye, FaCalendarAlt, FaClipboardList } from "react-icons/fa";

interface Protocol {
  id: string;
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function UserProtocolsPage({ params }: { params: { userId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProtocols = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure userId is valid
        if (!params.userId) {
          throw new Error('Invalid user ID');
        }
        
        const response = await fetch(`/api/admin/users/${params.userId}/protocols`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email
        });
        setProtocols(data.protocols);
        
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load user protocols');
        toast.error('Failed to load user protocols');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchUserProtocols();
    }
  }, [session, params.userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          <div className="mt-4 flex justify-center">
            <Link 
              href="/admin/users"
              className="btn btn-outline"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link href={`/admin/users/${params.userId}`} className="btn btn-ghost gap-1 mb-4">
            <FaArrowLeft size={14} />
            <span>Back to User</span>
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Protocols for {user?.name}
              </h1>
              <p className="text-base-content/70">{user?.email}</p>
            </div>
            <Link 
              href={`/admin/users/${params.userId}`}
              className="btn btn-outline btn-sm"
            >
              View User Details
            </Link>
          </div>

          <div className="breadcrumbs text-sm mb-6">
            <ul>
              <li><Link href="/admin">Admin</Link></li>
              <li><Link href="/admin/users">Users</Link></li>
              <li><Link href={`/admin/users/${params.userId}`}>{user?.name || 'User'}</Link></li>
              <li>Protocols</li>
            </ul>
          </div>

          {protocols.length === 0 ? (
            <div className="bg-base-200 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <FaClipboardList className="text-base-content/50" size={48} />
                <h3 className="text-xl font-semibold mt-2">No Protocols Found</h3>
                <p className="text-base-content/70 max-w-md mx-auto">
                  This user hasn't created any writing protocols yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {protocols.map((protocol) => (
                <div 
                  key={protocol.id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300"
                >
                  <div className="card-body">
                    <h2 className="card-title text-lg font-bold">{protocol.title}</h2>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-base-content/70 w-24 text-sm">Role:</span> 
                        <span className="text-sm truncate flex-1">{protocol.userRole}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-base-content/70 w-24 text-sm">Industry:</span> 
                        <span className="text-sm truncate flex-1">{protocol.industry}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-base-content/70 w-24 text-sm">Created:</span> 
                        <span className="text-sm flex-1">{formatDate(protocol.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {protocol.contentTypes?.slice(0, 3).map((type, index) => (
                        <span key={index} className="badge badge-outline">{type}</span>
                      ))}
                      {protocol.contentTypes?.length > 3 && (
                        <span className="badge badge-outline">+{protocol.contentTypes.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                      <Link 
                        href={`/admin/users/${params.userId}/protocols/${protocol.id}`}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <FaEye size={14} />
                        View Protocol
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}