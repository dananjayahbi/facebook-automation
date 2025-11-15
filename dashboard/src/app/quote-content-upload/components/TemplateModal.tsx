"use client";

import { X } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
  if (!isOpen) return null;

  // Sample data for the template
  const sampleData = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "Motivation",
      source: "Stanford Commencement Speech",
      tags: "work, passion, success",
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
      category: "Life",
      source: "Beautiful Boy",
      tags: "life, planning, wisdom",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "Inspiration",
      source: "Speech",
      tags: "future, dreams, belief",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#5B50E8] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">CSV Template Format</h2>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Required and Optional Columns
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    Required
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">text</span>
                    <span className="text-gray-600"> - The quote text</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    Optional
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">author</span>
                    <span className="text-gray-600"> - Author of the quote</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    Optional
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">category</span>
                    <span className="text-gray-600"> - Category/theme</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    Optional
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">source</span>
                    <span className="text-gray-600"> - Source/origin</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    Optional
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">tags</span>
                    <span className="text-gray-600">
                      {" "}
                      - Comma-separated tags
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sample Data
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      text
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      author
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      tags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.text}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.author}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.source}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.tags}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>The CSV file must include headers in the first row</li>
              <li>The 'text' column is required and must not be empty</li>
              <li>All other columns are optional</li>
              <li>Use UTF-8 encoding for special characters</li>
              <li>Rows with empty 'text' will be skipped</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
