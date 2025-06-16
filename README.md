# Upvote Alchemy Order

A white-label Reddit marketing platform that allows users to order upvotes, downvotes, and comments for their Reddit posts through the BuyUpvotes.io API.

## 🚀 Features

- **Reddit Upvote/Downvote Ordering** - Boost your Reddit posts and comments
- **Comment Ordering System** - Get engagement through real comments
- **Reddit Account Marketplace** - Buy and sell aged Reddit accounts
- **Admin Dashboard** - Full platform management
- **API Integration** - Complete BuyUpvotes.io API integration
- **Payment Processing** - Stripe integration for funds
- **User Management** - Supabase authentication and profiles
- **API Documentation** - Built-in API docs and testing

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Functions)
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **External API**: BuyUpvotes.io integration

## 🌐 Live Demo

Deploy to Railway: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

## ⚙️ Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# BuyUpvotes API
VITE_BUYUPVOTES_API_KEY=your_buyupvotes_api_key

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd upvote-alchemy-order
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚢 Deployment to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   In Railway dashboard, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BUYUPVOTES_API_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

4. **Deploy**
   Railway will automatically build and deploy your app

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## 📊 Database Setup

This project uses Supabase. To set up your own database:

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Run Database Setup**
   - Copy content from `setup-database.sql`
   - Run in Supabase SQL Editor
   - Or follow instructions in `SETUP_YOUR_SUPABASE.md`

## 🔧 Configuration

### API Integration
- The app integrates with BuyUpvotes.io API
- API key: `6ca5f0ce27d54d5a84d6cb91bb55d0f2` (demo)
- Replace with your own API key for production

### Pricing Tiers
- **Starter ($15+)**: $0.20 per upvote
- **Basic ($100+)**: $0.10 per upvote  
- **Standard ($250+)**: $0.08 per upvote
- **Pro ($750+)**: $0.06 per upvote
- **Elite ($1000+)**: $0.04 per upvote

## 📱 Features Overview

### User Features
- Order upvotes/downvotes for Reddit posts
- Order comments for engagement
- Buy aged Reddit accounts
- Track order status
- Add funds via Stripe
- View transaction history

### Admin Features
- Manage all users and orders
- Add/manage Reddit accounts
- View audit logs
- Manage API keys
- Financial overview

## 🔒 Security

- Row Level Security (RLS) enabled
- Admin-only access controls
- Audit logging for all actions
- Password strength validation
- Secure API key management

## 📖 API Documentation

The app includes built-in API documentation accessible at `/api-docs` route. Test API connections directly from the dashboard.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@your-domain.com or open an issue on GitHub.

---

**Note**: This is a white-label platform. You can customize branding, pricing, and features to match your business needs.
