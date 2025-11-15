"use client";

import { useState } from "react";
import { DashboardLayout } from '@/components/layout';
import { Upload } from "lucide-react";
import UploadBackgroundsModal from "./components/UploadBackgroundsModal";
import MasonryGrid from "./components/MasonryGrid";

export default function BackgroundsGallery() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Background Gallery</h1>
            <p className="text-gray-600 mt-1">Upload and manage background images for all Facebook pages</p>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Backgrounds
          </button>
        </div>

        {/* Masonry Grid */}
        <MasonryGrid refreshTrigger={refreshTrigger} />

        {/* Upload Modal */}
        <UploadBackgroundsModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
