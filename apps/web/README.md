# InstantReport Web

This is the initial Next.js App Router scaffold for the internal help desk web
client.

## What is here

- `/login` for the internal sign-in experience
- authenticated shell layout for app routes
- placeholder routes for:
  - `/tickets`
  - `/tickets/new`
  - `/tickets/[ticketId]`
  - `/admin/tickets`

## Design direction

The scaffold leans into a dark, industrial, high-trust look with warm accent
colors. It is meant to feel like a real internal operations tool, not a generic
starter theme.

## Next step

Wire these routes to the backend API and replace the placeholders with live
ticket data, auth, and attachments.
