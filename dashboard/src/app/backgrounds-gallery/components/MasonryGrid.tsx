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
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const [loadMoreImagesCount, setLoadMoreImagesCount] = useState(0);
  const [newlyLoadedImages, setNewlyLoadedImages] = useState<BackgroundImage[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state in useEffect to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch images
  const fetchImages = async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
        setLoadMoreImagesCount(0); // Reset load more count
      } else {
        setLoading(true);
        setLoadedImagesCount(0); // Reset count when fetching initial images
      }

      const response = await fetch(
        `/api/background-images?page=${pageNum}&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();

      if (append) {
        console.log('Load More fetched images:', data.images.length);
        setNewlyLoadedImages(data.images); // Store newly loaded images separately
        setImages((prev) => [...prev, ...data.images]);
        // If no new images, stop loading immediately
        if (data.images.length === 0) {
          setLoadingMore(false);
        }
        // Otherwise, wait for images to load via onLoad event
      } else {
        setImages(data.images);
        // If no images, stop loading immediately
        if (data.images.length === 0) {
          setLoading(false);
        }
        // Otherwise, wait for images to load via onLoad event
      }

      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
      setLoading(false); // Stop loading on error
      setLoadingMore(false);
      setNewlyLoadedImages([]); // Clear newly loaded images on error
    }
  };

  // Handle image load - track when images finish loading
  const handleImageLoad = () => {
    setLoadedImagesCount((prev) => {
      console.log('Image loaded, count:', prev + 1);
      return prev + 1;
    });
  };

  // Handle Load More image load
  const handleLoadMoreImageLoad = () => {
    setLoadMoreImagesCount((prev) => {
      console.log('Load More image loaded, count:', prev + 1);
      return prev + 1;
    });
  };

  // Effect to hide loading when all initial images are loaded
  useEffect(() => {
    console.log('Loading check:', { loading, imagesLength: images.length, loadedImagesCount });
    if (loading && images.length > 0 && loadedImagesCount >= images.length) {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [loading, images.length, loadedImagesCount]);

  // Effect to hide loadingMore when all newly loaded images are loaded
  useEffect(() => {
    console.log('Load More check:', { 
      loadingMore, 
      newlyLoadedImagesLength: newlyLoadedImages.length, 
      loadMoreImagesCount,
      newlyLoadedImages: newlyLoadedImages.map(img => img.filename)
    });
    if (loadingMore && newlyLoadedImages.length > 0 && loadMoreImagesCount >= newlyLoadedImages.length) {
      console.log('Setting loadingMore to false - all images loaded');
      // Add a small delay to ensure images are rendered
      setTimeout(() => {
        setLoadingMore(false);
        setNewlyLoadedImages([]); // Clear newly loaded images
      }, 100);
    }
  }, [loadingMore, newlyLoadedImages, loadMoreImagesCount]);

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
    setLoadedImagesCount(0);
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

  if (loading && !isMounted) {
    // Show nothing during SSR to avoid hydration mismatch
    return null;
  }

  if (loading) {
    return (
      <div>
        {/* Hidden images to trigger onLoad events */}
        <div className="hidden">
          {images.map((image) => (
            <img
              key={image.id}
              src={`/api/background-images/serve/${image.filename}`}
              alt={image.filename}
              onLoad={handleImageLoad}
            />
          ))}
        </div>

        {/* Visible skeleton loading */}
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
          {Array.from({ length: 20 }).map((_, index) => {
            // Use a pattern of fixed heights to avoid hydration mismatch
            const heights = [300, 250, 350, 280, 320, 270, 340, 290, 310, 260];
            const height = heights[index % heights.length];
            
            return (
              <div
                key={`skeleton-${index}`}
                className="mb-4 bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                {/* Skeleton Image - fixed height pattern */}
                <div 
                  className="w-full bg-gray-200" 
                  style={{ height: `${height}px` }}
                />

                {/* Skeleton Info */}
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            );
          })}
        </Masonry>
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
      {/* Hidden images for Load More to trigger onLoad events */}
      {loadingMore && (
        <div className="hidden">
          {newlyLoadedImages.map((image) => (
            <img
              key={`preload-${image.id}`}
              src={`/api/background-images/serve/${image.filename}`}
              alt={image.filename}
              onLoad={handleLoadMoreImageLoad}
            />
          ))}
        </div>
      )}

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

        {/* Skeleton Loading Cards */}
        {loadingMore && Array.from({ length: 20 }).map((_, index) => {
          // Use a pattern of fixed heights to avoid hydration mismatch
          const heights = [300, 250, 350, 280, 320, 270, 340, 290, 310, 260];
          const height = heights[index % heights.length];
          
          return (
            <div
              key={`skeleton-load-more-${index}`}
              className="mb-4 bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              {/* Skeleton Image - fixed height pattern */}
              <div 
                className="w-full bg-gray-200" 
                style={{ height: `${height}px` }}
              />

              {/* Skeleton Info */}
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          );
        })}
      </Masonry>

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
