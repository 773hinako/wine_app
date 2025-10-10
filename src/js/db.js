// IndexedDB管理クラス
class WineDB {
    constructor() {
        this.db = null;
        this.dbName = 'WineDB';
        this.version = 1;
    }

    // データベース初期化
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // ワインストア作成
                if (!db.objectStoreNames.contains('wines')) {
                    const wineStore = db.createObjectStore('wines', { keyPath: 'id', autoIncrement: true });
                    wineStore.createIndex('name', 'name', { unique: false });
                    wineStore.createIndex('region', 'region', { unique: false });
                    wineStore.createIndex('variety', 'variety', { unique: false });
                    wineStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }

    // ワイン追加
    async addWine(wine) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wines'], 'readwrite');
            const store = transaction.objectStore('wines');
            const request = store.add({
                ...wine,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ワイン更新
    async updateWine(id, wine) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wines'], 'readwrite');
            const store = transaction.objectStore('wines');
            const request = store.put({
                ...wine,
                id: id,
                updatedAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ワイン削除
    async deleteWine(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wines'], 'readwrite');
            const store = transaction.objectStore('wines');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ワイン取得（ID指定）
    async getWine(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wines'], 'readonly');
            const store = transaction.objectStore('wines');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 全ワイン取得
    async getAllWines() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wines'], 'readonly');
            const store = transaction.objectStore('wines');
            const request = store.getAll();

            request.onsuccess = () => {
                const wines = request.result;
                // 日付でソート（新しい順）
                wines.sort((a, b) => {
                    const dateA = new Date(a.date || a.createdAt);
                    const dateB = new Date(b.date || b.createdAt);
                    return dateB - dateA;
                });
                resolve(wines);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // 検索
    async searchWines(query) {
        const allWines = await this.getAllWines();
        const lowerQuery = query.toLowerCase();

        return allWines.filter(wine => {
            return (
                wine.name?.toLowerCase().includes(lowerQuery) ||
                wine.producer?.toLowerCase().includes(lowerQuery) ||
                wine.region?.toLowerCase().includes(lowerQuery) ||
                wine.variety?.toLowerCase().includes(lowerQuery) ||
                wine.notes?.toLowerCase().includes(lowerQuery)
            );
        });
    }

    // 全データエクスポート
    async exportData() {
        const wines = await this.getAllWines();
        return JSON.stringify(wines, null, 2);
    }

    // データインポート
    async importData(jsonData) {
        const wines = JSON.parse(jsonData);
        const transaction = this.db.transaction(['wines'], 'readwrite');
        const store = transaction.objectStore('wines');

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(wines.length);
            transaction.onerror = () => reject(transaction.error);

            wines.forEach(wine => {
                const { id, ...wineData } = wine; // 既存のIDを除外
                store.add(wineData);
            });
        });
    }

    // 全データクリア
    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wines'], 'readwrite');
            const store = transaction.objectStore('wines');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// グローバルインスタンス
const wineDB = new WineDB();
