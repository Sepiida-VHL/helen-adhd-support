# PR: Documentation & Onboarding Updates

This PR updates local development instructions, adds contributor onboarding, and prepares a checklist derived from docs/implementation.md.

## Changes
- Update README.md with local dev instructions:
  - Frontend: `npm run dev`
  - Backend: `uvicorn backend.main:app --reload`
- Add docs/onboarding.md for new contributors

## Checklist (mirrors docs/implementation.md)
Below is a direct checklist based on the boxes in docs/implementation.md. Please update statuses during review.

- [ ] Step 1: [Add plan step here]
  - Status: ☐
- [x] Step 2: Rewrite implementation.md with new architecture & service map; create docs/implementation.md; delete old .txt
  - Status: ✅ (this change)
- [ ] Step 3: [Add plan step here]
  - Status: ☐
- [ ] Step 4: [Add plan step here]
  - Status: ☐
- [ ] Step 5: [Add plan step here]
  - Status: ☐

Notes from implementation.md:
- Replace placeholder steps with your actual plan items so this section mirrors the authoritative plan.
- Respect the app naming rule: use “Helen” (by SepiidAI), keep the calm, meditative aesthetic consistent across the app.

## Post-merge plan
After approval:
- Squash-merge this PR
- Delete the migration branch (`chore/migrate-firebase-to-railway`)
