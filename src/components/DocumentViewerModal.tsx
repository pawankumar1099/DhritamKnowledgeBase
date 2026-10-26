'use client';

import React, { useState, useEffect } from 'react';
import { KnowledgeDocument } from '@/types/knowledgeBase';
import {
  formatBytes,
  formatDate,
  getClassificationMeta,
  getFormatIconBadge,
} from '@/lib/utils';
import { getFileFromIndexedDB } from '@/lib/storage';
import {
  X,
  Download,
  Star,
  Copy,
  Check,
  FileText,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  Shield,
  Clock,
  User,
  Tag,
  Maximize2,
  FolderOpen,
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: KnowledgeDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: KnowledgeDocument) => void;
  onToggleStar: (id: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onToggleStar,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');
  const [resolvedFileUrl, setResolvedFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      if (document.fileDataUrl) {
        setResolvedFileUrl(document.fileDataUrl);
      } else {
        // Try IndexedDB
        getFileFromIndexedDB(document.id).then((cached) => {
          if (cached) setResolvedFileUrl(cached);
          else setResolvedFileUrl(null);
        });
      }
    }
  }, [document]);

  if (!isOpen || !document) return null;

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

  const handleCopyContent = () => {
    const text = document.textContent || document.description;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="floating-elevated w-full max-w-4xl h-[88vh] flex flex-col rounded-[12px] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#ebebeb] bg-[#fafafa]">
          <div className="flex items-center gap-3 truncate max-w-xl">
            <span
              className={`mono-eyebrow px-2 py-0.5 rounded-[4px] border text-[10px] font-semibold shrink-0 ${formatBadge.bg}`}
            >
              {formatBadge.label}
            </span>
            <div className="truncate">
              <h2 className="text-sm font-semibold text-[#171717] truncate tracking-tight">
                {document.title}
              </h2>
              <div className="text-[11px] text-[#8f8f8f] font-mono truncate">
                {document.originalFileName} • {formatBytes(document.fileSize)} • {document.version}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStar(document.id)}
              className={`h-8 px-2.5 rounded-[6px] border flex items-center gap-1.5 transition-all cursor-pointer ${
                document.starred
                  ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs'
                  : 'bg-white border-[#ebebeb] hover:bg-[#fafafa] text-[#8f8f8f] hover:text-amber-500'
              }`}
              title={document.starred ? 'Remove Bookmark' : 'Bookmark Document'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  document.starred ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
              <span className="text-xs font-medium">
                {document.starred ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>
            <button
              onClick={() => onDownload(document)}
              className="btn-primary-sm h-8 cursor-pointer"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[6px] border border-[#ebebeb] bg-white hover:bg-[#fafafa] flex items-center justify-center text-[#8f8f8f] hover:text-[#171717] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Tabs Bar */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-[#ebebeb] bg-white text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#171717] text-white'
                  : 'text-[#4d4d4d] hover:bg-[#fafafa]'
              }`}
            >
              Document Content
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                activeTab === 'metadata'
                  ? 'bg-[#171717] text-white'
                  : 'text-[#4d4d4d] hover:bg-[#fafafa]'
              }`}
            >
              Technical Metadata
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border text-[10px] font-mono font-medium ${classification.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${classification.dot}`} />
              <span>{classification.label}</span>
            </span>
          </div>
        </div>

        {/* Viewer Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#fafafa]">
          {activeTab === 'content' ? (
            <div className="max-w-3xl mx-auto">
              {/* MARKDOWN / TEXT / CODE VIEWER */}
              {(document.format === 'markdown' ||
                document.format === 'text' ||
                document.format === 'code') && (
                <div className="bg-white border border-[#ebebeb] rounded-[8px] p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebebeb]">
                    <div className="mono-eyebrow text-[11px] text-[#8f8f8f]">
                      PARSED FILE PREVIEW // {document.originalFileName}
                    </div>
                    <button
                      onClick={handleCopyContent}
                      className="btn-ghost-sm h-7 text-xs flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Raw Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="prose prose-sm max-w-none text-[#171717] whitespace-pre-wrap font-mono text-[13px] leading-relaxed select-text">
                    {document.textContent ||
                      document.contentSnippet ||
                      document.description}
                  </div>
                </div>
              )}

              {/* IMAGE VIEWER */}
              {document.format === 'image' && (
                <div className="bg-white border border-[#ebebeb] rounded-[8px] p-6 shadow-xs text-center flex flex-col items-center justify-center">
                  {resolvedFileUrl ? (
                    <img
                      src={resolvedFileUrl}
                      alt={document.title}
                      className="max-h-[500px] object-contain rounded-[6px] border border-[#ebebeb]"
                    />
                  ) : (
                    <div className="p-12 text-[#8f8f8f] flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 mb-3 stroke-[1.5]" />
                      <p className="text-sm font-medium text-[#171717]">
                        Image Asset Indexed
                      </p>
                      <p className="text-xs text-[#8f8f8f] mt-1 font-mono">
                        {document.originalFileName} ({formatBytes(document.fileSize)})
                      </p>
                      <button
                        onClick={() => onDownload(document)}
                        className="btn-primary-sm mt-4"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Download Image Asset
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PDF VIEWER */}
              {document.format === 'pdf' && (
                <div className="bg-white border border-[#ebebeb] rounded-[8px] p-4 sm:p-5 shadow-xs">
                  {resolvedFileUrl ? (
                    <div className="flex flex-col gap-3">
                      {/* PDF Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ebebeb]">
                        <div className="flex items-center gap-2">
                          <span className="mono-eyebrow text-[11px] text-[#4d4d4d] flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            INTERACTIVE PDF VIEWER // {document.originalFileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={resolvedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost-sm h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer hover:text-[#0070f3]"
                            title="Open in new window"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Fullscreen</span>
                          </a>
                          <button
                            onClick={() => onDownload(document)}
                            className="btn-primary-sm h-8 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>

                      {/* Embedded Interactive PDF Viewer */}
                      <div className="relative w-full h-[68vh] rounded-[6px] overflow-hidden border border-[#ebebeb] bg-[#fafafa]">
                        <iframe
                          src={`${resolvedFileUrl}#toolbar=1&navpanes=1`}
                          className="w-full h-full border-0"
                          title={document.title}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-[8px] bg-red-50 border border-red-200 flex items-center justify-center text-[#ee0000] mb-4">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-semibold text-[#171717] mb-1">
                        {document.title}
                      </h4>
                      <p className="text-xs text-[#8f8f8f] font-mono mb-4">
                        PDF Document • {formatBytes(document.fileSize)} • Version {document.version}
                      </p>
                      <div className="max-w-md bg-[#fafafa] border border-[#ebebeb] rounded-[6px] p-4 text-xs text-[#4d4d4d] text-left mb-6 leading-relaxed">
                        <p className="font-semibold text-[#171717] mb-1">Document Abstract:</p>
                        <p>{document.description}</p>
                      </div>
                      <button
                        onClick={() => onDownload(document)}
                        className="btn-primary h-9 text-xs px-5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Abstract & Details</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* WORD / OFFICE / BINARY DOCUMENTS */}
              {(document.format === 'docx' ||
                document.format === 'doc' ||
                document.format === 'spreadsheet' ||
                document.format === 'archive' ||
                document.format === 'audio' ||
                document.format === 'video' ||
                document.format === 'other') && (
                <div className="bg-white border border-[#ebebeb] rounded-[8px] p-5 shadow-xs">
                  {resolvedFileUrl && resolvedFileUrl.startsWith('http') ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ebebeb]">
                        <span className="mono-eyebrow text-[11px] text-[#4d4d4d] flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#0070f3] animate-pulse" />
                          DOCUMENT PREVIEW // {document.originalFileName}
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={resolvedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost-sm h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer hover:text-[#0070f3]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in Browser</span>
                          </a>
                          <button
                            onClick={() => onDownload(document)}
                            className="btn-primary-sm h-8 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Original ({formatBytes(document.fileSize)})</span>
                          </button>
                        </div>
                      </div>

                      <div className="relative w-full h-[65vh] rounded-[6px] overflow-hidden border border-[#ebebeb] bg-[#fafafa]">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolvedFileUrl)}&embedded=true`}
                          className="w-full h-full border-0"
                          title={document.title}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717] mb-4">
                        <FolderOpen className="w-8 h-8 text-[#0070f3]" />
                      </div>
                      <h4 className="text-lg font-semibold text-[#171717] mb-1 tracking-tight">
                        {document.title}
                      </h4>
                      <p className="text-xs text-[#8f8f8f] font-mono mb-6">
                        {document.originalFileName} • {formatBytes(document.fileSize)} • Format: {document.format.toUpperCase()}
                      </p>

                      <div className="w-full max-w-lg bg-[#fafafa] border border-[#ebebeb] rounded-[8px] p-4 text-xs text-left mb-6 space-y-2">
                        <div className="flex justify-between border-b border-[#ebebeb] pb-2">
                          <span className="text-[#8f8f8f]">Category Domain:</span>
                          <span className="font-medium text-[#171717] uppercase font-mono">
                            {document.category}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-[#ebebeb] pb-2">
                          <span className="text-[#8f8f8f]">Classification:</span>
                          <span className="font-medium text-[#171717]">
                            {classification.label}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-[#ebebeb] pb-2">
                          <span className="text-[#8f8f8f]">Author:</span>
                          <span className="font-medium text-[#171717]">
                            {document.author || 'Dhritam Team'}
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="text-[#8f8f8f] block mb-1">Executive Summary:</span>
                          <p className="text-[#4d4d4d] leading-relaxed">
                            {document.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onDownload(document)}
                        className="btn-primary h-10 px-6 text-xs shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Original File ({formatBytes(document.fileSize)})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TECHNICAL METADATA TAB */
            <div className="max-w-2xl mx-auto bg-white border border-[#ebebeb] rounded-[8px] p-6 shadow-xs">
              <h3 className="heading-md text-base text-[#171717] font-semibold mb-4 pb-2 border-b border-[#ebebeb]">
                Technical File Metadata & Provenance
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Document ID</span>
                  <span className="col-span-2 font-mono text-[#171717]">{document.id}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Original Filename</span>
                  <span className="col-span-2 font-mono text-[#171717]">{document.originalFileName}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">File Size</span>
                  <span className="col-span-2 text-[#171717]">
                    {formatBytes(document.fileSize)} ({document.fileSize.toLocaleString()} bytes)
                  </span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">MIME Type</span>
                  <span className="col-span-2 font-mono text-[#171717]">{document.fileType}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Classification</span>
                  <span className="col-span-2 font-medium text-[#171717]">
                    {classification.badge}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Author / Lead</span>
                  <span className="col-span-2 text-[#171717]">
                    {document.author || 'Dhritam Team'}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Created Timestamp</span>
                  <span className="col-span-2 text-[#171717]">{formatDate(document.createdAt)}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Last Modified</span>
                  <span className="col-span-2 text-[#171717]">{formatDate(document.updatedAt)}</span>
                </div>
                <div className="grid grid-cols-3 py-2 border-b border-[#ebebeb]">
                  <span className="text-[#8f8f8f] font-mono">Topic Tags</span>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {document.topicTags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#fafafa] border border-[#ebebeb] text-[#4d4d4d] font-mono text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 py-2">
                  <span className="text-[#8f8f8f] font-mono">Engagement</span>
                  <span className="col-span-2 text-[#171717] font-mono">
                    {document.viewCount} Views • {document.downloadCount} Downloads
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
