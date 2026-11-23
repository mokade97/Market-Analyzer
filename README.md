# تحلیل‌گر بازار (Market Analyzer) — PWA

اپلیکیشن وب نصب‌شدنی (PWA) برای تحلیل، مدیریت ریسک، بک‌تست و پایش بازار کریپتو/فلزات — بدون سرور، بدون حساب کاربری، همه‌چیز روی گوشی شما.  
زبان: فارسی / انگلیسی · تم تیره/روشن · کار با یک فایل `index.html`.

> ⚠️ این نرم‌افزار ابزار آموزش و تحلیل است، نه مشاوره‌ی سرمایه‌گذاری. هیچ بخشی از آن سفارش واقعی ثبت نمی‌کند و به هیچ صرافی کلید ندارد.

---

## فهرست

1. [امکانات در یک نگاه](#امکانات-در-یک-نگاه)
2. [تب‌ها](#تبها)
3. [نصب و انتشار](#نصب-و-انتشار)
4. [کلیدهای API](#کلیدهای-api)
5. [ربات ۲۴ساعته (Lens-Bot)](#ربات-۲۴ساعته-lens-bot)
6. [به‌روزرسانی](#بهروزرسانی)
7. [ساختار پروژه و بیلد](#ساختار-پروژه-و-بیلد)
8. [داده‌ها، حریم خصوصی و محدودیت‌ها](#دادهها-حریم-خصوصی-و-محدودیتها)
9. [عیب‌یابی](#عیبیابی)

---

## امکانات در یک نگاه

| بخش | چه می‌کند |
|---|---|
| 🧮 ماشین‌حساب | اندازه‌ی پوزیشن، مارجین، اهرم، لیکوئید، R:R، چند TP، سقف ریسک روزانه، «چک ریسک» قبل از ورود |
| 🔎 اسکرینر | اسکن بازار فیوچرز (1D + 4H)، امتیاز روند، الگوی Minervini (TT/RS)، امتیاز Lens، واچ‌لیست، هشدار قیمت، اسکن دستی ۳۳ اندیکاتوری با ۹ پریست |
| 📈 چارت | TradingView / FreeCharting / TheFreeChart + چت با AI روی داده‌ی واقعی همان نماد + تحلیل تصویری چارت |
| 🌍 بازار AI | تحلیل ماکرو ساختاریافته، ترند CoinGecko، جریان پول مشتقات (فاندینگ/OI/L-S) |
| 🧰 ابزارها | **Lens** (موتور محلی بدون AI: امتیاز، رژیم ۴خانه، ساختار/BOS/CHoCH، واگرایی، فیبو، الگوهای کلاسیک، SMC/ICT)، ماشین زمان، آزمایشگاه استراتژی، میزگرد ۶ ایجنت AI، پایش خودکار واچ‌لیست |
| 📊 بک‌تست | **استودیوی بک‌تست** (۲۳ استراتژی + سازنده‌ی سفارشی، تا ۵۰۰۰ کندل، IS/OOS) و **بازپخش** کندل‌به‌کندل با چارت سریع Lightweight Charts، ۲۸ اندیکاتور، ابزار ترسیم کامل مشابه TradingView، قفل ترسیم، معامله‌ی دستی/خودکار و تست استحکام |
| 🤖 ربات | نتیجه‌های ربات ۲۴ساعته‌ی GitHub Actions (ستاپ‌ها، پوزیشن‌های مجازی، قاضی AI، دفتر سایه) + دفتر سیگنال‌های Lens داخل اپ |
| 🏦 صرافی مجازی | شبیه‌ساز فیوچرز USDT-M با ۱۰۰ دلار: اهرم خودکار، لیکوئید، کارمزد، لغزش، فاندینگ؛ جبران کندل‌های ازدست‌رفته |
| 📒 ژورنال | ثبت معاملات، نتیجه، درس هر معامله، Expectancy/PF، مدار قطع‌کن ریسک |
| ⚙️ تنظیمات | کلیدها، حساب/ریسک، اسکیل «تحلیل‌گر ارشد»، بکاپ/بازیابی JSON |

هر تب یک دکمه‌ی **?** دارد که راهنمای کامل همان بخش را باز می‌کند.

---

## تب‌ها

### 🧮 ماشین‌حساب
ورودی: نماد (اختیاری)، قیمت ورود، SL، TP، ضرر مجاز (مبلغ یا درصد سرمایه)، اهرم **یا** مارجین. خروجی: اندازه‌ی پوزیشن، ارزش، مارجین، قیمت لیکوئید (با MMR)، R:R (وزنی با چند TP)، کارمزد. «چک ریسک» ستاپ را با Lens، HTF، کش‌شدگی، CHoCH، الگوهای خلاف، آزمایشگاه استراتژی و مدار قطع‌کن می‌سنجد. «ثبت در ژورنال» معامله را ذخیره می‌کند.

### 🔎 اسکرینر
صرافی و Top-N را انتخاب و «اسکن بازار» را بزنید. ستون‌ها: تغییر 1D/4H، RSI، فاصله تا EMA، امتیاز روند، TT n/7، 🎯 Lens. با زدن روی هر سطر صفحه‌ی جزئیات (چارت آفلاین، گزارش AI/بدون AI، هشدار، واچ‌لیست) باز می‌شود. **اسکن دستی** روی ۴۰ نماد با ۳۳ اندیکاتور و ۹ پریست در ~۳ ثانیه.

### 📈 چارت
نماد را تایپ کنید یا از **▾** (فهرست جست‌وجوپذیر: ⭐ اخیر، 🥇 فلزات، 🪙 ۱۵۰ رمزارز برتر با تغییر ۲۴ساعته) انتخاب کنید. نماد/تایم‌فریم این تب مرجع همه‌ی ابزارهاست. پایین چارت: چت با Gemini/ChatGPT که داده‌ی زنده‌ی همان نماد (قیمت، EMA، RSI، ATR، سطوح، پکت Lens) را می‌بیند؛ «📸 تحلیل تصویری» چارت را خود اپ رسم و تحلیل می‌کند.

### 🌍 بازار AI
گفتگوی آزاد یا تحلیل ساختاریافته (فاز بازار → محرک‌ها → نقدینگی → سطوح → سناریوها → ریسک‌ها → اقدام) با بلوک داده‌ی زنده (BTC/ETH، دامیننس، F&G، فلزات، فاندینگ). پنل‌های ترند CoinGecko و جریان پول مشتقات.

### 🧰 ابزارها
- **🎯 Lens**: محاسبه‌ی محلی روی آخرین کندل بسته: امتیاز −۱۰۰…+۱۰۰، رژیم ۴خانه (Q1–Q4) با پلی‌بوک، ستاپ‌ها (پولبک EMA، Zone Break، انگالفینگ، Champion absorption، پروفایل حجم)، ساختار (BOS/CHoCH، واگرایی، فیبو)، الگوهای کلاسیک چارت، نواحی SMC/ICT (FVG/OB/Breaker/VI)، کش‌شدگی، پلن با اندازه‌ی پوزیشن.
- **⏱ ماشین زمان**: همان قاعده روی تاریخچه‌ی همان نماد (N، Win%، T1/T2%، Avg R).
- **🧪 آزمایشگاه استراتژی**: ۱۰ استراتژی با خروج و هزینه‌ی یکسان؛ حکم «مزیت دارد / ضعیف / منفی».
- **⚖️ میزگرد ایجنت‌ها**: تکنیکال، ماکرو، سنتیمنت، وکیل گاو، وکیل خرس، مدیر ریسک.
- **📡 پایش خودکار** واچ‌لیست با نوتیفیکیشن (تا وقتی اپ باز است).

### 🧪 پژوهش استراتژی (v126)
استراتژی تازه‌ی **TEP — پولبک انگالف روندی (ورود-و-برگشت)** در استودیوی بک‌تست؛ حاصل آزمون روی سبد ۱۰ نماد 4H با واک‌فوروارد فصلی (گزارش کامل و هشدارها: `research/REPORT.md`). تنظیم مرجع: 4H · استاپ ۲×ATR · هدف 50R · تریل ۰ · ✓ خروج با سیگنال مخالف · حداکثر نگهداری ۳۰۰. برد ≈۲۱٪ با نگهداری چندهفته‌ای؛ روی 1H قابل اتکا نیست.
استراتژی دوم: **VAB — شکست ناحیه‌ی ارزش (پروفایل حجم + پذیرش)**؛ ۵ سال × ۱۰ نماد 4H: +۰٫۲۰R، برد ۳۱٪، DD ۲۷R، هر سال مثبت، ۴۵/۴۵ ترکیب پارامتر مثبت. تنظیم مرجع: 4H · استاپ ۱٫۵×ATR · تریل ۳ · حداکثر ۱۶۰ کندل. همبستگی با TEP ۰٫۴۱ → مکمل.
**صرافی مجازی** حالا هر سه استراتژی ICHI / TEP / VAB را معامله می‌کند (تیک‌ها در تنظیمات؛ TEP و VAB فقط 4H، هر کدام با مدل خروج خودش: TEP برگشت با سیگنال مخالف، VAB تریل ۳×ATR). تغییر تیک‌ها = شبیه‌سازی از نو.

### 📚 اندیکاتورها (v125)
- **۸۲ اندیکاتور** در منوی `ƒx` چارت (بازپخش/بک‌تست): گروه‌بندی روند / مومنتوم / حجم / نوسان / ساختار-SMC / سیگنال + جستجو.
- **راهنمای کامل اندیکاتورها**: دکمهٔ ❓ در منوی ƒx یا «?» کنار هر اندیکاتور، و دکمهٔ «📚 راهنمای کامل» در راهنمای تب چارت/بک‌تست. هر مورد: چیست، فرمول، چطور خوانده می‌شود (فارسی/انگلیسی).
- اندیکاتورهای ساختاری: سطوح نقدینگی با امتیاز قدرت ★1–5 و sweep/BRK/PB، EQH/EQL، رنج + پرمیوم/دیسکانت، اردربلاک حجمی، FVG با CE، BOS/CHoCH با تأیید فیبو، باکس فشردگی با تفکیک حجم، خط‌روند خودکار با شمارش برخورد، VCP، گوه/ولف (بتا)، رژیم ۵حالته، رادار نقدینگی با امتیاز ۰–۶.
- **اندیکاتور سفارشی JS** (`✎JS` در منوی ƒx): کد در iframe ایزوله اجرا می‌شود و به‌صورت U1..Un ثبت می‌شود.
- نوع چارت (کندل / توخالی / Heikin Ashi / خطی / ناحیه)، مقیاس Log/%، مقایسه با نماد دوم، شمارش‌معکوس بسته‌شدن کندل و لینک اشتراک: دکمهٔ 🕯 در نوار چارت.
- صحت‌سنجی: `tests/oracle.py` خروجی ۴۸ اندیکاتور را با pandas-ta مقایسه می‌کند (همه در تلورانس).

### 📊 بک‌تست
سوئیچ بالای صفحه: **📊 بک‌تست | 🎬 بازپخش**.
- **استودیو**: نماد/تایم‌فریم (15m–1W)/تعداد کندل → استراتژی (ایچیموکو، سوپرترند+EMA، کراس EMA، پولبک EMA، دانچین، RSI، بولینگر، MACD، DI/ADX، EMA+RSI50+انبساط نوسان، 🧩 سازنده) → خروج/هزینه‌ها → اجرا: آمار، منحنی سرمایه، جدول معاملات، IS/OOS.
- **بازپخش**: تا ۱۰۰۰ کندل، آینده پنهان. نوار چارت: تایم‌فریم، ƒx اندیکاتورها (۱۴ روی چارت + ۱۴ پنل جدا با ارتفاع قابل تغییر)، ✏ ترسیم (خطوط، کانال‌ها، رگرسیون با Pearson R، فیبوناچی تا 4.236، شکل‌ها، پوزیشن لانگ/شورت، اندازه‌گیری، متن)، 🧲 آهنربا، 🔒 قفل، ✋ دست، ↶، 🗑، 📷، ⛶ افقی. انتخاب ترسیم فقط با **تَپ** است؛ پیمایش/پینچ هرگز ترسیم را جابه‌جا نمی‌کند. معامله‌ی دستی و خودکار با استراتژی انتخابی، ⚙️ تنظیمات معامله، 📐 طرح معامله، 🧪 تست خودکار استراتژی‌ها + فیلتر بقا + 🧬 تست استحکام (مونت‌کارلو، حساسیت، IS/OOS).

### 🤖 ربات
فقط نمایش نتیجه‌ها: وضعیت آخرین اجرا، کلیدها، ریل‌های ریسک، قاضی (حالت سایه)، دفتر سایه‌ی تحلیل، پوزیشن‌های باز/ستاپ‌ها/ردشده‌ها/بسته‌شده‌ها، و **دفتر سیگنال‌ها** (نتیجه‌ی واقعی ستاپ‌های Lens داخل اپ). راه‌اندازی در بخش [ربات ۲۴ساعته](#ربات-۲۴ساعته-lens-bot).

### 🏦 صرافی مجازی
پروفایل (محافظه‌کار/متعادل/تهاجمی/بدون تعقیب)، جهان ۵۰ ارز + فلزات، کتاب زنده‌ی بات، ریسک٪ و سقف اهرم → اسکن دستی یا خودکار هر ۵ دقیقه. موجودی، ارزش حساب، PnL باز، افت، مارجین، منحنی ارزش، پوزیشن‌ها (اهرم، لیکوئید، PnL)، تصمیم‌های ربات، خروجی JSON.

### 📒 ژورنال و ⚙️ تنظیمات
ژورنال: فیلتر باز/بسته، ثبت نتیجه و درس، آمار (Expectancy، PF، ساعت روز)، CSV/JSON. تنظیمات: ظاهر، نظر دوم، کلیدها، مدار قطع‌کن ریسک، حساب/ریسک Lens، اسکیل تحلیل‌گر ارشد، بکاپ/بازیابی کامل.

---

## نصب و انتشار

### GitHub Pages (پیشنهادی)
1. یک ریپوی **Public** بسازید و این فایل‌ها را در ریشه بگذارید:  
   `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`, `.nojekyll`, پوشه‌ی `.well-known/` و (اختیاری) پوشه‌ی `bot/`.
2. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
3. آدرس: `https://USERNAME.github.io/REPO/` — در Chrome اندروید: ⋮ → **نصب برنامه** (Add to Home screen).

### APK (اختیاری)
[pwabuilder.com](https://www.pwabuilder.com) → آدرس بالا → Package for stores → Android → Generate.  
فایل `assetlinks.json` که PWABuilder می‌دهد را جایگزین `.well-known/assetlinks.json` کنید تا نوار آدرس در APK حذف شود.

### اجرای محلی
```bash
python3 -m http.server 8765
# http://localhost:8765/index.html
```
(Service Worker فقط روی https یا localhost فعال می‌شود.)

---

## کلیدهای API

همه‌ی کلیدها فقط روی همین دستگاه (localStorage) ذخیره و مستقیم به ارائه‌دهنده ارسال می‌شوند؛ سروری در میان نیست.

| کلید | کاربرد | از کجا |
|---|---|---|
| **Gemini** | چت چارت، تحلیل تصویری، بازار AI، میزگرد، اسکرینر (نظر دوم) | Google AI Studio |
| **OpenAI / OpenRouter / سفارشی** | همان‌ها با ChatGPT یا مدل‌های `:free` OpenRouter | platform.openai.com / openrouter.ai |
| **Twelve Data** (اختیاری) | قیمت اسپات طلا/نقره + DXY/SPX/US10Y در تب بازار AI | twelvedata.com |
| **آدرس bot.json** | نمایش نتیجه‌های ربات ۲۴ساعته در تب ربات | raw URL فایل `public/bot.json` ریپوی ربات |

بدون هیچ کلیدی: ماشین‌حساب، اسکرینر، Lens، بک‌تست/بازپخش، صرافی مجازی و ژورنال کاملاً کار می‌کنند.

---

## ربات ۲۴ساعته (Lens-Bot)

ربات، همان موتور Lens را بیرون از گوشی با **GitHub Actions** (رایگان) هر ۱۵ دقیقه اجرا می‌کند و فقط «معامله‌ی مجازی» می‌زند.

**راه‌اندازی**
1. ریپوی Public جدید (مثلاً `Lens-Bot`) → فایل‌های پوشه‌ی ربات را آپلود کنید: `bot.js, engine.js, desk.js, keycheck.js, config.json, package.json, skill.txt, README.md, .github/workflows/`.
2. **Settings → Secrets and variables → Actions**: `GEMINI_API_KEY` (اختیاری: `OPENROUTER_API_KEY`).
3. **Actions** را فعال و یک‌بار **Run workflow** بزنید؛ ربات `state.json` و `public/bot.json` را خودش می‌سازد.
4. آدرس raw فایل `public/bot.json` را در ⚙️ تنظیمات اپ وارد کنید.

**تنظیم:** `config.json` — حساب/ریسک٪، سقف پوزیشن‌ها، جهان نمادها (`universe.cryptoTop`, `forex`, `metals`, `classes`)، تایم‌فریم‌ها، `requireAI`، بودجه‌ی LLM.

> 🔴 **هشدار مهم:** `state.json` حافظه‌ی ربات است (پوزیشن‌ها، دفتر سایه، آمار). هنگام آپلود نسخه‌ی جدید **هرگز** آن را جایگزین نکنید. اگر اشتباهاً بازنویسی شد: در GitHub روی فایل → **History** → آخرین کامیت `bot-update` قبل از آپلود → Raw → محتوا را کپی و در `state.json` فعلی commit کنید.

---

## به‌روزرسانی

1. فایل‌های جدید (`index.html`, `sw.js`, `manifest.json` و در صورت تغییر `bot/engine.js`, `bot/skill.txt`) را در ریپوی Pages **replace** کنید.
2. اپ نصب‌شده با باز شدن بعدی نسخه‌ی جدید را می‌گیرد (Service Worker با نام کش `fcalc-vN` به‌روز می‌شود). اگر نگرفت: اپ را کامل ببندید و دوباره باز کنید (نسخه در بالای صفحه کنار عنوان دیده می‌شود).
3. داده‌های شما (کلیدها، واچ‌لیست، ژورنال، ترسیم‌ها، صرافی مجازی) در localStorage می‌مانند و با آپدیت پاک نمی‌شوند. برای اطمینان قبل از آپدیت‌های بزرگ از ⚙️ → **خروجی تنظیمات (JSON)** بکاپ بگیرید.

---

## ساختار پروژه و بیلد

```
futures-calculator/
├─ index.html              ← خروجی بیلد (تک‌فایل؛ همین را منتشر کنید)
├─ sw.js · manifest.json · icon*.png · icon.svg · .well-known/
├─ build.py                ← src/index.template.html + src/*.js → index.html ؛ نسخه را از sw.js می‌خواند
├─ src/
│  ├─ index.template.html  ← ساختار، CSS، i18n
│  ├─ screener.js          ← صرافی‌ها (OKX/Bybit/Gate)، klines، اسکرینر، کش
│  ├─ sympick.js           ← فهرست/جست‌وجوی نماد (▾)
│  ├─ mscan.js · features.js · lens.js · lensui.js · agents.js
│  ├─ lwc.js · lwchart.js  ← Lightweight Charts + موتور ترسیم/اندیکاتور بازپخش
│  ├─ btchart.js · replay.js · backtest.js · chartbar.js
│  ├─ watcher.js · flow.js · ledger.js · botui.js · paper.js · help.js
├─ bot/                    ← engine.js و skill.txt که build.py از lens.js تولید می‌کند
├─ tests/run.js            ← تست‌های واحد موتور (node tests/run.js)
├─ attic/                  ← کدهای حذف‌شده (موتور قدیمی KLineCharts) — در بیلد نیستند
└─ THIRD_PARTY.md · TODO.md
```

**بیلد:**
```bash
# نسخه را در sw.js بالا ببرید (fcalc-vN) سپس:
python3 build.py
node tests/run.js
```

---

## داده‌ها، حریم خصوصی و محدودیت‌ها

- **منابع داده:** کندل‌ها و تیکرها از OKX (fallback: Bybit، Gate)، اسکرینر از TradingView scanner (fallback OKX)، ترند و دامیننس از CoinGecko، F&G از alternative.me، فارکس (فقط ربات) از Yahoo Finance.  
- **فلزات** = پرپچوال‌های XAU/XAG/XPT (≈ اونس اسپات) و PAXG. **فارکس** در داخل اپ قابل بارگذاری نیست؛ فقط ربات آن را پایش می‌کند.
- همه‌چیز سمت کاربر است؛ هیچ داده‌ای به سرور ما نمی‌رود (سروری وجود ندارد). پاک کردن داده‌ی مرورگر = پاک شدن همه‌چیز → بکاپ JSON بگیرید.
- هشدارها/پایش خودکار فقط وقتی اپ باز است کار می‌کنند (محدودیت PWA)؛ برای ۲۴ساعته از ربات استفاده کنید.
- نتایج بک‌تست/بازپخش/صرافی مجازی «بعد از هزینه» ولی روی داده‌ی گذشته‌اند؛ تضمین آینده نیستند.

---

## عیب‌یابی

| مشکل | راه‌حل |
|---|---|
| نوار قرمز «JS error» | اسکرین‌شات بگیرید و اپ را کامل ببندید و باز کنید؛ اگر ماند، متن خطا را گزارش کنید |
| داده نمی‌آید / «داده‌ای نیامد» | VPN/DNS؛ OKX در بعضی شبکه‌ها فیلتر است. اپ خودکار Bybit/Gate را امتحان می‌کند |
| خطای 429 در AI | سهمیه‌ی رایگان تمام شده؛ کمی صبر یا مدل/کلید دیگر. جست‌وجوی وب را خاموش کنید |
| ربات «آخرین اجرا» قرمز | Actions را چک کنید (ممکن است GitHub اجرای زمان‌بندی‌شده را موقتاً متوقف کرده باشد → Run workflow دستی) |
| ریست شدن ربات | `state.json` بازنویسی شده → از History برگردانید (بالا) |
| آپدیت نمی‌آید | اپ را کامل ببندید و باز کنید؛ در Chrome: تنظیمات سایت → پاک کردن داده‌ی ذخیره‌شده (قبلش بکاپ JSON بگیرید) |

---

کتابخانه‌های شخص ثالث و مجوزها: `THIRD_PARTY.md`.

## v127 — 🎓 Trading Academy
- New header button 🎓 (next to 📓 journal) → `#page-learn`. Curriculum in `src/learn_data1..3.js` (9 modules, 38 lessons, 55 exercises: local quizzes, AI-graded exercises, hands-on tasks in Backtest Studio / Paper Exchange / Journal). Reference library (22 books) and the tutor skill prompt `LEARN_SKILL` live in `learn_data3.js`; it embeds the app's own research evidence (TEP/VAB/ICHI stats, negative results).
- UI/logic in `src/learn.js`: progress in `localStorage.fc_learn_prog` (done / quiz % / tutor grade), lesson view with markdown-lite, Socratic hints, "explain simpler / go deeper", free tutor chat.
- Separate **Tutor AI** settings card (`fc_tut_prov/base/key/model`): OpenAI, OpenRouter, Anthropic (messages API, browser CORS header), Gemini (generateContent with systemInstruction), DeepSeek, **AvalAI** (`https://api.avalai.ir/v1`, OpenAI-compatible, Iran), custom. Host preset dropdown, model datalist, list-models, test. Falls back to the chat OpenAI/Gemini key when empty.
- Tests: `tests/learn_check.js` (jsdom e2e: render, quiz, grading → progress, provider URL/headers for AvalAI/Anthropic/Gemini, chat).

## v128 — 🏪 Market-making lab
- Bot tab now has a segment [🤖 ربات | 🏪 مارکت‌میکینگ]. The MM card (`src/mmui.js`) reads `mm.json` from the VPS-hosted `mm-lab` (`mm-lab/mm.js`, see `mm-lab/README.md`): sim (pessimistic queue model) or OKX demo mode; ADAPTIVE vs FIXED baseline; PnL split spread/fees/inventory; 10 s adverse-selection metric; equity sparklines; params + metric guide.
- lens-bot workflow fetches `http://<vps>:8787/mm.json` into `public/mm.json` each run.

## v129 — 📐 Honest-stats toolkit, scorecard indicators, multi-chart
- **`src/quant.js`** (new, bundled before `lens.js`, also inside `engine.js` for the bot): GARCH(1,1) MLE (Nelder-Mead), GARCH σ-forecast stop, weekly-clustered t-stat, Benjamini-Hochberg FDR across strategy variants, Kelly (binary + continuous from R-multiples), and a built-in `plantedEdgeTest()` (one planted edge among noise variants must be the only approval — asserted in `tests/run.js`).
- **Backtest Studio**: stop mode ATR | GARCH; **Stops** tab (ATR vs GARCH, MAE/MFE in ATR units); **Factors** tab (avg R with/without volume / regime / extended / HTF / session filter); **Kelly card**; **TWRB** time-window range breakout strategy (00:00 UTC & 13:30 UTC presets).
- **Lens strategy lab**: `t_clustered`, `p_value`, `fdr_approved` per strategy; `EDGE` → `EDGE_UNCONFIRMED` when BH-FDR (q=0.1) does not approve; `strategies._fdr` summary; lab card shows it.
- **Calculator**: half-Kelly card from journal/ledger closed trades (n≥10) vs current risk %.
- **Indicators** (`ind2.js` + `indhelp.js`): **SDZ** (2-candle supply/demand boxes), **SCORE** (0–6 setup scorecard, plan, ✓/✗, on-chart stats, provisional last bar), **LVLT** (level power 1–5 + nearest-strongest table).
- **Multi-symbol scan**: universe floor (min $vol avg20, min ATR%, persisted `fc_ms_uni`) + **🧭 All scans** card dashboard.
- **Chart page**: `src/multichart.js` — collapsible 🗂 multi-chart grid of the watchlist (≤8 SVG mini-charts, EMA20/50, Δ%, nearest unbroken S/R), shared timeframe, tap → main chart. No external libs.
- **Academy**: m5l1 adds the 6th family (market making: spread edge, adverse selection + inventory, mm-lab result), Black-Litterman paragraph, Polymarket 0.99 / absorption examples; m6l2 adds the "correct stat, zero edge" NQ inside-bar example; QuantJourney (quants.md) in LEARN_BOOKS; two-row academy home buttons.
- **Bot** (`lens-bot`): `judgeShadow:true` (judge also scores shadow-only cards while ≥50 % of the daily LLM budget remains, `judgeShadowMinBudgetFrac`); judge v2 asks for a calibrated `p_t1` and `judgeReport.calibration` reports Brier score vs base-rate, skill and 5 calibration buckets; the research `<evidence>` block is now part of SKILL_TXT → `skill.txt`. SWEEP and chase/extended entries were already shadow-only via `liveStrategies`/`chaseShadow` (applies to scan and watch sources alike).
- Tests: `node tests/run.js` → 71 pass; `cd tests && node learn_check.js` green.

## v130 — 🎨 Drawing layers, STP/PLAN/DIP indicators, anti-repaint
- **Chart engine (`lwchart.js`)**: `_barColors` (per-bar candle colour from an indicator), `fill` shape kind (polygon between two series, per-segment colour), and a `~` prefix on indicator markers that sit on the forming candle (anti-repaint, TODO #162).
- **`src/ind3.js`** (new): **STPSR** (swing S/R 100 → STP / STP PB / ✗ failed), **MAFILL** (state-coloured EMA21 + price fill + double ribbon fill, coloured candles), **DIP** (Ichimoku cloud + Supertrend 10/2 & 20/4 + stepped pivots + EMA50/200, DIP marker), **STRONG** (strong buy/sell 3-of-4 + ⚡ momentum), **PLAN** (ENTRY/STOP/TARGET1-3 from the last SCORE≥4 signal, risk/reward boxes, active window). **ATRTS** upgraded in place (coloured candles + fill).
- **ind2 patches**: WOLFE → TP3 apex, broadening targets W×0.618/1/1.618, weak-R:R warning; FVG → opening gaps (OG). All have `indhelp.js` entries.
- **Auto-watch**: opt-in SMC alerts (`awSmc`, key `fc_aw_smc`): new order block (VOB) / price inside an open FVG, closed candles only.
- **Bot**: `judgeShadow:true` + `judgeShadowMinBudgetFrac:0.5` (v129) is the fix for "the judge is only called after a setup passes the rules, so the free quota is never used" — the judge now also scores shadow-only cards while ≥50 % of the daily LLM budget remains, so the shadow-judge scorecard reaches n≥40 faster.
- TODO: 35 more items ticked (several were already shipped in v125–v127 and only needed verification). #140 and #220 closed by a 5-year backtest (10 OKX perps, 4H; `research/REPORT.md` §۶): retest entry destroys the VAB edge (+0.13R → +0.03R, DD ×2) and an ADX regime filter is not stable across years/symbols — neither is ported. **TODO list is now empty.**
- Tests: `node tests/run.js` → 78 pass.
