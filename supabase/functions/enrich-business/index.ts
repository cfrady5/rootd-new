// supabase/functions/enrich-business/index.ts
// deno-lint-ignore-file no-unversioned-import
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

type Json = Record<string, unknown>
type MatchRow = {
  user_id?: string // some projects use user_id; keep optional
  athlete_id?: string // legacy name in some codepaths
  business_place_id: string
  name?: string | null
  category?: string | null
  address?: string | null
  website?: string | null
  phone?: string | null
}
type BizRow = {
  id?: string
  name?: string | null
  category?: string | null
  city?: string | null
  website?: string | null
  phone?: string | null
}

// UPDATED: use project-scoped secret names
const SUPABASE_URL = Deno.env.get('PROJECT_SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!

// Plain object to avoid TS2698 spreads over non-objects
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, apikey, content-type, x-client-info, x-application-name, x-requested-with, accept, origin, referer',
  Vary: 'Origin',
}

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json', ...CORS_HEADERS })
  return new Response(JSON.stringify(body), { ...init, headers })
}
function ok(body: unknown) {
  const obj = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : { result: body }
  return json({ ok: true, ...obj })
}
function fail(error: string, detail?: unknown, status = 400) {
  return json({ ok: false, error, detail }, { status })
}

function normalizePhone(p?: string | null) {
  if (!p) return null
  const digits = p.replace(/[^\d+]/g, '')
  return digits || null
}

async function getPlaceDetails(placeId: string) {
  const fields = [
    'place_id',
    'name',
    'website',
    'formatted_phone_number',
    'international_phone_number',
    'url',
    'business_status',
  ].join(',')
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}` +
    `&fields=${encodeURIComponent(fields)}&key=${GOOGLE_KEY}`
  const res = await fetch(url)
  const jsonData = await res.json() as {
    status?: string
    result?: {
      place_id?: string
      name?: string
      website?: string
      formatted_phone_number?: string
      international_phone_number?: string
      url?: string
      business_status?: string
    }
    error_message?: string
  }
  if (!res.ok || (jsonData.status && jsonData.status !== 'OK')) {
    throw new Error(jsonData.error_message || jsonData.status || 'Google Place Details error')
  }
  const r = jsonData.result || {}
  return {
    website: r.website || null,
    phone: normalizePhone(r.formatted_phone_number || r.international_phone_number || null),
    name: r.name || null,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: new Headers(CORS_HEADERS) })
  if (req.method !== 'POST') return fail('Method not allowed', undefined, 405)
  if (!SUPABASE_URL || !SERVICE_ROLE) return fail('Missing Supabase env')
  if (!GOOGLE_KEY) return fail('Missing GOOGLE_MAPS_API_KEY')

  let payload: {
    athlete_id?: string // legacy name
    user_id?: string    // preferred name
    business_place_id?: string
    update_businesses_table?: boolean
    business_id?: string | null
  }
  try { payload = await req.json() } catch { return fail('Invalid JSON body') }

  // Support either athlete_id or user_id (normalize to userId)
  const userId = (payload.user_id || payload.athlete_id || '').trim()
  const business_place_id = (payload.business_place_id || '').trim()
  const updateBusinesses = !!payload.update_businesses_table
  const business_id = payload.business_id || null

  if (!userId) return fail('user_id (or athlete_id) is required')
  if (!business_place_id) return fail('business_place_id is required')

  const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE)

  // Try both possible column names in business_matches for compatibility
  const { data: matchByUser, error: mErr1 } = await supabase
    .from('business_matches').select('*')
    .eq('user_id', userId).eq('business_place_id', business_place_id)
    .maybeSingle<MatchRow>()

  const match: MatchRow | null = matchByUser ?? (await (async () => {
    const { data: alt, error: mErr2 } = await supabase
      .from('business_matches').select('*')
      .eq('athlete_id', userId).eq('business_place_id', business_place_id)
      .maybeSingle<MatchRow>()
    if (mErr1 && !matchByUser && mErr2) return null
    return alt || null
  })())

  if (!match) return fail('Match not found for given user + place_id')

  let details: { website: string | null; phone: string | null; name: string | null }
  try { details = await getPlaceDetails(business_place_id) }
  catch (e) { return fail('Google details fetch failed', (e as Error)?.message) }

  const patch: Partial<MatchRow> = {}
  if (details.website && !match.website) patch.website = details.website
  if (details.phone && !match.phone) patch.phone = details.phone
  if (details.name && !match.name) patch.name = details.name

  if (Object.keys(patch).length) {
    // Update row using whichever PK column exists
    const q = supabase.from('business_matches').update(patch as Json).eq('business_place_id', business_place_id)
    // try both filters to be safe
    const { error: updErr1 } = await q.eq('user_id', userId)
    if (updErr1) {
      const { error: updErr2 } = await supabase
        .from('business_matches')
        .update(patch as Json)
        .eq('business_place_id', business_place_id)
        .eq('athlete_id', userId)
      if (updErr2) return fail('Failed to update business_matches', `${updErr1.message}; ${updErr2.message}`)
    }
  }

  let updatedBusiness: BizRow | null = null
  if (updateBusinesses && business_id) {
    const { data: bizRow, error: bizSelErr } = await supabase
      .from('businesses').select('id, name, website, phone')
      .eq('id', business_id).maybeSingle<BizRow>()
    if (!bizSelErr && bizRow) {
      const bpatch: Partial<BizRow> = {}
      if (details.website && !bizRow.website) bpatch.website = details.website
      if (details.phone && !bizRow.phone) bpatch.phone = details.phone
      if (Object.keys(bpatch).length) {
        const { data: bSaved, error: bErr } = await supabase
          .from('businesses').update(bpatch as Json)
          .eq('id', business_id).select().maybeSingle<BizRow>()
        if (bErr) return fail('Failed to update businesses', bErr.message)
        updatedBusiness = bSaved || null
      } else {
        updatedBusiness = bizRow
      }
    }
  }

  return ok({ place_details: details, match_update: patch, businesses_update: updatedBusiness })
})
