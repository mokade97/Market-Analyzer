# Market Analyzer (تحلیل‌گر بازار) — PWA

## انتشار روی GitHub Pages
1. این فایل‌ها را در ریشه‌ی یک ریپوی Public بگذار: `index.html`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`, `.nojekyll`, پوشه‌ی `.well-known/`
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save
3. آدرس: `https://USERNAME.github.io/REPO/` → در Chrome اندروید: ⋮ → «نصب برنامه»

## APK (اختیاری)
pwabuilder.com → آدرس بالا → Package for stores → Android → Generate.
فایل `assetlinks.json` که PWABuilder می‌دهد را جایگزین `.well-known/assetlinks.json` کن تا نوار آدرس در APK حذف شود.

## به‌روزرسانی
فقط فایل‌های جدید را آپلود (replace) کن؛ اپ نصب‌شده خودش نسخه‌ی جدید را می‌گیرد.
