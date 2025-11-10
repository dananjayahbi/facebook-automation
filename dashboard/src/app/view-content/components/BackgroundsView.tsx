"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ImageRecord {
  Timestamp: string;
  ImagePath: string;
  Prompt: string;
  Model: string;
  AspectRatio: string;
}

interface ImageListResponse {
  images: ImageRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function BackgroundsView() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const limit = 12;

  useEffect(() => {
    fetchImages();
  }, [page]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching images, page:", page, "limit:", limit);
      
      const response = await fetch(`/api/images/list?page=${page}&limit=${limit}`);
      console.log("📡 Response status:", response.status, response.statusText);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        // Try to get response text first
        const responseText = await response.text();
        console.error("Response text:", responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${responseText.substring(0, 200)}` };
        }
        
        console.error("API error:", errorData);
        throw new Error(errorData.message || "Failed to fetch images");
      }

      const data: ImageListResponse = await response.json();
      console.log(" Received data:", data);
      setImages(data.images);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(" Error fetching images:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    // Extract filename from path like "src/assets/gen-images/uuid.jpg"
    const filename = imagePath.split("/").pop();
    const url = `/api/images/${filename}`;
    console.log("Image URL:", imagePath, "→", url);
    return url;
  };

  const handleDelete = async (imagePath: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await fetch(`/api/images/delete?path=${encodeURIComponent(imagePath)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      toast.success("Image deleted successfully");
      fetchImages();
      setSelectedImage(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleDownload = (imagePath: string) => {
    const link = document.createElement("a");
    link.href = getImageUrl(imagePath);
    link.download = imagePath.split("/").pop() || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading images...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg">No saved backgrounds yet</p>
        <p className="text-sm mt-2">Generate and save some backgrounds to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <div
            key={`${image.ImagePath}-${index}`}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-square relative bg-gray-100">
              <img
                src={getImageUrl(image.ImagePath)}
                alt={image.Prompt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-center p-4">
                <p className="text-sm line-clamp-3">{image.Prompt}</p>
              </div>
            </div>

            {/* Info bar */}
            <div className="p-3 bg-white border-t">
              <p className="text-xs text-gray-500 truncate">
                {new Date(image.Timestamp).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 truncate mt-1">
                {image.Model} • {image.AspectRatio}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative max-h-[70vh] overflow-hidden flex items-center justify-center">
              <img
                src={getImageUrl(selectedImage.ImagePath)}
                alt={selectedImage.Prompt}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Details */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Prompt</h3>
              <p className="text-gray-700 mb-4">{selectedImage.Prompt}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="font-medium">{selectedImage.Model}</p>
                </div>
                <div>
                  <p className="text-gray-500">Aspect Ratio</p>
                  <p className="font-medium">{selectedImage.AspectRatio}</p>
                </div>
                <div>
                  <p className="text-gray-500">Generated</p>
                  <p className="font-medium">
                    {new Date(selectedImage.Timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">File</p>
                  <p className="font-medium text-xs truncate">
                    {selectedImage.ImagePath.split("/").pop()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedImage.ImagePath)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5B50E8] text-white rounded-lg hover:bg-[#4840C0] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(selectedImage.ImagePath)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

