'use client';

import { FirebaseConfig, KnowledgeDocument } from '@/types/knowledgeBase';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';

export function getFirebaseEnvConfig(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;

export function getFirebaseInstance(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
} {
  const config = getFirebaseEnvConfig();
  if (!config) {
    return { app: null, db: null, storage: null };
  }

  try {
    if (!cachedApp) {
      if (getApps().length > 0) {
        cachedApp = getApp();
      } else {
        cachedApp = initializeApp(config);
      }
    }
    if (!cachedDb && cachedApp) {
      cachedDb = getFirestore(cachedApp);
    }
    if (!cachedStorage && cachedApp) {
      cachedStorage = getStorage(cachedApp);
    }
    return { app: cachedApp, db: cachedDb, storage: cachedStorage };
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
    return { app: null, db: null, storage: null };
  }
}

export function isFirebaseConfigured(): boolean {
  return !!getFirebaseEnvConfig();
}

export async function uploadFileToFirebaseStorage(
  file: File,
  folder = 'documents'
): Promise<string | null> {
  const { storage } = getFirebaseInstance();
  if (!storage) return null;

  try {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${safeName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.error('Firebase storage upload failed:', err);
    return null;
  }
}

/**
 * Recursively strips undefined fields and oversized base64 data URLs before writing to Firestore
 */
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (key === 'fileDataUrl' && typeof value === 'string' && value.startsWith('data:')) {
        continue;
      }
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export async function syncDocumentToFirestore(docData: KnowledgeDocument): Promise<boolean> {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    const docRef = doc(db, 'dhritam_documents', docData.id);
    const cleanDoc = cleanForFirestore(docData);
    await setDoc(docRef, cleanDoc, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore sync failed:', err);
    return false;
  }
}

export async function fetchDocumentsFromFirestore(): Promise<KnowledgeDocument[]> {
  const { db } = getFirebaseInstance();
  if (!db) return [];

  try {
    const colRef = collection(db, 'dhritam_documents');
    const snapshot = await getDocs(colRef);
    const list: KnowledgeDocument[] = [];
    snapshot.forEach((snap: any) => {
      const data = snap.data() as KnowledgeDocument;
      const id = data.id || snap.id;
      list.push({ ...data, id });
    });
    return list;
  } catch (err) {
    console.error('Firestore fetch failed:', err);
    return [];
  }
}

export async function updateDocumentInFirestore(
  id: string,
  updates: Partial<KnowledgeDocument>
): Promise<boolean> {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    const docRef = doc(db, 'dhritam_documents', id);
    const cleanUpdates = cleanForFirestore(updates);
    await setDoc(docRef, cleanUpdates, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore update failed:', err);
    return false;
  }
}

export async function deleteDocumentFromFirestore(id: string): Promise<boolean> {
  const { db } = getFirebaseInstance();
  if (!db) return false;

  try {
    await deleteDoc(doc(db, 'dhritam_documents', id));
    return true;
  } catch (err) {
    console.error('Firestore delete failed:', err);
    return false;
  }
}

