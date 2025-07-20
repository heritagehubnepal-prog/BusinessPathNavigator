#!/bin/bash

# UAT Environment Deployment Script
echo "🧪 Deploying to UAT Environment..."

# Set environment variables for UAT
export ENVIRONMENT_TYPE=uat
export NODE_ENV=development
export EMAIL_VERIFICATION_ENABLED=false
export ADMIN_APPROVAL_REQUIRED=false
export STORAGE_TYPE=memory

# UAT specific settings
export DEBUG=true
export LOG_LEVEL=verbose
export SESSION_TIMEOUT=86400000  # 24 hours

echo "📦 Installing dependencies..."
npm install

echo "🔧 UAT Configuration:"
echo "  - Email Verification: DISABLED"
echo "  - Admin Approval: DISABLED (Auto-approve)"
echo "  - Storage: In-Memory (resets on restart)"
echo "  - Debug Mode: ENABLED"
echo "  - Session Timeout: 24 hours"

echo "🚀 Starting UAT server..."
npm run dev

echo "✅ UAT Environment deployed successfully!"
echo "🌐 Access UAT at: https://uat-mycopath.replit.app"
echo "🔑 Test Credentials:"
echo "   Employee ID: TEST-001"
echo "   Password: demo123"