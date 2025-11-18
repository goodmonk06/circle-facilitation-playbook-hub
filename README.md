# Circle Facilitation Playbook Hub

A Next.js fullstack application for managing facilitation playbooks - step-by-step guides for circles, workshops, and group sessions.

## Overview

This hub provides a structured way to create, manage, and share facilitation playbooks. Each playbook contains phases, steps, prompts, timing, and facilitator notes - everything needed to run transformative group experiences.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Testing**: Jest

## Features

### 1. Playbook Modeling

- Full CRUD operations for Playbooks, Phases, and Steps
- Hierarchical structure: Playbook → Phases → Steps
- Clean ordering with `orderIndex` fields
- Rich metadata including tags, group size, duration

### 2. Export & Integration

RESTful API for integration with live-session tools:

- `GET /api/playbooks` - List all playbooks
- `GET /api/playbooks/:id` - Get full playbook with nested data
- `GET /api/playbooks/key/:key` - **Export endpoint** for integration (JSON)
- Full CRUD endpoints for all resources

### 3. User Interface

- `/` - Landing page
- `/playbooks` - Browse all playbooks with tags and filters
- `/playbooks/:id` - Detailed view with nested phases and steps

### 4. Development Experience

- Docker Compose for local PostgreSQL
- Comprehensive npm scripts
- Type-safe database access with Prisma
- Unit tests for core functionality

## Domain Model

### Playbook

```typescript
{
  id: string                    // Unique identifier
  communityId?: string          // Optional community association
  key: string                   // Unique key for API access
  title: string                 // Playbook title
  descriptionMarkdown?: string  // Rich description
  intendedGroupSizeRange?: {    // Recommended group size
    min: number
    max: number
  }
  tags?: string[]               // Categories/topics
  createdAt: DateTime
  updatedAt: DateTime
}
```

### PlaybookPhase

```typescript
{
  id: string                    // Unique identifier
  playbookId: string            // Parent playbook
  orderIndex: number            // Position in sequence (0-indexed)
  name: string                  // Phase name
  goalMarkdown?: string         // Phase objective
  durationMinutes?: number      // Estimated duration
}
```

### PlaybookStep

```typescript
{
  id: string                        // Unique identifier
  phaseId: string                   // Parent phase
  orderIndex: number                // Position in sequence (0-indexed)
  instructionMarkdown?: string      // Step instructions
  promptQuestionsMarkdown?: string  // Questions for participants
  facilitatorNotesMarkdown?: string // Private facilitator guidance
  durationMinutes?: number          // Estimated duration
  meta?: Record<string, unknown>    // Arbitrary metadata
}
```

## JSON Export Schema

The `/api/playbooks/key/:key` endpoint returns playbooks in this format for consumption by other tools:

```typescript
interface PlaybookExport {
  id: string
  communityId?: string | null
  key: string
  title: string
  description?: string | null
  intendedGroupSize?: {
    min: number
    max: number
  } | null
  tags?: string[] | null
  phases: PhaseExport[]
  createdAt: string              // ISO 8601
  updatedAt: string              // ISO 8601
}

interface PhaseExport {
  id: string
  orderIndex: number             // Sequential from 0
  name: string
  goal?: string | null
  durationMinutes?: number | null
  steps: StepExport[]
}

interface StepExport {
  id: string
  orderIndex: number             // Sequential from 0 within phase
  instruction?: string | null
  promptQuestions?: string | null
  facilitatorNotes?: string | null
  durationMinutes?: number | null
  meta?: Record<string, unknown> | null
}
```

### Example Export

```json
{
  "id": "clx123",
  "key": "deep-sharing-circle",
  "title": "Deep Sharing Circle",
  "description": "A structured format for authentic connection...",
  "intendedGroupSize": { "min": 4, "max": 12 },
  "tags": ["connection", "sharing", "circle"],
  "phases": [
    {
      "id": "phase1",
      "orderIndex": 0,
      "name": "Opening & Grounding",
      "goal": "Create a safe container",
      "durationMinutes": 15,
      "steps": [
        {
          "id": "step1",
          "orderIndex": 0,
          "instruction": "Welcome participants",
          "facilitatorNotes": "Speak slowly and intentionally",
          "durationMinutes": 3
        }
      ]
    }
  ],
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/goodmonk06/circle-facilitation-playbook-hub.git
cd circle-facilitation-playbook-hub
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Start PostgreSQL and initialize the database:

```bash
npm run setup
```

This will:
- Start Docker PostgreSQL container
- Push schema to database
- Generate Prisma Client
- Seed example playbooks

5. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code

### Database

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:seed` - Seed example data
- `npm run db:studio` - Open Prisma Studio

### Docker

- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:reset` - Reset database (delete volumes)

### Testing

- `npm test` - Run tests

### Quick Setup

- `npm run setup` - Full setup (Docker + DB + Seed)

## API Reference

### Playbooks

- `GET /api/playbooks` - List all playbooks
  - Query params: `?tag=string&communityId=string`
- `GET /api/playbooks/:id` - Get playbook by ID
- `GET /api/playbooks/key/:key` - **Get playbook by key (export format)**
- `POST /api/playbooks` - Create playbook
- `PUT /api/playbooks/:id` - Update playbook
- `DELETE /api/playbooks/:id` - Delete playbook

### Phases

- `POST /api/phases` - Create phase
- `GET /api/phases/:id` - Get phase
- `PUT /api/phases/:id` - Update phase
- `DELETE /api/phases/:id` - Delete phase

### Steps

- `POST /api/steps` - Create step
- `GET /api/steps/:id` - Get step
- `PUT /api/steps/:id` - Update step
- `DELETE /api/steps/:id` - Delete step

## Seeded Playbooks

The application comes with two example playbooks:

1. **Deep Sharing Circle** (`deep-sharing-circle`)
   - 4-12 people
   - 110 minutes
   - Focus on authentic connection and vulnerability

2. **Visioning Workshop** (`visioning-workshop`)
   - 5-25 people
   - 170 minutes
   - Co-create shared vision for teams/communities

## Integration with Live-Session Tools

To integrate this playbook hub with live-session co-pilot tools:

1. Fetch playbook data via the key endpoint:
   ```
   GET https://your-domain.com/api/playbooks/key/deep-sharing-circle
   ```

2. Parse the JSON response according to the `PlaybookExport` schema

3. The response includes:
   - All phases in order (`orderIndex` 0, 1, 2...)
   - All steps within each phase (also ordered)
   - Timing information for scheduling
   - Facilitator notes and prompts

4. Use `orderIndex` to display phases/steps sequentially

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- JSON export schema validation
- Ordering logic for phases and steps
- JSON utility functions
- Data integrity

## Project Structure

```
circle-facilitation-playbook-hub/
├── app/
│   ├── api/                 # API routes
│   │   ├── playbooks/
│   │   ├── phases/
│   │   └── steps/
│   ├── playbooks/           # UI pages
│   ├── page.tsx            # Landing page
│   └── layout.tsx
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── types.ts            # TypeScript types
│   └── json-utils.ts       # JSON helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── __tests__/              # Jest tests
├── docker-compose.yml      # PostgreSQL config
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review the JSON export schema above

---

Built with care for facilitators creating transformative group experiences.
