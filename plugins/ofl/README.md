# OFL Plugin

Outputs the fixture's JSON object (like stored in the repository, just not as prettily printed) plus `fixtureKey`, `manufacturerKey` and `oflURL` (a link to the fixture page on <https://open-fixture-library.org>). Additionally, the `$schema` property points to the JSON Schema in the correct schema version.

**In general, the OFL JSON format wasn't built for the use in lighting software programs.** It is likely to break backwards compatibility with future changes, so every developer who uses the OFL format has to actively follow the development. See the [fixture format documentation](https://github.com/OpenLightingProject/open-fixture-library/blob/master/docs/fixture-format.md).
