/* ===== Per-tab help (v56): "?" button in the top corner of every page + modal ===== */
(function(){
const H={fa:{},en:{}};
const L=(a)=>'<ul>'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
const S=(t)=>'<h3>'+t+'</h3>';
/* ---------------- FA ---------------- */
H.fa.calc=`
${S('🧮 ماشین‌حساب پوزیشن چیست؟')}
<p>اندازه‌ی پوزیشن، مارجین و اهرم را طوری محاسبه می‌کند که اگر حد ضرر بخورد، دقیقاً به اندازه‌ی «ضرر مجاز» شما از دست برود — نه بیشتر.</p>
${S('ورودی‌ها')}
${L(['<b>جهت (لانگ/شورت)</b>: از روی قیمت ورود و حد ضرر خودکار تشخیص داده می‌شود؛ با دکمه هم قابل تغییر است.',
'<b>قیمت فعلی/ورود</b>: قیمتی که قصد ورود دارید.',
'<b>حد ضرر (SL)</b>: قیمتی که در آن از معامله خارج می‌شوید. فاصله‌ی آن تا ورود = «ریسک هر واحد».',
'<b>حد سود (TP)</b>: هدف قیمتی. برای محاسبه R:R لازم است.',
'<b>ضرر مجاز: مبلغ</b> یا <b>درصد سرمایه</b>: با دکمه‌ی دوحالته انتخاب می‌کنید. در حالت درصد، اندازه‌ی حساب از تنظیمات (کارت Lens/مدیریت ریسک) خوانده می‌شود.',
'<b>اهرم را مشخص می‌کنم / مارجین را مشخص می‌کنم</b>: چون اهرم × مارجین = ارزش پوزیشن، فقط یکی را وارد می‌کنید و دیگری محاسبه می‌شود.'])}
${S('تنظیمات پیشرفته')}
${L(['<b>کارمزد Taker (%)</b> و <b>لحاظ کردن کارمزد در ریسک</b>: اگر فعال باشد، کارمزد ورود و خروج هم در ضرر مجاز حساب می‌شود (اندازه کمی کوچک‌تر).',
'<b>نرخ مارجین نگهداری (MMR)</b>: برای تخمین قیمت لیکوئید. مقدار صرافی خود را وارد کنید (معمولاً ۰.۴–۱٪).',
'<b>چند حد سود</b>: درصد خروج در TP1/TP2/TP3 → R:R وزنی محاسبه می‌شود.',
'<b>سقف ریسک روزانه (%)</b>: اگر مجموع ریسک معاملات باز امروز در ژورنال از این عدد بگذرد، هشدار می‌گیرید.'])}
${S('نحوه خواندن نتایج')}
${L(['<b>اندازه پوزیشن</b> = ضرر مجاز ÷ (ریسک هر واحد + کارمزد). مقدار کوین/کانترکتی که باید بخرید.',
'<b>ارزش پوزیشن (Notional)</b> = اندازه × قیمت ورود.',
'<b>مارجین</b> = ارزش پوزیشن ÷ اهرم. پولی که واقعاً بلوکه می‌شود.',
'<b>R:R</b> = فاصله تا TP ÷ فاصله تا SL. زیر 1:1.5 معمولاً ارزش ورود ندارد (اسکیل تحلیل‌گر هم چنین ستاپی را «NO SETUP» می‌داند).',
'<b>قیمت لیکوئید</b>: لانگ = ورود×(1−1/اهرم+MMR)، شورت = ورود×(1+1/اهرم−MMR). <u>اگر لیکوئید قبل از SL باشد، اهرم را کم کنید</u> — چک ریسک این را قرمز می‌کند.',
'<b>سود در TP / ضرر در SL</b>: به دلار و درصدِ مارجین.'])}
${S('دکمه‌ها')}
${L(['<b>🛡 چک ریسک قبل از ورود</b>: ۸ کنترل خودکار (ریسک نسبت به حساب، R:R، هم‌جهتی با تایم‌فریم بالاتر، رژیم بازار، لیکوئید قبل از SL، اهرم، فاصله‌ی استاپ نسبت به ATR، امتیاز Lens و سابقه‌ی تاریخی ستاپ). سبز = عبور، زرد = هشدار، قرمز = رد. حتی یک قرمز یعنی ورود نکنید یا پارامتر را اصلاح کنید.',
'<b>📒 ثبت در ژورنال</b>: یک خط «دلیل ورود» می‌پرسد (اختیاری) و معامله را با همه‌ی اعداد در ژورنال (آیکون 📒 بالای صفحه) ذخیره می‌کند؛ بعداً نتیجه‌اش را ثبت کنید.',
'<b>کپی نتایج</b> / <b>ریست</b>.'])}
<p class="hint">ورودی‌ها به‌صورت خودکار ذخیره می‌شوند. از تب «تحلیل چارت»، «اسکرینر» و «ابزارها ← طرح معامله» می‌توان اعداد را مستقیم به این‌جا فرستاد.</p>`;

H.fa.chart=`
${S('🖼 تحلیل تصویر چارت با Gemini')}
<p>یک اسکرین‌شات از چارت (TradingView، صرافی، هر جایی) بدهید تا تحلیل‌گر ارشد، تحلیل چندتایم‌فریمی عددی تحویل دهد.</p>
${S('نحوه استفاده')}
${L(['کلید Gemini را در تنظیمات (⚙️) وارد کنید.',
'روی ناحیه‌ی تصویر بزنید و عکس را انتخاب کنید، یا تصویر را Paste کنید (Ctrl+V) یا بکشید و رها کنید.',
'نماد و تایم‌فریم به‌صورت خودکار از تب «چارت» برداشته می‌شود؛ بهتر است همان چارت را اسکرین‌شات بگیرید.',
'<b>تحلیل کن</b> را بزنید. اگر «نظر دوم» در تنظیمات روشن باشد، مدل دوم هم جداگانه تحلیل می‌کند.',
'<b>حذف تصویر</b> برای شروع دوباره.'])}
${S('نحوه خواندن تحلیل')}
${L(['<b>🧭 سوگیری تایم‌فریم بالا</b>: جهت هفتگی/روزانه. خلاف آن معامله نکنید مگر با دلیل قوی.',
'<b>🏗 ساختار</b>: HH/HL یا LH/LL، شکست‌ها، الگوها (مثلث، سر و شانه، …) با قیمت‌های مشخص.',
'<b>📍 سطوح</b>: حمایت/مقاومت، نواحی عرضه/تقاضا، فیبوناچی — هر سطح با عدد.',
'<b>⚡ تریگر</b>: شرط دقیق ورود (مثلاً «کلوز ۴ساعته بالای X»). تا تریگر نیامده، ستاپ فعال نیست.',
'<b>🎯 پلن</b>: ورود، SL، TP1/TP2 و R:R محاسبه‌شده. اگر R:R کمتر از 1:1.5 باشد مدل باید «NO SETUP» بنویسد.',
'<b>⚠️ ابطال</b>: چه چیزی ایده را باطل می‌کند. این مهم‌ترین بخش است.',
'<b>سناریوی اصلی / جایگزین</b>: احتمال بیشتر در مقابل احتمال کمتر؛ هر دو را آماده داشته باشید.'])}
${S('دکمه‌های نتیجه')}
${L(['<b>ارسال به ماشین‌حساب</b>: ورود/SL/TP پیشنهادی مستقیماً به ماشین‌حساب می‌رود تا اندازه‌ی پوزیشن را بگیرید.',
'<b>کپی نتایج</b>: متن کامل تحلیل.',
'<b>وضعیت ستاپ</b> (زیر نتیجه): اپ قیمت لحظه‌ای را با ناحیه‌ی ورود مقایسه می‌کند: ✅ قابل ورود، ⚠️ دور شده، ⛔ از TP1 رد شده یا SL خورده.'])}
<p class="hint">تحلیل تصویر، احتمال است نه قطعیت. همیشه با «چک ریسک» و Lens (تب ابزارها) تطبیق دهید.</p>`;

H.fa.screener=`
${S('🔎 اسکرینر روند (۱ روزه + ۴ ساعته)')}
<p>بازار فیوچرز را از دیتای TradingView اسکن می‌کند و کوین‌هایی را که در هر دو تایم‌فریم روزانه و ۴ساعته هم‌جهت و پرقدرت هستند بالا می‌آورد.</p>
${S('گزینه‌ها')}
${L(['<b>صرافی</b>: Binance / Bybit / OKX / Bitget / Gate — فقط فهرست نمادها عوض می‌شود.',
'<b>تعداد (Top N)</b>: چند نماد پرحجم اسکن شوند (۲۰ تا ۱۵۰).',
'<b>اسکن بازار</b>: اجرا. نتیجه با ستون‌های تغییر ۱D، تغییر ۴H، RSI، فاصله تا EMA و <b>امتیاز روند</b> مرتب می‌شود (روی سرستون بزنید تا مرتب‌سازی عوض شود).',
'<b>نماد دلخواه</b>: مثلاً PEPE یا PEPEUSDT → مستقیم به صفحه‌ی جزئیات همان کوین.',
'<b>⭐ واچ‌لیست</b> و <b>🔔 هشدارهای قیمت</b>: بالای فهرست؛ هشدارها وقتی اپ باز است با نوتیفیکیشن/صدا اعلام می‌شوند.'])}
${S('خواندن جدول')}
${L(['<b>امتیاز</b>: ترکیب جهت EMAها، RSI و مومنتوم در ۱D و ۴H. +۱۰۰ = صعودی قوی در هر دو، −۱۰۰ = نزولی قوی. اعداد نزدیک صفر یعنی رنج/تضاد تایم‌فریم‌ها.',
'<b>🎯 Lens</b> (بعد از اسکن، به‌تدریج پر می‌شود): امتیاز Lens روی کندل‌های ۴ساعته‌ی همان کوین — ▲ لانگ / ▼ شورت با عدد سمت قوی‌تر؛ «!» یعنی کندل ستاپ (LONG_SETUP/SHORT_SETUP). سبز/قرمز پررنگ ≥۷۰. مرتب‌سازی «🎯 Lens» بالاترین‌ها را می‌آورد. نگه‌داشتن انگشت/هاور عدد هر دو طرف را نشان می‌دهد.',
'<b>↑↑ / ↓↓</b>: هم‌جهت بودن روزانه و ۴ساعته. <b>↑↓</b> یعنی تضاد → ریسک بیشتر.',
'<b>RSI</b> بالای ۷۰ در هر دو تایم‌فریم = اشباع؛ دنبال پولبک باشید، نه ورود مستقیم.',
'<b>TT n/7</b> = الگوی روند مینروینی (Stage 2): قیمت>SMA150>SMA200، SMA50>SMA150، قیمت>SMA50، ≥۳۰٪ بالای کف ۵۲هفته، ≤۲۵٪ زیر سقف ۵۲هفته، RS≥70 (صدک بازده ۳ماهه بین اسکن‌شده‌ها). فیلتر «🏆 TT ≥6/7» و مرتب‌سازی «TT/RS». برچسب <b>⚠ +N×ATR</b> = قیمت N برابر ATR روزانه از SMA50 دور است؛ ≥۴ یعنی کش‌شده — تعقیب نکن.'])}
${S('صفحه جزئیات کوین (با زدن روی هر سطر)')}
${L(['<b>تایم‌فریم چارت</b> (پیش‌فرض 4H) و چارت کندلی آفلاین با EMA.',
'<b>تحلیل با ChatGPT</b>: گزارش ۶بخشی (خلاصه، ساختار، سطوح، سناریوها، پلن، ریسک) با کلید OpenAI/OpenRouter. اگر «نظر دوم» فعال باشد Gemini هم جدا گزارش می‌دهد؛ هرکدام دکمه‌ی «ارسال به ماشین‌حساب» خودش را دارد.',
'<b>فراخوانی چارت این نماد</b>: تب «چارت» را با همین نماد و تایم‌فریم باز می‌کند.',
'<b>📄 گزارش بدون AI</b>: همان قالب گزارش فقط با اندیکاتورها، بدون کلید و هزینه.',
'<b>🔔 هشدار قیمت</b> / <b>⭐ واچ‌لیست</b> / <b>→ بازگشت</b>.'])}
<p class="hint">اسکرینر «کاندید» می‌دهد نه سیگنال؛ هر کاندید را در تب چارت و با Lens بررسی کنید.</p>`;

H.fa.tv=`
${S('📈 تب چارت (صفحه‌ی اصلی)')}
${L(['<b>نماد</b>: مثلاً BTCUSDT یا فقط BTC. <b>صرافی</b> و <b>تایم‌فریم</b> (پیش‌فرض 4H) را انتخاب و <b>نمایش</b> را بزنید.',
'<b>⛶</b> (کنار نمایش): تمام‌صفحه‌ی افقی؛ با دکمه‌ی ✕ بالای چارت خارج شوید.',
'<b>منبع چارت</b>: <b>TradingView</b> (ویجت رسمی با ابزار ترسیم و اندیکاتور)، <b>TheFreeChart</b> (نماد/تایم‌فریم را داخل خود چارت انتخاب کنید) یا <b>FreeCharting</b> (رایگان و بدون اکانت؛ نماد/تایم‌فریم/تم از همین فیلدها اعمال می‌شود، داده‌ی اسپات مستقیم از OKX (بایننس برای ایران بسته است)؛ نمادهایی که فقط فیوچرز/توکن‌سهام هستند (مثل SOXL) این‌جا نیستند → TradingView؛ نسخه‌ی داخل اپ فقط زوم/اسکرول دارد و لینک «چارت کامل» ترسیم، بار ری‌پلی، بک‌تست و ۶۸ اندیکاتور را در تب جدید باز می‌کند).',
'<b>پس‌زمینه چارت</b>: تیره/روشن.',
'نماد و تایم‌فریم این تب <u>مرجع همه‌ی ابزارها</u> است: تحلیل چارت، Lens، میزگرد، بازپخش، ماشین زمان، چک ریسک.'])}
${S('💬 مشورت با هوش مصنوعی درباره این چارت')}
${L(['<b>Gemini / ChatGPT</b>: انتخاب مدل (کلیدها در تنظیمات).',
'سؤال بنویسید و ➤ بزنید. مدل تصویر چارت را نمی‌بیند، ولی <b>دیتای واقعی همین نماد/تایم‌فریم</b> (قیمت، EMAها، RSI، ATR، سطوح، و پکت Lens اگر اخیراً محاسبه شده باشد) به‌همراه اسکیل «تحلیل‌گر ارشد» برایش ارسال می‌شود.',
'گفتگو حافظه دارد؛ می‌توانید پیگیری کنید («اگر ۴ساعته زیر X بسته شود؟»). <b>پاک کردن گفتگو</b> برای شروع تازه.',
'سؤال خوب: «با این دیتا، ستاپ لانگ معتبر است؟ تریگر، SL و TP عددی بده و بگو چه چیزی ابطالش می‌کند.»'])}
${S('خواندن پاسخ')}
<p>پاسخ‌ها با همان قالب 🧭 سوگیری / 🏗 ساختار / 📍 سطوح / ⚡ تریگر / 🎯 پلن / ⚠️ ابطال می‌آیند. دنبال <b>اعداد</b> باشید؛ اگر پاسخ عدد ندارد یا R:R زیر 1:1.5 است، ستاپ نیست. مدل پیش‌بینی نمی‌کند — سناریو می‌دهد.</p>
<p class="hint">ویجت رایگان TradingView ترسیم‌ها را ذخیره نمی‌کند؛ برای چارت کامل از «ابزارها ← باز کردن در TradingView» استفاده کنید.</p>`;

H.fa.market=`
${S('🌍 بازار AI — تحلیل‌گر ارشد ماکرو')}
${L(['<b>Gemini / ChatGPT</b>: مدل پاسخ‌گو. Gemini می‌تواند <b>جست‌وجوی وب</b> را روشن کند (تیک کنار ورودی) تا اخبار روز را ببیند — سهمیه‌ی رایگان را سریع‌تر مصرف می‌کند.',
'<b>💬 گفتگوی آزاد / آموزش</b>: پرسش و پاسخ معمولی، مفاهیم، آموزش.',
'<b>📋 تحلیل ساختاریافته</b>: پاسخ اجباراً در قالب: فاز بازار → محرک‌ها → نقدینگی/مشتقات → سطوح کلیدی BTC/ETH/DXY/طلا → سناریوی اصلی و جایگزین → ریسک‌های هفته → اقدام.',
'<b>سؤال آماده…</b>: کشویی با ۵ پرسش پرتکرار (وضعیت کلی، دامیننس، طلا/نقره، ماکرو و فد، اخبار امروز).',
'<b>پاک کردن گفتگو</b>.'])}
${S('بلوک داده‌ی زنده (بالای چت)')}
<p>به‌صورت خودکار همراه هر سؤال برای مدل فرستاده می‌شود: قیمت BTC/ETH، دامیننس BTC و USDT، مارکت‌کپ کل و تغییر ۲۴ساعته، شاخص ترس و طمع، طلا/نقره/پلاتین (از پرپچوال‌ها)، فاندینگ میانگین.</p>
${S('🔥 ترند CoinGecko')}
${L(['۱۵ کوین پرجست‌وجو + دسته‌های داغ. این «توجه» است، نه سیگنال خرید؛ اغلب در اوج هیجان ظاهر می‌شوند.',
'<b>⚠️</b> = رتبه بالای ۳۰۰ یا مارکت‌کپ زیر ۵۰ میلیون → ریسک بسیار بالا / نقدشوندگی کم.',
'دکمه‌ی چارت کنار هر کوین آن را در تب چارت باز می‌کند.'])}
${S('💸 جریان پول مشتقات')}
${L(['<b>فشار خرید/فروش</b>: حجم ۲۴ساعته × تغییر قیمت؛ شاخص فشار جهت‌دار است، نه ورود/خروج واقعی صرافی.',
'<b>F</b> = فاندینگ (مثبت = لانگ‌ها می‌پردازند؛ خیلی مثبت = شلوغی لانگ، مستعد اسکوییز).',
'<b>OI</b> = تغییر یک‌روزه‌ی بهره‌ی باز (OKX). قیمت بالا + OI بالا = روند با پول جدید؛ قیمت بالا + OI پایین = شورت‌کاورینگ.',
'<b>خرید%</b> = سهم تیکر خرید. <b>L/S</b> = نسبت حساب‌های لانگ/شورت (خرده‌فروش‌ها؛ معمولاً شاخص معکوس).',
'<b>⟳ به‌روزرسانی</b> هر پنل.'])}
<p class="hint">نحوه خواندن پاسخ: ابتدا «فاز بازار» و «ریسک‌های هفته» را بخوانید، بعد سطوح عددی را روی چارت علامت بزنید. تحلیل ماکرو برای تایمینگ دقیق ورود نیست.</p>`;

H.fa.tools=`
${S('📡 پایش خودکار واچ‌لیست')}
${L(['<b>تایم‌فریم</b> و <b>حداقل امتیاز</b> را تنظیم کنید؛ تیک «روشن» را بزنید.',
'تا وقتی اپ باز است، هر چند دقیقه یک‌بار همه‌ی نمادهای واچ‌لیست (⭐ در اسکرینر) با Lens بررسی می‌شوند و اگر ستاپی با امتیاز کافی ظاهر شود، نوتیفیکیشن + ردیف در فهرست می‌آید. <b>معامله‌ی خودکار انجام نمی‌شود.</b>',
'<b>🔍 اسکن الان</b>: اجرای فوری. <b>پاک کردن فهرست</b>.'])}
${S('🧪 آزمایشگاه استراتژی')}
${L(['در خروجی Lens (ابزارها) جدولی با ۶ استراتژی: ستاپ Lens، شکست دانکیان ۲۰ (Turtle)، پول‌بک RSI-2 (Connors)، بازگشت به میانگین بولینگر، تقاطع MACD با فیلتر EMA200، تقاطع EMA 20/50 با فیلتر HTF. قوانین از توصیف‌های عمومی (freqtrade/Jesse/کتاب‌ها) بازنویسی شده‌اند.','همه با یک مدل خروج و همان کارمزد/لغزش روی ~۱۰۰۰ کندل آخر همین نماد/تایم‌فریم سنجیده می‌شوند؛ پس عدد «Avg R» بین‌شان قابل مقایسه است. حکم: مزیت دارد (avgR ≥ +0.15 و PF ≥ 1.2)، ضعیف، منفی، نمونه کم (<۸).','چک ریسک یک ردیف «آزمایشگاه استراتژی» دارد: اگر استراتژی پیشنهادی روی این نماد با ≥۱۵ معامله منفی باشد → رد؛ ربات هم همین قانون را دارد و برعکس، سیگنال زنده‌ی استراتژی‌ای که این‌جا «مزیت دارد» را به‌عنوان کاندید جدید به میزگرد می‌فرستد (انتخاب استراتژی داده‌محور برای هر نماد/تایم‌فریم).','هشدار: ۶ ماه داده، ۲۰–۴۰ معامله است؛ کافی برای حذف استراتژی‌های بد، نه برای اثبات قطعی خوب‌ها.'])}
${S('🤖 تب ربات')}
${L(['تب «🤖 ربات» نتیجه‌هاست: کارت ربات ۲۴ساعته و دفتر سیگنال‌ها. ابزارهای تحلیل دستی در «ابزارها» می‌مانند.','تب «چارت» → «📸 تحلیل تصویری»: یا چارت همین نماد/تایم‌فریم را خود اپ رسم می‌کند و می‌فرستد، یا یک اسکرین‌شات از گالری انتخاب می‌کنی؛ تحلیل تصویری (با SKILL و داده‌ی MTF) در تب «تحلیل چارت» خودکار شروع می‌شود.'])}
${S('🤖 ربات ۲۴ساعته')}
${L(['ربات (پوشه‌ی <b>lens-bot</b>) همان موتور Lens اپ را بیرون از گوشی اجرا می‌کند: هر ۱۵ دقیقه روی نمادها/تایم‌فریم‌های config.json → پکت کامل (امتیاز، رژیم ۴خانه، کش‌شدگی، SMC، الگوها، ساختار/CHoCH/واگرایی، Sweep+CHoCH+FVG) → همان قوانین چک ریسک (Q4، خلاف HTF، کش‌شدگی ≥۴، CHoCH خلاف، الگوی تأییدشده‌ی خلاف، R:R) → میزگرد کامل ایجنت‌ها با Gemini جداگانه: تحلیل‌گر تکنیکال (پکت + MTF 1D/4H/1H + ۶۰ کندل)، تحلیل‌گر ماکرو/فاندامنتال (با جست‌وجوی گوگل برای ۷۲ ساعت اخیر و تقویم ۷ روز آینده؛ هر ۴ ساعت یک‌بار و مشترک بین نمادها)، تحلیل‌گر سنتیمنت/مشتقات (فاندینگ، OI، پرمیوم، نسبت تیکر، نسبت لانگ/شورت، F&G، دامیننس) → مناظره‌ی گاو/خرس → مدیر ریسک (LONG/SHORT/WAIT/SKIP + اعتماد + چه کسی را رد کرد). بودجه‌ی روزانه‌ی LLM (پیش‌فرض ۲۲۰ فراخوانی) و اگر تمام شد، قاضی تک‌مرحله‌ای و سپس قوانین → معامله‌ی مجازی با سایز = حساب × ریسک٪ × ضریب رژیم.',
'مدیریت پوزیشن فقط روی کندل‌های بسته: SL −1R، T1 سپس SL +0.25R، T2 +2.25/+3R، تایم‌اوت ۴۰ کندل؛ کارمزد+اسلیپیج+فاندینگ کم می‌شود. حداکثر ۶ پوزیشن، یک پوزیشن برای هر نماد؛ بقیه فقط «هشدار».',
'راه‌اندازی: ریپوی عمومی GitHub (Actions رایگان و نامحدود) → Secret به نام GEMINI_API_KEY → Actions را فعال و یک‌بار Run workflow بزن → آدرس raw فایل public/bot.json را در تنظیمات وارد کن. بدون کلید Gemini هم کار می‌کند (قاضی = قوانین).',
'در اپ: وضعیت آخرین اجرا (قرمز اگر >۹۰ دقیقه)، نتیجه‌ی مجازی R/$، آمار به تفکیک رژیم/تایم‌فریم/جهت، پوزیشن‌های باز با MTM، ستاپ‌های اخیر با دلایل قاضی و دکمه‌های «چارت» و «→ ماشین‌حساب» برای ورود واقعی با دست خودت. ستاپ‌های جدید هنگام باز بودن اپ toast/نوتیف می‌دهند (هر ۵ دقیقه بررسی).',
'جهان نمادها (v75): خودکار هر اجرا — ۶۰ رمزارز پرحجم‌ترین پرپچوال‌های OKX (با فیلتر «بازار اسپات دارد» تا سهام توکنی و میکروکپ‌های فقط‌پرپ کنار بروند) + طلا/نقره + ۱۴ جفت فارکس از Yahoo Finance (۱H و ۱D، ۴H از تجمیع ۱H). سه مرحله: اسکن سریع همه (۳۲۰ کندل) → انتخاب کاندیدها با سهمیه‌ی هر کلاس دارایی → تحلیل عمیق ۱۲ تای برتر (۱۰۰۰ کندل + HTF + آزمایشگاه + قوانین + میزگرد). هزینه‌ی فارکس: اسپرد ۰.۰۲٪ بدون کارمزد/فاندینگ. در config.json: universe.cryptoTop، forex، metals، classes (می‌توانی "stock" را هم اضافه کنی).','AI اجباری (v77، `requireAI:true`): اگر هیچ کلید/مدلی در دسترس نباشد، ستاپ باز نمی‌شود و «قاضی ساده» جایگزین نمی‌شود؛ با وضعیت ⏳ «منتظر AI» ثبت و تا ۴ اجرای بعدی (تا وقتی همان کندل آخرین کندل بسته است) دوباره تلاش می‌شود، بعد رد می‌شود. برای کم‌کردن ۴۲۹: فاصله‌ی حداقل ۶.۵ ثانیه بین فراخوانی‌ها، چرخش روی کلید×مدل (flash و flash-lite سهمیه‌ی جدا دارند)، و خنک‌کردن ۶۰ ثانیه‌ای اسلات پس از ۵۰۳.','ربات هرگز سفارش واقعی نمی‌زند و هیچ کلید صرافی ندارد.'])}
${S('📒 دفتر سیگنال‌ها')}
${L(['هر ستاپ Lens (LONG_SETUP/SHORT_SETUP) از هر منبعی — دکمه‌ی 🎯، پایش خودکار، 🎯 اسکرینر — با ورود/SL/T1/T2 همان لحظه ثبت می‌شود (بدون تکرار برای یک کندل).',
'«تسویه» کندل‌های بسته‌شده‌ی بعدی را می‌گیرد و نتیجه را می‌بندد: SL = −1R؛ T1 سپس SL = +0.25R؛ T2 = +2.25R (یا +3R اگر T1 را رد کرده باشد)؛ ۴۰ کندل بدون نتیجه = قیمت روز. هنگام باز شدن اپ هر ۳۰ دقیقه خودکار تسویه می‌شود.',
'آمار به تفکیک رژیم ۴خانه، تایم‌فریم و منبع نشان می‌دهد موتور <u>واقعاً</u> کجا کار می‌کند. زیر N=30 نتیجه‌گیری نکن. اگر بعد از ۱–۲ ماه رژیمی منفی ماند، در آن رژیم معامله نکن — همین است هدف این دفتر.'])}
${S('🧰 ابزارهای تحلیل (روی نماد/تایم‌فریم تب چارت)')}
<p><b>🎯 سیگنال این کندل (Lens)</b> — محاسبه‌ی محلی و بدون AI روی آخرین کندل <u>بسته‌شده</u>:</p>
${L(['<b>پنل تصمیم</b> (بالای کارت): تصمیم موتور، امتیاز، رژیم و ضریب سایز، HTF، آخرین رویداد ساختار، پلن، سایز/ریسک دلاری و هشدارها در یک جدول. در <b>حالت ساده</b> (تنظیمات Lens) بقیه‌ی جزئیات و ماشین زمان جمع‌شده‌اند؛ برای دیدن همه، «جزئیات کامل» را باز کن یا حالت ساده را خاموش کن. 📡 = منبع داده‌ی فعلی (okx/bitget/gate یا cache = آفلاین با آخرین کندل‌های ذخیره‌شده).',
'<b>امتیاز −۱۰۰…+۱۰۰</b>: جمع وزنی روند (EMA 20/50/200)، مومنتوم (RSI/MACD)، ساختار (HH/HL)، حجم و سوگیری تایم‌فریم بالاتر. |امتیاز| ≥ ۶۰ = ستاپ قوی؛ ۳۰–۶۰ = متوسط؛ زیر ۳۰ = بدون معامله.',
'<b>رژیم ۴خانه</b> (روند × نوسان): Q1 روند آرام (دنبال روند، سایز کامل) / Q2 روند پرنوسان (شکست‌ها، نصف سایز) / Q3 رنج آرام (بازگشت به میانگین از لبه‌ها، ۰.۷۵ سایز) / Q4 آشوب (بیرون بمان). ADX = قدرت روند، ATR pct = صدک نوسان ۱۰۰ کندل اخیر، Hurst زیر ۰.۴۵ = بازگشت به میانگین، بالای ۰.۵۵ = روندی. برای هر خانه «پلی‌بوک» (استراتژی‌های هم‌خانه) و «اجتناب» نشان داده می‌شود؛ در تست استراتژی ردیف‌های 🏠 هم‌خانه و 🚫 ناهم‌خانه علامت می‌خورند.',
'<b>ستاپ‌ها</b>: پولبک به EMA، شکست ناحیه (Zone Break)، انگالفینگ هم‌جهت، <b>Champion absorption</b> (جذب در لبه‌ی ارزش: ویک‌های جذب + شکست دومِ ناموفق) و پروفایل حجم (POC/VAH/VAL).',
'<b>🔀 ساختار</b>: روند سوئینگی (HH/HL یا LH/LL از پیوت‌های ZigZag)، آخرین رویداد <b>BOS</b> (شکست هم‌جهت = ادامه) یا <b>CHoCH</b> (اولین شکست خلاف روند سوئینگی = احتمال برگشت؛ در چک ریسک CHoCH خلاف جهت = رد)، <b>واگرایی RSI/MACD</b> منظم (قیمت سقف/کف جدید، اندیکاتور نه = خستگی) و مخفی (ادامه‌ی روند) روی دو پیوت آخر + پیوت در حال شکل‌گیری، و <b>سطوح فیبوناچی</b> لگ کامل آخر (۰.۳۸۲/۰.۵/۰.۶۱۸/۰.۷۸۶ + اکستنشن ۱.۲۷۲/۱.۶۱۸) با درصد اصلاح فعلی. الگوهای کندلی جدید: ستاره‌ی صبح/شام، مرد حلق‌آویز، چکش وارونه، فرفره.',
'<b>📐 الگوهای کلاسیک چارت</b> (مکانیکی روی پیوت‌های ZigZag با آستانه‌ی ۲×ATR): سقف/کف دوقلو و سه‌قلو، سر و شانه و معکوس، مثلث صعودی/نزولی/متقارن، گوه‌ی صعودی/نزولی، کانال صعودی/نزولی، مستطیل، مگافون و گوه‌های واگرا، پرچم گاوی/خرسی. هر الگو با وضعیت <b>در حال شکل‌گیری</b> (منتظر شکست خط گردن/خط کانال بمان) یا <b>شکست تأییدشده</b> + هدف اندازه‌گیری‌شده (ارتفاع الگو) و سطح ابطال. چک ریسک: الگوی تأییدشده‌ی خلاف جهت = رد، در حال شکل‌گیری خلاف جهت = هشدار. الگوهای فازی (Dragon، Adam&Eve، فنجان و دسته، Bump&Run، Dead Cat) عمداً تشخیص خودکار ندارند؛ آن‌ها را تحلیل تصویری AI می‌بیند.',
'<b>🧱 نواحی SMC/ICT</b> (مکانیکی، بدون AI): <b>FVG</b> = گپ ۳کندلی پرنشده (سایه‌ی کندل ۱ و ۳ هم‌پوشان نیستند)، <b>OB</b> = آخرین کندل مخالف قبل از یک حرکت تند ≥۲×ATR که سقف/کف ۲۰ کندل را می‌شکند، <b>Breaker</b> = OB شکسته‌شده با نقش معکوس، <b>VI</b> = گپ بین بدنه‌ی دو کندل. کارت نزدیک‌ترین ناحیه‌ی بالا (▲) و پایین (▼) را با فاصله بر حسب ATR و تعداد نواحی فعال ۱۵۰ کندل اخیر نشان می‌دهد؛ ناحیه‌هایی که بیش از ۵۰٪ پر شده‌اند حذف می‌شوند. کاربرد: ورود روی ناحیه‌ی هم‌جهت، استاپ پشت آن، هدف اول قبل از ناحیه‌ی مخالف بعدی. چک ریسک اگر ناحیه‌ی مخالف کمتر از ۱×ATR جلوتر باشد هشدار می‌دهد. این‌ها <u>نواحی واکنش</u>‌اند نه سیگنال؛ به‌تنهایی لبه‌ی اثبات‌شده‌ای ندارند.',
'<b>کش‌شدگی از EMA50</b>: فاصله‌ی کلوز از EMA50 بر حسب ATR؛ ≥۴ (یا ≤−۴ برای شورت) = کش‌شده، چک ریسک آن را رد می‌کند و ۲.۵–۴ هشدار.',
'<b>پلن</b>: ورود، SL (پشت ساختار/۱.۵×ATR)، T1/T2، R:R و <b>اندازه‌ی پوزیشن</b> بر اساس حساب/ریسک٪ تنظیمات. اگر R:R کمتر از «حداقل R:R» تنظیمات باشد یا خلاف HTF باشد (و تیک مربوطه فعال)، <b>NO TRADE</b> می‌دهد.',
'<b>⏱ ماشین زمان</b> (زیر Lens): همین قاعده را روی تاریخچه‌ی همین نماد اجرا می‌کند: N = تعداد، Win% ، T1%/T2% رسیدن به اهداف، SL%، Avg R. فیلتر لانگ/شورت و هم‌جهت/خلاف HTF. N کمتر از ۱۵ یعنی آمار قابل اتکا نیست.'])}
<p><b>⚖️ میزگرد ایجنت‌ها</b> — ۶ نقش AI پشت‌سرهم: تکنیکال، ماکرو، احساسات/مشتقات، وکیل گاوها، وکیل خرس‌ها و در نهایت <b>مدیر ریسک</b> که تصمیم می‌دهد (LONG/SHORT/NO TRADE + اندازه). <b>توافق ایجنت‌ها</b> را ببینید: توافق پایین = بمانید بیرون. اگر یک ایجنت خطا بدهد میزگرد ادامه می‌یابد.</p>
<p><b>🎬 بازپخش و تست استراتژی</b>:</p>
${L(['<b>شروع از چند کندل قبل</b>: اسلایدر. آینده پنهان است. تا ۱۰۰۰ کندل بارگذاری می‌شود.',
'<b>اندیکاتورها</b>: EMA20/50/200، بولینگر، کلتنر، دانچیان ۲۰، ایچیموکو (تنکان/کیجون/ابر)، VWAP روزانه، سوپرترند(10,3)، پارابولیک SAR، پیوت‌های کلاسیک روزانه (P/R1/R2/S1/S2)، سوئینگ‌ها (فراکتال ۵ کندلی)، حجم، و پنل‌های RSI، MACD، استوکاستیک — هر کدام با یک لمس روشن/خاموش. تعداد کندل ۶۰ تا ۴۰۰؛ کشیدن چارت = پیمایش به عقب.',
'<b>تایم‌فریم</b>: دکمه‌های 1H / 4H / 1D بالای چارت؛ همان نماد با همان نقطه‌ی زمانی دوباره بارگذاری می‌شود (معاملات ریپلی صفر می‌شود، ترسیم‌های هر تایم‌فریم جدا ذخیره‌اند).',
'<b>⛶ افقی</b>: تمام‌صفحه با قفل افقی؛ اگر گوشی اجازه‌ی چرخش ندهد، خود چارت ۹۰ درجه می‌چرخد. خروج با ✕ یا دکمه‌ی Back.',
'<b>استراتژی</b>: یکی از ۶ استراتژی آزمایشگاه را انتخاب کن تا سیگنال‌هایش روی کندل‌های گذشته با مثلث نشان داده شود و روی کندل فعلی 📣 اعلام شود. «🤖 معامله‌ی خودکار» = با هر سیگنال خودش با همان SL/TP تو وارد می‌شود؛ آمار (برد، جمع R، Max DD) همان‌جا جمع می‌شود — کندل‌به‌کندل می‌بینی استراتژی کجا درست و کجا غلط می‌کند.',
'<b>ترسیم</b>: خط افقی و عمودی (یک لمس)، خط روند (دو لمس، با امتداد نقطه‌چین)، پرتو (از نقطه‌ی اول تا انتهای چارت)، ناحیه، فیبو اصلاح (دو لمس)، فیبو گسترش (سه لمس: شروع موج، پایان موج، پایان اصلاح → سطوح 0.618/1/1.272/1.618/2/2.618)، 📈 کانال رگرسیون خطی (دو لمس: بازه → خط رگرسیون ± ۱σ و ۲σ، شیب درصدی در هر کندل و فاصله‌ی قیمت فعلی به σ)، 📏 اندازه (درصد، چند ATR، چند کندل)، 🎯 پوزیشن (لمس اول = ورود، لمس دوم = استاپ؛ TP از «TP (R)» و سایز از تنظیمات حساب)، T متن، ⌫ پاک‌کن (لمس روی ترسیم)، 🧲 آهنربا (چسبیدن به O/H/L/C کندل)؛ ↶ برگشت، 🗑 پاک‌کردن همه. ترسیم‌ها برای هر نماد/تایم‌فریم در گوشی ذخیره می‌شوند.',
'<b>⏮ / ▶ +1 / ⏩ +10 / ▶▶ (پخش با سرعت)</b>.',
'<b>SL (×ATR)</b>، <b>TP (R)</b>، <b>حداکثر نگهداری</b>: مدیریت معامله‌ی یکسان برای شما و تست خودکار.',
'<b>کارمزد رفت‌وبرگشت + اسلیپیج</b> (پیش‌فرض ۰.۱٪ + ۰.۰۳٪) و فاندینگ تقریبی ۰.۰۱٪/۸ساعت از هر معامله کم می‌شود (در ماشین زمان هم). نتایج «بعد از هزینه» هستند — صادق‌تر و معمولاً کوچک‌تر.',
'<b>💧 Sweep + CHoCH + FVG</b> (استراتژی دهم، مدل ورود ICT): سایه زیر آخرین کف سوئینگ می‌رود ولی کلوز بالای آن می‌ماند (جمع‌آوری نقدینگی) → تا ۱۰ کندل بعد کلوز بالای آخرین سقف سوئینگ (CHoCH/MSS) → در همان حرکت یک FVG صعودی باقی مانده → ورود در اولین بازگشت به FVG (تا ۱۵ کندل) با کندل صعودی. آینه برای شورت. وضعیت زنده‌اش در کارت Lens (SWEPT / ARMED / ENTRY) دیده می‌شود؛ استاپ منطقی آن زیر کف sweep است. خانه: Q2/Q3.',
'<b>🧱 FVG retest</b> (استراتژی نهم): گپ ۳کندلی پرنشده (≤۶۰ کندل)، قیمت واردش می‌شود و هم‌جهت با روند EMA20/50 بیرون کلوز می‌کند. خانه‌اش Q1/Q2 است.',
'<b>▲ LONG / ▼ SHORT / بستن</b>: معامله‌ی دستی روی کلوز کندل فعلی. آمار (تعداد، برد٪، مجموع R) و لاگ پایین می‌آید. زیر چارت امتیاز Lens همان لحظه نمایش داده می‌شود تا تمرین کنید.',
'<b>📐 طرح معامله</b>: خطوط ورود/SL/TP قابل کشیدن روی چارت؛ <b>⇅</b> جهت را عوض می‌کند؛ <b>→ ماشین‌حساب</b> اعداد را می‌فرستد.',
'<b>🧪 اجرای تست</b>: ۸ قاعده (کراس EMA، شکست ۲۰ کندلی، پولبک EMA، RSI، انگالفینگ هم‌جهت، Zone Break، پروفایل حجم، Champion) روی همین بازه با مدیریت یکسان. ستون‌ها: N، برد٪، PF (سود ناخالص ÷ ضرر ناخالص؛ بالای ۱.۳ خوب)، مجموع R، بیشینه افت. <b>فیلتر بقا</b>: حداقل N، حداکثر افت (R)، حداقل PF و «بهتر از خرید و نگهداری» (B&H بر حسب R با همان اندازه‌ی استاپ محاسبه می‌شود). ردیف‌های رد‌شده خاکستری‌اند و دلیل رد در ستون آخر است؛ اگر هیچ قاعده‌ای عبور نکرد یعنی روی این نماد/تایم‌فریم لبه‌ای نیست. <b>🧬 تست استحکام</b> (بعد از اجرای تست): <b>مونت‌کارلو</b> ترتیب معاملات را ۱۰۰۰ بار بُر می‌زند و افت P95 و احتمال عبور از سقف افت را می‌دهد؛ <b>حساسیت</b> همان قاعده را با ۹ ترکیب SL/TP اجرا می‌کند (≥۶ مثبت = فلات مستحکم، کمتر = قله‌ی شکننده)؛ <b>IS/OOS</b> نیمه‌ی اول بازه را با نیمه‌ی دومِ دیده‌نشده مقایسه می‌کند. حکم: ✅ مستحکم / ⚠️ مختلط / ❌ شکننده. <u>برای مقایسه‌ی نسبی روی همین نماد است، نه تضمین آینده.</u>'])}
<p><b>↗ باز کردن در TradingView</b>: چارت کامل tradingview.com با همین نماد/تایم‌فریم در تب جدید (Bar Replay و ترسیم‌های ذخیره‌شونده آن‌جاست).</p>`;

H.fa.journal=`
${S('📒 ژورنال معاملات')}
${L(['معاملات از ماشین‌حساب («ثبت در ژورنال») یا تحلیل‌ها به این‌جا می‌آیند.',
'<b>باز / بسته / همه</b>: فیلتر. روی هر معامله بزنید تا نتیجه را ثبت کنید: TP / SL / بستن دستی با قیمت خروج → R واقعی محاسبه می‌شود؛ سپس «یادداشت» و «درس این معامله» (postmortem یک‌خطی) پرسیده می‌شود.',
'<b>نوار بالای ژورنال</b>: وضعیت مدار قطع‌کن ریسک (🟢/🟡/⛔) بر اساس همین معاملات — تنظیماتش در ⚙️.',
'<b>آمار عملکرد</b>: تعداد، نرخ برد، مجموع R، میانگین R، بهترین/بدترین، <b>Expectancy</b> (میانگین R در هر معامله؛ مثبت = سیستم سودده)، <b>Profit Factor</b>، و پراکندگی بر اساس ساعت روز (کدام ساعت‌ها سود می‌کنید).',
'<b>خروجی CSV / JSON</b>: برای اکسل یا بکاپ. (ورودی تنظیمات در ⚙️ ژورنال را هم بازمی‌گرداند.)',
'سقف ریسک روزانه‌ی ماشین‌حساب از مجموع ریسک معاملات <b>باز</b> امروز در همین ژورنال محاسبه می‌شود.'])}
<p class="hint">حداقل ۳۰ معامله‌ی ثبت‌شده لازم است تا آمار معنی‌دار شود. هر معامله را «قبل از ورود» ثبت کنید نه بعد.</p>`;

H.fa.settings=`
${S('⚙️ تنظیمات')}
${L(['<b>ظاهر</b>: تیره/روشن. زبان با دکمه‌ی بالای صفحه (FA/EN).',
'<b>نظر دوم</b>: روشن باشد → در اسکرینر و تحلیل چارت، مدل دوم هم جداگانه تحلیل می‌کند (هزینه دو برابر).',
'<b>خروجی/ورودی تنظیمات (JSON)</b>: بکاپ کامل کلیدها، واچ‌لیست، هشدارها، ژورنال و تنظیمات. <b>حذف همه کلیدها</b> فقط کلیدهای API را پاک می‌کند.',
'<b>هزینه‌ی تقریبی تحلیل‌های این ماه</b>: برآورد از روی توکن‌ها.'])}
${S('کلید ChatGPT (OpenAI / OpenRouter / سفارشی)')}
${L(['<b>ارائه‌دهنده</b>: OpenAI (پیش‌فرض)، OpenRouter (یک کلید برای صدها مدل؛ مدل‌های <b>:free</b> رایگان‌اند) یا آدرس سفارشی سازگار با OpenAI.',
'<b>کلید API</b>، <b>مدل</b> (یا «دریافت لیست مدل‌ها»)، <b>ذخیره</b>، <b>تست اتصال</b>.',
'کلیدها فقط روی همین دستگاه (localStorage) ذخیره می‌شوند و مستقیم به ارائه‌دهنده ارسال می‌شوند؛ سروری در میان نیست.'])}
${S('کلید Gemini')}
${L(['کلید را از Google AI Studio بگیرید. مدل پیش‌فرض gemini-3.6-flash (سریع/ارزان) و gemini-3.6-pro (دقیق‌تر). «دریافت لیست مدل‌ها» مدل‌های مجاز کلید شما را نشان می‌دهد.',
'خطای 429 = سهمیه‌ی رایگان تمام شده؛ کمی صبر کنید یا جست‌وجوی وب را خاموش کنید. 503 = شلوغی؛ اپ خودکار دوباره تلاش می‌کند.'])}
${S('⛔ مدار قطع‌کن ریسک')}
<p>از معاملات <b>بسته‌شده‌ی ژورنال</b> محاسبه می‌شود: سقف ضرر روزانه/هفتگی (بر حسب R)، حداکثر باخت متوالی در روز، و دوره‌ی خنک‌شدن بعد از هر باخت (ضد معامله‌ی انتقامی). وضعیت در همین کارت، در «چک ریسک» ماشین‌حساب (ردیف اول) و بالای ژورنال نمایش داده می‌شود؛ هنگام ثبت معامله هم هشدار می‌دهد. 🟢 باز / 🟡 خنک‌شدن / ⛔ قطع. اپ سفارش نمی‌بندد — قانون را خودت اجرا کن.</p>
${S('🎯 Lens / مدیریت ریسک')}
${L(['<b>اندازه حساب</b>، <b>ریسک هر معامله (%)</b> (۱–۳٪ توصیه می‌شود)، <b>حداقل R:R تا T2</b>: مبنای اندازه‌ی پوزیشن در Lens، میزگرد، چک ریسک و حالت «درصد سرمایه» ماشین‌حساب.',
'<b>معامله خلاف سوگیری تایم‌فریم بالا ممنوع</b>: اگر فعال باشد Lens ستاپ‌های خلاف HTF را NO TRADE می‌کند.'])}
${S('🎓 اسکیل «تحلیل‌گر ارشد بازارهای مالی»')}
<p>پیش‌فرض روشن. به همه‌ی تحلیل‌ها (چت چارت، تحلیل تصویر، اسکرینر، بازار AI، میزگرد) دستور می‌دهد: عددمحور، قابل‌ابطال، بدون جملات کلیشه‌ای، و «NO SETUP» وقتی R:R کمتر از 1:1.5 است. خاموش کردنش پاسخ‌ها را عمومی‌تر می‌کند.</p>
${S('📘 راهنما و فرمول‌ها')}
<p>همین کارت پایین صفحه: فرمول‌های کامل ماشین‌حساب و مثال عددی.</p>`;

/* ---------------- EN ---------------- */
H.en.calc=`
${S('🧮 What the position calculator does')}
<p>Sizes the position, margin and leverage so that if your stop is hit you lose exactly your "max loss" — not more.</p>
${S('Inputs')}
${L(['<b>Side (Long/Short)</b>: auto-detected from entry vs. stop; can be toggled.',
'<b>Current / entry price</b>.',
'<b>Stop loss (SL)</b>: exit price when wrong. Distance to entry = risk per unit.',
'<b>Take profit (TP)</b>: target; needed for R:R.',
'<b>Max loss: amount</b> or <b>% of account</b> (toggle). In % mode the account size comes from Settings → Lens / Risk card.',
'<b>I set leverage / I set margin</b>: since leverage × margin = notional, you enter one and the other is derived.'])}
${S('Advanced')}
${L(['<b>Taker fee (%)</b> + <b>include fee in risk</b>: entry+exit fees are counted inside the max loss (slightly smaller size).',
'<b>Maintenance margin rate (MMR)</b>: for the liquidation estimate; use your exchange value (usually 0.4–1%).',
'<b>Multiple TPs</b>: exit % at TP1/TP2/TP3 → weighted R:R.',
'<b>Daily risk cap (%)</b>: warns when the open risk of today\'s journal trades exceeds it.'])}
${S('Reading the results')}
${L(['<b>Position size</b> = max loss ÷ (risk per unit + fee).',
'<b>Notional</b> = size × entry. <b>Margin</b> = notional ÷ leverage (what is actually locked).',
'<b>R:R</b> = distance to TP ÷ distance to SL. Below 1:1.5 is usually not worth taking (the analyst skill calls it NO SETUP).',
'<b>Liquidation</b>: long = entry×(1−1/lev+MMR), short = entry×(1+1/lev−MMR). <u>If liquidation sits before your SL, lower the leverage</u> — Risk Check flags this red.',
'<b>Profit at TP / loss at SL</b> in USD and % of margin.'])}
${S('Buttons')}
${L(['<b>🛡 Risk check before entry</b>: 8 automatic checks (risk vs. account, R:R, HTF alignment, market regime, liquidation before SL, leverage, stop distance vs. ATR, Lens score and historical stats of this setup). Green = pass, yellow = warn, red = fail. Any red → do not enter or fix the parameter.',
'<b>📒 Save to journal</b>: asks a one-line "entry reason" (optional) and stores the trade with all numbers (📒 icon in the header); log the outcome later.',
'<b>Copy results</b> / <b>Reset</b>.'])}
<p class="hint">Inputs are auto-saved. Chart analysis, Screener and Tools → Trade plan can push numbers straight into this tab.</p>`;

H.en.chart=`
${S('🖼 Chart image analysis with Gemini')}
<p>Give a screenshot of any chart (TradingView, exchange…) and get a numeric multi-timeframe analysis from the senior analyst.</p>
${S('How to use')}
${L(['Enter a Gemini key in Settings (⚙️).',
'Tap the image area to pick a file, paste (Ctrl+V) or drag & drop.',
'Symbol and timeframe are taken automatically from the Chart tab — screenshot that same chart.',
'Press <b>Analyze</b>. If "Second opinion" is on, the second model analyses separately.',
'<b>Remove image</b> to start over.'])}
${S('Reading the analysis')}
${L(['<b>🧭 HTF bias</b>: weekly/daily direction. Don\'t trade against it without a strong reason.',
'<b>🏗 Structure</b>: HH/HL or LH/LL, breaks, patterns — with prices.',
'<b>📍 Levels</b>: S/R, supply/demand, Fibonacci — every level numeric.',
'<b>⚡ Trigger</b>: the exact entry condition (e.g. "4H close above X"). No trigger → no active setup.',
'<b>🎯 Plan</b>: entry, SL, TP1/TP2 and computed R:R. If R:R < 1:1.5 the model must say NO SETUP.',
'<b>⚠️ Invalidation</b>: what kills the idea — the most important part.',
'<b>Primary / alternative scenario</b>: have both prepared.'])}
${S('Result buttons')}
${L(['<b>Send to calculator</b>: suggested entry/SL/TP go to the calculator for sizing.',
'<b>Copy results</b>.',
'<b>Setup status</b> (under the result): compares live price with the entry zone — ✅ enterable, ⚠️ moved away, ⛔ passed TP1 / stopped out.'])}
<p class="hint">Image analysis is a probability, not a certainty. Cross-check with Risk Check and Lens (Tools tab).</p>`;

H.en.screener=`
${S('🔎 Trend screener (1D + 4H)')}
<p>Scans the futures market via TradingView data and ranks coins that are aligned and strong on both the daily and the 4H.</p>
${S('Options')}
${L(['<b>Exchange</b>: Binance / Bybit / OKX / Bitget / Gate — only the symbol list changes.',
'<b>Top N</b>: how many of the highest-volume symbols to scan (20–150).',
'<b>Scan market</b>: run. Columns: 1D change, 4H change, RSI, distance to EMA and <b>trend score</b> (tap a header to re-sort).',
'<b>Custom symbol</b>: e.g. PEPE or PEPEUSDT → opens that coin\'s detail page directly.',
'<b>⭐ Watchlist</b> and <b>🔔 Price alerts</b> above the list; alerts fire with notification/sound while the app is open.'])}
${S('Reading the table')}
${L(['<b>Score</b>: weighted EMA direction, RSI and momentum on 1D and 4H. +100 = strong bull on both, −100 = strong bear. Near zero = range / timeframe conflict.',
'<b>🎯 Lens</b> (fills in gradually after the scan): Lens score on this coin\'s 4H candles — ▲ long / ▼ short with the stronger side\'s number; "!" = setup candle (LONG_SETUP/SHORT_SETUP). Strong green/red ≥70. Sort "🎯 Lens" brings the highest first; long-press/hover shows both sides.',
'<b>↑↑ / ↓↓</b>: daily and 4H aligned. <b>↑↓</b> = conflict → higher risk.',
'<b>RSI</b> above 70 on both = overbought; wait for a pullback.',
'<b>TT n/7</b> = Minervini Trend Template (Stage 2): price>SMA150>SMA200, SMA50>SMA150, price>SMA50, ≥30% above 52w low, ≤25% below 52w high, RS≥70 (3-month-return percentile among scanned coins). Filter "🏆 TT ≥6/7" and sort "TT/RS". Tag <b>⚠ +N×ATR</b> = price is N daily ATRs away from SMA50; ≥4 = extended — don\'t chase.'])}
${S('Coin detail page (tap a row)')}
${L(['<b>Chart timeframe</b> (default 4H) with an offline candlestick chart + EMAs.',
'<b>Analyze with ChatGPT</b>: 6-section report (summary, structure, levels, scenarios, plan, risk) using the OpenAI/OpenRouter key. With "Second opinion" Gemini reports separately; each has its own "Send to calculator".',
'<b>Send chart to Chart analysis (Gemini)</b>: pushes this coin\'s chart image to the Chart-analysis tab.',
'<b>📄 Report without AI</b>: same template from indicators only — no key, no cost.',
'<b>🔔 Alert</b> / <b>⭐ Watchlist</b> / <b>→ Back</b>.'])}
<p class="hint">The screener gives candidates, not signals; verify each in the Chart tab and with Lens.</p>`;

H.en.tv=`
${S('📈 Chart tab (home)')}
${L(['<b>Symbol</b> (BTCUSDT or just BTC), <b>exchange</b>, <b>timeframe</b> (default 4H) → <b>Show</b>.',
'<b>⛶</b> next to Show: landscape fullscreen; exit with ✕ on the chart.',
'<b>Chart source</b>: <b>TradingView</b> (official widget with drawing tools/indicators), <b>TheFreeChart</b> (pick symbol/timeframe inside the chart) or <b>FreeCharting</b> (free, no account; symbol/timeframe/theme applied from the fields above, direct OKX spot data (Binance is geo-blocked in Iran); futures-only / tokenized-stock symbols such as SOXL are not available here → use TradingView; the in-app embed is zoom/scroll only — the "full chart" link opens drawings, bar replay, backtests and 68 indicators in a new tab).',
'<b>Chart background</b>: dark/light.',
'The symbol/timeframe here is <u>the reference for every tool</u>: chart analysis, Lens, Roundtable, Replay, Time Machine, Risk Check.'])}
${S('💬 Ask AI about this chart')}
${L(['<b>Gemini / ChatGPT</b> model switch (keys in Settings).',
'Type a question and press ➤. The model does not see the picture, but receives <b>real data of this symbol/timeframe</b> (price, EMAs, RSI, ATR, levels, and the Lens packet if recently computed) plus the senior-analyst skill.',
'The chat has memory — follow up ("and if the 4H closes below X?"). <b>Clear chat</b> to restart.',
'Good question: "With this data, is a long setup valid? Give numeric trigger, SL, TP and what invalidates it."'])}
${S('Reading the answer')}
<p>Answers follow 🧭 bias / 🏗 structure / 📍 levels / ⚡ trigger / 🎯 plan / ⚠️ invalidation. Look for <b>numbers</b>; no numbers or R:R under 1:1.5 = no setup. The model gives scenarios, not predictions.</p>
<p class="hint">The free TradingView widget does not save drawings; for the full chart use Tools → Open in TradingView.</p>`;

H.en.market=`
${S('🌍 Market AI — senior macro analyst')}
${L(['<b>Gemini / ChatGPT</b>. Gemini can enable <b>web search</b> (checkbox by the input) to see today\'s news — burns free quota faster.',
'<b>💬 Free chat / learning</b>: normal Q&A and concepts.',
'<b>📋 Structured analysis</b>: forced template: market phase → drivers → liquidity/derivatives → key levels BTC/ETH/DXY/gold → primary & alternative scenario → risks of the week → action.',
'<b>Quick question…</b>: 5 frequent prompts (overview, dominance, gold/silver, macro & Fed, today\'s news).',
'<b>Clear chat</b>.'])}
${S('Live data block (above the chat)')}
<p>Sent automatically with every question: BTC/ETH price, BTC & USDT dominance, total market cap & 24h change, Fear & Greed, gold/silver/platinum (from perps), average funding.</p>
${S('🔥 CoinGecko trending')}
${L(['15 most-searched coins + hot categories. This is <i>attention</i>, not a buy signal — they often appear at peak hype.',
'<b>⚠️</b> = rank above 300 or market cap below $50M → very high risk / thin liquidity.',
'The chart button opens the coin in the Chart tab.'])}
${S('💸 Derivatives money flow')}
${L(['<b>Buy/sell pressure</b>: 24h volume × 24h price change — a directional proxy, not real exchange netflow.',
'<b>F</b> = funding (positive = longs pay; very positive = crowded longs, squeeze-prone).',
'<b>OI</b> = 1-day open-interest change (OKX). Price up + OI up = trend with new money; price up + OI down = short covering.',
'<b>buy%</b> = taker buy share. <b>L/S</b> = long/short account ratio (retail; usually a contrarian indicator).',
'<b>⟳ Refresh</b> per panel.'])}
<p class="hint">Read "market phase" and "risks of the week" first, then mark the numeric levels on your chart. Macro analysis is not for precise entry timing.</p>`;

H.en.tools=`
${S('📡 Auto-watch of the watchlist')}
${L(['Set <b>timeframe</b> and <b>min score</b>, tick "on".',
'While the app is open, every few minutes all watchlist symbols (⭐ in Screener) are scored with Lens; a qualifying setup triggers a notification + a row in the list. <b>No auto-trading.</b>',
'<b>🔍 Scan now</b> / <b>Clear list</b>.'])}
${S('🧪 Strategy lab')}
${L(['Inside the Lens output (Tools): a table with 6 strategies — Lens setup, Donchian-20 breakout (Turtle), RSI-2 pullback (Connors), Bollinger mean-reversion, MACD cross + EMA200 filter, EMA 20/50 crossover + HTF filter. Rules re-written from public descriptions (freqtrade/Jesse/books).','All use one exit model and the same fee/slippage over the last ~1000 candles of this symbol/timeframe, so "Avg R" is comparable. Verdict: has edge (avgR ≥ +0.15 & PF ≥ 1.2), weak, negative, few samples (<8).','Risk Check gets a "Strategy lab" row: a proposed strategy that is negative here with ≥15 trades → fail; the bot applies the same rule and, conversely, sends a live signal of a strategy that "has edge" here to the roundtable as a new candidate (data-driven strategy selection per symbol/timeframe).','Caveat: 6 months of data is 20–40 trades — enough to drop bad strategies, not to prove good ones.'])}
${S('🤖 Bot tab')}
${L(['The 🤖 Bot tab is results only: the 24/7 bot card and the signal ledger. Manual analysis tools stay in Tools.','Chart tab → \"📸 Vision analysis\": either the app draws this symbol/timeframe itself and sends it, or you pick a screenshot from the gallery; the vision analysis (SKILL + MTF data) starts automatically in the Chart Analysis tab.'])}
${S('🤖 24/7 bot')}
${L(['The bot (folder <b>lens-bot</b>) runs the app\'s own Lens engine off-phone: every 15 min over the symbols/timeframes in config.json → full packet (score, 4-quadrant regime, extension, SMC, patterns, structure/CHoCH/divergence, Sweep+CHoCH+FVG) → the same Risk-Check rules (Q4, against HTF, extension ≥4, opposing CHoCH, confirmed opposing pattern, R:R) → a full agents roundtable on a separate Gemini: technical analyst (packet + MTF 1D/4H/1H + 60 candles), macro/fundamental analyst (Google Search for the last 72h and the 7-day calendar; refreshed every 4h and shared across symbols), sentiment/derivatives analyst (funding, OI, premium, taker ratio, long/short ratio, F&G, dominance) → bull-vs-bear debate → risk manager (LONG/SHORT/WAIT/SKIP + confidence + who was overruled). Daily LLM budget (default 220 calls); when exhausted, the single judge and then the rules → paper trade sized account × risk% × regime multiplier.',
'Positions are managed on closed candles only: SL −1R, T1 then SL +0.25R, T2 +2.25/+3R, 40-bar timeout; fee+slippage+funding deducted. Max 6 positions, one per symbol; the rest are "alert only".',
'Setup: public GitHub repo (Actions free & unlimited) → Secret GEMINI_API_KEY → enable Actions and press Run workflow once → paste the raw URL of public/bot.json in Settings. Works without a Gemini key too (judge = rules).',
'In the app: last-run status (red if >90 min), paper result in R/$, stats by regime/timeframe/side, open positions with MTM, recent setups with the judge\'s reasons and "Chart" / "→ Calculator" buttons for a manual real entry. New setups toast/notify while the app is open (checked every 5 min).',
'Universe (v75): automatic every run — top-60 OKX USDT perps by volume (filtered to symbols that have a spot market, so tokenized stocks and perp-only micro-caps drop out) + gold/silver + 14 forex pairs from Yahoo Finance (1H and 1D; 4H aggregated from 1H). Three phases: quick scan of everything (320 candles) → candidate pick with a per-asset-class quota → deep analysis of the top 12 (1000 candles + HTF + lab + rules + roundtable). Forex costs: 0.02% spread, no fee/funding. config.json: universe.cryptoTop, forex, metals, classes (you may add "stock").','AI mandatory (v77, `requireAI:true`): if no key/model is available the setup is NOT opened and the simple judge is NOT used; it is logged as ⏳ "waiting for AI" and retried on up to 4 following runs (while that candle is still the last closed one), then rejected. To reduce 429s: ≥6.5 s between calls, rotation over key×model slots (flash and flash-lite have separate quotas), 60 s cool-down of a slot after 503.','The bot never places real orders and holds no exchange keys.'])}
${S('📒 Signal ledger')}
${L(['Every Lens setup (LONG_SETUP/SHORT_SETUP) from any source — 🎯 button, auto-watch, screener 🎯 — is recorded with entry/SL/T1/T2 at that moment (no duplicates per candle).',
'"Settle" fetches the closed candles that followed and resolves it: SL = −1R; T1 then SL = +0.25R; T2 = +2.25R (or +3R if T1 was skipped); 40 bars without a result = mark-to-market. Auto-settles every 30 min while the app is open.',
'Stats by 4-quadrant regime, timeframe and source show where the engine <u>actually</u> works. Don\'t conclude below N=30. If a regime stays negative after 1–2 months, stop trading it — that is the whole point of this ledger.'])}
${S('🧰 Analysis tools (on the Chart-tab symbol/timeframe)')}
<p><b>🎯 Lens (this candle)</b> — local, no-AI computation on the last <u>closed</u> candle:</p>
${L(['<b>Decision panel</b> (top of the card): engine decision, score, regime and size multiplier, HTF, last structure event, plan, size/$ risk and warnings in one table. In <b>Simple mode</b> (Lens settings) the rest of the details and Time Machine are collapsed; open "Full details" or turn simple mode off. 📡 = current data source (okx/bitget/gate, or cache = offline with the last stored candles).',
'<b>Score −100…+100</b>: weighted trend (EMA 20/50/200), momentum (RSI/MACD), structure (HH/HL), volume and HTF bias. |score| ≥ 60 strong; 30–60 medium; < 30 no trade.',
'<b>4-quadrant regime</b> (trend × volatility): Q1 clean trend (trend-follow, full size) / Q2 volatile trend (breakouts, half size) / Q3 quiet range (mean reversion from the edges, 0.75 size) / Q4 choppy chaos (sit out). ADX = trend strength, ATR pct = volatility percentile over the last 100 bars, Hurst < 0.45 = mean-reverting, > 0.55 = trending. Each quadrant shows a playbook (home strategies) and an avoid list; in the strategy tester rows are tagged 🏠 home / 🚫 away.',
'<b>Setups</b>: EMA pullback, Zone Break, with-trend engulfing, <b>Champion absorption</b> (absorption wicks at the value edge + failed second break) and volume profile (POC/VAH/VAL).',
'<b>🔀 Structure</b>: swing trend (HH/HL or LH/LL from ZigZag pivots), last event <b>BOS</b> (with-trend break = continuation) or <b>CHoCH</b> (first break against the swing trend = possible reversal; Risk Check fails a CHoCH against the trade), <b>RSI/MACD divergence</b> regular (new price extreme, indicator not = exhaustion) and hidden (continuation) on the last two pivots + the forming one, and <b>Fibonacci levels</b> of the last completed leg (0.382/0.5/0.618/0.786 + 1.272/1.618 extensions) with the current retracement. New candle patterns: morning/evening star, hanging man, inverted hammer, spinning top.',
'<b>📐 Classic chart patterns</b> (mechanical, on ZigZag pivots with a 2×ATR reversal): double/triple top & bottom, head & shoulders (+inverse), ascending/descending/symmetrical triangle, rising/falling wedge, ascending/descending channel, rectangle, megaphone and broadening wedges, bull/bear flag. Each with status <b>forming</b> (wait for the neckline/line break) or <b>confirmed break</b> + measured target (pattern height) and invalidation. Risk Check: a confirmed pattern against the trade = fail, a forming one = warn. Fuzzy patterns (Dragon, Adam&Eve, cup & handle, bump & run, dead cat) are deliberately not auto-detected; the AI image analysis covers those.',
'<b>🧱 SMC/ICT zones</b> (mechanical, no AI): <b>FVG</b> = unfilled 3-candle gap (wicks of bar 1 and 3 don\'t overlap), <b>OB</b> = last opposite candle before a ≥2×ATR displacement that breaks the 20-bar high/low, <b>Breaker</b> = broken OB with flipped role, <b>VI</b> = gap between two candle bodies. The card shows the nearest zone above (▲) and below (▼) with distance in ATR plus counts of active zones in the last 150 bars; zones more than 50% filled are dropped. Use: enter at an aligned zone, stop beyond it, first target before the next opposing zone. Risk Check warns when an opposing zone is less than 1×ATR ahead. These are <u>reaction areas</u>, not signals; alone they have no proven edge.',
'<b>Extension from EMA50</b>: close distance from EMA50 in ATRs; ≥4 (or ≤−4 for shorts) = extended, Risk Check fails it, 2.5–4 warns.',
'<b>Plan</b>: entry, SL (behind structure / 1.5×ATR), T1/T2, R:R and <b>position size</b> from Settings account/risk%. If R:R < your min R:R or against HTF (with that option on) → <b>NO TRADE</b>.',
'<b>⏱ Time Machine</b> (below Lens): runs the same rule over this symbol\'s history: N, Win%, T1%/T2% reached, SL%, Avg R; filter long/short, with/against HTF. N < 15 = statistics not reliable.'])}
<p><b>⚖️ Agent roundtable</b> — 6 AI roles in sequence: technical, macro, sentiment/derivatives, bull advocate, bear advocate and finally the <b>risk manager</b> who decides (LONG/SHORT/NO TRADE + size). Check <b>agent agreement</b>: low agreement = stay out. If one agent fails the roundtable continues.</p>
<p><b>🎬 Replay & strategy tester</b>:</p>
${L(['<b>Indicators</b>: EMA20/50/200, Bollinger, Keltner, Donchian 20, Ichimoku, daily VWAP, Supertrend(10,3), Parabolic SAR, classic daily pivots, swings (5-bar fractals), volume, and RSI / MACD / Stochastic panes — one tap each. 60–400 visible bars; drag to scroll back.','<b>Timeframe</b>: 1H / 4H / 1D buttons above the chart reload the same symbol at the same point in time (replay trades reset; drawings are stored per timeframe).',
'<b>⛶ landscape</b>: fullscreen with landscape lock; if the device refuses rotation the chart itself rotates 90°. Exit with ✕ or Back.','<b>Strategy</b>: pick one of the 6 Lab strategies; its signals are marked with triangles on past bars and announced (📣) on the current bar. “🤖 auto-trade” enters on every signal with your SL/TP; win rate, total R and max DD accumulate so you can watch bar by bar where the strategy works and where it fails.','<b>Drawing</b>: horizontal/vertical line (one tap), trend line, ray, zone, Fib retracement (2 taps), Fib extension (3 taps: swing start, swing end, retracement end → 0.618/1/1.272/1.618/2/2.618), 📈 linear-regression channel (2 taps: range → regression line ±1σ/±2σ, slope %/bar and current distance in σ), 📏 measure (%, ATR multiples, bars), 🎯 position (entry then stop; TP from “TP (R)”, size from account settings), T text, ⌫ erase (tap a drawing), 🧲 magnet (snap to O/H/L/C); ↶ undo, 🗑 clear. Stored per symbol/timeframe on the device.','<b>Start N candles back</b> slider. The future is hidden.',
'<b>⏮ / ▶ +1 / ⏩ +10 / ▶▶ (auto-play, speed)</b>.',
'<b>SL (×ATR)</b>, <b>TP (R)</b>, <b>max hold</b>: identical trade management for you and the auto tester.',
'<b>Round-trip fee + slippage</b> (default 0.1% + 0.03%) and an approximate funding cost of 0.01%/8h are deducted from every trade (Time Machine too). Results are "after costs" — more honest and usually smaller.',
'<b>💧 Sweep + CHoCH + FVG</b> (10th rule, ICT entry model): wick below the last swing low but close above it (liquidity sweep) → within 10 bars a close above the last swing high (CHoCH/MSS) → a bullish FVG left in that move → entry on the first return into the FVG (within 15 bars) with a bullish close. Mirrored for shorts. Live state shows in the Lens card (SWEPT / ARMED / ENTRY); the logical stop is beyond the sweep level. Home: Q2/Q3.',
'<b>🧱 FVG retest</b> (9th rule): unfilled 3-candle gap (≤60 bars old), price trades into it and closes back out with the EMA20/50 trend. Home regime Q1/Q2.',
'<b>▲ LONG / ▼ SHORT / Close</b>: manual trade on the current close. Stats (N, win%, total R) and log below. The Lens score of that moment is shown so you can practise.',
'<b>📐 Trade plan</b>: draggable entry/SL/TP lines; <b>⇅</b> flips side; <b>→ Calculator</b> sends the numbers.',
'<b>🧪 Run test</b>: 8 rules (EMA cross, 20-bar breakout, EMA pullback, RSI, with-trend engulfing, Zone Break, volume profile, Champion) on this range with identical management. Columns: N, win%, PF (gross profit ÷ gross loss; > 1.3 good), total R, max drawdown. <b>Survival filter</b>: min N, max drawdown (R), min PF and "must beat Buy & Hold" (B&H converted to R with the same stop size). Rejected rows are greyed out with the reason in the last column; if nothing passes there is no edge on this symbol/timeframe. <b>🧬 Robustness test</b> (after running the test): <b>Monte Carlo</b> reshuffles the trade order 1000× and reports P95 drawdown and the probability of exceeding your DD cap; <b>sensitivity</b> reruns the rule with 9 SL/TP combos (≥6 positive = robust plateau, fewer = fragile spike); <b>IS/OOS</b> compares the first half of the range with the unseen second half. Verdict: ✅ robust / ⚠️ mixed / ❌ fragile. <u>Relative comparison on this symbol only — not a promise.</u>'])}
<p><b>↗ Open in TradingView</b>: full tradingview.com chart with this symbol/timeframe in a new tab (Bar Replay and saved drawings live there).</p>`;

H.en.journal=`
${S('📒 Trade journal')}
${L(['Trades arrive here from the calculator ("Save to journal") or from analyses.',
'<b>Open / Closed / All</b> filter. Tap a trade to log its outcome: TP / SL / manual close with exit price → realised R; then a "note" and a "lesson" (one-line postmortem) are asked.',
'<b>Banner at the top</b>: risk circuit-breaker status (🟢/🟡/⛔) based on these trades — configured in ⚙️.',
'<b>Performance stats</b>: count, win rate, total R, average R, best/worst, <b>Expectancy</b> (avg R per trade; positive = profitable system), <b>Profit Factor</b>, and the breakdown by hour of day.',
'<b>Export CSV / JSON</b> for Excel or backup (Settings → import restores the journal too).',
'The calculator\'s daily risk cap is computed from today\'s <b>open</b> trades in this journal.'])}
<p class="hint">You need ≥ 30 logged trades before stats mean anything. Log every trade <i>before</i> entering, not after.</p>`;

H.en.settings=`
${S('⚙️ Settings')}
${L(['<b>Appearance</b>: dark/light. Language via the FA/EN button in the header.',
'<b>Second opinion</b>: on → in Screener and Chart analysis the second model also analyses (double cost).',
'<b>Export/Import settings (JSON)</b>: full backup of keys, watchlist, alerts, journal and settings. <b>Wipe keys</b> deletes API keys only.',
'<b>Approx. analysis cost this month</b>: token-based estimate.'])}
${S('ChatGPT key (OpenAI / OpenRouter / custom)')}
${L(['<b>Provider</b>: OpenAI (default), OpenRouter (one key, hundreds of models; <b>:free</b> models cost nothing) or a custom OpenAI-compatible base URL.',
'<b>API key</b>, <b>model</b> (or "Load available models"), <b>Save</b>, <b>Test connection</b>.',
'Keys are stored only on this device (localStorage) and sent directly to the provider — no server in between.'])}
${S('Gemini key')}
${L(['Get it from Google AI Studio. Defaults: gemini-3.6-flash (fast/cheap) and gemini-3.6-pro (more accurate). "Load models" lists what your key allows.',
'Error 429 = free quota exhausted; wait or disable web search. 503 = overloaded; the app retries automatically.'])}
${S('⛔ Risk circuit breaker')}
<p>Computed from <b>closed journal trades</b>: daily/weekly loss caps (in R), max consecutive losses per day, and a cool-down after each loss (anti revenge-trading). Status shows in this card, as the first row of the calculator's Risk Check, and at the top of the journal; saving a trade also warns. 🟢 open / 🟡 cooling / ⛔ tripped. The app does not block orders — you enforce the rule.</p>
${S('🎯 Lens / risk management')}
${L(['<b>Account size</b>, <b>risk per trade %</b> (1–3% recommended), <b>min R:R to T2</b>: basis for sizing in Lens, Roundtable, Risk Check and the calculator\'s % mode.',
'<b>No trades against HTF bias</b>: Lens marks counter-HTF setups as NO TRADE.'])}
${S('🎓 "Senior financial markets analyst" skill')}
<p>On by default. Instructs every analysis (chart chat, image analysis, screener, Market AI, roundtable) to be number-anchored, falsifiable, free of clichés, and to say NO SETUP when R:R < 1:1.5. Turning it off makes answers more generic.</p>
${S('📘 Help & formulas')}
<p>The card at the bottom: full calculator formulas with a numeric example.</p>`;

/* ---------------- UI ---------------- */
const css=document.createElement('style');css.textContent=`
.page{position:relative}
.page>.helpq+.card>*:first-child{padding-inline-end:30px}
.helpq{position:absolute;top:8px;inset-inline-end:8px;z-index:5;width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--card2);color:var(--acc,#3b82f6);font-weight:800;font-size:15px;line-height:26px;text-align:center;cursor:pointer;padding:0;opacity:.9}
.helpq:hover{opacity:1}
#helpOv{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:none;align-items:flex-end;justify-content:center}
#helpOv.on{display:flex}
#helpMd{background:var(--card);color:var(--txt);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:760px;max-height:88vh;overflow:auto;padding:14px 16px 24px;font-size:13.5px;line-height:1.75}
#helpMd h2{margin:0 36px 8px 0;font-size:16px}
#helpMd h3{margin:14px 0 4px;font-size:14px;color:var(--acc,#3b82f6)}
#helpMd ul{margin:4px 0;padding-inline-start:18px}
#helpMd li{margin:3px 0}
#helpMd p{margin:6px 0}
#helpX{position:absolute;top:10px;inset-inline-end:14px;background:none;border:0;color:var(--txt);font-size:22px;cursor:pointer;padding:4px 8px}
#helpWrap{position:relative}
@media(min-width:720px){#helpOv{align-items:center}#helpMd{border-radius:16px}}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='helpOv';ov.innerHTML='<div id="helpMd"><div id="helpWrap"><button id="helpX" aria-label="close">✕</button><h2 id="helpT"></h2><div id="helpB"></div></div></div>';
document.body.appendChild(ov);
const titleFallback={fa:{journal:'📒 ژورنال',settings:'⚙️ تنظیمات'},en:{journal:'📒 Journal',settings:'⚙️ Settings'}};
window.showHelp=function(id){const lg=(typeof lang!=='undefined'&&lang)||localStorage.getItem('fc_lang')||'fa';const h=(H[lg]||H.fa)[id];if(!h)return;
  let tt=(titleFallback[lg]||{})[id]||'';if(!tt){const tb=document.querySelector('.tabs button[data-tab="'+id+'"]');tt=tb?tb.textContent.trim():'';}
  document.getElementById('helpT').textContent=(lg==='fa'?'راهنمای ':'Help: ')+tt;
  const b=document.getElementById('helpB');b.innerHTML=h;b.dir=lg==='fa'?'rtl':'ltr';b.style.textAlign=lg==='fa'?'right':'left';
  ov.classList.add('on');document.getElementById('helpMd').scrollTop=0;};
const close=()=>ov.classList.remove('on');
document.getElementById('helpX').onclick=close;ov.addEventListener('click',e=>{if(e.target===ov)close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
document.querySelectorAll('.page').forEach(p=>{const id=p.id.replace('page-','');if(!H.fa[id])return;const b=document.createElement('button');b.className='helpq';b.type='button';b.textContent='?';b.title=b.ariaLabel='Help';b.dataset.help=id;b.onclick=()=>showHelp(id);p.insertBefore(b,p.firstChild);});
})();
