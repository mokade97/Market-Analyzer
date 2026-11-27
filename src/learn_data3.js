/* ==== learn_data3.js (v127): Trading Academy curriculum, part 3 (modules 7–8) + tutor skill + book list. ==== */
window.LEARN_MODULES=window.LEARN_MODULES||[];
window.LEARN_MODULES.push(
{id:'m7',level:'advanced',icon:'🤖',title:'اجرا، پیپر تریدینگ و ربات',titleEn:'Execution, paper trading, bots',lessons:[
{id:'m7l1',title:'از بک‌تست تا زنده: پیپر، سایز کوچک، مقایسه',titleEn:'Backtest → paper → live',mins:25,src:['Chan — Quantitative Trading (ch. execution)','Carver','تجربه‌ی صنعت'],
body:`مرحله‌ها و معیار عبور:
۱) **پیپر زمان‌واقعی ۲–۳ ماه** (صرافی مجازی اپ): معیار = نتیجه در محدوده‌ی انتظار بک‌تست همان دوره (±۱ انحراف معیار ماهانه) و بدون خطای اجرایی. انحراف بزرگ معمولاً از لغزش، فاندینگ یا تضاد پوزیشن‌هاست، نه از اندیکاتور.
۲) **زنده با ۵–۱۰٪ سرمایه‌ی هدف** حداقل ۵۰ معامله: معیار = لغزش واقعی ≤ فرض بک‌تست، اجرای ۱۰۰٪ قواعد.
۳) **افزایش تدریجی سایز** (هر ماه ≤ ۲ برابر) تا سایز هدف؛ هر افت بزرگ‌تر از ۱٫۵× افت تاریخی = توقف و بازبینی.
ثبت **لغزش** هر معامله (قیمت سیگنال در برابر قیمت پر شدن) ضروری است؛ میانگین آن را در بک‌تست‌های بعدی به‌کار ببر.
**مقایسه‌ی زنده با بک‌تست** باید منظم باشد: همان قواعد روی همان دوره را دوباره بک‌تست کن و معامله به معامله تطبیق بده؛ اختلاف‌ها را دسته‌بندی کن: داده (کندل متفاوت صرافی)، زمان (کلوز در برابر باز)، هزینه، خطای انسانی.
قاعده‌ی طلایی: تا وقتی سیستم در پیپر و سایز کوچک «کسل‌کننده» و قابل‌پیش‌بینی نشده، سایز را بالا نبر.`,
ex:[{type:'app',task:'صرافی مجازی اپ را با استراتژی‌های TEP+VAB روی 4H و ریسک ۰٫۵٪ فعال کن (یا اگر قبلاً فعال است، آمارش را بخوان). سپس همان استراتژی را در بک‌تست روی یکی از نمادها و همان دوره اجرا کن و اختلاف‌ها را فهرست کن.'}]},
{id:'m7l2',title:'قواعد ریسک سبد برای ربات و مدار قطع‌کن',titleEn:'Portfolio risk rails for a bot',mins:25,src:['Carver','پژوهش داخلی (DD ۵۰–۱۲۰R)','Market Wizards'],
body:`ربات باید قبل از هر ورود این‌ها را چک کند (صرافی مجازی و ربات اپ همین را دارند):
• ریسک هر معامله: ۰٫۲۵–۰٫۵٪ برای سیستم‌های کم‌برد با DD ۵۰–۱۲۰R (TEP/VAB). با ۱٪ و DD ۸۰R، افت ۵۰٪+ محتمل است.
• **سقف ریسک باز کل** ۴–۶٪؛ **سقف هم‌جهت** ۳؛ **سقف ارزش اسمی** ۳× حساب (کنترل اهرم مؤثر)؛ **حداقل ارزش** صرافی.
• **یک پوزیشن در هر نماد**؛ **کول‌داون** بین سیگنال‌های هم‌جهت یک نماد.
• **مدار قطع‌کن**: ضرر روزانه/هفتگی/ماهانه؛ افت از اوج ≥ X٪ → توقف و بازبینی انسانی؛ خطای اتصال/داده → بدون ورود جدید، مدیریت خروج ادامه.
• **سایز نوسان‌محور** و کاهش سایز در افت.
• **تقویم**: بدون ورود جدید ۳۰ دقیقه قبل/بعد از CPI/FOMC (اسپرد و لغزش).
• **همبستگی**: اگر ۳ لانگ آلت باز است، لانگ چهارم عملاً اضافه کردن به یک پوزیشن است.
پایش روزانه ۵ دقیقه‌ای: پوزیشن‌ها با استاپ روی صرافی؟ مارجین آزاد؟ آخرین اسکن موفق؟ لغزش امروز؟ اختلاف با پیپر؟`,
ex:[{type:'quiz',q:'با DD تاریخی ۸۰R، ریسک ۱٪ در هر معامله یعنی افت تاریخی حدود:',opts:['۸٪','۲۰٪','۵۰٪+ (با مرکب کمتر، ولی بسیار سنگین)','۱٪'],a:2,why:'۸۰R × ۱٪ ≈ ۸۰٪ خطی؛ با کاهش سایز در افت کمتر، اما غیرقابل‌تحمل. ۰٫۲۵٪ → ~۲۰٪.'}]},
{id:'m7l3',title:'عملیات ربات: داده، زمان‌بندی، خطا، امنیت',titleEn:'Bot operations',mins:25,src:['مستندات صرافی‌ها','SRE basics','طراحی ربات اپ'],
body:`• **داده**: فقط کندل‌های بسته؛ تطبیق زمان UTC؛ پر کردن کندل‌های جاافتاده؛ تشخیص داده‌ی ناقص (حجم صفر، گپ) → بدون سیگنال.
• **زمان‌بندی**: اجرای اسکن چند ثانیه بعد از بسته شدن کندل (4H: ۰۰/۰۴/۰۸…) نه روی کندل باز؛ ایدمپوتنت (هر سیگنال فقط یک بار؛ کلید سیگنال = نماد+تایم‌فریم+زمان کندل).
• **حالت (state)**: پوزیشن‌ها و استاپ‌ها در فایل/DB؛ بعد از ری‌استارت با صرافی تطبیق داده شود (reconcile).
• **خطا**: ریترای با backoff برای ۴۲۹/۵۰۳؛ لاگ ساختاریافته؛ هشدار (تلگرام/نوتیف) برای: ورود، خروج، خطای مکرر، افت از آستانه.
• **امنیت**: کلید فقط معامله، IP محدود، بدون برداشت؛ کلید در env نه کد؛ دسترسی سرور با SSH key؛ به‌روزرسانی.
• **حالت فقط-هشدار** پیش از خودکار کامل: ربات سیگنال می‌دهد، انسان تأیید می‌کند (ربات اپ در حالت «کتاب زنده» همین است).
• **تست**: شبیه‌سازی آفلاین با داده‌ی واقعی قبل از استقرار (مثل تست e2e صرافی مجازی اپ)؛ Kill switch دستی.
بدترین خطاهای واقعی: دوبار ورود روی یک سیگنال، استاپ در حافظه نه صرافی، واحد اشتباه (کوین/کانترکت)، تایم‌زون.`,
ex:[{type:'ai',task:'یک «runbook» یک‌صفحه‌ای برای ربات بنویس: چه کسی/چه زمانی چه چیزی را چک می‌کند، در ۵ خطای رایج (قطع اتصال، سیگنال تکراری، استاپ گم‌شده، لغزش غیرعادی، افت از آستانه) دقیقاً چه می‌شود.'}]}
]},

{id:'m8',level:'advanced',icon:'🎓',title:'پیشرفته: رژیم، تطبیق، و درس‌های جادوگران بازار',titleEn:'Advanced: regimes, adaptation, Market Wizards',lessons:[
{id:'m8l1',title:'تشخیص رژیم و استراتژی تطبیقی',titleEn:'Regime detection & adaptive strategies',mins:30,src:['Kaufman (Efficiency Ratio)','Ang & Bekaert (regime switching)','پژوهش داخلی (رژیم ۵حالته)'],
body:`رژیم = ترکیب **جهت** (روند صعودی/نزولی/خنثی) و **نوسان** (بالا/پایین). ابزارهای ساده: کلوز نسبت به EMA200 + شیب EMA50 (جهت)، ATR٪ نسبت به میانگین ۱۰۰ کندل (نوسان)، ADX/Choppiness/Kaufman ER (روند در برابر رنج).
شواهد ما: فیلتر رژیم ساده تقریباً همه‌ی استراتژی‌های روندی را از منفی به مثبت برد؛ بدون آن ۱۶۰۰ معامله‌ی اره‌ای با −۸۳R. رژیم مهم‌تر از ماشه است.
**تطبیق** می‌تواند ساده باشد: (۱) روشن/خاموش کردن خانواده‌ی استراتژی بر اساس رژیم؛ (۲) سایز بر اساس نوسان؛ (۳) پارامتر تریل بر اساس ATR (خودکار). تطبیق پیچیده (مدل‌های مارکوف پنهان، ML) ریسک اورفیت بالایی دارد؛ فقط با اعتبارسنجی سخت.
**تغییر رژیم** زمان افت‌هاست: روندی‌ها در شروع رنج، برگشتی‌ها در شروع روند. پذیرش این که «دوره‌ی بد» بخشی از هر سیستم است، مهم‌تر از پیش‌بینی رژیم است.
**چرخه‌ی ۴ ساله‌ی کریپتو** (هاوینگ) یک رژیم کلان است: ۲۰۲۲ نزولی، ۲۰۲۳–۲۴ صعودی؛ سیستم را روی هر دو بسنج. سال ۲۰۲۵ در آزمون ما تقریباً صفر بود — سال‌های صفر طبیعی‌اند.`,
ex:[{type:'chart',kind:'predict',task:'۲۰ کندل بعد پنهان است: فقط از روی ساختار/EMA/ATR پیش‌بینی کن روند یا رنج؟ ۱۰ بار تکرار کن و درصد درستی‌ات را در ژورنال بنویس — هدف این تمرین فروتنی آماری است، نه پیش‌گویی.'},{type:'ai',task:'یک «جدول رژیم × استراتژی» برای TEP، VAB، ICHI و یک mean-reversion فرضی بساز (روند قوی/روند ضعیف/رنج کم‌نوسان/رنج پرنوسان) و برای هر خانه بگو: فعال، نیمه‌سایز، خاموش — با دلیل آماری.'}]},
{id:'m8l2',title:'درس‌های جادوگران بازار و اصول مشترک برندگان',titleEn:'Lessons from Market Wizards',mins:25,src:['Schwager — Market Wizards / New / Hedge Fund / Unknown Market Wizards','Covel — Trend Following (پروفایل معامله‌گران)'],
body:`شواگر پس از ده‌ها مصاحبه، اصول مشترک را این‌طور خلاصه می‌کند:
• **هیچ راه واحدی نیست**: روندی (دنیس، سیکوتا)، بنیادی-کلان (جونز، دراکنمیلر)، کوتاه‌مدت (مارکوس)؛ همه سودده، همه متفاوت. روش باید با شخصیت تو بخواند.
• **مدیریت ریسک مقدم بر همه چیز**: «از ضررها مراقبت کن، سودها از خودشان مراقبت می‌کنند» (مارکوس)؛ هرگز بیش از ۱–۲٪ در یک ایده.
• **انعطاف**: جونز: «وقتی اشتباه می‌کنم سریع خارج می‌شوم»؛ تغییر نظر ضعف نیست.
• **صبر برای ستاپ‌های برتر** و **تهاجم در آن‌ها** (دراکنمیلر: وقتی حق با توست، بزرگ باش — با مدیریت ریسک).
• **انضباط و روتین**؛ ژورنال؛ مرور اشتباهات.
• **استقلال از جمع**؛ اخبار را به‌عنوان «قیمت چگونه به خبر واکنش می‌دهد» بخوان، نه خودِ خبر.
• **ضرر بخشی از بازی است**: بهترین‌ها برد ۴۰–۵۰٪ دارند (و روندی‌ها کمتر).
• **تواضع نسبت به بازار** و بی‌اعتمادی به «قطعیت».
نکته‌ی هشداردهنده‌ی شواگر: بسیاری از جادوگران دوره‌های نابودکننده داشتند (سیکوتا، دنیس) — بقا مقدم بر بازده.`,
ex:[{type:'ai',task:'سه اصل از این درس را انتخاب کن که در ژورنال/رفتار خودت ضعیف‌ترند و برای هر کدام یک قاعده‌ی مکانیکی قابل‌اندازه‌گیری تعریف کن که هفته‌ی بعد بتوانی اجرای آن را درصدی گزارش کنی.'}]},
{id:'m8l3',title:'یادگیری ماشین در ترید: کجا کمک می‌کند، کجا فریب می‌دهد',titleEn:'ML in trading: promise & traps',mins:25,src:['López de Prado — Advances in Financial ML','Jansen — Machine Learning for Algorithmic Trading'],
body:`نسبت سیگنال به نویز در بازار بسیار پایین است؛ ML بدون انضباط آماری فقط اورفیت سریع‌تر می‌سازد. درس‌های de Prado:
• **برچسب‌گذاری درست** (triple-barrier: استاپ/هدف/زمان) به‌جای «بازده کندل بعد».
• **اعتبارسنجی بدون نشت**: purged k-fold / CPCV؛ تقسیم تصادفی معمولی نشت زمانی دارد.
• **اهمیت ویژگی** پایدار در برابر زمان؛ ویژگی‌های کم و معنادار (رژیم، نوسان، ساختار) بهتر از صدها اندیکاتور همبسته.
• **شارپ تعدیل‌شده برای تعداد آزمایش**.
• کاربردهای واقع‌بینانه برای معامله‌گر خرد: (۱) **فیلتر** سیگنال‌های سیستم قاعده‌مند (مثلاً پیش‌بینی «این شکست پذیرفته می‌شود؟»)؛ (۲) **تشخیص رژیم**؛ (۳) **سایز**. نه تولید سیگنال از صفر.
• LLMها (مثل همین مربی) برای **تحلیل متن، خلاصه‌ی اخبار، بازبینی ژورنال و کدنویسی بک‌تست** عالی‌اند؛ برای پیش‌بینی قیمت نه. ایجنت‌های اپ به همین دلیل روی داده‌ی ساختاریافته‌ی Lens و با نقش «تحلیل‌گر/مدیر ریسک» کار می‌کنند، نه «پیش‌گو».
معیار: اگر مدل ML روی داده‌ی بُرخورده (shuffled) هم «خوب» است، چیزی جز نشت یاد نگرفته.`,
ex:[{type:'ai',task:'یک طرح ML محافظه‌کارانه برای «فیلتر سیگنال‌های VAB» بنویس: برچسب، ویژگی‌ها (حداکثر ۸)، روش اعتبارسنجی، معیار موفقیت در برابر خط پایه (VAB بدون فیلتر)، و دو نشانه‌ی اورفیت که باید رد کند.'}]},
{id:'m8l4',title:'طرح معاملاتی کامل: پروژه‌ی پایانی',titleEn:'Capstone: your complete trading plan',mins:50,src:['Tharp (Business plan for trading)','Elder (Three M: Mind, Method, Money)'],
body:`پروژه‌ی پایانی: یک سند یک تا دو صفحه‌ای که همه‌ی ماژول‌ها را به هم وصل می‌کند. مربی آن را با چک‌لیست زیر نمره می‌دهد:
۱) **هدف و محدودیت‌ها**: سرمایه، تحمل افت، زمان در روز، هدف واقع‌بینانه (R سالانه، نه درصد خیالی).
۲) **بازار/تایم‌فریم/سبد**: چرا 4H؟ چند نماد؟ همبستگی؟
۳) **سیستم‌ها** (حداقل دو، کم‌همبسته): قواعد بدون ابهام، شواهد (IS/OOS/WF، افت، PF، تعداد)، شرایط توقف هر سیستم.
۴) **ریسک**: ریسک هر معامله از افت مونت‌کارلو؛ سقف‌های سبدی؛ مدار قطع‌کن؛ برنامه‌ی افت.
۵) **اجرا**: نوع سفارش، زمان اسکن، پیپر→زنده، لاگ لغزش.
۶) **روان‌شناسی و روتین**: چک‌لیست ورود، قواعد تیلت، ژورنال و بازبینی هفتگی/ماهانه.
۷) **بهبود**: چه زمانی و چگونه سیستم را بازبینی می‌کنی (فصلی)، چه چیزی «شکست سیستم» است (افت > ۱٫۵× تاریخی یا WF منفی دو دوره).
۸) **امنیت و عملیات**: کلیدها، پشتیبان، runbook.
معیار قبولی: هر بند عددی و قابل‌راستی‌آزمایی باشد؛ هیچ جمله‌ای مثل «با احتیاط معامله می‌کنم» بدون عدد پذیرفته نمی‌شود.`,
ex:[{type:'ai',task:'طرح معاملاتی کامل خودت را طبق ۸ بند بالا بنویس و برای نمره‌دهی بفرست. مربی هر بند را ۰–۱۰ نمره می‌دهد، ضعیف‌ترین سه بند را با پیشنهاد مشخص اصلاح می‌کند و نسخه‌ی بهبودیافته‌ی همان بندها را می‌نویسد.'}]}
]}
);

/* ---- reference library shown in the Academy sidebar (titles + why it matters; no copyrighted text) ---- */
window.LEARN_BOOKS=[
['John J. Murphy','Technical Analysis of the Financial Markets','مرجع استاندارد تحلیل تکنیکال: روند، الگوها، حجم، اندیکاتورها.'],
['Steve Nison','Japanese Candlestick Charting Techniques','منبع اصلی کندل‌استیک در غرب؛ الگوها در زمینه.'],
['Alexander Elder','Trading for a Living / Come Into My Trading Room','سه M: ذهن، روش، پول؛ سیستم سه‌صفحه‌ای؛ قواعد ۲٪ و ۶٪.'],
['Van K. Tharp','Trade Your Way to Financial Freedom','R-multiple، انتظار ریاضی، اندازه‌ی پوزیشن به‌عنوان کلید.'],
['Mark Douglas','Trading in the Zone','ذهنیت احتمالاتی؛ پنج حقیقت بنیادی؛ چهار ترس.'],
['Jack Schwager','Market Wizards (سری)','اصول مشترک معامله‌گران برتر؛ تقدم مدیریت ریسک.'],
['Curtis Faith','Way of the Turtle','سیستم کامل لاک‌پشت‌ها و درس‌های اجرای آن.'],
['Michael Covel','Trend Following','شواهد بلندمدت دنباله‌روی روند و روان‌شناسی آن.'],
['Andreas Clenow','Following the Trend / Stocks on the Move','نسخه‌ی مدرن و سبدی روندی و مومنتوم با کد.'],
['Robert Pardo','The Evaluation and Optimization of Trading Strategies','واک‌فوروارد، تحلیل فلات، اورفیت.'],
['Ernest Chan','Quantitative Trading / Algorithmic Trading','بک‌تست عملی، هزینه‌ها، برگشت به میانگین و مومنتوم.'],
['Robert Carver','Systematic Trading','چارچوب سیستماتیک، تخصیص ریسک، سبد قواعد.'],
['Marcos López de Prado','Advances in Financial Machine Learning','اعتبارسنجی بدون نشت، شارپ تعدیل‌شده، برچسب‌گذاری.'],
['James Dalton','Mind over Markets','نظریه‌ی حراج و پروفایل بازار (POC، ناحیه‌ی ارزش).'],
['Al Brooks','Trading Price Action (۳ جلد)','پرایس‌اکشن کندل‌به‌کندل؛ سخت اما عمیق.'],
['Perry Kaufman','Trading Systems and Methods','دانشنامه‌ی سیستم‌ها و اندیکاتورها با ریاضیات.'],
['David Aronson','Evidence-Based Technical Analysis','آزمون علمی ادعاهای تکنیکال؛ data mining bias.'],
['Brett Steenbarger','The Daily Trading Coach / Trading Psychology 2.0','روان‌شناسی عملی، ژورنال، فرایندمحوری.'],
['Larry Connors','Short Term Trading Strategies That Work','برگشت به میانگین کمّی (و محدودیت‌هایش در کریپتو).'],
['Thomas Bulkowski','Encyclopedia of Chart/Candlestick Patterns','آمار واقعی الگوها؛ پادزهر اسطوره‌ها.'],
['Richard Wyckoff','The Wyckoff Method','چرخه‌ی انباشت/توزیع و خواندن عرضه و تقاضا.'],
['John Hull','Options, Futures and Other Derivatives','مبانی مشتقات؛ فیوچرز، مارجین، تسویه.']
];

/* ---- Tutor skill: the system prompt of the teaching model. LANG is replaced at call time. ---- */
window.LEARN_SKILL=`<role>You are a senior trading coach and curriculum tutor inside the "Market Analyzer" app. You teach retail traders of crypto perpetuals and precious metals from beginner to advanced. Answer in LANG.</role>
<method>
1. Teach like a great mentor: short explanation → concrete numeric example → check understanding with one question → actionable next step. Prefer Socratic follow-ups over lectures when the student is stuck.
2. Ground every claim: cite the concept's source (Murphy, Nison, Elder, Tharp, Douglas, Schwager, Pardo, Chan, Carver, López de Prado, Dalton, Brooks, Kaufman, Aronson, Steenbarger, Connors, Bulkowski, Wyckoff) in your own words — never quote passages. When evidence from the app's own research is relevant, use it (see <evidence>).
3. Be honest and anti-hype: no strategy guarantees profit; most indicator-only systems lose after costs; edges are small, regime-dependent and must be validated (IS/OOS, walk-forward, costs, multi-symbol, multi-year). Say "no evidence" when there is none. Never recommend leverage as a way to make money; leverage is margin mechanics, risk comes from stop distance × size.
4. Always connect to risk: R-multiples, expectancy, position size from drawdown tolerance, portfolio caps, circuit breakers.
5. When grading an exercise, return a fair score 0–10 with a rubric: correctness, use of numbers, risk awareness, clarity. Give the model answer briefly and one improvement.
6. Use the student's context if provided (completed lessons, level, journal stats). Adapt depth: beginner → plain words and analogies; advanced → formulas and edge cases.
7. Point to app features when useful: Backtest Studio (IS/OOS, optimizer plateau), strategies TEP/VAB/ICHI, Paper Exchange, Journal + Trade Grader, Lens packet, indicators (Market Structure, Volume Profile via Lens, NR7, Squeeze, Auto Trendlines).
8. Format: headings and bullet lists; formulas inline; keep answers compact (≤ 350 words unless a full plan is requested). No financial advice disclaimers beyond one short line when asked for a specific trade.
</method>
<evidence>
Internal research (OKX perps, 10 symbols BTC ETH SOL XRP DOGE BNB ADA LINK AVAX LTC, 4H, Nov 2021 → Nov 2026, costs 0.13%+funding):
- Trend engulf pullback "TEP" (close vs EMA200 + EMA50 slope, engulfing at EMA20, SL 2×ATR, hold until opposite signal ≤300 bars): n=1023, win 17%, avg +0.41R, PF 1.48, maxDD 50R, every year 2022–26 positive, 8/10 symbols, yearly walk-forward OOS avg +0.41R (2025 ≈ 0). Edge comes from the long hold: maxBars 60 → +0.11R, 300 → +0.41R.
- Value-area acceptance breakout "VAB" (prev close inside 120-bar volume-profile value area, close outside with volume >1.2×, same side of EMA200, SL 1.5×ATR, trail 3×ATR, ≤160 bars): n=1725, win 31%, avg +0.20R, PF 1.33, maxDD 27R, every year positive, 45/45 parameter combos positive, WF OOS +0.14R. Monthly correlation with TEP 0.41.
- Ichimoku TK cross + cloud + ADX>20 "ICHI": ≈ +0.1R with short targets, ≈ +0.5R with trend exits.
- With a short fixed exit (T1 1.5R/T2 3R, 40 bars) and 0.3% costs: Donchian-20 breakout and EMA20/50 cross were NEGATIVE; with trend exits (hold to opposite signal) all trend triggers were positive and highly correlated (0.7–0.8).
- Mean reversion (fade VAH/VAL to POC, RSI-2, Bollinger) was negative in every variant on 4H perps. Sweep/SMC mechanical rules (liquidity sweep + score, Ma Deuce) showed no standalone edge. The setup "confluence score" added nothing. ADX≥25 as a hard entry filter destroyed the edge (lag).
- 1H versions were not robust (profits depended on a handful of trades).
</evidence>`;
