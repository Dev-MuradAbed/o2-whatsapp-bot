const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const http = require('http');
const fs = require('fs');
const path = require('path');

let currentQR = '';
let botReady = false;

// =====================
// QR Web Server — يشتغل فوراً
// =====================
http.createServer((req, res) => {
  if (req.url === '/qr') {
    if (!currentQR) {
      res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
      res.end(`<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="5"><style>body{font-family:Arial;text-align:center;padding:50px;background:#f0f0f0}</style></head><body><h2>${botReady ? 'البوت جاهز ✅' : 'جاري تحميل Chrome...'}</h2><p>الصفحة تتحدث كل 5 ثواني</p></body></html>`);
      return;
    }
    QRCode.toDataURL(currentQR, {width:300}, (err, url) => {
      res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
      res.end(`<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="60"><style>body{font-family:Arial;text-align:center;padding:30px;background:#f0f0f0}img{border:8px solid #25D366;border-radius:12px;margin:20px}h2{color:#075E54}</style></head><body><h2>امسح الكود بواتساب</h2><img src="${url}" width="300"/><p>واتساب ← الأجهزة المرتبطة ← ربط جهاز</p></body></html>`);
    });
  } else {
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end(`<html><body style="text-align:center;font-family:Arial;padding:50px;background:#f0f0f0"><h2>مطعم O2 Bot ${botReady ? '✅ شغال' : '⏳ جاري التحضير'}</h2><a href="/qr" style="display:inline-block;margin-top:20px;background:#25D366;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:18px">عرض QR Code</a></body></html>`);
  }
}).listen(process.env.PORT || 3000, () => {
  console.log(`✅ السيرفر شغال على port ${process.env.PORT || 3000}`);
  // ابدأ تهيئة البوت بعد ما السيرفر يشتغل
  initBot();
});

// =====================
// ردود عشوائية
// =====================
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const GREETINGS = [
  'أهلاً وسهلاً! 🌿 شو بدك اليوم؟',
  'هلا هلا! 😊 كيف أقدر أخدمك؟',
  'أهلين! يا هلا، شو رأيك تطلب اليوم؟ 😄',
  'مرحبا! 🌿 تكرم، شو بتحب؟',
  'هلا فيك! شو بيخدمك اليوم؟ 😊',
];
const WAIT_MSGS = [
  'تمام، معك! 👍',
  'اوك، شو كمان بدك؟ 😊',
  'تمام تمام! في غير شي؟',
  'اوك حبيبي، كمّل! 👌',
  'ماشي، شو بدك تضيف؟',
];
const CONFIRM_MSGS = [
  'هاد كل شي؟ 😊',
  'في غير شي تحب تضيفه؟',
  'شو رأيك بإضافة حلوى أو مشروب؟ 😄',
  'تمام، غير هيك في شي؟',
];
const THANKS_MSGS = [
  'يسلمو! نتشرف فيك دايماً ❤️',
  'الله يخليك! أهلاً بك في أي وقت 🌿',
  'شكراً لثقتك فينا! 😊',
  'يعطيك العافية! 🌿',
];
const CONFUSED_MSGS = [
  'هههه مش فاهم قصدك كتير 😄 بدك تطلب ولا بدك تشوف الأسعار؟',
  'مش واضح معي 🤔 بدك مني إيش بالضبط؟',
  'قولي شو بدك وأنا معك! 😊',
  'تمام، بس مش فاهم... بدك شاورما؟ بيتزا؟ حلويات؟ 😄',
];

// =====================
// المنيو
// =====================
const MENU_ITEMS = [
  {name:'فرشوحة عادي',cat:'شاورما',price:20,keys:['فرشوحة عادي','فرشوحه عادي','فرشوحة']},
  {name:'فرشوحة دبل',cat:'شاورما',price:22,keys:['فرشوحة دبل','فرشوحه دبل']},
  {name:'فرشوحة دبل لحمة',cat:'شاورما',price:28,keys:['فرشوحة دبل لحمة','دبل لحمة']},
  {name:'فرشوحة دبل دبل',cat:'شاورما',price:30,keys:['فرشوحة دبل دبل','دبل دبل']},
  {name:'سوري',cat:'شاورما',price:32,keys:['سوري']},
  {name:'صفيحة',cat:'شاورما',price:38,keys:['صفيحة','صفيحه']},
  {name:'باشكا',cat:'شاورما',price:45,keys:['باشكا']},
  {name:'شاورما عربي',cat:'شاورما',price:38,keys:['شاورما عربي','عربي']},
  {name:'شاورما إيطالي',cat:'شاورما',price:38,keys:['شاورما ايطالي','شاورما إيطالي']},
  {name:'صحن شاورما',cat:'شاورما',price:30,keys:['صحن شاورما','صحن']},
  {name:'كالزوني دجاج',cat:'ايطالي',price:35,keys:['كالزوني دجاج','كاليزوني دجاج','كالزوني','كاليزوني']},
  {name:'كالزوني خضار',cat:'ايطالي',price:20,keys:['كالزوني خضار','كاليزوني خضار']},
  {name:'بيتزا مكسيكي دجاج',cat:'ايطالي',price:25,keys:['بيتزا مكسيكي','مكسيكي']},
  {name:'بيتزا خضار وذرة وزيتون',cat:'ايطالي',price:20,keys:['بيتزا خضار','خضار وذرة']},
  {name:'بيتزا ماما روزا',cat:'ايطالي',price:20,keys:['ماما روزا','بيتزا ماما','ماما']},
  {name:'نابولي',cat:'ايطالي',price:20,keys:['نابولي']},
  {name:'مارغريتا',cat:'ايطالي',price:20,keys:['مارغريتا','مرغريتا']},
  {name:'علبة صوص إكسترا',cat:'ايطالي',price:3,keys:['صوص','اكسترا']},
  {name:'زنجر',cat:'ساندويش',price:30,keys:['زنجر']},
  {name:'بيج زنجر',cat:'ساندويش',price:40,keys:['بيج زنجر']},
  {name:'بيف برجر',cat:'ساندويش',price:30,keys:['بيف برجر','بيف']},
  {name:'تشيكن برجر',cat:'ساندويش',price:30,keys:['تشيكن برجر','تشيكن']},
  {name:'بيج ماك',cat:'ساندويش',price:40,keys:['بيج ماك','بيغ ماك']},
  {name:'تشيكن بيتزا',cat:'ساندويش',price:30,keys:['تشيكن بيتزا']},
  {name:'شيش طاووق',cat:'ساندويش',price:30,keys:['شيش طاووق','شيش']},
  {name:'فطيرة ذهبية',cat:'ساندويش',price:30,keys:['فطيرة','فطيره']},
  {name:'بانسية',cat:'ساندويش',price:30,keys:['بانسية','بانسيه']},
  {name:'باربكيو',cat:'ساندويش',price:30,keys:['باربكيو']},
  {name:'ستيك دجاج مشوي',cat:'ساندويش',price:30,keys:['ستيك','ستيك دجاج']},
  {name:'بطاطا كبير',cat:'سلطة',price:10,keys:['بطاطا']},
  {name:'سلطات وسط',cat:'سلطة',price:10,keys:['سلطة وسط','سلطة']},
  {name:'سلطات كبيرة',cat:'سلطة',price:15,keys:['سلطة كبيرة','سلطات كبيرة']},
  {name:'نسكافيه',cat:'مشروبات',price:5,keys:['نسكافيه']},
  {name:'كابتشينو',cat:'مشروبات',price:5,keys:['كابتشينو']},
  {name:'إسبريسو سنجل',cat:'مشروبات',price:5,keys:['اسبريسو سنجل','اسبريسو']},
  {name:'إسبريسو دبل',cat:'مشروبات',price:10,keys:['اسبريسو دبل']},
  {name:'قهوة تركي سنجل',cat:'مشروبات',price:5,keys:['قهوة تركي','تركي']},
  {name:'قهوة تركي دبل',cat:'مشروبات',price:10,keys:['تركي دبل']},
  {name:'شاي',cat:'مشروبات',price:3,keys:['شاي']},
  {name:'عصير الموسم',cat:'مشروبات',price:12,keys:['عصير موسم','موسم']},
  {name:'عصير الأناناس',cat:'مشروبات',price:10,keys:['اناناس']},
  {name:'عصير ليمون ونعناع',cat:'مشروبات',price:12,keys:['ليمون نعناع','ليمون']},
  {name:'عصير أفوكاتو',cat:'مشروبات',price:15,keys:['افوكاتو','أفوكاتو']},
  {name:'شوكو بارد',cat:'مشروبات',price:10,keys:['شوكو']},
  {name:'آيس موكا',cat:'مشروبات',price:10,keys:['موكا','ايس موكا']},
  {name:'آيس كافي',cat:'مشروبات',price:10,keys:['ايس كافي']},
  {name:'ميلك شيك سبيشل',cat:'مشروبات',price:20,keys:['ميلك شيك']},
  {name:'موهيتو',cat:'مشروبات',price:20,keys:['موهيتو']},
  {name:'كنافة نوتيلا',cat:'حلويات',price:15,keys:['كنافة نوتيلا']},
  {name:'كنافة دبي',cat:'حلويات',price:20,keys:['كنافة دبي']},
  {name:'مولتن كيك',cat:'حلويات',price:20,keys:['مولتن']},
  {name:'هوت كيك',cat:'حلويات',price:20,keys:['هوت كيك']},
  {name:'براونيز كيك',cat:'حلويات',price:20,keys:['براونيز']},
  {name:'أقسماط',cat:'حلويات',price:25,keys:['اقسماط','أقسماط']},
  {name:'كريب',cat:'حلويات',price:25,keys:['كريب']},
  {name:'وافل سنيك',cat:'حلويات',price:25,keys:['وافل']},
  {name:'بان كيك',cat:'حلويات',price:25,keys:['بان كيك','بانكيك']},
  {name:'كريب دبي',cat:'حلويات',price:30,keys:['كريب دبي']},
  {name:'تشيز كيك',cat:'حلويات',price:10,keys:['تشيز كيك']},
  {name:'موس',cat:'حلويات',price:10,keys:['موس']},
  {name:'سوبرمان',cat:'حلويات',price:18,keys:['سوبرمان']},
  {name:'تريليتشا',cat:'حلويات',price:10,keys:['تريليتشا']},
  {name:'كنافة عربية',cat:'حلويات',price:40,keys:['كنافة عربية']},
  {name:'بقلاوة لوز',cat:'حلويات',price:48,keys:['بقلاوة لوز']},
  {name:'نابلسية',cat:'حلويات',price:60,keys:['نابلسية']},
  {name:'ملكية',cat:'حلويات',price:80,keys:['ملكية']},
  {name:'جيلاتو نوتيلا',cat:'حلويات',price:15,keys:['جيلاتو نوتيلا']},
  {name:'جيلاتو بستاشيو',cat:'حلويات',price:15,keys:['بستاشيو']},
  {name:'جيلاتو لوتس',cat:'حلويات',price:15,keys:['لوتس']},
  {name:'جيلاتو كيندر',cat:'حلويات',price:15,keys:['كيندر']},
  {name:'جيلاتو بلوبيري',cat:'حلويات',price:15,keys:['بلوبيري']},
  {name:'جيلاتو كراميل',cat:'حلويات',price:15,keys:['كراميل']},
];

const DELIVERY_ZONES = [
  {keys:['مستشفى العودة','العودة'],fee:5},
  {keys:['النصيرات'],fee:10},
  {keys:['السوارحة','البريج'],fee:15},
  {keys:['الزوايدة','المغازي'],fee:20},
  {keys:['دير البلح'],fee:35},
];

function getDeliveryFee(address) {
  const lower = address.toLowerCase();
  for (const z of DELIVERY_ZONES) {
    if (z.keys.some(k => lower.includes(k))) return z.fee;
  }
  return 20;
}

function levenshtein(a, b) {
  const m=a.length,n=b.length;
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

function findItem(query) {
  const q = query.trim().toLowerCase().replace(/[هة]/g,'ه');
  for (const item of MENU_ITEMS) {
    if (item.keys.some(k => {
      const kn = k.toLowerCase().replace(/[هة]/g,'ه');
      return q.includes(kn) || kn.includes(q);
    })) return item;
  }
  let best=null, bestScore=Infinity;
  for (const item of MENU_ITEMS) {
    for (const k of item.keys) {
      const kn=k.toLowerCase().replace(/[هة]/g,'ه');
      for (const w of kn.split(' ')) {
        if (w.length < 3) continue;
        const dist=levenshtein(q,w);
        const threshold=q.length<=4?1:q.length<=7?2:3;
        if (dist<=threshold && dist<bestScore) { bestScore=dist; best=item; }
      }
    }
  }
  return best;
}

function isQuestion(text) { return /كم|بكام|سعر|سعره|قيمة|غالي|رخيص/.test(text); }
function isOrder(text) { return /بدي|عايز|اريد|أريد|اطلب|خذلي|اضيف/.test(text); }

const sessions = {};
function getSession(from) {
  if (!sessions[from]) sessions[from]={state:null,cart:[],name:'',phone:'',address:'',deliveryType:'',deliveryFee:0,pendingItem:null};
  return sessions[from];
}
function resetSession(from) {
  sessions[from]={state:null,cart:[],name:'',phone:'',address:'',deliveryType:'',deliveryFee:0,pendingItem:null};
}
function cartTotal(cart) { return cart.reduce((s,i)=>s+i.qty*i.price,0); }
function cartText(cart) { return cart.map(i=>`• ${i.qty}x ${i.name} — ${i.qty*i.price} ₪`).join('\n'); }

function getMenuText(cat) {
  const menus = {
    'شاورما':`🥙 *الشاورما*\n─────────────\nفرشوحة عادي ....... 20 ₪\nفرشوحة دبل ........ 22 ₪\nفرشوحة دبل لحمة ... 28 ₪\nفرشوحة دبل دبل .... 30 ₪\nسوري .............. 32 ₪\nصفيحة ............. 38 ₪\nباشكا ............. 45 ₪\nشاورما عربي ....... 38 ₪\nشاورما إيطالي ..... 38 ₪\nصحن شاورما ........ 30 ₪`,
    'ايطالي':`🍕 *الإيطالي*\n─────────────\nكالزوني دجاج ...... 35 ₪\nكالزوني خضار ...... 20 ₪\nمكسيكي دجاج ....... 25 ₪\nبيتزا خضار ........ 20 ₪\nماما روزا ......... 20 ₪\nنابولي ............ 20 ₪\nمارغريتا .......... 20 ₪\nصوص إكسترا ........ 3 ₪`,
    'ساندويش':`🍔 *الساندويشات*\n─────────────\nزنجر .............. 30 ₪\nبيج زنجر .......... 40 ₪\nبيف برجر .......... 30 ₪\nتشيكن برجر ........ 30 ₪\nبيج ماك ........... 40 ₪\nشيش طاووق ......... 30 ₪\nفطيرة ذهبية ....... 30 ₪\nبانسية ............ 30 ₪\nباربكيو ........... 30 ₪\nستيك دجاج ......... 30 ₪`,
    'سلطة':`🥗 *السلطات*\n─────────────\nبطاطا كبير ........ 10 ₪\nسلطات وسط ......... 10 ₪\nسلطات كبيرة ....... 15 ₪`,
    'مشروبات':`☕ *المشروبات*\n─────────────\nنسكافيه/كابتشينو .. 5 ₪\nإسبريسو سنجل ...... 5 ₪\nإسبريسو دبل ....... 10 ₪\nقهوة تركي ......... 5/10 ₪\nشاي ............... 3 ₪\nعصير موسم ......... 12 ₪\nليمون نعناع ....... 12 ₪\nأفوكاتو ........... 15 ₪\nميلك شيك .......... 20 ₪\nموهيتو ............ 20 ₪`,
    'حلويات':`🍰 *الحلويات*\n─────────────\nكنافة نوتيلا ...... 15 ₪\nكنافة دبي ......... 20 ₪\nمولتن/هوت كيك ..... 20 ₪\nوافل/كريب ......... 25 ₪\nكريب دبي .......... 30 ₪\nتشيز كيك .......... 10 ₪\nجيلاتو (كل النكهات) 15 ₪\nكنافة عربية ....... 40 ₪\nبقلاوة لوز ........ 48 ₪\nنابلسية ........... 60 ₪\nملكية ............. 80 ₪`,
  };
  return menus[cat] || 'مش لاقي القسم 😅';
}

async function handleMessage(msg) {
  const from = msg.from;
  const raw = msg.body.trim();
  const text = raw.toLowerCase();
  const session = getSession(from);

  if (/^(الغاء|إلغاء|كنسل|الغ|بطل|وقف)$/.test(text)) {
    resetSession(from);
    return rand(['تم الإلغاء ❌ أهلاً بك في أي وقت 🌿','اوكي، ألغينا 😊 في خدمة ثانية؟']);
  }

  if (!session.state) {
    if (/مرحبا|هلا|اهلا|السلام|هاي|^hi$|^hello$|صباح|مساء/.test(text)) return rand(GREETINGS);
    if (/شكرا|شكراً|يسلمو|ممتاز|مشكور/.test(text)) return rand(THANKS_MSGS);
    if (/دوام|ساعات|متى|مفتوح/.test(text)) return 'احنا مفتوحين من 11 الصبح لـ11 الليل كل أيام الأسبوع 🕛';
    if (/موقع|عنوان|وين|فين/.test(text)) return 'موجودين في النصيرات — شارع أبو صرار 📍';
    if (/توصيل|ديليفري|رسوم/.test(text)) return `رسوم التوصيل 🚚\nالنصيرات (العودة): 5 ₪\nالنصيرات: 10 ₪\nالسوارحة/البريج: 15 ₪\nالزوايدة/المغازي: 20 ₪\nدير البلح: 35 ₪`;
    if (/تحويل|دفع|بنك|حساب/.test(text)) return `💳 فادي أبو شرخ — بنك فلسطين\nجوال: 0567743979\nIBAN: PS43PALS045411071670993000000`;
    if (/منيو|قائمة|اسعار|أسعار/.test(text)) return `شو بدك تشوف؟ 😊\n1️⃣ الشاورما\n2️⃣ الإيطالي\n3️⃣ الساندويشات\n4️⃣ السلطات\n5️⃣ المشروبات\n6️⃣ الحلويات`;
    if (/^[1-6]$/.test(text)) return getMenuText(['شاورما','ايطالي','ساندويش','سلطة','مشروبات','حلويات'][parseInt(text)-1]);

    const item = findItem(raw);
    if (item) {
      if (isQuestion(text)) return `${item.name} بـ${item.price} ₪ 😊\nبدك تطلبه؟`;
      if (isOrder(text) || /^[0-9]/.test(text)) {
        const qty = parseInt(text.match(/^(\d+)/)?.[1] || 1);
        session.state = 'ordering';
        session.cart.push({...item, qty});
        return `تمام! أضفت ${qty}x ${item.name} 🛒\n${rand(CONFIRM_MSGS)}`;
      }
      session.state = 'pending_item';
      session.pendingItem = item;
      return `${item.name} — ${item.price} ₪ 😊\nبدك تطلبه ولا بس بدك السعر؟`;
    }
    if (/بدي|عايز|اريد|أريد|اطلب|طلب/.test(text)) {
      session.state = 'ordering';
      return `تمام! 🛒 قولي شو بدك وأنا بحسب كل شي.\nأرسل *تأكيد* لما تخلص 😊`;
    }
    return rand(CONFUSED_MSGS);
  }

  if (session.state === 'pending_item') {
    const item = session.pendingItem;
    if (/نعم|آه|اه|اوك|ok|تمام|اضيف|بدي/.test(text)) {
      session.state = 'ordering'; session.cart.push({...item,qty:1}); session.pendingItem = null;
      return `تمام أضفته! 🛒\nشو كمان بدك؟ 😊`;
    }
    if (/لا|لأ|بس/.test(text)) { session.state=null; session.pendingItem=null; return `اوكي! 😊 في شي ثاني؟`; }
    const newItem = findItem(raw);
    if (newItem) {
      session.state='ordering'; session.cart.push({...item,qty:1},{...newItem,qty:1}); session.pendingItem=null;
      return `تمام أضفت:\n• ${item.name}\n• ${newItem.name}\nشو كمان؟ 😊`;
    }
    return `بدك تطلبه ولا بس بدك السعر؟ 😊`;
  }

  if (session.state === 'ordering') {
    if (/^(تأكيد|تاكيد|موافق|نعم|آه|اوك|ok|تمام|خلص|كفاية|بس هيك|هيك بس)$/.test(text)) {
      if (!session.cart.length) return `سلتك فاضية! 😅 قولي شو بدك`;
      session.state = 'delivery_type';
      return `${cartText(session.cart)}\n─────────────\nالمجموع: *${cartTotal(session.cart)} ₪*\n\nكيف بدك تستلم؟\n1️⃣ توصيل 🚚\n2️⃣ استلام من المطعم 🏪`;
    }
    if (isQuestion(text)) {
      const item = findItem(raw);
      if (item) return `${item.name} بـ${item.price} ₪ 😊\nتحبني أضيفه؟`;
    }
    const qtyMatch = raw.match(/^(\d+)\s*x?\s*(.+)$/i);
    if (qtyMatch) {
      const qty=parseInt(qtyMatch[1]), query=qtyMatch[2].trim();
      const item=findItem(query);
      if (item) {
        const ex=session.cart.find(c=>c.name===item.name);
        if(ex) ex.qty+=qty; else session.cart.push({...item,qty});
        return `${rand(WAIT_MSGS)} أضفت ${qty}x ${item.name} ✅\nالسلة:\n${cartText(session.cart)}\nالمجموع: ${cartTotal(session.cart)} ₪\n${rand(CONFIRM_MSGS)}`;
      }
      return `مش لاقي "${query}" 🤔`;
    }
    const item = findItem(raw);
    if (item) {
      const ex=session.cart.find(c=>c.name===item.name);
      if(ex) ex.qty++; else session.cart.push({...item,qty:1});
      return `${rand(WAIT_MSGS)} أضفت ${item.name} ✅\n${rand(CONFIRM_MSGS)}`;
    }
    if (/^[1-6]$/.test(text)) return getMenuText(['شاورما','ايطالي','ساندويش','سلطة','مشروبات','حلويات'][parseInt(text)-1])+'\nأرسل *تأكيد* لما تخلص 😊';
    return `مش فاهم "${raw}" 🤔\nقولي اسم الصنف أو *تأكيد* إذا خلصت`;
  }

  if (session.state === 'delivery_type') {
    if (/^1$|توصيل|ديليفري|بيتي|منزل/.test(text)) { session.deliveryType='توصيل'; session.state='address'; return `تمام! 🚚 أرسل عنوانك`; }
    if (/^2$|استلام|مطعم|بجي/.test(text)) { session.deliveryType='استلام'; session.deliveryFee=0; session.state='name'; return `تمام! 🏪 شو اسمك؟`; }
    return `1️⃣ توصيل 🚚\n2️⃣ استلام من المطعم 🏪\nأرسل 1 أو 2`;
  }

  if (session.state === 'address') {
    session.address=raw; session.deliveryFee=getDeliveryFee(raw); session.state='name';
    return `تمام! التوصيل لـ${raw}: *${session.deliveryFee} ₪* 🚚\nشو اسمك؟ 😊`;
  }

  if (session.state === 'name') { session.name=raw; session.state='phone'; return `أهلاً ${raw}! 😊\nرقم هاتفك؟ 📞`; }

  if (session.state === 'phone') {
    if (!/^[\d\s\-\+]{7,15}$/.test(raw)) return `الرقم مش واضح 😅 حاول مرة ثانية 📞`;
    session.phone=raw; session.state='confirm';
    const total=cartTotal(session.cart), grand=total+session.deliveryFee;
    return `📋 *ملخص طلبك*\n─────────────\n${cartText(session.cart)}\n─────────────\n${session.deliveryType==='توصيل'?`التوصيل (${session.address}): ${session.deliveryFee} ₪`:'استلام 🏪'}\n*المجموع: ${grand} ₪*\n👤 ${session.name}  📞 ${session.phone}\n─────────────\n✅ *تأكيد*  ✏️ *تعديل*  ❌ *إلغاء*`;
  }

  if (session.state === 'confirm') {
    if (/تأكيد|تاكيد|نعم|آه|اوك|ok|تمام|موافق/.test(text)) {
      const orderNum=Math.floor(10000+Math.random()*90000);
      resetSession(from);
      return `🎉 *تم استلام طلبك!*\nرقم طلبك: *#${orderNum}*\nسنتواصل معك قريباً 📞\nشكراً لثقتك بمطعم O2 ❤️`;
    }
    if (/تعديل|غير/.test(text)) { session.state='ordering'; return `قولي شو بدك تعدل 😊\n${cartText(session.cart)}`; }
    return `✅ *تأكيد*  ✏️ *تعديل*  ❌ *إلغاء*`;
  }

  return rand(CONFUSED_MSGS);
}

// =====================
// تهيئة البوت
// =====================
function initBot() {
  console.log('⏳ جاري تهيئة البوت...');
  setTimeout(() => {
    console.log('⏳ جاري تهيئة البوت...');
    // باقي الكود
  }, 5000);
  // ابحث عن Chrome
  const possiblePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    `${process.env.PUPPETEER_CACHE_DIR}/chrome/linux-146.0.7680.31/chrome-linux64/chrome`,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  let chromePath = null;
  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) { chromePath = p; break; }
  }

  console.log('Chrome:', chromePath || 'puppeteer المدمج');

  const config = {
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process','--disable-extensions']
    }
  };
  if (chromePath) config.puppeteer.executablePath = chromePath;

  const client = new Client(config);

  client.on('qr', qr => {
    currentQR = qr;
    botReady = false;
    console.log('QR Code جاهز — افتح /qr');
    qrcode.generate(qr, {small:true});
    setTimeout(() => { if (currentQR===qr) currentQR=''; }, 60000);
  });

  client.on('ready', () => {
    currentQR = ''; botReady = true;
    console.log('✅ البوت شغال!');
  });

  client.on('auth_failure', () => console.log('فشل التحقق'));

  client.on('disconnected', () => {
    botReady = false;
    console.log('انقطع، جاري الإعادة...');
    setTimeout(() => client.initialize(), 5000);
  });

  client.on('message', async msg => {
    try {
      if (msg.from.endsWith('@g.us') || msg.fromMe) return;
      const chat = await msg.getChat();
      await chat.sendStateTyping();
      const reply = await handleMessage(msg);
      if (reply) await msg.reply(reply);
    } catch(err) { console.error('خطأ:', err.message); }
  });

  client.initialize();
}
