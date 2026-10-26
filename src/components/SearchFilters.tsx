'use client';

import React from 'react';
import {
  ClassificationLevel,
  FileFormatType,
  SortOption,
} from '@/types/knowledgeBase';
import { TEAM_MEMBERS } from '@/lib/constants';
import {
  RotateCcw,
  LayoutGrid,
  List,
  Check,
  FileCode,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Music,
  Video,
} from 'lucide-react';

interface SearchFiltersProps {
  selectedFormat: FileFormatType | 'all';
  onSelectFormat: (format: FileFormatType | 'all') => void;
  selectedClassification: ClassificationLevel | 'all';
  onSelectClassification: (level: ClassificationLevel | 'all') => void;
  selectedAuthor: string;
  onSelectAuthor: (author: string) => void;
  sortBy: SortOption;
  onSelectSort: (sort: SortOption) => void;
  viewMode: 'grid' | 'table';
  onChangeViewMode: (mode: 'grid' | 'table') => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedFormat,
  onSelectFormat,
  selectedClassification,
  onSelectClassification,
  selectedAuthor,
  onSelectAuthor,
  sortBy,
  onSelectSort,
  viewMode,
  onChangeViewMode,
  onResetFilters,
  activeFilterCount,
}) => {
  const formats: { id: FileFormatType | 'all'; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All Formats' },
    { id: 'pdf', label: 'PDF Documents' },
    { id: 'docx', label: 'Word (DOCX)' },
    { id: 'markdown', label: 'Markdown (.md)' },
    { id: 'image', label: 'Images & SVGs' },
    { id: 'code', label: 'Code & Schematics' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'audio', label: 'Audio' },
    { id: 'video', label: 'Video' },
  ];

  return (
    <div className="w-full bg-white border border-[#ebebeb] rounded-[10px] p-4 shadow-xs mb-6 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#ebebeb]">
        <div className="flex items-center gap-2">
          <span className="mono-eyebrow text-[#4d4d4d] text-[11px]">
            ADVANCED QUERY FILTERS
          </span>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#171717] text-white">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-xs text-[#8f8f8f] hover:text-[#171717] flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all
            </button>
          )}

          {/* Layout Grid / Table Toggle (6px rounded buttons per DESIGN.md) */}
          <div className="flex items-center p-0.5 bg-[#fafafa] border border-[#ebebeb] rounded-[6px]">
            <button
              onClick={() => onChangeViewMode('grid')}
              className={`p-1 rounded-[4px] transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#8f8f8f] hover:text-[#171717]'
              }`}
              title="Grid cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewMode('table')}
              className={`p-1 rounded-[4px] transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#8f8f8f] hover:text-[#171717]'
              }`}
              title="Dense table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3.5">
        {/* Format Selector */}
        <div>
          <label className="label-sm text-[#4d4d4d] block mb-1.5 text-xs">
            File Format / Type
          </label>
          <select
            value={selectedFormat}
            onChange={(e) => onSelectFormat(e.target.value as FileFormatType | 'all')}
            className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717] transition-all cursor-pointer"
          >
            {formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Classification Level Filter */}
        <div>
          <label className="label-sm text-[#4d4d4d] block mb-1.5 text-xs">
            Classification & Access
          </label>
          <select
            value={selectedClassification}
            onChange={(e) =>
              onSelectClassification(e.target.value as ClassificationLevel | 'all')
            }
            className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717] transition-all cursor-pointer"
          >
            <option value="all">All Classifications</option>
            <option value="confidential">Confidential (Internal Secret)</option>
            <option value="internal">Internal Reference Only</option>
            <option value="public">Public / Distributable</option>
          </select>
        </div>

        {/* Author Filter */}
        <div>
          <label className="label-sm text-[#4d4d4d] block mb-1.5 text-xs">
            Author / Contributor
          </label>
          <select
            value={selectedAuthor}
            onChange={(e) => onSelectAuthor(e.target.value)}
            className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717] transition-all cursor-pointer"
          >
            <option value="all">All Team Members</option>
            {TEAM_MEMBERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="label-sm text-[#4d4d4d] block mb-1.5 text-xs">
            Sort Order
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value as SortOption)}
            className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717] transition-all cursor-pointer"
          >
            <option value="latest">Latest Updated First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Title: A to Z</option>
            <option value="name-desc">Title: Z to A</option>
            <option value="size-desc">File Size: Largest First</option>
            <option value="size-asc">File Size: Smallest First</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
