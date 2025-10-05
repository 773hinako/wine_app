#!/bin/bash

echo "=========================================="
echo "  ワイン記録アプリ サーバー起動"
echo "=========================================="
echo ""
echo "サーバーを起動しています..."
echo ""

# ローカルIPアドレスを取得
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac
    IP=$(ipconfig getifaddr en0)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

echo "サーバーが起動しました！"
echo ""
echo "【アクセスURL】"
echo " - PC から: http://localhost:8000"
echo " - スマホから: http://$IP:8000"
echo ""
echo "停止するには Ctrl+C を押してください"
echo "=========================================="
echo ""

python3 -m http.server 8000 --bind 0.0.0.0
