# Memory Tool — List Memorization Architecture

> [← Architecture Index](INDEX.md) · [← README](../README.md)
>
> This document covers architecture specific to the **List Memorization** tab. For shared architecture, see [0_Architecture_General.md](0_Architecture_General.md).

---

## Document Index

- [1. Overview](#1-overview)
- [2. List-Specific Components](#2-list-specific-components)
  - [2.1 Component Diagram](#21-component-diagram)
  - [2.2 ListModeConfig](#22-listmodeconfig)
  - [2.3 ListSessionEngine](#23-listsessionengine)
  - [2.4 ListInputValidator](#24-listinputvalidator)
- [3. List Setup Screen — HTML Structure](#3-list-setup-screen--html-structure)
- [4. List Practice Screen — Display Logic](#4-list-practice-screen--display-logic)
- [5. List Data Flow — Sequence Generation](#5-list-data-flow--sequence-generation)
- [6. Traceability Matrix](#6-traceability-matrix)

### Related Documents

| Document | Link |
|----------|------|
| General Architecture | [0_Architecture_General.md](0_Architecture_General.md) |
| Map Architecture | [2_Architecture_Map.md](2_Architecture_Map.md) |
| List Requirements | [1_Requirements_List.md](../2_Requirements/1_Requirements_List.md) |

---

## 1. Overview

The List tab allows users to practice memorizing ordered lists by presenting pointer numbers one at a time. The user enters a List Name and List Size, selects a mode, and the tool drives a sequence of pointer presentations through the practice session.

---

## 2. List-Specific Components

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   List Tab (app.js)                           │
│                                                              │
│  ┌──────────────────┐     ┌───────────────────────────────┐  │
│  │ SequenceGenerator │     │     ListSessionEngine         │  │
│  │ (shared)          │     │                               │  │
│  │ + straight(n)     │     │ + init(name, size, blocks)    │  │
│  │ + reverse(n)      │◄────┤ + next() → pointer | null     │  │
│  │ + jumbled(n)      │     │ + getProgress()               │  │
│  │                   │     │ + isComplete()                 │  │
│  └───────────────────┘     │ + reset()                     │  │
│                            └───────────┬───────────────────┘  │
│                                        │                      │
│  ┌──────────────────┐      ┌───────────▼───────────────────┐  │
│  │ ListModeConfig   │      │     UIController (shared)     │  │
│  │                  │      │                               │  │
│  │ + getBlocks(mode)│─────►│ + showPracticeScreen("list")  │  │
│  │                  │      │ + updateItemDisplay("list", n) │  │
│  └──────────────────┘      │ + updateNameDisplay("list", s) │  │
│                            │ + updateProgress("list", info) │  │
│  ┌──────────────────┐      │                               │  │
│  │ ListInputValidator│      │                               │  │
│  │                  │─────►│                               │  │
│  │ + validate(form) │      └───────────────────────────────┘  │
│  └──────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 ListModeConfig

Returns the block definitions for preset modes specific to List memorization.

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

### 2.3 ListSessionEngine

Core state machine that drives the List practice session. Extends the shared SessionEngine pattern.

**State:**
```
{
  listName:          String,        // user-entered list name
  listSize:          Number,        // any valid positive integer
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
| `init(listName, listSize, blocks)` | Initializes the session with name, size, and block configuration. Generates the first sequence. |
| `next()` | Advances to the next pointer. Returns the next pointer number, or `null` if session complete. Handles end-of-sequence → next repetition → next block transitions. |
| `getProgress()` | Returns `{ blockName, currentRep, totalReps, pointersCompleted, totalPointers, listName }`. |
| `isComplete()` | Returns `true` when all blocks and repetitions are exhausted. |
| `reset()` | Clears all state, returns to initial. |

### 2.4 ListInputValidator

Validates user input from the List setup screen.

| Check | Rule | Error Message |
|-------|------|--------------|
| List Name | Non-empty string | "Please enter a list name." |
| List Size | Positive integer ≥ 1 | "List size must be a valid positive number." |
| Repetition Count | Integer, ≥ 1 | "Repetition count must be at least 1." |
| Custom Blocks | At least 1 block defined | "Add at least one practice block." |
| Practice Element | Must be "straight", "reverse", or "jumbled" | "Invalid practice element type." |

---

## 3. List Setup Screen — HTML Structure

```html
<div id="list-setup-screen" class="screen">
  <h1>List Memorization</h1>

  <!-- List Name -->
  <div class="form-group">
    <label for="list-name">List Name</label>
    <input type="text" id="list-name" placeholder="e.g., Presidents of USA">
  </div>

  <!-- Mode Selection -->
  <fieldset class="form-group">
    <legend>Mode</legend>
    <label><input type="radio" name="list-mode" value="memorization" checked> Memorization</label>
    <label><input type="radio" name="list-mode" value="revision"> Revision</label>
    <label><input type="radio" name="list-mode" value="custom"> Custom</label>
  </fieldset>

  <!-- List Size -->
  <div class="form-group">
    <label for="list-size">List Size</label>
    <input type="number" id="list-size" min="1" value="5">
  </div>

  <!-- Custom Blocks (hidden unless Custom mode) -->
  <div id="list-custom-section" class="custom-section hidden">
    <div id="list-custom-blocks"></div>
    <button id="list-add-block-btn">+ Add Block</button>
  </div>

  <div id="list-error-message" class="error-message hidden"></div>
  <button id="list-start-btn" class="btn btn-primary">Start</button>
</div>
```

---

## 4. List Practice Screen — Display Logic

During practice, the screen shows:

```
┌─────────────────────────────────────┐
│  Straight — Rep 2 of 10            │
│  Overall: 8 / 150                  │
│                                     │
│         "My List Name"              │
│              ┌─────┐                │
│              │  3  │                │
│              └─────┘                │
│                                     │
│    [ BACK ]          [ NEXT ]       │
└─────────────────────────────────────┘
```

| Element | Source | Update Trigger |
|---------|--------|----------------|
| Block info ("Straight — Rep 2 of 10") | `ListSessionEngine.getProgress()` | Every `next()` call |
| Overall progress ("8 / 150") | `ListSessionEngine.getProgress()` | Every `next()` call |
| List Name ("My List Name") | `listName` from init | Set once at session start, static |
| Pointer number ("3") | Return value of `ListSessionEngine.next()` | Every `next()` call |

---

## 5. List Data Flow — Sequence Generation

For list practice, SequenceGenerator produces arrays of integers representing pointer positions:

```
Mode: Memorization, List Size: 3

Block 1 (Straight × 10):
  Rep 1: [1, 2, 3]  →  Rep 2: [1, 2, 3]  →  ... ×10

Block 2 (Reverse × 5):
  Rep 1: [3, 2, 1]  →  Rep 2: [3, 2, 1]  →  ... ×5

Block 3 (Jumbled × 10):
  Rep 1: [2, 3, 1]  →  Rep 2: [1, 3, 2]  →  ... ×10 (new shuffle each)

Block 4 (Straight × 5):
  Rep 1: [1, 2, 3]  →  Rep 2: [1, 2, 3]  →  ... ×5
```

---

## 6. Traceability Matrix

Maps List requirements to architectural components:

| Requirement | Component(s) |
|-------------|-------------|
| LFR-01 | index.html `#list-size` input, ListInputValidator |
| LFR-02 | index.html `#list-name` input, ListInputValidator |
| LFR-03 | index.html `#list-custom-section`, Event: mode change |
| LFR-04 | ListInputValidator.validate() |
| LFR-05 | UIController.updateNameDisplay("list", name), `#list-practice-screen` |
| LFR-06 | UIController.updateItemDisplay("list", pointer), `#list-practice-screen` |
| LFR-07 | UIController.updateProgress("list", info), ListSessionEngine.getProgress() |
| LFR-08 | SequenceGenerator, ListSessionEngine.next() |
| LFR-09 | UIController.showCompleteScreen("list"), `#list-complete-screen` |

---

> [↑ Back to Document Index](#document-index) · [← Architecture Index](INDEX.md) · [← README](../README.md)
