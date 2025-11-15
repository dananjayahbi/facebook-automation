"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Masonry from "react-masonry-css";

interface BackgroundImage {
  id: string;
  filename: string;
  path: string;
  createdAt: string;
  uploadedBy: {
    name: string | null;
    email: string;
  };
}

interface MasonryGridProps {
  refreshTrigger: number;
}

export default function MasonryGrid({ refreshTrigger }: MasonryGridProps) {
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch images
  const fetchImages = async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `/api/background-images?page=${pageNum}&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();

      if (append) {
        setImages((prev) => [...prev, ...data.images]);
      } else {
        setImages(data.images);
      }

      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more function for the observer
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, true);
    }
  };

  // Initial load and refresh trigger
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchImages(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Delete image
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setDeleteLoading(id);

    try {
      const response = await fetch(`/api/background-images?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      toast.success("Image deleted successfully");
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No images uploaded yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Click "Upload Backgrounds" to add images to your gallery
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Masonry Grid with react-masonry-css */}
      <Masonry
        breakpointCols={{
          default: 4,
          1024: 3,
          768: 2,
          640: 1,
        }}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="mb-4 relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Image */}
            <div className="relative w-full">
              <img
                src={`/api/background-images/serve/${image.filename}`}
                alt={image.filename}
                className="w-full h-auto object-cover"
                loading="lazy"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={deleteLoading === image.id}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete image"
                >
                  {deleteLoading === image.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs text-gray-500 truncate">
                {image.uploadedBy.name || image.uploadedBy.email}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </Masonry>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loadingMore && images.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Load More
          </button>
        </div>
      )}

      {/* No More Images */}
      {!hasMore && images.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No more images to load
        </div>
      )}
    </div>
  );
}
