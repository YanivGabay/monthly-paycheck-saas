# ✅ **Pre-Deployment Checklist**

**Complete this checklist before pushing to GitHub for deployment**

---

## 🧹 **Project Organization**

- [ ] Run `prepare-for-deployment.bat` to organize structure
- [ ] Verify all scripts moved to `scripts/` directory  
- [ ] Confirm documentation moved to `docs/` directory
- [ ] Check temporary files are cleaned up
- [ ] Ensure `.gitignore` excludes sensitive files

---

## 🔐 **Security Configuration**

- [ ] Copy `env.example` to `.env` (locally only)
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Configure Google OAuth credentials  
- [ ] Set up Mailgun email service
- [ ] Get OpenRouter API key
- [ ] Verify `.env` is in `.gitignore` (**CRITICAL**)

---

## 🛠️ **Application Configuration**

### **Environment Variables Ready**
- [ ] `JWT_SECRET` - Strong 32+ character secret
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console  
- [ ] `OPENROUTER_API_KEY` - For AI processing
- [ ] `MAILGUN_API_KEY` - For email delivery
- [ ] `MAILGUN_DOMAIN` - Your email domain
- [ ] `PRODUCTION_DOMAIN` - Your app domain
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=false`

### **Rate Limits Configured**
- [ ] `RATE_LIMIT_AI_CALLS_PER_DAY` (e.g., 50)
- [ ] `RATE_LIMIT_EMAIL_SENDS_PER_DAY` (e.g., 20)
- [ ] `RATE_LIMIT_PDF_UPLOADS_PER_DAY` (e.g., 10)

---

## 🎯 **Deployment Platform Setup**

### **Railway (Recommended)**
- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Environment variables configured in Railway dashboard
- [ ] Persistent volume configured for `/app/company_configs`
- [ ] Spending limit set (e.g., $50/month)
- [ ] Usage alerts enabled

### **Alternative Platforms**
- [ ] Render: Connected GitHub repo
- [ ] DigitalOcean: App Platform configured
- [ ] VPS: Docker & Docker Compose installed

---

## 🌐 **External Services**

### **Google OAuth Setup**
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript Origins configured:
  - `https://your-domain.com`
  - `https://www.your-domain.com`
  - `http://localhost:3000` (for development)

### **Mailgun Setup**  
- [ ] Mailgun account created
- [ ] Domain configured and verified
- [ ] DNS records added (MX, TXT, CNAME)
- [ ] API key generated

### **OpenRouter Setup**
- [ ] OpenRouter account created
- [ ] API key generated  
- [ ] Billing/credits configured

---

## 🧪 **Testing**

### **Local Testing**
- [ ] OAuth configuration test passes: `scripts/test_oauth_config.bat`
- [ ] Docker build succeeds: `docker-compose -f config/docker-compose.yml build`
- [ ] Application starts locally: `docker-compose -f config/docker-compose.yml up`
- [ ] Frontend builds: `cd frontend && npm run build`

### **Production Testing** (after deployment)
- [ ] Health check responds: `https://your-domain.com/api/health`
- [ ] Frontend loads correctly
- [ ] Google OAuth login works  
- [ ] Company setup flow completes
- [ ] PDF processing works
- [ ] Email sending works

---

## 📁 **File Structure Verification**

```
✅ Expected structure after organization:

monthly-paycheck-saas/
├── 📁 app/                   # Backend Python code
├── 📁 frontend/              # React frontend
├── 📁 config/                # Docker configuration
├── 📁 company_configs/       # Persistent company data
├── 📁 scripts/               # Development scripts  
├── 📁 docs/                  # Documentation
├── 📁 tests/                 # Test files
├── 📄 README.md              # Project overview
├── 📄 railway.json           # Railway deployment config
├── 📄 requirements.txt       # Python dependencies
├── 📄 .gitignore            # Git exclusions
├── 📄 env.example           # Environment template
└── 📄 DEPLOYMENT_CHECKLIST.md  # This file
```

---

## 🚀 **Final Steps**

### **Git Preparation**
- [ ] All changes committed locally
- [ ] `.env` file NOT committed (check with `git status`)
- [ ] README.md updated with your specifics
- [ ] Repository pushed to GitHub

### **Deployment**
- [ ] Platform deployment initiated
- [ ] Environment variables configured
- [ ] Domain/SSL configured  
- [ ] Health checks passing
- [ ] Application accessible

### **Post-Deployment**
- [ ] Create first company setup
- [ ] Test full payslip processing flow
- [ ] Verify email delivery
- [ ] Set up monitoring/alerts
- [ ] Document production URLs

---

## 🆘 **Troubleshooting**

### **Common Issues**
- **Build fails**: Check Dockerfile paths and dependencies
- **OAuth errors**: Verify domain in Google Cloud Console
- **Email failures**: Check Mailgun domain verification
- **File errors**: Ensure persistent storage configured
- **API errors**: Verify all environment variables set

### **Support Resources**  
- 📖 `docs/PRODUCTION_DEPLOYMENT.md` - Detailed deployment guide
- 🔧 `scripts/test_oauth_config.bat` - OAuth testing
- 🏥 `/api/health` - Application health endpoint
- 📋 `README.md` - Project overview and setup

---

**✅ Ready? Run `prepare-for-deployment.bat` and let's deploy! 🚀**