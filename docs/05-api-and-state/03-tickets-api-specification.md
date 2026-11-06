# MSIS Tickets API Specification (v1)

## Overview
The MSIS Support Tickets API provides backend persistence, attachment handling, status triage, and audit logging into the central MySQL database.

Endpoints reside under `api/v1/tickets/` and are built with vanilla PHP 8+ and `mysqli` prepared statements.

---

## Architecture & Endpoints

| Endpoint | Method | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `api/v1/tickets/create.php` | `POST` | `multipart/form-data` or JSON | Reports a new ticket, uploads files to `uploads/tickets/`, inserts records into `tickets`, `ticket_attachments`, and `ticket_audit_logs`. |
| `api/v1/tickets/list.php` | `GET` | `?role=&email=&status=&search=&limit=&page=` | Retrieves tickets with pagination, attachment counts, and filter options. |
| `api/v1/tickets/get.php` | `GET` | `?id=TK-83002` | Retrieves a single ticket with all physical attachment URLs and complete audit history. |
| `api/v1/tickets/update_status.php` | `POST` / `PATCH` | JSON: `{ id, status, support_message, admin_id, admin_name }` | Updates ticket triage status and optional Super Admin support response. |
| `api/v1/tickets/delete.php` | `POST` / `DELETE` | JSON: `{ id }` | Deletes ticket, cascades database relations, and removes physical files from disk. |
| `api/v1/tickets/setup.php` | `GET` | None | Health check & auto-creation of `tickets`, `ticket_attachments`, and `ticket_audit_logs` tables if missing. |

---

## 1. Create Ticket Endpoint (`create.php`)

### Headers
* `Content-Type: multipart/form-data` (recommended for file uploads)
* `Content-Type: application/json` (supported with `base64_files` array)

### Form Fields
* `subject` *(string, required)*: Summary of the incident.
* `description` *(string, required)*: Full reproduction steps and technical context.
* `department` *(string, optional)*: e.g. `"MSIS Department"`, `"Computer Science"`.
* `category` / `reporter_role` *(string, optional)*: `"Student"`, `"Faculty"`, `"Secretary"`, `"Admin"`.
* `reporter_id` *(string, optional)*: Authenticated user ID (e.g. from Google Auth).
* `reporter_email` *(string, optional)*: Institutional email (`@swu.phinmaed.com` or `@msis.edu`).
* `reporter_name` *(string, optional)*: User's display name.
* `priority` *(string, optional)*: `"Low"`, `"Medium"`, `"High"`, `"Critical"` (default `"Medium"`).
* `files[]` *(binary files, optional)*: Multi-file attachment payload.

### File Upload Handling
* Stored in: `uploads/tickets/`
* Filename format: `{ticket_code}_{timestamp}_{random}.{ext}`
* Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.pdf`, `.txt`, `.log`, `.csv`
* Direct URL: `https://support.swu-som.com/uploads/tickets/{stored_name}` or `http://localhost/SupportMSIS/uploads/tickets/{stored_name}`
* Apache `.htaccess` ensures files can be directly rendered in `<img>` tags while disabling PHP execution for security.

### Success Response (`201 Created`)
```json
{
  "status": "success",
  "message": "Ticket filed successfully.",
  "ticket": {
    "id": "TK-83015",
    "numericId": 14,
    "category": "Faculty",
    "department": "MSIS Department",
    "subject": "Grade submission portal 500 timeout",
    "description": "Error during Section 2 export",
    "status": "In Progress",
    "priority": "Medium",
    "attachmentsCount": 1,
    "attachments": [
      {
        "id": 8,
        "name": "screenshot.png",
        "storedName": "tk-83015_1730910000_421.png",
        "url": "https://support.swu-som.com/uploads/tickets/tk-83015_1730910000_421.png",
        "path": "uploads/tickets/tk-83015_1730910000_421.png",
        "size": 1048576,
        "isImage": true
      }
    ],
    "submittedAt": "Just now",
    "createdAt": "2026-11-06 19:15:00",
    "reporterId": "usr_faculty_481",
    "reporterName": "Dr. Marcus Vance",
    "reporterEmail": "m.vance@msis.edu",
    "supportMessage": null
  }
}
```

---

## 2. Update Status Endpoint (`update_status.php`)

### Request
```json
{
  "id": "TK-83015",
  "status": "Resolved",
  "support_message": "Fix deployed to production servers.",
  "admin_id": "usr_super_admin",
  "admin_name": "Super Admin",
  "admin_email": "admin@msis.edu"
}
```

### Response (`200 OK`)
```json
{
  "status": "success",
  "message": "Ticket updated successfully.",
  "ticket": {
    "id": "TK-83015",
    "status": "Resolved",
    "supportMessage": "Fix deployed to production servers.",
    "supportRespondedByName": "Super Admin",
    "supportRespondedAt": "2026-11-06 19:20:00"
  }
}
```

---

## 3. Delete Ticket Endpoint (`delete.php`)

### Request
```json
{
  "id": "TK-83015"
}
```

### Behavior
1. Unlinks and deletes any physical attachments from `uploads/tickets/`.
2. Deletes row from `tickets`. Foreign key `ON DELETE CASCADE` automatically purges `ticket_attachments` and `ticket_audit_logs`.
3. Returns `{"status": "success", "message": "Ticket #TK-83015 deleted successfully."}`.
