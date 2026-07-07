# Hyrnex Deployment Guide (Vercel)

This document provides a comprehensive, step-by-step guide to deploying **Hyrnex**—the premium full-stack recruitment SaaS platform—to Vercel.

---

## 🏗️ Architecture Overview

Hyrnex is built using a modern full-stack architecture:
- **Frontend SPA**: React 19 + TypeScript + Tailwind CSS (bundled via Vite)
- **Backend API Server**: Express + Node.js (running as a Vercel Serverless Function)
- **Database Layer**: Prisma ORM with PostgreSQL (fully relational storage)
- **AI Matching Engine**: Google Gemini API via `@google/genai` TypeScript SDK

Vercel hosts the static React assets on its global Edge CDN, while routing `/api/*` endpoints, `sitemap.xml`, `robots.txt`, and static assets to the Express serverless wrapper (`api/index.ts`) defined in our `vercel.json`.

---

## 📋 Prerequisites

Before starting, make sure you have:
1. A **Vercel Account** ([vercel.com](https://vercel.com))
2. A **GitHub, GitLab, or Bitbucket Account** (for CI/CD pipeline integration)
3. A **PostgreSQL Database** hosted on a cloud provider:
   - Recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres).
4. A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) for the resume-matching features.

---

## 🚀 Deployment Steps

### Step 1: Initialize & Sync Your Cloud Database

Prisma requires your PostgreSQL connection string to provision database schemas.

1. Create a PostgreSQL instance in your cloud database provider.
2. Retrieve your connection string (`postgresql://username:password@host:port/database?schema=public`).
3. Set your local terminal session or `.env` file variable:
   ```bash
   DATABASE_URL="your-database-connection-string"
   ```
4. Push the Prisma schema and run migrations to create tables in your database:
   ```bash
   npx prisma db push
   ```
5. *(Optional)* Seed initial database records (such as standard admin users, default settings, mock jobs/blogs):
   ```bash
   npm run prisma:seed
   ```

---

### Step 2: Push Your Code to GitHub

Create a repository on GitHub and commit your workspace code:
```bash
git init
git add .
git commit -m "chore: prepare for production deployment on Vercel"
git branch -M main
git remote add origin https://github.com/your-username/hyrnex.git
git push -u origin main
```

---

### Step 3: Deploy to Vercel via Dashboard (Recommended)

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** > **Project**.
2. Import your GitHub repository (`hyrnex`).
3. Configure the **Build & Development Settings**:
   - **Framework Preset**: Select **Vite** or **Other**.
   - **Build Command**: `prisma generate && vite build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** panel and add the following keys:

| Name | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Connection URI of your cloud PostgreSQL database. |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key from Google AI Studio. |
| `NODE_ENV` | `production` | Set to `production` to toggle build-level optimizations. |

5. Click **Deploy**. Vercel will install dependencies, generate the Prisma Client, compile your static Vite bundle, and deploy the Express serverless function endpoint.

---

### Step 4: Deploy via Vercel CLI (Alternative)

For fast terminal deployments, use the interactive Vercel CLI tool:

1. Install Vercel globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Run the deployment initialization command from the project root:
   ```bash
   vercel
   ```
4. Define your environment variables in the Vercel dashboard or directly add them via CLI:
   ```bash
   vercel env add DATABASE_URL
   vercel env add GEMINI_API_KEY
   vercel env add NODE_ENV production
   ```
5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🛠️ Verification Checklist

Once the deployment finishes successfully, verify the following URLs and features:

1. **Static SPA Frontend**: Access `https://your-app-domain.vercel.app`. Navigate to home, jobs, about, blogs, and contact pages to ensure client router links load instantaneously.
2. **Dynamic Sitemap**: Load `https://your-app-domain.vercel.app/sitemap.xml`. It should output highly optimized XML markup linking all active jobs and blog posts.
3. **Robots Exclusion Standard**: Load `https://your-app-domain.vercel.app/robots.txt` to confirm Search Crawlers are correctly instructed.
4. **Interactive Apply Redirection**: Click "Apply" on any job card. It should launch the external application gateway secure modal cleanly.
5. **Secure Administrative Panel**:
   - Access `/admin-dashboard` (secured behind password-hash validation and rate-limiting).
   - Enter your administrator credentials.
   - Verify that your Category Breakdown chart matches database distributions dynamically!
