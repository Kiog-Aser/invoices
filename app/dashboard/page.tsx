'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaPlus, FaTrash, FaEdit, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ButtonAccount from '@/components/ButtonAccount';

interface WritingProtocol {
  id: string;  // Changed from _id to id to match toJSON plugin's transformation
  title: string;
  userRole: string;
  industry: string;
  createdAt: string;
}

export default function WritingProtocolsPage() {
  const router = useRouter();
  const [protocols, setProtocols] = useState<WritingProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Fetch user's writing protocols
  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const response = await fetch('/api/writing-protocol', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch protocols');
        }

        const data = await response.json();
        setProtocols(data);
      } catch (error) {
        console.error('Error fetching protocols:', error);
        toast.error('Failed to load your writing protocols');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocols();
  }, []);

  const handleCreateNew = () => {
    router.push('/dashboard/create');
  };

  const handleView = (id: string) => {
    if (!id) {
      console.error("Invalid protocol ID for view:", id);
      toast.error("Cannot view protocol: Invalid ID");
      return;
    }
    router.push(`/dashboard/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("Invalid protocol ID for deletion:", id);
      toast.error("Cannot delete protocol: Invalid ID");
      return;
    }
    
    if (confirm('Are you sure you want to delete this writing protocol?')) {
      setIsDeleting(prev => ({ ...prev, [id]: true }));
      
      try {
        console.log("Deleting protocol with ID:", id);
        const response = await fetch(`/api/writing-protocol/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Delete error response:', errorData);
          throw new Error(errorData.error || 'Failed to delete protocol');
        }

        // Remove the deleted protocol from the list
        setProtocols(protocols.filter(protocol => protocol.id !== id));
        toast.success('Writing protocol deleted successfully');
      } catch (error) {
        console.error('Error deleting protocol:', error);
        toast.error('Failed to delete writing protocol');
      } finally {
        setIsDeleting(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      
      <div className="flex justify-between items-center mb-8">
      <ButtonAccount />
        <h1 className="text-2xl font-bold">Your Writing Protocols</h1>
        <button 
          onClick={handleCreateNew}
          className="btn btn-primary"
        >
          <FaPlus className="mr-2" /> Create New Protocol
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-2xl text-primary" />
        </div>
      ) : protocols.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No writing protocols yet</h2>
          <p className="text-base-content/70 mb-6">
            Create your first personalized writing protocol to improve your writing process.
          </p>
          <button 
            onClick={handleCreateNew}
            className="btn btn-primary"
          >
            <FaPlus className="mr-2" /> Create Your First Protocol
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Role</th>
                <th>Industry</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((protocol) => (
                <tr key={protocol.id} className="hover">
                  <td className="font-medium">{protocol.title}</td>
                  <td>{protocol.userRole}</td>
                  <td>{protocol.industry}</td>
                  <td>{formatDate(protocol.createdAt)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView(protocol.id)}
                        className="btn btn-sm btn-outline"
                      >
                        View <FaArrowRight className="ml-1" />
                      </button>
                      <button 
                        onClick={() => handleDelete(protocol.id)}
                        className="btn btn-sm btn-outline btn-error"
                        disabled={isDeleting[protocol.id]}
                      >
                        {isDeleting[protocol.id] ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}