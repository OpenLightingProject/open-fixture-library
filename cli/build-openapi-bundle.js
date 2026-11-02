import { writeFile } from 'node:fs/promises';
import { dereference } from '@apidevtools/json-schema-ref-parser';

const specPath = new URL('../ui/api/openapi.json', import.meta.url);
// `bundle` leaves the root document's headers/responses referenced as
// `../openapi.json#...` from the per-route files, which no longer resolve once
// the document is written next to the root spec. `dereference` produces a
// fully self-contained document that openapi-backend can load from a bundled
// Nitro build without any filesystem lookups.
const bundled = await dereference(specPath.pathname);
await writeFile(new URL('../ui/api/openapi.bundled.json', import.meta.url), `${JSON.stringify(bundled, null, 2)}\n`);
