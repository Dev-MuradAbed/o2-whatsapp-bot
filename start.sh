#!/bin/bash
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer

echo "==> تثبيت Chrome..."
npx puppeteer browsers install chrome --path $PUPPETEER_CACHE_DIR
echo "==> Chrome جاهز ✅"

echo "==> تشغيل البوت..."
node index.js
