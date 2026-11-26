# Known Issues

## B-000

Settings Persistence Audit

Priority: Critical

Status: Patially Complete

Description: Relocate save data to another location outside of the applications main folder structure. add in backup and restore options.

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

Status: Fixed

Saving an incomplete theme causes input controls to become unusable until application restart or clicking away from application.

---

## B-001a

Theme Builder deletion message

Priority: Low

Status: Open

When deleting a theme a windows style popup is displayed and it should me more theme related.

---

## B-002

ThemeBuilder.tsx Errors

Priority: Low

Status: mostly fixed

TypeScript errors exist in ThemeBuilder.tsx and require investigation.

Single error remaining, low priority issue when Calling setState synchronously

---

## B-003

Theme URL Support

Priority: High

Status: Fixed

URL-based themes have missing icon fields and incomplete validation.

---

## B-004

Uploaded Font/Icon Editing

Priority: High

Status: Open

Uploaded font and icon selections are not cleared when changing source type
(Built-in, Upload, URL), allowing stale values to remain in component state.

---

## B-005

Server Message Persistence

Priority: Critical

Status: Fixed

Server messages do not persist correctly across application restarts.

---

## B-006

Admin Persistence

Priority: Critical

Status: Open

Root Cause Identified

The page currently persists only form input state.

Admin table rows and whitelist table rows are stored in
React state only and are never written to JSON.

Upon reload only the form fields are restored.

Tables are rebuilt from no data and therefore remain empty.

---

## B-007

Api Services persistance

Priority: High

Status: Open

Not saving data

Root cause investigation areas:

- Browse dialog not opening
- IPC message failing
- File picker returning null
- Save blocked by validation

---

## B-008

Chat rules

Priority: Medium

Status: Open

### Deletion functionality not working correctly

Possible causes:

- Possibly mis-match of storage and detection locations
- Wrong path
- Wrong filename
- Wrong ID lookup
- Rule already removed from memory but not disk

### Duplicates created after editing existing rule

- Save functionality not set correctly

## B-009

Themeing issues

Priority: Medium

Status: Open

- Themeing not consistent over warnings/notifications/errors/popups
  