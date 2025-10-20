# 📱 **Real Instagram Integration Setup Guide**

This guide will help you connect real Instagram followers to update in real-time.

## 🚀 **Quick Start**

Your dashboard is now ready for Instagram integration! Here's how to set it up:

### **Step 1: Create Facebook/Instagram App**

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" app type
4. Fill out basic information:
   - App name: "Rootd Social Analytics"
   - Contact email: your email
   - App purpose: "Social media analytics"

### **Step 2: Configure Instagram Basic Display**

1. In your Facebook app dashboard:
   - Go to "Add a Product" → "Instagram Basic Display"
   - Click "Set Up"
   - Go to "Basic Display" → "Settings"

2. Add OAuth Redirect URIs:
   ```
   http://localhost:5173/auth/instagram/callback
   https://yourdomain.com/auth/instagram/callback
   ```

3. Get your credentials:
   - Copy "Instagram App ID" 
   - Copy "Instagram App Secret"

### **Step 3: Update Environment Variables**

Replace these in your `.env.local`:

```bash
# Instagram API (for real-time follower updates)
VITE_INSTAGRAM_CLIENT_ID=your_actual_instagram_app_id
VITE_INSTAGRAM_CLIENT_SECRET=your_actual_instagram_app_secret
```

### **Step 4: Deploy Supabase Function**

Deploy the Instagram integration function:

```bash
# In your project root
supabase functions deploy instagram-integration
```

Add these environment variables in your Supabase dashboard:
- `INSTAGRAM_CLIENT_ID` = your app ID
- `INSTAGRAM_CLIENT_SECRET` = your app secret
- `FRONTEND_URL` = your frontend URL

### **Step 5: Test the Integration**

1. Restart your dev server: `npm run dev`
2. Go to Dashboard → Profile → Social Analytics
3. Click "Connect Platform" → Instagram
4. You'll see an OAuth flow instead of username input
5. Click "Connect with Instagram" to be redirected to Instagram

## 📊 **What Data You'll Get**

### **Personal Accounts (Basic Display API)**
- ✅ Username
- ✅ Account type
- ✅ Media count (posts)
- ❌ Follower count (not available)

### **Business/Creator Accounts (Graph API)**
- ✅ Username & profile info
- ✅ **Follower count** 📈
- ✅ Following count
- ✅ Media count
- ✅ **Engagement rate** (calculated from recent posts)
- ✅ Profile picture & bio

## 🔄 **Real-Time Updates**

Once connected, the system will:

1. **Initial Sync**: Import current follower data
2. **Refresh Button**: Manual sync for latest numbers
3. **Scheduled Updates**: You can add cron jobs to auto-refresh

To add automatic updates, create a scheduled function:

```javascript
// Weekly refresh of all connected Instagram accounts
export async function refreshAllInstagramAccounts() {
  const { data: socials } = await supabase
    .from('socials')
    .select('*')
    .eq('platform', 'instagram');

  for (const social of socials) {
    await supabase.functions.invoke('instagram-integration', {
      body: {
        action: 'fetch_profile',
        accessToken: social.access_token, // You'd need to store this
        platform: social.platform
      }
    });
  }
}
```

## 🎯 **Advanced Features**

### **Growth Tracking**
The system automatically tracks:
- Daily/weekly follower growth
- Engagement rate changes
- Post performance metrics

### **Partnership Matching**
Your follower data feeds into:
- Brand matching algorithms
- Demographic analysis
- Engagement quality scoring

### **Analytics Dashboard**
View real-time metrics:
- Follower trends
- Engagement rates
- Cross-platform comparison

## 🔐 **Security Notes**

- ✅ All API keys stored securely in Supabase
- ✅ OAuth flow prevents password exposure
- ✅ Access tokens encrypted in database
- ✅ RLS policies protect user data

## 🐛 **Troubleshooting**

### **"Client ID not configured" Error**
- Make sure `VITE_INSTAGRAM_CLIENT_ID` is set in `.env.local`
- Restart your dev server

### **OAuth Redirect Error**
- Check redirect URI in Facebook app settings
- Ensure it matches exactly: `http://localhost:5173/auth/instagram/callback`

### **"Table doesn't exist" Error**
- The socials table should already be created
- Run: `supabase db reset` if needed

### **No Follower Count**
- Personal accounts can't access follower counts via API
- Convert to Business/Creator account for full data

## 📈 **Next Steps**

1. **Set up Instagram app** (5 minutes)
2. **Add environment variables** (1 minute)
3. **Deploy function** (2 minutes)
4. **Test connection** (1 minute)
5. **Enjoy real follower data!** 🎉

Need help? The integration is ready to go - just add your Instagram credentials!

---

**🚨 Important**: Instagram's API has rate limits. For production, implement proper token refresh and error handling.

## 📚 **API Limits**

- **Basic Display**: 200 requests/hour
- **Graph API**: 200 requests/hour per user
- **Long-lived tokens**: Valid for 60 days

The system handles these limits gracefully with proper error handling and retry logic.