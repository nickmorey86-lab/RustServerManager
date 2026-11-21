# Known Issues

## B-000

Settings Persistence Audit

Priority: Critical

Status: Open

Description: Determine where every Settings sub-tab stores data, where data is loaded from, and whether values are correctly restored into the UI.

Affected Areas:

Themes
Server Messages
Admin & Whitelist
Chat Rules
Language Filter
Anti-Cheat
Other Settings

---

## B-001

Theme Builder Lock-Up

Priority: Critical

Status: Open

Saving an incomplete theme causes input controls to become unusable until application restart.

---

## B-002

ThemeBuilder.tsx Errors

Priority: Critical

Status: Open

TypeScript errors exist in ThemeBuilder.tsx and require investigation.

---

## B-003

Theme URL Support

Priority: High

Status: Open

URL-based themes have missing icon fields and incomplete validation.

---

## B-004

Uploaded Font/Icon Editing

Priority: High

Status: Open

Selected uploaded fonts and icons are not restored into edit controls when editing a theme.

---

## B-005

Server Message Persistence

Priority: Critical

Status: Open

Server messages do not persist correctly across application restarts.

---

## B-006

Admin Persistence

Priority: High

Status: Open

Root Cause Identified

The page currently persists only form input state.

Admin table rows and whitelist table rows are stored in
React state only and are never written to JSON.

Upon reload only the form fields are restored.

Tables are rebuilt from no data and therefore remain empty.