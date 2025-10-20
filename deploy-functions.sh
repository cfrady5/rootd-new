#!/bin/bash
# Deploy Supabase Edge Functions
# Usage: ./deploy-functions.sh

set -e

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please log in to Supabase..."
    supabase login
fi

# Get project ref from environment or prompt
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "📋 Enter your Supabase Project Reference ID (found in Dashboard → Settings → General):"
    read -r PROJECT_REF
else
    PROJECT_REF="$SUPABASE_PROJECT_REF"
fi

echo ""
echo "Deploying to project: $PROJECT_REF"
echo ""

# Deploy find-businesses
echo "📦 Deploying find-businesses..."
supabase functions deploy find-businesses --project-ref "$PROJECT_REF" --no-verify-jwt

echo ""
echo "📦 Deploying process-quiz..."
supabase functions deploy process-quiz --project-ref "$PROJECT_REF"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify secrets are set in your Supabase dashboard (Settings → Edge Functions → Secrets):"
echo "   - PROJECT_SUPABASE_URL or SUPABASE_URL"
echo "   - PROJECT_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY"
echo "   - GOOGLE_MAPS_API_KEY (optional, for real distance data)"
echo ""
echo "2. Run the SQL migrations in your Supabase SQL Editor:"
echo "   - supabase/sql/init_tables.sql"
echo "   - supabase/sql/add_saved_column.sql"
echo "   - supabase/sql/rls_and_realtime_business_matches.sql"
echo ""
echo "3. Test by clicking 'Find New Matches' in your app"
echo ""
