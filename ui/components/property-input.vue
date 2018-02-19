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
    min: {
      type: Number,
      required: false,
      default: null
    },
    max: {
      type: Number,
      required: false,
      default: null
    },
    value: {
      type: null,
      required: true
    }
  },
  computed: {
    pattern() {
      return this.schemaProperty.pattern || null;
    },
    minimum() {
      if (this.min !== null) {
        return this.min;
      }

      if (`minimum` in this.schemaProperty) {
        return this.schemaProperty.minimum;
      }

      if (`exclusiveMinimum` in this.schemaProperty) {
        return this.schemaProperty.exclusiveMinimum;
      }

      return null;
    },
    maximum() {
      if (this.max !== null) {
        return this.max;
      }

      if (`maximum` in this.schemaProperty) {
        return this.schemaProperty.maximum;
      }

      if (`exclusiveMaximum` in this.schemaProperty) {
        return this.schemaProperty.exclusiveMaximum;
      }

      return null;
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
          min: this.minimum,
          max: this.maximum,

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
</script>

