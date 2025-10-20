// Supabase Edge Function for Instagram API calls
// This keeps sensitive API keys secure on the server

import { serve } from "std/http/server.ts"
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  action: string;
  code?: string;
  platform?: string;
  accessToken?: string;
  instagramBusinessAccountId?: string;
}

interface MediaPost {
  like_count?: number;
  comments_count?: number;
}

interface InstagramProfile {
  id: string;
  username: string;
  account_type?: string;
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
  biography?: string;
  name?: string;
  profile_picture_url?: string;
  website?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, code, platform, accessToken, instagramBusinessAccountId }: RequestBody = await req.json()

    switch (action) {
      case 'exchange_token': {
        // Exchange Instagram code for access token
        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: Deno.env.get('INSTAGRAM_CLIENT_ID')!,
            client_secret: Deno.env.get('INSTAGRAM_CLIENT_SECRET')!,
            grant_type: 'authorization_code',
            redirect_uri: `${Deno.env.get('FRONTEND_URL')}/auth/instagram/callback`,
            code: code!
          })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(tokenData.error_description || 'Token exchange failed');
        }

        return new Response(
          JSON.stringify({ access_token: tokenData.access_token }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'fetch_profile': {
        let profileData: InstagramProfile;
        
        if (platform === 'instagram_business') {
          // Use Graph API for business accounts
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}?fields=biography,id,ig_id,followers_count,follows_count,media_count,name,profile_picture_url,username,website&access_token=${accessToken}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch Instagram business profile');
          }
          
          profileData = await response.json();
        } else {
          // Use Basic Display API for personal accounts
          const response = await fetch(
            `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch Instagram profile');
          }
          
          profileData = await response.json();
        }

        // Calculate engagement rate for business accounts
        let engagementRate = 0;
        if (platform === 'instagram_business' && profileData.followers_count && profileData.followers_count > 0) {
          try {
            const mediaResponse = await fetch(
              `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}/media?fields=like_count,comments_count&limit=10&access_token=${accessToken}`
            );
            
            const mediaData = await mediaResponse.json();
            
            if (mediaData.data && mediaData.data.length > 0) {
              const totalEngagement = mediaData.data.reduce((sum: number, post: MediaPost) => {
                return sum + (post.like_count || 0) + (post.comments_count || 0);
              }, 0);
              
              const averageEngagement = totalEngagement / mediaData.data.length;
              engagementRate = (averageEngagement / profileData.followers_count) * 100;
            }
          } catch (error) {
            console.error('Engagement calculation error:', error);
          }
        }

        // Update or insert social record
        const socialData = {
          user_id: user.id,
          platform: platform!,
          username: profileData.username,
          followers: profileData.followers_count || 0,
          following: profileData.follows_count || 0,
          posts: profileData.media_count || 0,
          engagement_rate: Math.round(engagementRate * 100) / 100,
          last_refreshed: new Date().toISOString()
        };

        const { error } = await supabaseClient
          .from('socials')
          .upsert(socialData, { 
            onConflict: 'user_id,platform' 
          });

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, data: socialData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})