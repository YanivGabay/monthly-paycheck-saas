# 💼 Monthly Paycheck SaaS

**Automated Hebrew Payslip Processing & Distribution System**

🤖 **AI-powered** payslip recognition  
📧 **Automated** email distribution  
🏢 **Multi-company** support  
🔐 **Google OAuth** authentication  
⚡ **Real-time** processing preview

---

## 🚀 **Quick Start**

### **Option 1: Railway (Recommended - 5 minutes)**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Click "Deploy on Railway"
2. Connect your GitHub repo
3. Add environment variables (see `env.example`)
4. Deploy! ✅

### **Option 2: Local Development**
```bash
# Backend
docker-compose -f config/docker-compose.yml up

# Frontend  
cd frontend && npm install && npm run dev
```

---

## 🏗️ **Architecture**

```
├── 🐍 Backend (FastAPI + Python)
│   ├── Google OAuth authentication
│   ├── OpenRouter AI vision processing
│   ├── Mailgun email delivery
│   └── Rate limiting & security
│
├── ⚛️ Frontend (React + TypeScript)  
│   ├── Hebrew UI with RTL support
│   ├── Company setup wizard
│   ├── Payslip processing interface
│   └── Real-time usage stats
│
└── 🐳 Docker (Production deployment)
    ├── Multi-stage builds
    ├── Persistent volumes
    └── Health checks
```

---

## 📂 **Project Structure**

```
monthly-paycheck-saas/
├── app/                      # 🐍 Backend API
│   ├── main.py              # FastAPI application
│   ├── routes.py             # API endpoints
│   ├── config.py             # Company templates
│   └── services/             # Business logic
│
├── frontend/                 # ⚛️ React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── services/         # API clients
│   │   └── store/           # State management
│   └── package.json
│
├── config/                   # 🐳 Docker configuration
│   ├── Dockerfile           # Production build
│   └── docker-compose.yml   # Local development
│
├── company_configs/          # 💾 Persistent company data
├── scripts/                  # 🛠️ Development utilities
├── docs/                     # 📚 Documentation
└── tests/                    # 🧪 Test suites
```

---

## ⚙️ **Configuration**

### **Required Environment Variables**
```bash
# Security (REQUIRED)
JWT_SECRET=your-32-character-secret
ENVIRONMENT=production
DEBUG=false

# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# AI Processing (REQUIRED)
OPENROUTER_API_KEY=your-openrouter-key

# Email Service (REQUIRED)
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.com

# Production Domain (REQUIRED)
PRODUCTION_DOMAIN=your-app.railway.app
ALLOWED_HOSTS=your-app.railway.app

# Rate Limiting (Optional)
RATE_LIMIT_AI_CALLS_PER_DAY=50
RATE_LIMIT_EMAIL_SENDS_PER_DAY=20
RATE_LIMIT_PDF_UPLOADS_PER_DAY=10
```

See `env.example` for complete configuration template.

---

## 🔧 **Development**

### **Prerequisites**
- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.10+ (for local backend development)

### **Setup Development Environment**
```bash
# 1. Clone repository
git clone <your-repo>
cd monthly-paycheck-saas

# 2. Copy environment template
cp env.example .env
# Edit .env with your API keys

# 3. Start services
docker-compose -f config/docker-compose.yml up -d

# 4. Start frontend development
cd frontend
npm install
npm run dev
```

### **Useful Scripts**
```bash
# Organize project structure
scripts/organize-project.bat

# Clean development files
scripts/cleanup-dev-files.bat

# Test OAuth configuration
scripts/test_oauth_config.bat

# Start production build
scripts/start-prod.bat
```

---

## 🚀 **Deployment**

### **Production Checklist**
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure Google OAuth origins
- [ ] Set up Mailgun account
- [ ] Get OpenRouter API key
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure domain in `PRODUCTION_DOMAIN`

### **Deploy to Railway**
1. Push to GitHub
2. Connect Railway to your repo
3. Set environment variables
4. Configure persistent storage
5. Deploy! 🎉

### **Deploy to Other Platforms**
- **Render**: Auto-detects Docker
- **DigitalOcean App Platform**: Direct Docker deployment
- **VPS**: Use Docker Compose with production config

See `docs/PRODUCTION_DEPLOYMENT.md` for detailed deployment guide.

---

## 🛡️ **Security Features**

✅ **Authentication**: Google OAuth 2.0  
✅ **Authorization**: JWT tokens with expiration  
✅ **Rate Limiting**: Per-user API limits  
✅ **Input Validation**: File type/size restrictions  
✅ **CORS Protection**: Domain-specific origins  
✅ **Security Headers**: XSS, clickjacking protection  
✅ **HTTPS Enforcement**: Production SSL redirect  

---

## 📊 **Usage & Costs**

### **Rate Limits (Default)**
- AI Calls: 50/day per user
- Email Sends: 20/day per user  
- PDF Uploads: 10/day per user

### **Estimated Monthly Costs**
- **Hosting**: $10-30 (Railway/Render)
- **AI Processing**: $10-50 (OpenRouter)
- **Email Service**: $0-15 (Mailgun)
- **Total**: $20-95/month

---

## 🧪 **Testing**

```bash
# Run backend tests
docker-compose -f config/docker-compose.test.yml up

# Test OAuth configuration  
scripts/test_oauth_config.bat

# Frontend tests
cd frontend && npm test
```

---

## 📈 **Scaling Considerations**

- **Horizontal scaling**: Deploy multiple instances
- **Database**: Add PostgreSQL for larger datasets
- **Caching**: Implement Redis for session storage
- **CDN**: Add CloudFlare for static assets
- **Monitoring**: Set up logging and alerts

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 **License**

This project is proprietary software. All rights reserved.

---

## 📞 **Support**

- 📖 **Documentation**: `/docs` directory
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

---

**Built with ❤️ for efficient Hebrew payslip processing**