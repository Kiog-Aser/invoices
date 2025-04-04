'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protocols.map((protocol) => (
            <div 
              key={protocol.id} 
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative"
              onClick={() => handleView(protocol.id)}
            >
              {/* Delete button in top right corner */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(protocol.id);
                }}
                className="absolute top-2 right-2 btn btn-sm btn-ghost text-error z-10"
                disabled={isDeleting[protocol.id]}
                aria-label="Delete protocol"
              >
                {isDeleting[protocol.id] ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash />
                )}
              </button>

              <div className="card-body">
                <h2 className="card-title text-lg font-bold truncate">{protocol.title}</h2>
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
                <div className="mt-4 card-actions justify-end opacity-60">
                  <FaArrowRight className="text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}