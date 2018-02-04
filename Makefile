all: \
fixtures/register.json \
tests/test-fixtures.json \
tests/test-fixtures.md \
schema-fixture-dereferenced.json \
schema-manufacturers-dereferenced.json

fixtures/register.json: \
fixtures/*/*.json \
fixtures/manufacturers.json
	node cli/make-register.js && echo ""

tests/test-fixtures.json tests/test-fixtures.md: \
lib/fixture-features/*.js \
fixtures/register.json \
lib/model/*.js
	node cli/make-test-fixtures.js && echo ""

schema-fixture-dereferenced.json schema-manufacturers-dereferenced.json: \
schema-fixture.json \
schema-manufacturers.json
	node cli/make-dereferenced-schemas.js