# Supabase OAuth Setup Guide

This guide will walk you through setting up Google and Facebook OAuth authentication in your Supabase project.

## Prerequisites

- A Supabase account and project
- Google Cloud Console account (for Google OAuth)
- Facebook Developer account (for Facebook OAuth)

---

## Step 1: Configure Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - Choose **External** user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`
   - Add test users if needed
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `AR-Furniture OAuth`
   - Authorized redirect URIs: 
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     Replace `your-project-ref` with your Supabase project reference (found in your Supabase project URL)
7. Copy the **Client ID** and **Client Secret**

### 1.2 Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and click to configure
4. Enable Google provider
5. Enter your **Client ID** and **Client Secret** from Google Cloud Console
6. Click **Save**

---

## Step 2: Configure Facebook OAuth

### 2.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** as the app type
4. Fill in app details:
   - App Name: `AR-Furniture`
   - App Contact Email: Your email
5. Add **Facebook Login** product to your app
6. Configure Facebook Login:
   - Go to **Settings** > **Basic**
   - Add **App Domains**: Your domain (e.g., `yourdomain.com`)
   - Add **Privacy Policy URL** and **Terms of Service URL** (required for production)
   - In **Facebook Login** > **Settings**:
     - Valid OAuth Redirect URIs:
       ```
       https://your-project-ref.supabase.co/auth/v1/callback
       ```
7. Copy the **App ID** and **App Secret** from **Settings** > **Basic**

### 2.2 Configure Facebook OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Facebook** in the list and click to configure
4. Enable Facebook provider
5. Enter your **App ID** and **App Secret** from Facebook Developers
6. Click **Save**

---

## Step 3: Configure Redirect URLs

### 3.1 In Supabase Dashboard

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL (for production):
   ```
   https://yourdomain.com
   ```
3. Add redirect URLs:
   ```
   https://yourdomain.com/auth/callback
   http://localhost:5173/auth/callback  (for local development)
   ```

### 3.2 Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 4: Test OAuth Flow

### 4.1 Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to `/login`
3. Click **Sign in with Google** or **Sign in with Facebook**
4. Complete the OAuth flow
5. You should be redirected to `/auth/callback` and then to `/products`

### 4.2 Production Testing

1. Deploy your application
2. Make sure your production URL is added to:
   - Google Cloud Console authorized redirect URIs
   - Facebook App valid OAuth redirect URIs
   - Supabase redirect URLs
3. Test the OAuth flow in production

---

## Step 5: Backend Integration (Optional but Recommended)

Currently, OAuth users authenticate with Supabase but may not be synced with your backend user system. To fully integrate:

### 5.1 Create Backend Endpoint

Create an endpoint that handles OAuth user creation/login:

```javascript
// Example: POST /api/auth/oauth
// This endpoint should:
// 1. Receive Supabase user data (email, name, etc.)
// 2. Check if user exists in your database
// 3. Create user if doesn't exist
// 4. Return JWT token for your backend
```

### 5.2 Update AuthCallback Component

Update `client/src/pages/AuthCallback.tsx` to call your backend endpoint after OAuth success.

---

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Check that redirect URIs match exactly in Google/Facebook and Supabase
   - Include both `http://localhost:5173` (dev) and production URLs

2. **"OAuth provider not enabled"**
   - Make sure you've enabled the provider in Supabase dashboard
   - Check that Client ID and Secret are correct

3. **"Invalid client"**
   - Verify your OAuth credentials are correct
   - Check that your app is in the correct state (development/production)

4. **Callback page not loading**
   - Verify the route `/auth/callback` is added in your App.tsx
   - Check browser console for errors

### Debug Steps

1. Check Supabase logs: **Logs** > **Auth Logs**
2. Check browser console for errors
3. Verify environment variables are loaded correctly
4. Test OAuth flow in incognito mode to avoid cached sessions

---

## Security Best Practices

1. **Never expose your OAuth secrets** in client-side code
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production
4. **Set up proper CORS** policies
5. **Regularly rotate** OAuth credentials
6. **Monitor** OAuth usage in Supabase dashboard

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login/web)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)

---

## Notes

- OAuth users will be created in Supabase's `auth.users` table
- You may want to sync these users with your backend `users` table
- Consider implementing user profile completion for OAuth users
- Facebook requires app review for production use

