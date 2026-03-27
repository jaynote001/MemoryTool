# Architecture — Index

> [← Back to README](../README.md)

---

## Documents

| # | Document | Description |
|---|----------|-------------|
| 0 | [General Architecture](0_Architecture_General.md) | Shared architecture — SPA overview, file structure, MVC layers, tab architecture, shared components (SequenceGenerator, TabManager, UIController), state machine, data flow, sequence generation algorithm |
| 1 | [List Memorization Architecture](1_Architecture_List.md) | List tab — ListSessionEngine, ListModeConfig, ListInputValidator, HTML structure, display logic, data flow, traceability matrix |
| 2 | [Map Memorization Architecture](2_Architecture_Map.md) | Map tab — MapSessionEngine, MapModeConfig, MapInputValidator, MapDataIO (JSON import/export), key-value pair input, K2V/V2K display logic, data flow, custom mode element types |

---

## Quick Reference

### Application Layers (MVC in `app.js`)

| Layer | Key Components |
|-------|---------------|
| **Model** | SessionState, SequenceGenerator, Config |
| **Controller** | EventHandlers, Validator, TabManager |
| **View** | Renderer, ScreenManager, TabRenderer |

### Shared Components

| Component | Responsibility |
|-----------|---------------|
| `SequenceGenerator` | Generates straight, reverse, and jumbled sequences |
| `TabManager` | Manages tab selection and visibility |
| `UIController` | DOM manipulation, screen transitions, progress updates |

### Tab-Specific Components

| List Tab | Map Tab |
|----------|---------|
| `ListModeConfig` | `MapModeConfig` |
| `ListSessionEngine` | `MapSessionEngine` |
| `ListInputValidator` | `MapInputValidator` |
| | `MapDataIO` |

---

> [← Back to README](../README.md)
