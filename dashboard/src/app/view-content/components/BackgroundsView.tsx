"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ImageLightbox } from "./ImageLightbox";
import { useFacebookPage } from '@/contexts/FacebookPageContext';

interface Background {
  id: string;
  prompt: string;
  imageUrl: string;
  generatedBy: string | null;
  aspectRatio: string | null;
  facebookPageId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export function BackgroundsView() {
  const [images, setImages] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Background | null>(null);
  const { activePage } = useFacebookPage();

  useEffect(() => {
    if (activePage) {
      fetchImages();
    }
  }, [activePage]);

  const fetchImages = async () => {
    if (!activePage) {
      console.log('No active page selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching backgrounds for page:', activePage.id);
      
      const response = await fetch(`/api/images?facebookPageId=${activePage.id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch backgrounds');
      }

      const data: Background[] = await response.json();
      console.log('Received backgrounds:', data.length);
      setImages(data);
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load backgrounds');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string) => {
    // imageUrl format: src/assets/gen-images/{pageId}/{filename}.jpg
    // Extract pageId and filename
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1]; // Get the last part (filename)
    const pageId = parts[parts.length - 2]; // Get the second-to-last part (pageId)
    
    // Construct API URL with pageId parameter
    return `/api/images/${filename}?pageId=${pageId}`;
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = getImageUrl(imageUrl);
    link.download = imageUrl.split("/").pop() || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (imagePath: string) => {
    if (!selectedImage) return;

    try {
      const response = await fetch(`/api/images/delete?id=${selectedImage.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Background deleted successfully');
        setSelectedImage(null);
        // Refresh the images list
        await fetchImages();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete background');
      }
    } catch (error) {
      console.error('Error deleting background:', error);
      toast.error('An error occurred while deleting the background');
    }
  };

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading backgrounds...</div>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg">No Facebook page selected</p>
        <p className="text-sm mt-2">Please select a Facebook page to view backgrounds</p>
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Saved Backgrounds
        </h3>
        <span className="text-sm text-gray-500">{images.length} total</span>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="break-inside-avoid mb-6"
          >
            <div
              className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative w-full bg-gray-100">
                <img
                  src={getImageUrl(image.imageUrl)}
                  alt={image.prompt}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center p-4">
                  <p className="text-sm line-clamp-3">{image.prompt}</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/90 via-black/50 to-transparent">
                <p className="text-xs text-white truncate font-medium">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-200 truncate mt-1">
                  {image.aspectRatio} • {image.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageLightbox
          image={{
            Timestamp: selectedImage.createdAt,
            ImagePath: selectedImage.imageUrl,
            Prompt: selectedImage.prompt,
            Model: selectedImage.generatedBy || 'Unknown',
            AspectRatio: selectedImage.aspectRatio || 'Unknown',
          }}
          imageUrl={getImageUrl(selectedImage.imageUrl)}
          onClose={() => setSelectedImage(null)}
          onDelete={handleDelete}
          onDownload={() => handleDownload(selectedImage.imageUrl)}
        />
      )}
    </div>
  );
}
