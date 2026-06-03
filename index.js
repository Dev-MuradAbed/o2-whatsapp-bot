const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const http = require('http');

let currentQR = '';
let qrTimestamp = null;

// سيرفر بسيط لعرض QR Code كصورة
http.createServer((req, res) => {
  if (req.url === '/qr') {
    if (!currentQR) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`
        <html><head><meta charset="utf-8">
        <meta http-equiv="refresh" content="5">
        <style>body{font-family:Arial;text-align:center;padding:50px;background:#f0f0f0}</style>
        </head><body>
        <h2>جاري تحميل QR Code...</h2>
        <p>الصفحة ستتحدث تلقائياً</p>
        </body></html>
      `);
      return;
    }
    QRCode.toDataURL(currentQR, { width: 300 }, (err, url) => {
      const now = new Date();
      const expires = new Date(qrTimestamp.getTime() + 60000);
      const remaining = Math.max(0, Math.round((expires - now) / 1000));
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`
        <html><head><meta charset="utf-8">
        <meta http-equiv="refresh" content="60">
        <style>
          body{font-family:Arial;text-align:center;padding:30px;background:#f0f0f0}
          img{border:8px solid #25D366;border-radius:12px;margin:20px}
          h2{color:#075E54} p{color:#555;font-size:18px}
          .timer{font-size:22px;font-weight:bold;color:#e74c3c}
        </style>
        </head><body>
        <h2>امسح الكود بواتساب</h2>
        <img src="${url}" width="300" height="300"/>
        <p>افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز</p>
        <p class="timer">ينتهي خلال: ${remaining} ثانية</p>
        <p style="color:#999;font-size:14px">الصفحة تتحدث تلقائياً كل دقيقة</p>
        </body></html>
      `);
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`
      <html><head><meta charset="utf-8">
      <style>body{font-family:Arial;text-align:center;padding:50px;background:#f0f0f0}
      a{display:inline-block;padding:15px 30px;background:#25D366;color:white;text-decoration:none;border-radius:8px;font-size:20px;margin-top:20px}
      </style></head><body>
      <h2>O2 WhatsApp Bot</h2>
      <p>البوت شغال ✅</p>
      <a href="/qr">عرض QR Code</a>
      </body></html>
    `);
  }
}).listen(process.env.PORT || 3000);

console.log(`السيرفر شغال على port ${process.env.PORT || 3000}`);

// ===================================
//   ردود البوت - عدّلها كما تريد
// ===================================
const replies = [
  {
    keys: ["مرحبا", "هلا", "اهلا", "السلام", "هاي", "hi", "hello", "مساء", "صباح"],
    text: `أهلاً وسهلاً! 👋
أنا بوت خدمة عملاء O2.
كيف أقدر أساعدك؟

1️⃣ باقات الإنترنت
2️⃣ الأسعار والعروض
3️⃣ حجز موعد
4️⃣ تقديم شكوى
5️⃣ التحدث مع موظف`
  },
  {
    keys: ["باقة", "نت", "انترنت", "اينترنت", "داتا", "بيانات", "باقات", "1"],
    text: `باقات الإنترنت لدينا 📶

🔹 باقة 10GB  — 15$ شهرياً
🔹 باقة 25GB  — 25$ شهرياً
🔹 باقة 50GB  — 40$ شهرياً
🔹 باقة غير محدودة — 60$ شهرياً

للاشتراك أرسل: *اشتراك + اسم الباقة*`
  },
  {
    keys: ["سعر", "تكلفة", "كم", "أسعار", "اسعار", "2"],
    text: `أسعارنا 💰

📱 باقات الإنترنت: تبدأ من 15$
📞 باقات المكالمات: تبدأ من 10$
📦 باقات مجمعة: تبدأ من 20$

أرسل *باقات* لعرض التفاصيل الكاملة`
  },
  {
    keys: ["عرض", "خصم", "تخفيض", "عروض", "تنزيلات"],
    text: `عروضنا الحالية 🎉

✅ خصم 20% على الباقة السنوية
✅ شهر مجاني عند الاشتراك الجديد
✅ ضعف البيانات لأول 3 أشهر

العرض ينتهي قريباً — تواصل معنا الآن!`
  },
  {
    keys: ["حجز", "موعد", "ميعاد", "زيارة", "فرع", "3"],
    text: `حجز موعد في الفرع 📅

أرسل المعلومات التالية:
• الاسم الكامل
• رقم هاتفك
• المدينة
• الوقت المفضل

وسنتواصل معك خلال 24 ساعة لتأكيد الموعد ✅`
  },
  {
    keys: ["إلغاء", "الغاء", "كنسل", "ألغي"],
    text: `لإلغاء الموعد ❌

أرسل: *إلغاء + رقم الحجز*
مثال: إلغاء 12345

أو تواصل معنا على: 9200`
  },
  {
    keys: ["شكوى", "مشكلة", "عطل", "خراب", "مشاكل", "4"],
    text: `تسجيل شكوى 📝

نأسف على الإزعاج!
رقم تذكرتك: #${Math.floor(10000 + Math.random() * 90000)}

سيتواصل معك فريق الدعم خلال 2-4 ساعات.

لمتابعة شكواك أرسل: *متابعة + رقم التذكرة*`
  },
  {
    keys: ["متابعة", "تتبع", "وصلت", "وين"],
    text: `متابعة الشكوى 🔍

أرسل رقم التذكرة وسنزودك بآخر تحديث فوراً.

حالة شكواك الحالية: *قيد المعالجة* ⏳`
  },
  {
    keys: ["استرداد", "فلوس", "مبلغ", "رجعلي", "رد مبلغ"],
    text: `طلب استرداد مبلغ 💳

لتقديم طلب الاسترداد أرسل:
• رقم الفاتورة
• المبلغ المراد استرداده
• سبب الطلب

سيتم مراجعة طلبك خلال 5-7 أيام عمل`
  },
  {
    keys: ["موظف", "بشري", "شخص", "انسان", "تحدث", "5"],
    text: `التحويل لموظف 👨‍💼

سيتم تحويلك لأحد موظفينا خلال دقائق.
أوقات الدوام: 9 صباحاً - 9 مساءً

إذا كان خارج أوقات الدوام سنتواصل معك في أقرب وقت ✅`
  },
  {
    keys: ["شكرا", "شكراً", "ممتاز", "تمام", "يسلمو", "مشكور"],
    text: `العفو! يسعدنا خدمتك دائماً 😊
لا تتردد بالتواصل معنا في أي وقت.

O2 — دائماً في خدمتك 💚`
  },
];

const defaultReply = `شكراً على رسالتك! 🤖

للمساعدة اكتب إحدى الكلمات التالية:
• *باقات* — لعرض باقات الإنترنت
• *أسعار* — لمعرفة الأسعار
• *عروض* — للعروض والخصومات
• *حجز موعد* — لحجز في الفرع
• *شكوى* — لتقديم شكوى
• *موظف* — للتحدث مع موظف

أو اتصل بنا: 9200`;

function findReply(msg) {
  const lower = msg.toLowerCase().trim();
  for (const r of replies) {
    if (r.keys.some(k => lower.includes(k))) {
      return r.text;
    }
  }
  return null;
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process'
    ]
  }
});

client.on('qr', qr => {
  currentQR = qr;
  qrTimestamp = new Date();
  console.log('QR Code جديد — افتح رابط /qr لمسحه');
  qrcode.generate(qr, { small: true });

  // تجديد تلقائي كل 60 ثانية
  setTimeout(() => {
    if (currentQR === qr) {
      currentQR = '';
      console.log('QR Code انتهت صلاحيته — سيظهر كود جديد قريباً');
    }
  }, 60000);
});

client.on('ready', () => {
  currentQR = '';
  console.log('\n==========================================');
  console.log('        البوت شغال بنجاح! ✅');
  console.log('==========================================\n');
});

client.on('auth_failure', () => {
  console.log('فشل تسجيل الدخول — أعد تشغيل البوت');
});

client.on('disconnected', (reason) => {
  console.log('البوت انقطع:', reason);
  console.log('جاري إعادة الاتصال...');
  client.initialize();
});

client.on('message', async msg => {
  try {
    if (msg.from.endsWith('@g.us')) return;
    if (msg.fromMe) return;

    console.log(`رسالة من ${msg.from}: ${msg.body}`);

    const reply = findReply(msg.body);
    if (reply) {
      await msg.reply(reply);
      console.log('تم الرد تلقائياً ✅');
    } else {
      await msg.reply(defaultReply);
      console.log('تم إرسال الرد الافتراضي');
    }
  } catch (err) {
    console.error('خطأ في معالجة الرسالة:', err);
  }
});

client.initialize();
