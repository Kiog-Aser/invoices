'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvoiceFinderPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    count: number;
    email: string;
  } | null>(null);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLinkSent(false);

    try {
      const response = await fetch(`/api/invoice/${slug}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to search for invoices');
      }
    } catch (error) {
      console.error('Error searching invoices:', error);
      alert('Failed to search for invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLink = async () => {
    setSendingLink(true);

    try {
      const response = await fetch(`/api/invoice/${slug}/send-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setLinkSent(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send link');
      }
    } catch (error) {
      console.error('Error sending link:', error);
      alert('Failed to send link');
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Get your invoice
          </h1>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSearch}>
            <input
              type="email"
              placeholder="tom@cruise.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Find Invoice →'}
            </button>
          </form>

          {/* Search Results */}
          {result && (
            <div className="mt-6 text-center">
              {result.found ? (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.count} invoice{result.count !== 1 ? 's' : ''} found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click below to receive a private link at{' '}
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {result.email}
                      </span>{' '}
                      to edit and download your invoices.
                    </p>

                    {!linkSent ? (
                      <button
                        onClick={handleSendLink}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                        disabled={sendingLink}
                      >
                        {sendingLink ? 'Sending...' : 'Send My Link →'}
                      </button>
                    ) : (
                      <div className="text-center">
                        <div className="text-green-600 font-semibold mb-2 text-lg">
                          ✓ Link sent successfully!
                        </div>
                        <p className="text-gray-600">
                          Check your email for the access link
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    No invoices found
                  </h3>
                  <p className="text-gray-600">
                    We couldn&apos;t find any invoices for{' '}
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {result.email}
                    </span>
                    . Please check your email address and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Having trouble? Contact the business that sent you this link for assistance.
          </p>
        </div>
      </div>
    </div>
  );
} 