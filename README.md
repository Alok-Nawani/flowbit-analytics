# Flowbit Analytics

Full-stack analytics dashboard for invoice management and insights, built with Next.js, PostgreSQL, Prisma, and Vanna AI.

## Architecture

- **Monorepo**: Turborepo for managing multiple packages
- **Frontend**: Next.js 14 (App Router) with Tailwind CSS and shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **AI Service**: FastAPI service using Groq for natural language to SQL conversion
- **Charts**: Recharts for data visualization

## Project Structure

```
flowbit-analytics/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── db/               # Prisma schema and client
│   └── config/           # Shared configuration
├── services/
│   └── vanna/           # FastAPI AI service
├── data/                 # Seed data
└── docker-compose.yml    # Local development setup
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Groq API key (for chat functionality)

### Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flowbit

# Frontend (for apps/web/.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=/api
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=

# Vanna Service (for services/vanna/.env)
GROQ_API_KEY=your-groq-api-key
CORS_ORIGIN=http://localhost:3000
```

For local development, you can also create `apps/web/.env.local` and `services/vanna/.env` with the respective variables.

3. **Start PostgreSQL (and optionally Vanna service):**

```bash
docker compose up -d db
# Or start both:
docker compose up -d
```

4. **Set up database:**

```bash
# Generate Prisma client
npx prisma generate --schema packages/db/prisma/schema.prisma

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

5. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

6. **(Optional) Start Vanna AI service for Chat functionality:**

In a separate terminal:

```bash
cd services/vanna
export DATABASE_URL="postgresql://alok@localhost:5432/flowbit"
export GROQ_API_KEY="your-groq-api-key"  # Optional but required for chat
export CORS_ORIGIN="http://localhost:3000"
python3 -m pip install -r requirements.txt
python3 -m uvicorn app:app --reload --port 8000
```

Or use the Docker Compose setup:

```bash
docker compose up -d vanna
```

## Features

### Dashboard

- **Overview Cards**: Total spend (YTD), invoice count, documents, average invoice value
- **Charts**:
  - Invoice trends over time
  - Top 10 vendors by spend
  - Spend by category (pie chart)
  - Cash outflow forecast
- **Invoice Table**: Searchable, filterable table with pagination

### Chat with Data

Natural language interface to query the database:
- Ask questions like "What's the total spend in the last 90 days?"
- View generated SQL
- See results in a table format

## API Endpoints

- `GET /api/stats` - Overview statistics
- `GET /api/invoice-trends` - Monthly invoice trends
- `GET /api/vendors/top10` - Top 10 vendors by spend
- `GET /api/category-spend` - Spend breakdown by category
- `GET /api/cash-outflow` - Cash outflow forecast (with optional date filters)
- `GET /api/invoices` - Paginated invoice list (with search and status filters)
- `POST /api/chat-with-data` - Natural language query endpoint

## Database Schema

See `packages/db/prisma/schema.prisma` for the complete schema.

Key models:
- **Vendor**: Vendor information
- **Customer**: Customer information
- **Category**: Invoice categories
- **Invoice**: Main invoice entity
- **InvoiceLineItem**: Line items for invoices
- **Payment**: Payment records
- **Document**: Associated documents

## Deployment

### Frontend (Vercel)

1. Deploy `apps/web` to Vercel
2. Set environment variables in Vercel dashboard
3. Ensure `DATABASE_URL` points to your production database

### Vanna Service (Render/Railway/DigitalOcean)

1. Deploy `services/vanna` to your preferred platform
2. Set environment variables:
   - `DATABASE_URL`: Production database URL
   - `GROQ_API_KEY`: Your Groq API key
   - `CORS_ORIGIN`: Your Vercel domain
3. Update `VANNA_API_BASE_URL` in Vercel to point to deployed service

### Database

Use a managed PostgreSQL service:
- Railway
- Neon
- Supabase
- DigitalOcean Managed Databases

## Development

### Adding a new API route

Create a new file in `apps/web/app/api/[route-name]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET() {
  return NextResponse.json({ data: "..." });
}
```

### Adding a new chart

1. Create component in `apps/web/components/charts/`
2. Use Recharts for visualization
3. Fetch data from API endpoint
4. Add to dashboard page

## Troubleshooting

### Database connection issues

- Ensure PostgreSQL is running: `docker compose ps`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Verify Prisma client is generated: `npx prisma generate`

### Vanna service not responding

- Check service is running: `curl http://localhost:8000/health`
- Verify `GROQ_API_KEY` is set
- Check CORS configuration matches your frontend URL

## License

MIT

