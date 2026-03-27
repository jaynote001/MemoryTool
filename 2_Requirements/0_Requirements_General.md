# Memory Tool — General Requirements

> [← Requirements Index](INDEX.md) · [← README](../README.md)

---

## Document Index

- [1. Overview](#1-overview)
- [2. Objectives](#2-objectives)
- [3. Tab Structure](#3-tab-structure)
- [4. Common Glossary](#4-common-glossary)
- [5. Common Practice Modes](#5-common-practice-modes)
- [6. Common Functional Requirements](#6-common-functional-requirements)
  - [6.1 Setup Screen](#61-setup-screen-common)
  - [6.2 Practice Screen](#62-practice-screen-common)
  - [6.3 Session Flow](#63-session-flow-common)
- [7. Non-Functional Requirements](#7-non-functional-requirements)
- [8. Hosting & Deployment](#8-hosting--deployment)

### Related Documents

| Document | Link |
|----------|------|
| List Requirements | [1_Requirements_List.md](1_Requirements_List.md) |
| Map Requirements | [2_Requirements_Map.md](2_Requirements_Map.md) |
| General Architecture | [0_Architecture_General.md](../3_Architecture/0_Architecture_General.md) |

---

## 1. Overview

A web-based memorization practice tool that helps users learn and retain information through structured repetition. The tool supports two memorization types — **List Memorization** and **Map Memorization** — accessible via tabs on the main screen. Each tab provides its own setup, practice, and completion flow.

---

## 2. Objectives

- Help users memorize short ordered lists and key-value mappings through repeated practice.
- Support multiple recall orders (straight, reverse, jumbled) and directions (key-to-value, value-to-key for maps).
- Provide preset modes (Memorization, Revision) for quick sessions and a Custom mode for full control.
- Be accessible on laptop and mobile via a hosted static site (GitHub Pages).

---

## 3. Tab Structure

| ID | Requirement |
|----|------------|
| GR-01 | The tool shall display two tabs on the main screen: **List** and **Map**. |
| GR-02 | The user shall be able to switch between tabs at any time from the setup screen. |
| GR-03 | Each tab shall have its own independent setup, practice, and completion screens. |
| GR-04 | The active tab shall be visually highlighted. |

---

## 4. Common Glossary

| Term | Definition |
|------|-----------|
| **Practice Element** | A drill type that defines the order in which items are presented. |
| **Repetition** | One complete pass through all items in the specified order. |
| **Repetition Count** | The number of times a practice element's sequence is repeated. |
| **Practice Session** | A full run composed of one or more practice element blocks executed in sequence. |

> Tab-specific terms are defined in their respective requirements documents (2.1 and 2.2).

---

## 5. Common Practice Modes

Both List and Map tabs share the same three mode types, though their block definitions differ:

| Mode | Purpose |
|------|---------|
| **Memorization** | Preset sequence designed for initial learning (higher repetition counts). |
| **Revision** | Shorter preset sequence for review (lower repetition counts). |
| **Custom** | Full user control over practice blocks, element types, and repetition counts. |

> Specific block sequences for each mode are defined in the tab-specific requirements (2.1 and 2.2).

---

## 6. Common Functional Requirements

### 6.1 Setup Screen (Common)

| ID | Requirement |
|----|------------|
| CFR-01 | The tool shall display a setup screen on launch within the active tab. |
| CFR-02 | The user shall select a **Mode**: Memorization, Revision, or Custom. |
| CFR-03 | When Custom mode is selected, the tool shall allow the user to add one or more practice blocks, each specifying a Practice Element type and a Repetition Count. |
| CFR-04 | The tool shall validate all inputs before starting the session (sizes in range, repetition counts ≥ 1, at least one block in Custom mode). |
| CFR-05 | A **Start** button shall initiate the practice session after successful validation. |

### 6.2 Practice Screen (Common)

| ID | Requirement |
|----|------------|
| CFR-06 | The tool shall display the **current item** prominently (large, centered). |
| CFR-07 | The tool shall display a **"Next"** button. Clicking it advances to the next item in the sequence. |
| CFR-08 | The tool shall display contextual progress information: current block name, current repetition number / total repetitions, and overall progress. |
| CFR-09 | Within a block, the sequence follows the practice element order and repeats for the configured repetition count. |
| CFR-10 | When a block's repetitions are complete, the tool shall automatically transition to the next block. |
| CFR-11 | When all blocks are complete, the tool shall display a **completion summary** and an option to return to the setup screen. |
| CFR-12 | The tool shall provide a **Back** button to abort the current session and return to the setup screen. |

### 6.3 Session Flow (Common)

| ID | Requirement |
|----|------------|
| CFR-13 | For Memorization and Revision modes, the block sequence and repetition counts are fixed as defined per tab. |
| CFR-14 | For Custom mode, the blocks execute in the order the user defined them. |
| CFR-15 | Each Jumbled repetition shall produce a new random permutation of the items. |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-01 | The tool shall be a **client-side only** web application (HTML + CSS + JavaScript). No server/backend required. |
| NFR-02 | The tool shall be **responsive** and usable on mobile screens (minimum 320px width) and desktops. |
| NFR-03 | The tool shall be **hostable on GitHub Pages** as a static site. |
| NFR-04 | The tool shall work in all modern browsers (Chrome, Firefox, Safari, Edge — latest two versions). |
| NFR-05 | Display items and buttons shall be large enough for easy tap interaction on mobile. |
| NFR-06 | The tool shall load and be interactive within 2 seconds on a standard connection. |

---

## 8. Hosting & Deployment

| Aspect | Detail |
|--------|--------|
| **Platform** | GitHub Pages (free static hosting). |
| **Repository** | Public GitHub repo containing the static site files. |
| **Structure** | `index.html`, `style.css`, `app.js` (single-page application). |
| **URL** | `https://<username>.github.io/<repo-name>/` |
| **Deployment** | Push to `main` branch; GitHub Pages serves automatically. |

---

> [↑ Back to Document Index](#document-index) · [← Requirements Index](INDEX.md) · [← README](../README.md)
