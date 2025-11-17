"use client";

import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

interface ImageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

export default function ImageViewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}: ImageViewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset zoom and position when modal opens
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitScreen = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-99 flex items-center justify-center"
      onWheel={(e) => {
        // Prevent scroll propagation to background
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full flex flex-col">
        {/* Simplified Header - Just Close Button */}
        <div className="absolute top-0 right-0 z-20 p-6">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-3 hover:bg-white hover:bg-opacity-20 rounded-lg"
            title="Close"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Image Container */}
        <div
          ref={imageRef}
          className="flex-1 relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <img
              src={imageUrl}
              alt={imageName}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-6 h-6" />
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-6 h-6" />
            </button>

            <div className="w-px h-10 bg-gray-600 mx-1" />

            <button
              onClick={handleFitScreen}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors shadow-lg"
              title="Fit to Screen"
            >
              <Maximize2 className="w-6 h-6" />
            </button>

            <button
              onClick={handleReset}
              className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors shadow-lg"
              title="Reset View"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
