#!/usr/bin/env bash
set -euo pipefail

# --- config ---
URL="https://bwliqcuwtyqfghtjkpsr.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGlxY3V3dHlxZmdodGprcHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDEwNjIsImV4cCI6MjA3NTAxNzA2Mn0.nW1y3ndqG5hDrx2807Dwd0lmii6Vbat1-cfTwqmqPCs"
SERVICE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGlxY3V3dHlxZmdodGprcHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ0MTA2MiwiZXhwIjoyMDc1MDE3MDYyfQ.3Hl4nXys1kJYLl7SJoRF2Dl1EyYgoHanFl6g48YZfng"

echo "URL=$URL"
echo "ANON len=${#ANON}  SERVICE len=${#SERVICE}"

# --- create demo user (idempotent) ---
EMAIL="demo+$(date +%s)@rootd.dev"
PASSWORD='Demo1234!'
curl -sS -X POST "$URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true}" >/dev/null || true

# --- get JWT ---
JWT=$(
  jq -n --arg e "$EMAIL" --arg p "$PASSWORD" '{email:$e,password:$p}' |
  curl -sS -X POST "$URL/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON" -H "Content-Type: application/json" \
    --data-binary @- | jq -r .access_token
)
echo "JWT prefix: ${JWT:0:16}"
if [ "$JWT" = "null" ] || [ -z "$JWT" ]; then echo "Login failed"; exit 1; fi

# --- call process-quiz with location & topics ---
curl -sS -X POST "$URL/functions/v1/process-quiz" \
  -H "Authorization: Bearer $JWT" -H "content-type: application/json" \
  -d '{"answers":{"lat":40.4237,"lng":-86.9212,"preferred_radius_miles":10,"categories":["coffee","gym"],"following":{"ig":12000},"engagement_rate":0.06,"time_commitment":3,"audience_locality":0.7}}' | jq .

# --- verify DB writes (service key) ---
curl -sS "$URL/rest/v1/quiz_responses?select=id,rootd_score,created_at&order=created_at.desc&limit=1" \
  -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" | jq .
curl -sS "$URL/rest/v1/business_matches?select=name,match_score,rootd_biz_score&order=match_score.desc&limit=5" \
  -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" | jq .
