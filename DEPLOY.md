# Deploying TrackFlow to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account
- A PostgreSQL database (use [Neon](https://neon.tech) — free tier works)
- Your project pushed to GitHub

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/trackflow.git
git push -u origin main
```

## Step 2 — Create a Neon database (if not already done)

1. Go to [neon.tech](https://neon.tech) → sign up free
2. Create a new project → name it `trackflow`
3. Copy the **connection string** — it looks like:
   `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

## Step 3 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no framework config needed
4. Add these **Environment Variables** before deploying:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_SECRET` | Run `npx auth secret` and paste the output |
| `AUTH_URL` | `https://your-app.vercel.app` (your Vercel URL) |
| `AUTH_TRUST_HOST` | `true` |

5. Click **Deploy**

## Step 4 — Run database migrations

After the first successful deploy, run migrations against your production DB:

```bash
# On your local machine, pointing at the production DATABASE_URL
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
```

Or use Neon's SQL editor to run the migration SQL directly.

## Step 5 — Seed production data (optional)

```bash
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

---

## Redeployments

Every `git push` to `main` triggers an automatic redeploy on Vercel.

## Troubleshooting

| Error | Fix |
|---|---|
| `Vulnerable version of Next.js` | Ensure `next` version is `15.0.5` or higher |
| `PrismaClientInitializationError` | Check `DATABASE_URL` is set in Vercel env vars |
| `AUTH_SECRET` missing | Add it in Vercel project → Settings → Environment Variables |
| Build fails on `prisma generate` | `vercel.json` buildCommand already handles this |
