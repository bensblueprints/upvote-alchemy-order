# Deployment Guide - Netlify

## Overview
This project is a React + Vite application with Supabase backend integration. Follow these steps to deploy to Netlify.

## Prerequisites
- GitHub account
- Netlify account
- Supabase project set up
- BuyUpvotes.io API key

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and authorize Netlify
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 3. Set Environment Variables
In Netlify dashboard → Site settings → Environment variables, add:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BUYUPVOTES_API_KEY=your_buyupvotes_api_key
```

### 4. Deploy
Click "Deploy site" and wait for the build to complete.

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

## Troubleshooting
- **Build fails**: Check environment variables are set correctly
- **Routes not working**: Ensure `netlify.toml` is in root directory
- **API errors**: Verify Supabase URL and keys are correct 