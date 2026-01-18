# GitHub Pages Setup Instructions

This document provides instructions for setting up GitHub Pages for the PDF Slice & Dice application.

## Prerequisites

The GitHub Actions workflow (`.github/workflows/deploy.yml`) is already configured and will automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/sjdevpl/pdfslicendice`
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Pages** (under "Code and automation")
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. Save the changes

### 2. Trigger the Deployment

Once GitHub Pages is enabled, you can trigger a deployment in two ways:

#### Option A: Push to Main Branch
Merge this PR to the `main` branch, and the workflow will automatically run.

#### Option B: Manual Trigger
1. Go to **Actions** tab in your repository
2. Click on the **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select the branch and click **Run workflow**

### 3. Access Your Deployed App

After the workflow completes successfully (usually takes 2-3 minutes):

- Your app will be available at: `https://sjdevpl.github.io/pdfslicendice/`
- Check the workflow run for the exact URL in the deployment step

## Features in GitHub Pages Version

✅ **Enabled Features:**
- PDF upload and page extraction
- Export to PDF, IMG, DOC, PPT formats
- Batch operations
- Local processing (no server required)

❌ **Disabled Features:**
- AI-powered page analysis (Gemini Insight)
- AI batch processing

Users who want AI features will see a promotional banner linking to the full app at `https://pdfslicendice.sjdev.pl`

## Troubleshooting

### Build Fails
- Check the Actions tab for error logs
- Ensure all dependencies are in `package.json`
- Verify the build works locally: `npm run build`

### 404 Error on Assets
- Ensure GitHub Pages is set to use **GitHub Actions** as the source (not "Deploy from a branch")
- Check that the base path in `vite.config.ts` matches the repository name

### Changes Not Reflecting
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes for CDN propagation
- Check the Actions tab to ensure the latest workflow completed successfully

## Maintenance

### Updating the Repository Name
If you rename the repository, update the `REPO_NAME` constant in `vite.config.ts`:

```typescript
const REPO_NAME = 'NewRepositoryName';
```

### Enabling AI Features
To enable AI features, update the workflow to use a real API key:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    GITHUB_PAGES: true
```

Then add the `GEMINI_API_KEY` secret in repository settings.
