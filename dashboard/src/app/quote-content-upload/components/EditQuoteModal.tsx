"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Quote {
  id: string;
  text: string;
  author: string | null;
  category: string | null;
  source: string | null;
  tags: string | null;
  isUsed: boolean;
}

interface EditQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onSuccess: () => void;
}

export default function EditQuoteModal({
  isOpen,
  onClose,
  quote,
  onSuccess,
}: EditQuoteModalProps) {
  const [formData, setFormData] = useState({
    text: "",
    author: "",
    category: "",
    source: "",
    tags: "",
    isUsed: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        text: quote.text || "",
        author: quote.author || "",
        category: quote.category || "",
        source: quote.source || "",
        tags: quote.tags || "",
        isUsed: quote.isUsed || false,
      });
    }
  }, [quote]);

  if (!isOpen || !quote) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isUsed: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      toast.error("Quote text is required");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/uploaded-quotes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: quote.id,
          ...formData,
          // Convert empty strings to null for optional fields
          author: formData.author.trim() || null,
          category: formData.category.trim() || null,
          source: formData.source.trim() || null,
          tags: formData.tags.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quote");
      }

      toast.success("Quote updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating quote:", error);
      toast.error(error.message || "Failed to update quote");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-99 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#5B50E8] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Quote</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-4">
            {/* Quote Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Text <span className="text-red-500">*</span>
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent"
                placeholder="Enter the quote text..."
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent"
                placeholder="Enter author name..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent"
                placeholder="e.g., Motivation, Life, Inspiration..."
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent"
                placeholder="Enter source/origin..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent"
                placeholder="Enter comma-separated tags..."
              />
            </div>

            {/* Is Used Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="isUsed"
                name="isUsed"
                checked={formData.isUsed}
                onChange={handleCheckboxChange}
                className="w-5 h-5 text-[#5B50E8] rounded focus:ring-2 focus:ring-[#5B50E8]"
              />
              <label htmlFor="isUsed" className="text-sm font-medium text-gray-900 cursor-pointer">
                Mark as used
              </label>
              <span className="text-xs text-gray-500 ml-auto">
                (Used quotes will be shown in green)
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#5B50E8] hover:bg-[#4a3fd6] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
