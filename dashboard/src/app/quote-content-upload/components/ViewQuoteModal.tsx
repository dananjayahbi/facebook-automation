"use client";

import { X, User, Tag, BookOpen, Link as LinkIcon, Calendar, CheckCircle, XCircle } from "lucide-react";

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

interface ViewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
}

export default function ViewQuoteModal({
  isOpen,
  onClose,
  quote,
}: ViewQuoteModalProps) {
  if (!isOpen || !quote) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#5B50E8] to-[#7B68EE] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Quote Details</h2>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Quote Text - Hero Section */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-6xl text-blue-300 leading-none">"</div>
              <div className="flex-1">
                <p className={`text-lg leading-relaxed ${quote.isUsed ? 'text-green-600 font-medium' : 'text-gray-900'}`}>
                  {quote.text}
                </p>
                <div className="text-6xl text-blue-300 text-right leading-none mt-2">"</div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${quote.isUsed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {quote.isUsed ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Used</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">Not Used</span>
                </>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Author */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Author</h3>
              </div>
              <p className="text-gray-700">
                {quote.author || <span className="text-gray-400 italic">Not specified</span>}
              </p>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Category</h3>
              </div>
              <p className="text-gray-700">
                {quote.category || <span className="text-gray-400 italic">Not specified</span>}
              </p>
            </div>

            {/* Source */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Source</h3>
              </div>
              <p className="text-gray-700">
                {quote.source || <span className="text-gray-400 italic">Not specified</span>}
              </p>
            </div>

            {/* Tags */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {quote.tags ? (
                  quote.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">No tags</span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Metadata
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Uploaded By:</span>
                <span className="font-medium text-gray-900">
                  {quote.uploadedBy.name || "Unknown"} ({quote.uploadedBy.email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upload Date:</span>
                <span className="font-medium text-gray-900">{formatDate(quote.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quote ID:</span>
                <span className="font-mono text-xs text-gray-600">{quote.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-[#5B50E8] hover:bg-[#4a3fd6] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
