# Kavachh — CCE Treasury Dashboard
**Mount Tech Growth Fund | Cash & Cash Equivalents Tracker**

This dashboard is built with a premium tech stack: **React + Vite** frontend communicating directly with a **Supabase (self-hosted)** backend.

---

## 🛠️ Getting Started & Setup

### 1. Database Schema Initialization

To set up the table in your self-hosted (or cloud) Supabase database:
1. Open your **Supabase Dashboard**.
2. Navigate to the **SQL Editor** tab.
3. Open a new query, paste the contents of [schema.sql](./schema.sql), and click **Run**.
4. This will create the `daily_records` table and configure the default Row-Level Security (RLS) policies.

---

### 2. Configure Environment Variables

1. Copy the `.env.example` file to create a `.env` file in the root:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase connection parameters:
   - `VITE_SUPABASE_URL`: The URL of your self-hosted Supabase instance (e.g. `http://localhost:8000`).
   - `VITE_SUPABASE_ANON_KEY`: The anonymous API key for your Supabase instance.

---

### 3. Install Dependencies

Install the project dependencies (React, Vite, Supabase Client, Recharts, and Lucide React icons):
```bash
npm install
```

---

### 4. Seed Historical Data

To pre-load the database with the original Excel ledger data (contained in `seed.json`):
```bash
npm run seed
```

---

## 💻 Development & Building

### Run local dev server (Hot-reload)
```bash
npm run dev
```
The app will be running at [http://localhost:5173/](http://localhost:5173/).

### Build for Production
To bundle the frontend app into static files (inside the `dist/` directory):
```bash
npm run build
```
The output can then be deployed to any static host (Netlify, Vercel, Nginx, etc.).
