# 🍄 Mycopath Environment Access Links

## Quick Access Dashboard

### Environment Status Monitor
- **Local Status**: http://localhost:5000/environment-status
- **API Status**: http://localhost:5000/api/environment

---

## 🧪 UAT Environment
**URL**: https://uat-mycopath.replit.app
- **Purpose**: User Acceptance Testing & Development
- **Security**: Relaxed for testing
- **Data**: In-memory (resets on restart)
- **Access**: Immediate (auto-approval)

### UAT Test Credentials
```
Employee ID: TEST-001
Password: demo123
```

### UAT Features
- ✅ Email Verification: DISABLED
- ✅ Admin Approval: AUTO-APPROVE
- ✅ Storage: IN-MEMORY
- ✅ Debug Mode: ENABLED
- ✅ Session: 24 HOURS

---

## 🏭 Production Environment
**URL**: https://mycopath.replit.app
- **Purpose**: Live Production System
- **Security**: Full security enabled
- **Data**: PostgreSQL (persistent)
- **Access**: Admin approval required

### Production Requirements
- Valid email address verification
- Administrator approval
- Strong password policy
- 8-hour session timeout

### Production Features
- 🔒 Email Verification: REQUIRED
- 🔒 Admin Approval: MANDATORY
- 🔒 Storage: POSTGRESQL
- 🔒 Debug Mode: DISABLED
- 🔒 Session: 8 HOURS

---

## Deployment Commands

### Deploy to UAT
```bash
bash deploy-uat.sh
# Or set environment and run
ENVIRONMENT_TYPE=uat npm run dev
```

### Deploy to Production
```bash
bash deploy-production.sh
# Or set environment and run
ENVIRONMENT_TYPE=production npm run start
```

---

## Current Environment Status

**Active Environment**: UAT (Development Mode)
**Storage**: In-Memory
**Auto-Approval**: Enabled
**Domain**: uat-mycopath.replit.app

---

## File Structure for Environment Management

```
mycopath/
├── environment.config.js         # Main environment configuration
├── deploy-uat.sh                # UAT deployment script  
├── deploy-production.sh          # Production deployment script
├── environment-status.html       # Visual status dashboard
├── .replit.uat                   # UAT Replit configuration
├── .replit.production           # Production Replit configuration
├── DEPLOYMENT_GUIDE.md          # Detailed deployment guide
├── ENVIRONMENT_ACCESS.md        # This quick access file
└── server/storage.ts            # Environment-aware storage system
```

---

## Testing Workflow

1. **Develop & Test in UAT**
   - Use https://uat-mycopath.replit.app
   - Login with TEST-001/demo123
   - Test all features thoroughly

2. **Deploy to Production**
   - Use https://mycopath.replit.app  
   - Register with real email
   - Wait for admin approval
   - Use for live business operations

3. **Monitor Both Environments**
   - Check http://localhost:5000/environment-status
   - Verify functionality regularly
   - Monitor logs and performance

---

## Emergency Contacts & Support

- **UAT Issues**: Use TEST-001/demo123 or create new test account
- **Production Issues**: Contact system administrator
- **Deployment Issues**: Review DEPLOYMENT_GUIDE.md
- **Environment Status**: Always check status dashboard first