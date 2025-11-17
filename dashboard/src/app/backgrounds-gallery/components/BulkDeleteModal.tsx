"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface BackgroundImage {
  id: string;
  filename: string;
  path: string;
  tags: string[];
  createdAt: string;
}

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkDeleteModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkDeleteModalProps) {
  const [markedImages, setMarkedImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMarkedImages();
    }
  }, [isOpen]);

  const fetchMarkedImages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/background-images/marked");
      if (!response.ok) throw new Error("Failed to fetch marked images");
      
      const data = await response.json();
      setMarkedImages(data.images);
    } catch (error) {
      console.error("Error fetching marked images:", error);
      toast.error("Failed to load marked images");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (markedImages.length === 0) {
      toast.error("No images marked for deletion");
      return;
    }

    // Show custom confirmation modal instead of browser confirm
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmation(false);
    setDeleting(true);
    
    try {
      const response = await fetch("/api/background-images/bulk-delete", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete images");

      const data = await response.json();
      toast.success(`Successfully deleted ${data.deletedCount} image(s)`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleUnmark = async (id: string) => {
    try {
      const response = await fetch(`/api/background-images/${id}/mark-delete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMarkedForDeletion: false }),
      });

      if (!response.ok) throw new Error("Failed to unmark image");

      toast.success("Image unmarked");
      setMarkedImages((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Error unmarking image:", error);
      toast.error("Failed to unmark image");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Delete Images</h2>
              <p className="text-sm text-gray-500 mt-1">
                {markedImages.length} image(s) marked for deletion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : markedImages.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No images marked for deletion</p>
              <p className="text-gray-400 text-sm mt-2">
                Hover over images and click the "Mark for Deletion" button to add them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {markedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-gray-50 rounded-lg overflow-hidden border-2 border-red-200"
                >
                  <img
                    src={`/api/background-images/serve/${image.filename}`}
                    alt={image.filename}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-none group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <button
                      onClick={() => handleUnmark(image.id)}
                      disabled={deleting}
                      className="opacity-0 group-hover:opacity-100 cursor-pointer bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                    >
                      Unmark
                    </button>
                  </div>
                  {/* Red border indicator */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {markedImages.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                ⚠️ This action will permanently delete all marked images
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete All ({markedImages.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmation && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete} />
          <div className="relative bg-white rounded-lg shadow-2xl p-6 max-w-md mx-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Bulk Deletion
                </h3>
                <p className="text-gray-600 mb-1">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-red-600">
                    {markedImages.length} image{markedImages.length !== 1 ? "s" : ""}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All selected images will be removed from the database and the file system.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
