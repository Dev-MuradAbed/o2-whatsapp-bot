#!/bin/bash
echo "==> تشغيل السيرفر..."
node index.js &
SERVER_PID=$!

echo "==> تثبيت Chrome في الخلفية..."
npx puppeteer browsers install chrome
echo "==> Chrome جاهز ✅"

wait $SERVER_PID
