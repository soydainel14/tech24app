# Tech24.do E‑commerce Platform

Tech24.do is a professional, scalable e‑commerce platform designed from the ground up for modern online retail.  It consists of a Node.js/Express API, a Next.js web frontend, a React Native mobile app and an admin panel.  The system uses a single MySQL database and exposes a unified REST API which both the web and mobile clients consume.  This repository is compatible with GitHub and Railway for seamless deployment.

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running Migrations and Seeds](#running-migrations-and-seeds)
- [Running the Development Servers](#running-the-development-servers)
- [Deployment to Railway](#deployment-to-railway)
- [Functional Modules](#functional-modules)
- [Checklist for Testing](#checklist-for-testing)

## Architecture

The platform follows a **single source of truth** architecture: one MySQL database and one API serve all channels.  There is no duplicated business logic.  The core components are:

- **Backend** – Node.js with Express and Knex.  Exposes a versioned REST API under `/api/v1`.  Handles authentication, business rules, auditing and data integrity.  JWT with refresh tokens is used for auth and roles/permissions.  Sensitive actions generate audit logs.  reCAPTCHA should be enabled on critical endpoints.
- **Web Frontend** – Next.js/React application served from its own domain.  Mobile‑first responsive design.  Consumes the same API.  Pages include catalogue, product details, cart, checkout, order history and admin screens.
- **Mobile App** – React Native built with Expo.  Mirrors the web functionality and uses the same API endpoints.  Basic offline support is not implemented as per the requirement.
- **Admin Panel** – Protected web area (can live within the Next.js app) that allows administrators to manage products, orders, finances, marketing, KPIs and inventory.  Role‑based access control enforces permissions.

## Project Structure

```
tech24do/
├── backend/               # Node.js/Express API
│   ├── package.json
│   ├── src/
│   │   ├── index.js       # API entry point
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # Express routes grouped by entity
│   │   ├── models/        # Database access helpers
│   │   ├── middlewares/   # Auth, error handling, auditing, etc.
│   │   ├── db/
│   │   │   ├── knexfile.js # Knex configuration (DB connection logic)
│   │   ├── migrations/    # Schema definitions
│   │   └── seeds/         # Initial data seeding
│   └── .env.example       # Example environment variables for backend
├── frontend/              # Next.js web client
│   ├── package.json
│   ├── pages/             # Next.js pages (catalogue, product, cart, checkout, admin…)
│   ├── components/        # Reusable React components
│   ├── styles/            # CSS/Tailwind styles
│   └── .env.example       # Example environment variables for frontend
├── mobile/                # React Native (Expo) app
│   ├── app.json
│   ├── App.js
│   └── screens/           # Mobile screens (Home, Catalogue, Product, Cart, Checkout…)
├── .env.example           # Root environment variables shared by all services
└── README.md
```

This repository intentionally separates the backend and frontend codebases to allow independent deployment and scaling.  Both projects share the same environment variables via `.env` files.

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your‑username/tech24do.git
   cd tech24do
   ```

2. **Create your `.env` files:**  Copy `.env.example` to `.env` at the project root and in both the `backend` and `frontend` folders (if you choose to keep separate `.env` files).  Fill in the actual values for your MySQL database, JWT secret, reCAPTCHA keys and allowed CORS origins.

3. **Install dependencies:**  Each package is managed independently.  In two separate terminals run:
   ```sh
   cd backend && npm install
   # In another terminal
   cd frontend && npm install
   ```

4. **Set up the database:**  Ensure you have a MySQL server available.  Create the database specified in your `.env` file if it doesn’t already exist.

## Environment Variables

The application reads database credentials and other secrets in a prioritized order to maximize compatibility with Railway:

1. **DATABASE_URL** – Full MySQL connection string (e.g. `mysql://user:pass@host:port/db`).  Takes precedence over all other variables.
2. **MYSQLHOST**, **MYSQLPORT**, **MYSQLUSER**, **MYSQLPASSWORD**, **MYSQLDATABASE** – Standard MySQL variables used by Railway.
3. **DB_HOST**, **DB_PORT**, **DB_USER**, **DB_PASS**, **DB_NAME** – Generic fallback.

Other important variables include:

- **JWT_SECRET** – Secret key used to sign JWT tokens.
- **CORS_ORIGINS** – Comma‑separated list of allowed origins for CORS.
- **ADMIN_EMAIL**, **ADMIN_PASSWORD** – Optional overrides for the initial admin account created by the seed script.
- **NEXT_PUBLIC_API_URL** / **EXPO_PUBLIC_API_URL** – Base URL for the API used by Next.js and Expo respectively.
- **RECAPTCHA_SITE_KEY**, **RECAPTCHA_SECRET_KEY** – Keys for Google reCAPTCHA used in critical forms.

## Database

All data for the platform resides in a single MySQL database.  The schema covers users, products, orders, payments, shipments, returns/RMA, finance, marketing, KPIs, inventory forecasts and price history.  Migrations are idempotent and can be run multiple times without issues.

## Running Migrations and Seeds

Use the provided npm scripts to prepare the database.  From the `backend` folder, run:

```sh
cd backend
npm run migrate   # Runs all migrations
npm run seed      # Populates initial roles, admin user, accounts, etc.
```

If you change the schema or seeds, rerun these commands.  Knex will track executed migrations in a `migrations` table.

## Running the Development Servers

### Backend API

```sh
cd backend
npm run dev   # Starts the API on port 3001 by default
```

### Web Frontend

```sh
cd frontend
npm run dev   # Starts Next.js on port 3000 (or configured port)
```

### Mobile App

To run the Expo app you need `expo-cli` installed globally.  Then:

```sh
cd mobile
expo start
```

Scan the QR code with your Expo Go app to open the app on your device.

## Deployment to Railway

Railway can automatically deploy both the API and the web frontend from this repository.  Follow these steps:

1. **Create a new Railway project** and connect it to your GitHub repository.
2. **Add the MySQL plugin** from the Railway dashboard.  This provisions a managed MySQL instance and sets environment variables (`MYSQLHOST`, `MYSQLPORT`, etc.).
3. **Configure environment variables** in Railway.  At a minimum set `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL` and `RECAPTCHA_*` values.  Railway will automatically inject the MySQL variables.
4. **Deploy** the services.  Railway detects the `backend` and `frontend` subdirectories as separate services based on the presence of their respective `package.json` files.  Ensure the deploy commands are set to `npm run start` for production builds.  The migrations can be run automatically by adding a predeploy script or manually through the Railway CLI.
5. **Seed the database** by running `npm run seed` once your database is ready.  You can execute this command from the Railway Shell or locally while connected to the Railway database.

## Functional Modules

The platform implements several modules, each encapsulating specific business logic:

- **Sales:** Catalogue browsing, cart management, step‑by‑step checkout, order numbering (T24‑YYYYMMDD‑#####) and unique purchase codes.  Orders are persisted only when the checkout completes.  Stock is decremented only when payment is confirmed.
- **Payments:** Support for `SUR`, bank transfer and cash on delivery.  Payment status is tracked separately from order status.  Automatic email confirmation and WhatsApp links can be sent from the frontend.
- **Shipping:** Same‑day shipping cutoff at 12:00 PM.  Configurable shipping rates, internal tracking and optional OTP for delivery confirmation.
- **Returns/RMA:** Generate RMA numbers (`RMA‑YYYYMMDD‑#####`), collect evidence, maintain a timeline of events, deduct replacement stock and record refunds.
- **Finance:** Basic profit & loss, per‑product margin analysis, sales by channel/zone, payment reports, dispatch reports and RMA reports.  The `financial_transactions` table records all money movements against accounts.
- **Accounting:** Basic cash/bank tracking, accounts receivable (COD) and optional accounts payable.  All critical transactions are logged in `audit_logs`.
- **Expenses:** Categorized expenses with budgets and alerts when overspending.
- **KPIs and Goals:** Define targets in `kpi_targets`, monitor real vs target performance and send alerts when underperforming.
- **Marketing & ROI:** Capture UTM parameters on orders, associate them with campaigns and calculate ROAS, ROI, CAC and CPA.  A marketing dashboard surfaces these metrics along with automatic alerts.
- **Inventory Forecasting:** Calculate average daily sales (30/60/90 days), days of cover, stock‑out dates, reorder points and suggested reorder quantities.  Blocks purchase plans if they jeopardize protected capital.
- **Pricing Engine:** Enforces minimum price (cost / 0.55) and margin > 45%.  Provides a pricing simulator and maintains `price_history`.  Never allows saving a price below the minimum.
- **AI Automation:** Detects anomalies, generates alerts, prioritizes tasks and suggests actions but never performs critical operations such as changing prices or confirming payments without human approval.

## Checklist for Testing

Use the following checklist to validate the completeness and quality of the platform before going live:

### General

- [ ] All pages load without errors and have responsive layouts for desktop, tablet and mobile.
- [ ] Every screen implements loading, empty and error states appropriately.
- [ ] There are no placeholder buttons or screens; every element has a purpose.
- [ ] Web and mobile clients behave consistently and stay synchronized via the API.

### Authentication & Security

- [ ] Registration and login work with proper validation and hashed passwords.
- [ ] JWT authentication and role-based authorization protect private routes.
- [ ] Rate limiting, CORS and Helmet are configured according to environment.
- [ ] reCAPTCHA is active on critical forms (registration, checkout, login).
- [ ] Audit logs are created for all critical changes (price updates, stock adjustments, order status changes).

### Sales & Checkout

- [ ] Catalogue displays products with correct pricing and stock information.
- [ ] Cart allows adding, updating and removing items.
- [ ] Checkout wizard collects shipping information and processes payments.
- [ ] Order numbers follow the `T24‑YYYYMMDD‑#####` format and purchase codes are unique.
- [ ] A record is created in the database only when the checkout completes.

### Payments

- [ ] Payment methods (`SUR`, bank transfer, COD) can be selected and recorded.
- [ ] Stock is decremented only when payment status is confirmed.
- [ ] Email and WhatsApp notifications are sent after order completion.

### Shipping

- [ ] Shipping cutoff at 12:00 PM is enforced for same‑day dispatch.
- [ ] Shipping rates are configurable and reflected in the order total.
- [ ] Tracking numbers and shipment statuses update correctly and are visible to customers.
- [ ] OTP verification (if enabled) is required to mark orders as delivered.

### Returns (RMA)

- [ ] Return requests generate RMA numbers (`RMA‑YYYYMMDD‑#####`) and track statuses.
- [ ] Evidence (photos, documents) can be uploaded and associated with the RMA.
- [ ] The timeline of return events is recorded and visible in the admin panel.
- [ ] Replacements deduct stock and refunds are recorded in `refunds`.

### Finance & Accounting

- [ ] Profit & loss and margin reports are accurate and reconcile with orders and expenses.
- [ ] Sales can be broken down by channel (web, mobile) and zone.
- [ ] Financial transactions reflect all money movements (payments, refunds, expenses).
- [ ] Cash and bank account balances update correctly.

### KPIs & Marketing

- [ ] KPIs compare real vs target performance and display percentage achievement.
- [ ] Marketing dashboard shows ROAS, ROI, CAC and CPA based on campaign spend and attributed orders.
- [ ] Alerts trigger when KPIs fall below target.

### Inventory & Pricing

- [ ] Average daily sales calculations (30/60/90 days) produce reasonable results.
- [ ] Forecasts compute days of cover, stockout dates, reorder points and suggested quantities.
- [ ] Pricing engine blocks saving prices below cost/0.55 and warns on margins < 45%.
- [ ] Price changes are recorded in `price_history` with the user and reason.

### AI Automation

- [ ] Anomaly detection identifies unusual sales, stockouts, or ROI changes and generates tasks/alerts.
- [ ] Suggested actions and priorities appear in the admin dashboard but require human approval.
- [ ] AI never changes prices, decrements inventory, confirms payments or places purchase orders automatically.

Following this checklist helps ensure that the platform meets the high standards of quality, security and business compliance required for production deployment.