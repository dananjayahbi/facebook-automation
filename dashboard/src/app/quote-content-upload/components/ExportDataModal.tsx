"use client";

import { useState } from "react";
import { X, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useFacebookPage } from "@/contexts/FacebookPageContext";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
  const { activePage } = useFacebookPage();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!activePage) {
      setExportError("No Facebook page selected");
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportComplete(false);

    try {
      const response = await fetch(
        `/api/uploaded-quotes/export?facebookPageId=${activePage.id}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setExportComplete(true);
    } catch (error) {
      console.error("Export error:", error);
      setExportError(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `quotes_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    setExportComplete(false);
    setExportError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Quote Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Messages */}
          {!isExporting && !exportComplete && !exportError && (
            <div className="text-center py-4">
              <Download className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <p className="text-gray-700 mb-2">
                Export all uploaded quotes for <span className="font-semibold">{activePage?.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                This will generate a CSV file with all your quotes data.
              </p>
            </div>
          )}

          {isExporting && (
            <div className="text-center py-4">
              <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-3 animate-spin" />
              <p className="text-gray-700 font-medium">Exporting data...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your file</p>
            </div>
          )}

          {exportComplete && (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-2">Export Complete!</p>
              <p className="text-sm text-gray-500">Your CSV file is ready to download</p>
            </div>
          )}

          {exportError && (
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-700 font-medium mb-2">Export Failed</p>
              <p className="text-sm text-gray-600">{exportError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          {!exportComplete ? (
            <>
              <button
                onClick={handleClose}
                disabled={isExporting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || !activePage}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Start Export
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
