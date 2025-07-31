# 🚀 Production Deployment Guide

## ✅ **Pre-Deployment Checklist**

### **🔐 Security (CRITICAL)**
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure `PRODUCTION_DOMAIN` environment variable
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=false`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up HTTPS/SSL certificate
- [ ] Review Google OAuth origins

### **📧 Email Service**
- [ ] Set up Mailgun account
- [ ] Configure `MAILGUN_API_KEY` and `MAILGUN_DOMAIN`
- [ ] Test email delivery

### **🔑 API Keys**
- [ ] Get OpenRouter API key for AI vision
- [ ] Set up Google OAuth credentials
- [ ] Generate secure rate limit values

---

## 🛠️ **Deployment Steps**

### **1. Prepare Production Environment**

Create `.env.production`:

```bash
# ===== PRODUCTION CONFIGURATION =====
ENVIRONMENT=production
DEBUG=false

# Your domain (REQUIRED)
PRODUCTION_DOMAIN=your-domain.com
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Security (REQUIRED - Generate secure values!)
JWT_SECRET=your-ultra-secure-jwt-secret-32-chars-min
MAX_FILE_SIZE_MB=10

# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# AI Service (REQUIRED)
OPENROUTER_API_KEY=your_openrouter_api_key

# Email Service (REQUIRED)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.your-domain.com
MAILGUN_FROM_NAME="Your Company Name"
MAILGUN_FROM_EMAIL=noreply@mg.your-domain.com

# Rate Limiting (Adjust based on your plan)
RATE_LIMIT_AI_CALLS_PER_DAY=50
RATE_LIMIT_EMAIL_SENDS_PER_DAY=20
RATE_LIMIT_PDF_UPLOADS_PER_DAY=10
```

### **2. Generate Secure JWT Secret**

```bash
# Option 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -base64 32

# Option 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **3. Update Google OAuth**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Credentials** → Your OAuth Client
3. Add **Authorized JavaScript Origins**:
   - `https://your-domain.com`
   - `https://www.your-domain.com`
4. Add **Authorized Redirect URIs**:
   - `https://your-domain.com/auth/callback`

### **4. Build and Deploy**

```bash
# Build production images
docker-compose -f config/docker-compose.yml build

# Deploy with production environment
cp .env.production .env
docker-compose -f config/docker-compose.yml up -d

# Verify deployment
curl https://your-domain.com/api/health
```

---

## 🔍 **Post-Deployment Verification**

### **Health Checks**
```bash
# Backend health
curl https://your-domain.com/api/health

# Frontend loading
curl -I https://your-domain.com/

# API authentication
curl -X POST https://your-domain.com/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'
```

### **Security Verification**
```bash
# Check security headers
curl -I https://your-domain.com/

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

---

## 📊 **Monitoring & Logging**

### **Log Locations**
- Container logs: `docker logs container-name`
- Health endpoint: `https://your-domain.com/api/health`
- Error tracking: Check browser console for frontend errors

### **Key Metrics to Monitor**
- **Response times**: API endpoints
- **Error rates**: 4xx/5xx responses
- **Usage limits**: Rate limiting triggers
- **File uploads**: Success/failure rates
- **Memory/CPU**: Container resource usage

---

## 🔒 **Security Best Practices**

### **Regular Maintenance**
- [ ] Rotate JWT secret every 6 months
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Monitor rate limiting effectiveness

### **Backup Strategy**
- [ ] Backup company configurations (`company_configs/`)
- [ ] Backup environment variables (securely)
- [ ] Test restore procedures

---

## 🚨 **Common Issues & Solutions**

### **CORS Errors**
- Verify `PRODUCTION_DOMAIN` is set correctly
- Check Google OAuth origins include your domain
- Ensure HTTPS is properly configured

### **Authentication Failures**
- Verify JWT secret is consistent
- Check Google OAuth credentials
- Confirm token expiration settings

### **File Upload Issues**
- Check `MAX_FILE_SIZE_MB` setting
- Verify proxy timeout settings
- Monitor disk space usage

### **Email Delivery Problems**
- Test Mailgun configuration
- Check DNS records for domain
- Verify rate limiting settings

---

## 📞 **Support & Troubleshooting**

### **Debug Mode (Temporary)**
```bash
# Enable debug temporarily
docker exec -it container-name sh
export DEBUG=true
# Restart application
```

### **Logs Analysis**
```bash
# View recent logs
docker logs --tail 100 container-name

# Follow logs in real-time
docker logs -f container-name

# Search for errors
docker logs container-name 2>&1 | grep -i error
```

Remember: **Never commit production secrets to version control!**