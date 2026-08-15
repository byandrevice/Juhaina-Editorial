import type { AdminMoodboardCategory, MoodboardEditorInitialData } from "./moodboard-schema";

const PREFIX = "second-viewing:moodboard-draft:";
const INDEX_KEY = "second-viewing:moodboard-draft-index";
export const MOODBOARD_CATEGORY_STORAGE_KEY = "second-viewing:moodboard-demo-categories";
export const MOODBOARD_CATEGORIES_CHANGED_EVENT = "second-viewing:moodboard-categories-changed";
const DB_NAME = "second-viewing-moodboard-admin";
const STORE_NAME = "draft-images";

export type LocalMoodboardDraftSummary = { key: string; title: string; updatedAt: string };

export const fallbackAdminMoodboardCategories: AdminMoodboardCategory[] = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Memory", slug: "memory", position: 1, boardCount: 0 },
  { id: "22222222-2222-4222-8222-222222222222", name: "Material", slug: "material", position: 2, boardCount: 0 },
  { id: "33333333-3333-4333-8333-333333333333", name: "Place", slug: "place", position: 3, boardCount: 0 },
];

export function saveLocalMoodboardDraft(key: string, value: MoodboardEditorInitialData) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ ...value, updatedAt }));
  const current = listLocalMoodboardDrafts().filter((draft) => draft.key !== key);
  current.unshift({ key, title: value.title || "Untitled moodboard", updatedAt });
  localStorage.setItem(INDEX_KEY, JSON.stringify(current.slice(0, 25)));
  return updatedAt;
}

export function loadLocalMoodboardDraft(key: string) {
  const stored = localStorage.getItem(`${PREFIX}${key}`);
  if (!stored) return null;
  try { return JSON.parse(stored) as MoodboardEditorInitialData & { updatedAt: string }; }
  catch { return null; }
}

export function removeLocalMoodboardDraft(key: string) {
  localStorage.removeItem(`${PREFIX}${key}`);
  localStorage.setItem(INDEX_KEY, JSON.stringify(listLocalMoodboardDrafts().filter((draft) => draft.key !== key)));
}

export function listLocalMoodboardDrafts(): LocalMoodboardDraftSummary[] {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]"); }
  catch { return []; }
}

export function loadDemoMoodboardCategories() {
  try { return JSON.parse(localStorage.getItem(MOODBOARD_CATEGORY_STORAGE_KEY) ?? "null") as AdminMoodboardCategory[] | null ?? fallbackAdminMoodboardCategories; }
  catch { return fallbackAdminMoodboardCategories; }
}

export function saveDemoMoodboardCategories(categories: AdminMoodboardCategory[]) {
  localStorage.setItem(MOODBOARD_CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  window.dispatchEvent(new CustomEvent(MOODBOARD_CATEGORIES_CHANGED_EVENT, { detail: categories }));
}

function openDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalMoodboardImage(draftKey: string, layerId: string, file: File) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, `${draftKey}:${layerId}`);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadLocalMoodboardImage(draftKey: string, layerId: string) {
  const database = await openDraftDatabase();
  const file = await new Promise<File | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(`${draftKey}:${layerId}`);
    request.onsuccess = () => resolve((request.result as File | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file;
}

export async function removeLocalMoodboardImage(draftKey: string, layerId: string) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(`${draftKey}:${layerId}`);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function removeLocalMoodboardImages(draftKey: string) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (String(cursor.key).startsWith(`${draftKey}:`)) cursor.delete();
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
