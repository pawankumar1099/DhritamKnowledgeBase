'use client';

import { KnowledgeDocument } from '@/types/knowledgeBase';
import { INITIAL_DOCUMENTS } from './constants';

const STORAGE_KEY = 'dhritam_kb_documents_v2';
const FILE_BLOBS_DB_NAME = 'DhritamFilesDB';
const FILE_BLOBS_STORE = 'file_blobs';

// Open IndexedDB database for large file storage (PDFs, Images, Docs)
function openFilesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(FILE_BLOBS_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_BLOBS_STORE)) {
        db.createObjectStore(FILE_BLOBS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFileInIndexedDB(docId: string, dataUrlOrBlob: string): Promise<void> {
  try {
    const db = await openFilesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FILE_BLOBS_STORE, 'readwrite');
      const store = tx.objectStore(FILE_BLOBS_STORE);
      store.put(dataUrlOrBlob, docId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB file store error:', err);
  }
}

export async function getFileFromIndexedDB(docId: string): Promise<string | null> {
  try {
    const db = await openFilesDB();
    return new Promise((resolve) => {
      const tx = db.transaction(FILE_BLOBS_STORE, 'readonly');
      const store = tx.objectStore(FILE_BLOBS_STORE);
      const req = store.get(docId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeFileFromIndexedDB(docId: string): Promise<void> {
  try {
    const db = await openFilesDB();
    const tx = db.transaction(FILE_BLOBS_STORE, 'readwrite');
    tx.objectStore(FILE_BLOBS_STORE).delete(docId);
  } catch (err) {
    console.warn('Could not remove file from IndexedDB:', err);
  }
}

export function getStoredDocuments(): KnowledgeDocument[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load documents from localStorage', e);
    return [];
  }
}

export function saveAllDocumentsLocally(docs: KnowledgeDocument[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = docs.map((d) => {
      if (d.fileDataUrl && d.fileDataUrl.startsWith('data:')) {
        return { ...d, fileDataUrl: undefined };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.warn('Storage quota notice in saveAllDocumentsLocally, stripping all preview URLs:', e);
    try {
      const stripped = docs.map((d) => ({ ...d, fileDataUrl: undefined, textContent: undefined }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch {
      // quota full, ignore
    }
  }
}

export function saveDocumentLocally(
  doc: KnowledgeDocument,
  fileDataUrl?: string
): KnowledgeDocument[] {
  const docs = getStoredDocuments();
  const existingIdx = docs.findIndex((d) => d.id === doc.id);
  let updatedDocs: KnowledgeDocument[];

  const cleanDoc = { ...doc };
  if (cleanDoc.fileDataUrl && cleanDoc.fileDataUrl.startsWith('data:')) {
    cleanDoc.fileDataUrl = undefined;
  }

  if (existingIdx >= 0) {
    updatedDocs = [...docs];
    updatedDocs[existingIdx] = { ...cleanDoc, updatedAt: new Date().toISOString() };
  } else {
    updatedDocs = [cleanDoc, ...docs];
  }

  try {
    const serialized = updatedDocs.map((d) => {
      if (d.fileDataUrl && d.fileDataUrl.startsWith('data:')) {
        return { ...d, fileDataUrl: undefined };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (e) {
    console.warn('Storage quota exceeded, storing metadata only', e);
    const strippedDocs = updatedDocs.map((d) => ({ ...d, fileDataUrl: undefined }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedDocs));
    } catch {
      // ignore
    }
  }

  if (fileDataUrl) {
    storeFileInIndexedDB(doc.id, fileDataUrl);
  }

  return updatedDocs;
}

export function deleteDocumentLocally(id: string): KnowledgeDocument[] {
  const docs = getStoredDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  removeFileFromIndexedDB(id);
  return filtered;
}

export function updateDocumentLocally(
  id: string,
  updates: Partial<KnowledgeDocument>
): KnowledgeDocument[] {
  const docs = getStoredDocuments();
  const updated = docs.map((d) =>
    d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleStarLocally(id: string): KnowledgeDocument[] {
  const docs = getStoredDocuments();
  const updated = docs.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function incrementViewCountLocally(id: string): KnowledgeDocument[] {
  const docs = getStoredDocuments();
  const updated = docs.map((d) =>
    d.id === id ? { ...d, viewCount: (d.viewCount || 0) + 1 } : d
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function incrementDownloadCountLocally(id: string): KnowledgeDocument[] {
  const docs = getStoredDocuments();
  const updated = docs.map((d) =>
    d.id === id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function resetToDefaultDocuments(): KnowledgeDocument[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return [];
}

export function exportKnowledgeBaseAsJson(): string {
  const docs = getStoredDocuments();
  return JSON.stringify(
    {
      app: 'Dhritam Knowledge Base',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      documentsCount: docs.length,
      documents: docs,
    },
    null,
    2
  );
}

export function importKnowledgeBaseFromJson(jsonString: string): KnowledgeDocument[] | null {
  try {
    const data = JSON.parse(jsonString);
    const docs = Array.isArray(data) ? data : data.documents;
    if (Array.isArray(docs) && docs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      return docs;
    }
  } catch (err) {
    console.error('Import error:', err);
  }
  return null;
}
