# Rust Server Manager - Folder Structure

The project is divided into documentation, a React/Electron frontend, an ASP.NET backend, and SteamCMD resources.

RustServerManager/
|-- .claude/
|-- .git/
|-- .vscode/
|-- Docs/
|   |-- Architecture.md
|   |-- Changelog.md
|   |-- FolderStructure.md
|   |-- FutureIdeas.md
|   |-- image.png
|   |-- KnownIssues.md
|   `-- SprintBoard.md
|-- Frontend/
|   |-- Backups/
|   |   `-- chatSettings.tsx.backup
|   |-- public/
|   |   |-- fonts/
|   |   |-- icons/
|   |   |   |-- midnight/
|   |   |   |-- rust/
|   |   |   `-- slate/
|   |   |-- images/
|   |   `-- vite.svg
|   |-- src/
|   |   |-- assets/
|   |   |   `-- react.svg
|   |   |-- components/
|   |   |   |-- ModalError/
|   |   |   |   |-- ModalError.tsx
|   |   |   |   `-- modalError.css
|   |   |   `-- sidebar/
|   |   |       |-- sidebar.tsx
|   |   |       `-- sidebar.css
|   |   |-- pages/
|   |   |   |-- carbonmod/
|   |   |   |   |-- carbon.tsx
|   |   |   |   `-- carbon.css
|   |   |   |-- console/
|   |   |   |   |-- console.tsx
|   |   |   |   `-- console.css
|   |   |   |-- dashboard/
|   |   |   |   |-- dashboard.tsx
|   |   |   |   `-- dashboard.css
|   |   |   |-- oxideinstaller/
|   |   |   |   |-- oxideinstaller.tsx
|   |   |   |   `-- oxideinstaller.css
|   |   |   |-- playeradmin/
|   |   |   |   |-- players.tsx
|   |   |   |   `-- players.css
|   |   |   |-- pluginmanager/
|   |   |   |   |-- pluginManager.tsx
|   |   |   |   `-- pluginManager.css
|   |   |   |-- serverinfo/
|   |   |   |   |-- serverDetails/
|   |   |   |   |   |-- serverDetails.tsx
|   |   |   |   |   `-- serverdetails.css
|   |   |   |   `-- serverList/
|   |   |   |       |-- serverList.tsx
|   |   |   |       |-- serverlist.css
|   |   |   |       `-- modals/
|   |   |   |           |-- addServerModal.tsx
|   |   |   |           |-- deleteServerModal.tsx
|   |   |   |           `-- modal.css
|   |   |   |-- serverinstaller/
|   |   |   |   |-- serverInstaller.tsx
|   |   |   |   `-- serverInstaller.css
|   |   |   `-- settings/
|   |   |       |-- settings.tsx
|   |   |       |-- settings.css
|   |   |       `-- settingsTabs/
|   |   |           |-- settingsTabs.tsx
|   |   |           |-- settingsTabs.css
|   |   |           |-- adminWhitelist/
|   |   |           |   |-- adminWhitelist.tsx
|   |   |           |   `-- adminWhitelist.css
|   |   |           |-- general/
|   |   |           |   |-- generalSettings.tsx
|   |   |           |   |-- generalSettings.css
|   |   |           |   `-- bulkSettings/
|   |   |           |       |-- bulkSettings.tsx
|   |   |           |       |-- bulkSettings.css
|   |   |           |       `-- generalSubPages/
|   |   |           |           |-- antiCheatSettings/
|   |   |           |           |-- apiServices/
|   |   |           |           |-- chatRules/
|   |   |           |           |   `-- antiChatSpamRules/
|   |   |           |           |-- languageFilter/
|   |   |           |           `-- otherStuff/
|   |   |           |-- serverMessages/
|   |   |           |   |-- serverMessages.tsx
|   |   |           |   `-- serverMessages.css
|   |   |           `-- themes/
|   |   |               |-- themes.tsx
|   |   |               |-- themes.css
|   |   |               |-- themeCard.tsx
|   |   |               |-- themeCard.css
|   |   |               |-- themeContext.tsx
|   |   |               |-- themeStorage.ts
|   |   |               |-- themeTypes.ts
|   |   |               |-- midnight/
|   |   |               |-- rust/
|   |   |               |-- slate/
|   |   |               `-- themeBuilder/
|   |   |                   |-- themeBuilder.tsx
|   |   |                   `-- themeBuilder.css
|   |   |-- styles/
|   |   |   |-- app.css
|   |   |   `-- index.css
|   |   `-- utils/
|   |       |-- adminWhitelistAPI.ts
|   |       |-- antiCheatSettingsAPI.ts
|   |       |-- apiServicesAPI.ts
|   |       |-- apiServicesBrowseAPI.ts
|   |       |-- languageFilterAPI.ts
|   |       |-- otherStuffAPI.ts
|   |       |-- rulesAPI.ts
|   |       |-- safeHex.ts
|   |       `-- serverMessagesAPI.ts
|   |-- utils/
|   |   `-- fileManager.ts.deleting-note.txt
|   |-- electron.ts
|   |-- esbuild.electron.cjs
|   |-- eslint.config.js
|   |-- Frontend__tmp_notice.txt
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- preload.ts
|   |-- README.md
|   |-- tsconfig.app.json
|   |-- tsconfig.base.json
|   |-- tsconfig.electron.json
|   |-- tsconfig.json
|   |-- tsconfig.node.json
|   `-- vite.config.ts
|-- ServerBackend/
|   |-- Properties/
|   |   `-- launchSettings.json
|   |-- appsettings.json
|   |-- appsettings.Development.json
|   |-- Program.cs
|   |-- ServerBackend.csproj
|   |-- ServerBackend.csproj.lscache
|   `-- ServerBackend.http
|-- steamcmd/
|   `-- steamcmd.exe
|-- .hintrc
|-- RustServerManager.sln
|-- SETTINGS_ISSUES.md
|-- skills-lock.json
|-- steamcmd.zip
`-- TODO.md
```

## Directory Overview

### Frontend

The frontend is an Electron, React, and Vite application. Its UI is organised by page, with shared components, application styles, API utilities, theme assets, and configuration files kept in dedicated directories.

### ServerBackend

The backend is an ASP.NET project containing the server entry point, project configuration, application settings, and launch properties.

### Docs

The documentation folder contains architecture notes, project history, the folder structure, future plans, known issues, and sprint planning.

### Supporting Resources

The root solution file connects the project, SteamCMD provides server command-line tooling, and the top-level Markdown files track settings issues and outstanding work.