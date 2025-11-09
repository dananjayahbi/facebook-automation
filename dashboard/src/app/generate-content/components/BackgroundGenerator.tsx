"use client";

import { Image } from 'lucide-react';

export function BackgroundGenerator() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div className="text-center">
        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Background Generator</h3>
        <p className="text-gray-600">
          This feature is coming soon. Stay tuned for AI-powered background image generation!
        </p>
      </div>
    </div>
  );
}
