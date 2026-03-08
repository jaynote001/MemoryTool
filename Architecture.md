# Memory Tool — Architecture Document

## 1. System Architecture Overview

The Memory Tool is a **single-page application (SPA)** built entirely with client-side technologies. There is no backend, database, or API. The application runs in the browser and is served as static files from GitHub Pages.

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
├── index.html          # Single HTML page — markup for all three screens
├── style.css           # All styles — layout, responsiveness, theming
├── app.js              # Application logic — state management, sequencing, UI control
├── 1_Idea.txt          # Original idea document
├── Requirements.md     # Requirements specification
└── Architecture.md     # This document
```

---

## 3. Application Layers

The application follows a lightweight **Model–View–Controller (MVC)** pattern, all within a single JavaScript file (`app.js`).

```
┌─────────────────────────────────────────────────────┐
│                    app.js                            │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Model     │  │  Controller  │  │   View    │  │
│  │             │  │              │  │           │  │
│  │ SessionState│◄─┤ EventHandlers├─►│ Renderer  │  │
│  │ Sequencer   │  │ Validator    │  │ ScreenMgr │  │
│  │ Config      │  │ Navigator    │  │           │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
```

| Layer | Responsibility |
|-------|---------------|
| **Model** | Holds session state (current pointer, block, repetition), generates sequences, stores configuration. |
| **Controller** | Handles button clicks, validates input, advances session state, coordinates transitions between screens. |
| **View** | Reads state and updates the DOM — shows/hides screens, renders pointer numbers, updates progress indicators. |

---

## 4. Component Design

### 4.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        app.js                                │
│                                                              │
│  ┌──────────────────┐     ┌───────────────────────────────┐  │
│  │ SequenceGenerator │     │        SessionEngine          │  │
│  │                  │     │                               │  │
│  │ + straight(n)    │     │ + init(mode, listSize, blocks)│  │
│  │ + reverse(n)     │◄────┤ + next() → pointer | null     │  │
│  │ + jumbled(n)     │     │ + getProgress()               │  │
│  │                  │     │ + isComplete()                 │  │
│  └──────────────────┘     │ + reset()                     │  │
│                           └───────────┬───────────────────┘  │
│                                       │                      │
│  ┌──────────────────┐     ┌───────────▼───────────────────┐  │
│  │  ModeConfig      │     │        UIController           │  │
│  │                  │     │                               │  │
│  │ + getBlocks(mode)│────►│ + showSetupScreen()           │  │
│  │                  │     │ + showPracticeScreen()         │  │
│  └──────────────────┘     │ + showCompleteScreen()         │  │
│                           │ + updatePointerDisplay(n)      │  │
│  ┌──────────────────┐     │ + updateProgress(info)         │  │
│  │  InputValidator  │     │ + showError(msg)               │  │
│  │                  │────►│                               │  │
│  │ + validate(form) │     └───────────────────────────────┘  │
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Component Descriptions

#### SequenceGenerator

Generates ordered arrays of pointer numbers based on the practice element type.

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `straight(n)` | List size `n` | `[1, 2, …, n]` | Ascending order. |
| `reverse(n)` | List size `n` | `[n, n-1, …, 1]` | Descending order. |
| `jumbled(n)` | List size `n` | `[random permutation]` | Fisher-Yates shuffle of 1–n. A new permutation each call. |

#### ModeConfig

Returns the block definitions for preset modes.

| Method | Input | Output |
|--------|-------|--------|
| `getBlocks(mode)` | `"memorization"` or `"revision"` | Array of `{ type, repetitions }` objects |

Memorization returns:
```js
[
  { type: "straight", repetitions: 10 },
  { type: "reverse",  repetitions: 5  },
  { type: "jumbled",  repetitions: 10 },
  { type: "straight", repetitions: 5  }
]
```

Revision returns:
```js
[
  { type: "straight", repetitions: 5 },
  { type: "reverse",  repetitions: 3 },
  { type: "jumbled",  repetitions: 5 },
  { type: "straight", repetitions: 3 }
]
```

#### SessionEngine

Core state machine that drives the practice session.

**State:**
```
{
  listSize:          Number,        // 1–10
  blocks:            Array<Block>,  // ordered list of blocks
  currentBlockIndex: Number,        // index into blocks[]
  currentRepetition: Number,        // current rep within block (1-based)
  currentSequence:   Array<Number>, // current pointer sequence for this rep
  sequenceIndex:     Number,        // index into currentSequence
  totalPointers:     Number,        // total pointers in entire session
  pointersCompleted: Number         // pointers shown so far
}
```

**Methods:**

| Method | Description |
|--------|-------------|
| `init(listSize, blocks)` | Initializes the session with given list size and block configuration. Generates the first sequence. |
| `next()` | Advances to the next pointer. Returns the next pointer number, or `null` if the session is complete. Handles end-of-sequence → next repetition → next block transitions internally. |
| `getProgress()` | Returns `{ blockName, currentRep, totalReps, pointersCompleted, totalPointers }`. |
| `isComplete()` | Returns `true` when all blocks and repetitions are exhausted. |
| `reset()` | Clears all state, returns to initial. |

#### InputValidator

Validates user input from the setup screen.

| Check | Rule | Error Message |
|-------|------|--------------|
| List Size | Integer, 1 ≤ value ≤ 10 | "List size must be between 1 and 10." |
| Repetition Count | Integer, ≥ 1 | "Repetition count must be at least 1." |
| Custom Blocks | At least 1 block defined | "Add at least one practice block." |
| Practice Element | Must be "straight", "reverse", or "jumbled" | "Invalid practice element type." |

#### UIController

Manages DOM manipulation and screen transitions.

| Method | Description |
|--------|-------------|
| `showSetupScreen()` | Displays the setup form, hides other screens. |
| `showPracticeScreen()` | Displays the practice view with pointer number and progress. |
| `showCompleteScreen()` | Displays the completion summary. |
| `updatePointerDisplay(n)` | Sets the large pointer number in the practice screen. |
| `updateProgress(info)` | Updates block name, repetition counter, and overall progress bar/text. |
| `showError(msg)` | Displays a validation error message on the setup screen. |

---

## 5. State Machine

The application operates as a finite state machine with three states:

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
       │   pointers]       complete]               │
       │     │                │                    │
       │     ▼                ▼                    │
       │  (stay in       ┌──────────┐              │
       └── PRACTICE)     │ COMPLETE │──────────────┘
                         └──────────┘
                       [Practice Again]
```

| State | Entry Action | User Actions |
|-------|-------------|-------------|
| **SETUP** | Show setup form, clear any previous state. | Select mode, enter list size, configure custom blocks, click Start. |
| **PRACTICE** | Initialize SessionEngine, display first pointer. | Click Next (advance), click Back (abort → SETUP). |
| **COMPLETE** | Display summary stats. | Click Practice Again (→ SETUP). |

---

## 6. Data Flow

### 6.1 Setup → Practice Transition

```
User Input                    Processing                     Output
─────────                    ──────────                     ──────
Mode selection ──────┐
                     ├──► InputValidator.validate() ──► Error message (if invalid)
List Size ───────────┤                                       │
                     │                                       │ (if valid)
Custom blocks ───────┘                                       ▼
                                                     ModeConfig.getBlocks()
                                                     or user-defined blocks
                                                             │
                                                             ▼
                                                     SessionEngine.init(listSize, blocks)
                                                             │
                                                             ▼
                                                     UIController.showPracticeScreen()
                                                     UIController.updatePointerDisplay(firstPointer)
                                                     UIController.updateProgress(info)
```

### 6.2 Next Button Press (Practice Loop)

```
[Next clicked]
      │
      ▼
SessionEngine.next()
      │
      ├──► Returns pointer number
      │         │
      │         ▼
      │    UIController.updatePointerDisplay(pointer)
      │    UIController.updateProgress(SessionEngine.getProgress())
      │
      └──► Returns null (session complete)
                │
                ▼
           UIController.showCompleteScreen()
```

---

## 7. Sequence Generation Algorithm

### 7.1 Pre-computation vs. Lazy Generation

The architecture uses **lazy generation** — sequences are generated one repetition at a time, not pre-computed for the entire session.

**Rationale:**
- Memory efficient (only one array of size N in memory at a time).
- Jumbled sequences must be randomized per repetition, so pre-computing provides no benefit.
- List sizes are small (≤ 10), so generation is instant.

### 7.2 Fisher-Yates Shuffle (for Jumbled)

```
function shuffle(array):
    for i from array.length - 1 down to 1:
        j = random integer in [0, i]
        swap array[i] and array[j]
    return array
```

Uses `Math.random()` — sufficient for non-cryptographic shuffling.

---

## 8. HTML Screen Structure

The single `index.html` contains three screen `<div>` elements. Only one is visible at a time; the UIController toggles visibility via CSS classes.

```html
<body>
  <div id="setup-screen">    <!-- Mode selection, list size, custom blocks, Start -->
  </div>

  <div id="practice-screen" class="hidden">  <!-- Pointer display, progress, Next/Back -->
  </div>

  <div id="complete-screen" class="hidden">  <!-- Summary, Practice Again -->
  </div>
</body>
```

Screen switching:
```
showSetupScreen():    setup.hidden = false;  practice.hidden = true;  complete.hidden = true;
showPracticeScreen(): setup.hidden = true;   practice.hidden = false; complete.hidden = true;
showCompleteScreen(): setup.hidden = true;   practice.hidden = true;  complete.hidden = false;
```

---

## 9. CSS Architecture

### 9.1 Layout Strategy

| Screen | Layout | Approach |
|--------|--------|----------|
| Setup | Centered card with form elements | Flexbox column, `max-width: 480px`, centered. |
| Practice | Full viewport, pointer number centered | Flexbox column, `justify-content: center`. |
| Complete | Centered card with stats | Same as setup layout. |

### 9.2 Responsive Design

| Breakpoint | Target | Adjustments |
|-----------|--------|-------------|
| ≥ 768px | Desktop / Tablet | Default styles. Pointer number font: 6rem. |
| < 768px | Mobile | Reduce padding/margins. Pointer number font: 4rem. Buttons full-width. |
| < 360px | Small mobile | Further font reduction. Stack custom block inputs vertically. |

### 9.3 Key Styling Decisions

- **Pointer number**: Largest element on screen (`4–6rem`, bold, centered) for instant readability.
- **Next button**: Large touch target (`min-height: 48px`, `min-width: 120px`) per mobile accessibility guidelines.
- **Custom blocks section**: Hidden by default, revealed with CSS transition when Custom mode is selected.

---

## 10. Event Handling Map

```
┌────────────────────────────┬──────────────────────────────────────────┐
│ DOM Event                  │ Handler Action                           │
├────────────────────────────┼──────────────────────────────────────────┤
│ Mode radio button change   │ Toggle custom blocks section visibility  │
│ "Add Block" button click   │ Append new block row to custom form      │
│ "Remove Block" button click│ Remove block row from custom form        │
│ "Start" button click       │ Validate → init session → show practice │
│ "Next" button click        │ SessionEngine.next() → update UI         │
│ "Back" button click        │ Reset session → show setup               │
│ "Practice Again" click     │ Show setup screen                        │
└────────────────────────────┴──────────────────────────────────────────┘
```

---

## 11. Total Pointers Calculation

Used for progress tracking. Computed at session initialization:

$$
\text{Total Pointers} = \sum_{b=1}^{B} \text{listSize} \times \text{repetitions}_b
$$

Where $B$ is the number of blocks.

**Example — Memorization mode, list size 5:**

$$
(5 \times 10) + (5 \times 5) + (5 \times 10) + (5 \times 5) = 50 + 25 + 50 + 25 = 150
$$

---

## 12. Error Handling

| Scenario | Handling |
|----------|---------|
| Invalid list size input | Display inline error, prevent session start. |
| Invalid repetition count | Display inline error on the specific block row. |
| No blocks in Custom mode | Display error: "Add at least one practice block." |
| Unexpected state in SessionEngine | `reset()` and return to setup screen (defensive fallback). |

No network errors or server errors are possible since the app is fully client-side.

---

## 13. Accessibility Considerations

| Aspect | Implementation |
|--------|---------------|
| Keyboard navigation | All interactive elements are native HTML (`<button>`, `<input>`, `<select>`) — inherently focusable and keyboard-operable. |
| Screen readers | Use `aria-live="polite"` on the pointer number display so changes are announced. Use `aria-label` on progress indicators. |
| Color contrast | Ensure WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for large text). |
| Touch targets | Minimum 48×48px for all buttons (per WCAG 2.5.5). |

---

## 14. Deployment Architecture

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

## 15. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | None (vanilla JS) | Minimal complexity for a single-screen interactive tool. No build step needed. |
| CSS approach | Single CSS file | App is small enough that a single file is maintainable. No preprocessor needed. |
| Module system | None (single script) | Avoids build tooling. IIFE or simple object namespacing keeps code organized. |
| Randomization | `Math.random()` | Sufficient for non-security shuffle. No crypto-grade randomness needed. |
| State management | Plain JS object | No reactive framework needed. Direct DOM updates after state changes. |
| Build tools | None | Zero-dependency static files. No bundling, transpiling, or minification required. |

---

## 16. Traceability Matrix

Maps requirements (from Requirements.md) to architectural components:

| Requirement | Component(s) |
|-------------|-------------|
| FR-01 | UIController.showSetupScreen(), index.html #setup-screen |
| FR-02 | index.html (radio buttons), Event: mode change |
| FR-03 | index.html (number input), InputValidator |
| FR-04 | index.html (custom block rows), Event: Add/Remove Block |
| FR-05 | InputValidator.validate() |
| FR-06 | Event: Start click → Controller |
| FR-07 | UIController.updatePointerDisplay(), #practice-screen |
| FR-08 | Event: Next click → SessionEngine.next() |
| FR-09 | UIController.updateProgress(), SessionEngine.getProgress() |
| FR-10 | SequenceGenerator, SessionEngine |
| FR-11 | SessionEngine.next() block transition logic |
| FR-12 | UIController.showCompleteScreen(), #complete-screen |
| FR-13 | Event: Back click → SessionEngine.reset() |
| FR-14 | ModeConfig.getBlocks() |
| FR-15 | SessionEngine.init() with user-defined blocks |
| FR-16 | SequenceGenerator.jumbled() — new shuffle per call |
| NFR-01 | Entire architecture (client-side only) |
| NFR-02 | CSS responsive breakpoints |
| NFR-03 | Deployment architecture (GitHub Pages) |
| NFR-04 | Vanilla JS, no framework dependencies |
| NFR-05 | CSS touch target sizing |
| NFR-06 | Zero dependencies, three small static files |
