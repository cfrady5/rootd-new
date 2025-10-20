// Instagram Graph API - For business/creator accounts
// This provides access to follower_count and insights

export class InstagramGraphService {
  // For business accounts - provides follower_count
  static async getBusinessProfile(accessToken, instagramBusinessAccountId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}?fields=biography,id,ig_id,followers_count,follows_count,media_count,name,profile_picture_url,username,website&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Instagram business profile');
      }

      const profile = await response.json();
      return {
        id: profile.id,
        username: profile.username,
        name: profile.name,
        biography: profile.biography,
        followers_count: profile.followers_count,
        follows_count: profile.follows_count,
        media_count: profile.media_count,
        profile_picture_url: profile.profile_picture_url,
        website: profile.website
      };
    } catch (error) {
      console.error('Instagram Graph API error:', error);
      throw error;
    }
  }

  // Get insights for engagement rate calculation
  static async getAccountInsights(accessToken, instagramBusinessAccountId, period = 'day') {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}/insights?metric=impressions,reach,profile_views&period=${period}&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Instagram insights');
      }

      return await response.json();
    } catch (error) {
      console.error('Instagram insights error:', error);
      throw error;
    }
  }

  // Calculate engagement rate from recent posts
  static async calculateEngagementRate(accessToken, instagramBusinessAccountId) {
    try {
      // Get recent media
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}/media?fields=like_count,comments_count&limit=10&access_token=${accessToken}`
      );

      const mediaData = await mediaResponse.json();
      
      // Get follower count
      const profileData = await this.getBusinessProfile(accessToken, instagramBusinessAccountId);
      
      if (!mediaData.data || mediaData.data.length === 0) {
        return 0;
      }

      // Calculate average engagement
      const totalEngagement = mediaData.data.reduce((sum, post) => {
        return sum + (post.like_count || 0) + (post.comments_count || 0);
      }, 0);

      const averageEngagement = totalEngagement / mediaData.data.length;
      const engagementRate = (averageEngagement / profileData.followers_count) * 100;

      return Math.round(engagementRate * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Engagement rate calculation error:', error);
      return 0;
    }
  }
}

export default InstagramGraphService;