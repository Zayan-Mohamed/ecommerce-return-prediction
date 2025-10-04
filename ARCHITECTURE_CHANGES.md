# Deployment Architecture Changes

## Summary

The application has been reconfigured for a **split deployment**:

- **Frontend**: React app deployed to **Vercel**
- **Backend**: FastAPI app with ML models deployed to **Railway**

## Changes Made

### 1. Vercel Configuration (`vercel.json`)

- ✅ Removed Python function build
- ✅ Removed API routes
- ✅ Kept only frontend build configuration
- ✅ Maintained SPA routing support

### 2. Railway Configuration

- ✅ Created `Dockerfile` for containerized deployment
- ✅ Created `railway.toml` for Railway-specific settings
- ✅ Configured health check endpoint (`/health`)
- ✅ Set up proper port handling for Railway's dynamic PORT

### 3. Environment Configuration

- ✅ Updated CORS origins to include Vercel and Railway domains
- ✅ Created production environment template (`frontend/.env.production`)
- ✅ Added deployment instructions in `DEPLOYMENT.md`

### 4. API Service Configuration

- ✅ The existing `apiService.js` already supports environment-based API URL configuration
- ✅ Uses `VITE_API_URL` environment variable
- ✅ Falls back to localhost for development

### 5. Cleanup

- ✅ Removed `/api` directory (no longer needed for Vercel deployment)
- ✅ Updated `.gitignore` to include environment files

## Next Steps

### For Railway Backend Deployment:

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables:
   ```
   SUPABASE_URL=https://xhyyahaspqvepixivzjf.supabase.co
   SUPABASE_SERVICE_KEY=<your-service-key>
   DATABASE_URL=<your-database-url>
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://*.vercel.app
   ```
4. Railway will automatically detect and use the Dockerfile
5. Note the deployed URL (e.g., `https://your-app.railway.app`)

### For Vercel Frontend Deployment:

1. Create a new Vercel project or update existing one
2. Set environment variables:
   ```
   VITE_SUPABASE_URL=https://xhyyahaspqvepixivzjf.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_API_URL=https://your-railway-app.railway.app
   ```
3. Deploy using the existing `vercel.json` configuration

## Benefits of This Architecture

1. **No Size Constraints**: Railway can handle the full ML stack without serverless limitations
2. **Better Performance**: Dedicated containers for ML models
3. **Easier Scaling**: Frontend and backend scale independently
4. **Cost Effective**: Vercel for static frontend, Railway for backend compute
5. **Simplified Development**: Cleaner separation of concerns

## Testing

- Frontend will build and deploy to Vercel as a static SPA
- Backend will run the full ML application with all models on Railway
- API communication happens cross-origin between the two services
- CORS is properly configured for production domains
