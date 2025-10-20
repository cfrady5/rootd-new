// Instagram Basic Display API Integration
// This handles OAuth flow and fetching real follower data

const INSTAGRAM_CONFIG = {
  clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
  clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET, // Keep this on server only
  redirectUri: `${window.location.origin}/auth/instagram/callback`,
  scope: 'user_profile,user_media'
};

export class InstagramService {
  // Step 1: Generate Instagram OAuth URL
  static getAuthUrl() {
    const params = new URLSearchParams({
      client_id: INSTAGRAM_CONFIG.clientId,
      redirect_uri: INSTAGRAM_CONFIG.redirectUri,
      scope: INSTAGRAM_CONFIG.scope,
      response_type: 'code'
    });
    
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  // Step 2: Exchange code for access token (should be done on server)
  static async exchangeCodeForToken(code) {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_CONFIG.clientId,
          client_secret: INSTAGRAM_CONFIG.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: INSTAGRAM_CONFIG.redirectUri,
          code: code
        })
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Instagram token exchange error:', error);
      throw error;
    }
  }

  // Step 3: Get user profile data including follower count
  static async getUserProfile(accessToken) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Instagram profile');
      }

      const profile = await response.json();
      
      // Note: Instagram Basic Display API doesn't provide follower count directly
      // You'll need Instagram Graph API (business accounts) for follower_count
      return {
        id: profile.id,
        username: profile.username,
        account_type: profile.account_type,
        media_count: profile.media_count,
        // followers: Not available in Basic Display API
      };
    } catch (error) {
      console.error('Instagram profile fetch error:', error);
      throw error;
    }
  }

  // Step 4: Get media and engagement data
  static async getUserMedia(accessToken) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Instagram media');
      }

      return await response.json();
    } catch (error) {
      console.error('Instagram media fetch error:', error);
      throw error;
    }
  }
}

export default InstagramService;