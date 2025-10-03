# 🌊 DigitalOcean App Platform Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **✅ Required Environment Variables**
Set these in the App Platform dashboard under your app's settings:

```bash
# Security (REQUIRED)
JWT_SECRET=your-ultra-secure-jwt-secret-32-chars-min
ENVIRONMENT=production
DEBUG=false

# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# AI Processing (REQUIRED)
OPENROUTER_API_KEY=your_openrouter_api_key

# Email Service (REQUIRED)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.your-domain.com
MAILGUN_FROM_NAME="Monthly Paycheck"
MAILGUN_FROM_EMAIL=noreply@mg.your-domain.com

# App Configuration (OPTIONAL)
APP_NAME=monthly-paycheck-saas
PRODUCTION_DOMAIN=your-custom-domain.com  # If using custom domain

# Rate Limiting (OPTIONAL - defaults provided)
RATE_LIMIT_AI_CALLS_PER_DAY=50
RATE_LIMIT_EMAIL_SENDS_PER_DAY=20
RATE_LIMIT_PDF_UPLOADS_PER_DAY=10
```

---

## 🚀 **Step-by-Step Deployment**

### **1. Prepare Your Repository**

1. **Update the App Platform spec file**:
   - Edit `.do/app.yaml`
   - Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username

2. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Configure for DigitalOcean App Platform deployment"
   git push origin main
   ```

### **2. Create App on DigitalOcean**

1. **Go to App Platform**:
   - Visit: https://cloud.digitalocean.com/apps
   - Click **"Create App"**

2. **Connect Repository**:
   - Choose **GitHub**
   - Select your `monthly-paycheck-saas` repository
   - Choose `main` branch
   - ✅ Enable **"Autodeploy"** for automatic deployments

3. **Review App Configuration**:
   - App Platform will detect your `.do/app.yaml` file
   - Review the configuration:
     - **Backend**: Web Service ($5/month)
     - **Frontend**: Static Site (FREE)
     - **Volumes**: Persistent storage for configs

### **3. Configure Environment Variables**

In the App Platform dashboard:

1. **Go to Settings → Environment Variables**
2. **Add all required variables** (see checklist above)
3. **Use "Encrypted" type** for sensitive values like API keys
4. **Use "Plain Text" type** for non-sensitive values like `DEBUG=false`

### **4. Configure Custom Domain (Optional)**

If you want a custom domain instead of `your-app.ondigitalocean.app`:

1. **Go to Settings → Domains**
2. **Add your domain**
3. **Update DNS records** as instructed
4. **Set `PRODUCTION_DOMAIN`** environment variable

### **5. Deploy**

1. **Click "Deploy"** in the App Platform dashboard
2. **Monitor the build logs** for any errors
3. **Wait for deployment** to complete (usually 5-10 minutes)

---

## 🔍 **Post-Deployment Verification**

### **1. Health Checks**

```bash
# Backend health check
curl https://your-app-name.ondigitalocean.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-03T...",
  "version": "3.0.0",
  "environment": "production"
}
```

### **2. Frontend Loading**

- Visit: `https://your-app-name.ondigitalocean.app`
- Should load the React application
- Check browser console for any errors

### **3. Authentication Test**

1. **Click "Sign in with Google"**
2. **Complete OAuth flow**
3. **Verify you're redirected back to the app**

---

## 📊 **Cost Breakdown**

### **Monthly Costs**:
- **Backend (Web Service)**: $5/month
- **Frontend (Static Site)**: FREE
- **Persistent Volumes (2GB)**: ~$0.20/month
- **Data Transfer**: 1GB free, then $0.02/GB

### **Total**: ~$5.20/month + data overage

---

## 🔧 **File Storage Strategy**

### **Persistent Storage (Volumes)**:
- ✅ **Company Configs**: `/app/company_configs` → Persistent volume
- ✅ **Sample Files**: `/app/samples` → Persistent volume

### **Ephemeral Storage (Container)**:
- ❌ **Processing Files**: `/app/uploads/processing` → Temporary (cleaned after use)
- ❌ **Debug Images**: `/app/debug` → Disabled in production
- ❌ **Preview Images**: `/app/previews` → Temporary (can be regenerated)

This strategy minimizes storage costs while ensuring important data persists.

---

## 🚨 **Troubleshooting**

### **Build Failures**

**Python Build Issues**:
```bash
# Check requirements.txt
pip install -r requirements.txt

# Verify Python version compatibility
python --version  # Should be 3.10+
```

**Node.js Build Issues**:
```bash
# Check package.json
cd frontend && npm install && npm run build

# Verify Node.js version
node --version  # Should be 18+
```

### **Runtime Errors**

**CORS Issues**:
- Verify `APP_NAME` environment variable matches your app name
- Check browser console for CORS errors
- Ensure frontend and backend are on same domain

**Authentication Issues**:
- Verify Google OAuth credentials
- Check `JWT_SECRET` is set and secure
- Ensure Google OAuth origins include your App Platform domain

**File Storage Issues**:
- Check volume mounts in App Platform dashboard
- Verify persistent volumes are attached
- Monitor disk usage in metrics

### **Performance Issues**

**Slow Response Times**:
- Check App Platform metrics
- Consider upgrading instance size
- Monitor memory usage

**Rate Limiting**:
- Check rate limit environment variables
- Monitor usage in application logs
- Adjust limits based on your needs

---

## 📈 **Scaling Considerations**

### **Vertical Scaling**:
- Upgrade instance size in App Platform dashboard
- Monitor CPU and memory usage

### **Horizontal Scaling**:
- Increase instance count for backend service
- App Platform handles load balancing automatically

### **Database Migration**:
- Consider PostgreSQL for larger datasets
- Migrate from JSON files to database storage
- Use App Platform managed databases

---

## 🔄 **CI/CD Pipeline**

App Platform automatically:
- ✅ **Builds** on every push to `main`
- ✅ **Tests** build process
- ✅ **Deploys** if build succeeds
- ✅ **Rolls back** if deployment fails

### **Manual Deployment**:
```bash
# Trigger deployment manually
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 📞 **Support Resources**

- **App Platform Docs**: https://docs.digitalocean.com/products/app-platform/
- **Community Support**: https://www.digitalocean.com/community/
- **Status Page**: https://status.digitalocean.com/
- **Pricing Calculator**: https://www.digitalocean.com/pricing/app-platform

---

**🎉 Your Monthly Paycheck SaaS is now running on DigitalOcean App Platform!**

