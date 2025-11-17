"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye, Edit2, Star, Ban } from "lucide-react";
import toast from "react-hot-toast";
import Masonry from "react-masonry-css";
import SkeletonCard from "./SkeletonCard";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ImageViewModal from "./ImageViewModal";
import ImageEditModal from "./ImageEditModal";

interface BackgroundImage {
  id: string;
  filename: string;
  path: string;
  tags: string[];
  isFavorite: boolean;
  isMarkedForDeletion: boolean;
  createdAt: string;
  uploadedBy: {
    name: string | null;
    email: string;
  };
}

interface MasonryGridProps {
  refreshTrigger: number;
  searchQuery?: string;
  hideMarked?: boolean;
}

export default function MasonryGrid({ refreshTrigger, searchQuery = "", hideMarked = false }: MasonryGridProps) {
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
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<BackgroundImage | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [markLoading, setMarkLoading] = useState<string | null>(null);

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

      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const response = await fetch(
        `/api/background-images?page=${pageNum}&limit=20${searchParam}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter out marked images if hideMarked is true
      const filteredImages = hideMarked 
        ? data.images.filter((img: BackgroundImage) => !img.isMarkedForDeletion)
        : data.images;

      if (append) {
        setNewlyLoadedImages(filteredImages); // Store newly loaded images separately
        setImages((prev) => [...prev, ...filteredImages]);
        // If no new images, stop loading immediately
        if (filteredImages.length === 0) {
          setLoadingMore(false);
        }
        // Otherwise, wait for images to load via onLoad event
      } else {
        setImages(filteredImages);
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
    setLoadedImagesCount((prev) => prev + 1);
  };

  // Handle Load More image load
  const handleLoadMoreImageLoad = () => {
    setLoadMoreImagesCount((prev) => prev + 1);
  };

  // Effect to hide loading when all initial images are loaded
  useEffect(() => {
    if (loading && images.length > 0 && loadedImagesCount >= images.length) {
      setLoading(false);
    }
  }, [loading, images.length, loadedImagesCount]);

  // Effect to hide loadingMore when all newly loaded images are loaded
  useEffect(() => {
    if (loadingMore && newlyLoadedImages.length > 0 && loadMoreImagesCount >= newlyLoadedImages.length) {
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
  }, [refreshTrigger, searchQuery, hideMarked]);

  // Delete image
  const handleDeleteClick = (image: BackgroundImage) => {
    setSelectedImage(image);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedImage) return;

    setDeleteLoading(selectedImage.id);

    try {
      const response = await fetch(`/api/background-images?id=${selectedImage.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      toast.success("Image deleted successfully");
      setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
      setDeleteModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleteLoading(null);
    }
  };

  // View image
  const handleViewClick = (image: BackgroundImage) => {
    setSelectedImage(image);
    setViewModalOpen(true);
  };

  // Edit image tags
  const handleEditClick = (image: BackgroundImage) => {
    setSelectedImage(image);
    setEditModalOpen(true);
  };

  const handleTagsUpdate = (updatedTags: string[]) => {
    if (!selectedImage) return;
    
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImage.id ? { ...img, tags: updatedTags } : img
      )
    );
  };

  // Toggle favorite
  const handleToggleFavorite = async (image: BackgroundImage) => {
    setFavoriteLoading(image.id);

    try {
      const response = await fetch(`/api/background-images/${image.id}/favorite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite: !image.isFavorite }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      const data = await response.json();
      
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, isFavorite: data.isFavorite } : img
        )
      );

      toast.success(
        data.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    } finally {
      setFavoriteLoading(null);
    }
  };

  // Toggle mark for deletion
  const handleToggleMark = async (image: BackgroundImage) => {
    setMarkLoading(image.id);

    try {
      const response = await fetch(`/api/background-images/${image.id}/mark-delete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isMarkedForDeletion: !image.isMarkedForDeletion }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle mark for deletion");
      }

      const data = await response.json();
      
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, isMarkedForDeletion: data.isMarkedForDeletion } : img
        )
      );

      toast.success(
        data.isMarkedForDeletion ? "Marked for deletion" : "Unmarked"
      );
    } catch (error) {
      console.error("Error toggling mark:", error);
      toast.error("Failed to update mark status");
    } finally {
      setMarkLoading(null);
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
          {Array.from({ length: 20 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} index={index} />
          ))}
        </Masonry>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">
          {searchQuery ? "No images found matching your search" : "No images uploaded yet"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {searchQuery
            ? "Try different search terms or clear the search"
            : 'Click "Upload Backgrounds" to add images to your gallery'}
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
            className={`mb-4 relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
              image.isMarkedForDeletion ? "ring-2 ring-orange-500" : ""
            }`}
          >
            {/* Favorite Badge */}
            {image.isFavorite && (
              <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
              </div>
            )}
            
            {/* Marked for Deletion Badge */}
            {image.isMarkedForDeletion && (
              <div className="absolute top-2 right-2 z-10 bg-orange-600 text-white px-2 py-1 rounded-md shadow-lg text-xs font-semibold">
                Marked for Deletion
              </div>
            )}

            {/* Image */}
            <div className="relative w-full">
              <img
                src={`/api/background-images/serve/${image.filename}`}
                alt={image.filename}
                className="w-full h-auto object-cover"
                loading="lazy"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  {/* View Button */}
                  <button
                    onClick={() => handleViewClick(image)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                    title="View image"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(image)}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                    title="Edit tags"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(image)}
                    disabled={favoriteLoading === image.id}
                    className={`${
                      image.isFavorite
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    } text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favoriteLoading === image.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Star className={`w-5 h-5 ${image.isFavorite ? "fill-current" : ""}`} />
                    )}
                  </button>

                  {/* Mark for Deletion Button */}
                  <button
                    onClick={() => handleToggleMark(image)}
                    disabled={markLoading === image.id}
                    className={`${
                      image.isMarkedForDeletion
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    } text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={image.isMarkedForDeletion ? "Unmark for deletion" : "Mark for deletion"}
                  >
                    {markLoading === image.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Ban className="w-5 h-5" />
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(image)}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              {/* Tags */}
              {image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {image.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {image.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{image.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
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
        {loadingMore && Array.from({ length: 20 }).map((_, index) => (
          <SkeletonCard key={`skeleton-load-more-${index}`} index={index} />
        ))}
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

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedImage(null);
        }}
        onConfirm={handleDelete}
        imageName={selectedImage?.filename}
        isDeleting={deleteLoading !== null}
      />

      <ImageViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedImage(null);
        }}
        imageUrl={
          selectedImage
            ? `/api/background-images/serve/${selectedImage.filename}`
            : ""
        }
        imageName={selectedImage?.filename || ""}
      />

      <ImageEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedImage(null);
        }}
        imageId={selectedImage?.id || ""}
        imageName={selectedImage?.filename || ""}
        initialTags={selectedImage?.tags || []}
        onUpdate={handleTagsUpdate}
      />
    </div>
  );
}
