# Merit Pro Services

Web application for a stump grinding company based out of Concord, NH. Serves three roles:

1. **Marketing website** — public-facing landing pages to attract customers
2. **Customer portal** — self-service quoting and service scheduling
3. **Employee portal** — CRM, worker management, and job scheduling

## Customer Funnel

New Hampshire law requires a Dig Safe call before any stump grinding. Every customer moves through a tracked conversion funnel:

1. **Landing page** — customer discovers us
2. **Service area check** — confirm they're in one of our 5 NH counties
3. **Online quote** — customer sees pricing on the web
4. **Site visit** — we measure and paint stumps for Dig Safe, finalize the quote (customers may add stumps at this stage)
5. **Dig Safe** — underground utilities are marked
6. **Grinding** — we come back and grind the stumps
7. **Review** — prompt the customer for a Google review

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite via Prisma ORM 7
- **UI**: React 19

## Development

```bash
bun install
bun run dev
```
