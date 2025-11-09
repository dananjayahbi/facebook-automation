"use client";

import { DashboardLayout } from '@/components/layout';
import { ProtectedPage } from '@/components/wrappers/auth';
import { Select } from '@/components/ui';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Image, Copy, Check } from 'lucide-react';

type TabType = 'quotes' | 'backgrounds';

const GEMINI_MODELS = [
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
];

export default function GenerateContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('quotes');
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateQuote = async () => {
    setIsGenerating(true);
    setGeneratedQuote('');
    setCopied(false);

    try {
      const response = await fetch('/api/generate/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to generate quote');
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        toast.error('Failed to read response');
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setGeneratedQuote(prev => prev + chunk);
      }

      toast.success('Quote generated successfully!');
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('An error occurred while generating quote');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(generatedQuote);
    setCopied(true);
    toast.success('Quote copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedPage>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
            <p className="text-gray-600 mt-2">Create quotes and backgrounds with AI</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('quotes')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'quotes'
                    ? 'border-[#5B50E8] text-[#5B50E8]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quotes Generator
                </span>
              </button>
              <button
                onClick={() => setActiveTab('backgrounds')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'backgrounds'
                    ? 'border-[#5B50E8] text-[#5B50E8]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Background Generator
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'quotes' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Model
                    </label>
                    <Select
                      options={GEMINI_MODELS}
                      value={selectedModel}
                      onChange={(value) => setSelectedModel(value)}
                      disabled={isGenerating}
                      fullWidth
                    />
                  </div>

                  <button
                    onClick={handleGenerateQuote}
                    disabled={isGenerating}
                    className="w-full px-6 py-3 bg-[#5B50E8] text-white font-medium rounded-lg hover:bg-[#4A3FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Generate Quote'}
                  </button>
                </div>
              </div>

              {/* Output */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Quote</h2>
                  {generatedQuote && !isGenerating && (
                    <button
                      onClick={handleCopyQuote}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                <div className="min-h-[200px] flex items-center justify-center">
                  {isGenerating && (
                    <div className="text-center">
                      <div className="w-12 h-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#5B50E8] mx-auto mb-4"></div>
                      <p className="text-gray-600">Generating your quote...</p>
                    </div>
                  )}

                  {!isGenerating && !generatedQuote && (
                    <p className="text-gray-500 text-center">
                      Click "Generate Quote" to create a unique motivational quote
                    </p>
                  )}

                  {!isGenerating && generatedQuote && (
                    <div className="w-full">
                      <div className="bg-linear-to-br from-[#5B50E8]/10 to-purple-50 p-6 rounded-lg border-l-4 border-[#5B50E8]">
                        <p className="text-lg text-gray-900 italic leading-relaxed">
                          "{generatedQuote}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Background Generator</h3>
                <p className="text-gray-600">
                  This feature is coming soon. Stay tuned for AI-powered background image generation!
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedPage>
  );
}   