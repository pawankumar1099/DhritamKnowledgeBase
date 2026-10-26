'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, FileText, Database, ShieldAlert, Users } from 'lucide-react';
import { DHRITAM_COMPANY, TEAM_MEMBERS } from '@/lib/constants';

interface HeroBandProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalDocuments: number;
  totalCategories: number;
  confidentialCount: number;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const HeroBand: React.FC<HeroBandProps> = ({
  searchQuery,
  onSearchChange,
  totalDocuments,
  totalCategories,
  confidentialCount,
  onToggleFilters,
  showFilters,
}) => {
  return (
    <div className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#ebebeb] overflow-hidden bg-[#fafafa]">
      {/* Multi-stop mesh gradient strictly confined to the hero per DESIGN.md */}
      <div className="hero-mesh-gradient" />

      <div className="relative z-10 max-w-[1200px] mx-auto text-center flex flex-col items-center">
        {/* Geist Mono Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#ebebeb] shadow-xs backdrop-blur-xs mb-5">
          <span className="w-2 h-2 rounded-full bg-[#0070f3] animate-pulse" />
          <span className="mono-eyebrow text-[#4d4d4d] text-[11px]">
            {DHRITAM_COMPANY.name.toUpperCase()} // INTERNAL KNOWLEDGE HUB
          </span>
          <span className="text-[#8f8f8f] text-[11px] font-mono">• {DHRITAM_COMPANY.devanagari}</span>
        </div>

        {/* Display Heading with tight -2.4px tracking */}
        <h1 className="display-xl text-[#171717] max-w-3xl mb-4 font-semibold">
          Dhritam Knowledge Base
        </h1>

        {/* Lead Subtitle */}
        <p className="body-lg max-w-2xl text-center text-[#4d4d4d] mb-8 leading-relaxed">
          Centralized engineering schematics, clinical validation dossiers, market strategies, and regulatory filings for{' '}
          <strong className="text-[#171717] font-medium">Kavach X</strong> daily-wear physiological sensing.
        </p>

        {/* Interactive Search Bar Field (6px square rounded per DESIGN.md) */}
        <div className="w-full max-w-2xl relative mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#8f8f8f] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, sensor topic, author, tags, or content..."
              className="w-full h-12 pl-10 pr-24 rounded-[6px] bg-white border border-[#ebebeb] text-[#171717] placeholder:text-[#8f8f8f] text-sm focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-14 w-6 h-6 flex items-center justify-center rounded text-[#8f8f8f] hover:text-[#171717] hover:bg-[#fafafa]"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onToggleFilters}
              className={`absolute right-2 px-2.5 py-1.5 rounded-[4px] border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                showFilters
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#4d4d4d] border-[#ebebeb] hover:bg-[#fafafa]'
              }`}
              title="Toggle advanced filters"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row (hairline cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          <div className="bg-white border border-[#ebebeb] rounded-[8px] p-3 flex items-center gap-3 shadow-xs text-left">
            <div className="w-8 h-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717]">
              <FileText className="w-4 h-4 text-[#0070f3]" />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#171717] leading-none">
                {totalDocuments}
              </div>
              <div className="text-[11px] text-[#8f8f8f] mt-1 font-medium">Saved Files</div>
            </div>
          </div>

          <div className="bg-white border border-[#ebebeb] rounded-[8px] p-3 flex items-center gap-3 shadow-xs text-left">
            <div className="w-8 h-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717]">
              <Database className="w-4 h-4 text-[#7928ca]" />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#171717] leading-none">
                {totalCategories}
              </div>
              <div className="text-[11px] text-[#8f8f8f] mt-1 font-medium">Categories</div>
            </div>
          </div>

          <div className="bg-white border border-[#ebebeb] rounded-[8px] p-3 flex items-center gap-3 shadow-xs text-left">
            <div className="w-8 h-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717]">
              <Users className="w-4 h-4 text-[#00dfd8]" />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#171717] leading-none">
                {TEAM_MEMBERS.length}
              </div>
              <div className="text-[11px] text-[#8f8f8f] mt-1 font-medium">Core Team</div>
            </div>
          </div>

          <div className="bg-white border border-[#ebebeb] rounded-[8px] p-3 flex items-center gap-3 shadow-xs text-left">
            <div className="w-8 h-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717]">
              <ShieldAlert className="w-4 h-4 text-[#ee0000]" />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#171717] leading-none">
                {confidentialCount}
              </div>
              <div className="text-[11px] text-[#8f8f8f] mt-1 font-medium">Confidential</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
