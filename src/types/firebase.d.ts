declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(options: Record<string, any>, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    type: string;
    app: any;
  }
  export function getFirestore(app?: any): Firestore;
  export function collection(firestore: any, path: string, ...pathSegments: string[]): any;
  export function doc(firestore: any, path: string, ...pathSegments: string[]): any;
  export function setDoc(reference: any, data: any, options?: any): Promise<void>;
  export function getDocs(query: any): Promise<any>;
  export function deleteDoc(reference: any): Promise<void>;
}

declare module 'firebase/storage' {
  export interface FirebaseStorage {
    app: any;
  }
  export function getStorage(app?: any): FirebaseStorage;
  export function ref(storage: any, url?: string): any;
  export function uploadBytes(ref: any, data: any): Promise<any>;
  export function getDownloadURL(ref: any): Promise<string>;
}
