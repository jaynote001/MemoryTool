# Memory Tool

A web-based memorization practice tool that helps users learn and retain information through structured repetition. Supports two memorization types — **List Memorization** and **Map Memorization** — accessible via tabs on the main screen.

---

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
  - [Ideas](#ideas)
  - [Requirements](#requirements)
  - [Architecture](#architecture)
- [Setup & Deployment](#setup--deployment)
  - [Prerequisites](#prerequisites)
  - [Run Locally](#run-locally)
  - [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Tech Stack](#tech-stack)

---

## Project Description

Memory Tool is a **client-side only** single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. It is designed to be hosted on **GitHub Pages** as a static site — no server, database, or build tools required.

The tool provides structured repetition-based practice sessions across two modes:

- **List Memorization** — Practice recalling items in an ordered list by their pointer position. Supports Straight, Reverse, and Jumbled orders.
- **Map Memorization** — Practice recalling key-value mappings in both directions (Key→Value and Value→Key). Supports Straight, Reverse, and Jumbled orders in both K2V and V2K directions.

Each tab offers three practice modes:

| Mode | Purpose |
|------|---------|
| **Memorization** | Preset sequence for initial learning (higher repetition counts) |
| **Revision** | Shorter preset for review (lower repetition counts) |
| **Custom** | Full user control over practice blocks, element types, and repetition counts |

---

## Features

- Tab-based UI with independent List and Map flows
- Three practice modes per tab (Memorization, Revision, Custom)
- Session progress tracking (block info, repetition count, overall progress)
- Responsive design for mobile and desktop
- Zero dependencies — pure HTML/CSS/JS
- Static hosting on GitHub Pages

---

## Project Structure

```
MemoryTool/
├── README.md                ← You are here
├── index.html               # Single HTML page — tabs, screens for both List and Map
├── style.css                # All styles — layout, responsiveness, theming
├── app.js                   # Application logic — shared + tab-specific modules
│
├── 1_Idea/                  # Idea documents
│   ├── 0_Idea_MemoryTool.txt
│   ├── 1_Idea_List_Memorization.txt
│   └── 2_Idea_Map_Memorization.txt
│
├── 2_Requirements/          # Requirements documents
│   ├── INDEX.md             # ⭐ Requirements index
│   ├── 0_Requirements_General.md
│   ├── 1_Requirements_List.md
│   └── 2_Requirements_Map.md
│
├── 3_Architecture/          # Architecture documents
│   ├── INDEX.md             # ⭐ Architecture index
│   ├── 0_Architecture_General.md
│   ├── 1_Architecture_List.md
│   └── 2_Architecture_Map.md
│
└── 4_SETUP.md               # Detailed setup & deployment guide
```

---

## Documentation

### Ideas

| Document | Description |
|----------|-------------|
| [0_Idea_MemoryTool.txt](1_Idea/0_Idea_MemoryTool.txt) | Combined tool concept — tabs, hosting goals |
| [1_Idea_List_Memorization.txt](1_Idea/1_Idea_List_Memorization.txt) | List memorization concept — practice elements, modes |
| [2_Idea_Map_Memorization.txt](1_Idea/2_Idea_Map_Memorization.txt) | Map memorization concept — K2V/V2K directions, modes |

### Requirements

> **[→ Requirements Index](2_Requirements/INDEX.md)**

| Document | Description |
|----------|-------------|
| [0_Requirements_General.md](2_Requirements/0_Requirements_General.md) | Shared requirements — tab structure, common modes, functional & non-functional requirements |
| [1_Requirements_List.md](2_Requirements/1_Requirements_List.md) | List tab — practice elements, modes, setup/practice/completion screens |
| [2_Requirements_Map.md](2_Requirements/2_Requirements_Map.md) | Map tab — K2V/V2K elements, modes, setup/practice/completion screens |

### Architecture

> **[→ Architecture Index](3_Architecture/INDEX.md)**

| Document | Description |
|----------|-------------|
| [0_Architecture_General.md](3_Architecture/0_Architecture_General.md) | SPA overview, MVC layers, tab architecture, shared components, state machine, data flow |
| [1_Architecture_List.md](3_Architecture/1_Architecture_List.md) | List tab components, session engine, HTML structure, traceability matrix |
| [2_Architecture_Map.md](3_Architecture/2_Architecture_Map.md) | Map tab components, K2V/V2K logic, pair input, traceability matrix |

---

## Setup & Deployment

> For the full step-by-step guide, see **[4_SETUP.md](4_SETUP.md)**.

### Prerequisites

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **GitHub account** | Hosting via GitHub Pages |
| **Python 3** | Local server & live reload |
| **Web browser** | Running the app |

### Run Locally

```bash
cd /path/to/MemoryTool

# Option A — Python livereload (recommended, auto-refreshes)
pip install livereload
livereload -p 8000 .

# Option B — Python built-in server
python3 -m http.server 8000

# Then open http://localhost:8000
```

### Deploy to GitHub Pages

1. Create a public GitHub repository.
2. Push project files to the `main` branch.
3. Enable GitHub Pages in Settings → Pages → Source: `main` / `/ (root)`.
4. Access at `https://<username>.github.io/<repo-name>/`.

For detailed instructions including feature branch workflows, see [4_SETUP.md](4_SETUP.md).

---

## Tech Stack

| Technology | Role |
|-----------|------|
| HTML | Structure — single `index.html` with all screens |
| CSS | Styling — responsive layout, theming |
| JavaScript | Logic — MVC pattern in single `app.js` |
| GitHub Pages | Hosting — free static site deployment |

---

> Built for structured memorization practice. No frameworks, no build tools, no server — just open and practice.
