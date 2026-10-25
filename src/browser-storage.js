// Browser-only persistence, isolated by project URL on shared GitHub Pages origins.
const databaseName = 'pelagic:' + new URL('../', import.meta.url).pathname;
const storeName = 'campaigns';
function storageError(error) {
  const reason = error?.name === 'QuotaExceededError' ? 'Browser storage is full.' : 'Browser storage is unavailable.';
  return new Error(reason + ' You can still use Download save and Import save file.');
}
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(storageError()); return; }
    let request, settled = false;
    try { request = indexedDB.open(databaseName, 1); } catch (error) { reject(storageError(error)); return; }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName);
    };
    request.onblocked = () => { settled = true; reject(new Error('Save storage is busy. Close other tabs of this game and try again, or download your save.')); };
    request.onerror = () => { settled = true; reject(storageError(request.error)); };
    request.onsuccess = () => {
      const db = request.result;
      if (settled) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}
async function transact(mode, payload) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      let transaction, request;
      try {
        transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        request = mode === 'readwrite' ? store.put(payload, 'campaign') : store.get('campaign');
      } catch (error) { reject(storageError(error)); return; }
      transaction.oncomplete = () => resolve(mode === 'readonly' ? request.result : undefined);
      transaction.onabort = () => reject(storageError(transaction.error || request.error));
      transaction.onerror = () => reject(storageError(transaction.error || request.error));
    });
  } finally { db.close(); }
}
export async function saveCampaign(payload) { await transact('readwrite', payload); }
export async function loadCampaign() {
  const payload = await transact('readonly');
  if (!payload) throw new Error('No browser save yet. Save an operation here or import a JSON save file.');
  return payload;
}
export function downloadCampaign(payload) {
  const name = 'campaign-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name; link.hidden = true;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}
