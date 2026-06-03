#!/bin/bash
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer

echo "==> تحميل Chrome..."
npx puppeteer browsers install chrome
echo "==> Chrome جاهز ✅"

echo "==> تشغيل البوت..."
node index.js
