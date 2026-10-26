'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DhritamCategory,
  ClassificationLevel,
  FileFormatType,
  KnowledgeDocument,
  SortOption,
} from '@/types/knowledgeBase';
import {
  getStoredDocuments,
  saveDocumentLocally,
  deleteDocumentLocally,
  toggleStarLocally,
  incrementViewCountLocally,
  incrementDownloadCountLocally,
} from '@/lib/storage';
import {
  isFirebaseConfigured,
  fetchDocumentsFromFirestore,
  deleteDocumentFromFirestore,
  updateDocumentInFirestore,
} from '@/lib/firebase';
import { DHRITAM_COMPANY, CATEGORIES } from '@/lib/constants';
import { Navbar } from '@/components/Navbar';
import { HeroBand } from '@/components/HeroBand';
import { CategoryPills } from '@/components/CategoryPills';
import { SearchFilters } from '@/components/SearchFilters';
import { DocumentCard } from '@/components/DocumentCard';
import { DocumentTable } from '@/components/DocumentTable';
import { UploadModal } from '@/components/UploadModal';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';
import { CommandPalette } from '@/components/CommandPalette';
import {
  Search,
  Upload,
  UploadCloud,
  BookOpen,
  FolderOpen,
  Sparkles,
  Layers,
  ArrowUpRight,
  Shield,
  Heart,
} from 'lucide-react';

export default function HomePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DhritamCategory>('all');
  const [selectedFormat, setSelectedFormat] = useState<FileFormatType | 'all'>('all');
  const [selectedClassification, setSelectedClassification] = useState<ClassificationLevel | 'all'>('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
    setIsFirebaseActive(isFirebaseConfigured());

    // Listen for Ctrl+K / Cmd+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sanitizeDoc = (d: Partial<KnowledgeDocument> | any, idx: number, prefix: string): KnowledgeDocument => ({
    id: d.id || `${prefix}-${Date.now()}-${idx}`,
    title: d.title || d.originalFileName || 'Untitled Document',
    originalFileName: d.originalFileName || 'document',
    fileSize: typeof d.fileSize === 'number' ? d.fileSize : 0,
    fileType: d.fileType || 'application/octet-stream',
    format: d.format || 'other',
    category: d.category || 'hardware',
    topicTags: Array.isArray(d.topicTags) ? d.topicTags : [],
    author: d.author || 'Dhritam Team',
    authorRole: d.authorRole,
    classification: d.classification || 'internal',
    version: d.version || 'v1.0',
    description: d.description || '',
    contentSnippet: d.contentSnippet || '',
    textContent: d.textContent,
    fileDataUrl: d.fileDataUrl,
    storagePath: d.storagePath,
    createdAt: d.createdAt || new Date().toISOString(),
    updatedAt: d.updatedAt || new Date().toISOString(),
    viewCount: typeof d.viewCount === 'number' ? d.viewCount : 0,
    downloadCount: typeof d.downloadCount === 'number' ? d.downloadCount : 0,
    starred: !!d.starred,
    syncedToFirebase: !!d.syncedToFirebase,
  });

  const loadDocuments = async () => {
    const rawLocal = getStoredDocuments();
    const seen = new Set<string>();
    const local: KnowledgeDocument[] = [];
    rawLocal.forEach((d, idx) => {
      const sanitized = sanitizeDoc(d, idx, 'local');
      if (!seen.has(sanitized.id)) {
        seen.add(sanitized.id);
        local.push(sanitized);
      }
    });

    setDocuments(local);

    // If Firebase configured, fetch and merge cloud docs
    if (isFirebaseConfigured()) {
      try {
        const cloudDocs = await fetchDocumentsFromFirestore();
        if (cloudDocs.length > 0) {
          const map = new Map<string, KnowledgeDocument>();
          local.forEach((d) => map.set(d.id, d));
          cloudDocs.forEach((d, idx) => {
            const sanitized = sanitizeDoc(d, idx, 'cloud');
            map.set(sanitized.id, sanitized);
          });
          const merged = Array.from(map.values());
          setDocuments(merged);
        }
      } catch (err) {
        console.warn('Could not sync with Firestore, using local data', err);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Count documents per category
  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = documents.filter((d) => (d.category || 'hardware') === cat.id).length;
      }
    });
    return counts;
  }, [documents]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFormat !== 'all') count++;
    if (selectedClassification !== 'all') count++;
    if (selectedAuthor !== 'all') count++;
    if (sortBy !== 'latest') count++;
    return count;
  }, [selectedFormat, selectedClassification, selectedAuthor, sortBy]);

  // Filtered & Sorted Documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search query across title, description, filename, tags, author, and category
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (doc.title || '').toLowerCase().includes(q);
          const matchFilename = (doc.originalFileName || '').toLowerCase().includes(q);
          const matchDesc = (doc.description || '').toLowerCase().includes(q);
          const matchAuthor = (doc.author || '').toLowerCase().includes(q);
          const matchCategory = (doc.category || '').toLowerCase().includes(q);
          const matchTags =
            Array.isArray(doc.topicTags) &&
            doc.topicTags.some((t) => t && String(t).toLowerCase().includes(q));
          if (!matchTitle && !matchFilename && !matchDesc && !matchAuthor && !matchCategory && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && (doc.category || 'hardware') !== selectedCategory) {
          return false;
        }

        // Format filter
        if (selectedFormat !== 'all' && (doc.format || 'other') !== selectedFormat) {
          return false;
        }

        // Classification filter
        if (selectedClassification !== 'all' && (doc.classification || 'internal') !== selectedClassification) {
          return false;
        }

        // Author filter
        if (selectedAuthor !== 'all' && (doc.author || 'Dhritam Team') !== selectedAuthor) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'latest':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          case 'oldest':
            return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          case 'size-desc':
            return b.fileSize - a.fileSize;
          case 'size-asc':
            return a.fileSize - b.fileSize;
          case 'views':
            return (b.viewCount || 0) - (a.viewCount || 0);
          default:
            return 0;
        }
      });
  }, [
    documents,
    searchQuery,
    selectedCategory,
    selectedFormat,
    selectedClassification,
    selectedAuthor,
    sortBy,
  ]);

  const handleDocumentUploaded = (doc: KnowledgeDocument, fileDataUrl?: string) => {
    const updated = saveDocumentLocally(doc, fileDataUrl);
    setDocuments(updated);
    showToast(`"${doc.title}" saved & indexed successfully!`);
  };

  const handlePreviewDocument = async (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setIsViewerOpen(true);
    const updated = incrementViewCountLocally(doc.id);
    setDocuments(updated);
    if (isFirebaseConfigured()) {
      const target = updated.find((d) => d.id === doc.id);
      if (target) {
        await updateDocumentInFirestore(doc.id, { viewCount: target.viewCount });
      }
    }
  };

  const handleDownloadDocument = async (doc: KnowledgeDocument) => {
    const updated = incrementDownloadCountLocally(doc.id);
    setDocuments(updated);
    if (isFirebaseConfigured()) {
      const target = updated.find((d) => d.id === doc.id);
      if (target) {
        await updateDocumentInFirestore(doc.id, { downloadCount: target.downloadCount });
      }
    }

    // If data URL exists (Cloudinary, Firebase Storage, or DataURL)
    if (doc.fileDataUrl) {
      let downloadUrl = doc.fileDataUrl;
      // Add fl_attachment for Cloudinary to force direct download
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }

      try {
        const res = await fetch(downloadUrl);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = doc.originalFileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          showToast(`Downloaded "${doc.originalFileName}"`);
          return;
        } else if (res.status === 401) {
          showToast(`Cloudinary 401: Enable "PDF and ZIP delivery" in Cloudinary Settings > Security`);
        }
      } catch {
        // Fallback below
      }

      // Direct fallback
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = doc.originalFileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloading "${doc.originalFileName}"`);
      return;
    }

    // If it's text content, create blob download
    const content = doc.textContent || doc.description || 'Dhritam Document';
    const blob = new Blob([content], { type: doc.fileType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.originalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloading "${doc.originalFileName}"`);
  };

  const handleToggleStar = async (id: string) => {
    const updated = toggleStarLocally(id);
    setDocuments(updated);
    setSelectedDoc((prev) => (prev && prev.id === id ? { ...prev, starred: !prev.starred } : prev));
    if (isFirebaseConfigured()) {
      const target = updated.find((d) => d.id === id);
      if (target) {
        await updateDocumentInFirestore(id, { starred: target.starred });
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    if (confirm(`Are you sure you want to delete "${doc.title}" from the knowledge base?`)) {
      const updated = deleteDocumentLocally(id);
      setDocuments(updated);
      if (isFirebaseConfigured()) {
        await deleteDocumentFromFirestore(id);
      }
      showToast(`Document "${doc.title}" deleted.`);
    }
  };

  const handleResetFilters = () => {
    setSelectedFormat('all');
    setSelectedClassification('all');
    setSelectedAuthor('all');
    setSortBy('latest');
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 floating-elevated px-4 py-2.5 rounded-[6px] bg-[#171717] text-white text-xs font-medium flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Nav Bar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSearchPalette={() => setIsCommandPaletteOpen(true)}
        totalDocs={documents.length}
      />

      {/* Hero Band with Mesh Gradient Bloom */}
      <HeroBand
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalDocuments={documents.length}
        totalCategories={CATEGORIES.length - 1}
        confidentialCount={documents.filter((d) => d.classification === 'confidential').length}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        showFilters={showFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills Switcher */}
        <div className="mb-6">
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            documentCounts={documentCounts}
          />
        </div>

        {/* Search Filters Accordion */}
        {showFilters && (
          <SearchFilters
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            selectedClassification={selectedClassification}
            onSelectClassification={setSelectedClassification}
            selectedAuthor={selectedAuthor}
            onSelectAuthor={setSelectedAuthor}
            sortBy={sortBy}
            onSelectSort={setSortBy}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Section Header & View Info */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#ebebeb]">
          <div className="flex items-center gap-2">
            <span className="heading-md text-base text-[#171717] font-semibold">
              {selectedCategory === 'all'
                ? 'All Documents'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </span>
            <span className="mono-eyebrow text-[11px] text-[#8f8f8f] px-2 py-0.5 rounded-[4px] bg-white border border-[#ebebeb]">
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'FILE' : 'FILES'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8f8f8f]">
            <span className="hidden sm:inline">
              Sorted by: <strong className="text-[#171717] font-medium">{sortBy}</strong>
            </span>
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="text-xs text-[#0070f3] hover:underline font-medium cursor-pointer"
              >
                Refine filters
              </button>
            )}
          </div>
        </div>

        {/* Documents Grid / Table View */}
        {filteredDocuments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc, idx) => (
                <DocumentCard
                  key={doc.id ? `${doc.id}-${idx}` : `doc-${idx}`}
                  document={doc}
                  onPreview={handlePreviewDocument}
                  onDownload={handleDownloadDocument}
                  onToggleStar={handleToggleStar}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          ) : (
            <DocumentTable
              documents={filteredDocuments}
              onPreview={handlePreviewDocument}
              onDownload={handleDownloadDocument}
              onToggleStar={handleToggleStar}
              onDelete={handleDeleteDocument}
            />
          )
        ) : (
          /* Empty State */
          documents.length === 0 ? (
            <div className="feature-card p-14 text-center flex flex-col items-center justify-center my-8 bg-white border border-[#ebebeb] rounded-[12px] shadow-xs">
              <div className="w-14 h-14 rounded-[10px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#171717] mb-4">
                <UploadCloud className="w-7 h-7 text-[#0070f3]" />
              </div>
              <h3 className="heading-md text-lg text-[#171717] font-semibold mb-1 tracking-tight">
                Your Knowledge Base is Ready
              </h3>
              <p className="body-md text-xs text-[#8f8f8f] max-w-md mb-6 leading-relaxed">
                No documents or files uploaded yet. Start by uploading engineering schematics, clinical validation dossiers, patent drafts, or team assets.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary h-9.5 text-xs px-5 shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : (
            <div className="feature-card p-12 text-center flex flex-col items-center justify-center my-8">
              <div className="w-12 h-12 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center text-[#8f8f8f] mb-3">
                <Search className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="heading-md text-base text-[#171717] mb-1">
                No matching files found
              </h3>
              <p className="body-md text-xs text-[#8f8f8f] max-w-sm mb-5">
                No documents matched your active search query or filters. Try adjusting your search term or reset all filters.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={handleResetFilters} className="btn-ghost-sm h-8 text-xs cursor-pointer">
                  Reset All Filters
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="btn-primary-sm h-8 text-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Upload New Document
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer conforming strictly to DESIGN.md */}
      <footer className="mt-auto border-t border-[#ebebeb] bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start justify-between gap-8 text-xs text-[#8f8f8f]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm text-[#171717] tracking-tight">
                {DHRITAM_COMPANY.name.toUpperCase()}
              </span>
              <span className="text-[#171717] font-semibold text-sm">
                ({DHRITAM_COMPANY.devanagari})
              </span>
            </div>
            <p className="body-md text-xs text-[#4d4d4d] leading-relaxed mb-3">
              “{DHRITAM_COMPANY.meaning}” • {DHRITAM_COMPANY.tagline}
            </p>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <div className="mono-eyebrow text-[#171717] mb-3 text-[11px]">
                RESOURCES
              </div>
              <ul className="space-y-2 text-[#4d4d4d]">
                <li>
                  <button
                    onClick={() => setSelectedCategory('product')}
                    className="hover:text-[#171717] cursor-pointer"
                  >
                    App V1 Baseline
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedCategory('hardware')}
                    className="hover:text-[#171717] cursor-pointer"
                  >
                    Kavach X Hardware
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="mono-eyebrow text-[#171717] mb-3 text-[11px]">
                GOVERNANCE
              </div>
              <ul className="space-y-2 text-[#4d4d4d]">
                <li>
                  <button
                    onClick={() => setSelectedCategory('regulatory')}
                    className="hover:text-[#171717] cursor-pointer"
                  >
                    IP & Patents
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedClassification('confidential')}
                    className="hover:text-[#171717] cursor-pointer"
                  >
                    Restricted Files
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="mono-eyebrow text-[#171717] mb-3 text-[11px]">
                ACCESS
              </div>
              <ul className="space-y-2 text-[#4d4d4d]">
                <li>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="hover:text-[#171717] cursor-pointer"
                  >
                    Upload Document
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="hover:text-[#171717] cursor-pointer"
                  >
                    Quick Search (⌘K)
                  </button>
                </li>
                <li>
                  <span className="text-[#8f8f8f] font-mono text-[11px]">
                    Internal Use Only
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto mt-8 pt-6 border-t border-[#ebebeb] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8f8f8f] font-mono">
          <span>© 2026 Dhritam HealthTech. All rights reserved.</span>

        </div>
      </footer>

      {/* Modals & Dialogs */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
      />

      <DocumentViewerModal
        isOpen={isViewerOpen}
        document={selectedDoc}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedDoc(null);
        }}
        onDownload={handleDownloadDocument}
        onToggleStar={handleToggleStar}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        documents={documents}
        onSelectDocument={handlePreviewDocument}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
