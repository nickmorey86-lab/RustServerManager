# Settings Issues and Work Required

This document tracks known settings-page defects, missing integrations, and persistence work.

## Priority

| Priority | Meaning |
|---|---|
| 🔴 Critical | Blocks normal use or risks losing/corrupting settings |
| 🟠 High | Significant broken behavior or a key required feature |
| 🟡 Medium | Missing integration or inconsistent behavior |

## Themes

| Issue | Required work | Priority |
|---|---|---|
| The Theme Builder locks up after saving an incomplete theme, and fields remain unusable until an application restart. | Investigate form state, validation, controlled components, the save process, and invalid theme objects. Prevent incomplete themes from being saved. | 🔴 Critical |
| `ThemeBuilder.tsx` contains TypeScript errors. | Resolve all compile and lint errors before continuing theme development. | 🔴 Critical |
| Uploaded fonts and icons display correctly, but their values do not repopulate the edit fields. | Review theme loading and edit-state population. Restore existing selections in all controls. | 🟠 High |
| URL-based font and icon themes fail because required fields or tabs are missing. | Compare the UI, theme schema, validation schema, and storage model. Add the missing URL fields. | 🟠 High |
| "Icon Pack OK" can appear before every URL field has been populated. | Update validation so the success state only appears when all required icon URLs are present. | 🟠 High |
| Incomplete themes can currently be saved. | Add mandatory-field validation and disable saving until all requirements are satisfied. | 🟠 High |
| There is no confirmed verification that theme save and load operations round-trip correctly. | Audit storage, retrieval, and UI population. Verify that saved themes can be loaded and displayed unchanged. | 🟠 High |

## Admin and Whitelist

| Issue | Required work | Priority |
|---|---|---|
| Added admins disappear after an application restart. | Determine the current storage location and move to reading from and writing to the Rust server admin configuration files. | 🟠 High |
| The current admin system may not match Rust's server administration model. | Rebuild admin management around the server's actual admin configuration files instead of application-only storage. | 🟡 Medium |
| The whitelist may duplicate Carbon's existing whitelist functionality. | Decide whether to remove, rebuild, or integrate the whitelist with Carbon's whitelist system. | 🟡 Medium |

## Server Messages

| Issue | Required work | Priority |
|---|---|---|
| Added messages disappear after a restart. | Audit the save/load pipeline and persistence location. Confirm that messages are written and reloaded correctly. | 🔴 Critical |
| Saved messages appear incorrectly in add/edit input fields. | Review form reset logic and data binding. | 🔴 Critical |
| Future server-message functionality is not implemented. | Design integration with the server framework and chat command system once server control features are available. | 🟡 Medium |

## API and General Settings

| Issue | Required work | Priority |
|---|---|---|
| API integration functionality is not implemented. | Define supported API integrations and add a storage/configuration system. | 🟡 Medium |
| Saving may appear functional, but backend integration is missing. | Verify persistence and later connect settings to moderation or chat enforcement systems. | 🟡 Medium |

### Language Filter

| Issue | Required work | Priority |
|---|---|---|
| No save confirmation is displayed. | Use the standard in-app notification component. | 🟡 Medium |
| Filtering is not implemented. | Plan integration with the moderation system. | 🟡 Medium |

### Anti-Cheat Settings

| Issue | Required work | Priority |
|---|---|---|
| No save confirmation is displayed. | Use the standard in-app notification component. | 🟡 Medium |
| Anti-cheat functionality is not implemented. | Design a future server-side enforcement or integration layer. | 🟡 Medium |

### Other Settings

| Issue | Required work | Priority |
|---|---|---|
| The save notification uses inconsistent Windows-style behavior. | Replace it with the application's themed notification component. | 🟡 Medium |
| Backend functionality is not implemented. | Define the behavior of each setting and connect it to server configuration. | 🟡 Medium |

## All Settings Pages

| Issue | Required work | Priority |
|---|---|---|
| The persistence architecture is not consistently documented or understood. | Audit every settings page: identify storage locations, loading behavior, and UI value restoration. Create a complete save/load map. | 🔴 Critical |
| Save feedback is inconsistent across settings pages. | Standardize save feedback with one themed notification component. | 🟠 High |
