# PlanX Backend

Node.js + Express API with MongoDB for organization management. Sends invites via `planx-mail-service` (Resend).

## Setup

```bash
cp .env.example .env
# Set MONGODB_URI (MongoDB Atlas — e.g. account tied to your Gmail)
# MAIL_SERVICE_URL and MAIL_SERVICE_API_KEY must match planx-mail-service
npm install
npm run seed   # optional demo organizations
npm run dev
```

Default port: **4000**

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/organizations` | List organizations |
| POST | `/api/organizations` | Create org + send invite email |
| PATCH | `/api/organizations/:id` | Update org |
| POST | `/api/organizations/:id/suspend` | Suspend org |
| DELETE | `/api/organizations/:id` | Delete org |
| GET | `/api/organizations/:id/stats` | Org stats |
| GET | `/api/audit-logs` | Recent audit logs |

### Create organization body

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "plan": "free",
  "adminEmail": "admin@acme.com"
}
```

Emails are sent from **support@trizenventures.com** via Resend. System admin copy goes to **support@trizehr.com**.
