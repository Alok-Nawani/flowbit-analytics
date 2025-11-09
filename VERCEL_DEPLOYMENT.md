# Vercel Deployment Guide for Monorepo

## ⚠️ Important: Configure Root Directory in Vercel

For Turborepo monorepos, you need to set the **Root Directory** in Vercel project settings.

### Step 1: Set Root Directory in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Scroll to **General** section
3. Find **Root Directory** setting
4. Set it to: `apps/web`
5. Click **Save**

### Step 2: Environment Variables

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:zkPdzmjwpQUjZJoqhlGViErJdrCyCtjh@maglev.proxy.rlwy.net:30347/railway` | All |
| `VANNA_API_BASE_URL` | `https://your-vanna-service.railway.app` | All |
| `VANNA_API_KEY` | (leave empty) | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | All |
| `NEXT_PUBLIC_API_BASE` | `/api` | All |

### Step 3: Build Settings

Vercel should auto-detect Next.js, but verify:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `npm run build` (runs from root, Turborepo handles it)
- **Output Directory:** `.next` (relative to `apps/web`)
- **Install Command:** `npm install`

### Step 4: Deploy

After setting root directory and environment variables:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger deployment

---

## 🔧 Alternative: If Root Directory Setting Doesn't Work

If Vercel doesn't support root directory for your plan, you can:

1. **Remove `vercel.json`** (let Vercel auto-detect)
2. **Create a separate Vercel project** pointing directly to `apps/web`
3. **Use Vercel CLI:**
   ```bash
   vercel --cwd apps/web
   ```

---

## 📝 Current Configuration

- **Root Directory:** Should be set to `apps/web` in Vercel dashboard
- **Build Output:** `.next` folder inside `apps/web`
- **Build Command:** Runs from monorepo root, Turborepo handles workspace builds

---

## ✅ Verification

After deployment, check:

1. **Build succeeds** - No errors in build logs
2. **App loads** - Visit your Vercel URL
3. **API works** - Visit `https://your-app.vercel.app/api/stats`
4. **Database connected** - Should return JSON data, not errors

