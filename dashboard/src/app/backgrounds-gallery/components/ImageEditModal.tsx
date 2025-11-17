"use client";

import { useState, useEffect } from "react";
import { X, Plus, Tag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
  imageName: string;
  initialTags: string[];
  onUpdate: (tags: string[]) => void;
}

export default function ImageEditModal({
  isOpen,
  onClose,
  imageId,
  imageName,
  initialTags,
  onUpdate,
}: ImageEditModalProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTags(initialTags);
      setNewTag("");
    }
  }, [isOpen, initialTags]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    
    if (!trimmedTag) {
      toast.error("Tag cannot be empty");
      return;
    }

    if (tags.includes(trimmedTag)) {
      toast.error("Tag already exists");
      return;
    }

    setTags([...tags, trimmedTag]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/background-images/${imageId}/tags`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tags");
      }

      const data = await response.json();
      toast.success("Tags updated successfully");
      onUpdate(data.tags);
      onClose();
    } catch (error) {
      console.error("Error updating tags:", error);
      toast.error("Failed to update tags");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Tags</h2>
              <p className="text-sm text-gray-500 mt-1">{imageName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {/* Add Tag Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isSaving}
              />
              <button
                onClick={handleAddTag}
                disabled={isSaving || !newTag.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to add tag
            </p>
          </div>

          {/* Tags List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Tags ({tags.length})
            </label>
            {tags.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No tags added yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Add tags to help organize and search your images
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSaving}
                      className="text-purple-500 hover:text-purple-700 transition-colors disabled:opacity-50"
                      title="Remove tag"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
