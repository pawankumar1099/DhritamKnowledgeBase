'use client';

import React from 'react';
import { KnowledgeDocument } from '@/types/knowledgeBase';
import {
  formatBytes,
  formatDate,
  formatRelativeTime,
  getClassificationMeta,
  getFormatIconBadge,
} from '@/lib/utils';
import { Eye, Download, Trash2, Star, FileText } from 'lucide-react';

interface DocumentTableProps {
  documents: KnowledgeDocument[];
  onPreview: (doc: KnowledgeDocument) => void;
  onDownload: (doc: KnowledgeDocument) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onPreview,
  onDownload,
  onToggleStar,
  onDelete,
}) => {
  return (
    <div className="w-full bg-white border border-[#ebebeb] rounded-[10px] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#ebebeb] text-[#8f8f8f] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 font-medium w-8 text-center">★</th>
              <th className="py-3 px-3 sm:px-4 font-medium">Document Title & Filename</th>
              <th className="py-3 px-4 font-medium hidden sm:table-cell">Category</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">Classification</th>
              <th className="py-3 px-3 sm:px-4 font-medium">Format / Size</th>
              <th className="py-3 px-4 font-medium hidden lg:table-cell">Author</th>
              <th className="py-3 px-4 font-medium hidden sm:table-cell">Updated</th>
              <th className="py-3 px-3 sm:px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {documents.map((doc, idx) => {
              const classification = getClassificationMeta(doc?.classification) || {
                label: 'Internal Reference',
                bg: 'bg-blue-50 text-blue-700 border-blue-200',
                dot: 'bg-[#0070f3]',
                badge: 'INTERNAL // TEAM ONLY',
              };
              const formatBadge = getFormatIconBadge(doc?.format) || {
                label: 'FILE',
                bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
              };

              return (
                <tr
                  key={doc.id ? `${doc.id}-${idx}` : `doc-row-${idx}`}
                  className="hover:bg-[#fafafa]/80 transition-colors group cursor-pointer"
                  onClick={() => onPreview(doc)}
                >
                  <td
                    className="py-3 px-3 sm:px-4 text-center shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(doc.id);
                    }}
                  >
                    <Star
                      className={`w-3.5 h-3.5 mx-auto ${
                        doc.starred
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-[#8f8f8f] hover:text-amber-500'
                      }`}
                    />
                  </td>

                  <td className="py-3 px-3 sm:px-4 max-w-[140px] xs:max-w-[190px] sm:max-w-xs md:max-w-sm min-w-0">
                    <div className="font-semibold text-[#171717] hover:text-[#0070f3] truncate tracking-tight text-[12px] sm:text-[13px]" title={doc.title}>
                      {doc.title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#8f8f8f] font-mono truncate mt-0.5" title={doc.originalFileName}>
                      {doc.originalFileName}
                    </div>
                  </td>

                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="mono-eyebrow text-[10px] px-2 py-0.5 rounded-[4px] bg-[#fafafa] border border-[#ebebeb] text-[#4d4d4d]">
                      {doc.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border text-[10px] font-mono font-medium ${classification.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${classification.dot}`} />
                      <span>{classification.label}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 sm:px-4 font-mono text-[11px] text-[#4d4d4d] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.2 rounded border text-[9px] font-semibold ${formatBadge.bg}`}
                      >
                        {formatBadge.label}
                      </span>
                      <span>{formatBytes(doc.fileSize)}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[#4d4d4d] font-medium truncate max-w-[140px] hidden lg:table-cell">
                    {doc.author || 'Dhritam Team'}
                  </td>

                  <td className="py-3 px-4 text-[#8f8f8f] font-mono text-[11px] whitespace-nowrap hidden sm:table-cell">
                    {formatRelativeTime(doc.updatedAt)}
                  </td>

                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPreview(doc)}
                        className="btn-ghost-sm h-7 px-2"
                        title="Preview"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDownload(doc)}
                        className="btn-ghost-sm h-7 px-2"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="w-7 h-7 rounded-[6px] bg-white border border-[#ebebeb] hover:border-red-300 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#8f8f8f] transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
