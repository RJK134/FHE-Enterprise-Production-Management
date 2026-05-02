#!/usr/bin/env node
// Phase 0 placeholder for the canonical npm script surface.
// Replaced by real implementations when the Next.js dashboard lands in Phase 1.
// Exits 0 with a clear message so CI on the foundation PR can run the canonical
// lint / typecheck / test / build sequence end-to-end without simulating success.

const stage = process.argv[2] || 'unknown';
const banner = `[FHE-EPMC Phase 0] npm run ${stage}`;
console.log(banner);
console.log('Phase 0 placeholder. Replaced in Phase 1 by the real Next.js implementation.');
console.log('See docs/DELIVERY_PLAN.md for phasing.');
process.exit(0);
