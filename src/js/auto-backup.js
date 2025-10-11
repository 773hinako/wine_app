// 自動バックアップ機能
// データの安全性を高めるため、LocalStorageに定期的にバックアップを保存

const AutoBackup = {
    STORAGE_KEY: 'wine-backup',
    BACKUP_INTERVAL: 5 * 60 * 1000, // 5分ごと
    MAX_BACKUPS: 3, // 最大3世代保持

    // 自動バックアップを開始
    start() {
        // 初回バックアップ
        this.createBackup();

        // 定期バックアップ
        setInterval(() => this.createBackup(), this.BACKUP_INTERVAL);

        // ページ離脱時にもバックアップ
        window.addEventListener('beforeunload', () => this.createBackup());
    },

    // バックアップを作成
    async createBackup() {
        try {
            const data = await wineDB.exportData();
            const backup = {
                data: data,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            // LocalStorageに保存
            const backups = this.getBackups();
            backups.unshift(backup);

            // 古いバックアップを削除（最大3世代）
            if (backups.length > this.MAX_BACKUPS) {
                backups.splice(this.MAX_BACKUPS);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backups));
            console.log('Auto-backup created:', new Date().toLocaleString());
        } catch (error) {
            console.error('Auto-backup failed:', error);
        }
    },

    // バックアップリストを取得
    getBackups() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load backups:', error);
            return [];
        }
    },

    // 最新のバックアップを取得
    getLatestBackup() {
        const backups = this.getBackups();
        return backups.length > 0 ? backups[0] : null;
    },

    // バックアップから復元
    async restore(backupIndex = 0) {
        try {
            const backups = this.getBackups();
            if (backupIndex >= backups.length) {
                throw new Error('Backup not found');
            }

            const backup = backups[backupIndex];
            await wineDB.importData(backup.data);
            console.log('Restored from backup:', backup.timestamp);
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    },

    // バックアップ情報を表示用に整形
    getBackupInfo() {
        const backups = this.getBackups();
        return backups.map((backup, index) => ({
            index: index,
            timestamp: new Date(backup.timestamp),
            wineCount: backup.data.wines ? backup.data.wines.length : 0,
            size: JSON.stringify(backup.data).length
        }));
    }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoBackup;
}
