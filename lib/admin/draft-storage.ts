import type { FilmEditorInitialData } from "./film-schema";

const PREFIX = "second-viewing:film-draft:";
const INDEX_KEY = "second-viewing:film-draft-index";

export type LocalDraftSummary = {
  key: string;
  title: string;
  updatedAt: string;
};

export function saveLocalDraft(key: string, value: FilmEditorInitialData) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ ...value, updatedAt }));
  const current = listLocalDrafts().filter((draft) => draft.key !== key);
  current.unshift({ key, title: value.title || "Untitled film essay", updatedAt });
  localStorage.setItem(INDEX_KEY, JSON.stringify(current.slice(0, 25)));
  return updatedAt;
}

export function loadLocalDraft(key: string) {
  const stored = localStorage.getItem(`${PREFIX}${key}`);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as FilmEditorInitialData & { updatedAt: string };
  } catch {
    return null;
  }
}

export function removeLocalDraft(key: string) {
  localStorage.removeItem(`${PREFIX}${key}`);
  localStorage.setItem(
    INDEX_KEY,
    JSON.stringify(listLocalDrafts().filter((draft) => draft.key !== key)),
  );
}

export function listLocalDrafts(): LocalDraftSummary[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]");
  } catch {
    return [];
  }
}

const DB_NAME = "second-viewing-admin";
const STORE_NAME = "draft-images";

function openDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraftImage(key: string, file: File) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadDraftImage(key: string) {
  const database = await openDraftDatabase();
  const file = await new Promise<File | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as File | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file;
}

export async function removeDraftImage(key: string) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
