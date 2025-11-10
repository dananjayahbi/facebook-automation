"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Check, Download, Edit2, X } from 'lucide-react';

interface TextModel {
  id: string;
  name: string;
  modelId: string;
  isDefault: boolean;
  isActive: boolean;
}

interface ImageModel {
  id: string;
  name: string;
  modelId: string;
  isDefault: boolean;
  isActive: boolean;
}

interface ImageSettings {
  id: string;
  defaultAspectRatio: string;
}

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:3", label: "4:3 (Fullscreen)" },
  { value: "3:4", label: "3:4 (Portrait Fullscreen)" },
  { value: "9:16", label: "9:16 (Portrait)" },
];

export function SettingsContent() {
  const [textModels, setTextModels] = useState<TextModel[]>([]);
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [imageSettings, setImageSettings] = useState<ImageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // New model form states
  const [newTextModel, setNewTextModel] = useState({ name: '', modelId: '' });
  const [newImageModel, setNewImageModel] = useState({ name: '', modelId: '' });

  // Edit states
  const [editingTextModel, setEditingTextModel] = useState<string | null>(null);
  const [editTextForm, setEditTextForm] = useState({ name: '', modelId: '' });
  const [editingImageModel, setEditingImageModel] = useState<string | null>(null);
  const [editImageForm, setEditImageForm] = useState({ name: '', modelId: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [textRes, imageRes, settingsRes] = await Promise.all([
        fetch('/api/settings/text-models'),
        fetch('/api/settings/image-models'),
        fetch('/api/settings/image-settings'),
      ]);

      const textData = await textRes.json();
      const imageData = await imageRes.json();
      const settingsData = await settingsRes.json();

      setTextModels(textData.models || []);
      setImageModels(imageData.models || []);
      setImageSettings(settingsData.settings || null);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTextModel = async () => {
    if (!newTextModel.name || !newTextModel.modelId) {
      toast.error('Please enter both name and model ID');
      return;
    }

    try {
      const response = await fetch('/api/settings/text-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTextModel),
      });

      if (!response.ok) throw new Error();

      toast.success('Text model added successfully');
      setNewTextModel({ name: '', modelId: '' });
      fetchSettings();
    } catch (error) {
      toast.error('Failed to add text model');
    }
  };

  const handleAddImageModel = async () => {
    if (!newImageModel.name || !newImageModel.modelId) {
      toast.error('Please enter both name and model ID');
      return;
    }

    try {
      const response = await fetch('/api/settings/image-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImageModel),
      });

      if (!response.ok) throw new Error();

      toast.success('Image model added successfully');
      setNewImageModel({ name: '', modelId: '' });
      fetchSettings();
    } catch (error) {
      toast.error('Failed to add image model');
    }
  };

  const handleSetDefaultText = async (id: string) => {
    try {
      const response = await fetch('/api/settings/text-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });

      if (!response.ok) throw new Error();

      toast.success('Default text model updated');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update default model');
    }
  };

  const handleSetDefaultImage = async (id: string) => {
    try {
      const response = await fetch('/api/settings/image-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });

      if (!response.ok) throw new Error();

      toast.success('Default image model updated');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update default model');
    }
  };

  const handleDeleteTextModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await fetch(`/api/settings/text-models?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      toast.success('Text model deleted');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to delete text model');
    }
  };

  const handleDeleteImageModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await fetch(`/api/settings/image-models?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      toast.success('Image model deleted');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to delete image model');
    }
  };

  const handleEditTextModel = (model: TextModel) => {
    setEditingTextModel(model.id);
    setEditTextForm({ name: model.name, modelId: model.modelId });
  };

  const handleCancelEditText = () => {
    setEditingTextModel(null);
    setEditTextForm({ name: '', modelId: '' });
  };

  const handleSaveTextModel = async (id: string) => {
    if (!editTextForm.name || !editTextForm.modelId) {
      toast.error('Both name and model ID are required');
      return;
    }

    try {
      const response = await fetch('/api/settings/text-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editTextForm }),
      });

      if (!response.ok) throw new Error();

      toast.success('Text model updated');
      setEditingTextModel(null);
      setEditTextForm({ name: '', modelId: '' });
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update text model');
    }
  };

  const handleEditImageModel = (model: ImageModel) => {
    setEditingImageModel(model.id);
    setEditImageForm({ name: model.name, modelId: model.modelId });
  };

  const handleCancelEditImage = () => {
    setEditingImageModel(null);
    setEditImageForm({ name: '', modelId: '' });
  };

  const handleSaveImageModel = async (id: string) => {
    if (!editImageForm.name || !editImageForm.modelId) {
      toast.error('Both name and model ID are required');
      return;
    }

    try {
      const response = await fetch('/api/settings/image-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editImageForm }),
      });

      if (!response.ok) throw new Error();

      toast.success('Image model updated');
      setEditingImageModel(null);
      setEditImageForm({ name: '', modelId: '' });
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update image model');
    }
  };

  const handleUpdateAspectRatio = async (aspectRatio: string) => {
    try {
      const response = await fetch('/api/settings/image-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultAspectRatio: aspectRatio }),
      });

      if (!response.ok) throw new Error();

      toast.success('Default aspect ratio updated');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update aspect ratio');
    }
  };

  const handleDownloadQuotes = async () => {
    try {
      const response = await fetch('/api/quotes/download');

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-quotes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Quote sheet downloaded');
    } catch (error) {
      toast.error('Failed to download quote sheet');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#5B50E8]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Text Models Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Text Generation Models</h2>
        
        {/* Add new text model */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Text Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Display Name (e.g., Gemini 2.5 Flash)"
              value={newTextModel.name}
              onChange={(e) => setNewTextModel({ ...newTextModel, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Model ID (e.g., gemini-2.5-flash-lite)"
              value={newTextModel.modelId}
              onChange={(e) => setNewTextModel({ ...newTextModel, modelId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
            />
          </div>
          <button
            onClick={handleAddTextModel}
            className="px-4 py-2 bg-[#5B50E8] text-white rounded-lg hover:bg-[#4A3FD7] transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Text Model
          </button>
        </div>

        {/* List of text models */}
        <div className="space-y-2">
          {textModels.map((model) => (
            <div
              key={model.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {editingTextModel === model.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editTextForm.name}
                      onChange={(e) => setEditTextForm({ ...editTextForm, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
                      placeholder="Display Name"
                    />
                    <input
                      type="text"
                      value={editTextForm.modelId}
                      onChange={(e) => setEditTextForm({ ...editTextForm, modelId: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
                      placeholder="Model ID"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveTextModel(model.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditText}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{model.name}</span>
                      {model.isDefault && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{model.modelId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTextModel(model)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSetDefaultText(model.id)}
                      disabled={model.isDefault}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Set Default
                    </button>
                    <button
                      onClick={() => handleDeleteTextModel(model.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Models Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Generation Models</h2>
        
        {/* Add new image model */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Image Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Display Name (e.g., Gemini 2.5 Flash Image)"
              value={newImageModel.name}
              onChange={(e) => setNewImageModel({ ...newImageModel, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Model ID (e.g., gemini-2.5-flash-image)"
              value={newImageModel.modelId}
              onChange={(e) => setNewImageModel({ ...newImageModel, modelId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
            />
          </div>
          <button
            onClick={handleAddImageModel}
            className="px-4 py-2 bg-[#5B50E8] text-white rounded-lg hover:bg-[#4A3FD7] transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Image Model
          </button>
        </div>

        {/* List of image models */}
        <div className="space-y-2">
          {imageModels.map((model) => (
            <div
              key={model.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {editingImageModel === model.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editImageForm.name}
                      onChange={(e) => setEditImageForm({ ...editImageForm, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
                      placeholder="Display Name"
                    />
                    <input
                      type="text"
                      value={editImageForm.modelId}
                      onChange={(e) => setEditImageForm({ ...editImageForm, modelId: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm"
                      placeholder="Model ID"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveImageModel(model.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditImage}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{model.name}</span>
                      {model.isDefault && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{model.modelId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditImageModel(model)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSetDefaultImage(model.id)}
                      disabled={model.isDefault}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Set Default
                    </button>
                    <button
                      onClick={() => handleDeleteImageModel(model.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Settings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Generation Settings</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Aspect Ratio
          </label>
          <select
            value={imageSettings?.defaultAspectRatio || "3:4"}
            onChange={(e) => handleUpdateAspectRatio(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B50E8] focus:border-transparent outline-none text-sm w-full md:w-64"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio.value} value={ratio.value}>
                {ratio.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Export Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Export</h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadQuotes}
            className="px-4 py-2 bg-[#5B50E8] text-white rounded-lg hover:bg-[#4A3FD7] transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download Quote Sheet
          </button>
          <p className="text-sm text-gray-600">
            Download all generated quotes as a CSV file
          </p>
        </div>
      </div>
    </div>
  );
}
