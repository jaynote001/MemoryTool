# Memory Tool — Requirements Document

## 1. Overview

A web-based memorization practice tool that helps users learn and retain ordered lists (1–10 items) through structured repetition. The tool presents list pointer numbers one at a time; the user mentally recalls the associated content and advances via a "Next" button. Three practice modes offer progressively flexible control over the drill sequence.

---

## 2. Objectives

- Help users memorize short ordered lists through repeated practice.
- Support straight, reverse, and jumbled recall orders.
- Provide preset modes (Memorization, Revision) for quick sessions and a Custom mode for full control.
- Be accessible on laptop and mobile via a hosted static site (e.g., GitHub Pages).

---

## 3. Glossary

| Term | Definition |
|------|-----------|
| **List** | An ordered collection of items the user wants to memorize, containing 1–10 pointers. |
| **List Pointer** | A numbered position in the list (e.g., pointer 3 = the 3rd item). |
| **List Size** | The total number of pointers in the list (user-selected, 1–10). |
| **Practice Element** | A drill type that defines the order in which pointers are presented. |
| **Repetition** | One complete pass through all pointers in the specified order. |
| **Repetition Count** | The number of times a practice element's sequence is repeated. |
| **Practice Session** | A full run composed of one or more practice element blocks executed in sequence. |

---

## 4. Practice Elements

### 4.1 Straight

- Pointers are presented in ascending order: 1 → 2 → 3 → … → N.
- The sequence repeats for the configured repetition count.
- Example (list size 3, repetitions 3): `1-2-3 | 1-2-3 | 1-2-3`

### 4.2 Reverse

- Pointers are presented in descending order: N → N-1 → … → 1.
- The sequence repeats for the configured repetition count.
- Example (list size 3, repetitions 3): `3-2-1 | 3-2-1 | 3-2-1`

### 4.3 Jumbled

- Pointers are presented in a random (shuffled) order.
- Each repetition generates a **new random permutation** of 1–N.
- The sequence repeats for the configured repetition count.
- Example (list size 3, repetitions 3): `2-1-3 | 3-1-2 | 1-3-2`

---

## 5. Practice Modes

### 5.1 Memorization Mode

A preset sequence designed for initial learning:

| Block | Practice Element | Repetition Count |
|-------|-----------------|-----------------|
| 1 | Straight | 10 |
| 2 | Reverse | 5 |
| 3 | Jumbled | 10 |
| 4 | Straight | 5 |

**User Input:** List Size (1–10).

### 5.2 Revision Mode

A shorter preset sequence for review:

| Block | Practice Element | Repetition Count |
|-------|-----------------|-----------------|
| 1 | Straight | 5 |
| 2 | Reverse | 3 |
| 3 | Jumbled | 5 |
| 4 | Straight | 3 |

**User Input:** List Size (1–10).

### 5.3 Custom Mode

Full user control over the practice session:

**User Inputs:**
- List Size (1–10).
- Number of practice blocks.
- For each block:
  - Practice Element type (Straight / Reverse / Jumbled).
  - Repetition Count (≥ 1).

---

## 6. Functional Requirements

### 6.1 Setup Screen

| ID | Requirement |
|----|------------|
| FR-01 | The tool shall display a setup screen on launch. |
| FR-02 | The user shall select a **Mode**: Memorization, Revision, or Custom. |
| FR-03 | The user shall input a **List Size** between 1 and 10 (inclusive). |
| FR-04 | When Custom mode is selected, the tool shall allow the user to add one or more practice blocks, each specifying a Practice Element type and a Repetition Count. |
| FR-05 | The tool shall validate all inputs before starting the session (list size in range, repetition counts ≥ 1, at least one block in Custom mode). |
| FR-06 | A **Start** button shall initiate the practice session after successful validation. |

### 6.2 Practice Screen

| ID | Requirement |
|----|------------|
| FR-07 | The tool shall display the **current list pointer number** prominently (large, centered). |
| FR-08 | The tool shall display a **"Next"** button. Clicking it advances to the next pointer in the sequence. |
| FR-09 | The tool shall display contextual progress information: current block name (e.g., "Straight"), current repetition number / total repetitions, and overall progress (e.g., "Pointer 5 of 120"). |
| FR-10 | Within a block, the pointer sequence follows the practice element order (straight, reverse, or jumbled) and repeats for the configured repetition count. |
| FR-11 | When a block's repetitions are complete, the tool shall automatically transition to the next block. |
| FR-12 | When all blocks are complete, the tool shall display a **completion summary** (total pointers practiced, blocks completed) and an option to return to the setup screen. |
| FR-13 | The tool shall provide a **Reset / Back** button to abort the current session and return to the setup screen. |

### 6.3 Session Flow

| ID | Requirement |
|----|------------|
| FR-14 | For Memorization and Revision modes, the block sequence and repetition counts are fixed as defined in Section 5. |
| FR-15 | For Custom mode, the blocks execute in the order the user defined them. |
| FR-16 | Each Jumbled repetition shall produce a new random permutation of the list pointers. |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-01 | The tool shall be a **client-side only** web application (HTML + CSS + JavaScript). No server/backend required. |
| NFR-02 | The tool shall be **responsive** and usable on mobile screens (minimum 320px width) and desktops. |
| NFR-03 | The tool shall be **hostable on GitHub Pages** as a static site. |
| NFR-04 | The tool shall work in all modern browsers (Chrome, Firefox, Safari, Edge — latest two versions). |
| NFR-05 | The pointer number display and Next button shall be large enough for easy tap interaction on mobile. |
| NFR-06 | The tool shall load and be interactive within 2 seconds on a standard connection. |

---

## 8. User Interface Wireframe (Text)

```
┌─────────────────────────────────────┐
│          MEMORY TOOL                │
│                                     │
│  Mode:  (●) Memorization            │
│         ( ) Revision                │
│         ( ) Custom                  │
│                                     │
│  List Size:  [ 5 ]  (1–10)         │
│                                     │
│  ┌─── Custom Only ───────────────┐  │
│  │ Block 1: [Straight ▼]  x [3] │  │
│  │ Block 2: [Reverse  ▼]  x [2] │  │
│  │        [+ Add Block]          │  │
│  └───────────────────────────────┘  │
│                                     │
│          [ START ]                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Straight — Rep 2 of 10            │
│  Overall: 8 / 150                  │
│                                     │
│                                     │
│              ┌─────┐                │
│              │  3  │                │
│              └─────┘                │
│                                     │
│                                     │
│    [ BACK ]          [ NEXT ]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          SESSION COMPLETE           │
│                                     │
│  Total Pointers Practiced: 150     │
│  Blocks Completed: 4               │
│                                     │
│        [ PRACTICE AGAIN ]           │
└─────────────────────────────────────┘
```

---

## 9. Hosting & Deployment

| Aspect | Detail |
|--------|--------|
| **Platform** | GitHub Pages (free static hosting). |
| **Repository** | Public GitHub repo containing the static site files. |
| **Structure** | `index.html`, `style.css`, `app.js` (single-page application). |
| **URL** | `https://<username>.github.io/<repo-name>/` |
| **Deployment** | Push to `main` branch; GitHub Pages serves automatically. |

---

## 10. Constraints & Assumptions

- List size is limited to 1–10 pointers.
- The tool does **not** store the actual content of list items — only pointer numbers are shown. The user recalls content mentally.
- No user accounts or persistent data storage is required for v1.
- No timer or scoring mechanism in v1.

---

## 11. Future Enhancements (Out of Scope for v1)

- Allow users to input and display actual list item content alongside pointer numbers.
- Timer-based practice with speed tracking.
- Score/accuracy tracking across sessions (using local storage).
- Support for lists longer than 10 items.
- Keyboard shortcuts (e.g., Enter / Space to advance).
- Audio cues or text-to-speech for pointer numbers.
