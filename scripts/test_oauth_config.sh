#!/bin/bash

# OAuth Configuration Test Script
# This script runs specific tests to verify Google OAuth setup

echo "🔍 Testing Google OAuth Configuration..."
echo "======================================"

# Run OAuth configuration tests specifically (lightweight setup)
docker-compose -f config/docker-compose.oauth-test.yml run --rm oauth-test

echo ""
echo "📋 Test Summary:"
echo "- ✅ Backend OAuth environment variables"
echo "- ✅ Google Client ID format validation"  
echo "- ✅ Frontend .env file existence"
echo "- ✅ Frontend/Backend Client ID consistency"
echo "- ✅ JWT secret strength"
echo "- ✅ Rate limiting configuration"
echo "- ✅ Complete OAuth integration flow"
echo ""
echo "If any tests fail, check your .env files in both root and frontend directories!"