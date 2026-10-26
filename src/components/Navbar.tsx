'use client';

import React from 'react';
import { Upload, Search } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenSearchPalette: () => void;
  totalDocs: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenSearchPalette,
  totalDocs,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] overflow-hidden bg-white border border-[#ebebeb] flex items-center justify-center shadow-xs select-none p-1">
            <img
              src="/logo.avif"
              alt="Dhritam Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[17px] tracking-[-0.5px] text-[#171717]">
                DHRITAM
              </span>
              <span className="mono-eyebrow px-1.5 py-0.5 rounded-[4px] bg-[#ebebeb] text-[#4d4d4d] text-[10px]">
                KNOWLEDGE BASE
              </span>
            </div>
            <span className="text-[11px] text-[#8f8f8f] -mt-0.5 tracking-tight font-medium hidden sm:inline">
              Team Documents & File System
            </span>
          </div>
        </div>

        {/* Global Quick Search Bar Button */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearchPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-[6px] bg-white border border-[#ebebeb] hover:border-[#d1d1d1] text-[#8f8f8f] hover:text-[#171717] text-xs transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#8f8f8f] group-hover:text-[#171717]" />
              <span className="text-[#8f8f8f] group-hover:text-[#4d4d4d]">
                Search documents, tags, or authors...
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] bg-[#fafafa] border border-[#ebebeb] px-1.5 py-0.5 rounded text-[#8f8f8f]">
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Primary Upload Button (Rounded 100px pill per DESIGN.md) */}
          <button
            onClick={onOpenUpload}
            className="btn-primary h-8.5 text-xs sm:text-sm px-4 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>
    </header>
  );
};
