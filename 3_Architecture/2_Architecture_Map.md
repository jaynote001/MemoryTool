# Memory Tool — Map Memorization Architecture

> [← Architecture Index](INDEX.md) · [← README](../README.md)
>
> This document covers architecture specific to the **Map Memorization** tab. For shared architecture, see [0_Architecture_General.md](0_Architecture_General.md).

---

## Document Index

- [1. Overview](#1-overview)
- [2. Map-Specific Components](#2-map-specific-components)
  - [2.1 Component Diagram](#21-component-diagram)
  - [2.2 MapModeConfig](#22-mapmodeconfig)
  - [2.3 MapSessionEngine](#23-mapsessionengine)
  - [2.4 MapInputValidator](#24-mapinputvalidator)
  - [2.5 MapDataIO](#25-mapdataio)
- [3. Map Setup Screen — HTML Structure](#3-map-setup-screen--html-structure)
  - [3.1 Key-Value Pair Input](#31-key-value-pair-input)
- [4. Map Practice Screen — Display Logic](#4-map-practice-screen--display-logic)
- [5. Map Data Flow — Sequence Generation](#5-map-data-flow--sequence-generation)
  - [5.1 Index-to-Item Resolution](#51-index-to-item-resolution)
- [6. Custom Mode — Practice Element Types](#6-custom-mode--practice-element-types)
- [7. Traceability Matrix](#7-traceability-matrix)

### Related Documents

| Document | Link |
|----------|------|
| General Architecture | [0_Architecture_General.md](0_Architecture_General.md) |
| List Architecture | [1_Architecture_List.md](1_Architecture_List.md) |
| Map Requirements | [2_Requirements_Map.md](../2_Requirements/2_Requirements_Map.md) |

---

## 1. Overview

The Map tab allows users to practice memorizing key-value mappings by presenting either a key (for K2V practice) or a value (for V2K practice) one at a time. The user enters a Mapping Name and key-value pairs via an add-button interface (or imports them from a JSON file), selects a mode, and the tool drives a sequence of item presentations through the practice session. Mappings can also be exported as JSON for reuse across sessions and devices.

---

## 2. Map-Specific Components

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Map Tab (app.js)                           │
│                                                              │
│  ┌──────────────────┐     ┌───────────────────────────────┐  │
│  │ SequenceGenerator │     │     MapSessionEngine          │  │
│  │ (shared)          │     │                               │  │
│  │ + straight(n)     │     │ + init(name, pairs, blocks)   │  │
│  │ + reverse(n)      │◄────┤ + next() → item | null        │  │
│  │ + jumbled(n)      │     │ + getProgress()               │  │
│  │                   │     │ + isComplete()                 │  │
│  └───────────────────┘     │ + reset()                     │  │
│                            └───────────┬───────────────────┘  │
│                                        │                      │
│  ┌──────────────────┐      ┌───────────▼───────────────────┐  │
│  │ MapModeConfig    │      │     UIController (shared)     │  │
│  │                  │      │                               │  │
│  │ + getBlocks(mode)│─────►│ + showPracticeScreen("map")   │  │
│  │                  │      │ + updateItemDisplay("map", s)  │  │
│  └──────────────────┘      │ + updateNameDisplay("map", s)  │  │
│                            │ + updateProgress("map", info)  │  │
│  ┌──────────────────┐      │                               │  │
│  │ MapInputValidator│      │                               │  │
│  │                  │─────►│                               │  │
│  │ + validate(form) │      └───────────────────────────────┘  │
│  └──────────────────┘                                         │
│                                                              │
│  ┌──────────────────┐                                         │
│  │ MapDataIO        │  (Import / Export)                      │
│  │                  │                                         │
│  │ + importJSON(f)  │  Reads JSON file → populates form       │
│  │ + exportJSON(n,p)│  Reads form → triggers JSON download    │
│  │ + validateSchema │  Validates imported JSON structure       │
│  └──────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 MapModeConfig

Returns the block definitions for preset modes specific to Map memorization. Map modes include both K2V and V2K practice directions.

| Method | Input | Output |
|--------|-------|--------|
| `getBlocks(mode)` | `"memorization"` or `"revision"` | Array of `{ type, direction, repetitions }` objects |

Memorization returns:
```js
[
  { type: "straight", direction: "K2V", repetitions: 10 },
  { type: "jumbled",  direction: "K2V", repetitions: 10 },
  { type: "straight", direction: "K2V", repetitions: 5  },
  { type: "straight", direction: "V2K", repetitions: 10 },
  { type: "jumbled",  direction: "V2K", repetitions: 10 },
  { type: "straight", direction: "V2K", repetitions: 5  }
]
```

Revision returns:
```js
[
  { type: "straight", direction: "K2V", repetitions: 5 },
  { type: "jumbled",  direction: "K2V", repetitions: 5 },
  { type: "straight", direction: "K2V", repetitions: 3 },
  { type: "straight", direction: "V2K", repetitions: 5 },
  { type: "jumbled",  direction: "V2K", repetitions: 5 },
  { type: "straight", direction: "V2K", repetitions: 3 }
]
```

### 2.3 MapSessionEngine

Core state machine that drives the Map practice session. Extends the shared SessionEngine pattern with direction awareness (K2V / V2K).

**State:**
```
{
  mapName:           String,              // user-entered mapping name
  pairs:             Array<{key, value}>, // key-value pairs entered by user
  mapSize:           Number,              // pairs.length
  blocks:            Array<Block>,        // ordered list of blocks (includes direction)
  currentBlockIndex: Number,              // index into blocks[]
  currentRepetition: Number,              // current rep within block (1-based)
  currentSequence:   Array<Number>,       // current index sequence for this rep
  sequenceIndex:     Number,              // index into currentSequence
  totalItems:        Number,              // total items in entire session
  itemsCompleted:    Number               // items shown so far
}
```

**Methods:**

| Method | Description |
|--------|-------------|
| `init(mapName, pairs, blocks)` | Initializes the session with name, key-value pairs, and block configuration. Computes map size from pairs. Generates the first sequence. |
| `next()` | Advances to the next item. Returns `{ display, direction }` where `display` is the key (for K2V) or value (for V2K) to show, or `null` if session complete. |
| `getProgress()` | Returns `{ blockName, direction, currentRep, totalReps, itemsCompleted, totalItems, mapName }`. |
| `isComplete()` | Returns `true` when all blocks and repetitions are exhausted. |
| `reset()` | Clears all state, returns to initial. |

**Key difference from ListSessionEngine:** The `next()` method uses the block's `direction` to determine whether to display `pairs[index].key` (K2V) or `pairs[index].value` (V2K).

### 2.4 MapInputValidator

Validates user input from the Map setup screen.

| Check | Rule | Error Message |
|-------|------|--------------|
| Mapping Name | Non-empty string | "Please enter a mapping name." |
| Key-Value Pairs | At least 1 pair defined | "Add at least one key-value pair." |
| Each Key | Non-empty string | "Key cannot be empty." |
| Each Value | Non-empty string | "Value cannot be empty." |
| Repetition Count | Integer, ≥ 1 | "Repetition count must be at least 1." |
| Custom Blocks | At least 1 block defined | "Add at least one practice block." |
| Practice Element | Must be a valid type+direction combo | "Invalid practice element type." |

### 2.5 MapDataIO

Handles importing and exporting key-value mappings as JSON files. Operates entirely client-side using the browser File API (for import) and Blob/URL API (for export).

**JSON Schema:**
```json
{
    "mapping_name": "<string>",
    "mappings": [
        { "source": "<string>", "target": "<string>" }
    ]
}
```

**Methods:**

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `importJSON(file)` | `File` object from `<input type="file">` | `{ name, pairs }` or error | Reads file via `FileReader`, parses JSON, validates schema, returns mapping name and pairs array. |
| `exportJSON(name, pairs)` | Mapping name `String`, pairs `Array<{key, value}>` | Triggers browser download | Constructs JSON object, creates a `Blob`, generates an object URL, and triggers download as `<mapping_name>.json`. |
| `validateSchema(data)` | Parsed JSON object | `true` or throws error | Checks: `mapping_name` is a non-empty string, `mappings` is a non-empty array, each entry has non-empty `source` and `target` strings. |

**Import Flow:**
```
[Import JSON clicked]
      │
      ▼
Browser file picker (accept=".json")
      │
      ▼
FileReader.readAsText(file)
      │
      ▼
JSON.parse(text)
      │
      ├──► Parse error → showError("Invalid JSON file.")
      │
      ▼
validateSchema(data)
      │
      ├──► Schema error → showError("JSON does not match expected format.")
      │
      ▼
Populate form:
  - Set Mapping Name = data.mapping_name
  - Clear existing pair rows
  - For each mapping: add pair row (source → Key, target → Value)
```

**Export Flow:**
```
[Export JSON clicked]
      │
      ▼
Read Mapping Name and pair rows from DOM
      │
      ├──► Name empty or no pairs → showError("Nothing to export.")
      │
      ▼
Build JSON object:
  { mapping_name, mappings: [{ source: key, target: value }, ...] }
      │
      ▼
const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" })
const url = URL.createObjectURL(blob)
      │
      ▼
Create temporary <a> element, set href=url, download="<mapping_name>.json"
      │
      ▼
Programmatically click <a>, then revoke object URL
```

---

## 3. Map Setup Screen — HTML Structure

```html
<div id="map-setup-screen" class="screen">
  <h1>Map Memorization</h1>

  <!-- Mapping Name -->
  <div class="form-group">
    <label for="map-name">Mapping Name</label>
    <input type="text" id="map-name" placeholder="e.g., Country → Capital">
  </div>

  <!-- Mode Selection -->
  <fieldset class="form-group">
    <legend>Mode</legend>
    <label><input type="radio" name="map-mode" value="memorization" checked> Memorization</label>
    <label><input type="radio" name="map-mode" value="revision"> Revision</label>
    <label><input type="radio" name="map-mode" value="custom"> Custom</label>
  </fieldset>

  <!-- Key-Value Pairs Input -->
  <div class="form-group">
    <label>Key-Value Pairs</label>
    <div id="map-pairs">
      <!-- Dynamically added rows: [Key input] → [Value input] [Remove] -->
    </div>
    <button id="map-add-pair-btn">+ Add Pair</button>
  </div>

  <!-- Custom Blocks (hidden unless Custom mode) -->
  <div id="map-custom-section" class="custom-section hidden">
    <div id="map-custom-blocks"></div>
    <button id="map-add-block-btn">+ Add Block</button>
  </div>

  <div id="map-error-message" class="error-message hidden"></div>
  <button id="map-start-btn" class="btn btn-primary">Start</button>
</div>
```

### 3.1 Import / Export Buttons

Placed below the Mapping Name field on the setup screen:

```html
<div class="form-group import-export-group">
  <button id="map-import-btn" class="btn btn-secondary">Import JSON</button>
  <input type="file" id="map-import-file" accept=".json" class="hidden">
  <button id="map-export-btn" class="btn btn-secondary">Export JSON</button>
</div>
```

- The `<input type="file">` is hidden; clicking "Import JSON" programmatically triggers it.
- The `accept=".json"` attribute filters the file picker to JSON files.
- Export reads the current form state and triggers a download.

### 3.2 Key-Value Pair Input

Users add pairs one at a time via the "+ Add Pair" button. Each pair row:

```html
<div class="pair-row">
  <input type="text" class="pair-key" placeholder="Key">
  <span class="pair-arrow">→</span>
  <input type="text" class="pair-value" placeholder="Value">
  <button class="btn-remove">✕</button>
</div>
```

The map size is derived from the number of pair rows at session start. No separate "Map Size" number input is needed.

---

## 4. Map Practice Screen — Display Logic

During practice, the screen shows the current key or value depending on the block's direction:

**K2V Block — displays a key:**
```
┌─────────────────────────────────────┐
│  Straight K2V — Rep 2 of 10        │
│  Overall: 8 / 250                  │
│                                     │
│       "Country → Capital"           │
│              ┌─────┐                │
│              │ k3  │                │
│              └─────┘                │
│                                     │
│    [ BACK ]          [ NEXT ]       │
└─────────────────────────────────────┘
```

**V2K Block — displays a value:**
```
┌─────────────────────────────────────┐
│  Straight V2K — Rep 2 of 10        │
│  Overall: 133 / 250                │
│                                     │
│       "Country → Capital"           │
│              ┌─────┐                │
│              │ v3  │                │
│              └─────┘                │
│                                     │
│    [ BACK ]          [ NEXT ]       │
└─────────────────────────────────────┘
```

| Element | Source | Update Trigger |
|---------|--------|----------------|
| Block info ("Straight K2V — Rep 2 of 10") | `MapSessionEngine.getProgress()` | Every `next()` call |
| Overall progress ("8 / 250") | `MapSessionEngine.getProgress()` | Every `next()` call |
| Mapping Name ("Country → Capital") | `mapName` from init | Set once at session start, static |
| Displayed item ("k3" or "v3") | Return value of `MapSessionEngine.next()` | Every `next()` call |

---

## 5. Map Data Flow — Sequence Generation

For map practice, SequenceGenerator produces arrays of indices. The MapSessionEngine then resolves each index to a key or value based on the block's direction.

```
Mode: Memorization, Map Pairs: [(k1,v1), (k2,v2), (k3,v3)]

Block 1 (Straight K2V × 10):
  SequenceGenerator.straight(3) → [1, 2, 3]
  Display: k1, k2, k3  (user recalls v1, v2, v3)
  ... ×10 reps

Block 2 (Jumbled K2V × 10):
  SequenceGenerator.jumbled(3) → [2, 3, 1] (new shuffle each rep)
  Display: k2, k3, k1  (user recalls v2, v3, v1)
  ... ×10 reps

Block 3 (Straight K2V × 5):
  Display: k1, k2, k3  ... ×5 reps

Block 4 (Straight V2K × 10):
  SequenceGenerator.straight(3) → [1, 2, 3]
  Display: v1, v2, v3  (user recalls k1, k2, k3)
  ... ×10 reps

Block 5 (Jumbled V2K × 10):
  SequenceGenerator.jumbled(3) → [3, 1, 2] (new shuffle each rep)
  Display: v3, v1, v2  (user recalls k3, k1, k2)
  ... ×10 reps

Block 6 (Straight V2K × 5):
  Display: v1, v2, v3  ... ×5 reps
```

### 5.1 Index-to-Item Resolution

```
nextItem():
  index = currentSequence[sequenceIndex]  // e.g., 2
  block = blocks[currentBlockIndex]

  if block.direction == "K2V":
    return pairs[index - 1].key    // display key, user recalls value
  else:  // "V2K"
    return pairs[index - 1].value  // display value, user recalls key
```

---

## 6. Custom Mode — Practice Element Types

In Custom mode, the Map tab offers 6 practice element types (compared to 3 for List):

| Type | Sequence Order | Display | User Recalls |
|------|---------------|---------|-------------|
| Straight K2V | Ascending keys | Key | Value |
| Straight V2K | Ascending values | Value | Key |
| Reverse K2V | Descending keys | Key | Value |
| Reverse V2K | Descending values | Value | Key |
| Jumbled K2V | Shuffled keys | Key | Value |
| Jumbled V2K | Shuffled values | Value | Key |

The custom block row UI uses a `<select>` with these 6 options:

```html
<select class="block-type">
  <option value="straight-k2v">Straight K2V</option>
  <option value="straight-v2k">Straight V2K</option>
  <option value="reverse-k2v">Reverse K2V</option>
  <option value="reverse-v2k">Reverse V2K</option>
  <option value="jumbled-k2v">Jumbled K2V</option>
  <option value="jumbled-v2k">Jumbled V2K</option>
</select>
```

---

## 7. Traceability Matrix

Maps Map requirements to architectural components:

| Requirement | Component(s) |
|-------------|-------------|
| MFR-01 | index.html `#map-pairs` (dynamic add), MapInputValidator |
| MFR-02 | index.html `#map-name` input, MapInputValidator |
| MFR-03 | index.html `#map-custom-section` (6-option select), Event: mode change |
| MFR-05 | UIController.updateNameDisplay("map", name), `#map-practice-screen` |
| MFR-06 | MapSessionEngine.next() + direction check, UIController.updateItemDisplay("map", key) |
| MFR-07 | MapSessionEngine.next() + direction check, UIController.updateItemDisplay("map", value) |
| MFR-08 | MapSessionEngine.getProgress().direction, block info display |
| MFR-09 | UIController.updateProgress("map", info), MapSessionEngine.getProgress() |
| MFR-10 | SequenceGenerator + MapSessionEngine.next() with direction-aware resolution |
| MFR-11 | UIController.showCompleteScreen("map"), `#map-complete-screen` |
| MFR-12 | index.html `#map-import-btn`, MapDataIO |
| MFR-13 | index.html `#map-import-file` (hidden `<input type="file">`), MapDataIO.importJSON() |
| MFR-14 | MapDataIO.importJSON() → populates `#map-name` and `#map-pairs` |
| MFR-15 | MapDataIO.validateSchema(), UIController.showError("map", msg) |
| MFR-16 | MapDataIO.importJSON() clears existing rows before populating |
| MFR-17 | index.html `#map-export-btn`, MapDataIO |
| MFR-18 | MapDataIO.exportJSON(name, pairs) → Blob + download trigger |
| MFR-19 | MapDataIO.exportJSON() pre-check, UIController.showError("map", msg) |

---

> [↑ Back to Document Index](#document-index) · [← Architecture Index](INDEX.md) · [← README](../README.md)
