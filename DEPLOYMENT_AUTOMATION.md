# Automated Deployment Setup Guide

This guide helps you set up automated syncing from your organization repository to your personal fork for seamless deployment.

## 🏗️ **Architecture Overview**

```
Organization Repo (1nf1r4/ecommerce-return-prediction)
    ↓ (GitHub Action syncs on push to main)
Personal Fork (YourUsername/ecommerce-return-prediction)
    ↓ (Auto-deployment triggers)
Vercel (Frontend) + Railway (Backend)
```

## 🔧 **Setup Steps**

### **Step 1: Fork the Repository**

✅ Already completed - you have your personal fork

### **Step 2: Set up GitHub Secrets in Organization Repo**

Go to your **organization repository** settings → Secrets and variables → Actions, and add:

#### **Required Secrets:**

```
PERSONAL_ACCESS_TOKEN=ghp_your_personal_access_token_here
PERSONAL_GITHUB_USERNAME=your_github_username
```

#### **How to create Personal Access Token:**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Copy the token and add it to organization repo secrets

### **Step 3: Set up Deployment Secrets in Personal Fork**

Go to your **personal fork** settings → Secrets and variables → Actions, and add:

#### **For Vercel Deployment:**

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### **For Railway Deployment:**

```
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_ID=your_railway_service_id
```

### **Step 4: Get Vercel Credentials**

1. **Vercel Token:**

   ```bash
   npx vercel login
   npx vercel --token
   ```

   Or go to Vercel Dashboard → Settings → Tokens

2. **Vercel Org ID & Project ID:**
   ```bash
   cd your-project
   npx vercel link
   cat .vercel/project.json
   ```

### **Step 5: Get Railway Credentials**

1. **Railway Token:**

   - Go to Railway Dashboard → Account Settings → Tokens
   - Create new token with deployment permissions

2. **Railway Service ID:**
   - Go to your Railway project
   - Click on your service
   - Copy the service ID from URL or settings

## 🚀 **How It Works**

### **Organization Repository (Source):**

- Developers push to `main` or `develop` branch
- GitHub Action runs tests (frontend build, backend checks)
- If tests pass, code is synced to personal fork
- Creates deployment tags for tracking

### **Personal Fork (Deployment Target):**

- Receives synced code automatically
- Triggers deployment to Vercel (frontend) and Railway (backend)
- Runs health checks after deployment
- Notifies of success/failure

## 🔄 **Workflow Triggers**

### **Automatic Sync (Org → Personal):**

- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ Manual trigger via GitHub UI

### **Automatic Deployment (Personal → Production):**

- ✅ Push to `main` branch (from sync)
- ✅ Manual trigger via GitHub UI

## 🧪 **Testing the Setup**

1. **Test the sync:**

   ```bash
   # In organization repo
   git checkout main
   echo "# Test sync" >> README.md
   git add README.md
   git commit -m "Test sync workflow"
   git push origin main
   ```

2. **Check GitHub Actions:**

   - Organization repo: Should show "Sync to Personal Fork" workflow
   - Personal fork: Should show "Deploy to Vercel and Railway" workflow

3. **Verify deployment:**
   - Frontend: Check Vercel dashboard
   - Backend: Check Railway dashboard
   - Test: Visit your live URLs

## 📋 **Workflow Features**

### **Built-in Testing:**

- ✅ Frontend build validation
- ✅ Backend dependency check
- ✅ Linting (if configured)
- ✅ Post-deployment health checks

### **Smart Syncing:**

- ✅ Only syncs after tests pass
- ✅ Force pushes to avoid conflicts
- ✅ Creates deployment tags
- ✅ Handles both main and develop branches

### **Deployment Safety:**

- ✅ Health checks after deployment
- ✅ CORS validation
- ✅ Frontend-backend connectivity test
- ✅ Rollback capability (manual)

## 🛠️ **Customization Options**

### **Add More Tests:**

Edit `.github/workflows/sync-to-personal-fork.yml`:

```yaml
- name: Run backend tests
  run: |
    cd services
    python -m pytest tests/

- name: Run frontend tests
  run: |
    cd frontend
    npm test
```

### **Add Staging Environment:**

```yaml
# Deploy to staging first
- name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  # ... staging deployment steps
```

### **Add Slack/Discord Notifications:**

```yaml
- name: Notify Team
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔐 **Security Best Practices**

1. **Use separate tokens** for different environments
2. **Limit token permissions** to minimum required
3. **Rotate tokens regularly** (every 90 days)
4. **Monitor workflow logs** for sensitive data leaks
5. **Use environment protection rules** for production

## 🐛 **Troubleshooting**

### **Sync Fails:**

- Check if `PERSONAL_ACCESS_TOKEN` has correct permissions
- Verify `PERSONAL_GITHUB_USERNAME` is correct
- Check if personal fork exists and is accessible

### **Deployment Fails:**

- Verify Vercel/Railway tokens are valid
- Check if project IDs are correct
- Review deployment logs in respective platforms

### **Health Checks Fail:**

- Wait longer for deployments to complete
- Check if URLs are correct
- Verify CORS configuration

## 📝 **Manual Backup Options**

If automation fails, you can manually sync:

```bash
# Clone org repo
git clone https://github.com/1nf1r4/ecommerce-return-prediction.git org-repo
cd org-repo

# Add personal fork as remote
git remote add personal https://github.com/yourusername/ecommerce-return-prediction.git

# Push to personal fork
git push personal main

# Trigger deployment manually in personal fork
```

This setup provides a robust, automated pipeline from your organization repository to production deployment! 🚀
