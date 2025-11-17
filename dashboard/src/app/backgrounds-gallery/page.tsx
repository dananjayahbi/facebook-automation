"use client";

import { useState } from "react";
import { DashboardLayout } from '@/components/layout';
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";
import UploadBackgroundsModal from "./components/UploadBackgroundsModal";
import MasonryGrid from "./components/MasonryGrid";
import FloatingSearchButton from "./components/FloatingSearchButton";
import BulkDeleteModal from "./components/BulkDeleteModal";

export default function BackgroundsGallery() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideMarked, setHideMarked] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBulkDeleteSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Toggle Hide Marked Button */}
            <button
              onClick={() => setHideMarked(!hideMarked)}
              className={`${
                hideMarked
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2`}
              title={hideMarked ? "Show marked images" : "Hide marked images"}
            >
              {hideMarked ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              {hideMarked ? "Show Marked" : "Hide Marked"}
            </button>

            {/* Bulk Delete Button */}
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Bulk Delete
            </button>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Backgrounds
            </button>
          </div>
        </div>

        {/* Masonry Grid */}
        <MasonryGrid 
          refreshTrigger={refreshTrigger} 
          searchQuery={searchQuery}
          hideMarked={hideMarked}
        />

        {/* Floating Search Button */}
        <FloatingSearchButton
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />

        {/* Upload Modal */}
        <UploadBackgroundsModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />

        {/* Bulk Delete Modal */}
        <BulkDeleteModal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onSuccess={handleBulkDeleteSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
