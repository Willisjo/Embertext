# Embertext

A modern, premium, completely free web application combining AI Humanizer, AI Content Detector, real-time Bitcoin/Satoshi/USD/KES calculator with live charts, and a professional receipt generator. No signup, no paywalls, no limits.

## AI Humanizer - Free Groq Integration

The AI Humanizer now uses **Groq's free tier** for premium AI-powered text transformation:

| Feature | Local Engine | AI-Powered (Groq) |
|---------|-----------|-------------------|
| Quality | Good (rule-based) | Excellent (Llama 3.1 8B) |
| Cost | $0 forever | $0 (free tier) |
| Speed | Instant | ~1-2 seconds |
| Rate Limit | Unlimited | 30 RPM, 1,000/day |
| Offline | Yes | No |
| Fallback | - | Auto-fallback to local engine |

**Groq Free Tier Limits (2026):**
- **Llama 3.1 8B**: 30 requests/min, 1,000 requests/day
- **Llama 3.3 70B**: 30 requests/min, 1,000 requests/day
- **No credit card required**
- Sign up at [console.groq.com](https://console.groq.com)

The app automatically falls back to the local rule-based engine if:
- Groq API key is not configured
- Rate limit is reached
- API is temporarily unavailable

## AI Image Detector - No API Key Required!

The AI Image Detector uses **server-side heuristic analysis** — no external API needed:

| Feature | How It Works |
|---------|-------------|
| **Entropy Analysis** | Measures randomness in image data |
| **Pattern Detection** | Identifies repetitive structures common in AI images |
| **Symmetry Analysis** | Detects unnatural symmetry from diffusion models |
| **Artifact Detection** | Finds watermark patterns, noise signatures |
| **Cost** | **$0** — runs entirely on your server |

**Limitations:** This is a heuristic-based detector, not a machine learning model. It provides reasonable estimates but is not as accurate as dedicated AI image detection APIs (like Hive or Sightengine). For production-grade accuracy, consider integrating a paid API.

## Bitcoin Calculator - CoinGecko API (No Key Required!)

The Bitcoin calculator uses **CoinGecko's keyless public API** — you do NOT need an API key to use it:

| Mode | Rate Limit | Cost | Setup |
|------|-----------|------|-------|
| **Keyless (Default)** | 100 calls/min, 10,000/month | **$0** | Nothing to do, works out of the box |
| **With API Key** | Same limits, tracked | **$0** | Optional, for account management |

**CoinGecko Free Tier (2026):**
- **10,000 calls per month** (resets monthly)
- **100 requests per minute**
- **Keyless access** — no signup, no key, no credit card
- **1 year of historical data** available
- Covers 17,000+ coins, 38M+ tokens

The app caches Bitcoin prices for 30 seconds to stay well within limits. Even with heavy usage, you'll rarely hit the cap.

**Optional:** Add `COINGECKO_API_KEY` only if you want to:
- Track usage in your CoinGecko dashboard
- Prepare for scaling beyond free tier ($35/mo for 100K calls)
- Get slightly more reliable rate limiting

Get a free key at [coingecko.com/en/api](https://www.coingecko.com/en/api) if you want, but it's **not required**.

## Features

- **AI Humanizer** - Transform AI text into natural, human-like writing (5 modes)
- **AI Content Detector** - Analyze text for AI vs human likelihood with detailed reports
- **Bitcoin Calculator** - Real-time BTC/USD/KES conversions with live price charts
- **Receipt Generator** - Professional printable receipts for BTC, USD, and KES
- **Admin Dashboard** - Hidden analytics panel for monitoring usage
- **Dark/Light Mode** - Full theme support
- **Mobile Responsive** - Works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Charts**: Recharts
- **PDF**: html2canvas + jsPDF
- **APIs**: CoinGecko (Bitcoin prices), Open Exchange Rates (KES conversion)

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or cloud)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd embertext
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/embertext"

# Admin Access (temporary secret URL method)
ADMIN_SECRET_TOKEN="your-secure-random-string-here"
NEXT_PUBLIC_ADMIN_SECRET="your-secure-random-string-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: `http://localhost:3000/admin/your-secret-token`

## Deployment Options

### Option 1: Vercel (Recommended for Beginners)

**Best for**: Quick deployment, automatic CI/CD, serverless functions

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/embertext.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables in the dashboard:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `ADMIN_SECRET_TOKEN` - A secure random string
     - `NEXT_PUBLIC_ADMIN_SECRET` - Same as above
   - Click "Deploy"

3. **Database Setup**
   - Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for free PostgreSQL
   - Copy the connection string to Vercel environment variables
   - Run `npx prisma db push` locally against your production DB once

4. **Admin Access**
   - Your admin panel will be at: `https://your-domain.vercel.app/admin/your-secret-token`

---

### Option 2: Railway (Recommended for Full-Stack)

**Best for**: Full Node.js server, PostgreSQL included, predictable pricing

1. **Push to GitHub** (same as above)

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app) and sign up
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Next.js and sets build/start commands

3. **Add PostgreSQL**
   - In your Railway project, click "New" → "Database" → "PostgreSQL"
   - Railway automatically creates `DATABASE_URL` and links it

4. **Set Environment Variables**
   - Go to your service → "Variables" tab
   - Add:
     - `ADMIN_SECRET_TOKEN` - Generate a secure random string
     - `NEXT_PUBLIC_ADMIN_SECRET` - Same value
   - Redeploy

5. **Generate Domain**
   - Go to "Settings" → "Networking" → "Generate Domain"

6. **Run Migrations**
   - Go to "Settings" → "Deploy" → "Pre-deploy Command"
   - Set to: `npx prisma migrate deploy`

---

### Option 3: Render

**Best for**: Simple container deployment, free tier available

1. **Push to GitHub**

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect your GitHub repo
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Add PostgreSQL**
   - Click "New" → "PostgreSQL"
   - Copy the internal connection string
   - Add as `DATABASE_URL` in your web service environment variables

4. **Set Other Variables**
   - `ADMIN_SECRET_TOKEN`
   - `NEXT_PUBLIC_ADMIN_SECRET`

---

### Option 4: Self-Hosted (VPS / Dedicated Server)

**Best for**: Full control, cost optimization

1. **Get a VPS** (DigitalOcean, Hetzner, AWS EC2, etc.)
   - Minimum: 1 CPU, 2GB RAM, Ubuntu 22.04

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib

   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

3. **Set Up Database**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE embertext;"
   sudo -u postgres psql -c "CREATE USER embertext WITH PASSWORD 'your_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE embertext TO embertext;"
   ```

4. **Clone and Build**
   ```bash
   git clone <your-repo-url>
   cd embertext
   npm install
   npx prisma generate
   npx prisma db push
   npm run build
   ```

5. **Set Environment Variables**
   ```bash
   export DATABASE_URL="postgresql://embertext:your_password@localhost:5432/embertext"
   export ADMIN_SECRET_TOKEN="your-secure-token"
   export NEXT_PUBLIC_ADMIN_SECRET="your-secure-token"
   export NODE_ENV="production"
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "embertext" -- start
   pm2 save
   pm2 startup
   ```

7. **Set Up Nginx (Reverse Proxy)**
   ```bash
   sudo apt install -y nginx
   ```

   Create `/etc/nginx/sites-available/embertext`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/embertext /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **SSL with Certbot**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 5: Docker Deployment

**Best for**: Any platform supporting containers

1. **Build Image**
   ```bash
   docker build -t embertext .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e ADMIN_SECRET_TOKEN="your-token" \
     -e NEXT_PUBLIC_ADMIN_SECRET="your-token" \
     --name embertext \
     embertext
   ```

3. **With Docker Compose**
   Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:postgres@db:5432/embertext
         - ADMIN_SECRET_TOKEN=your-secret-token
         - NEXT_PUBLIC_ADMIN_SECRET=your-secret-token
       depends_on:
         - db

     db:
       image: postgres:15-alpine
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_DB=embertext
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

   ```bash
   docker-compose up -d
   ```

## Database Providers (Free Tiers)

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| [Neon](https://neon.tech) | 500MB storage, unlimited connections | Vercel, serverless |
| [Supabase](https://supabase.com) | 500MB storage, 2GB bandwidth | Full-stack apps |
| [Railway](https://railway.app) | $5 credit trial, then pay-as-you-go | Full-stack deployment |
| [Render](https://render.com) | 1GB storage, 90-day free trial | Simple deployments |
| [ElephantSQL](https://elephantsql.com) | 20MB (Tiny Turtle plan) | Testing only |

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_SECRET_TOKEN` | Yes | Secret token for admin access |
| `NEXT_PUBLIC_ADMIN_SECRET` | Yes | Same token, exposed to client (for route validation) |
| `NEXT_PUBLIC_APP_URL` | No | Your app URL (for SEO/meta) |
| `COINGECKO_API_KEY` | No | Optional API key for higher rate limits |

## Admin Dashboard

Access your admin panel at:
```
https://your-domain.com/admin/YOUR_SECRET_TOKEN
```

**⚠️ Security Warning**: The current secret-URL method is temporary. For production, implement proper authentication (NextAuth.js, Clerk, or similar) before exposing sensitive data.

## Updating After Deployment

### Vercel
- Push to GitHub → Auto-deploys

### Railway/Render
- Push to GitHub → Auto-deploys (if connected)
- Or use CLI: `railway up` or manual deploy

### VPS
```bash
cd embertext
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart embertext
```

## Troubleshooting

**Build fails with Prisma errors**
```bash
npx prisma generate
npx prisma db push
```

**Database connection errors**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Ensure database allows connections from your IP
- Check firewall rules

**API rate limits (Bitcoin prices not loading)**
- CoinGecko free tier: 10-30 calls/minute
- The app caches prices for 30 seconds
- Add `COINGECKO_API_KEY` for higher limits

**Static export issues**
- This app requires a Node.js server (SSR/API routes)
- Do NOT use `output: 'export'`
- Use `output: 'standalone'` instead

## License

MIT - Free for personal and commercial use.

## Support

For issues or questions, open a GitHub issue or contact the maintainer.

---

Built with ❤️ for the community. No ads. No subscriptions. No limits.
