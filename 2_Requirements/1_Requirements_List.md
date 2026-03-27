# Memory Tool — List Memorization Requirements

> [← Requirements Index](INDEX.md) · [← README](../README.md)
>
> This document covers requirements specific to the **List Memorization** tab. For shared requirements, see [0_Requirements_General.md](0_Requirements_General.md).

---

## Document Index

- [1. Overview](#1-overview)
- [2. Glossary](#2-glossary)
- [3. Practice Elements](#3-practice-elements)
  - [3.1 Straight](#31-straight)
  - [3.2 Reverse](#32-reverse)
  - [3.3 Jumbled](#33-jumbled)
- [4. Practice Modes](#4-practice-modes)
  - [4.1 Memorization Mode](#41-memorization-mode)
  - [4.2 Revision Mode](#42-revision-mode)
  - [4.3 Custom Mode](#43-custom-mode)
- [5. Functional Requirements](#5-functional-requirements)
  - [5.1 Setup Screen](#51-setup-screen)
  - [5.2 Practice Screen](#52-practice-screen)
  - [5.3 Completion Screen](#53-completion-screen)
- [6. User Interface Wireframe](#6-user-interface-wireframe-text)

### Related Documents

| Document | Link |
|----------|------|
| General Requirements | [0_Requirements_General.md](0_Requirements_General.md) |
| Map Requirements | [2_Requirements_Map.md](2_Requirements_Map.md) |
| List Architecture | [1_Architecture_List.md](../3_Architecture/1_Architecture_List.md) |

---

## 1. Overview

The List Memorization tab helps users learn and retain ordered lists (1–10 items) through structured repetition. The tool presents list pointer numbers one at a time; the user mentally recalls the associated content and advances via a "Next" button.

---

## 2. Glossary

| Term | Definition |
|------|-----------|
| **List** | An ordered collection of items the user wants to memorize, containing any size pointers. |
| **List Pointer** | A numbered position in the list (e.g., pointer 3 = the 3rd item). |
| **List Size** | The total number of pointers in the list (user-selected, any size). |

---

## 3. Practice Elements

### 3.1 Straight

- Pointers are presented in ascending order: 1 → 2 → 3 → … → N.
- The sequence repeats for the configured repetition count.
- Example (list size 3, repetitions 3): `1-2-3 | 1-2-3 | 1-2-3`

### 3.2 Reverse

- Pointers are presented in descending order: N → N-1 → … → 1.
- The sequence repeats for the configured repetition count.
- Example (list size 3, repetitions 3): `3-2-1 | 3-2-1 | 3-2-1`

### 3.3 Jumbled

- Pointers are presented in a random (shuffled) order.
- Each repetition generates a **new random permutation** of 1–N.
- The sequence repeats for the configured repetition count.
- Example (list size 3, repetitions 3): `2-1-3 | 3-1-2 | 1-3-2`

---

## 4. Practice Modes

### 4.1 Memorization Mode

A preset sequence designed for initial learning:

| Block | Practice Element | Repetition Count |
|-------|-----------------|-----------------|
| 1 | Straight | 10 |
| 2 | Reverse | 5 |
| 3 | Jumbled | 10 |
| 4 | Straight | 5 |

**User Input:** List Size (1–10).

### 4.2 Revision Mode

A shorter preset sequence for review:

| Block | Practice Element | Repetition Count |
|-------|-----------------|-----------------|
| 1 | Straight | 5 |
| 2 | Reverse | 3 |
| 3 | Jumbled | 5 |
| 4 | Straight | 3 |

**User Input:** Any List Size.

### 4.3 Custom Mode

Full user control over the practice session:

**User Inputs:**
- Any List Size.
- Number of practice blocks.
- For each block:
  - Practice Element type (Straight / Reverse / Jumbled).
  - Repetition Count (≥ 1).

---

## 5. Functional Requirements

### 5.1 Setup Screen

| ID | Requirement |
|----|------------|
| LFR-01 | The user shall input a **List Size** any size. |
| LFR-02 | The user shall input a **List Name** (text field) to identify the list being practiced. |
| LFR-03 | When Custom mode is selected, each block shall offer Practice Element choices: Straight, Reverse, or Jumbled. |
| LFR-04 | Tool can be of any size, it should be a valid number. |

### 5.2 Practice Screen

| ID | Requirement |
|----|------------|
| LFR-05 | The tool shall display the **List Name** on the practice screen throughout the session. |
| LFR-06 | The tool shall display the **current list pointer number** prominently (large, centered). |
| LFR-07 | Progress information shall show: current block name (e.g., "Straight"), current repetition number / total repetitions, and overall progress (e.g., "Pointer 5 of 120"). |
| LFR-08 | Within a block, the pointer sequence follows the practice element order (straight, reverse, or jumbled) and repeats for the configured repetition count. |

### 5.3 Completion Screen

| ID | Requirement |
|----|------------|
| LFR-09 | The completion summary shall display: total pointers practiced and blocks completed. |

---

## 6. User Interface Wireframe (Text)

```
┌─────────────────────────────────────┐
│   [ List ]  [ Map ]                 │
├─────────────────────────────────────┤
│          LIST MEMORIZATION          │
│                                     │
│  List Name: [ ____________ ]        │
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
│         "My List Name"              │
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

> [↑ Back to Document Index](#document-index) · [← Requirements Index](INDEX.md) · [← README](../README.md)
