# Deploying to Vercel using Git Import

This guide walks you through deploying your Kids Slot Machine game to Vercel by importing your Git repository.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. Your project pushed to a repository on one of these platforms
3. A Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Prepare Your Repository

Make sure your repository contains these essential files:
- index.html
- styles.css
- script.js
- sounds/ directory (optional, for audio files)
- package.json
- vercel.json

## Step 2: Push to Git

If you haven't already, create a repository and push your code:

```bash
# Initialize Git repository if needed
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit"

# Add remote repository (replace with your repository URL)
git remote add origin <your-repository-url>

# Push to remote repository
git push -u origin main
```

## Step 3: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Under "Import Git Repository", find and select your repository
   - You may need to connect your GitHub/GitLab/Bitbucket account first
4. Configure project with these settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - Leave other settings at their defaults (they will be overridden by vercel.json)
5. Click "Deploy"

## Step 4: Access Your Deployed Site

Once deployment is complete, your site will be available at:
- `https://your-project-name.vercel.app`

Vercel also assigns a unique URL with a random identifier:
- `https://your-project-name-username.vercel.app`

## Troubleshooting

If your deployment fails or you see 404 errors:

1. **Check Vercel logs**:
   - Go to your project in the Vercel dashboard
   - Click on the latest deployment
   - Navigate to "Logs" to see what might be going wrong

2. **Ensure your vercel.json is correct**:
   - It should specify that all routes redirect to the root
   - No build step should be required

3. **Verify project settings**:
   - In the Vercel dashboard, go to your project
   - Click "Settings" → "General"
   - Ensure "Output Directory" is set to "." (root)
   - Ensure no build command is specified

4. **Try a forced rebuild**:
   - In the Vercel dashboard, go to your project
   - Click on the "⋮" menu → "Redeploy"
   - Check "Update build settings" if prompted

## Important Notes

- Always access your site with the base URL provided by Vercel, without appending `/index.html`
- Any changes pushed to your repository will trigger automatic redeployments
- You can set up a custom domain in the Vercel project settings