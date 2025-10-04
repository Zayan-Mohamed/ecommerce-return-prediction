# Deployment Guide

This application is split into two parts:

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway

## Frontend Deployment (Vercel)

The frontend is a React application that will be deployed to Vercel.

### Prerequisites

1. A Vercel account
2. The repository connected to Vercel

### Deployment Steps

1. Connect your repository to Vercel
2. Set the following environment variables in Vercel:
   ```
   VITE_SUPABASE_URL=https://xhyyahaspqvepixivzjf.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeXlhaGFzcHF2ZXBpeGl2empmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTA5NjMsImV4cCI6MjA3NDM2Njk2M30.yUFs81WB-StfYMljXPduMEKAVXsu7BK16b2GTDHve_4
   VITE_API_URL=https://your-railway-app-name.railway.app
   ```
3. Deploy using the existing `vercel.json` configuration

### Configuration

- The `vercel.json` file is already configured to build only the frontend
- Static files are served correctly with SPA routing support

## Backend Deployment (Railway)

The backend is a FastAPI application with ML models that will be deployed to Railway.

### Prerequisites

1. A Railway account
2. The repository connected to Railway

### Deployment Steps

1. Connect your repository to Railway
2. Set the following environment variables in Railway:
   ```
   SUPABASE_URL=https://xhyyahaspqvepixivzjf.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeXlhaGFzcHF2ZXBpeGl2empmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODc5MDk2MywiZXhwIjoyMDc0MzY2OTYzfQ.e_UrkqNTi8fESQg9SOhHdPyPpUtDplbvRbMk7EH2tLI
   DATABASE_URL=postgresql://postgres.xhyyahaspqvepixivzjf:uEDavZTzTYq#TP2@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://*.vercel.app,https://your-vercel-app.vercel.app
   API_HOST=0.0.0.0
   PORT=8000
   ```
3. Railway will automatically use the `Dockerfile` to build and deploy the application

### Configuration

- The `Dockerfile` is configured to copy the services directory and run the FastAPI application
- The `railway.toml` file provides additional configuration for the deployment
- Health check endpoint is configured at `/health`

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd services
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Important Notes

1. **Update API URL**: After deploying to Railway, update the `VITE_API_URL` in your Vercel environment variables to point to your Railway app URL.

2. **CORS Configuration**: The backend is configured to accept requests from Vercel apps (`*.vercel.app`). If you deploy to a custom domain, add it to the `CORS_ORIGINS` environment variable.

3. **Environment Variables**: Make sure all environment variables are set correctly in both Vercel and Railway.

4. **Database**: Both frontend and backend connect to the same Supabase database.

## Testing the Deployment

1. Deploy the backend to Railway first
2. Note the Railway app URL (e.g., `https://your-app-name.railway.app`)
3. Update the `VITE_API_URL` environment variable in Vercel
4. Deploy the frontend to Vercel
5. Test the application end-to-end
