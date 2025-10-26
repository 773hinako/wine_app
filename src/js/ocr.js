// OCR処理モジュール - Tesseract.jsを使用してワインラベルからテキストを抽出

class WineOCR {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }

    // Tesseract.js ワーカーの初期化
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Tesseract.js初期化中（英語・フランス語・イタリア語・スペイン語）...');
            this.worker = await Tesseract.createWorker('eng+fra+ita+spa', 1, {
                logger: m => {
                    // 進捗状況をコンソールに出力（デバッグ用）
                    if (m.status === 'loading tesseract core' || 
                        m.status === 'loading language traineddata' ||
                        m.status === 'recognizing text') {
                        console.log(`${m.status}: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });
            this.isInitialized = true;
            console.log('Tesseract.js初期化完了（4言語対応）');
        } catch (error) {
            console.error('Tesseract.js初期化エラー:', error);
            throw error;
        }
    }

    // 画像の前処理（サイズ最適化とコントラスト調整）
    async preprocessImage(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 最大幅を1200pxに制限（スマホでの処理速度向上）
                const maxWidth = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 画像を描画
                ctx.drawImage(img, 0, 0, width, height);
                
                // コントラスト調整（OCR精度向上）
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                const factor = 1.2; // コントラスト係数
                
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * factor);     // R
                    data[i + 1] = Math.min(255, data[i + 1] * factor); // G
                    data[i + 2] = Math.min(255, data[i + 2] * factor); // B
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject;
            img.src = imageData;
        });
    }

    // 画像からテキストを認識
    async recognizeText(imageData) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log('画像前処理中...');
            const processedImage = await this.preprocessImage(imageData);
            
            console.log('OCR処理開始...');
            const { data } = await this.worker.recognize(processedImage);
            console.log('OCR処理完了');
            console.log('認識されたテキスト:', data.text);
            
            return data.text;
        } catch (error) {
            console.error('OCR処理エラー:', error);
            throw error;
        }
    }

    // ワイン情報を抽出
    extractWineInfo(ocrText) {
        const info = {
            name: '',
            producer: '',
            vintage: null,
            region: '',
            confidence: {
                name: 0,
                producer: 0,
                vintage: 0,
                region: 0
            }
        };

        if (!ocrText || ocrText.trim() === '') {
            return info;
        }

        // テキストを行に分割
        const lines = ocrText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // 1. ヴィンテージ抽出（最も信頼性が高い）
        const vintageMatch = ocrText.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
        if (vintageMatch) {
            const year = parseInt(vintageMatch[1]);
            const currentYear = new Date().getFullYear();
            // 妥当な年号範囲チェック
            if (year >= 1950 && year <= currentYear + 2) {
                info.vintage = year;
                info.confidence.vintage = 95;
            }
        }

        // 2. 生産者抽出（キーワードベース）
        const producerKeywords = [
            // フランス語
            'Château', 'Chateau', 'Domaine', 'Maison', 'Cave',
            // イタリア語
            'Tenuta', 'Cantina', 'Azienda', 'Agricola', 'Fattoria', 'Castello',
            'Podere', 'Vigneto', 'Vigna',
            // スペイン語
            'Bodega', 'Bodegas', 'Viñedo', 'Vinedo', 'Hacienda', 'Finca',
            'Herederos', 'Marqués', 'Marques',
            // 英語
            'Estate', 'Vineyard', 'Winery', 'Cellars', 'Wines'
        ];

        for (const line of lines) {
            for (const keyword of producerKeywords) {
                if (line.includes(keyword)) {
                    info.producer = line;
                    info.confidence.producer = 70;
                    break;
                }
            }
            if (info.producer) break;
        }

        // 3. 産地抽出（有名産地名）
        const regionKeywords = [
            // フランス
            'Bordeaux', 'Bourgogne', 'Burgundy', 'Champagne', 'Alsace',
            'Rhône', 'Rhone', 'Loire', 'Provence', 'Languedoc',
            'Beaujolais', 'Médoc', 'Medoc', 'Pomerol', 'Saint-Émilion', 'Saint-Emilion',
            'Margaux', 'Pauillac', 'Sauternes', 'Chablis', 'Côte', 'Cote',
            // イタリア
            'Toscana', 'Tuscany', 'Piemonte', 'Piedmont', 'Veneto',
            'Chianti', 'Barolo', 'Barbaresco', 'Brunello', 'Montalcino',
            'Montepulciano', 'Valpolicella', 'Amarone', 'Soave',
            'Friuli', 'Langhe', 'Bolgheri', 'Sicilia', 'Sicily',
            // スペイン
            'Rioja', 'Ribera del Duero', 'Priorat', 'Penedès', 'Penedes',
            'Rías Baixas', 'Rias Baixas', 'Jerez', 'Sherry', 'Rueda',
            'Jumilla', 'Toro', 'Bierzo', 'Somontano', 'Navarra',
            // その他
            'Napa Valley', 'Napa', 'Sonoma', 'Mendoza', 'Marlborough',
            'Barossa', 'McLaren Vale', 'Stellenbosch', 'Mosel', 'Rheingau', 'Pfalz'
        ];

        for (const line of lines) {
            for (const region of regionKeywords) {
                if (line.toLowerCase().includes(region.toLowerCase())) {
                    info.region = region;
                    info.confidence.region = 80;
                    break;
                }
            }
            if (info.region) break;
        }

        // 4. ワイン名抽出（ヒューリスティック）
        // 最も長い行、または大文字が多い行をワイン名と推定
        if (!info.name && lines.length > 0) {
            // 生産者行を除外
            const candidateLines = lines.filter(line => line !== info.producer);
            
            if (candidateLines.length > 0) {
                // 最初の数行から最も長い行を選択
                const topLines = candidateLines.slice(0, Math.min(5, candidateLines.length));
                info.name = topLines.reduce((longest, current) => 
                    current.length > longest.length ? current : longest
                , '');
                info.confidence.name = 50; // 推測なので低め
            }
        }

        return info;
    }

    // クリーンアップ
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
            console.log('Tesseract.js終了');
        }
    }
}

// グローバルインスタンス
const wineOCR = new WineOCR();

// OCRボタンのイベントハンドラー（app.jsから呼び出される）
async function performOCR() {
    if (!app.photoData) {
        showToast('先に写真を選択してください', 'error');
        return;
    }

    const ocrBtn = document.getElementById('ocr-btn');
    const ocrResult = document.getElementById('ocr-result');
    
    try {
        // ボタン無効化
        ocrBtn.disabled = true;
        ocrBtn.textContent = '🔄 読み取り中...';
        
        // スマホ向けの改善されたメッセージ
        const isFirstTime = !wineOCR.isInitialized;
        const loadingMsg = isFirstTime 
            ? 'ラベルを読み取っています...\n初回は30-40秒かかります\n（4言語データ読み込み中）'
            : 'ラベルを読み取っています...\n（10-15秒程度）';
        
        showLoading(loadingMsg);

        // OCR実行
        const ocrText = await wineOCR.recognizeText(app.photoData);
        
        // ワイン情報を抽出
        const wineInfo = wineOCR.extractWineInfo(ocrText);

        hideLoading();

        // 結果を表示
        displayOCRResult(wineInfo, ocrText);

        // フォームに自動入力
        autoFillForm(wineInfo);

        showToast('ラベルの読み取りが完了しました', 'success');

    } catch (error) {
        hideLoading();
        console.error('OCRエラー:', error);
        showToast('ラベルの読み取りに失敗しました', 'error');
        
        ocrResult.innerHTML = `
            <div class="ocr-error">
                <p style="color: #d32f2f; font-weight: bold;">❌ エラー</p>
                <p style="font-size: 0.875rem; color: #666;">
                    読み取りに失敗しました。以下をお試しください：<br>
                    • 明るい場所で撮影してください<br>
                    • ラベル全体がはっきり写るように<br>
                    • ピントが合っているか確認<br>
                    • 斜めからではなく正面から撮影<br>
                    • 画像が大きすぎる場合は時間がかかります
                </p>
            </div>
        `;
        ocrResult.style.display = 'block';
    } finally {
        ocrBtn.disabled = false;
        ocrBtn.textContent = '🔍 ラベルを読み取る';
    }
}

// OCR結果を表示
function displayOCRResult(wineInfo, rawText) {
    const ocrResult = document.getElementById('ocr-result');
    
    let html = '<div class="ocr-success"><h4>📋 読み取り結果</h4>';
    
    // 抽出された情報
    if (wineInfo.vintage) {
        html += `<p><strong>ヴィンテージ:</strong> ${wineInfo.vintage} <span style="color: #4caf50;">✓ 自信度 ${wineInfo.confidence.vintage}%</span></p>`;
    }
    
    if (wineInfo.name) {
        html += `<p><strong>ワイン名（推定）:</strong> ${escapeHtml(wineInfo.name)} <span style="color: #ff9800;">⚠ 自信度 ${wineInfo.confidence.name}%</span></p>`;
    }
    
    if (wineInfo.producer) {
        html += `<p><strong>生産者（推定）:</strong> ${escapeHtml(wineInfo.producer)} <span style="color: #ff9800;">⚠ 自信度 ${wineInfo.confidence.producer}%</span></p>`;
    }
    
    if (wineInfo.region) {
        html += `<p><strong>産地（推定）:</strong> ${wineInfo.region} <span style="color: #4caf50;">✓ 自信度 ${wineInfo.confidence.region}%</span></p>`;
    }

    // 認識されたテキスト全体（折りたたみ可能）
    html += `
        <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; color: #666; font-size: 0.875rem;">認識されたテキスト全体を見る</summary>
            <pre style="background: #f5f5f5; padding: 0.75rem; border-radius: 4px; font-size: 0.75rem; overflow-x: auto; margin-top: 0.5rem;">${escapeHtml(rawText)}</pre>
        </details>
    `;
    
    html += '<p style="font-size: 0.875rem; color: #666; margin-top: 1rem;">💡 推定値は必ず確認・修正してください</p></div>';
    
    ocrResult.innerHTML = html;
    ocrResult.style.display = 'block';
}

// フォームに自動入力
function autoFillForm(wineInfo) {
    // ヴィンテージ（最も信頼性が高い）
    if (wineInfo.vintage && wineInfo.confidence.vintage >= 80) {
        const vintageInput = document.getElementById('vintage');
        if (!vintageInput.value) {  // 既存の値がない場合のみ
            vintageInput.value = wineInfo.vintage;
            vintageInput.style.backgroundColor = '#e8f5e9';  // 緑のハイライト
            setTimeout(() => {
                vintageInput.style.backgroundColor = '';
            }, 2000);
        }
    }

    // ワイン名（自信度が低いので慎重に）
    if (wineInfo.name && wineInfo.confidence.name >= 40) {
        const nameInput = document.getElementById('wine-name');
        if (!nameInput.value) {
            nameInput.value = wineInfo.name;
            nameInput.style.backgroundColor = '#fff9c4';  // 黄色のハイライト（要確認）
            setTimeout(() => {
                nameInput.style.backgroundColor = '';
            }, 2000);
        }
    }

    // 生産者
    if (wineInfo.producer && wineInfo.confidence.producer >= 60) {
        const producerInput = document.getElementById('producer');
        if (!producerInput.value) {
            producerInput.value = wineInfo.producer;
            producerInput.style.backgroundColor = '#fff9c4';
            setTimeout(() => {
                producerInput.style.backgroundColor = '';
            }, 2000);
        }
    }

    // 産地
    if (wineInfo.region && wineInfo.confidence.region >= 70) {
        const regionInput = document.getElementById('region');
        if (!regionInput.value) {
            regionInput.value = wineInfo.region;
            regionInput.style.backgroundColor = '#e8f5e9';
            setTimeout(() => {
                regionInput.style.backgroundColor = '';
            }, 2000);
        }
    }
}
