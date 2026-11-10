# Website Revamp — GitHub Upload

## Repository

[divyashree-max/website-revamp](https://github.com/divyashree-max/website-revamp)

## Local project

Folder: `C:\Users\CFT 02\OneDrive\Documents\ChatGPT\website revamp`

Main entry file: `index.html`

The project contains the approved KUKA introduction and existing Craftech360 homepage. The introduction lasts approximately 22.4 seconds, preserves the opening camera movement and centred clockwise display roll, reconstructs particles directly into the solid robot, and ends with a frontal screen approach into the homepage.

## Files to upload

- `src/` — website and animation implementation.
- `public/` — required model, logo, fonts and particle data.
- `source-assets/` — original supplied GLB for preservation and regeneration.
- `tests/` and `tools/` — verification, local server and asset utilities.
- `index.html`, `package.json`, `package-lock.json` and `playwright.config.cjs`.
- Project Markdown files and `.gitignore`.

Keep `node_modules/`, `dist/`, `.env` files and `evidence/` local. Evidence contains development captures and reference videos; it is not required to run the website. Some inspection tools reference these local-only files.

## Run locally

```powershell
npm ci
npm run dev
```

Open [the local website](http://127.0.0.1:5173/), refresh and choose **Replay intro**.

```powershell
npm run build
npm test
```

## Push using Git

Use a GitHub account with write access to the repository. Set your Git author name and email if they are not configured.

```powershell
Set-Location -LiteralPath 'C:\Users\CFT 02\OneDrive\Documents\ChatGPT\website revamp'
git remote add origin https://github.com/divyashree-max/website-revamp.git
git branch -M main
git add .gitignore GITHUB-PUSH.md ASSET-ASSESSMENT.md CHECKPOINT.md DESIGN.md README.md design-qa.md index.html package.json package-lock.json playwright.config.cjs src public source-assets tests tools
git commit -m "Add approved KUKA website and direct particle reconstruction"
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin https://github.com/divyashree-max/website-revamp.git` instead of `git remote add origin`.

If Git reports permission denied, the repository owner must grant the account write access, or Git must authenticate as an account that already has access. Do not force-push over existing repository history.
