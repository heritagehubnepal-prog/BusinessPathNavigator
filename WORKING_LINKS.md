# 🍄 WORKING LINKS - Mycopath Environment Access

## CURRENT ACTIVE ENVIRONMENT: UAT

### 🧪 UAT Environment (LIVE NOW)
**Main Application**: https://d8da8a8d-960e-4d64-88d8-44d2a6a46140-00-1xk929ofiiwtg.kirk.replit.dev

**Environment Dashboard**: https://d8da8a8d-960e-4d64-88d8-44d2a6a46140-00-1xk929ofiiwtg.kirk.replit.dev/environment-status

**API Status**: https://d8da8a8d-960e-4d64-88d8-44d2a6a46140-00-1xk929ofiiwtg.kirk.replit.dev/api/environment

### TEST CREDENTIALS (WORKING NOW)
```
Employee ID: TEST-001
Password: demo123
```

### QUICK TEST
1. Click: https://d8da8a8d-960e-4d64-88d8-44d2a6a46140-00-1xk929ofiiwtg.kirk.replit.dev
2. Click "Login" 
3. Enter: TEST-001 / demo123
4. Access full system immediately (auto-approved)

---

## FEATURES CURRENTLY ACTIVE

✅ **Email Verification**: DISABLED (UAT Mode)  
✅ **Admin Approval**: AUTO-APPROVE (Immediate Access)  
✅ **Storage**: IN-MEMORY (Test Data)  
✅ **Debug Mode**: ENABLED  
✅ **Session**: 24 HOURS  

---

## TO SWITCH TO PRODUCTION ENVIRONMENT

Run this command:
```bash
ENVIRONMENT_TYPE=production npm run start
```

This will enable:
- Email verification required
- Administrator approval mandatory
- PostgreSQL database storage
- 8-hour sessions
- Production security settings

---

## CURRENT STATUS VERIFICATION

Environment API Response:
```json
{
  "name": "UAT",
  "displayName": "User Acceptance Testing Environment",
  "features": {
    "emailVerification": false,
    "adminApproval": false,
    "autoApprove": true,
    "storage": "memory"
  }
}
```

**STATUS**: ✅ WORKING AND ACCESSIBLE NOW