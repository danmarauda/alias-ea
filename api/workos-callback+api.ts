/**
 * WorkOS OAuth Callback Handler for Web
 *
 * This API route handles the OAuth callback from WorkOS for web deployments.
 * For native apps, the callback is handled via deep linking (alias-executive-agent://callback).
 * For web, we use this server endpoint which receives the callback and exchanges the code.
 *
 * Environment variables required:
 * - EXPO_PUBLIC_WORKOS_CLIENT_ID: WorkOS client ID
 * - WORKOS_API_KEY: WorkOS API key (server-side, only available in API routes)
 * - WORKOS_REDIRECT_URI: Full URL for web callback (e.g., https://yourapp.com/api/workos-callback)
 */

import { WorkOS } from '@workos-inc/node';

// Initialize WorkOS with API key (only available server-side)
const workos = new WorkOS({
  clientId: process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID || '',
  apiKey: process.env.WORKOS_API_KEY,
});

const WEB_REDIRECT_URI = process.env.WORKOS_REDIRECT_URI || '';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    return Response.redirect(
      new URL(`/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || 'Authentication failed')}`, url.origin)
    );
  }

  if (!code) {
    return Response.redirect(
      new URL('/?error=missing_code&error_description=No+authorization+code+received', url.origin)
    );
  }

  try {
    // Exchange authorization code for tokens
    // Note: For web, we don't use PKCE since we have a server-side API key
    const auth = await workos.userManagement.authenticateWithCode({
      code,
      clientId: process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID || '',
    });

    // Create session data to pass back to client
    const sessionData = {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        profilePictureUrl: auth.user.profilePictureUrl,
      },
      organization: auth.organization ? {
        id: auth.organization.id,
        name: auth.organization.name,
        slug: auth.organization.slug,
        logoUrl: auth.organization.logoUrl,
      } : null,
    };

    // Redirect back to app with session data in URL hash (client-side will store it)
    // Using hash to prevent the data from being sent to server again
    const hashData = btoa(JSON.stringify(sessionData));
    return Response.redirect(
      new URL(`/#auth=${encodeURIComponent(hashData)}`, url.origin)
    );
  } catch (err) {
    console.error('WorkOS callback error:', err);
    return Response.redirect(
      new URL(`/?error=callback_failed&error_description=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`, url.origin)
    );
  }
}
