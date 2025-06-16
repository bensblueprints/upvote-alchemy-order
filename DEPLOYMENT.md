# Deployment Guide - Netlify

## Overview
This project is a React + Vite application with Supabase backend integration and Netlify serverless functions to handle external API calls.

## Prerequisites
- GitHub account
- Netlify account
- Supabase project set up
- BuyUpvotes.io API key

## Key Features
- ✅ **CORS Issue Solved**: Netlify functions handle external API calls
- ✅ **Real-time fulfillment**: Orders submitted directly to BuyUpvotes.io
- ✅ **Automatic processing**: No manual intervention needed

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy with Netlify functions for CORS solution"
git push origin main
```

### 2. Connect to Netlify
1. Go to [Netlify](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose GitHub and authorize Netlify
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions` (auto-detected)

### 3. Set Environment Variables
In Netlify dashboard → Site settings → Environment variables:

**Required Variables:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BUYUPVOTES_API_KEY=6ca5f0ce27d54d5a84d6cb91bb55d0f2
```

### 4. Database Setup
Run this SQL in your Supabase SQL editor:

```sql
-- Add missing columns for API integration
ALTER TABLE public.upvote_orders ADD COLUMN IF NOT EXISTS external_order_id text;
ALTER TABLE public.upvote_orders ADD COLUMN IF NOT EXISTS error_message text;

-- Update existing orders
UPDATE public.upvote_orders SET status = 'pending' WHERE status IS NULL;
```

### 5. Test the Deployment
1. **Visit your Netlify URL**
2. **Create an account** and add funds
3. **Submit a test upvote order**
4. **Check Netlify function logs** in the dashboard
5. **Verify order appears** in BuyUpvotes.io (if you have access)

## Netlify Functions Created

### `/netlify/functions/submit-upvote-order.js`
- Handles upvote/downvote order submissions
- Bypasses CORS restrictions
- Logs all requests for debugging

### `/netlify/functions/submit-comment-order.js`
- Handles comment order submissions
- Provides consistent API interface
- Error handling and logging

## How It Works Now

### Order Flow:
```
User submits order → 
Local payment processing → 
Netlify function called → 
BuyUpvotes.io API request → 
Order fulfilled automatically
```

### Local Development:
- Orders stored locally if functions not available
- Full functionality on Netlify deployment
- Graceful degradation for development

## Troubleshooting

### Functions Not Working?
1. Check environment variables are set
2. View function logs in Netlify dashboard
3. Ensure API key is correct
4. Check BuyUpvotes.io service status

### Orders Not Being Fulfilled?
1. Check Netlify function logs
2. Verify BuyUpvotes.io account status
3. Check API key permissions
4. Contact BuyUpvotes.io support

## Environment Configuration

Your app now supports three environments:

1. **Local Development**: Orders stored for manual processing
2. **Netlify Deployment**: Full automation with serverless functions
3. **Production**: Complete Reddit marketing platform

## Success Indicators

✅ **Build succeeds** on Netlify  
✅ **Functions deploy** without errors  
✅ **Orders submit** successfully  
✅ **External API calls** work via functions  
✅ **Users receive** real upvotes/comments

## Build Configuration
The project includes:
- `netlify.toml` for build settings and redirects
- Optimized for Single Page Application (SPA) routing
- Security headers and caching configuration

## Database Setup
If using a new Supabase instance:
1. Import `setup-database.sql` into your Supabase project
2. Update the environment variables accordingly
3. Refer to `SETUP_YOUR_SUPABASE.md` for detailed instructions

## Custom Domain (Optional)
1. In Netlify dashboard → Domain settings
2. Add your custom domain
3. Configure DNS records as instructed by Netlify 