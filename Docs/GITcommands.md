# Git and GitHub Upload Commands

Run these commands from the project root in PowerShell:

```powershell
cd "D:\RustServerManager"
```

## Initial Setup

Create a local Git repository if one does not already exist:

```powershell
git init
```

Set the default branch name:

```powershell
git branch -M main
```

Configure your Git identity:

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Verify the Git configuration:

```powershell
git config --global --list
```

## Connect to a GitHub Repository

Create an empty repository on GitHub first.

For an HTTPS connection:

```powershell
git remote add origin "https://github.com/USERNAME/REPOSITORY.git"
```

For an SSH connection:

```powershell
git remote add origin "git@github.com:USERNAME/REPOSITORY.git"
```

Replace `USERNAME` and `REPOSITORY` with the GitHub account name and repository name.

Display the configured remote:

```powershell
git remote -v
```

If `origin` already exists, update it:

```powershell
git remote set-url origin "https://github.com/USERNAME/REPOSITORY.git"
```

## Check the Files

Check repository status:

```powershell
git status
```

Review unstaged changes:

```powershell
git diff
```

## Add and Commit Files

Add every changed or new file:

```powershell
git add .
```

Add individual files or folders:

```powershell
git add "Docs\PersistenceMap.md"
git add "Frontend\src"
```

Review staged files:

```powershell
git diff --cached
```

Create a commit:

```powershell
git commit -m "Update Rust Server Manager project"
```

View recent commits:

```powershell
git log --oneline
```

## Upload to GitHub

Push the local `main` branch for the first time:

```powershell
git push -u origin main
```

After the upstream branch is configured:

```powershell
git push
```

## Upload Future Changes

```powershell
git status
git add .
git diff --cached
git commit -m "Describe the changes"
git push
```

## Pull GitHub Changes

Download and merge the latest `main` branch:

```powershell
git pull origin main
```

Fetch remote changes without merging:

```powershell
git fetch origin
```

## Common File Operations

Remove a tracked file from Git and the working directory:

```powershell
git rm "path\to\file"
git commit -m "Remove file"
git push
```

Stop tracking a file while keeping it on the PC:

```powershell
git rm --cached "path\to\file"
git commit -m "Stop tracking file"
git push
```

## Fix a Remote or Branch

Rename the local branch:

```powershell
git branch -M main
```

List local and remote branches:

```powershell
git branch -a
```

Change the remote URL:

```powershell
git remote set-url origin "git@github.com:USERNAME/REPOSITORY.git"
```

Remove and re-add the remote:

```powershell
git remote remove origin
git remote add origin "https://github.com/USERNAME/REPOSITORY.git"
```

## Authentication

Install and authenticate GitHub CLI:

```powershell
winget install --id GitHub.cli
gh auth login
```

Choose GitHub.com, HTTPS, and browser authentication when prompted.

For SSH authentication, verify the connection:

```powershell
ssh -T git@github.com
```

## Recommended .gitignore Entries

Generated and dependency folders should normally be excluded:

```gitignore
Frontend/node_modules/
Frontend/dist/
Frontend/dist-electron/
ServerBackend/bin/
ServerBackend/obj/
*.lscache
```