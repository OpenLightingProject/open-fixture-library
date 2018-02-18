<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
      validator(string) {
        return [`text`, `textarea`, `url`, `number`, `select`, `boolean`].includes(string);
      }
    },
    schemaProperty: {
      type: Object,
      required: true
    },
    required: {
      type: Boolean,
      required: false,
      default: false
    },
    hint: {
      type: String,
      required: false,
      default: null
    },
    additionHint: {
      type: String,
      required: false,
      default: null
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false
    },

    // set through v-model
    value: {
      type: undefined,
      required: true
    }
  },
  computed: {
    pattern() {
      return this.schemaProperty.pattern || null;
    }
  },
  mounted() {
    if (this.autoFocus) {
      this.$refs.input.focus();
    }
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
    update() {
      this.$emit(`input`, this.$refs.input.value);
    }
  },
  render(createElement) {
    if (this.type === `number`) {
      return createElement(`input`, {
        attrs: {
          type: `number`,
          required: this.required,
          // TODO: handle dynamic min / max ranges
          min: getMinimum(this.schemaProperty),
          max: getMaximum(this.schemaProperty),

          // TODO: validate this with a custom validator in the future
          dataExclusiveMinimum: this.schemaProperty.exclusiveMinimum,
          dataExclusiveMaximum: this.schemaProperty.exclusiveMaximum,

          step: this.schemaProperty.type === `integer` ? `1` : `any`,
          placeholder: this.hint
        },
        on: {
          input: this.update
        },
        ref: `input`
      });
    }

    if (this.type === `select`) {
      const options = this.schemaProperty.enum.map(
        item => createElement(`option`, {
          attrs: {
            value: item,
            selected: this.value === item
          }
        }, item)
      );
      options.unshift(createElement(`option`, {
        attrs: {
          value: ``,
          selected: this.value === ``
        }
      }, `unknown`));

      if (this.additionHint !== null) {
        options.push(createElement(`option`, {
          attrs: {
            value: `[add-value]`,
            selected: this.value === `[add-value]`
          }
        }, this.additionHint));
      }

      return createElement(`select`, {
        attrs: {
          required: this.required
        },
        on: {
          input: this.update
        },
        ref: `input`
      }, options);
    }

    const attrs = {
      required: this.required,
      placeholder: this.hint,
      pattern: this.schemaProperty.pattern,
      minlength: this.schemaProperty.minLength,
      maxlength: this.schemaProperty.maxLength,
      value: this.value
    };

    if (this.type === `textarea`) {
      return createElement(`textarea`, {
        attrs,
        on: {
          input: this.update
        },
        ref: `input`
      });
    }

    return createElement(`input`, {
      attrs: Object.assign({}, attrs, {
        type: this.type
      }),
      on: {
        input: this.update
      },
      ref: `input`
    });
  }
};

/**
 * @param {!object} schemaProperty The JSON Schema property object.
 * @returns {?number} The minimum number that one should be allowed to enter.
 */
function getMinimum(schemaProperty) {
  if (`minimum` in schemaProperty) {
    return schemaProperty.minimum;
  }

  if (`exclusiveMinimum` in schemaProperty) {
    return schemaProperty.exclusiveMinimum;
  }

  return null;
}

/**
 * @param {!object} schemaProperty The JSON Schema property object.
 * @returns {?number} The maximum number that one should be allowed to enter.
 */
function getMaximum(schemaProperty) {
  if (`maximum` in schemaProperty) {
    return schemaProperty.maximum;
  }

  if (`exclusiveMaximum` in schemaProperty) {
    return schemaProperty.exclusiveMaximum;
  }

  return null;
}
</script>

