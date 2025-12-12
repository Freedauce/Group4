# Free Hosting Deployment Guide

## Architecture
```
┌─────────────────┐         ┌──────────────────┐
│     Vercel      │ ──API──►│     Railway      │
│  (Frontend)     │         │   (Backend)      │
│  React + Vite   │         │   .NET 8 API     │
│     FREE        │         │   FREE (500hrs)  │
└─────────────────┘         └──────────────────┘
```

---

## Step 1: Deploy Backend to Railway

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select: `Freedauce/Group4`
5. Railway will detect .NET and build automatically
6. Go to Settings → Add Environment Variables:
   ```
   Jwt__Key = YourSecretKeyAtLeast32Characters
   Jwt__Issuer = KigaliDrive
   Jwt__Audience = KigaliDrive
   GoogleAuth__ClientId = your-google-client-id
   GoogleAuth__ClientSecret = your-google-secret
   EmailSettings__SmtpServer = smtp.gmail.com
   EmailSettings__SmtpPort = 587
   EmailSettings__SenderEmail = your-email@gmail.com
   EmailSettings__SenderName = Kigali Rental
   EmailSettings__Password = your-app-password
   ```
7. Click "Deploy" and wait
8. Get your Railway URL: `https://xxxxx.up.railway.app`

---

## Step 2: Deploy Frontend to Vercel

1. Go to: https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import: `Freedauce/Group4`
5. Set Root Directory: `kigalidrive-frontend`
6. Add Environment Variables:
   ```
   VITE_API_URL = https://your-railway-url.up.railway.app/api
   VITE_GOOGLE_CLIENT_ID = your-google-client-id
   ```
7. Click "Deploy"

---

## Step 3: Update Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add Authorized JavaScript origins:
   - `https://your-app.vercel.app`
4. Add Authorized redirect URIs:
   - `https://your-app.vercel.app`
5. Save

---

## Free Tier Limits

| Platform | Free Limit |
|----------|------------|
| Vercel | Unlimited static, 100GB bandwidth |
| Railway | 500 hours/month, $5 credit |

---

## Quick Links
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Your Repo: https://github.com/Freedauce/Group4
