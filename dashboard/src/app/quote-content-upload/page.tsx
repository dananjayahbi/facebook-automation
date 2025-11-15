"use client";

import { useState } from "react";
import { DashboardLayout } from '@/components/layout';
import { Eye, Download, Upload, ChevronDown, ChevronUp } from "lucide-react";
import TemplateModal from "./components/TemplateModal";
import UploadCSVModal from "./components/UploadCSVModal";
import QuotesTable from "./components/QuotesTable";

export default function QuoteContentUploadPage() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false);

  const handleDownloadTemplate = () => {
    // Create CSV content
    const csvContent = `text,author,category,source,tags
"The only way to do great work is to love what you do.","Steve Jobs","Motivation","Stanford Commencement Speech","work, passion, success"
"Life is what happens when you're busy making other plans.","John Lennon","Life","Beautiful Boy","life, planning, wisdom"
"The future belongs to those who believe in the beauty of their dreams.","Eleanor Roosevelt","Inspiration","Speech","future, dreams, belief"`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'quote_upload_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadSuccess = () => {
    // Trigger refresh of the quotes table
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quote Content Upload</h1>
            <p className="text-gray-600 mt-1">Upload quotes from CSV files and manage your quote library</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Show Template
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#5B50E8] hover:bg-[#4a3fd6] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
          </div>
        </div>

        {/* Info Card - Collapsible */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg overflow-hidden">
          {/* Header - Always Visible */}
          <div
            className="p-6 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
            onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
          >
            <h3 className="text-lg font-semibold text-blue-900">How to Upload Quotes</h3>
            <button className="text-blue-600 hover:text-blue-800">
              {isInstructionsExpanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Collapsible Content */}
          {isInstructionsExpanded && (
            <div className="px-6 pb-6 pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Prepare CSV</h4>
                    <p className="text-sm text-blue-800">
                      Download the template or view the format to prepare your CSV file
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Upload File</h4>
                    <p className="text-sm text-blue-800">
                      Click "Upload CSV" and select your prepared file
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">View Results</h4>
                    <p className="text-sm text-blue-800">
                      Your quotes will appear in the table below automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quotes Table */}
        <QuotesTable refreshTrigger={refreshTrigger} />

        {/* Modals */}
        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
        />

        <UploadCSVModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
