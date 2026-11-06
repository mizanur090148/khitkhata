# KnitKhata (নিটখাতা) - Enterprise B2B SaaS Platform

KnitKhata is a modern, full-featured multi-tenant B2B SaaS platform specifically designed for circular and flat knitting manufacturing factories, composites, buying houses (vendors), suppliers, and affiliate partners in Bangladesh.

---

## 🏗️ Architecture & Technology Stack

* **Backend**: Laravel 13 (API-only architecture, PHP 8.4)
  * **Database**: MySQL with Row-Level Multi-Tenancy (`BelongsToTenant` Trait & `TenantScope`)
  * **Authentication**: Laravel Sanctum tokens, Bengali numeral-aware phone normalization, SMS OTP engine
  * **Service Layer**: Dedicated services for Tenants (`TenantService`), Subscriptions (`SubscriptionService`), and Authentication (`AuthService`)
  * **Subscription Tiers**: Starter (`s`), Growth (`g`), Pro (`p`), and Enterprise (`e`)

* **Frontend**: React 19 + TypeScript + Vite
  * **Styling**: Pure CSS with KnitKhata design system and exact responsive layouts
  * **State**: Centralized context (`AppContext`) with token auto-hydration and backend sync
  * **Portals**:
    * **Factory Portal**: Shift production tracking, Job cards, Fabric roll QR labels, QC signatures, Challans, Party ledgers, Yarn tracking.
    * **Vendor Portal**: Multi-factory production monitoring, Buying house order tracking, Vendor QC signs, Delivery receipt acknowledgments.
    * **Supplier Portal**: Spare parts, needles, sinkers, yarn marketplace and RFQ bids.
    * **Partner Portal**: Affiliate referral links and commission withdrawal.

---

## 📁 Repository Structure

```
khitkhata/
├── backend/                  # Laravel 13 API Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/
│   │   ├── Models/
│   │   ├── Scopes/TenantScope.php
│   │   ├── Services/
│   │   └── Traits/BelongsToTenant.php
│   ├── config/
│   ├── database/migrations/
│   └── routes/api.php
│
├── frontend/                 # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── api/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # AppContext state engine
│   │   ├── pages/            # Page controllers (HomePage, AuthPage, FactoryPortalPage, etc.)
│   │   ├── styles/           # KnitKhata stylesheet
│   │   └── types/            # TypeScript domain interfaces
│   ├── package.json
│   └── vite.config.ts
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
