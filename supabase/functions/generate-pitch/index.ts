// supabase/functions/generate-pitch/index.ts
// deno-lint-ignore-file no-unversioned-import
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

type Channel = 'email' | 'instagram' | 'tiktok' | 'x'
interface AthleteProfileRow { id?: string; full_name?: string; sport?: string; persona_summary?: string; traits?: string[]|string|null; interests?: string[]|string|null; socials?: Record<string,unknown>|string|null }
interface ProfileFallback { id?: string; full_name?: string|null; email?: string|null }
interface BusinessRow { id?: string; name?: string; category?: string; city?: string; brand_tone?: string|null; campaign_goals?: string|null }
interface MatchRow { business_place_id?: string; name?: string; category?: string; address?: string|null }
interface PitchDraftRow { id: string; athlete_id: string; business_id: string|null; channel: Channel; draft: string; status: 'draft'|'sent'; created_at: string; updated_at: string }
interface OpenAIResponse { choices?: { message?: { content?: string } }[]; error?: { message?: string } }

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const SUPABASE_URL =
  Deno.env.get('PROJECT_SUPABASE_URL') ||
  Deno.env.get('SUPABASE_URL') ||
  ''
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ||
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
  ''

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-application-name, x-requested-with, accept, origin, referer',
  'Access-Control-Expose-Headers': 'content-type, content-length, x-client-info, x-application-name',
  Vary: 'Origin',
}

function respond(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json', ...CORS_HEADERS, ...(init.headers ?? {}) })
  return new Response(JSON.stringify(body), { ...init, headers })
}
function ok(data: unknown) {
  const obj = typeof data === 'object' && data !== null ? (data as Record<string,unknown>) : { data }
  return respond({ ok: true, ...obj })
}
function fail(error: string, detail?: unknown, status = 400) { return respond({ ok: false, error, detail }, { status }) }

function sanitizeChannel(v: unknown): Channel {
  const s = String(v || '').toLowerCase().trim()
  if (s === 'dm' || s === 'direct') return 'instagram'
  return (['email','instagram','tiktok','x'] as const).includes(s as Channel) ? (s as Channel) : 'email'
}
function asInline(x: unknown): string {
  if (x == null) return ''
  if (typeof x === 'string') return x
  try { return JSON.stringify(x) } catch { return String(x) }
}
function inferCity(address?: string|null, fallback?: string|null): string|undefined {
  if (!address) return (fallback || undefined)
  const parts = address.split(',').map(s=>s.trim())
  const city = parts.find(p=>p && !/\d/.test(p))
  return (city || fallback || '')?.trim() || undefined
}
async function ensureProfileExists(client: SupabaseClient, userId: string, fullName: string) {
  const { data: existing, error: selErr } = await client.from('profiles').select('id').eq('id', userId).maybeSingle()
  if (selErr) throw new Error(`profiles lookup failed: ${selErr.message}`)
  if (existing?.id) return
  const { error: insErr } = await client.from('profiles').insert({ id: userId, full_name: fullName }).single()
  if (insErr && !/duplicate|unique/i.test(insErr.message)) throw new Error(`profiles insert failed: ${insErr.message}`)
}
function str(x: unknown | null | undefined) { const s = (x ?? '').toString().trim(); return s.length ? s : undefined }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: new Headers(CORS_HEADERS) })
  if (req.method !== 'POST') return fail('Method not allowed', undefined, 405)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return fail('Missing Supabase env')
  if (!OPENAI_API_KEY) return fail('OPENAI_API_KEY is not set in environment')

  let raw: Record<string, unknown>
  try { raw = await req.json() } catch { return fail('Invalid JSON body') }

  const athlete_id = str(raw.athlete_id) || str((raw as any).athleteId)
  const business_id = str(raw.business_id) || str((raw as any).businessId) || null
  const business_place_id = str(raw.business_place_id) || str((raw as any).businessPlaceId) || null
  const channel = sanitizeChannel((raw.channel ?? (raw as any).contactChannel) as string)
  const payloadName = str(raw.name) || str((raw as any).businessName)
  const payloadCategory = str(raw.category)
  const payloadCity = str(raw.city)
  const payloadAddress = str(raw.address)

  if (!athlete_id) return fail('athlete_id is required')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // ---- Athlete load (soft-fail on athlete_profiles) ----
  let athlete: AthleteProfileRow | null = null

  let aprof: AthleteProfileRow | null = null
  try {
    const res = await supabase
      .from('athlete_profiles')
      .select('id, full_name, sport, persona_summary, traits, interests, socials')
      .eq('id', athlete_id)
      .maybeSingle<AthleteProfileRow>()
    if (res.error) {
      console.warn('athlete_profiles soft error:', res.error.message)
    } else {
      aprof = res.data || null
    }
  } catch (e) {
    console.warn('athlete_profiles soft exception:', (e as Error)?.message)
  }

  if (aprof) {
    athlete = aprof
  } else {
    // ⚠️ Select only columns guaranteed to exist on profiles
    const { data: prof, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', athlete_id)
      .maybeSingle<ProfileFallback>()
    if (pErr) return fail('profiles lookup failed', pErr.message)
    if (prof) {
      athlete = {
        id: prof.id,
        full_name: prof.full_name || 'Student Athlete',
        persona_summary: 'Student-athlete seeking local NIL partnerships.',
        traits: [],
        interests: [],
        socials: { email: prof.email || '' },
      }
    } else {
      athlete = {
        id: athlete_id,
        full_name: 'Student Athlete',
        persona_summary: 'Student-athlete seeking local NIL partnerships.',
        traits: [],
        interests: [],
        socials: {},
      }
    }
  }

  // ---- Business / match lookup ----
  let biz: BusinessRow | null = null
  let matchRow: MatchRow | null = null
  if (business_id) {
    const { data: b, error: bErr } = await supabase.from('businesses')
      .select('id, name, category, city, brand_tone, campaign_goals')
      .eq('id', business_id).maybeSingle<BusinessRow>()
    if (bErr) return fail('businesses lookup failed', bErr.message)
    biz = b || null
  } else if (business_place_id) {
    const { data: m, error: mErr } = await supabase.from('business_matches')
      .select('business_place_id, name, category, address')
      .eq('athlete_id', athlete_id)
      .eq('business_place_id', business_place_id)
      .maybeSingle<MatchRow>()
    if (mErr) return fail('business_matches lookup failed', mErr.message)
    matchRow = m || null
  }

  const composedName = biz?.name || matchRow?.name || payloadName || 'Local Business'
  const composedCategory = biz?.category || matchRow?.category || payloadCategory || 'local'
  const composedCity = biz?.city || payloadCity || inferCity(matchRow?.address || payloadAddress, null) || 'your area'

  const system = 'You write brief NIL outreach pitches for student athletes. Keep it friendly, specific, and under 120 words for social; under 180 for email.'
  const user = `
Athlete: ${athlete?.full_name || 'Student Athlete'} (${athlete?.sport || 'N/A'})
Persona: ${athlete?.persona_summary || 'N/A'}
Traits: ${asInline(athlete?.traits)}
Interests: ${asInline(athlete?.interests)}
Socials: ${asInline(athlete?.socials)}

Business: ${composedName} (${composedCategory}) in ${composedCity}
Tone: ${(biz?.brand_tone || 'friendly and professional')}
Goals: ${(biz?.campaign_goals || 'awareness and foot traffic')}

Channel: ${channel}
Return JSON with: {subject?, body, cta}.
`.trim()

  // ---- OpenAI call ----
  let content = ''
  try {
    const oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })
    const oaJson: OpenAIResponse = await oaRes.json()
    if (!oaRes.ok || oaJson?.error) return fail('OpenAI error', oaJson?.error?.message || (oaJson as unknown))
    content = oaJson.choices?.[0]?.message?.content || ''
    if (!content) return fail('OpenAI returned no content')
  } catch (e) {
    return fail('OpenAI request failed', (e as Error)?.message)
  }

  let draftObj: { subject?: string; body?: string; cta?: string }
  try { draftObj = JSON.parse(content) } catch { draftObj = { body: content } }

  const subject = (draftObj.subject || 'Quick NIL idea').trim()
  const pitchBody = (draftObj.body || '').trim()
  const cta = (draftObj.cta || '').trim()
  const draft = channel === 'email'
    ? `Subject: ${subject}\n\n${pitchBody}\n\n${cta}`
    : [pitchBody, cta].filter(Boolean).join('\n\n')

  // Ensure profiles FK exists, then save
  try { await ensureProfileExists(supabase, athlete_id, athlete?.full_name || 'Student Athlete') }
  catch (e) { return fail('Failed to ensure profiles row exists', (e as Error)?.message) }

  const { data: saved, error: insErr } = await supabase
    .from('pitch_drafts')
    .insert({ athlete_id, business_id, channel, draft, status: 'draft' } as Partial<PitchDraftRow>)
    .select()
    .maybeSingle<PitchDraftRow>()
  if (insErr) return fail('Failed to save draft', insErr.message)

  return ok({
    id: saved?.id || null,
    draft: saved?.draft ?? draft,
    channel,
    business_id,
    business_place_id,
  })
})
