# BuildWise AI

Production-quality MVP for AI-powered construction planning, PKR cost estimation, contractor quotations, supplier promotions, and realtime homeowner-contractor chat.

## Folder Structure

```text
src/
  components/
    auth/
    chat/
    layout/
    ui/
  contexts/
  lib/
  pages/
    auth/
    dashboard/
  services/
  types/
supabase/
  functions/estimate-cost/
  migrations/
```

## Database Schema

The main migration is in `supabase/migrations/001_initial.sql` and creates:

- `users`
- `contractor_profiles`
- `projects`
- `quotations`
- `chat_messages`
- `products`
- `supplier_promotions`
- `contractor_reviews`
- `project_images`

It also includes RLS policies, indexes, storage buckets, auth profile trigger, contractor matching, promotion matching, quotation acceptance, and rating refresh functions.

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Set these as Supabase Edge Function secrets:

```bash
NVIDIA_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Supabase also provides `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the function runtime.

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run client:dev
```

The app uses Supabase directly from the frontend and the `estimate-cost` Edge Function for NVIDIA NIM calls.

## Supabase Setup

1. Create your Supabase project.
2. Apply `supabase/migrations/001_initial.sql`.
3. Deploy `supabase/functions/estimate-cost`.
4. Add the function secrets from `.env.example`.
5. Add your Supabase URL and anon key to `.env`.
6. Enable email verification in Supabase Auth if required for your presentation.
