# Persistence Map

This document describes how application data is saved, loaded, and stored for settings, server messages, administration, chat rules, and language filtering.

## Storage Overview

All persisted application data uses Electron IPC between the React renderer and the Electron main process. The main process reads and writes JSON files beneath the consolidated application data directory:


<app path>/app-data/RustServerManager/


## Persistence Summary

| Feature | IPC bridge | IPC channels | Storage location |
|---|---|---|---|
| API services | `window.apiServices` | `apiServices:load`, `apiServices:save` | `apiServices/apiServices.json` |
| Anti-cheat | `window.AntiCheat` | `AntiCheat:load`, `AntiCheat:save` | `antiCheat/AntiCheat.json` |
| Other stuff | `window.OtherStuff` | `OtherStuff:load`, `OtherStuff:save` | `otherStuff/OtherStuff.json` |
| Server messages | `window.ChatMessages` | `ChatMessages:load`, `ChatMessages:save` | `serverMessages/ChatMessages.json` |
| Admin whitelist | `window.CombinedAdminWhitelist` | `CombinedAdminWhitelist:load`, `CombinedAdminWhitelist:save` | `adminWhitelist/AdminWhitelist.json` |
| Chat rules | `window.rules` | `rules:loadAll`, `rules:save`, `rules:delete` | `rules/<RuleName>_<timestamp>.json` |
| Language filter | `window.languageFilter` | `languageFilter:load`, `languageFilter:save` | `languageFilter/languageFilter.json` |

## Settings

### API Services

| Operation | Method |
|---|---|
| Save | `window.apiServices.save(settings)` invokes `apiServices:save` |
| Load | `window.apiServices.load()` invokes `apiServices:load` |
| File | `<app data>/RustServerManager/apiServices/apiServices.json` |
| Format | One pretty-printed JSON object; load failures return `null` |

### Anti-Cheat

| Operation | Method |
|---|---|
| Save | `window.AntiCheat.save(settings)` invokes `AntiCheat:save` |
| Load | `window.AntiCheat.load()` invokes `AntiCheat:load` |
| File | `<app data>/RustServerManager/antiCheat/AntiCheat.json` |
| Format | One pretty-printed JSON object; enabled limits are validated and values are normalized |

### Other Stuff

| Operation | Method |
|---|---|
| Save | `window.OtherStuff.save(settings)` invokes `OtherStuff:save` |
| Load | `window.OtherStuff.load()` invokes `OtherStuff:load` |
| File | `<app data>/RustServerManager/otherStuff/OtherStuff.json` |
| Format | One pretty-printed JSON object; required values are validated and values are normalized |

## Server Messages

| Operation | Method |
|---|---|
| Save | `window.ChatMessages.save(settings)` invokes `ChatMessages:save` |
| Load | `window.ChatMessages.load()` invokes `ChatMessages:load` |
| File | `<app data>/RustServerManager/serverMessages/ChatMessages.json` |
| Format | Pretty-printed JSON containing enabled state, message text, and frequency |

The save handler requires a message and positive frequency while server messages are enabled.

## Admin Whitelist

| Operation | Method |
|---|---|
| Save | `window.CombinedAdminWhitelist.save(settings)` invokes `CombinedAdminWhitelist:save` |
| Load | `window.CombinedAdminWhitelist.load()` invokes `CombinedAdminWhitelist:load` |
| File | `<app data>/RustServerManager/adminWhitelist/AdminWhitelist.json` |
| Format | Pretty-printed JSON containing combined admin and whitelist configuration |

The save handler validates enabled admin/whitelist fields before writing the normalized object.

## Chat Rules

| Operation | Method |
|---|---|
| Save | `window.rules.save(rule)` invokes `rules:save` |
| Load | `window.rules.loadAll()` invokes `rules:loadAll` |
| Delete | `window.rules.delete(fileName)` invokes `rules:delete` |
| Directory | `<app data>/RustServerManager/rules/` |
| Format | One pretty-printed JSON file per rule |

Rule filenames use this format:


<RuleName>_<timestamp>.json


- `RuleName` is the rule name with whitespace replaced by underscores.
- `timestamp` is generated with `Date.now()`.
- Loading reads every `.json` file in the rules directory.

## Language Filter

| Operation | Method |
|---|---|
| Save | `window.languageFilter.save(settings)` invokes `languageFilter:save` |
| Load | `window.languageFilter.load()` invokes `languageFilter:load` |
| File | `<app data>/RustServerManager/languageFilter/languageFilter.json` |
| Format | Pretty-printed JSON containing enabled state, words, kick reason, and warning count |

## Data Flow


React settings page
        |
        | Renderer utility/API
        v
Electron preload (contextBridge)
        |
        | ipcRenderer.invoke(...)
        v
Electron main process (ipcMain.handle(...))
        |
        | Node.js fs read/write
        v
app-data/RustServerManager JSON files


## Notes

- Save and load operations use IPC channels exposed through `Frontend/preload.ts`.
- IPC handlers and file paths are implemented in `Frontend/electron.ts`.
- JSON directories are created automatically when the Electron application starts.
- Individual settings objects are generally sanitized before saving and normalized after loading.
- The ASP.NET `ServerBackend` project is not currently used for this persisted settings data. The Electron main process owns these files.