"use client";

import { useState, useEffect } from "react";
import { Trash2, ChevronLeft, ChevronRight, Edit, Eye, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useFacebookPage } from "@/contexts/FacebookPageContext";
import EditQuoteModal from "./EditQuoteModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import MarkAsUsedModal from "./MarkAsUsedModal";
import ViewQuoteModal from "./ViewQuoteModal";

interface Quote {
  id: string;
  text: string;
  author: string | null;
  category: string | null;
  source: string | null;
  tags: string | null;
  isUsed: boolean;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface QuotesTableProps {
  refreshTrigger: number;
}

export default function QuotesTable({ refreshTrigger }: QuotesTableProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);
  const [markingQuote, setMarkingQuote] = useState<Quote | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [processingUsed, setProcessingUsed] = useState(false);
  const { activePage } = useFacebookPage();

  useEffect(() => {
    fetchQuotes(1);
  }, [activePage, refreshTrigger]);

  const fetchQuotes = async (page: number) => {
    if (!activePage) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/uploaded-quotes?page=${page}&limit=20&facebookPageId=${activePage.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }

      const data = await response.json();
      setQuotes(data.quotes);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      const response = await fetch(`/api/uploaded-quotes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quote");
      }

      toast.success("Quote deleted successfully");
      setDeletingQuote(null);
      
      // Refresh current page
      fetchQuotes(pagination.page);
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Failed to delete quote");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
  };

  const handleDeleteClick = (quote: Quote) => {
    setDeletingQuote(quote);
  };

  const handleView = (quote: Quote) => {
    setViewingQuote(quote);
  };

  const handleMarkAsUsedClick = (quote: Quote) => {
    setMarkingQuote(quote);
  };

  const handleMarkAsUsed = async () => {
    if (!markingQuote) return;

    try {
      setProcessingUsed(true);

      const response = await fetch("/api/uploaded-quotes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: markingQuote.id,
          text: markingQuote.text,
          author: markingQuote.author,
          category: markingQuote.category,
          source: markingQuote.source,
          tags: markingQuote.tags,
          isUsed: !markingQuote.isUsed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quote");
      }

      toast.success(
        markingQuote.isUsed ? "Quote marked as unused" : "Quote marked as used"
      );
      setMarkingQuote(null);
      fetchQuotes(pagination.page);
    } catch (error: any) {
      console.error("Error marking quote:", error);
      toast.error(error.message || "Failed to update quote status");
    } finally {
      setProcessingUsed(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchQuotes(newPage);
  };

  if (!activePage) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">
          Please select a Facebook Page from the header to view uploaded quotes.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#5B50E8] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading quotes...</span>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 mb-2">No quotes uploaded yet.</p>
        <p className="text-sm text-gray-500">
          Upload a CSV file to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Quote Text
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Uploaded By
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm max-w-md">
                  <div className={`line-clamp-3 ${quote.isUsed ? 'text-green-600 font-medium' : 'text-gray-900'}`}>
                    {quote.text}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {quote.author || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {quote.category || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {quote.source || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {quote.tags || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {quote.uploadedBy.name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {quote.uploadedBy.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleView(quote)}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMarkAsUsedClick(quote)}
                      className={quote.isUsed ? "text-gray-600 hover:text-gray-800" : "text-green-600 hover:text-green-800"}
                      title={quote.isUsed ? "Mark as unused" : "Mark as used"}
                    >
                      {quote.isUsed ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(quote)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit quote"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(quote)}
                      disabled={deleting === quote.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete quote"
                    >
                      {deleting === quote.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> quotes
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditQuoteModal
        isOpen={!!editingQuote}
        onClose={() => setEditingQuote(null)}
        quote={editingQuote}
        onSuccess={() => fetchQuotes(pagination.page)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingQuote}
        onClose={() => setDeletingQuote(null)}
        onConfirm={() => deletingQuote && handleDelete(deletingQuote.id)}
        quoteText={deletingQuote?.text || ""}
        isDeleting={!!deleting}
      />

      {/* Mark as Used Modal */}
      <MarkAsUsedModal
        isOpen={!!markingQuote}
        onClose={() => setMarkingQuote(null)}
        onConfirm={handleMarkAsUsed}
        quoteText={markingQuote?.text || ""}
        isUsed={markingQuote?.isUsed || false}
        isProcessing={processingUsed}
      />

      {/* View Quote Modal */}
      <ViewQuoteModal
        isOpen={!!viewingQuote}
        onClose={() => setViewingQuote(null)}
        quote={viewingQuote}
      />
    </div>
  );
}
