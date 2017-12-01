all: \
fixtures/register.json \
tests/test-fixtures.json \
tests/test-fixtures.md

fixtures/register.json: \
fixtures/*/*.json \
fixtures/manufacturers.json
	cli/make-register.js; echo ""

tests/test-fixtures.json tests/test-fixtures.md: \
fixture-features/*.js \
fixtures/register.json \
lib/model/*.js
	cli/make-test-fixtures.js; echo ""