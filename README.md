# KnitKhata (নিটখাতা) - Enterprise B2B SaaS Platform

KnitKhata is a modern, full-featured multi-tenant B2B SaaS platform specifically designed for circular and flat knitting manufacturing factories, composites, buying houses (vendors), suppliers, and affiliate partners in Bangladesh.

---

## 🏗️ Architecture & Technology Stack

* **Backend**: Laravel 13 (API-only architecture, PHP 8.4)
  * **Database**: MySQL with Row-Level Multi-Tenancy (`BelongsToTenant` Trait & `TenantScope`)
  * **Authentication**: Laravel Sanctum tokens, Bengali numeral-aware phone normalization, SMS OTP engine
  * **Service Layer**: Dedicated services for Tenants (`TenantService`), Subscriptions (`SubscriptionService`), and Authentication (`AuthService`)
  * **Subscription Tiers**: Starter (`s`), Growth (`g`), Pro (`p`), and Enterprise (`e`)

* **Frontend**: Standalone React SPA repository: [khitkhata-frontend](https://github.com/mizanur090148/khitkhata-frontend)

---

## 📁 Repository Structure

```
khitkhata/
└── backend/                  # Laravel 13 API Backend
    ├── app/
    │   ├── Http/Controllers/Api/V1/
    │   ├── Models/
    │   ├── Scopes/TenantScope.php
    │   ├── Services/
    │   └── Traits/BelongsToTenant.php
    ├── config/
    ├── database/migrations/
    └── routes/api.php
```
│
├── KnitKhata.html            # Reference design prototype
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit: `http://localhost:5173`

---

## 🔒 Multi-Tenant Security & SaaS Gating
Each query executed by authenticated factory users is automatically isolated to `factory_id` via `App\Scopes\TenantScope`. Cross-tenant data leakage is completely prevented at the ORM layer.

