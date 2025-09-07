# Implementation Overview

This document captures the system architecture, environment configuration, and execution checklist for the Helen app by SepiidAI.


## 1) Architecture Diagram (ASCII)

+-------------------+      ⇆      +-------------+      ⇆      +----------------+      ⇆      +-----------------+      ⇆      +----------------------+
| Frontend (Next.js)| <=========> |    Clerk    | <=========> |    Supabase    | <=========> |     FastAPI      | <=========> | Stripe / SendGrid    |
|  (App Router)     |  Auth UI    |  Auth & SSO |  Auth tokens|  DB + RPC      |  Data Access|  Business Logic  |  Webhooks   | Billing / Email      |
+-------------------+              +-------------+              +----------------+              +-----------------+              +----------------------+

Notes:
- Next.js uses Clerk for auth; Clerk issues session tokens that are verified by both Next.js middleware and FastAPI.
- Supabase stores application data; FastAPI uses service role or RLS-safe access to read/write via PostgREST or direct queries.
- Stripe handles billing (subscriptions, invoices, webhooks to FastAPI). SendGrid handles transactional emails (via FastAPI).


## 2) Environment Variable Matrix

Legend:
- local: developer workstation (dotenv or local secrets manager)
- CI: continuous integration runners (masked/secret variables)
- Railway: hosted environment variables in Railway project settings

Variables are grouped by provider. Replace placeholder values with your own secrets; never commit real secrets.

### Core App and Routing
- NEXT_PUBLIC_APP_URL
  - Purpose: Public base URL for the frontend (used for redirects, callbacks)
  - local: http://localhost:3000
  - CI: https://ci.example.invalid (or leave unset)
  - Railway: https://{{railway_frontend_domain}}

### Clerk (Authentication)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - Purpose: Public key for Clerk frontend SDK
  - local: pk_test_... (from Clerk dashboard dev instance)
  - CI: pk_test_... (non-secret but keep consistent)
  - Railway: pk_live_... (project prod)
- CLERK_SECRET_KEY
  - Purpose: Server-side secret for verifying sessions and calling Clerk APIs
  - local: sk_test_...
  - CI: sk_test_...
  - Railway: sk_live_...
- CLERK_JWT_ISSUER or CLERK_ISSUER
  - Purpose: JWT issuer URL for backend verification
  - local: https://clerk.{{your-domain}}.auth.dev or Clerk-provided URL
  - CI: same as local/test
  - Railway: production issuer URL

### Supabase
- NEXT_PUBLIC_SUPABASE_URL
  - Purpose: Supabase project URL (public)
  - local: https://{{dev_supabase_ref}}.supabase.co
  - CI: https://{{dev_supabase_ref}}.supabase.co (or test project)
  - Railway: https://{{prod_supabase_ref}}.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Purpose: Public anon key for client-side operations (subject to RLS)
  - local: anon_...
  - CI: anon_...
  - Railway: anon_...
- SUPABASE_SERVICE_ROLE_KEY
  - Purpose: Server-side key for elevated operations in FastAPI or background jobs
  - local: service_role_...
  - CI: service_role_...
  - Railway: service_role_...
- SUPABASE_DB_URL (optional if using PostgREST only)
  - Purpose: Direct Postgres connection string for FastAPI
  - local: postgres://user:pass@127.0.0.1:5432/db
  - CI: injected from CI secret store
  - Railway: provided by Railway Postgres plugin

### FastAPI
- FASTAPI_URL
  - Purpose: Base URL for the API used by the frontend
  - local: http://localhost:8000
  - CI: http://127.0.0.1:8000 (for integration tests) or ephemeral preview URL
  - Railway: https://{{railway_api_domain}}
- API_JWT_AUDIENCE / API_JWT_ISSUER
  - Purpose: Expected audience/issuer to validate Clerk JWTs in FastAPI
  - local: set to Clerk dev values
  - CI: same as local/test
  - Railway: Clerk prod values

### Stripe
- STRIPE_SECRET_KEY
  - Purpose: Server-side Stripe API key
  - local: sk_test_...
  - CI: sk_test_...
  - Railway: sk_live_...
- STRIPE_WEBHOOK_SECRET
  - Purpose: Verify Stripe webhooks received by FastAPI
  - local: whsec_...
  - CI: whsec_...
  - Railway: whsec_...
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - Purpose: Frontend key for Stripe.js
  - local: pk_test_...
  - CI: pk_test_...
  - Railway: pk_live_...

### SendGrid
- SENDGRID_API_KEY
  - Purpose: Send transactional emails from FastAPI
  - local: SG.XXXX...
  - CI: SG.XXXX...
  - Railway: SG.XXXX...
- EMAIL_FROM
  - Purpose: Default from-address
  - local: Helen <no-reply@localhost>
  - CI: Helen CI <no-reply@ci>
  - Railway: Helen <no-reply@{{your-domain}}>

### Observability (optional)
- SENTRY_DSN
  - Purpose: Error reporting for frontend/backend
  - local: (optional)
  - CI: (optional)
  - Railway: https://examplePublicKey@o0.ingest.sentry.io/0


## 3) Checklist (Status ☐ / ✅)

Use this checklist to track plan execution. Update statuses as work progresses. Boxes: ☐ = not started, ✅ = complete, ◐ = in progress.

- Step 1: [Add plan step here]
  - Status: ☐
- Step 2: Rewrite implementation.md with new architecture & service map; create docs/implementation.md; delete old .txt
  - Status: ✅ (this change)
- Step 3: [Add plan step here]
  - Status: ☐
- Step 4: [Add plan step here]
  - Status: ☐
- Step 5: [Add plan step here]
  - Status: ☐

Notes:
- Replace placeholder steps with your actual plan items so this section mirrors the authoritative plan.
- Respect the app naming rule: use “Helen” (by SepiidAI), keep the calm, meditative aesthetic consistent across the app.

