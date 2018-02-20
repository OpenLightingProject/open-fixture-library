all: \
fixtures/register.json \
tests/test-fixtures.json \
tests/test-fixtures.md \
schemas/dereferenced/fixture.json \
schemas/dereferenced/manufacturers.json

fixtures/register.json: \
fixtures/*/*.json \
fixtures/manufacturers.json
	node cli/make-register.js && echo ""

tests/test-fixtures.json tests/test-fixtures.md: \
lib/fixture-features/*.js \
fixtures/register.json \
lib/model/*.mjs
	node cli/make-test-fixtures.js && echo ""

schemas/dereferenced/fixture.json schemas/dereferenced/manufacturers.json: \
schemas/fixture.json \
schemas/manufacturers.json
	node cli/make-dereferenced-schemas.js
