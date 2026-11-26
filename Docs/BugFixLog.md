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

Status: Fixed

Findings:

- Lockup caused by browser alert() dialogs.
- Validation failures trigger alert() popups.
- Dismissing alert() leaves Electron window in an invalid focus state.
- Text inputs stop accepting keyboard input until window focus changes.
- Opening a file picker or changing application focus restores functionality.

Resolution:

- Replace alert() dialogs with in-app validation messages and/or notification system.

## B-001a

Theme Builder deletion message

Status: Open

## B-002

Status: Mostly fixed

- issue on setIconValid: Calling setState synchronously error.

## B-003

Status: Fixed

- missing icon fields added.

## B-005

Status: Fixed

Findings:

- Existing server messages load correctly from disk.
- Persistence framework is functioning partially.
- Deleted messages are restored after application restart.
- New messages may fail to save when existing messages are present.
- Issue appears related to update/delete persistence paths rather than initial creation.

## B-006

Status: Investigating

## B-007

Status: Open
  