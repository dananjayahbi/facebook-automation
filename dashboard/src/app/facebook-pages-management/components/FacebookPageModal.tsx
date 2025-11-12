"use client";

import { useState, useEffect } from 'react';

interface FacebookPage {
  id: string;
  name: string;
  description: string | null;
  pageId: string | null;
  isActive: boolean;
}

interface FacebookPageModalProps {
  page: FacebookPage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: Partial<FacebookPage>) => void;
  loading: boolean;
}

export function FacebookPageModal({ page, isOpen, onClose, onSave, loading }: FacebookPageModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pageId: '',
  });

  const [errors, setErrors] = useState({
    name: '',
  });

  useEffect(() => {
    if (page) {
      setFormData({
        name: page.name,
        description: page.description || '',
        pageId: page.pageId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        pageId: '',
      });
    }
    setErrors({ name: '' });
  }, [page, isOpen]);

  const validateForm = () => {
    const newErrors = { name: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Page name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        pageId: formData.pageId.trim() || null,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {page ? 'Edit Facebook Page' : 'Add Facebook Page'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Page Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Page Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Motivational Quotes"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Optional description for this page"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Facebook Page ID */}
          <div>
            <label htmlFor="pageId" className="block text-sm font-medium text-gray-700 mb-1">
              Facebook Page ID
            </label>
            <input
              type="text"
              id="pageId"
              value={formData.pageId}
              onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="e.g., 123456789012345"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: For Facebook API integration
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : page ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
