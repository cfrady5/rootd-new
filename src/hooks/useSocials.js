import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthProvider';

export function useSocials() {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { session } = useAuth() || {};

  useEffect(()=>{ 
    let m=true; 
    (async ()=>{ 
      try{ 
        const { data, error } = await supabase
          .from('socials')
          .select('*')
          .eq('user_id', session?.user?.id); 
        
        if (error) {
          // If table doesn't exist, create sample data
          console.log('Socials table error (may not exist yet):', error);
          if (m) setSocials([]);
        } else {
          if (m) setSocials(data || []);
        }
      }catch(e){
        console.error(e);
        if (m) setSocials([]);
      } 
      if(m) setLoading(false); 
    })(); 
    return ()=>m=false; 
  },[session?.user?.id]);

  // Instagram OAuth flow
  async function connectInstagram(accountType = 'personal') {
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
    
    setConnecting(true);
    try {
      // Check if Instagram is already connected
      const existing = socials.find(s => s.platform === 'instagram');
      if (existing) {
        setConnecting(false);
        return { success: false, error: 'Instagram is already connected' };
      }

      // Redirect to Instagram OAuth
      const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
      if (!clientId) {
        throw new Error('Instagram Client ID not configured');
      }

      const redirectUri = `${window.location.origin}/auth/instagram/callback`;
      const scope = accountType === 'business' 
        ? 'instagram_basic,instagram_manage_insights,pages_read_engagement'
        : 'user_profile,user_media';

      const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scope}&` +
        `response_type=code`;

      // Store the account type for after the callback
      localStorage.setItem('instagram_account_type', accountType);
      
      // Redirect to Instagram
      window.location.href = authUrl;
      
      return { success: true };
    } catch (error) {
      console.error('Instagram OAuth error:', error);
      setConnecting(false);
      return { success: false, error: error.message };
    }
  }

  // Handle Instagram OAuth callback
  async function handleInstagramCallback(code) {
    if (!session?.user?.id || !code) return { success: false, error: 'Invalid callback' };
    
    setConnecting(true);
    try {
      const accountType = localStorage.getItem('instagram_account_type') || 'personal';
      localStorage.removeItem('instagram_account_type');

      // Get access token from our secure backend function
      const { data: { session: userSession } } = await supabase.auth.getSession();
      if (!userSession) throw new Error('No session');

      const response = await supabase.functions.invoke('instagram-integration', {
        body: {
          action: 'exchange_token',
          code: code
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Token exchange failed');
      }

      const accessToken = response.data.access_token;

      // Fetch profile data and save to database
      const profileResponse = await supabase.functions.invoke('instagram-integration', {
        body: {
          action: 'fetch_profile',
          platform: accountType === 'business' ? 'instagram_business' : 'instagram',
          accessToken: accessToken,
          instagramBusinessAccountId: accountType === 'business' ? 'YOUR_BUSINESS_ACCOUNT_ID' : undefined
        }
      });

      if (profileResponse.error) {
        throw new Error(profileResponse.error.message || 'Profile fetch failed');
      }

      // Update local state
      setSocials(prev => [...prev, profileResponse.data.data]);
      setConnecting(false);

      return { success: true };
    } catch (error) {
      console.error('Instagram callback error:', error);
      setConnecting(false);
      return { success: false, error: error.message };
    }
  }

  async function connectSocial(platform, username) {
    if (!session?.user?.id || !platform || !username) return;
    
    // For Instagram, use OAuth flow instead
    if (platform.toLowerCase() === 'instagram') {
      return await connectInstagram('personal');
    }
    
    setConnecting(true);
    try {
      // Check if platform already exists
      const existing = socials.find(s => s.platform === platform);
      if (existing) {
        throw new Error(`${platform} is already connected`);
      }

      // Try to insert new social connection
      const { data, error } = await supabase
        .from('socials')
        .insert({
          user_id: session.user.id,
          platform: platform.toLowerCase(),
          username: username,
          followers: 0, // Start with 0, will be updated when they sync data
          following: 0,
          posts: 0,
          connected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, simulate successful connection with local data
        if (error.code === '42P01') { // Table doesn't exist
          const mockData = {
            id: `mock_${Date.now()}`,
            user_id: session.user.id,
            platform: platform.toLowerCase(),
            username: username,
            followers: 0, // Start with 0 for new connections
            following: 0,
            posts: 0,
            connected_at: new Date().toISOString()
          };
          setSocials(prev => [...prev, mockData]);
          return { success: true };
        }
        throw error;
      }

      // Add to local state
      setSocials(prev => [...prev, data]);

      return { success: true };
    } catch (error) {
      console.error('Connect social error:', error);
      return { success: false, error: error.message };
    } finally {
      setConnecting(false);
    }
  }

  async function disconnectSocial(socialId) {
    try {
      const { error } = await supabase
        .from('socials')
        .delete()
        .eq('id', socialId);

      if (error) throw error;

      setSocials(prev => prev.filter(s => s.id !== socialId));
      return { success: true };
    } catch (error) {
      console.error('Disconnect social error:', error);
      return { success: false, error: error.message };
    }
  }

  async function refreshSocial(platform){
    console.log('event: social_refresh', platform);
    
    // Find the social account to refresh
    const socialAccount = socials.find(s => s.platform === platform);
    if (!socialAccount) return;

    // Mark as refreshing in UI
    const updated = socials.map(s => s.platform === platform ? {...s, refreshing: true} : s);
    setSocials(updated);
    
    try {
      // For Instagram, fetch fresh data from API
      if (platform === 'instagram' || platform === 'instagram_business') {
        // This would require stored access tokens - implement token refresh logic here
        console.log('Refreshing Instagram data...');
        
        // For now, just update the timestamp
        const { error } = await supabase
          .from('socials')
          .update({ 
            last_refreshed: new Date().toISOString()
          })
          .eq('id', socialAccount.id);

        if (error) {
          console.log('Could not update refresh timestamp:', error);
        }
      } else {
        // Update the last_refreshed timestamp in database for other platforms
        const { error } = await supabase
          .from('socials')
          .update({ 
            last_refreshed: new Date().toISOString()
          })
          .eq('id', socialAccount.id);

        if (error) {
          console.log('Could not update refresh timestamp:', error);
        }
      }

      // Remove refreshing state
      setSocials(socials.map(s => s.platform === platform ? {...s, refreshing: false} : s));
      
    } catch(e) { 
      console.error('Refresh error:', e); 
      setSocials(socials.map(s => s.platform === platform ? {...s, refreshing: false} : s)); 
    }
  }

  return { 
    socials, 
    loading, 
    connecting, 
    refreshSocial, 
    connectSocial, 
    disconnectSocial,
    connectInstagram,
    handleInstagramCallback
  };
}

export default useSocials;
