import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createFirestoreInstance() {
  const databaseId = firebaseConfigData.firestoreDatabaseId || '(default)';
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: typeof window !== 'undefined',
    }, databaseId);
  } catch (e) {
    try {
      return firebaseConfigData.firestoreDatabaseId
        ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
        : getFirestore(app);
    } catch {
      return getFirestore(app);
    }
  }
}

export const db = createFirestoreInstance();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  // Log structured diagnostic without crashing application
  console.warn('Firestore Operation Diagnostic: ', JSON.stringify(errInfo));
}

// In-memory fallback cache for fast recovery during network drops
const localMemoryFallback = new Map<string, Map<string, any>>();

// Recursive helper to remove undefined fields from objects/arrays before passing to Firestore
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object' && obj.constructor === Object) {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean;
  }
  return obj;
}

// Generic Firestore Helpers for ITAM & Auth
export async function getFirestoreDoc<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as T;
      if (!localMemoryFallback.has(collectionName)) localMemoryFallback.set(collectionName, new Map());
      localMemoryFallback.get(collectionName)!.set(docId, data);
      return data;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    const fallback = localMemoryFallback.get(collectionName)?.get(docId);
    return (fallback as T) || null;
  }
}

export async function setFirestoreDoc<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<boolean> {
  if (!localMemoryFallback.has(collectionName)) localMemoryFallback.set(collectionName, new Map());
  localMemoryFallback.get(collectionName)!.set(docId, data);

  try {
    const docRef = doc(db, collectionName, docId);
    const sanitizedData = sanitizeForFirestore(data);
    await setDoc(docRef, sanitizedData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
    return false;
  }
}

export async function getAllFirestoreDocs<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items: T[] = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as unknown as T);
    });
    if (items.length > 0) {
      if (!localMemoryFallback.has(collectionName)) localMemoryFallback.set(collectionName, new Map());
      items.forEach((it: any) => localMemoryFallback.get(collectionName)!.set(it.id, it));
    }
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    const fallbackMap = localMemoryFallback.get(collectionName);
    if (fallbackMap && fallbackMap.size > 0) {
      return Array.from(fallbackMap.values()) as T[];
    }
    return [];
  }
}

export async function deleteFirestoreDoc(collectionName: string, docId: string): Promise<boolean> {
  if (localMemoryFallback.has(collectionName)) {
    localMemoryFallback.get(collectionName)!.delete(docId);
  }
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    return false;
  }
}

/**
 * Delete every document in a Firestore collection (batch delete).
 * Also clears the in-memory fallback cache for that collection.
 */
export async function clearFirestoreCollection(collectionName: string): Promise<void> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach((d) => {
      batch.delete(doc(db, collectionName, d.id));
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    // Drop in-memory fallback so no stale records survive
    localMemoryFallback.delete(collectionName);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionName);
  }
}

export async function seedInitialFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  initialDataArray: T[]
): Promise<void> {
  try {
    if (!initialDataArray || initialDataArray.length === 0) return;
    const existing = await getAllFirestoreDocs(collectionName);
    if (existing.length === 0) {
      const batch = writeBatch(db);
      let count = 0;
      for (const item of initialDataArray.slice(0, 50)) {
        const docRef = doc(db, collectionName, item.id);
        const sanitized = sanitizeForFirestore(item);
        batch.set(docRef, sanitized, { merge: true });
        count++;
      }
      if (count > 0) {
        await batch.commit();
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionName);
  }
}
