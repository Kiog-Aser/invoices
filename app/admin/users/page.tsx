"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  plan: string;
  customerId: string;
  protocolCount: number;
  tokens: number;
  isUnlimited: boolean;
  lastGenerated: string | null;
  createdAt: string;
  isAdmin: boolean;
}


export default function UsersAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load users');
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchUsers();
    }
  }, [session]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Users Dashboard</h1>
          <Link href="/admin" className="btn btn-outline">Back to Admin</Link>
        </div>
        
        <div className="form-control w-full max-w-md mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="input input-bordered w-full pr-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full table-zebra">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Protocols</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    {searchTerm ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary">
                                  {user.name?.[0] || user.email?.[0] || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-70">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.plan === 'pro' ? 'badge-primary' : 'badge-ghost'}`}>
                        {user.plan === 'pro' ? 'PRO' : 'Free'}
                      </span>
                      {user.isAdmin && (
                        <span className="badge badge-secondary ml-2">Admin</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col">
                      Generated: <span>{user.protocolCount}</span>
                        {!user.isUnlimited && (
                          <span className="text-sm opacity-70">Tokens: {user.tokens}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {user.isUnlimited ? (
                        <span className="badge badge-success">Unlimited</span>
                      ) : user.tokens > 0 ? (
                        <span className="badge badge-info">Has Tokens</span>
                      ) : (
                        <span className="badge badge-ghost">No Tokens</span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link 
                          href={`/admin/users/${user.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          User Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}