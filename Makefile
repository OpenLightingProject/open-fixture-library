# select all JSON files in schemas/ directory
schema-files := $(wildcard schemas/*.json)

# replace schemas/ with schemas/dereferenced/
dereferenced-schema-files := $(schema-files:schemas/%=schemas/dereferenced/%)



### PHONY rules, see https://stackoverflow.com/a/2145605/451391

.PHONY: all register plugin-data test-fixtures schemas nuxt-build clean

all: register plugin-data test-fixtures schemas nuxt-build

register: fixtures/register.json

plugin-data: plugins/plugins.json

test-fixtures: tests/test-fixtures.json tests/test-fixtures.md

schemas: $(dereferenced-schema-files)

nuxt-build:
	$$(npm bin)/nuxt build

clean:
	rm -rf schemas/dereferenced
	rm -rf .nuxt


### file rules

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
cli/make-test-fixtures.js \
$(dereferenced-schema-files)
	node cli/make-test-fixtures.js
	@echo ""

tests/test-fixtures.md: \
tests/test-fixtures.json

schemas/dereferenced/%.json: \
$(schema-files) \
cli/make-dereferenced-schemas.js
	@mkdir -p schemas/dereferenced
	node cli/make-dereferenced-schemas.js "$*.json"
	@echo ""
