# Bug Fix Log

## B-000

Status: Partially Complete

Findings:

- All settings persistence paths identified.
- Electron IPC architecture confirmed.
- Persistence handlers confirmed.
- JSON storage locations confirmed.

Outstanding:

- Review storage location strategy.
- Evaluate migration from app-data/RustServerManager to Electron userData storage.
- Determine upgrade path for existing user data.

## B-001

Theme Builder Lock-Up

Status: Fixed - full testing required.

Findings:

- Lockup caused by browser alert() dialogs.
- Validation failures trigger alert() popups.
- Dismissing alert() leaves Electron window in an invalid focus state.
- Text inputs stop accepting keyboard input until window focus changes.
- Opening a file picker or changing application focus restores functionality.

Resolution:

- Replace alert() dialogs with in-app validation messages and/or notification system.

## B-002

- Status: Open

## B-005

- Status: Investigating
- Findings: ChatMessages persistence architecture confirmed. Need to inspect JSON contents after save.
  