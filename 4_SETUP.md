# Memory Tool — Setup & Deployment Guide

A step-by-step guide to run the Memory Tool locally and deploy it to GitHub Pages.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Part 1: Run Locally](#part-1-run-locally)
  - [Step 1 — Open the project folder](#step-1--open-the-project-folder)
  - [Step 2 — Start a local server](#step-2--start-a-local-server)
  - [Step 3 — Use the tool](#step-3--use-the-tool)
- [Part 2: Deploy to GitHub Pages](#part-2-deploy-to-github-pages)
  - [Step 1 — Create a GitHub repository](#step-1--create-a-github-repository)
  - [Step 2 — Initialize Git and push](#step-2--initialize-git-and-push)
  - [Step 3 — Enable GitHub Pages](#step-3--enable-github-pages)
  - [Step 4 — Access your live site](#step-4--access-your-live-site)
- [Part 3: Making Quick Updates (Direct to Main)](#part-3-making-quick-updates-direct-to-main)
- [Part 4: Making Updates via Feature Branch](#part-4-making-updates-via-feature-branch)
  - [Step 1 — Create a feature branch](#step-1--create-a-feature-branch)
  - [Step 2 — Make your changes](#step-2--make-your-changes)
  - [Step 3 — Test locally](#step-3--test-locally)
  - [Step 4 — Commit and push the feature branch](#step-4--commit-and-push-the-feature-branch)
  - [Step 5 — Create a Pull Request on GitHub](#step-5--create-a-pull-request-on-github)
  - [Step 6 — Review and merge](#step-6--review-and-merge)
  - [Step 7 — Clean up the feature branch](#step-7--clean-up-the-feature-branch)
  - [Step 8 — Verify deployment](#step-8--verify-deployment)
- [Project Files Reference](#project-files-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |
| **GitHub account** | Hosting via GitHub Pages | [github.com](https://github.com/) |
| **Python 3** | Local server & live reload | Pre-installed on macOS |
| **Web browser** | Running the app | Chrome, Firefox, Safari, or Edge |

Install the `livereload` Python package (one-time setup):

```bash
pip install livereload
```

No Node.js, npm, or build tools are required — the project is plain HTML/CSS/JS.

[↑ Back to Top](#table-of-contents)

---

## Part 1: Run Locally

### Step 1 — Open the project folder

```bash
cd /Users/singhpc/Projects/LearningTools/MemoryTool
```

### Step 2 — Start a local server

Pick **any one** of the options below:

**Option A — Python `livereload` (recommended — auto-refreshes on file save):**
```bash
livereload -p 8000 .
```
> The browser automatically reloads whenever you save changes to any file in the project.

**Option B — Python built-in server (no auto-reload):**
```bash
python3 -m http.server 8000
```

**Option C — VS Code Live Server extension:**
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` → **Open with Live Server**.

**Option D — Open file directly:**
```bash
open index.html
```
> Note: Opening the file directly (`file://`) works for this app since it has no server dependencies. However, a local server is recommended for the most accurate browser behavior.

### Step 3 — Use the tool

1. Open `http://localhost:8000` in your browser (if using Python server).
2. Choose the **List** or **Map** tab.
3. **List tab:** Enter a List Name, select a mode, enter list size, and click **Start**.
4. **Map tab:** Enter a Mapping Name, select a mode, add key-value pairs via **+ Add Pair**, and click **Start**.
5. Click **Next** to advance through the sequence. Click **Back** to abort and return to setup.

[↑ Back to Top](#table-of-contents)

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
git add 1_Idea/ 2_Requirements/ 3_Architecture/ 4_SETUP.md

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

[↑ Back to Top](#table-of-contents)

---

## Part 3: Making Quick Updates (Direct to Main)

For small, simple changes (typo fixes, minor tweaks), you can commit directly to `main`:

```bash
# Make sure you're on main
git checkout main

# Make your changes, then:
git add -A
git commit -m "Describe your change"
git push
```

GitHub Pages will automatically rebuild and deploy within 1–2 minutes.

> **When to use this:** Only for trivial changes. For any feature work, bug fixes, or UI adjustments, use the feature branch workflow below.

[↑ Back to Top](#table-of-contents)

---

## Part 4: Making Updates via Feature Branch

For any meaningful change (new feature, UI adjustment, bug fix), use a feature branch. This keeps `main` stable and gives you a clean history.

### Step 1 — Create a feature branch

Start from an up-to-date `main`:

```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
| Prefix | Use for | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/keyboard-shortcuts` |
| `fix/` | Bug fixes | `fix/jumbled-sequence-repeat` |
| `ui/` | UI/styling changes | `ui/dark-mode` |
| `docs/` | Documentation updates | `docs/update-readme` |

### Step 2 — Make your changes

Edit the relevant files (`index.html`, `style.css`, `app.js`, etc.) as needed.

### Step 3 — Test locally

Before committing, verify your changes work:

```bash
# Start local server with auto-reload
livereload -p 8000 .
```

Open `http://localhost:8000` and test the full flow (Setup → Practice → Complete). The browser will auto-refresh as you save changes. Stop the server with `Ctrl+C` when done.

### Step 4 — Commit and push the feature branch

```bash
# Stage your changes
git add -A

# Commit with a descriptive message
git commit -m "feat: describe what you changed"

# Push the feature branch to GitHub
git push -u origin feature/your-feature-name
```

### Step 5 — Create a Pull Request on GitHub

1. Go to your repository on GitHub.
2. You'll see a banner: **"feature/your-feature-name had recent pushes"** → Click **Compare & pull request**.
3. Fill in:
   - **Title**: Brief description of the change.
   - **Description**: What was changed and why.
4. Click **Create pull request**.

### Step 6 — Review and merge

1. Review the **Files changed** tab on the PR to verify your changes.
2. If everything looks good, click **Merge pull request** → **Confirm merge**.
3. This merges your feature branch into `main`.

> **Important:** GitHub Pages deploys from `main`. Your changes go live only after the merge.

### Step 7 — Clean up the feature branch

After merging, delete the feature branch to keep things tidy:

**On GitHub:**
- Click **Delete branch** on the merged PR page.

**Locally:**
```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Delete the local feature branch
git branch -d feature/your-feature-name
```

### Step 8 — Verify deployment

1. Wait 1–2 minutes after merge.
2. Open your GitHub Pages URL: `https://<username>.github.io/MemoryTool/`
3. Hard-refresh (`Cmd+Shift+R` on Mac) to bypass cache.
4. Confirm your changes are live.

[↑ Back to Top](#table-of-contents)

---

## Project Files Reference

| File | Purpose |
|------|---------|
| `index.html` | Single HTML page with List and Map tabs, each with Setup/Practice/Complete screens |
| `style.css` | All styles — tab navigation, responsive layout, theming, mobile support |
| `app.js` | Application logic — List & Map session engines, sequence generation, tab management, UI control |
| `1_Idea/` | Idea documents (General, List, Map) |
| `2_Requirements/` | Requirements documents (General, List, Map) |
| `3_Architecture/` | Architecture documents (General, List, Map) |
| `4_SETUP.md` | This guide |

[↑ Back to Top](#table-of-contents)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page shows 404 on GitHub Pages | Wait 2–3 minutes after enabling Pages. Ensure `index.html` is in the repo root. |
| Styles not loading | Make sure `style.css` is in the same folder as `index.html`. Check browser console for 404s. |
| Custom blocks not showing | Select the "Custom" radio button — the section only appears in Custom mode. |
| "List size must be a valid positive number" error | Enter a whole number ≥ 1 in the List Size field. |
| Map pairs not validating | Ensure every key and value field is filled in. Add at least one pair. |
| Feature branch changes not showing on live site | Only `main` is deployed. Make sure you merged your PR into `main`. |
| Old version still showing after deploy | Hard-refresh the browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows). |

[↑ Back to Top](#table-of-contents)
