// supabase/functions/process-quiz/index.ts
// Uses PROJECT_SUPABASE_URL / PROJECT_SUPABASE_SERVICE_ROLE_KEY
// Does NOT select lat/lng (or preferred_radius_miles) from quiz_responses.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

type UUID = string & { __brand: 'uuid' }

type RequestPayload = {
  athleteId?: string | null
  quizResponseId?: string | null
  lat?: number | null
  lng?: number | null
  radiusMiles?: number | null
}

type QuizResponseRow = {
  id: string
  user_id: string
  answers: unknown
  created_at: string
}

type MatchInsert = {
  user_id: UUID
  business_place_id: string
  name?: string | null
  category?: string | null
  address?: string | null
  website?: string | null
  phone?: string | null
  reason?: string | null
}

type GoogleNearbyResult = {
  place_id: string
  name?: string
  types?: string[]
  business_status?: string
  vicinity?: string
}

type GoogleDetailsResult = {
  place_id?: string
  name?: string
  website?: string
  formatted_phone_number?: string
  international_phone_number?: string
  url?: string
  business_status?: string
}

type OpenAIResp = {
  choices?: { message?: { content?: string } }[]
  error?: { message?: string }
}

/* ---------- Env & CORS ---------- */
const SUPABASE_URL = Deno.env.get('PROJECT_SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || ''
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || ''

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, apikey, content-type, x-client-info, x-application-name, x-requested-with, accept, origin, referer',
  Vary: 'Origin',
}

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json', ...CORS_HEADERS })
  return new Response(JSON.stringify(body), { ...init, headers })
}
function ok(payload: unknown) {
  const obj = (typeof payload === 'object' && payload !== null) ? (payload as Record<string, unknown>) : { payload }
  return json({ ok: true, ...obj })
}
function fail(error: string, detail?: unknown, status = 400) {
  return json({ ok: false, error, detail }, { status })
}

/* ---------- Utils ---------- */
function milesToMeters(mi: number) { return Math.max(100, Math.round(mi * 1609.344)) }
function uniqBy<T>(arr: T[], key: (t: T) => string) {
  const out: T[] = []; const seen = new Set<string>()
  for (const item of arr) { const k = key(item); if (seen.has(k)) continue; seen.add(k); out.push(item) }
  return out
}
function toReasonFromTypes(types?: string[]) {
  if (!types?.length) return 'Nearby match'
  const readable = types.slice(0, 2).map((t) => t.replace(/_/g, ' ')).join(' / ')
  return `Nearby: ${readable}`
}
function normPhone(p?: string | null) { if (!p) return null; const d = p.replace(/[^\d+]/g, ''); return d || null }

/* ---------- Google ---------- */
async function fetchNearby(lat: number, lng: number, radiusMeters: number) {
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_KEY}` +
    `&location=${lat},${lng}&radius=${radiusMeters}&opennow=false&rankby=prominence`
  const res = await fetch(url)
  const jsonData = await res.json() as { status?: string; results?: GoogleNearbyResult[]; error_message?: string }
  if (!res.ok || (jsonData.status && jsonData.status !== 'OK')) {
    throw new Error(jsonData.error_message || jsonData.status || 'Google Nearby error')
  }
  return jsonData.results || []
}

async function fetchPlaceDetails(placeId: string) {
  const fields = [
    'place_id','name','website','formatted_phone_number','international_phone_number','url','business_status',
  ].join(',')
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json?key=${GOOGLE_KEY}` +
    `&place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}`
  const res = await fetch(url)
  const jsonData = await res.json() as { status?: string; result?: GoogleDetailsResult; error_message?: string }
  if (!res.ok || (jsonData.status && jsonData.status !== 'OK')) {
    throw new Error(jsonData.error_message || jsonData.status || 'Google Details error')
  }
  return jsonData.result || {}
}

/* ---------- Optional Persona (best-effort) ---------- */
async function generatePersona(answers: unknown) {
  if (!OPENAI_KEY) {
    return { summary: 'Student-athlete seeking local NIL partnerships.', traits: [] as string[], interests: [] as string[], categories: [] as string[] }
  }
  const sys = 'You analyze a student-athlete’s quiz answers to generate a concise NIL persona: summary (<=60 words), 5 traits, 5 interests, and 5 suggested local business categories.'
  const user = `Quiz Answers (JSON):\n${JSON.stringify(answers)}\n\nReturn JSON with keys: summary, traits[], interests[], categories[]`

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    }),
  })
  const data = await resp.json() as OpenAIResp
  if (!resp.ok || data?.error) throw new Error(data?.error?.message || 'OpenAI error')
  const content = data.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(content) as { summary?: string; traits?: string[]; interests?: string[]; categories?: string[] }
    return {
      summary: parsed.summary || 'Student-athlete seeking local NIL partnerships.',
      traits: parsed.traits || [],
      interests: parsed.interests || [],
      categories: parsed.categories || [],
    }
  } catch {
    return { summary: 'Student-athlete seeking local NIL partnerships.', traits: [], interests: [], categories: [] }
  }
}

async function tryUpsertPersona(sb: SupabaseClient, userId: UUID, persona: { summary: string; traits: string[]; interests: string[]; categories: string[] }) {
  try {
    const { error } = await sb.from('athlete_profiles').upsert({
      id: userId,
      persona_summary: persona.summary,
      traits: persona.traits,
      interests: persona.interests,
      categories: persona.categories,
    }, { onConflict: 'id' })
    if (error && !/relation .* does not exist/i.test(error.message)) {
      console.warn('[process-quiz] athlete_profiles upsert warning:', error.message)
    }
  } catch (e) {
    console.warn('[process-quiz] athlete_profiles upsert skipped:', (e as Error)?.message)
  }
}

/* ---------- Handler ---------- */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: new Headers(CORS_HEADERS) })
  if (req.method !== 'POST') return fail('Method not allowed', undefined, 405)

  if (!SUPABASE_URL || !SERVICE_ROLE) return fail('Missing Supabase env')
  if (!GOOGLE_KEY) return fail('Missing GOOGLE_MAPS_API_KEY')

  let payload: RequestPayload
  try { payload = await req.json() } catch { return fail('Invalid JSON body') }

  const userId = (payload.athleteId || '').trim() as UUID
  const quizResponseId = (payload.quizResponseId || '').trim() || null
  const centerLat = typeof payload.lat === 'number' ? payload.lat : null
  const centerLng = typeof payload.lng === 'number' ? payload.lng : null
  const radiusMiles = typeof payload.radiusMiles === 'number' && payload.radiusMiles ? payload.radiusMiles : 10

  if (!userId) return fail('athleteId (user id) is required')

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

  // Load quiz response (only stable columns)
  let quizRow: QuizResponseRow | null = null
  if (quizResponseId) {
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('id, user_id, answers, created_at')
      .eq('id', quizResponseId)
      .maybeSingle<QuizResponseRow>()
    if (error) return fail('Failed to load quiz response (by id)', error.message)
    if (!data) return fail('Quiz response not found')
    quizRow = data
  } else {
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('id, user_id, answers, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<QuizResponseRow>()
    if (error) return fail('Failed to load latest quiz response', error.message)
    if (!data) return fail('No quiz responses found for user')
    quizRow = data
  }

  // Persona (best-effort)
  try {
    const persona = await generatePersona(quizRow.answers)
    await tryUpsertPersona(supabase, userId, persona)
  } catch (e) {
    console.warn('[process-quiz] persona generation failed:', (e as Error)?.message)
  }

  // Require client-provided geolocation
  if (centerLat == null || centerLng == null) {
    return ok({ matches_inserted: 0, note: 'No geolocation provided; skipping nearby search.' })
  }
  const radius = milesToMeters(radiusMiles)

  // Nearby search
  let nearby: GoogleNearbyResult[] = []
  try { nearby = await fetchNearby(centerLat, centerLng, radius) }
  catch (e) { return fail('Google Nearby failed', (e as Error)?.message) }

  // Details + prepare inserts
  const inserts: MatchInsert[] = []
  for (const r of nearby.slice(0, 30)) {
    if (r.business_status && r.business_status.toUpperCase().includes('CLOSED')) continue

    let details: GoogleDetailsResult = {}
    try { details = await fetchPlaceDetails(r.place_id) }
    catch (e) { console.warn('[process-quiz] details failed for', r.place_id, (e as Error)?.message) }

    const website = (details.website || null) as string | null
    const phone = normPhone(details.formatted_phone_number || details.international_phone_number || null)

    inserts.push({
      user_id: userId,
      business_place_id: r.place_id,
      name: r.name || details.name || null,
      category: (r.types && r.types[0]) || null,
      address: r.vicinity || null,
      website,
      phone,
      reason: toReasonFromTypes(r.types),
    })
  }

  const rows = uniqBy(inserts, (x) => x.business_place_id)

  // Dedup against existing business_matches
  const toInsert: MatchInsert[] = []
  if (rows.length) {
    const placeIds = rows.map((r) => r.business_place_id)
    const { data: existing, error: existErr } = await supabase
      .from('business_matches')
      .select('business_place_id')
      .eq('user_id', userId)
      .in('business_place_id', placeIds)
    if (existErr) {
      console.warn('[process-quiz] existing check failed:', existErr.message)
      toInsert.push(...rows)
    } else {
      const existingSet = new Set((existing || []).map((e: { business_place_id: string }) => e.business_place_id))
      for (const r of rows) if (!existingSet.has(r.business_place_id)) toInsert.push(r)
    }
  }

  // Insert
  let inserted = 0
  if (toInsert.length) {
    const chunkSize = 100
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize)
      const { error: insErr } = await supabase.from('business_matches').insert(chunk)
      if (insErr) { console.warn('[process-quiz] insert chunk failed:', insErr.message) } else { inserted += chunk.length }
    }
  }

  return ok({
    matches_inserted: inserted,
    searched: nearby.length,
    radius_meters: radius,
    radius_miles: radiusMiles,
    used_center: { lat: centerLat, lng: centerLng },
  })
})
