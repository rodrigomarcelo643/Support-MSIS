# Contributing to MSIS Support

Thank you for your interest in contributing to the **MSIS Support Ticket System** for Southwestern University PHINMA • School of Medicine.

Please read through these guidelines before submitting a pull request or filing an issue.

---

## 🏛️ Guiding Principles

1. **Institutional Brand Consistency:** All user interfaces must adhere to Southwestern University PHINMA brand guidelines—utilizing official SWU deep reds (`#991b1b`, `#b91c1c`, `#dc2626`) and the project typography **Plus Jakarta Sans**.
2. **User Role Confidentiality:** Students, faculty, and administrative staff must only see tickets and alerts relevant to their authorized role and identity.
3. **Fail-Safe Operations:** Background processes (such as email delivery and telemetry logging) must never crash core ticket operations (intake, status update, deletion).

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js:** v18.x or v20.x LTS
- **Package Manager:** `pnpm` (`npm install -g pnpm`)
- **PHP:** 8.1+ (for local backend testing)

### 2. Getting the Code
```bash
git clone https://github.com/rodrigomarcelo643/Support-MSIS.git
cd Support-MSIS
pnpm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure appropriate variables:
```env
VITE_BACKEND_URL=https://support.swu-som.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Running the Development Server
```bash
pnpm dev
```
Open `http://localhost:5173` in your browser.

---

## 🌿 Branching Strategy & Git Workflow

- **`main`**: Production-ready branch. Direct pushes to `main` are restricted in production environments.
- Feature branches should follow this naming convention:
  - `feat/<short-description>`: New features or UI components
  - `fix/<short-description>`: Bug fixes or security patches
  - `docs/<short-description>`: Documentation changes
  - `refactor/<short-description>`: Code cleanup without functional change

### Conventional Commits
All commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
```text
<type>(<scope>): <short description in imperative present tense>
```
Examples:
- `feat(tickets): restrict real-time status update toasts strictly to ticket owner or super admin`
- `fix(api): safeguard update_status endpoint with try-catch and fail-safe mail dispatch`
- `style(mailer): align email template typography with project font Plus Jakarta Sans`
- `docs(readme): center brand logos, titles, and add comprehensive project docs`

---

## 💻 Coding Standards

### Frontend (React 19 & TypeScript)
- **Rules of Hooks:** Ensure all React hooks (`useCallback`, `useEffect`, `useState`, `useContext`) are called unconditionally at the top level of component functions before any conditional returns.
- **Type Safety:** Maintain strict TypeScript typing. Avoid `any` where possible; use domain models defined in `src/types/index.ts`.
- **Styling:** Use Tailwind CSS v4 classes. Ensure all screens are responsive across Mobile (`< 640px`), Tablet (`640px - 1024px`), and Desktop (`> 1024px`).
- **Typography:** The institutional font family is `'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

### Backend (PHP 8.2+ API)
- **Defensive Execution:** Always wrap database modifications and external service calls (such as PHPMailer) in `try { ... } catch (Throwable $e) { ... }` blocks.
- **Strict JSON Responses:** Always set `header("Content-Type: application/json; charset=UTF-8");` and return structured JSON payloads:
  ```json
  {
    "status": "success",
    "message": "...",
    "ticket": { ... }
  }
  ```
- **Input Casting:** Cast all incoming parameters safely to avoid PHP 8.1+ `trim(null)` deprecation warnings (e.g., `trim((string)($data['id'] ?? ''))`).

---

## 🧪 Pre-Submission Checklist

Before creating a Pull Request, ensure that:
1. `pnpm build` completes with **exit code 0** and no TypeScript errors.
2. `php -l <modified_file.php>` reports no syntax errors for any modified PHP scripts.
3. No sensitive credentials, private keys, or personal tokens are committed to git.
4. Changes have been verified across both mobile and desktop viewports.

---

## 📬 Submitting a Pull Request

1. Push your branch to GitHub.
2. Open a Pull Request against the `main` branch.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely, describing your changes, motivation, and test verification.
4. Request review from a team member or maintainer.
