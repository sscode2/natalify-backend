# Netlify Deployment Guide

This document provides step-by-step instructions for deploying the Natalify e-commerce platform to Netlify.

## Prerequisites

1. A GitHub account
2. A Netlify account
3. Node.js installed locally (for testing)

## Deployment Steps

### 1. Push Code to GitHub

First, push your code to a GitHub repository:

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/your-username/your-repo-name.git

# Push to GitHub
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Select your GitHub repository
4. Configure the deployment settings:
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. Set Environment Variables

In the Netlify dashboard:

1. Go to your site settings
2. Navigate to "Environment variables"
3. Add the following variables:
   - `JWT_SECRET` = your-jwt-secret-key
   - `STRIPE_PUBLISHABLE_KEY` = your-stripe-publishable-key
   - `STRIPE_SECRET_KEY` = your-stripe-secret-key

### 4. Deploy

Click "Deploy site" and Netlify will build and deploy your site.

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize the site:
   ```bash
   netlify init
   ```

4. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Troubleshooting

### Build Failures

If your build fails, check:
1. All dependencies are correctly listed in package.json
2. Environment variables are properly set
3. No syntax errors in your code

### API Issues

If the API is not working:
1. Check that functions are in the correct directory (`netlify/functions`)
2. Verify that the function names match the API endpoints
3. Check the Netlify Functions logs for errors

## Custom Domain

To use a custom domain:
1. Go to site settings in Netlify
2. Navigate to "Domain management"
3. Add your custom domain
4. Follow the DNS configuration instructions