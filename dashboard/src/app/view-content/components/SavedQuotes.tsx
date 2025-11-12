"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Copy, Eye, Edit2, Trash2 } from 'lucide-react';
import { ViewQuoteModal } from './ViewQuoteModal';
import { EditQuoteModal } from './EditQuoteModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      {quote.tone || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewModalQuote(quote)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View quote"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditModalQuote(quote)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit quote"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModalQuote(quote)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> of{' '}
            <span className="font-medium">{totalCount}</span> quotes
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!hasPrevPage}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewModalQuote && (
        <ViewQuoteModal
          quote={viewModalQuote.quote}
          tone={viewModalQuote.tone}
          onClose={() => setViewModalQuote(null)}
        />
      )}

      {editModalQuote && (
        <EditQuoteModal
          rowId={editModalQuote.rowId}
          initialQuote={editModalQuote.quote}
          onClose={() => setEditModalQuote(null)}
          onSave={handleRefresh}
        />
      )}

      {deleteModalQuote && (
        <DeleteConfirmModal
          rowId={deleteModalQuote.rowId}
          quote={deleteModalQuote.quote}
          onClose={() => setDeleteModalQuote(null)}
          onDelete={handleRefresh}
        />
      )}
    </>
  );
}
