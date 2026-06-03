#!/bin/bash
echo "==> تثبيت Chrome..."
npx puppeteer browsers install chrome
echo "==> Chrome جاهز، تشغيل البوت..."
node index.js
