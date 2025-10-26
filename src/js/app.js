// アプリケーション状態
const app = {
    currentScreen: 'home',
    currentWineId: null,
    photoData: null,
    photoThumbnail: null,
    deferredPrompt: null,
    sortBy: 'date-desc',  // デフォルトソート
    filterType: 'all'      // デフォルトフィルター
};

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // Service Worker登録
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/src/workers/service-worker.js');
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

    // ダークモード初期化
    initDarkMode();

    // スワイプジェスチャー初期化
    initSwipeGestures();

    // チュートリアル表示（初回のみ）
    setTimeout(() => showTutorial(), 1000);

    // 自動バックアップ開始
    AutoBackup.start();
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

    // OCRボタン
    document.getElementById('ocr-btn').addEventListener('click', performOCR);

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

    // ソート・フィルター
    document.getElementById('sort-select').addEventListener('change', (e) => {
        app.sortBy = e.target.value;
        loadWineList();
    });

    document.getElementById('filter-select').addEventListener('change', (e) => {
        app.filterType = e.target.value;
        loadWineList();
    });

    // 統計画面
    document.getElementById('stats-btn').addEventListener('click', () => {
        showStatsScreen();
    });

    document.getElementById('stats-back-btn').addEventListener('click', () => {
        showScreen('home');
    });

    // ダークモード
    document.getElementById('dark-mode-btn').addEventListener('click', () => {
        toggleDarkMode();
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
        'detail': 'detail-screen',
        'stats': 'stats-screen'
    };

    document.getElementById(screenMap[screenName]).classList.add('active');
    app.currentScreen = screenName;

    // 画面切り替え時のスクロールリセット
    window.scrollTo(0, 0);
}

// ワインリスト読み込み（ソート・フィルター対応）
async function loadWineList() {
    try {
        let wines = await wineDB.getAllWines();

        // フィルター適用
        wines = filterWines(wines, app.filterType);

        // ソート適用
        wines = sortWines(wines, app.sortBy);

        displayWineList(wines);
    } catch (error) {
        showToast('データの読み込みに失敗しました', 'error');
        console.error('Load error:', error);
    }
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
            <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${wine.id})" aria-label="${wine.favorite ? 'お気に入りから削除' : 'お気に入りに追加'}">
                ${wine.favorite ? '⭐' : '☆'}
            </button>
            ${(wine.thumbnail || wine.photo) ?
                `<img src="${wine.thumbnail || wine.photo}" alt="${wine.name}" class="wine-card-photo">` :
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

// 写真選択処理（画像圧縮付き）
async function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
        showToast('画像ファイルは10MB以下にしてください', 'error');
        return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
        showToast('画像ファイルを選択してください', 'error');
        return;
    }

    showLoading('画像を処理中...');

    try {
        // 画像を圧縮（最大1200px、品質0.85）
        const compressed = await compressImage(file, 1200, 0.85);
        app.photoData = compressed;

        // サムネイル生成（リスト表示用、400px）
        const thumbnail = await compressImage(file, 400, 0.8);
        app.photoThumbnail = thumbnail;

        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${app.photoData}" alt="Preview">`;

        // OCRボタンを表示
        const ocrBtn = document.getElementById('ocr-btn');
        ocrBtn.style.display = 'inline-block';

        // OCR結果をリセット
        const ocrResult = document.getElementById('ocr-result');
        ocrResult.style.display = 'none';
        ocrResult.innerHTML = '';

        // 端末の写真アプリにも保存
        await savePhotoToDevice(file);

        hideLoading();
        showToast('画像を追加しました', 'success');
    } catch (error) {
        hideLoading();
        showToast('画像の処理に失敗しました', 'error');
        console.error('Image processing error:', error);
    }
}

// 画像圧縮関数
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 縦横比を維持しながらリサイズ
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                // Canvasで圧縮
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // 高品質な画像縮小
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // JPEGに変換して圧縮
                canvas.toBlob(
                    (blob) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 端末の写真アプリに写真を保存
async function savePhotoToDevice(file) {
    try {
        // File System Access API対応確認（デスクトップブラウザ）
        if ('showSaveFilePicker' in window) {
            // デスクトップブラウザの場合は自動保存しない（ユーザーの意図しない保存を防ぐ）
            console.log('Desktop browser detected - skipping auto-save');
            return;
        }

        // Web Share API (レベル2) で画像を保存
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            // モバイルデバイスの場合、ダウンロードリンクを使用
            await downloadImageToDevice(file);
            return;
        }

        // フォールバック: ダウンロードリンク方式
        await downloadImageToDevice(file);
    } catch (error) {
        // エラーが発生しても処理を継続（写真保存は必須ではないため）
        console.warn('写真の端末保存に失敗しましたが、アプリ内には保存されています:', error);
    }
}

// 画像をダウンロードして端末に保存
function downloadImageToDevice(file) {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                // タイムスタンプ付きファイル名を生成
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const fileName = `wine_photo_${timestamp}.jpg`;

                // ダウンロードリンクを作成
                const link = document.createElement('a');
                link.href = e.target.result;
                link.download = fileName;
                link.style.display = 'none';
                
                // DOM に追加して自動クリック
                document.body.appendChild(link);
                link.click();
                
                // クリーンアップ
                setTimeout(() => {
                    document.body.removeChild(link);
                    resolve();
                }, 100);
            };
            reader.onerror = () => resolve(); // エラーでも続行
            reader.readAsDataURL(file);
        } catch (error) {
            console.warn('Download link creation failed:', error);
            resolve(); // エラーでも続行
        }
    });
}

// フォーム送信
async function handleFormSubmit(e) {
    e.preventDefault();

    // バリデーション
    const wineName = document.getElementById('wine-name').value.trim();
    if (!wineName) {
        showToast('ワイン名を入力してください', 'error');
        document.getElementById('wine-name').focus();
        return;
    }

    // ヴィンテージのバリデーション
    const vintageValue = document.getElementById('vintage').value;
    if (vintageValue) {
        const vintage = parseInt(vintageValue);
        const currentYear = new Date().getFullYear();
        if (vintage < 1900 || vintage > currentYear + 5) {
            showToast(`ヴィンテージは1900年から${currentYear + 5}年の間で入力してください`, 'error');
            document.getElementById('vintage').focus();
            return;
        }
    }

    showLoading('保存中...');

    try {
        // 香りの収集
        const aromas = Array.from(document.querySelectorAll('input[name="aroma"]:checked'))
            .map(cb => cb.value);

        const wineData = {
            name: wineName,
            producer: document.getElementById('producer').value.trim(),
            region: document.getElementById('region').value.trim(),
            variety: document.getElementById('variety').value.trim(),
            vintage: vintageValue ? parseInt(vintageValue) : null,
            date: document.getElementById('date').value,
            rating: parseInt(document.getElementById('rating').value) || 0,
            photo: app.photoData,
            thumbnail: app.photoThumbnail || app.photoData,  // サムネイルまたはオリジナル
            favorite: false,  // お気に入りフラグ（初期値）
            // テイスティングメモ構造化
            tasting: {
                wineType: document.querySelector('input[name="wine-type"]:checked').value,
                appearanceColor: document.getElementById('appearance-color').value,
                aromas: aromas,
                firstAroma: document.getElementById('first-aroma').value.trim(),
                secondAroma: document.getElementById('second-aroma').value.trim(),
                thirdAroma: document.getElementById('third-aroma').value.trim(),
                oakIntensity: document.getElementById('oak-intensity').value,
                sweetness: document.getElementById('taste-sweetness').value,
                acidity: document.getElementById('taste-acidity').value,
                tannin: document.getElementById('taste-tannin').value,
                body: document.getElementById('taste-body').value,
                finish: document.getElementById('finish').value,
                additionalNotes: document.getElementById('additional-notes').value.trim()
            }
        };

        if (app.currentWineId) {
            // 既存のお気に入り状態を保持
            const existingWine = await wineDB.getWine(app.currentWineId);
            wineData.favorite = existingWine.favorite || false;
            await wineDB.updateWine(app.currentWineId, wineData);
            showToast('ワインを更新しました', 'success');
        } else {
            await wineDB.addWine(wineData);
            showToast('ワインを追加しました', 'success');
        }

        hideLoading();
        await loadWineList();
        showScreen('home');
        resetForm();
    } catch (error) {
        hideLoading();
        showToast('保存に失敗しました: ' + error.message, 'error');
        console.error('Save error:', error);
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
    app.photoThumbnail = null;

    // OCRボタンと結果を非表示
    document.getElementById('ocr-btn').style.display = 'none';
    document.getElementById('ocr-result').style.display = 'none';
    document.getElementById('ocr-result').innerHTML = '';

    // テイスティングフィールドをリセット
    document.querySelectorAll('input[name="aroma"]').forEach(cb => cb.checked = false);
    document.querySelector('input[name="wine-type"][value="red"]').checked = true;

    // ソムリエ向けフィールドもリセット
    document.getElementById('first-aroma').value = '';
    document.getElementById('second-aroma').value = '';
    document.getElementById('third-aroma').value = '';
    document.getElementById('oak-intensity').value = '';

    toggleTanninField();
}

// 編集用データロード
async function loadWineForEdit(wineId) {
    const wine = await wineDB.getWine(wineId);
    if (!wine) return;

    app.currentWineId = wineId;
    app.photoData = wine.photo;
    app.photoThumbnail = wine.thumbnail || wine.photo;

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

        // アロマの段階
        document.getElementById('first-aroma').value = wine.tasting.firstAroma || '';
        document.getElementById('second-aroma').value = wine.tasting.secondAroma || '';
        document.getElementById('third-aroma').value = wine.tasting.thirdAroma || '';

        // 樽感
        document.getElementById('oak-intensity').value = wine.tasting.oakIntensity || '';

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

                ${wine.tasting.firstAroma || wine.tasting.secondAroma || wine.tasting.thirdAroma ? `
                    <div class="detail-row">
                        <div class="detail-label">🎓 アロマの段階（ソムリエ分類）</div>
                        <div class="detail-value">
                            ${wine.tasting.firstAroma ? `<div><strong>第一アロマ:</strong> ${escapeHtml(wine.tasting.firstAroma)}</div>` : ''}
                            ${wine.tasting.secondAroma ? `<div><strong>第二アロマ:</strong> ${escapeHtml(wine.tasting.secondAroma)}</div>` : ''}
                            ${wine.tasting.thirdAroma ? `<div><strong>第三アロマ:</strong> ${escapeHtml(wine.tasting.thirdAroma)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                ${wine.tasting.oakIntensity ? `
                    <div class="detail-row">
                        <div class="detail-label">🪵 樽感</div>
                        <div class="detail-value">${escapeHtml(wine.tasting.oakIntensity)}</div>
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


// ========================================
// トースト通知システム
// ========================================

function showToast(message, type = "info") {
    // 既存のトーストを削除
    const existingToast = document.getElementById("toast-container");
    if (existingToast) {
        existingToast.remove();
    }

    const colors = {
        success: "#4CAF50",
        error: "#f44336",
        info: "#2196F3",
        warning: "#FF9800"
    };

    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ",
        warning: "⚠"
    };

    const toast = document.createElement("div");
    toast.id = "toast-container";
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        max-width: 90%;
        animation: slideDown 0.3s ease forwards;
    `;

    toast.innerHTML = `
        <span style="font-size: 1.25rem;">${icons[type]}</span>
        <span>${escapeHtml(message)}</span>
    `;

    // アニメーション定義
    if (!document.getElementById("toast-styles")) {
        const style = document.createElement("style");
        style.id = "toast-styles";
        style.textContent = `
            @keyframes slideDown {
                to {
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 3秒後に自動削除
    setTimeout(() => {
        toast.style.animation = "slideUp 0.3s ease forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// ローディングインジケーター
// ========================================

function showLoading(message = "読み込み中...") {
    // 既存のローディングを削除
    hideLoading();

    const loading = document.createElement("div");
    loading.id = "loading-overlay";
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease;
    `;

    loading.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        ">
            <div class="spinner"></div>
            <div style="color: #333; font-weight: 500;">${escapeHtml(message)}</div>
        </div>
    `;

    // スピナーのスタイル定義
    if (!document.getElementById("loading-styles")) {
        const style = document.createElement("style");
        style.id = "loading-styles";
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #8B4789;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById("loading-overlay");
    if (loading) {
        loading.style.animation = "fadeOut 0.2s ease";
        setTimeout(() => loading.remove(), 200);
    }
}


// ========================================
// 統計画面表示
// ========================================

async function showStatsScreen() {
    showLoading('統計を計算中...');
    try {
        const wines = await wineDB.getAllWines();
        const stats = calculateStatistics(wines);

        const statsContent = document.getElementById('stats-content');
        const typeNames = { red: '赤ワイン', white: '白ワイン', rose: 'ロゼ', sparkling: 'スパークリング' };

        statsContent.innerHTML = `
            <div class="stat-card">
                <h3>📊 サマリー</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">総ワイン数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">⭐${stats.avgRating}</div>
                        <div class="stat-label">平均評価</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.favoriteCount}</div>
                        <div class="stat-label">お気に入り</div>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <h3>⭐ 評価分布</h3>
                ${Object.entries(stats.ratingDistribution).reverse().map(([rating, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return `<div class="stat-bar">
                        <div class="stat-bar-label">${'★'.repeat(parseInt(rating))}</div>
                        <div class="stat-bar-visual"><div class="stat-bar-fill" style="width: ${percentage}%"></div></div>
                        <div class="stat-bar-value">${count}</div>
                    </div>`;
                }).join('')}
            </div>

            ${Object.keys(stats.typeDistribution).length > 0 ? `
                <div class="stat-card">
                    <h3>🍷 ワインタイプ</h3>
                    ${Object.entries(stats.typeDistribution).map(([type, count]) => {
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return `<div class="stat-bar">
                            <div class="stat-bar-label">${typeNames[type] || type}</div>
                            <div class="stat-bar-visual"><div class="stat-bar-fill" style="width: ${percentage}%"></div></div>
                            <div class="stat-bar-value">${count}</div>
                        </div>`;
                    }).join('')}
                </div>
            ` : ''}

            ${Object.keys(stats.regionDistribution).length > 0 ? `
                <div class="stat-card">
                    <h3>🌍 産地トップ5</h3>
                    ${Object.entries(stats.regionDistribution).map(([region, count]) => {
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return `<div class="stat-bar">
                            <div class="stat-bar-label">${escapeHtml(region)}</div>
                            <div class="stat-bar-visual"><div class="stat-bar-fill" style="width: ${percentage}%"></div></div>
                            <div class="stat-bar-value">${count}</div>
                        </div>`;
                    }).join('')}
                </div>
            ` : ''}

            ${Object.keys(stats.varietyDistribution).length > 0 ? `
                <div class="stat-card">
                    <h3>🍇 品種トップ5</h3>
                    ${Object.entries(stats.varietyDistribution).map(([variety, count]) => {
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return `<div class="stat-bar">
                            <div class="stat-bar-label">${escapeHtml(variety)}</div>
                            <div class="stat-bar-visual"><div class="stat-bar-fill" style="width: ${percentage}%"></div></div>
                            <div class="stat-bar-value">${count}</div>
                        </div>`;
                    }).join('')}
                </div>
            ` : ''}
        `;

        hideLoading();
        showScreen('stats');
    } catch (error) {
        hideLoading();
        showToast('統計の表示に失敗しました', 'error');
        console.error('Stats error:', error);
    }
}

