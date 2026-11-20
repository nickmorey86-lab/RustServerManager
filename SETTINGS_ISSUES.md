# Settings Issues and Work Required

| Settings Tab | Issue / Bug Found | Work Required / Investigation Area | Priority |
|---|---|---|---|
| Themes | Theme Builder locks up after saving an incomplete theme. Fields become unusable until full app restart. | Investigate form state management, validation logic, controlled components, save process, and null/invalid theme objects. Prevent saving invalid themes. | 🔴 Critical |
| Themes | TypeScript errors exist in `ThemeBuilder.tsx`. | Review and resolve all compile/lint errors before further development. | 🔴 Critical |
| Themes | Uploaded fonts/icons display correctly, but edit fields do not repopulate selected values when editing. | Review theme loading and edit-state population logic. Ensure current selections are restored into controls. | 🟠 High |
| Themes | URL-based font/icon themes fail due to missing fields/tabs. | Compare UI, theme schema, validation schema, and storage model. Add missing URL fields. | 🟠 High |
| Themes | "Icon Pack OK" validation appears before all URL fields are populated. | Correct validation logic so the success message only displays when all required icon links exist. | 🟠 High |
| Themes | Incomplete themes can currently be saved. | Implement mandatory field validation prior to saving. Disable save until requirements are satisfied. | 🟠 High |
| Themes | No confirmation that the theme save/load process is actually reading back saved data correctly. | Perform a full persistence audit. Verify storage location, retrieval process, and UI population. | 🟠 High |
| Admin | Added admins disappear after application restart. | Determine where admin data is currently stored. Likely move to reading/writing Rust admin configuration files. | 🟠 High |
| Admin & Whitelist | Current admin system may not match the actual Rust server administration model. | Rebuild around actual server admin files rather than the application-only data store. | 🟡 Medium |
| Admin & Whitelist | Whitelist functionality may duplicate Carbon functionality. | Review whether the whitelist should be removed, rebuilt, or integrated with Carbon's whitelist system. | 🟡 Medium |
| Server Messages | Added messages disappear after restart. | Investigate the save/load pipeline and persistence location. Verify data is written and reloaded correctly. | 🔴 Critical |
| Server Messages | Previously saved messages appear incorrectly in add/edit input fields. | Review form state reset logic and data-binding process. | 🔴 Critical |
| Server Messages | Future functionality is not implemented. | Design integration with the server framework/chat command system once server control features exist. | 🟡 Medium |
| General → | Functionality is not implemented. | Define supported API integrations and create a storage/configuration system. | 🟡 Medium |
| General → | Saving appears functional, but backend integration is missing. | Verify persistence and later connect to moderation/chat enforcement systems. | 🟡 Medium |
| General → Language Filter | No save confirmation is displayed. | Add a standard in-app notification. | 🟡 Medium |
| General → Language Filter | Filtering functionality is not implemented. | Plan future integration with the moderation system. | 🟡 Medium |
| General → Anti-Cheat Settings | No save confirmation is displayed. | Add a standard in-app notification. | 🟡 Medium |
| General → Anti-Cheat Settings | Anti-cheat functionality is not implemented. | Design a future server-side enforcement/integration layer. | 🟡 Medium |
| General → Other Settings | Uses an inconsistent Windows-style save notification. | Replace with the application's themed notification component. | 🟡 Medium |
| General → Other Settings | Backend functionality is not implemented. | Define the behavior of individual settings and connect them to server configuration. | 🟡 Medium |
| All Settings Pages | Unknown persistence architecture. | Audit where every setting is saved, how it is loaded, and how values are restored to the UI. Create a full save/load map. | 🔴 Critical |
| All Settings Pages | Save feedback is inconsistent. | Standardize all saves using a single themed notification component. | 🟠 High |
