# Netlify Deployment Guide

This guide explains how to deploy the Magnify Cash Web Version to Netlify.

## Prerequisites

1. A Netlify account
2. Git repository with your code
3. Node.js and npm/pnpm installed locally

## Deployment Options

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build` or `pnpm build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI globally:
   ```
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```
   netlify login
   ```

3. Initialize your site:
   ```
   netlify init
   ```

4. Deploy your site:
   ```
   npm run deploy
   ```
   or manually:
   ```
   netlify deploy --prod
   ```

## Environment Variables

The following environment variables are configured in the `netlify.toml` file:

- `VITE_APP_ENV`: The environment (production, preview, development)
- `VITE_DEMO_MODE`: Set to "true" to enable demo mode without authentication

You can add additional environment variables in the Netlify UI:
1. Go to Site settings > Build & deploy > Environment
2. Add environment variables as needed

## Custom Domain

To set up a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership and configure DNS

## Continuous Deployment

Netlify automatically deploys your site when you push changes to your repository. You can configure deployment settings in the Netlify UI:

1. Go to Site settings > Build & deploy > Continuous Deployment
2. Configure branch deploys, deploy contexts, and build hooks as needed

## Troubleshooting

### Client-side Routing Issues

If you encounter issues with client-side routing (404 errors when refreshing pages):

1. Verify that the `netlify.toml` file contains the correct redirect rule:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Check that the `public/_redirects` file exists with the content:
   ```
   /* /index.html 200
   ```

### Build Failures

If your build fails:

1. Check the build logs in the Netlify UI
2. Verify that your build command and publish directory are correct
3. Ensure all dependencies are properly installed

## Local Testing

To test your Netlify configuration locally:

1. Install Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Run the local development server:
   ```
   netlify dev
   ```

This will simulate the Netlify production environment locally. 