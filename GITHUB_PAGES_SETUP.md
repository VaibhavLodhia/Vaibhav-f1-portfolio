# GitHub Pages Setup Instructions

## IMPORTANT: You MUST enable GitHub Pages manually first!

The workflow will fail until you complete these steps:

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/VaibhavLodhia/Vaibhav-f1-portfolio
2. Click on **Settings** (top menu bar)
3. In the left sidebar, scroll down and click **Pages**
4. Under **Build and deployment**:
   - **Source**: Select **"GitHub Actions"** (NOT "Deploy from a branch")
   - Click **Save**

### Step 2: Verify Workflow Permissions

1. Still in **Settings**, click **Actions** > **General**
2. Scroll down to **Workflow permissions**
3. Select **"Read and write permissions"**
4. Check **"Allow GitHub Actions to create and approve pull requests"** (optional but recommended)
5. Click **Save**

### Step 3: Trigger the Workflow

After enabling Pages, the next push to `main` branch will trigger the deployment.

Your site will be available at: **https://vaibhavlodhia.github.io/Vaibhav-f1-portfolio/**

---

**Note**: The workflow file is already configured correctly. You just need to enable Pages in the repository settings first.

