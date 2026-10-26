'use client';

import React, { useState, useRef } from 'react';
import {
  DhritamCategory,
  ClassificationLevel,
  KnowledgeDocument,
} from '@/types/knowledgeBase';
import { CATEGORIES, TEAM_MEMBERS } from '@/lib/constants';
import { detectFileFormat, formatBytes } from '@/lib/utils';
import {
  uploadFileToFirebaseStorage,
  syncDocumentToFirestore,
  isFirebaseConfigured,
} from '@/lib/firebase';
import {
  uploadFileToCloudinary,
  isCloudinaryConfigured,
} from '@/lib/cloudinary';
import {
  X,
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Tag,
  Shield,
  User,
  Sparkles,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: (doc: KnowledgeDocument, fileDataUrl?: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<DhritamCategory, 'all'>>('hardware');
  const [topicTags, setTopicTags] = useState('');
  const [author, setAuthor] = useState(TEAM_MEMBERS[0]);
  const [classification, setClassification] = useState<ClassificationLevel>('internal');
  const [version, setVersion] = useState('v1.0');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    setError(null);
    if (!title) {
      // Clean title from filename
      const clean = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(clean);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop a file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a document title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const format = detectFileFormat(selectedFile.name, selectedFile.type);
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Parse tags
      const tagsArray = topicTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Read file content or dataUrl for instant in-app preview
      let fileDataUrl: string | undefined = undefined;
      let textContent: string | undefined = undefined;

      // If text/markdown/code/json, read text
      if (
        format === 'markdown' ||
        format === 'text' ||
        format === 'code' ||
        selectedFile.type.startsWith('text/') ||
        selectedFile.name.endsWith('.md') ||
        selectedFile.name.endsWith('.txt') ||
        selectedFile.name.endsWith('.json')
      ) {
        try {
          textContent = await selectedFile.text();
        } catch {
          // ignore
        }
      }

      // Read as DataURL for previewing in-app (PDF, images, audio, video)
      if (selectedFile.size < 15 * 1024 * 1024) {
        // under 15MB
        fileDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      const getAuthorRole = (name: string) => {
        if (name.includes('Sahil')) return 'Founder & CEO';
        if (name.includes('Shubham')) return 'Chief Hardware Engineer';
        if (name.includes('Nikhil')) return 'Head of Finance';
        if (name.includes('Pawan')) return 'Chief Web & App Developer';
        if (name.includes('Ritika')) return 'Chief Designer';
        return 'Core Team';
      };
      const authorRole = getAuthorRole(author);

      let cloudFileUrl: string | undefined = undefined;

      // 1. Try Cloudinary first (100% Free, NO credit card needed)
      if (isCloudinaryConfigured()) {
        try {
          const cUrl = await uploadFileToCloudinary(selectedFile, `dhritam_kb/${category}`);
          if (cUrl) {
            cloudFileUrl = cUrl;
          }
        } catch (cErr) {
          console.warn('Cloudinary upload error:', cErr);
        }
      }

      // 2. Fallback to Firebase Storage if Cloudinary is not configured or failed
      if (!cloudFileUrl && isFirebaseConfigured()) {
        try {
          const remoteUrl = await uploadFileToFirebaseStorage(
            selectedFile,
            `dhritam_kb/${category}`
          );
          if (remoteUrl) {
            cloudFileUrl = remoteUrl;
          }
        } catch (fbErr) {
          console.warn('Firebase upload fallback to local storage:', fbErr);
        }
      }

      const newDoc: KnowledgeDocument = {
        id: docId,
        title: title.trim(),
        originalFileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type || 'application/octet-stream',
        format,
        category,
        topicTags: tagsArray.length > 0 ? tagsArray : ['General'],
        author,
        authorRole,
        classification,
        version: version.trim() || 'v1.0',
        description: description.trim() || `Uploaded ${selectedFile.name} on ${new Date().toLocaleDateString()}`,
        contentSnippet: textContent ? textContent.slice(0, 240) : description.trim(),
        textContent,
        fileDataUrl: cloudFileUrl || fileDataUrl,
        storagePath: cloudFileUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 1,
        downloadCount: 0,
        starred: false,
        syncedToFirebase: !!cloudFileUrl,
      };

      // Sync document metadata to Firestore if configured
      if (isFirebaseConfigured()) {
        await syncDocumentToFirestore(newDoc);
      }

      onDocumentUploaded(newDoc, fileDataUrl);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="floating-elevated w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[12px] bg-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#ebebeb] sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#171717] text-white flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="heading-md text-[17px] text-[#171717] font-semibold">
                Upload to Knowledge Base
              </h2>
              <p className="mono-eyebrow text-[10px] text-[#8f8f8f]">
                ANY FORMAT // PDF, DOCX, MD, CODE, IMAGE, DATA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[6px] border border-[#ebebeb] hover:bg-[#fafafa] flex items-center justify-center text-[#8f8f8f] hover:text-[#171717] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop File Surface */}
          <div>
            <label className="label-sm text-[#171717] block mb-1 text-xs">
              File Attachment <span className="text-[#ee0000]">*</span>
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[8px] p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#0070f3] bg-[#0070f3]/5'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-[#ebebeb] hover:border-[#171717] bg-[#fafafa]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-[6px] bg-white border border-[#ebebeb] flex items-center justify-center text-[#0070f3]">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#171717] truncate max-w-xs">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-[#8f8f8f] font-mono mt-0.5">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || 'Custom file'}
                    </div>
                  </div>
                  <span className="mono-eyebrow text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded ml-2">
                    READY
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-[#8f8f8f] mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-[#171717]">
                    Click to browse or drag and drop your file here
                  </p>
                  <p className="text-[11px] text-[#8f8f8f] mt-1 font-mono">
                    Supports PDF, DOCX, Markdown, Images, Audio, Video, Code, CSV up to 50MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label-sm text-[#171717] block mb-1 text-xs">
              Document Title <span className="text-[#ee0000]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kavach-X PCB Revision 2.4 Sensor Routing Specification"
              className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
              required
            />
          </div>

          {/* Category & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm text-[#171717] block mb-1 text-xs">
                Category / Domain <span className="text-[#ee0000]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exclude<DhritamCategory, 'all'>)
                }
                className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-sm text-[#171717] block mb-1 text-xs">
                Classification & Confidentiality
              </label>
              <select
                value={classification}
                onChange={(e) =>
                  setClassification(e.target.value as ClassificationLevel)
                }
                className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
              >
                <option value="confidential">Confidential (Restricted)</option>
                <option value="internal">Internal Reference Only</option>
                <option value="public">Public / Distributable</option>
              </select>
            </div>
          </div>

          {/* Author & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm text-[#171717] block mb-1 text-xs">
                Author / Lead
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
              >
                {TEAM_MEMBERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-sm text-[#171717] block mb-1 text-xs">
                Version Tag
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0, v2.1-draft"
                className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          {/* Topic Tags */}
          <div>
            <label className="label-sm text-[#171717] block mb-1 text-xs">
              Topic Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={topicTags}
              onChange={(e) => setTopicTags(e.target.value)}
              placeholder="e.g., ECG, Firmware, BLE, PCB, Noise Filtering"
              className="w-full h-9 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-sm text-[#171717] block mb-1 text-xs">
              Summary / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context on what this document specifies, key findings, or usage notes for team members..."
              className="w-full p-2.5 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] text-xs focus:outline-none focus:border-[#171717]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost-sm h-8.5 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary h-8.5 text-xs px-5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save & Index File
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
