# select all JSON files in schemas/ directory
schema-files := $(wildcard schemas/*.json)

# replace schemas/ with schemas/dereferenced/
dereferenced-schema-files := $(schema-files:schemas/%=schemas/dereferenced/%)

all: \
fixtures/register.json \
plugins/plugins.json \
tests/test-fixtures.json \
tests/test-fixtures.md \
$(dereferenced-schema-files)

fixtures/register.json: \
fixtures/*/*.json \
fixtures/manufacturers.json \
cli/make-register.js
	node cli/make-register.js
	@echo ""

plugins/plugins.json: \
plugins/*/*.js \
cli/make-plugin-data.js
	node cli/make-plugin-data.js
	@echo ""

tests/test-fixtures.json: \
lib/fixture-features/*.js \
fixtures/register.json \
lib/model/*.mjs \
cli/make-test-fixtures.js
	node cli/make-test-fixtures.js
	@echo ""

tests/test-fixtures.md: \
tests/test-fixtures.json

schemas/dereferenced/%.json: \
$(schema-files) \
cli/make-dereferenced-schemas.js
	node cli/make-dereferenced-schemas.js "$*.json"
	@echo ""
