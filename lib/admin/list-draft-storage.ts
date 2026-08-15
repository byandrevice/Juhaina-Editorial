import type { ListEditorInitialData } from "./list-schema";

const PREFIX = "second-viewing:list-draft:";
const INDEX_KEY = "second-viewing:list-draft-index";

export type LocalListDraftSummary = { key: string; title: string; updatedAt: string };

export function saveLocalListDraft(key: string, value: ListEditorInitialData) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ ...value, updatedAt }));
  const current = listLocalListDrafts().filter((draft) => draft.key !== key);
  current.unshift({ key, title: value.title || "Untitled list", updatedAt });
  localStorage.setItem(INDEX_KEY, JSON.stringify(current.slice(0, 25)));
  return updatedAt;
}

export function loadLocalListDraft(key: string) {
  const stored = localStorage.getItem(`${PREFIX}${key}`);
  if (!stored) return null;
  try { return JSON.parse(stored) as ListEditorInitialData & { updatedAt: string }; }
  catch { return null; }
}

export function removeLocalListDraft(key: string) {
  localStorage.removeItem(`${PREFIX}${key}`);
  localStorage.setItem(INDEX_KEY, JSON.stringify(listLocalListDrafts().filter((draft) => draft.key !== key)));
}

export function listLocalListDrafts(): LocalListDraftSummary[] {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]"); }
  catch { return []; }
}

const DB_NAME = "second-viewing-list-admin";
const STORE_NAME = "draft-images";

function openDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalListImage(draftKey: string, itemId: string, file: File) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, `${draftKey}:${itemId}`);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadLocalListImage(draftKey: string, itemId: string) {
  const database = await openDraftDatabase();
  const file = await new Promise<File | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(`${draftKey}:${itemId}`);
    request.onsuccess = () => resolve((request.result as File | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file;
}

export async function removeLocalListImages(draftKey: string, itemIds: string[]) {
  const database = await openDraftDatabase();
  await Promise.all(itemIds.map((itemId) => new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(`${draftKey}:${itemId}`);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  })));
  database.close();
}
