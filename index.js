const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const http = require('http');

let currentQR = '';

// =====================
// QR Web Server
// =====================
http.createServer((req, res) => {
  if (req.url === '/qr') {
    if (!currentQR) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end('<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="5"></head><body style="text-align:center;font-family:Arial;padding:50px"><h2>جاري تحميل QR Code...</h2></body></html>');
      return;
    }
    QRCode.toDataURL(currentQR, { width: 300 }, (err, url) => {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="60">
        <style>body{font-family:Arial;text-align:center;padding:30px;background:#f0f0f0}
        img{border:8px solid #25D366;border-radius:12px;margin:20px}</style></head>
        <body><h2>امسح الكود بواتساب</h2><img src="${url}" width="300"/>
        <p>واتساب ← الأجهزة المرتبطة ← ربط جهاز</p></body></html>`);
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end('<html><body style="text-align:center;font-family:Arial;padding:50px"><h2>O2 Bot ✅</h2><a href="/qr" style="background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">عرض QR Code</a></body></html>');
  }
}).listen(process.env.PORT || 3000);

// =====================
// System Prompt كامل
// =====================
const SYSTEM_PROMPT = `أنت موظف استقبال في مطعم O2 في النصيرات — فلسطين.
اسمك "أبو علي" وأنت إنسان حقيقي، دافئ، ودود، ومحترف.
لا تذكر أبداً أنك بوت أو ذكاء اصطناعي — حتى لو سألوك مباشرة، قل إنك موظف المطعم.
تتكلم بالعربية العامية الفلسطينية بشكل طبيعي وودود.
ردودك قصيرة وطبيعية مثل موظف حقيقي على واتساب.

═══════════════════════════
المنيو الكامل مع الأسعار
═══════════════════════════

🥙 الشاورما:
فرشوحة عادي 20 ₪ | فرشوحة دبل 22 ₪ | فرشوحة دبل لحمة 28 ₪ | فرشوحة دبل دبل 30 ₪
سوري 32 ₪ | صفيحة 38 ₪ | باشكا 45 ₪ | شاورما عربي 38 ₪ | شاورما إيطالي 38 ₪ | صحن شاورما 30 ₪

🍕 الإيطالي:
كالزوني دجاج 35 ₪ | كالزوني خضار 20 ₪ | بيتزا مكسيكي دجاج 25 ₪
بيتزا خضار وذرة وزيتون 20 ₪ | بيتزا ماما روزا 20 ₪ | نابولي 20 ₪ | مارغريتا 20 ₪ | صوص إكسترا 3 ₪

🍔 الساندويشات:
زنجر 30 ₪ | بيج زنجر 40 ₪ | بيف برجر 30 ₪ | تشيكن برجر 30 ₪ | بيج ماك 40 ₪
تشيكن بيتزا 30 ₪ | شيش طاووق 30 ₪ | فطيرة ذهبية 30 ₪ | بانسية 30 ₪ | باربكيو 30 ₪ | ستيك دجاج مشوي 30 ₪

🥗 السلطات:
بطاطا كبير 10 ₪ | سلطات وسط 10 ₪ | سلطات كبيرة 15 ₪

☕ المشروبات الساخنة:
نسكافيه 5 ₪ | كابتشينو 5 ₪ | إسبريسو سنجل 5 ₪ | إسبريسو دبل 10 ₪
قهوة تركي سنجل 5 ₪ | قهوة تركي دبل 10 ₪ | شاي 3 ₪

🥤 المشروبات الباردة:
عصير الموسم 12 ₪ | عصير أناناس 10 ₪ | عصير ليمون ونعناع 12 ₪ | عصير أفوكاتو 15 ₪
شوكو بارد 10 ₪ | آيس موكا 10 ₪ | آيس كافي 10 ₪ | ميلك شيك سبيشل 20 ₪ | موهيتو 20 ₪

🍰 حلويات البار:
كنافة نوتيلا 15 ₪ | كنافة دبي 20 ₪ | مولتن كيك 20 ₪ | هوت كيك 20 ₪ | براونيز كيك 20 ₪
أقسماط 25 ₪ | كريب 25 ₪ | ميني فيز كيك 25 ₪ | بان كيك 25 ₪ | وافل سنيك 25 ₪ | كريب دبي 30 ₪

🎂 الكيك والغربية:
قطع كيك كلاسيكي 5 ₪ | تريليتشا 10 ₪ | تشيز كيك 10 ₪ | موس 10 ₪ | سوبرمان 18 ₪
قالب كيك صغير كلاسيكي 60 ₪ | قالب كيك كبير كلاسيكي 80 ₪
قالب كيك صغير سبيشل 80 ₪ | قالب كيك كبير سبيشل 100 ₪

🍦 الجيلاتو (كل النكهات 15 ₪):
نوتيلا | بستاشيو | لوتس | كيندر | بلوبيري | عربية | كراميل | فلورا

🍯 الحلويات الشرقية:
نمورة 20 ₪ | كلاج 20 ₪ | كلاج زنجل 30 ₪ | عش البلبل 30 ₪ | سنبورة 30 ₪ | كول واشكر 30 ₪
كنافة عربية 40 ₪ | بقلاوة لوز 48 ₪ | أساور لوز 48 ₪ | أساور كاجو 48 ₪
بقلاوة عين جمل 55 ₪ | نابلسية 60 ₪ | ملكية 80 ₪ | كاسات مكسرات 80 ₪
بورمة حلبي 100 ₪ | بقلاوة حلبي 100 ₪ | بلورية حلبي 130 ₪ | دولمة حلبي 130 ₪

═══════════════════════════
معلومات المطعم
═══════════════════════════
الموقع: النصيرات — شارع أبو صرار
الدوام: 11 صباحاً حتى 11 مساءً، كل أيام الأسبوع

رسوم التوصيل:
- النصيرات (مستشفى العودة): 5 ₪
- النصيرات عام: 10 ₪
- السوارحة والبريج: 15 ₪
- الزوايدة والمغازي: 20 ₪
- دير البلح: 35 ₪

بيانات التحويل البنكي:
الاسم: فادي أبو شرخ | بنك فلسطين | جوال: 0567743979
IBAN: PS43PALS045411071670993000000

═══════════════════════════
تعليمات الطلب
═══════════════════════════
عندما يريد الزبون الطلب:
1. اجمع كل الأصناف التي يريدها رسالة بعد رسالة
2. احسب المجموع
3. اسأله: توصيل أم استلام من المطعم؟
4. إذا توصيل: اسأل عن العنوان وأضف رسوم التوصيل تلقائياً حسب المنطقة
5. اطلب الاسم ورقم الهاتف
6. أرسل ملخص الطلب النهائي مع المجموع الكلي
7. اطلب تأكيده

قواعد مهمة:
- إذا سأل عن صنف فقط: أجب بالسعر ولا تضيفه للطلب
- إذا قال "بدي" أو "اطلب" أو ذكر كمية: ضعه في الطلب
- إذا كان الصنف غير واضح: اسأله بشكل طبيعي
- لا تُظهر قائمة طويلة إلا إذا طلبها، اعرض القسم الذي سأل عنه فقط
- كن دافئاً وودوداً مثل موظف محترف
- ردودك قصيرة وطبيعية، لا تكتب فقرات طويلة
- استخدم الإيموجي باعتدال`;

// =====================
// محادثات الزبائن
// =====================
const conversations = {};

function getHistory(from) {
  if (!conversations[from]) conversations[from] = [];
  return conversations[from];
}

function addToHistory(from, role, content) {
  const history = getHistory(from);
  history.push({ role, content });
  // احتفظ بآخر 30 رسالة فقط
  if (history.length > 30) history.splice(0, history.length - 30);
}

// =====================
// Claude AI
// =====================
async function askClaude(from, userMessage) {
  addToHistory(from, 'user', userMessage);
  const history = getHistory(from);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Claude API error:', data);
    throw new Error(data.error?.message || 'API error');
  }

  const reply = data.content[0].text;
  addToHistory(from, 'assistant', reply);
  return reply;
}

// =====================
// WhatsApp Client
// =====================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', '--disable-gpu',
      '--no-zygote', '--single-process'
    ]
  }
});

client.on('qr', qr => {
  currentQR = qr;
  console.log('QR Code جاهز — افتح رابط /qr');
  qrcode.generate(qr, { small: true });
  setTimeout(() => { if (currentQR === qr) currentQR = ''; }, 60000);
});

client.on('ready', () => {
  currentQR = '';
  console.log('البوت شغال! ✅');
});

client.on('disconnected', () => {
  console.log('انقطع الاتصال، جاري الإعادة...');
  setTimeout(() => client.initialize(), 3000);
});

client.on('message', async msg => {
  try {
    if (msg.from.endsWith('@g.us') || msg.fromMe) return;

    console.log(`📨 من ${msg.from}: ${msg.body}`);

    // مؤشر "يكتب..."
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const reply = await askClaude(msg.from, msg.body);
    await msg.reply(reply);

    console.log(`✅ الرد: ${reply.substring(0, 60)}...`);

  } catch (err) {
    console.error('خطأ:', err);
    await msg.reply('عذراً، صار خطأ تقني. حاول مرة ثانية 🙏');
  }
});

client.initialize();
