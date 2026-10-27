'use client';

import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeDocument, DhritamCategory } from '@/types/knowledgeBase';
import { CATEGORIES } from '@/lib/constants';
import { getFormatIconBadge } from '@/lib/utils';
import {
  Search,
  Upload,
  FileText,
  Layers,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  documents: KnowledgeDocument[];
  onSelectDocument: (doc: KnowledgeDocument) => void;
  onOpenUpload: () => void;
  onSelectCategory: (cat: DhritamCategory) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDocument,
  onOpenUpload,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = documents
    .filter(
      (d) =>
        (d.title || '').toLowerCase().includes(query.toLowerCase()) ||
        (d.originalFileName || '').toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(d.topicTags) &&
          d.topicTags.some((t) => t && String(t).toLowerCase().includes(query.toLowerCase()))) ||
        (d.author || '').toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const filteredCategories = CATEGORIES.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) && c.id !== 'all'
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="floating-elevated w-full max-w-xl rounded-[12px] bg-white overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[#ebebeb] bg-white">
          <Search className="w-4 h-4 text-[#8f8f8f] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search documents, topics, authors..."
            className="w-full h-12 px-3 text-sm text-[#171717] placeholder:text-[#8f8f8f] focus:outline-none"
          />
          <kbd className="mono-eyebrow text-[10px] text-[#8f8f8f] bg-[#fafafa] border border-[#ebebeb] px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 text-xs">
          {/* Quick Actions */}
          {!query && (
            <div className="mb-2">
              <div className="mono-eyebrow text-[10px] text-[#8f8f8f] px-3 py-1.5">
                QUICK ACTIONS
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[#fafafa] text-[#171717] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-3.5 h-3.5 text-[#0070f3]" />
                  <span className="font-medium">Upload New Document / File</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#8f8f8f]" />
              </button>
            </div>
          )}

          {/* Matched Documents */}
          {filteredDocs.length > 0 && (
            <div className="mb-2">
              <div className="mono-eyebrow text-[10px] text-[#8f8f8f] px-3 py-1.5">
                MATCHED DOCUMENTS ({filteredDocs.length})
              </div>
              {filteredDocs.map((doc, idx) => {
                const badge = getFormatIconBadge(doc?.format) || {
                  label: 'FILE',
                  bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                };
                return (
                  <button
                    key={doc.id ? `${doc.id}-${idx}` : `cmd-doc-${idx}`}
                    onClick={() => {
                      onClose();
                      onSelectDocument(doc);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[#fafafa] text-left cursor-pointer group gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <span
                        className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border shrink-0 ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#171717] truncate group-hover:text-[#0070f3]" title={doc.title}>
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-[#8f8f8f] font-mono truncate flex items-center gap-1.5" title={doc.originalFileName}>
                          <span className="truncate">{doc.originalFileName}</span>
                          <span className="shrink-0">• {doc.author}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8f8f8f] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matched Categories */}
          {filteredCategories.length > 0 && (
            <div>
              <div className="mono-eyebrow text-[10px] text-[#8f8f8f] px-3 py-1.5">
                CATEGORIES
              </div>
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onClose();
                    onSelectCategory(cat.id);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[#fafafa] text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-3.5 h-3.5 text-[#0070f3]" />
                    <span className="font-medium text-[#171717]">{cat.name}</span>
                  </div>
                  <span className="mono-eyebrow text-[10px] text-[#8f8f8f]">
                    FILTER BY TOPIC
                  </span>
                </button>
              ))}
            </div>
          )}

          {query && filteredDocs.length === 0 && filteredCategories.length === 0 && (
            <div className="p-8 text-center text-[#8f8f8f]">
              <p className="text-sm font-medium text-[#171717] mb-1">
                No matching documents or topics
              </p>
              <p className="text-xs">
                Try searching for "ECG", "Kavach", "Patent", "BLE", or "Sahil"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#fafafa] border-t border-[#ebebeb] flex items-center justify-between text-[11px] text-[#8f8f8f] font-mono">
          <span>Search Dhritam Knowledge Base</span>
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
