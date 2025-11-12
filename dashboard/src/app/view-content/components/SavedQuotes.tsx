"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';
import { useFacebookPage } from '@/contexts/FacebookPageContext';

interface Quote {
  id: string;
  text: string;
  author: string | null;
  category: string | null;
  generatedBy: string | null;
  createdAt: string;
  createdBy: {
    name: string | null;
    email: string;
  };
}

export function SavedQuotes() {
  const { activePage } = useFacebookPage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [viewModalQuote, setViewModalQuote] = useState<Quote | null>(null);
  const [editModalQuote, setEditModalQuote] = useState<Quote | null>(null);
  const [deleteModalQuote, setDeleteModalQuote] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    if (!activePage) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/quotes?facebookPageId=${activePage.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to load quotes');
        return;
      }

      const data: Quote[] = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('An error occurred while loading quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [activePage]);

  const handleCopyQuote = (quoteText: string) => {
    navigator.clipboard.writeText(quoteText);
    toast.success('Quote copied to clipboard!');
  };

  const handleRefresh = () => {
    fetchQuotes();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#5B50E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotes...</p>
        </div>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <p className="text-gray-600">Please select a Facebook page to view quotes.</p>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <p className="text-gray-600">No saved quotes found for {activePage.name}. Generate and save some quotes to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Quotes for {activePage.name}
            </h3>
            <span className="text-sm text-gray-500">{quotes.length} total</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-start gap-2 max-w-2xl">
                      <span className="flex-1">{quote.text}</span>
                      <button
                        onClick={() => handleCopyQuote(quote.text)}
                        className="shrink-0 p-1 text-gray-400 hover:text-[#5B50E8] transition-colors"
                        title="Copy quote"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#5B50E8]/10 text-[#5B50E8] capitalize">
                      {quote.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.createdBy?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals - Temporarily disabled until updated for new schema */}
      {/* {viewModalQuote && (
        <ViewQuoteModal
          quote={viewModalQuote.text}
          category={viewModalQuote.category}
          onClose={() => setViewModalQuote(null)}
        />
      )} */}
    </>
  );
}
