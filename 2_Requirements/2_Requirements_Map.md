# Memory Tool — Map Memorization Requirements

> This document covers requirements specific to the **Map Memorization** tab. For shared requirements, see [2.0_Requirements_General.md](2.0_Requirements_General.md).

---

## 1. Overview

The Map Memorization tab helps users learn and retain key-value mappings (K→V) through structured repetition. The tool presents either a key or a value on screen; the user mentally recalls the corresponding counterpart and advances via a "Next" button. Practice supports both directions: Key-to-Value (K2V) and Value-to-Key (V2K).

---

## 2. Glossary

| Term | Definition |
|------|-----------|
| **Map** | A collection of key-value pairs: (k1→v1), (k2→v2), …, (kn→vn). |
| **Key (K)** | The lookup element in a mapping pair. |
| **Value (V)** | The associated element for a given key. |
| **Map Size** | The total number of key-value pairs (user-selected, 1–10). |
| **K2V (Key-to-Value)** | Practice direction where a key is displayed and the user recalls the value. |
| **V2K (Value-to-Key)** | Practice direction where a value is displayed and the user recalls the key. |

---

## 3. Practice Elements

### 3.1 Straight K2V

- Keys are presented in ascending order: k1 → k2 → k3 → … → kn.
- The user recalls the corresponding value for each key.
- The sequence repeats for the configured repetition count.
- Example (map size 3, repetitions 3): `k1-k2-k3 | k1-k2-k3 | k1-k2-k3`

### 3.2 Straight V2K

- Values are presented in ascending order: v1 → v2 → v3 → … → vn.
- The user recalls the corresponding key for each value.
- The sequence repeats for the configured repetition count.
- Example (map size 3, repetitions 3): `v1-v2-v3 | v1-v2-v3 | v1-v2-v3`

### 3.3 Reverse K2V

- Keys are presented in descending order: kn → kn-1 → … → k1.
- The user recalls the corresponding value for each key.
- The sequence repeats for the configured repetition count.
- Example (map size 3, repetitions 3): `k3-k2-k1 | k3-k2-k1 | k3-k2-k1`

### 3.4 Reverse V2K

- Values are presented in descending order: vn → vn-1 → … → v1.
- The user recalls the corresponding key for each value.
- The sequence repeats for the configured repetition count.
- Example (map size 3, repetitions 3): `v3-v2-v1 | v3-v2-v1 | v3-v2-v1`

### 3.5 Jumbled K2V

- Keys are presented in a random (shuffled) order.
- Each repetition generates a **new random permutation** of k1–kn.
- The user recalls the corresponding value for each key.
- Example (map size 3, repetitions 3): `k2-k1-k3 | k3-k1-k2 | k1-k3-k2`

### 3.6 Jumbled V2K

- Values are presented in a random (shuffled) order.
- Each repetition generates a **new random permutation** of v1–vn.
- The user recalls the corresponding key for each value.
- Example (map size 3, repetitions 3): `v2-v1-v3 | v3-v1-v2 | v1-v3-v2`

---

## 4. Practice Modes

### 4.1 Memorization Mode

A preset sequence designed for initial learning:

| Block | Practice Element | Repetition Count |
|-------|-----------------|-----------------|
| 1 | Straight K2V | 10 |
| 2 | Jumbled K2V | 10 |
| 3 | Straight K2V | 5 |
| 4 | Straight V2K | 10 |
| 5 | Jumbled V2K | 10 |
| 6 | Straight V2K | 5 |

**User Input:** Map Size We should be able to enter any number of Key Value Pairs through add button step by step.

### 4.2 Revision Mode

A shorter preset sequence for review:

| Block | Practice Element | Repetition Count |
|-------|-----------------|-----------------|
| 1 | Straight K2V | 5 |
| 2 | Jumbled K2V | 5 |
| 3 | Straight K2V | 3 |
| 4 | Straight V2K | 5 |
| 5 | Jumbled V2K | 5 |
| 6 | Straight V2K | 3 |

**User Input:** Map Size We should be able to enter any number of Key Value Pairs through add button step by step.

### 4.3 Custom Mode

Full user control over the practice session:

**User Inputs:**
- Map Size (1–10).
- Number of practice blocks.
- For each block:
  - Practice Element type (Straight K2V / Straight V2K / Reverse K2V / Reverse V2K / Jumbled K2V / Jumbled V2K).
  - Repetition Count (≥ 1).

---

## 5. Functional Requirements

### 5.1 Setup Screen

| ID | Requirement |
|----|------------|
| MFR-01 | The user shall input a **Map Size** of any size. |
| MFR-02 | The user shall input a **Mapping Name** (text field) to identify the mapping being practiced. |
| MFR-03 | When Custom mode is selected, each block shall offer Practice Element choices: Straight K2V, Straight V2K, Reverse K2V, Reverse V2K, Jumbled K2V, or Jumbled V2K. |

### 5.2 Practice Screen

| ID | Requirement |
|----|------------|
| MFR-05 | The tool shall display the **Mapping Name** on the practice screen throughout the session. |
| MFR-06 | For K2V elements, the tool shall display the **current key** prominently (large, centered) and the user recalls the value. |
| MFR-07 | For V2K elements, the tool shall display the **current value** prominently (large, centered) and the user recalls the key. |
| MFR-08 | The tool shall indicate the current practice direction (K2V or V2K) in the block info. |
| MFR-09 | Progress information shall show: current block name (e.g., "Straight K2V"), current repetition number / total repetitions, and overall progress (e.g., "Item 5 of 240"). |
| MFR-10 | Within a block, the item sequence follows the practice element order and direction, repeating for the configured repetition count. |

### 5.3 Completion Screen

| ID | Requirement |
|----|------------|
| MFR-11 | The completion summary shall display: total items practiced and blocks completed. |

---

## 6. User Interface Wireframe (Text)

```
┌─────────────────────────────────────┐
│   [ List ]  [ Map ]                 │
├─────────────────────────────────────┤
│          MAP MEMORIZATION           │
│                                     │
│  Mapping Name: [ ____________ ]     │
│                                     │
│  Mode:  (●) Memorization            │
│         ( ) Revision                │
│         ( ) Custom                  │
│                                     │
│  Map Size:  [ 5 ]  (1–10)          │
│                                     │
│  ┌─── Custom Only ───────────────┐  │
│  │ Block 1: [Straight K2V ▼] x[3]│  │
│  │ Block 2: [Reverse V2K ▼] x[2]│  │
│  │        [+ Add Block]          │  │
│  └───────────────────────────────┘  │
│                                     │
│          [ START ]                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Straight K2V — Rep 2 of 10        │
│  Overall: 8 / 300                  │
│                                     │
│       "My Mapping Name"             │
│              ┌─────┐                │
│              │ k3  │                │
│              └─────┘                │
│                                     │
│                                     │
│    [ BACK ]          [ NEXT ]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          SESSION COMPLETE           │
│                                     │
│  Total Items Practiced: 300        │
│  Blocks Completed: 8               │
│                                     │
│        [ PRACTICE AGAIN ]           │
└─────────────────────────────────────┘
```
│  Overall: 8 / 300                  │
│                                     │
│                                     │
│              ┌─────┐                │
│              │ k3  │                │
│              └─────┘                │
│                                     │
│                                     │
│    [ BACK ]          [ NEXT ]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          SESSION COMPLETE           │
│                                     │
│  Total Items Practiced: 300        │
│  Blocks Completed: 8               │
│                                     │
│        [ PRACTICE AGAIN ]           │
└─────────────────────────────────────┘
```

---
