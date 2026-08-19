import type { ProjectionEditorInitialData } from "./projection-schema";

const PREFIX = "second-viewing:projection-draft:";
const INDEX_KEY = "second-viewing:projection-draft-index";
const DB_NAME = "second-viewing-admin";
const STORE_NAME = "draft-images";
const imageKey = (key: string) => `projection:${key}`;

export type LocalProjectionDraftSummary = { key: string; title: string; updatedAt: string };

export function saveLocalProjectionDraft(key: string, value: ProjectionEditorInitialData) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ ...value, updatedAt }));
  const current = listLocalProjectionDrafts().filter((draft) => draft.key !== key);
  current.unshift({ key, title: value.title || "Untitled projection", updatedAt });
  localStorage.setItem(INDEX_KEY, JSON.stringify(current.slice(0, 25)));
  return updatedAt;
}

export function loadLocalProjectionDraft(key: string) {
  const stored = localStorage.getItem(`${PREFIX}${key}`);
  if (!stored) return null;
  try { return JSON.parse(stored) as ProjectionEditorInitialData & { updatedAt: string }; }
  catch { return null; }
}

export function removeLocalProjectionDraft(key: string) {
  localStorage.removeItem(`${PREFIX}${key}`);
  localStorage.setItem(INDEX_KEY, JSON.stringify(listLocalProjectionDrafts().filter((draft) => draft.key !== key)));
}

export function listLocalProjectionDrafts(): LocalProjectionDraftSummary[] {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]"); }
  catch { return []; }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalProjectionImage(key: string, file: File) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, imageKey(key));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadLocalProjectionImage(key: string) {
  const database = await openDatabase();
  const file = await new Promise<File | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(imageKey(key));
    request.onsuccess = () => resolve((request.result as File | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file;
}

export async function removeLocalProjectionImage(key: string) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(imageKey(key));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

