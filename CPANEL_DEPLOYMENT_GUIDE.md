# নিটখাতা (KnitKhata) — cPanel ডিপ্লয়মেন্ট গাইড (Production Ready)

এই প্রজেক্টটি এখন সিপ্যানেল (cPanel) হোস্টিংয়ে আপলোড ও লাইভ করার জন্য সম্পূর্ণ প্রস্তুত।

---

## 📁 রেডি করা ফাইলসমূহ

| ফাইল / ফোল্ডার | লোকেশন | উদ্দেশ্য |
|:---|:---|:---|
| **SQL ডাটাবেজ ডাম্প** | `cpanel_ready/silposetu_database_import_phpmyadmin.sql` | phpMyAdmin-এ ১-ক্লিকে সব টেবিল ও স্কিমা ইমপোর্ট করার জন্য |
| **cPanel পরিবেশ ফাইল** | `cpanel_ready/.env.cpanel.example` | সিপ্যানেলের লাইভ ডাটাবেজ ক্রেডেনশিয়াল কনফিগারেশন |
| **কমপ্লিট জিপ প্যাকেজ** | `cpanel_ready/khitkhata_cpanel_upload.zip` | সরাসরি সিপ্যানেল ফাইল ম্যানেজারে আপলোড ও এক্সট্র্যাক্ট করার জন্য |
| **বিল্ট ফ্রন্টএন্ড এসেটস** | `backend/public/` | React Single Page Application (HTML, CSS, JS) লাইভ ইন্টিগ্রেটেড |

---

## 🛠️ সার্ভার রিকোয়ারমেন্টস (PHP Requirements)

- **PHP ভার্সন**: `PHP 8.2`, `8.3` বা `8.4` (cPanel -> **MultiPHP Manager** থেকে সিলেক্ট করুন)
- **প্রয়োজনীয় এক্সটেনশনসমূহ** (cPanel -> **Select PHP Version** / **Extensions**):
  - `bcmath`
  - `ctype`
  - `fileinfo`
  - `json`
  - `mbstring`
  - `openssl`
  - `pdo`
  - `pdo_mysql`
  - `tokenizer`
  - `xml`

---

## 🚀 সিপ্যানেলে স্থাপনের ৪টি সহজ ধাপ (Step-by-Step)

### ধাপ ১: cPanel-এ ডাটাবেজ তৈরি ও ইমপোর্ট
1. cPanel ড্যাশবোর্ডে গিয়ে **MySQL Database Wizard** খুলুন।
2. নতুন ডাটাবেজ নাম দিন (যেমন: `username_silposetu`)।
3. নতুন ডাটাবেজ ইউজার ও স্ট্রং পাসওয়ার্ড দিন (যেমন: `username_dbuser` এবং একটি পাসওয়ার্ড)।
4. **All Privileges** চেকবক্সে টিক দিয়ে **Make Changes** চাপুন।
5. cPanel থেকে **phpMyAdmin** খুলুন এবং বামপাশে সদ্য তৈরি ডাটাবেজটি নির্বাচন করুন।
6. উপরের **Import** ট্যাবে ক্লিক করে `cpanel_ready/silposetu_database_import_phpmyadmin.sql` ফাইলটি নির্বাচন করুন এবং নিচে **Go / Import** বাটনে ক্লিক করুন।
   *(কয়েক সেকেন্ডে সমস্ত টেবিল ও স্কিমা স্বয়ংক্রিয়ভাবে তৈরি হয়ে যাবে!)*

---

### ধাপ ২: ফাইল আপলোড (পদ্ধতি ক: ফাইল ম্যানেজার জিপ আপলোড - সবচেয়ে সহজ)
1. cPanel থেকে **File Manager** খুলুন।
2. আপনার ডোমেইনের রুট ফোল্ডারে প্রবেশ করুন (সাধারণত `public_html/` অথবা সাবডোমেন ফোল্ডার)।
3. `cpanel_ready/khitkhata_cpanel_upload.zip` ফাইলটি **Upload** বাটনে ক্লিক করে আপলোড করুন।
4. আপলোড শেষে জিপ ফাইলের উপর রাইট-ক্লিক করে **Extract** করুন।
5. সমস্ত ফাইল এক্সট্র্যাক্ট হয়ে যাবে। (যদি জিপ ফাইলের মধ্যে সাবফোল্ডার থাকে, তাহলে সব ফাইল `public_html`-এর রুটে সরিয়ে নিন)।

> **নোট**: প্রজেক্টের রুটে একটি প্রোটেকশন `.htaccess` দেওয়া আছে যা ডাইরেক্ট ভিজিটকে `public/` ফোল্ডারে রিরাইট করবে এবং `.env`, `storage`, `database` ফাইলগুলোকে পাবলিক অ্যাক্সেস থেকে সুরক্ষিত রাখবে।

---

### ধাপ ৩: `.env` কনফিগারেশন
1. File Manager-এর সেটিংস (Settings) থেকে **Show Hidden Files (dotfiles)** চালু করুন।
2. `.env.cpanel.example` ফাইলের নাম পরিবর্তন (Rename) করে `.env` করুন।
3. `.env` ফাইলে এডিট (Edit) করে আপনার ডোমেন ও ধাপ ১-এ তৈরি করা ডাটাবেজের তথ্য দিন:

```env
APP_NAME="KnitKhata"
APP_ENV=production
APP_KEY=base64:kxCntj5AYK80WxC/gQVly1bpYk8v5wfh77ScMevPnlU=
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=username_silposetu
DB_USERNAME=username_dbuser
DB_PASSWORD=YourDatabasePasswordHere

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=local
```
4. **Save Changes** ক্লিক করে সেভ করুন।

---

### ধাপ ৪: ফোল্ডার পারমিশন (Permissions)
নিশ্চিত করুন নিচের ফোল্ডারগুলোর রাইট পারমিশন `755` বা `775` দেওয়া আছে:
- `storage/`
- `storage/framework/`
- `storage/logs/`
- `bootstrap/cache/`

---

## 🌐 লাইভ টেস্ট ও ভেরিফিকেশন

1. **ফ্রন্টএন্ড চেক**: ব্রাউজারে `https://yourdomain.com` ওপেন করুন — নিটখাতার হোমপেজ ও ড্যাশবোর্ড লোড হবে।
2. **ভেন্ডর ভিউ চেক**: `https://yourdomain.com/dashboard/vorders` সরাসরি খুলুন — ABC Knit Composite-এর ভেন্ডর ড্যাশবোর্ড সরাসরি ওপেন হবে।
3. **এপিআই স্ট্যাটাস চেক**: `https://yourdomain.com/api-status` ভিজিট করলে এপিআই রেসপন্স দেখতে পাবেন:
   ```json
   {
     "name": "Silposetu (নিটখাতা) Enterprise API",
     "framework": "Laravel 13.x",
     "status": "operational"
   }
   ```
4. **এপিআই হেলথ চেক**: `https://yourdomain.com/api/v1/health` ভিজিট করলে ডাটাবেজ ও এপিআই কানেক্টিভিটি নিশ্চিত করবে।

---

## 💡 ভবিষ্যতে নতুন আপডেট দেওয়ার নিয়ম
লোকালে কোনো পেজ এডিট করার পর শুধু এই কমান্ডটি চালালেই স্বয়ংক্রিয়ভাবে বিল্ড হয়ে ব্যাকএন্ডে সিঙ্ক হয়ে যাবে:
```bash
node scripts/deploy-to-backend.js
```
তারপর শুধু পরিবর্তিত `backend/public/assets/` ফাইলগুলো সিপ্যানেলে রিপ্লেস করলেই আপডেট লাইভ হয়ে যাবে!

