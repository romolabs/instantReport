# Help Desk MVP Schema

This document defines the first production-oriented data model for the internal help desk system.

## Product Decisions Locked In

- Web app first, with a real backend API from day one.
- Mobile is strategic, so web and Flutter will share the same backend.
- Authentication uses company email and password managed by the app.
- No public signup.
- Attachments are part of the MVP.
- Ticket history must be auditable for ISO-friendly traceability.
- Category is required on ticket creation.
- Internal notes are hidden from requesters.
- Resolution summaries are visible to requesters.
- Only technicians and admins can upload work evidence after assignment.

## Core Entities

### User

Represents an internal employee or IT staff member.

- Uses company email as the login identity.
- Can be active or inactive.
- Has one role for MVP:
  - `REQUESTER`
  - `TECHNICIAN`
  - `ADMIN`

### Category

Defines the type of issue, for example `Hardware`, `Software`, `Network`, `Access`, or `Printer`.

For MVP, every ticket must belong to one category.

### Ticket

The main record for an issue reported by an employee.

Important behavior:

- Created by a requester.
- May be assigned to a technician.
- Has one current status.
- Cannot be closed without a resolution summary.
- Tracks milestone timestamps for reporting.

### Ticket Comment

Stores user-visible comments and internal technician notes.

Comment types for MVP:

- `PUBLIC`
- `INTERNAL_NOTE`
- `RESOLUTION_NOTE`

Requester visibility:

- `PUBLIC` is visible to the requester and staff.
- `INTERNAL_NOTE` is visible only to technicians and admins.
- `RESOLUTION_NOTE` is visible to the requester and staff.

### Ticket Status History

Immutable audit trail of every status change.

This is the table that helps us prove:

- who changed the status
- when it changed
- what the previous status was
- any note or reason attached to the transition

### Attachment

Stores metadata for images or documents uploaded to a ticket.

For MVP, files should be stored outside the database. The database stores the file metadata and URL/path only.

### Password Reset Token

Supports secure reset flow for internal users.

## Ticket Status Lifecycle

The MVP status lifecycle is:

- `OPEN`
- `ASSIGNED`
- `IN_PROGRESS`
- `PENDING_USER`
- `RESOLVED`
- `CLOSED`

Operational rules:

- Every status change creates a history row.
- `CLOSED` requires `resolutionSummary`.
- `closedAt` is only set when the ticket is closed.
- `resolvedAt` is set when the ticket reaches `RESOLVED`.
- A closed ticket may be reopened by moving it back to a working status and recording the reason.

## Suggested Attachment Rules

- Allow `png`, `jpg`, `jpeg`, `heic`, `pdf`.
- Enforce file size limit in backend validation.
- Save attachment metadata in the database.
- Save binary files in object storage or a managed file location.

## Reporting Fields Included From Day One

These fields exist so we can report without redesigning the schema later:

- `createdAt`
- `updatedAt`
- `firstResponseAt`
- `resolvedAt`
- `closedAt`
- `priority`
- `status`
- `category`
- `assigned technician`

## Security Rules

- Passwords must be hashed with Argon2 or bcrypt.
- Reset tokens must expire.
- Users are deactivated instead of deleted.
- Auth and ticket actions should be logged at the application layer.

## Implementation Note

The Prisma schema in `prisma/schema.prisma` is the source of truth for the first implementation draft.
