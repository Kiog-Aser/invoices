"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from "@/libs/api";

export default function WebsiteDetailsPage() {
  const { websiteId } = useParams();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchWebsite() {
      try {
        setLoading(true);
        const response = await apiClient.get(`/websites/${websiteId}`);
        setWebsite(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching website:', err);
        setError('Failed to load website data');
        setLoading(false);
      }
    }

    if (websiteId) {
      fetchWebsite();
    }
  }, [websiteId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error">{error}</div>;
  if (!website) return <div>Website not found</div>;

  return (
    <div>
      <h1>{website.domain}</h1>
      {/* Display other website details */}
    </div>
  );
}