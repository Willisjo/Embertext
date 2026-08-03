# How to Deploy Embertext on Vercel

## Prerequisites
- A Vercel account (free tier works)
- A PostgreSQL database (Vercel Postgres, Neon, Supabase, or Railway)
- Groq API key (free at https://console.groq.com/keys)
- NaraRouter API key (free tier available)

## Step 1: Prepare Your Database

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the `POSTGRES_URL` connection string

### Option B: Neon (Free Tier)
1. Go to https://neon.tech
2. Create a free account and project
3. Copy the connection string

## Step 2: Push Database Schema

After connecting your database, run:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Step 3: Generate Admin Password Hash

Before deploying, generate a secure password hash:

```bash
node -e "console.log(require('crypto').createHmac('sha256', 'your-secret-token-here').update('your-password').digest('hex'))"
```

Replace `your-secret-token-here` with your actual `ADMIN_SECRET_TOKEN` and `your-password` with your desired admin password. Copy the output hash.

## Step 4: Deploy to Vercel

### Method A: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will auto-detect Next.js

### Method B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Step 5: Configure Environment Variables

In your Vercel project settings, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your PostgreSQL connection string | Yes |
| `ADMIN_SECRET_TOKEN` | Random 32+ character string | Yes |
| `ADMIN_USERNAME` | Your admin username (e.g., `admin`) | Yes |
| `ADMIN_PASSWORD_HASH` | Hash from Step 3 | Yes |
| `GROQ_API_KEY` | Your Groq API key | Yes |
| `NARAROUTER_API_KEY` | Your NaraRouter API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL (e.g., `https://your-app.vercel.app`) | Yes |

### Important Notes:
- `ADMIN_SECRET_TOKEN` must be the same string used when generating the password hash
- `NEXT_PUBLIC_APP_URL` should be your actual Vercel deployment URL
- Do NOT commit your `.env` file to git

## Step 6: Redeploy

After adding environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or click "Redeploy" in the Vercel dashboard.

## Step 7: Access Admin Dashboard

1. Go to `https://your-app.vercel.app/admin/login`
2. Enter your admin username and password
3. You'll see the analytics dashboard with visitor stats, tool usage, and more

## Step 8: Verify Tracking Works

1. Visit your site in an incognito window
2. Use the AI tools
3. Check the admin dashboard - you should see visitor counts and tool usage

## Important Security Notes

1. **Change Default Credentials**: Always change the default admin username and password
2. **Use Strong Tokens**: `ADMIN_SECRET_TOKEN` should be a long, random string
3. **HTTPS Only**: Always use HTTPS in production (Vercel handles this automatically)
4. **Database Security**: Use a managed PostgreSQL with SSL enabled
5. **API Keys**: Rotate your Groq and NaraRouter keys periodically

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correct
- Check if your database allows connections from Vercel IPs
- For Neon/Supabase, enable "Connection pooling"

### Admin Login Not Working
- Verify `ADMIN_SECRET_TOKEN` matches the one used to generate the hash
- Ensure `ADMIN_PASSWORD_HASH` is correctly set
- Check that the username matches exactly

### Tracking Not Working
- Ensure the client-side tracker component is present in `app/layout.tsx`
- Check browser console for CORS or network errors
- Verify `/api/analytics/track` is accessible

## Cost Estimate (Vercel Free Tier)

- **Vercel Hosting**: Free (100GB bandwidth, 125k serverless function hours)
- **Vercel Postgres**: Free (256MB storage, 60 hours compute/month)
- **Groq API**: Free (no credit card required)
- **NaraRouter API**: Free tier available

Total: **$0/month** for small to medium traffic
