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
import {
  FileText,
  Download,
  Eye,
  Star,
  Trash2,
  Tag,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';

interface DocumentCardProps {
  document: KnowledgeDocument;
  onPreview: (doc: KnowledgeDocument) => void;
  onDownload: (doc: KnowledgeDocument) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
  onToggleStar,
  onDelete,
}) => {
  const classification = getClassificationMeta(document?.classification) || {
    label: 'Internal Reference',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-[#0070f3]',
    badge: 'INTERNAL // TEAM ONLY',
  };
  const formatBadge = getFormatIconBadge(document?.format) || {
    label: 'FILE',
    bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  return (
    <div
      onClick={() => onPreview(document)}
      className="feature-card p-5 flex flex-col justify-between group hover:border-[#171717]/40 hover:shadow-md transition-all cursor-pointer"
    >
      <div>
        {/* Card Topline: Format Badge, Classification Badge, Star Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`mono-eyebrow px-2 py-0.5 rounded-[4px] border text-[10px] font-semibold ${formatBadge.bg}`}
            >
              {formatBadge.label}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] border flex items-center gap-1.5 font-medium ${classification.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${classification.dot}`} />
              <span className="truncate max-w-[120px]">{classification.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(document.id);
              }}
              className="p-1 rounded text-[#8f8f8f] hover:text-amber-500 transition-colors cursor-pointer"
              title={document.starred ? 'Starred' : 'Star document'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  document.starred ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
            </button>
            <span className="mono-eyebrow text-[10px] text-[#8f8f8f]">
              {document.version}
            </span>
          </div>
        </div>

        {/* Title (Geist heading-md tracking -0.4px) */}
        <h3
          className="text-[16px] font-semibold text-[#171717] tracking-[-0.4px] line-clamp-2 leading-snug mb-1.5 group-hover:text-[#0070f3] transition-colors break-words [overflow-wrap:anywhere]"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Filename sub-line */}
        {document.originalFileName && (
          <div
            className="text-[11px] text-[#8f8f8f] font-mono truncate mb-2.5 flex items-center gap-1.5 min-w-0"
            title={document.originalFileName}
          >
            <FileText className="w-3 h-3 shrink-0 text-[#8f8f8f]" />
            <span className="truncate">{document.originalFileName}</span>
          </div>
        )}

        {/* Description Snippet */}
        <p className="body-md text-xs text-[#4d4d4d] line-clamp-3 mb-4 leading-relaxed">
          {document.description}
        </p>

        {/* Topic Tags */}
        {document.topicTags && document.topicTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {document.topicTags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#fafafa] border border-[#ebebeb] text-[#4d4d4d] font-mono"
              >
                #{tag}
              </span>
            ))}
            {document.topicTags.length > 3 && (
              <span className="text-[10px] text-[#8f8f8f] self-center">
                +{document.topicTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Metadata Footer: Author, Size, Date */}
        <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between text-xs text-[#8f8f8f] mb-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
            <div className="w-4 h-4 rounded-full bg-[#171717] text-white text-[9px] font-medium flex items-center justify-center shrink-0">
              {(document.author || 'D').charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-[#4d4d4d] font-medium">{document.author || 'Dhritam Team'}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
            <span>{formatBytes(document.fileSize)}</span>
            <span>•</span>
            <span title={formatDate(document.updatedAt)}>
              {formatRelativeTime(document.updatedAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons (6px rounded buttons per DESIGN.md) */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(document);
            }}
            className="flex-1 btn-primary-sm h-8 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View & Preview</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(document);
            }}
            className="btn-ghost-sm h-8 px-2.5 cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(document.id);
            }}
            className="w-8 h-8 rounded-[6px] bg-white border border-[#ebebeb] hover:border-red-300 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#8f8f8f] transition-all cursor-pointer"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
