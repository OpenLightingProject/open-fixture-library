# select all JSON files in schemas/ directory
schema-files := $(wildcard schemas/*.json)

# replace schemas/ with schemas/dereferenced/
dereferenced-schema-files := $(schema-files:schemas/%=schemas/dereferenced/%)



### PHONY rules, see https://stackoverflow.com/a/2145605/451391

.PHONY: all no-nuxt register plugin-data test-fixtures schemas model-docs api-docs nuxt-build clean

no-nuxt: register plugin-data test-fixtures schemas model-docs api-docs

only-gitignored-no-nuxt: register schemas

all: no-nuxt nuxt-build

register: fixtures/register.json

plugin-data: plugins/plugins.json

test-fixtures: tests/test-fixtures.json tests/test-fixtures.md

schemas: $(dereferenced-schema-files)

model-docs: docs/model-api.md

api-docs: docs/rest-api.md

nuxt-build:
	npx nuxt build

clean:
	rm -rf schemas/dereferenced
	rm -rf .nuxt


### file rules

fixtures/register.json: \
fixtures/*/*.json \
fixtures/manufacturers.json \
cli/make-register.js \
lib/register.js
	node cli/make-register.js
	@echo ""

plugins/plugins.json: \
plugins/*/plugin.json \
plugins/*/*.js \
plugins/*/exportTests/*.js \
cli/make-plugin-data.js \
$(schema-files) # OFL plugin version depends on the schema
	node cli/make-plugin-data.js
	@echo ""

tests/test-fixtures.json: \
lib/fixture-features/*.js \
fixtures/register.json \
lib/model/*.js \
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


docs/model-api.md: \
lib/model/*.js \
jsdoc-config.json
	npx jsdoc2md --configure jsdoc-config.json --private --files lib/model/*.js > docs/model-api.md
	@echo ""

docs/rest-api.md: \
ui/api/openapi.json
	npx widdershins --code true --language_tabs --omitBody true --omitHeader true --resolve true --outfile docs/rest-api.md ui/api/openapi.json
	@echo ""
