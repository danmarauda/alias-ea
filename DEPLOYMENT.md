# Vercel Deployment Guide

This guide covers deploying the ALIAS Executive Agent (Luna) Expo app to Vercel.

## Prerequisites

1. **Vercel Account**: Create account at [vercel.com](https://vercel.com)
2. **Vercel CLI**: `npm install -g vercel`
3. **Convex Deployment**: Backend deployed to Convex
4. **WorkOS Account**: For authentication

## Project Configuration

The following files configure Vercel deployment:

### `/vercel.json`
- Build command: `expo export -p web`
- Output directory: `dist/client`
- Serverless function: `/api/index.ts`
- Rewrites all requests to the Expo server handler

### `/api/index.ts`
- Vercel serverless function entry point
- Delegates to Expo's server bundle using `expo-server/adapter/vercel`

### `/api/*+api.ts`
- Expo Router API routes
- `chat+api.ts`: AI chat proxy (Anthropic, OpenAI, Google)
- `health+api.ts`: Health check endpoint
- `workos-callback+api.ts`: OAuth callback handler

## Environment Variables

Copy variables from `.env.vercel.example` to your Vercel project settings:

**Required Variables:**
- `EXPO_PUBLIC_WORKOS_CLIENT_ID`: WorkOS client ID
- `WORKOS_API_KEY`: WorkOS API key
- `WORKOS_REDIRECT_URI`: `https://your-domain.vercel.app/api/workos-callback`
- `CONVEX_DEPLOYMENT`: Convex deployment URL
- `ANTHROPIC_API_KEY`: For Claude AI
- `OPENAI_API_KEY`: For GPT models
- `GOOGLE_AI_API_KEY`: For Gemini

## Deployment Steps

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Build Locally (Optional)
```bash
bun run vercel-build
# or
npm run vercel-build
```

This creates:
- `dist/client/` - Static assets
- `dist/server/` - Server bundle with API routes

### 3. Deploy to Vercel

**First-time setup:**
```bash
vercel login
vercel link
```

**Deploy:**
```bash
vercel --prod
```

**Or use pre-built:**
```bash
vercel build
vercel deploy --prebuilt
```

## Web vs Native Deployment

### Web (Vercel)
- Static files served from `dist/client/`
- API routes handled by `api/index.ts` serverless function
- OAuth callback: `https://your-domain.vercel.app/api/workos-callback`

### Native (iOS/Android)
- Built via EAS Build
- Uses custom URL scheme: `alias-executive-agent://callback`
- Server origin configured in `app.json`:
  ```json
  "plugins": [
    ["expo-router", { "origin": "https://your-domain.vercel.app" }]
  ]
  ```

## API Routes

Server-side endpoints available at:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | AI chat proxy |
| `/api/workos-callback` | GET | OAuth callback (web) |

Client-side API routes (in `/app`):
- Use `+api.ts` suffix (e.g., `app/api/users+api.ts`)
- Bundled into server bundle
- Can access server-side environment variables

## Troubleshooting

### Build Errors

**Error: `expo-server not found`**
```bash
bun add expo-server
```

**Error: `Cannot find module './dist/server'`**
- Ensure `vercel-build` script runs successfully
- Check that `expo export -p web` completes without errors

### OAuth Callback Issues

**Native app opens browser but doesn't return:**
- Check `REDIRECT_URI` matches app scheme: `alias-executive-agent://callback`
- Verify deep linking configuration in `app.json`

**Web OAuth fails:**
- Set `WORKOS_REDIRECT_URI` to full Vercel URL
- Add URL to WorkOS allowed redirect list

### API Route Not Found

**404 on `/api/health`:**
- Verify `api/index.ts` exists
- Check `vercel.json` rewrites configuration
- Ensure server bundle includes API routes

## Monitoring

### Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-02-04T...",
  "service": "ALIAS Executive Agent",
  "version": "1.0.0"
}
```

### Vercel Logs
```bash
vercel logs
```

## Next Steps

1. Set up custom domain in Vercel dashboard
2. Configure production environment variables
3. Set up CI/CD with GitHub integration
4. Add monitoring (Sentry, Vercel Analytics)
5. Set up Stripe webhooks for payments

## References

- [Expo Router API Routes](https://docs.expo.dev/router/web/api-routes/)
- [Vercel Project Configuration](https://vercel.com/docs/project-configuration)
- [Convex Deployment](https://docs.convex.dev/production/deployment)
- [WorkOS Authentication](https://workos.com/docs/reference/user-management)
