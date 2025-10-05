// アプリケーション状態
const app = {
    currentScreen: 'home',
    currentWineId: null,
    photoData: null,
    deferredPrompt: null
};

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // Service Worker登録
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered');
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    // データベース初期化
    await wineDB.init();

    // イベントリスナー設定
    setupEventListeners();

    // 初期データロード
    loadWineList();

    // PWAインストールプロンプト処理
    setupInstallPrompt();
});

// イベントリスナー設定
function setupEventListeners() {
    // ホーム画面
    document.getElementById('add-wine-btn').addEventListener('click', () => {
        app.currentWineId = null;
        app.photoData = null;
        resetForm();
        showScreen('edit');
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        searchWines(e.target.value);
    });

    // 編集画面
    document.getElementById('back-btn').addEventListener('click', () => {
        showScreen('home');
    });

    document.getElementById('photo-btn').addEventListener('click', () => {
        document.getElementById('photo-input').click();
    });

    document.getElementById('photo-input').addEventListener('change', handlePhotoSelect);

    document.getElementById('wine-form').addEventListener('submit', handleFormSubmit);

    // 星評価
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            document.getElementById('rating').value = value;
            updateStarDisplay(value);
        });
    });

    // 詳細画面
    document.getElementById('detail-back-btn').addEventListener('click', () => {
        showScreen('home');
    });

    document.getElementById('edit-detail-btn').addEventListener('click', async () => {
        await loadWineForEdit(app.currentWineId);
        showScreen('edit');
    });

    document.getElementById('delete-btn').addEventListener('click', handleDelete);

    // エクスポート/インポート
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input').addEventListener('change', handleImport);

    // ワインタイプ切り替えでタンニンフィールドの表示/非表示
    document.querySelectorAll('input[name="wine-type"]').forEach(radio => {
        radio.addEventListener('change', toggleTanninField);
    });
}

// タンニンフィールドの表示/非表示
function toggleTanninField() {
    const wineType = document.querySelector('input[name="wine-type"]:checked').value;
    const tanninGroup = document.getElementById('tannin-group');
    if (wineType === 'red') {
        tanninGroup.style.display = 'block';
    } else {
        tanninGroup.style.display = 'none';
    }
}

// 画面切り替え
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const screenMap = {
        'home': 'home-screen',
        'edit': 'edit-screen',
        'detail': 'detail-screen'
    };

    document.getElementById(screenMap[screenName]).classList.add('active');
    app.currentScreen = screenName;

    // 画面切り替え時のスクロールリセット
    window.scrollTo(0, 0);
}

// ワインリスト読み込み
async function loadWineList() {
    const wines = await wineDB.getAllWines();
    displayWineList(wines);
}

// ワインリスト表示
function displayWineList(wines) {
    const wineList = document.getElementById('wine-list');

    if (wines.length === 0) {
        wineList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4rem;">🍷</div>
                <p>まだワインが登録されていません</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">右下の + ボタンから追加してください</p>
            </div>
        `;
        return;
    }

    wineList.innerHTML = wines.map(wine => `
        <div class="wine-card" data-id="${wine.id}">
            ${wine.photo ?
                `<img src="${wine.photo}" alt="${wine.name}" class="wine-card-photo">` :
                `<div class="wine-card-photo" style="display: flex; align-items: center; justify-content: center; font-size: 2rem;">🍷</div>`
            }
            <div class="wine-card-info">
                <div class="wine-card-name">${escapeHtml(wine.name)}</div>
                <div class="wine-card-meta">
                    ${wine.region ? escapeHtml(wine.region) : ''}
                    ${wine.vintage ? ` (${wine.vintage})` : ''}
                </div>
                <div class="wine-card-rating">${getStarDisplay(wine.rating || 0)}</div>
            </div>
        </div>
    `).join('');

    // カードクリックイベント
    document.querySelectorAll('.wine-card').forEach(card => {
        card.addEventListener('click', () => {
            const wineId = parseInt(card.dataset.id);
            showWineDetail(wineId);
        });
    });
}

// 検索
async function searchWines(query) {
    if (!query.trim()) {
        await loadWineList();
        return;
    }

    const wines = await wineDB.searchWines(query);
    displayWineList(wines);
}

// 写真選択処理
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        app.photoData = event.target.result;
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${app.photoData}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// フォーム送信
async function handleFormSubmit(e) {
    e.preventDefault();

    // 香りの収集
    const aromas = Array.from(document.querySelectorAll('input[name="aroma"]:checked'))
        .map(cb => cb.value);

    const wineData = {
        name: document.getElementById('wine-name').value,
        producer: document.getElementById('producer').value,
        region: document.getElementById('region').value,
        variety: document.getElementById('variety').value,
        vintage: document.getElementById('vintage').value ? parseInt(document.getElementById('vintage').value) : null,
        date: document.getElementById('date').value,
        rating: parseInt(document.getElementById('rating').value) || 0,
        photo: app.photoData,
        // テイスティングメモ構造化
        tasting: {
            wineType: document.querySelector('input[name="wine-type"]:checked').value,
            appearanceColor: document.getElementById('appearance-color').value,
            aromas: aromas,
            sweetness: document.getElementById('taste-sweetness').value,
            acidity: document.getElementById('taste-acidity').value,
            tannin: document.getElementById('taste-tannin').value,
            body: document.getElementById('taste-body').value,
            finish: document.getElementById('finish').value,
            additionalNotes: document.getElementById('additional-notes').value
        }
    };

    try {
        if (app.currentWineId) {
            await wineDB.updateWine(app.currentWineId, wineData);
        } else {
            await wineDB.addWine(wineData);
        }

        await loadWineList();
        showScreen('home');
        resetForm();
    } catch (error) {
        alert('保存に失敗しました: ' + error.message);
    }
}

// フォームリセット
function resetForm() {
    document.getElementById('wine-form').reset();
    document.getElementById('photo-preview').innerHTML = '<span class="photo-placeholder">📷 写真を追加</span>';
    document.getElementById('rating').value = '0';
    updateStarDisplay(0);
    document.getElementById('edit-title').textContent = '新規記録';
    app.photoData = null;

    // テイスティングフィールドをリセット
    document.querySelectorAll('input[name="aroma"]').forEach(cb => cb.checked = false);
    document.querySelector('input[name="wine-type"][value="red"]').checked = true;
    toggleTanninField();
}

// 編集用データロード
async function loadWineForEdit(wineId) {
    const wine = await wineDB.getWine(wineId);
    if (!wine) return;

    app.currentWineId = wineId;
    app.photoData = wine.photo;

    document.getElementById('wine-name').value = wine.name || '';
    document.getElementById('producer').value = wine.producer || '';
    document.getElementById('region').value = wine.region || '';
    document.getElementById('variety').value = wine.variety || '';
    document.getElementById('vintage').value = wine.vintage || '';
    document.getElementById('date').value = wine.date || '';
    document.getElementById('rating').value = wine.rating || 0;

    updateStarDisplay(wine.rating || 0);

    if (wine.photo) {
        document.getElementById('photo-preview').innerHTML = `<img src="${wine.photo}" alt="Preview">`;
    } else {
        document.getElementById('photo-preview').innerHTML = '<span class="photo-placeholder">📷 写真を追加</span>';
    }

    // テイスティングメモのロード
    if (wine.tasting) {
        // ワインタイプ
        const wineTypeRadio = document.querySelector(`input[name="wine-type"][value="${wine.tasting.wineType}"]`);
        if (wineTypeRadio) wineTypeRadio.checked = true;

        // 外観
        document.getElementById('appearance-color').value = wine.tasting.appearanceColor || '';

        // 香り
        document.querySelectorAll('input[name="aroma"]').forEach(cb => {
            cb.checked = wine.tasting.aromas && wine.tasting.aromas.includes(cb.value);
        });

        // 味わい
        document.getElementById('taste-sweetness').value = wine.tasting.sweetness || '';
        document.getElementById('taste-acidity').value = wine.tasting.acidity || '';
        document.getElementById('taste-tannin').value = wine.tasting.tannin || '';
        document.getElementById('taste-body').value = wine.tasting.body || '';
        document.getElementById('finish').value = wine.tasting.finish || '';
        document.getElementById('additional-notes').value = wine.tasting.additionalNotes || '';

        toggleTanninField();
    } else if (wine.notes) {
        // 旧形式のメモがあれば、追加メモに移行
        document.getElementById('additional-notes').value = wine.notes;
    }

    document.getElementById('edit-title').textContent = 'ワイン編集';
}

// 詳細表示
async function showWineDetail(wineId) {
    const wine = await wineDB.getWine(wineId);
    if (!wine) return;

    app.currentWineId = wineId;

    // ワインタイプの日本語表示マップ
    const wineTypeMap = {
        'red': '赤ワイン',
        'white': '白ワイン',
        'rose': 'ロゼワイン',
        'sparkling': 'スパークリングワイン'
    };

    const detailContainer = document.getElementById('wine-detail');
    detailContainer.innerHTML = `
        ${wine.photo ? `<img src="${wine.photo}" alt="${wine.name}" class="detail-photo">` : ''}

        <div class="detail-section">
            <div class="detail-title">${escapeHtml(wine.name)}</div>

            ${wine.producer ? `
                <div class="detail-row">
                    <div class="detail-label">生産者/ワイナリー</div>
                    <div class="detail-value">${escapeHtml(wine.producer)}</div>
                </div>
            ` : ''}

            ${wine.region ? `
                <div class="detail-row">
                    <div class="detail-label">産地</div>
                    <div class="detail-value">${escapeHtml(wine.region)}</div>
                </div>
            ` : ''}

            ${wine.variety ? `
                <div class="detail-row">
                    <div class="detail-label">品種</div>
                    <div class="detail-value">${escapeHtml(wine.variety)}</div>
                </div>
            ` : ''}

            ${wine.vintage ? `
                <div class="detail-row">
                    <div class="detail-label">ヴィンテージ</div>
                    <div class="detail-value">${wine.vintage}年</div>
                </div>
            ` : ''}

            ${wine.date ? `
                <div class="detail-row">
                    <div class="detail-label">購入日/飲んだ日</div>
                    <div class="detail-value">${formatDate(wine.date)}</div>
                </div>
            ` : ''}

            <div class="detail-row">
                <div class="detail-label">評価</div>
                <div class="detail-rating">${getStarDisplay(wine.rating || 0)}</div>
            </div>
        </div>

        ${wine.tasting ? `
            <div class="detail-section">
                <div class="detail-title">🍷 テイスティングメモ</div>

                <div class="detail-row">
                    <div class="detail-label">ワインタイプ</div>
                    <div class="detail-value">${wineTypeMap[wine.tasting.wineType] || wine.tasting.wineType}</div>
                </div>

                ${wine.tasting.appearanceColor ? `
                    <div class="detail-row">
                        <div class="detail-label">外観・色</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.appearanceColor)}</div>
                    </div>
                ` : ''}

                ${wine.tasting.aromas && wine.tasting.aromas.length > 0 ? `
                    <div class="detail-row">
                        <div class="detail-label">香り</div>
                        <div class="detail-value">${wine.tasting.aromas.map(a => escapeHtml(a)).join(', ')}</div>
                    </div>
                ` : ''}

                ${wine.tasting.sweetness ? `
                    <div class="detail-row">
                        <div class="detail-label">甘味</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.sweetness)}</div>
                    </div>
                ` : ''}

                ${wine.tasting.acidity ? `
                    <div class="detail-row">
                        <div class="detail-label">酸味</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.acidity)}</div>
                    </div>
                ` : ''}

                ${wine.tasting.tannin && wine.tasting.wineType === 'red' ? `
                    <div class="detail-row">
                        <div class="detail-label">タンニン</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.tannin)}</div>
                    </div>
                ` : ''}

                ${wine.tasting.body ? `
                    <div class="detail-row">
                        <div class="detail-label">ボディ</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.body)}</div>
                    </div>
                ` : ''}

                ${wine.tasting.finish ? `
                    <div class="detail-row">
                        <div class="detail-label">余韻</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.finish)}</div>
                    </div>
                ` : ''}

                ${wine.tasting.additionalNotes ? `
                    <div class="detail-row">
                        <div class="detail-label">その他メモ</div>
                        <div class="detail-value detail-notes">${escapeHtml(wine.tasting.additionalNotes)}</div>
                    </div>
                ` : ''}
            </div>
        ` : wine.notes ? `
            <div class="detail-section">
                <div class="detail-title">テイスティングメモ</div>
                <div class="detail-row">
                    <div class="detail-value detail-notes">${escapeHtml(wine.notes)}</div>
                </div>
            </div>
        ` : ''}
    `;

    showScreen('detail');
}

// 削除処理
async function handleDelete() {
    if (!confirm('このワインを削除しますか？')) return;

    try {
        await wineDB.deleteWine(app.currentWineId);
        await loadWineList();
        showScreen('home');
    } catch (error) {
        alert('削除に失敗しました: ' + error.message);
    }
}

// エクスポート
async function handleExport() {
    try {
        const jsonData = await wineDB.exportData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `wine-records-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('エクスポートに失敗しました: ' + error.message);
    }
}

// インポート
async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const count = await wineDB.importData(event.target.result);
            alert(`${count}件のワインをインポートしました`);
            await loadWineList();
            document.getElementById('import-file-input').value = '';
        } catch (error) {
            alert('インポートに失敗しました: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ユーティリティ関数

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
}

function getStarDisplay(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// PWAインストールプロンプト設定
function setupInstallPrompt() {
    // iOS Safari検出
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    // iOS Safariでスタンドアロンモードでない場合
    if (isIOS && !isStandalone) {
        // 少し遅延させてから表示（UX向上のため）
        setTimeout(() => showIOSInstallBanner(), 2000);
    }

    // Android/Chrome用のbeforeinstallpromptイベントをキャプチャ
    window.addEventListener('beforeinstallprompt', (e) => {
        // デフォルトのインストールプロンプトを防止
        e.preventDefault();
        app.deferredPrompt = e;

        // インストールバナーを表示
        showInstallBanner();
    });

    // アプリがインストールされたら、バナーを非表示
    window.addEventListener('appinstalled', () => {
        app.deferredPrompt = null;
        hideInstallBanner();
    });
}

// インストールバナー表示
function showInstallBanner() {
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 1rem;
        right: 1rem;
        background: linear-gradient(135deg, #8B4789 0%, #6B3569 100%);
        color: white;
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;

    banner.innerHTML = `
        <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 0.25rem;">📱 アプリをインストール</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">ホーム画面に追加して、いつでも簡単にアクセス</div>
        </div>
        <button id="install-btn" style="
            background: white;
            color: #8B4789;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            margin-left: 1rem;
            white-space: nowrap;
        ">インストール</button>
        <button id="install-close-btn" style="
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0 0.5rem;
            margin-left: 0.5rem;
        ">×</button>
    `;

    // CSSアニメーション追加
    if (!document.querySelector('#install-banner-styles')) {
        const style = document.createElement('style');
        style.id = 'install-banner-styles';
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    // インストールボタンのイベント
    document.getElementById('install-btn').addEventListener('click', async () => {
        if (!app.deferredPrompt) return;

        app.deferredPrompt.prompt();
        const { outcome } = await app.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('ユーザーがインストールを承認');
        }

        app.deferredPrompt = null;
        hideInstallBanner();
    });

    // 閉じるボタンのイベント
    document.getElementById('install-close-btn').addEventListener('click', () => {
        hideInstallBanner();
    });
}

// インストールバナー非表示
function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => banner.remove(), 300);
    }
}

// iOS用インストールバナー表示
function showIOSInstallBanner() {
    // 既にバナーが表示されていたら表示しない
    if (document.getElementById('install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 1rem;
        right: 1rem;
        background: linear-gradient(135deg, #8B4789 0%, #6B3569 100%);
        color: white;
        padding: 1rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;

    banner.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">📱 ホーム画面に追加</div>
                <div style="font-size: 0.875rem; opacity: 0.9; line-height: 1.5;">
                    Safari の共有ボタン
                    <span style="display: inline-block; padding: 0 0.25rem; background: rgba(255,255,255,0.3); border-radius: 3px;">⎙</span>
                    をタップして<br>「ホーム画面に追加」を選択してください
                </div>
            </div>
            <button id="install-close-btn" style="
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                margin-left: 1rem;
            ">×</button>
        </div>
    `;

    document.body.appendChild(banner);

    // 閉じるボタンのイベント
    document.getElementById('install-close-btn').addEventListener('click', () => {
        hideInstallBanner();
    });
}
