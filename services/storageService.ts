
const DB_NAME = 'MemoMasterAudioDB';
const STORE_NAME = 'audio';
const DB_VERSION = 1;

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error("IndexedDB not supported"));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveAudioToDB = async (id: string, data: ArrayBuffer) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(data, id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getAudioFromDB = async (id: string): Promise<ArrayBuffer | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const hasAudioInDB = async (id: string): Promise<boolean> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.count(id);
        request.onsuccess = () => resolve(request.result > 0);
        request.onerror = () => reject(request.error);
    });
};
