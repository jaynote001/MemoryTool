# Memory Tool — General Architecture

> [← Architecture Index](INDEX.md) · [← README](../README.md)
>
> Shared architecture for the Memory Tool. Tab-specific details are in [1_Architecture_List.md](1_Architecture_List.md) and [2_Architecture_Map.md](2_Architecture_Map.md).

---

## Document Index

- [1. System Architecture Overview](#1-system-architecture-overview)
- [2. File Structure](#2-file-structure)
- [3. Application Layers](#3-application-layers)
- [4. Tab Architecture](#4-tab-architecture)
  - [4.1 Tab Structure](#41-tab-structure)
  - [4.2 Tab Switching Rules](#42-tab-switching-rules)
- [5. Shared Component Design](#5-shared-component-design)
  - [5.1 Component Diagram](#51-component-diagram)
  - [5.2 SequenceGenerator](#52-sequencegenerator-shared)
  - [5.3 TabManager](#53-tabmanager)
  - [5.4 UIController](#54-uicontroller-shared)
- [6. State Machine](#6-state-machine)
- [7. Data Flow](#7-data-flow)
  - [7.1 Setup → Practice Transition](#71-setup--practice-transition)
  - [7.2 Next Button Press](#72-next-button-press-practice-loop)
- [8. Sequence Generation Algorithm](#8-sequence-generation-algorithm)
- [9. Technology Decisions](#9-technology-decisions)

### Related Documents

| Document | Link |
|----------|------|
| List Architecture | [1_Architecture_List.md](1_Architecture_List.md) |
| Map Architecture | [2_Architecture_Map.md](2_Architecture_Map.md) |
| General Requirements | [0_Requirements_General.md](../2_Requirements/0_Requirements_General.md) |

---

## 1. System Architecture Overview

The Memory Tool is a **single-page application (SPA)** built entirely with client-side technologies. There is no backend, database, or API. The application runs in the browser and is served as static files from GitHub Pages. It supports two memorization types — **List** and **Map** — accessible via tabs.

```
┌──────────────────────────────────────────────────────┐
│                     Browser                          │
│                                                      │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ index.html │  │  style.css  │  │   app.js     │  │
│  │  (View)    │  │  (Styling)  │  │  (Logic)     │  │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
│        │                │                │           │
│        └────────────────┼────────────────┘           │
│                         │                            │
│              ┌──────────▼──────────┐                 │
│              │    DOM Rendering    │                 │
│              └─────────────────────┘                 │
└──────────────────────────────────────────────────────┘
         │
         │  Static files served over HTTPS
         │
┌────────▼─────────┐
│  GitHub Pages    │
│  (Static Host)   │
└──────────────────┘
```

---

## 2. File Structure

```
MemoryTool/
├── index.html              # Single HTML page — tabs, screens for both List and Map
├── style.css               # All styles — layout, responsiveness, theming
├── app.js                  # Application logic — shared + tab-specific modules
├── 1_Idea/                 # Idea documents
│   ├── 0_Idea_MemoryTool.txt
│   ├── 1_Idea_List_Memorization.txt
│   └── 2_Idea_Map_Memorization.txt
├── 2_Requirements/         # Requirements documents
│   ├── 0_Requirements_General.md
│   ├── 1_Requirements_List.md
│   └── 2_Requirements_Map.md
├── 3_Architecture/         # Architecture documents
│   ├── 0_Architecture_General.md    ← This document
│   ├── 1_Architecture_List.md
│   └── 2_Architecture_Map.md
└── 4_SETUP.md              # Setup & deployment guide
```

---

## 3. Application Layers

The application follows a lightweight **Model–View–Controller (MVC)** pattern, all within a single JavaScript file (`app.js`). Both tabs share the same architectural layers but use tab-specific instances for state and configuration.

```
┌─────────────────────────────────────────────────────────┐
│                       app.js                            │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │   Model      │  │  Controller   │  │   View      │  │
│  │              │  │               │  │             │  │
│  │ SessionState │◄─┤ EventHandlers ├─►│ Renderer    │  │
│  │ Sequencer    │  │ Validator     │  │ ScreenMgr   │  │
│  │ Config       │  │ TabManager    │  │ TabRenderer │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

| Layer | Responsibility |
|-------|---------------|
| **Model** | Holds session state (current item, block, repetition), generates sequences, stores configuration. Separate state per tab. |
| **Controller** | Handles button clicks, validates input, advances session state, manages tab switching, coordinates screen transitions. |
| **View** | Reads state and updates the DOM — shows/hides screens and tabs, renders items, updates progress indicators. |

---

## 4. Tab Architecture

### 4.1 Tab Structure

The tool uses a tab-based UI where each tab encapsulates its own independent flow (setup → practice → complete). Tabs share common components but maintain separate state.

```
┌─────────────────────────────────────────────────┐
│                  TabManager                     │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   List Tab      │  │    Map Tab          │  │
│  │                 │  │                     │  │
│  │ ┌─────────────┐ │  │ ┌─────────────────┐ │  │
│  │ │ SetupScreen │ │  │ │ SetupScreen     │ │  │
│  │ │ PracticeScr │ │  │ │ PracticeScreen  │ │  │
│  │ │ CompleteScr │ │  │ │ CompleteScreen  │ │  │
│  │ └─────────────┘ │  │ └─────────────────┘ │  │
│  │                 │  │                     │  │
│  │ SessionEngine   │  │ SessionEngine       │  │
│  │ ModeConfig      │  │ ModeConfig          │  │
│  │ InputValidator   │  │ InputValidator       │  │
│  └─────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.2 Tab Switching Rules

| Rule | Description |
|------|-------------|
| Tab switching is allowed only from the setup screen. | During practice/complete, tabs are disabled to prevent accidental session loss. |
| Each tab retains its setup form state. | Switching tabs does not reset the other tab's form inputs. |
| Active tab is visually highlighted. | CSS class `.tab-active` applied to the selected tab button. |

---

## 5. Shared Component Design

### 5.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          app.js                                  │
│                                                                  │
│  ┌───────────────────┐                                           │
│  │ SequenceGenerator  │  (shared by both tabs)                   │
│  │                   │                                           │
│  │ + straight(n)     │                                           │
│  │ + reverse(n)      │                                           │
│  │ + jumbled(n)      │                                           │
│  └───────────────────┘                                           │
│                                                                  │
│  ┌───────────────────┐     ┌──────────────────────────────────┐  │
│  │ TabManager        │     │ UIController (shared)            │  │
│  │                   │     │                                  │  │
│  │ + switchTab(tab)  │────►│ + showSetupScreen(tab)           │  │
│  │ + getActiveTab()  │     │ + showPracticeScreen(tab)        │  │
│  └───────────────────┘     │ + showCompleteScreen(tab)        │  │
│                            │ + updateItemDisplay(tab, item)   │  │
│                            │ + updateProgress(tab, info)      │  │
│                            │ + updateNameDisplay(tab, name)   │  │
│                            │ + showError(tab, msg)            │  │
│                            └──────────────────────────────────┘  │
│                                                                  │
│  Tab-Specific Components:                                        │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │ ListModeConfig       │  │ MapModeConfig                    │  │
│  │ ListSessionEngine    │  │ MapSessionEngine                 │  │
│  │ ListInputValidator   │  │ MapInputValidator                │  │
│  └──────────────────────┘  │ MapDataIO                        │  │
│                            └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 SequenceGenerator (Shared)

Generates ordered arrays of indices based on the practice element type. Used by both List and Map tabs.

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `straight(n)` | Size `n` | `[1, 2, …, n]` | Ascending order. |
| `reverse(n)` | Size `n` | `[n, n-1, …, 1]` | Descending order. |
| `jumbled(n)` | Size `n` | `[random permutation]` | Fisher-Yates shuffle of 1–n. A new permutation each call. |

### 5.3 TabManager

Manages tab selection and visibility.

| Method | Description |
|--------|-------------|
| `switchTab(tabId)` | Hides all tab content, shows the selected tab's screens. Updates active tab styling. |
| `getActiveTab()` | Returns the currently active tab identifier (`"list"` or `"map"`). |

### 5.4 UIController (Shared)

Manages DOM manipulation and screen transitions. All methods are tab-aware.

| Method | Description |
|--------|-------------|
| `showSetupScreen(tab)` | Displays the setup form for the given tab, hides other screens. |
| `showPracticeScreen(tab)` | Displays the practice view with item display and progress. |
| `showCompleteScreen(tab)` | Displays the completion summary. |
| `updateItemDisplay(tab, item)` | Sets the large displayed item (pointer number, key, or value). |
| `updateNameDisplay(tab, name)` | Shows the List Name or Mapping Name near the item display. |
| `updateProgress(tab, info)` | Updates block name, repetition counter, and overall progress bar/text. |
| `showError(tab, msg)` | Displays a validation error message on the tab's setup screen. |

---

## 6. State Machine

Each tab operates as an independent finite state machine with three states:

```
                ┌──────────┐
                │  SETUP   │◄──────────────────────┐
                └────┬─────┘                       │
                     │ [Start clicked,             │
                     │  input valid]               │
                     ▼                             │
                ┌──────────┐                       │
       ┌───────►│ PRACTICE │                       │
       │        └────┬─────┘                       │
       │             │                             │
       │     ┌───────┴────────┐                    │
       │     │                │                    │
       │  [Next:           [Next:               [Back]
       │   more            session                 │
       │   items]          complete]               │
       │     │                │                    │
       │     ▼                ▼                    │
       │  (stay in       ┌──────────┐              │
       └── PRACTICE)     │ COMPLETE │──────────────┘
                         └──────────┘
                       [Practice Again]
```

| State | Entry Action | User Actions |
|-------|-------------|-------------|
| **SETUP** | Show setup form, clear any previous state. Tab switching enabled. | Select mode, enter name/size, configure custom blocks, click Start. |
| **PRACTICE** | Initialize SessionEngine, display first item and name. Tab switching disabled. | Click Next (advance), click Back (abort → SETUP). |
| **COMPLETE** | Display summary stats. Tab switching re-enabled. | Click Practice Again (→ SETUP). |

---

## 7. Data Flow

### 7.1 Setup → Practice Transition

```
User Input                    Processing                     Output
─────────                    ──────────                     ──────
Active tab ──────────┐
                     │
Name (List/Map) ─────┤
                     ├──► InputValidator.validate() ──► Error message (if invalid)
Mode selection ──────┤                                       │
                     │                                       │ (if valid)
Size input ──────────┤                                       ▼
                     │                               ModeConfig.getBlocks()
Custom blocks ───────┘                               or user-defined blocks
                                                             │
                                                             ▼
                                                     SessionEngine.init(size, blocks)
                                                             │
                                                             ▼
                                                     UIController.showPracticeScreen(tab)
                                                     UIController.updateNameDisplay(tab, name)
                                                     UIController.updateItemDisplay(tab, firstItem)
                                                     UIController.updateProgress(tab, info)
```

### 7.2 Next Button Press (Practice Loop)

```
[Next clicked]
      │
      ▼
SessionEngine.next()
      │
      ├──► Returns item (pointer / key / value)
      │         │
      │         ▼
      │    UIController.updateItemDisplay(tab, item)
      │    UIController.updateProgress(tab, SessionEngine.getProgress())
      │
      └──► Returns null (session complete)
                │
                ▼
           UIController.showCompleteScreen(tab)
```

---

## 8. Sequence Generation Algorithm

### 8.1 Pre-computation vs. Lazy Generation

The architecture uses **lazy generation** — sequences are generated one repetition at a time, not pre-computed for the entire session.

**Rationale:**
- Memory efficient (only one array of size N in memory at a time).
- Jumbled sequences must be randomized per repetition, so pre-computing provides no benefit.
- Sizes are small, so generation is instant.

### 8.2 Fisher-Yates Shuffle (for Jumbled)

```
function shuffle(array):
    for i from array.length - 1 down to 1:
        j = random integer in [0, i]
        swap array[i] and array[j]
    return array
```

Uses `Math.random()` — sufficient for non-cryptographic shuffling.

---

## 9. HTML Screen Structure

The single `index.html` contains tab navigation and per-tab screen `<div>` elements. Only one tab and one screen within it are visible at a time.

```html
<body>
  <!-- Tab Navigation -->
  <nav class="tab-nav">
    <button class="tab-btn tab-active" data-tab="list">List</button>
    <button class="tab-btn" data-tab="map">Map</button>
  </nav>

  <!-- List Tab Screens -->
  <div id="list-tab" class="tab-content">
    <div id="list-setup-screen" class="screen">...</div>
    <div id="list-practice-screen" class="screen hidden">...</div>
    <div id="list-complete-screen" class="screen hidden">...</div>
  </div>

  <!-- Map Tab Screens -->
  <div id="map-tab" class="tab-content hidden">
    <div id="map-setup-screen" class="screen">...</div>
    <div id="map-practice-screen" class="screen hidden">...</div>
    <div id="map-complete-screen" class="screen hidden">...</div>
  </div>
</body>
```

Screen switching per tab:
```
showSetupScreen(tab):    setup.hidden = false;  practice.hidden = true;  complete.hidden = true;
showPracticeScreen(tab): setup.hidden = true;   practice.hidden = false; complete.hidden = true;
showCompleteScreen(tab): setup.hidden = true;   practice.hidden = true;  complete.hidden = false;
```

Tab switching:
```
switchTab(tab): hide all tab-content; show selected tab-content; update tab-btn classes.
```

---

## 10. CSS Architecture

### 10.1 Layout Strategy

| Element | Layout | Approach |
|---------|--------|----------|
| Tab navigation | Horizontal buttons at top | Flexbox row, equal-width buttons, active state highlighted. |
| Setup screen | Centered card with form elements | Flexbox column, `max-width: 480px`, centered. |
| Practice screen | Centered viewport, item + name displayed | Flexbox column, `justify-content: center`. |
| Complete screen | Centered card with stats | Same as setup layout. |

### 10.2 Responsive Design

| Breakpoint | Target | Adjustments |
|-----------|--------|-------------|
| ≥ 768px | Desktop / Tablet | Default styles. Item display font: 6rem. |
| < 768px | Mobile | Reduce padding/margins. Item display font: 4rem. Buttons full-width. |
| < 360px | Small mobile | Further font reduction. Stack custom block inputs vertically. |

### 10.3 Key Styling Decisions

- **Tab navigation**: Prominent, easily tappable tab buttons. Active tab has distinct background/border.
- **Item display**: Largest element on screen (`4–6rem`, bold, centered) for instant readability.
- **Name display**: Shown near (above) the item display, smaller font, visually grouped with the item.
- **Next button**: Large touch target (`min-height: 48px`, `min-width: 120px`) per mobile accessibility guidelines.
- **Custom blocks section**: Hidden by default, revealed with CSS transition when Custom mode is selected.

---

## 11. Event Handling Map

```
┌─────────────────────────────────┬──────────────────────────────────────────┐
│ DOM Event                       │ Handler Action                           │
├─────────────────────────────────┼──────────────────────────────────────────┤
│ Tab button click                │ TabManager.switchTab() → show tab content│
│ Mode radio button change        │ Toggle custom blocks section visibility  │
│ "Add Block" button click        │ Append new block row to custom form      │
│ "Remove Block" button click     │ Remove block row from custom form        │
│ "Start" button click            │ Validate → init session → show practice  │
│ "Next" button click             │ SessionEngine.next() → update UI         │
│ "Back" button click             │ Reset session → show setup               │
│ "Practice Again" click          │ Show setup screen                        │
│ "Add Key-Value Pair" click (Map)│ Append new K-V input row                 │
└─────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 12. Total Items Calculation

Used for progress tracking. Computed at session initialization:

$$
\text{Total Items} = \sum_{b=1}^{B} \text{size} \times \text{repetitions}_b
$$

Where $B$ is the number of blocks and `size` is the list size or map size.

**Example — List Memorization mode, list size 5:**

$$
(5 \times 10) + (5 \times 5) + (5 \times 10) + (5 \times 5) = 50 + 25 + 50 + 25 = 150
$$

**Example — Map Memorization mode, map size 5:**

$$
(5 \times 10) + (5 \times 10) + (5 \times 5) + (5 \times 10) + (5 \times 10) + (5 \times 5) = 50 + 50 + 25 + 50 + 50 + 25 = 250
$$

---

## 13. Error Handling

| Scenario | Handling |
|----------|---------|
| Invalid size input | Display inline error, prevent session start. |
| Invalid repetition count | Display inline error on the specific block row. |
| No blocks in Custom mode | Display error: "Add at least one practice block." |
| Missing name input | Display error: "Please enter a name." |
| Unexpected state in SessionEngine | `reset()` and return to setup screen (defensive fallback). |

No network errors or server errors are possible since the app is fully client-side.

---

## 14. Accessibility Considerations

| Aspect | Implementation |
|--------|---------------|
| Keyboard navigation | All interactive elements are native HTML (`<button>`, `<input>`, `<select>`) — inherently focusable and keyboard-operable. Tab buttons included in tab order. |
| Screen readers | Use `aria-live="polite"` on the item display so changes are announced. Use `aria-label` on progress indicators. Tabs use `role="tablist"` / `role="tab"` / `role="tabpanel"`. |
| Color contrast | Ensure WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for large text). |
| Touch targets | Minimum 48×48px for all buttons (per WCAG 2.5.5). |

---

## 15. Deployment Architecture

```
┌──────────────┐        git push        ┌─────────────────┐
│  Developer   │ ──────────────────────► │  GitHub Repo    │
│  (local)     │                         │  (main branch)  │
└──────────────┘                         └────────┬────────┘
                                                  │
                                         GitHub Pages Build
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  GitHub Pages   │
                                         │  CDN / Static   │
                                         │  Hosting        │
                                         └────────┬────────┘
                                                  │ HTTPS
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │  Laptop  │ │  Mobile  │ │  Tablet  │
                              │ Browser  │ │ Browser  │ │ Browser  │
                              └──────────┘ └──────────┘ └──────────┘
```

**Deployment steps:**
1. Push `index.html`, `style.css`, `app.js` to the `main` branch.
2. Enable GitHub Pages in repository settings (source: `main` branch, root folder).
3. Site is live at `https://<username>.github.io/<repo-name>/`.

---

## 16. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | None (vanilla JS) | Minimal complexity for a tab-based interactive tool. No build step needed. |
| CSS approach | Single CSS file | App is small enough that a single file is maintainable. No preprocessor needed. |
| Module system | None (single script) | Avoids build tooling. IIFE or simple object namespacing keeps code organized. |
| Randomization | `Math.random()` | Sufficient for non-security shuffle. No crypto-grade randomness needed. |
| State management | Plain JS objects | No reactive framework needed. Direct DOM updates after state changes. Separate state per tab. |
| File I/O | Browser File API + Blob/URL API | Import via `FileReader.readAsText()`, export via `Blob` + `URL.createObjectURL()`. No server needed. |
| Build tools | None | Zero-dependency static files. No bundling, transpiling, or minification required. |

---

> [↑ Back to Document Index](#document-index) · [← Architecture Index](INDEX.md) · [← README](../README.md)
