"use client";

import { useState } from "react";
import { X, Upload, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import { useFacebookPage } from "@/contexts/FacebookPageContext";

interface UploadCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadCSVModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { activePage } = useFacebookPage();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Please select a CSV file");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!activePage) {
      toast.error("Please select a Facebook Page");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("facebookPageId", activePage.id);

      const response = await fetch("/api/uploaded-quotes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success(data.message || "Quotes uploaded successfully");
      setFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload CSV");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-[#5B50E8] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold">Upload CSV File</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!activePage && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Please select a Facebook Page from the header to continue.
              </p>
            </div>
          )}

          {/* File Input Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#5B50E8] transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading || !activePage}
                className="hidden"
                id="csv-upload"
              />
              
              <label
                htmlFor="csv-upload"
                className={`cursor-pointer ${uploading || !activePage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex flex-col items-center">
                  {file ? (
                    <>
                      <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">
                        Click to select a CSV file
                      </p>
                      <p className="text-xs text-gray-500">
                        or drag and drop
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">
              Before uploading:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-800">
              <li>Ensure your CSV follows the template format</li>
              <li>The 'text' column must not be empty</li>
              <li>File should be UTF-8 encoded</li>
              <li>All data will be appended to existing quotes</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading || !activePage}
            className="bg-[#5B50E8] hover:bg-[#4a3fd6] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
