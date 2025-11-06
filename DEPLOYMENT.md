# GitHub Pages Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it (e.g., `Portfolio_f1` or `f1-portfolio`)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/yourusername/Portfolio_f1.git`)

## Step 2: Update Base Path (Important!)

**If your repository name is NOT `username.github.io`**, you need to update the base path in `vite.config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
```

Replace `YOUR_REPO_NAME` with your actual repository name.

**If your repository IS `username.github.io`**, change the base to:
```typescript
base: '/',
```

## Step 3: Push to GitHub

Run these commands in your terminal:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: F1 Portfolio"

# Add remote (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/YOUR_REPO_NAME.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: `GitHub Actions`
4. The workflow will automatically deploy on every push to `main` branch

## Step 5: Access Your Site

Your site will be available at:
- `https://yourusername.github.io/YOUR_REPO_NAME/` (if repo is not `username.github.io`)
- `https://yourusername.github.io/` (if repo is `username.github.io`)

## Notes

- The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on every push
- Make sure your repository is public (or you have GitHub Pro for private repos with Pages)
- First deployment may take a few minutes to complete

