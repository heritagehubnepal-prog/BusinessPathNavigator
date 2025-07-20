#!/bin/bash

# Production Environment Deployment Script
echo "🏭 Deploying to PRODUCTION Environment..."

# Set environment variables for Production
export ENVIRONMENT_TYPE=production
export NODE_ENV=production
export EMAIL_VERIFICATION_ENABLED=true
export ADMIN_APPROVAL_REQUIRED=true
export STORAGE_TYPE=database

# Production specific settings
export DEBUG=false
export LOG_LEVEL=error
export SESSION_TIMEOUT=28800000  # 8 hours

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Running database migrations..."
npm run db:push

echo "🔧 Production Configuration:"
echo "  - Email Verification: ENABLED"
echo "  - Admin Approval: REQUIRED"
echo "  - Storage: PostgreSQL Database"
echo "  - Debug Mode: DISABLED"
echo "  - Session Timeout: 8 hours"

echo "🚀 Starting Production server..."
npm run build
npm start

echo "✅ Production Environment deployed successfully!"
echo "🌐 Access Production at: https://mycopath.replit.app"
echo "⚠️  Administrator approval required for new registrations"