# OFL Plugin

Outputs the fixture's JSON object plus the auto-generated `schema` and `schemaVersion` properties.

**In general, the JSON format wasn't built for the use in lighting software programs.** It is likely to break backwards compatibility with future changes, so every developer who uses the OFL format has to actively follow the development.

Each update of the JSON fixture schema is git tagged with `schema-<VERSION>`, e.g. `schema-1.0.0`.