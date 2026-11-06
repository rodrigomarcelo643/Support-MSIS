# 01 • AI Agent Guidelines & Operating Protocols

## 1. Scope & Objective
This document outlines the mandatory operational standards, safety constraints, and paired development workflows for AI agents (including Google Antigravity, subagents, and automated tooling) operating within the **SupportMSIS** codebase.

---

## 2. Core Execution Commandments

1. **Maintain Documentation Integrity:**
   - Always preserve docstrings, type signatures, and existing comments unless directly asked to refactor them.
   - Do not delete architectural explanations or inline UX rationales during component updates.

2. **Always Verify Builds with `pnpm.cmd run build`:**
   - On Windows environments, executing `pnpm run build` directly in PowerShell can encounter script execution policy restrictions (`PSSecurityException`).
   - AI agents **must always** invoke `pnpm.cmd run build` to execute TypeScript type-checking (`tsc -b`) and Vite production rollup verification before confirming tasks.

3. **Non-Destructive Edits:**
   - Use targeted `edit_file` calls with exact context matching rather than rewriting whole files unnecessarily.
   - Inspect existing JSX structures before closing divs to prevent unclosed wrappers from altering responsive flex containers (e.g. accidentally nesting full-width tables inside flex-row wrappers).

4. **Preserve Institutional Branding:**
   - Institutional logos (`medicine-logo.png`, `southwe_main.png`) and colors (Southwestern Maroon/Red `#dc2626` / `#b91c1c`) represent the official identity of Southwestern University PHINMA • School of Medicine.
   - Never replace institutional badges with generic icons unless explicitly requested.

---

## 3. Sandbox & Command Execution Rules

- **Default Sandbox Mode:** Commands execute within an isolated sandbox without host network access.
- **Node/pnpm Command Handling:** Run normal build/test commands within the sandbox using `pnpm.cmd`.
- **EPERM Mitigation:** If transient `EPERM: operation not permitted, mkdir` errors occur during temporary directory creation on Windows, retry the command up to twice before assuming an unrecoverable failure.
