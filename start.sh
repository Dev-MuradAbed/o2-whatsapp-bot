#!/bin/bash
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer

# شغّل السيرفر فوراً حتى يفتح الـ port
node index.js &
SERVER_PID=$!

# انتظر ثانيتين حتى يفتح السيرفر
sleep 2

# حمّل Chrome بالخلفية
echo "==> تحميل Chrome في الخلفية..."
npx puppeteer browsers install chrome 2>&1 | tail -5
echo "==> Chrome جاهز ✅ — البوت سيبدأ تلقائياً"

# انتظر السيرفر
wait $SERVER_PID
