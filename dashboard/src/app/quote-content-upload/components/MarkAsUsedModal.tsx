"use client";

import { X, CheckCircle } from "lucide-react";

interface MarkAsUsedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quoteText: string;
  isUsed: boolean;
  isProcessing: boolean;
}

export default function MarkAsUsedModal({
  isOpen,
  onClose,
  onConfirm,
  quoteText,
  isUsed,
  isProcessing,
}: MarkAsUsedModalProps) {
  if (!isOpen) return null;

  const action = isUsed ? "Mark as Unused" : "Mark as Used";
  const description = isUsed
    ? "This quote will be marked as unused and will appear in normal text color."
    : "This quote will be marked as used and will appear in green text color.";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className={`${isUsed ? 'bg-gray-600' : 'bg-green-600'} text-white px-6 py-4 flex justify-between items-center rounded-t-lg`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <h2 className="text-xl font-semibold">{action}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{description}</p>

          {/* Quote Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-900 italic line-clamp-3">
              "{quoteText}"
            </p>
          </div>

          <div className={`mt-4 ${isUsed ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'} border rounded-lg p-3`}>
            <p className={`text-sm ${isUsed ? 'text-gray-700' : 'text-green-800'}`}>
              {isUsed
                ? "The quote will be available for use again."
                : "This will help you track which quotes have already been published."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`${isUsed ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              action
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
