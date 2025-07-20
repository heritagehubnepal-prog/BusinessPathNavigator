# Mycopath Environment Deployment Guide

## Overview

This guide explains how to deploy and manage separate UAT and Production environments for the Mycopath mushroom farm management system.

## Environment Links

### 🧪 UAT Environment
- **URL**: https://uat-mycopath.replit.app
- **Purpose**: User Acceptance Testing and Development
- **Status Dashboard**: http://localhost:5000/environment-status

### 🏭 Production Environment  
- **URL**: https://mycopath.replit.app
- **Purpose**: Live Production System
- **Status Dashboard**: http://localhost:5000/environment-status

## Environment Differences

| Feature | UAT | Production |
|---------|-----|------------|
| Email Verification | ❌ Disabled | ✅ Required |
| Admin Approval | ❌ Auto-approve | ✅ Manual approval |
| Storage | 💾 In-Memory | 🗄️ PostgreSQL |
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Session Timeout | 24 hours | 8 hours |
| Data Persistence | ❌ Resets on restart | ✅ Permanent |

## Quick Start Commands

### UAT Deployment
```bash
# Deploy to UAT environment
bash deploy-uat.sh

# Or manually start UAT
ENVIRONMENT_TYPE=uat npm run dev
```

### Production Deployment  
```bash
# Deploy to Production environment
bash deploy-production.sh

# Or manually start Production
ENVIRONMENT_TYPE=production npm run start
```

## Test Credentials

### UAT Environment
- **Employee ID**: TEST-001
- **Password**: demo123
- **Note**: Auto-approved, immediate access

### Production Environment
- **Registration**: Requires administrator approval
- **Email**: Must verify email address
- **Access**: Only after admin approval

## File Management Structure

```
mycopath/
├── environment.config.js         # Environment configuration
├── deploy-uat.sh                # UAT deployment script
├── deploy-production.sh          # Production deployment script
├── environment-status.html       # Status dashboard
├── .replit.uat                   # UAT Replit config
├── .replit.production           # Production Replit config
├── DEPLOYMENT_GUIDE.md          # This guide
└── server/
    └── storage.ts               # Environment-aware storage
```

## Environment Status Monitoring

Access the environment status dashboard at:
- **Local**: http://localhost:5000/environment-status
- **UAT**: https://uat-mycopath.replit.app/environment-status  
- **Production**: https://mycopath.replit.app/environment-status

## Best Practices

1. **Always test in UAT first** before deploying to Production
2. **UAT data resets** on restart - use for testing only
3. **Production data is permanent** - handle with care
4. **Monitor both environments** regularly using status dashboard
5. **Use separate Replit projects** for complete isolation

## Troubleshooting

### UAT Issues
- If UAT won't start: Check environment variables
- If data is missing: Normal - UAT resets on restart
- If login fails: Use TEST-001/demo123 credentials

### Production Issues
- If database errors: Run `npm run db:push`
- If login fails: Check admin approval status
- If email issues: Verify EMAIL_VERIFICATION_ENABLED=true

## Security Notes

- **UAT**: Relaxed security for testing
- **Production**: Full security enabled
- **Never use UAT credentials** in Production
- **Always verify environment** before making changes

## Contact Information

For deployment issues or questions:
- Check the environment status dashboard first
- Review this deployment guide
- Contact system administrator if issues persist