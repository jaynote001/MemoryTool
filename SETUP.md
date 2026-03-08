# Memory Tool — Setup & Deployment Guide

A step-by-step guide to run the Memory Tool locally and deploy it to GitHub Pages.

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |
| **GitHub account** | Hosting via GitHub Pages | [github.com](https://github.com/) |
| **Web browser** | Running the app | Chrome, Firefox, Safari, or Edge |

No Node.js, npm, or build tools are required — the project is plain HTML/CSS/JS.

---

## Part 1: Run Locally

### Step 1 — Open the project folder

```bash
cd /Users/singhpc/Projects/LearningTools/MemoryTool
```

### Step 2 — Start a local server

Pick **any one** of the options below:

**Option A — Python (macOS comes with Python pre-installed):**
```bash
python3 -m http.server 8000
```

**Option B — VS Code Live Server extension:**
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` → **Open with Live Server**.

**Option C — Open file directly:**
```bash
open index.html
```
> Note: Opening the file directly (`file://`) works for this app since it has no server dependencies. However, a local server is recommended for the most accurate browser behavior.

### Step 3 — Use the tool

1. Open `http://localhost:8000` in your browser (if using Python server).
2. Select a mode, enter list size, and click **Start**.
3. Click **Next** to advance through the sequence.

---

## Part 2: Deploy to GitHub Pages

### Step 1 — Create a GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. **Repository name**: `MemoryTool` (or any name you like).
3. **Visibility**: Public (required for free GitHub Pages).
4. Do **not** initialize with README (we already have files).
5. Click **Create repository**.

### Step 2 — Initialize Git and push

Run these commands from the project folder:

```bash
cd /Users/singhpc/Projects/LearningTools/MemoryTool

# Initialize git repo
git init

# Add all project files
git add index.html style.css app.js

# Optionally add documentation files too
git add 1_Idea.txt Requirements.md Architecture.md SETUP.md

# Commit
git commit -m "Initial commit: Memory Tool v1"

# Set main branch
git branch -M main

# Add your GitHub repo as remote (replace <username> with your GitHub username)
git remote add origin https://github.com/<username>/MemoryTool.git

# Push
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/<username>/MemoryTool`.
2. Click **Settings** (tab at the top).
3. In the left sidebar, click **Pages**.
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**.

### Step 4 — Access your live site

After a minute or two, your tool will be live at:

```
https://<username>.github.io/MemoryTool/
```

GitHub shows the URL on the Pages settings page once the deployment is complete.

---

## Part 3: Making Updates

After making changes to your files:

```bash
git add -A
git commit -m "Describe your change"
git push
```

GitHub Pages will automatically rebuild and deploy within 1–2 minutes.

---

## Project Files Reference

| File | Purpose |
|------|---------|
| `index.html` | Single HTML page with all three screens (Setup, Practice, Complete) |
| `style.css` | All styles — responsive layout, theming, mobile support |
| `app.js` | Application logic — session engine, sequence generation, UI control |
| `1_Idea.txt` | Original idea description |
| `Requirements.md` | Detailed requirements specification |
| `Architecture.md` | Architecture and component design |
| `SETUP.md` | This guide |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page shows 404 on GitHub Pages | Wait 2–3 minutes after enabling Pages. Ensure `index.html` is in the repo root. |
| Styles not loading | Make sure `style.css` is in the same folder as `index.html`. Check browser console for 404s. |
| Custom blocks not showing | Select the "Custom" radio button — the section only appears in Custom mode. |
| "List size must be between 1 and 10" error | Enter a whole number from 1 to 10 in the List Size field. |
