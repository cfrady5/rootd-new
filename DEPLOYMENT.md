# Supabase Edge Functions Deployment Guide

## Quick Deploy (One Command)

Run this from the project root:

```bash
./deploy-functions.sh
```

The script will:
1. Check if Supabase CLI is installed (install if needed)
2. Prompt for login if not authenticated
3. Ask for your Project Reference ID
4. Deploy both functions

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Install Supabase CLI (if needed)

```bash
brew install supabase/tap/supabase
```

### 2. Login

```bash
supabase login
```

### 3. Set your project reference

Find this in your Supabase Dashboard → Settings → General

```bash
export PROJECT_REF=your-project-ref-here
```

### 4. Deploy functions

```bash
# Deploy find-businesses (no JWT verification for this function)
supabase functions deploy find-businesses --project-ref $PROJECT_REF --no-verify-jwt

# Deploy process-quiz (requires JWT)
supabase functions deploy process-quiz --project-ref $PROJECT_REF
```

### 5. Set required secrets

In your Supabase Dashboard → Settings → Edge Functions → Secrets, add:

**Required:**
- `PROJECT_SUPABASE_URL` or `SUPABASE_URL` → Your project URL (e.g., `https://abcd1234.supabase.co`)
- `PROJECT_SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` → Your service role key

**Optional (for real distance data):**
- `GOOGLE_MAPS_API_KEY` → Your Google Maps API key

Or set via CLI:

```bash
supabase secrets set --project-ref $PROJECT_REF \
  PROJECT_SUPABASE_URL="https://your-project.supabase.co" \
  PROJECT_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  GOOGLE_MAPS_API_KEY="your-google-api-key"
```

## Verify Deployment

```bash
# List deployed functions
supabase functions list --project-ref $PROJECT_REF

# Test find-businesses
supabase functions invoke find-businesses --project-ref $PROJECT_REF --no-verify-jwt \
  --body '{"lat":37.7749,"lng":-122.4194,"radiusMiles":5,"topics":["coffee"]}'
```

## After Deployment

1. **Run SQL migrations** in Supabase SQL Editor:
   - `supabase/sql/init_tables.sql`
   - `supabase/sql/add_saved_column.sql`
   - `supabase/sql/rls_and_realtime_business_matches.sql`

2. **Test in your app:**
   - Click "Find New Matches"
   - You should see matches with distances populate

## Troubleshooting

**No matches showing:**
- Check secrets are set correctly
- Verify RLS policies are applied
- Run: `SELECT count(*) FROM public.business_matches WHERE athlete_id = 'your-user-id';`

**Distance shows N/A:**
- Verify `GOOGLE_MAPS_API_KEY` is set (or check mock data includes distance)
- Check function logs in Supabase Dashboard → Edge Functions → Logs

**Deployment fails:**
- Ensure you're logged in: `supabase login`
- Verify project ref is correct
- Check you have deployment permissions for the project
