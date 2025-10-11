// ========================================
// 拡張機能モジュール
// ========================================

// ========================================
// お気に入り機能
// ========================================

async function toggleFavorite(wineId) {
    try {
        const wine = await wineDB.getWine(wineId);
        if (!wine) return;

        wine.favorite = !wine.favorite;
        await wineDB.updateWine(wineId, wine);

        showToast(
            wine.favorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました',
            'success'
        );

        await loadWineList();
    } catch (error) {
        showToast('お気に入りの更新に失敗しました', 'error');
        console.error('Favorite toggle error:', error);
    }
}

// ========================================
// ソート機能
// ========================================

function sortWines(wines, sortBy) {
    const sorted = [...wines];

    switch (sortBy) {
        case 'date-desc':
            sorted.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return dateB - dateA;
            });
            break;

        case 'date-asc':
            sorted.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return dateA - dateB;
            });
            break;

        case 'rating-desc':
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;

        case 'rating-asc':
            sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;

        case 'name-asc':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));
            break;

        case 'name-desc':
            sorted.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'ja'));
            break;

        default:
            break;
    }

    return sorted;
}

// ========================================
// フィルター機能
// ========================================

function filterWines(wines, filterType) {
    if (filterType === 'all') {
        return wines;
    }

    if (filterType === 'favorite') {
        return wines.filter(wine => wine.favorite === true);
    }

    // ワインタイプでフィルター
    return wines.filter(wine => {
        return wine.tasting && wine.tasting.wineType === filterType;
    });
}

// ========================================
// 統計計算
// ========================================

function calculateStatistics(wines) {
    const total = wines.length;

    if (total === 0) {
        return {
            total: 0,
            avgRating: 0,
            ratingDistribution: {},
            typeDistribution: {},
            regionDistribution: {},
            varietyDistribution: {},
            favoriteCount: 0
        };
    }

    // 平均評価
    const totalRating = wines.reduce((sum, wine) => sum + (wine.rating || 0), 0);
    const avgRating = (totalRating / total).toFixed(1);

    // 評価分布
    const ratingDistribution = {};
    for (let i = 0; i <= 5; i++) {
        ratingDistribution[i] = wines.filter(w => (w.rating || 0) === i).length;
    }

    // ワインタイプ分布
    const typeDistribution = {};
    wines.forEach(wine => {
        if (wine.tasting && wine.tasting.wineType) {
            const type = wine.tasting.wineType;
            typeDistribution[type] = (typeDistribution[type] || 0) + 1;
        }
    });

    // 産地分布（トップ5）
    const regionCount = {};
    wines.forEach(wine => {
        if (wine.region) {
            regionCount[wine.region] = (regionCount[wine.region] || 0) + 1;
        }
    });
    const regionDistribution = Object.entries(regionCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    // 品種分布（トップ5）
    const varietyCount = {};
    wines.forEach(wine => {
        if (wine.variety) {
            varietyCount[wine.variety] = (varietyCount[wine.variety] || 0) + 1;
        }
    });
    const varietyDistribution = Object.entries(varietyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    // お気に入り数
    const favoriteCount = wines.filter(w => w.favorite === true).length;

    return {
        total,
        avgRating,
        ratingDistribution,
        typeDistribution,
        regionDistribution,
        varietyDistribution,
        favoriteCount
    };
}

// ========================================
// ダークモード機能
// ========================================

function initDarkMode() {
    // ローカルストレージから設定を読み込み
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    showToast(
        isDark ? 'ダークモードを有効にしました' : 'ライトモードに切り替えました',
        'info'
    );
}

// ========================================
// 初回訪問チュートリアル
// ========================================

function showTutorial() {
    // 既にチュートリアルを見たかチェック
    if (localStorage.getItem('tutorialShown') === 'true') {
        return;
    }

    const tutorial = document.createElement('div');
    tutorial.id = 'tutorial-overlay';
    tutorial.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    tutorial.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 90%;
            max-height: 80%;
            overflow-y: auto;
        ">
            <h2 style="margin: 0 0 1rem 0; color: #8B4789;">🍷 ワイン記録アプリへようこそ</h2>

            <div style="color: #333; line-height: 1.6; margin-bottom: 1.5rem;">
                <p><strong>このアプリでできること：</strong></p>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>飲んだワインの写真と詳細情報を記録</li>
                    <li>テイスティングメモを細かく記録</li>
                    <li>お気に入りのワインを管理</li>
                    <li>ワインを検索・ソート・フィルター</li>
                    <li>統計を確認して好みを分析</li>
                    <li>データをバックアップ（エクスポート/インポート）</li>
                </ul>

                <p style="margin-top: 1rem;"><strong>使い方：</strong></p>
                <ol style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li>右下の <strong>+</strong> ボタンで新規記録</li>
                    <li>写真、ワイン名、テイスティングメモを入力</li>
                    <li>保存後、一覧で確認・検索</li>
                    <li>カードをタップして詳細表示</li>
                </ol>

                <p style="margin-top: 1rem; padding: 0.75rem; background: #fff3e0; border-radius: 8px; font-size: 0.9rem;">
                    💡 <strong>ヒント：</strong>写真は自動的に圧縮されるので、容量を気にせず記録できます！
                </p>
            </div>

            <button id="tutorial-close-btn" style="
                width: 100%;
                padding: 0.875rem;
                background: linear-gradient(135deg, #8B4789 0%, #6B3569 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 1rem;
                cursor: pointer;
            ">はじめる</button>
        </div>
    `;

    document.body.appendChild(tutorial);

    document.getElementById('tutorial-close-btn').addEventListener('click', () => {
        tutorial.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            tutorial.remove();
            localStorage.setItem('tutorialShown', 'true');
        }, 300);
    });
}

// ========================================
// スワイプジェスチャー
// ========================================

function initSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let currentCard = null;
    let isHorizontalSwipe = null; // null: 未判定, true: 横スワイプ, false: 縦スクロール
    const SWIPE_THRESHOLD = 15; // スワイプ判定の閾値
    const MAX_SWIPE_DISTANCE = 150; // 最大スワイプ距離（カードの動きを制限）

    const resetSwipe = () => {
        if (currentCard) {
            currentCard.style.transition = 'transform 0.3s ease';
            currentCard.style.transform = '';
        }
        currentCard = null;
        isHorizontalSwipe = null;
        startX = 0;
        startY = 0;
    };

    document.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.wine-card');
        if (!card) return;

        // お気に入りボタンをタップした場合はスワイプを無効化
        if (e.target.closest('.favorite-btn')) return;

        currentCard = card;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isHorizontalSwipe = null;

        // トランジションを無効化
        currentCard.style.transition = 'none';
    });

    document.addEventListener('touchmove', (e) => {
        if (!currentCard) return;

        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // スワイプ方向がまだ決定していない場合、方向を判定
        if (isHorizontalSwipe === null) {
            if (absDeltaX > SWIPE_THRESHOLD || absDeltaY > SWIPE_THRESHOLD) {
                // 横方向の動きが縦方向より大きければ横スワイプ
                isHorizontalSwipe = absDeltaX > absDeltaY;
            } else {
                return; // まだ閾値に達していない
            }
        }

        // 縦スクロールと判定された場合は何もしない
        if (isHorizontalSwipe === false) {
            return;
        }

        // 横スワイプの場合、カードを動かす
        if (isHorizontalSwipe === true) {
            e.preventDefault(); // スクロールを防止

            // スワイプ距離を制限
            let limitedDeltaX = deltaX;
            if (Math.abs(limitedDeltaX) > MAX_SWIPE_DISTANCE) {
                limitedDeltaX = limitedDeltaX > 0 ? MAX_SWIPE_DISTANCE : -MAX_SWIPE_DISTANCE;
            }

            currentCard.style.transform = `translateX(${limitedDeltaX}px)`;
        }
    });

    document.addEventListener('touchend', (e) => {
        if (!currentCard || isHorizontalSwipe !== true) {
            resetSwipe();
            return;
        }

        const deltaX = e.changedTouches[0].clientX - startX;
        currentCard.style.transition = 'transform 0.3s ease';

        // 右スワイプ（お気に入り）- 80pxに閾値を下げて操作しやすく
        if (deltaX > 80) {
            const wineId = parseInt(currentCard.dataset.id);
            toggleFavorite(wineId);
        }

        // 元に戻す
        setTimeout(() => {
            if (currentCard) {
                currentCard.style.transform = '';
            }
        }, 10);

        currentCard = null;
        isHorizontalSwipe = null;
    });

    // タッチがキャンセルされた場合の処理
    document.addEventListener('touchcancel', () => {
        resetSwipe();
    });
}

// ========================================
// エクスポート（グローバルスコープに追加）
// ========================================

if (typeof window !== 'undefined') {
    window.toggleFavorite = toggleFavorite;
    window.sortWines = sortWines;
    window.filterWines = filterWines;
    window.calculateStatistics = calculateStatistics;
    window.initDarkMode = initDarkMode;
    window.toggleDarkMode = toggleDarkMode;
    window.showTutorial = showTutorial;
    window.initSwipeGestures = initSwipeGestures;
}
