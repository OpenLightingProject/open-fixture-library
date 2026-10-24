/* eslint-disable jsdoc/require-param-type, jsdoc/require-returns-type, jsdoc/reject-function-type -- TypeScript already declares these types */
import { useForm } from 'vee-validate';
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, provide, reactive, ref, shallowReactive, watch, watchEffect } from 'vue';
import type { ComputedRef, InjectionKey, Ref } from 'vue';
import {
  validationRules,
} from '~/utils/validation-rules';
import type {
  EntityValidationData,
  ValidationRuleContext,
} from '~/utils/validation-rules';

/** A single validator attached to a field. */
export interface FieldRule {
  /** Registered rule name, also used as the error key and message selector. */
  name: string;
  /** Rule parameter (e.g. the exclusive minimum). */
  params?: unknown;
  /** Inline predicate for per-component validators (e.g. categories-not-empty). */
  run?: () => boolean;
  /** Run even for empty values (needed for flag-based entity rules). */
  allowEmpty?: boolean;
}

export interface FieldDefinition {
  name: string;
  getValue: () => unknown;
  getRules: () => FieldRule[];
  getAttrs: () => Record<string, unknown>;
  getElement?: () => HTMLElement | null;
  getEntityData?: () => EntityValidationData;
}

export interface EditorFormApi {
  registerField: (definition: FieldDefinition) => () => void;
  validateField: (name: string) => Promise<void>;
  validateForm: () => Promise<{ valid: boolean }>;
  submit: () => Promise<{ valid: boolean }>;
  reset: () => void;
  markTouched: (name: string) => void;
  markDirty: (name: string) => void;
  isTouched: (name: string) => boolean;
  getAttrs: (name: string) => Record<string, unknown>;
  errors: ComputedRef<Record<string, string>>;
  submitted: Ref<boolean>;
}

const EDITOR_FORM_KEY: InjectionKey<EditorFormApi> = Symbol('editor-form');
const EDITOR_FIELD_GROUP_KEY: InjectionKey<EditorFieldGroupApi> = Symbol('editor-field-group');

interface EditorFieldGroupApi {
  registerField: (definition: FieldDefinition) => () => void;
  markTouched: (name: string) => void;
  validate: () => void;
  getName: () => string;
}

/**
 * Checks whether a value should skip non-required validators.
 * @param value - The field value.
 * @returns Whether the value is empty.
 */
function isEmptyValue(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

/**
 * Runs a field's validators and returns the first failing rule name.
 * @param definition - The registered field.
 * @returns `true` when valid, otherwise the failing rule name.
 */
function evaluateField(definition: FieldDefinition): string | true {
  const value = definition.getValue();
  const entity = definition.getEntityData?.();

  for (const rule of definition.getRules()) {
    if (!rule.allowEmpty && rule.name !== 'required' && isEmptyValue(value)) {
      continue;
    }

    if (rule.run) {
      if (!rule.run()) {
        return rule.name;
      }
      continue;
    }

    const validator = validationRules[rule.name];
    if (!validator) {
      continue;
    }

    const ctx: ValidationRuleContext = { entity };
    const result = validator(value, rule.params, ctx);
    if (result !== true) {
      return rule.name;
    }
  }

  return true;
}

/**
 * Converts a rule name to the CSS class fragment used by vue-form.
 * @param value - The rule name.
 * @returns The hyphenated rule name.
 */
function hyphenate(value: string): string {
  return value.replace(/([^-])([A-Z])/g, '$1-$2').replace(/([^-])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Adds or removes a single CSS class.
 * @param element - The target element.
 * @param className - The class name.
 * @param enabled - Whether the class should be present.
 */
function setClass(element: HTMLElement, className: string, enabled: boolean) {
  element.classList.toggle(className, enabled);
}

/**
 * Copies the vue-form state classes onto an input element.
 * @param element - The target element.
 * @param name - The field name.
 * @param errors - Current error map.
 * @param touched - Current touched map.
 * @param dirty - Current dirty map.
 * @param submitted - Whether the form was submitted.
 */
function applyFieldClasses(
  element: HTMLElement,
  name: string,
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  dirty: Record<string, boolean>,
  submitted: boolean,
) {
  const error = errors[name];
  const invalid = Boolean(error);

  setClass(element, 'vf-valid', !invalid);
  setClass(element, 'vf-invalid', invalid);
  setClass(element, 'vf-dirty', Boolean(dirty[name]));
  setClass(element, 'vf-pristine', !dirty[name]);
  setClass(element, 'vf-touched', Boolean(touched[name]));
  setClass(element, 'vf-untouched', !touched[name]);
  setClass(element, 'vf-submitted', submitted);

  for (const className of [...element.classList]) {
    if (className.startsWith('vf-invalid-')) {
      element.classList.remove(className);
    }
  }

  if (error) {
    element.classList.add(`vf-invalid-${hyphenate(error)}`);
  }
}

/**
 * Removes all vue-form state classes from an element.
 * @param element - The target element.
 */
function clearFieldClasses(element: HTMLElement) {
  for (const className of [...element.classList]) {
    if (className.startsWith('vf-')) {
      element.classList.remove(className);
    }
  }
}

/**
 * Creates a vee-validate form and exposes the small adapter the editor uses to
 * register dynamic fields. Validation itself (rules, error state, forced
 * validation on submit) is vee-validate's.
 * @returns {EditorFormApi} The editor form API.
 */
export function useEditorForm(): EditorFormApi {
  const schema = reactive<Record<string, () => string | true>>({});
  const form = useForm({ validationSchema: schema });
  const submitted = ref(false);
  const touched = reactive<Record<string, boolean>>({});
  const dirty = reactive<Record<string, boolean>>({});
  const definitions = shallowReactive(new Map<string, FieldDefinition>());

  const errors = computed(() => form.errors.value as Record<string, string>);

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function registerField(definition: FieldDefinition): () => void {
    definitions.set(definition.name, definition);
    schema[definition.name] = () => evaluateField(definition);

    if (submitted.value) {
      void form.validateField(definition.name);
    }

    return () => {
      if (definitions.get(definition.name) !== definition) {
        return;
      }

      definitions.delete(definition.name);
      delete schema[definition.name];
      void form.setFieldError(definition.name, []);
      const element = definition.getElement?.();
      if (element) {
        clearFieldClasses(element);
      }
    };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  async function validateField(name: string): Promise<void> {
    await form.validateField(name);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  async function validateForm(): Promise<{ valid: boolean }> {
    const result = await form.validate();
    return { valid: result.valid };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  async function submit(): Promise<{ valid: boolean }> {
    submitted.value = true;
    return validateForm();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function reset() {
    submitted.value = false;

    for (const name of Object.keys(touched)) {
      delete touched[name];
    }
    for (const name of Object.keys(dirty)) {
      delete dirty[name];
    }

    for (const name of definitions.keys()) {
      void form.setFieldError(name, []);
    }
  }

  watchEffect(() => {
    const currentErrors = errors.value;
    const isSubmitted = submitted.value;

    for (const [name, definition] of definitions) {
      const element = definition.getElement?.();
      if (element) {
        applyFieldClasses(element, name, currentErrors, touched, dirty, isSubmitted);
      }
    }
  }, { flush: 'post' });

  const api: EditorFormApi = {
    registerField,
    validateField,
    validateForm,
    submit,
    reset,
    markTouched(name: string) {
      touched[name] = true;
    },
    markDirty(name: string) {
      dirty[name] = true;
    },
    isTouched(name: string): boolean {
      return Boolean(touched[name]);
    },
    getAttrs(name: string): Record<string, unknown> {
      return definitions.get(name)?.getAttrs() ?? {};
    },
    errors,
    submitted,
  };

  provide(EDITOR_FORM_KEY, api);
  return api;
}

/**
 * Reads the editor form API from the surrounding component.
 * @returns The form API, or `null` outside an editor form.
 */
export function useEditorFormContext(): EditorFormApi | null {
  return inject(EDITOR_FORM_KEY, null);
}

/**
 * Collects an element's attributes into a plain object.
 * @param element - The element to inspect.
 * @returns Attribute name/value pairs.
 */
function collectAttributes(element: HTMLElement): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};

  for (const attribute of element.attributes) {
    attrs[attribute.name] = attribute.value;
  }

  return attrs;
}

/**
 * Reads the current value of a native form element.
 * @param element - The input/select/textarea element.
 * @returns The value in the shape the editor's model uses.
 */
function elementValue(element: HTMLElement): unknown {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') {
      return element.checked ? true : null;
    }

    if (element.type === 'number') {
      if (element.validity?.badInput) {
        return 'invalid';
      }

      if (element.value === '') {
        return '';
      }

      const number = Number(element.value);
      return Number.isNaN(number) ? 'invalid' : number;
    }

    if (element.type === 'file') {
      return null;
    }

    return element.value;
  }

  if (element instanceof HTMLSelectElement && element.multiple) {
    return [...element.selectedOptions].map((option) => option.value);
  }

  if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  return element.getAttribute('value') ?? '';
}

/**
 * Derives validators from a native element's attributes.
 * @param element - The form element.
 * @returns The rules that apply to the element.
 */
function rulesFromElement(element: HTMLElement): FieldRule[] {
  const attrs = collectAttributes(element);
  const rules: FieldRule[] = [];
  const added = new Set<string>();

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function add(name: string, params?: unknown) {
    if (!added.has(name)) {
      rules.push({ name, params });
      added.add(name);
    }
  }

  if (element.hasAttribute('required')) {
    add('required');
  }

  const type = (element.getAttribute('type') || '').toLowerCase();
  if (type === 'email') {
    add('email');
  }
  else if (type === 'url') {
    add('url');
  }
  else if (type === 'number') {
    add('number');
  }

  for (const attributeName of ['pattern', 'minlength', 'maxlength', 'min', 'max', 'step', 'max-file-size', 'data-exclusive-minimum', 'data-exclusive-maximum']) {
    if (attributeName in attrs) {
      add(attributeName, attrs[attributeName]);
    }
  }

  // Attribute-style custom rules, e.g. `no-mode-name` on a text input.
  for (const ruleName of Object.keys(validationRules)) {
    if (ruleName in attrs && attrs[ruleName] !== 'false') {
      add(ruleName, attrs[ruleName]);
    }
  }

  return rules;
}

/**
 * Finds the named form field that contains an event target.
 * @param target - The event target.
 * @returns The field name, or an empty string.
 */
function findFieldName(target: EventTarget | null): string {
  if (!(target instanceof Element)) {
    return '';
  }

  const element = target.closest('[name]');
  if (!(element instanceof HTMLElement)) {
    return '';
  }

  return element.getAttribute('name') ?? '';
}

export interface EditorFieldGroup {
  names: Ref<string[]>;
  getAttrs: (name: string) => Record<string, unknown>;
}

/**
 * DOM adapter used by `LabeledInput`: registers every named input below the
 * label with the vee-validate form and forwards `vf:validate`-style payloads
 * from compound inputs (range, dimensions, entity, categories, file).
 * @param {object} options - Group options.
 * @param {Function} options.name - Returns the group field name.
 * @param {Function} options.root - Returns the group's root element.
 * @param {Function} [options.customValidators] - Returns per-component validator values.
 * @param {Function} [options.enabled] - Whether the group should register fields.
 * @returns {EditorFieldGroup} The group API.
 */
export function useEditorFieldGroup(options: {
  name: () => string;
  root: () => HTMLElement | null;
  customValidators?: () => Record<string, unknown>;
  enabled?: () => boolean;
}): EditorFieldGroup {
  const form = useEditorFormContext();
  const names = ref<string[]>([]);
  const externalFields = shallowReactive(new Map<string, FieldDefinition>());
  const activeFields = new Map<string, { definition: FieldDefinition; unregister: () => void }>();
  const scannedCache = new Map<string, { element: HTMLElement; definition: FieldDefinition }>();
  let mutationObserver: MutationObserver | null = null;
  let rootElement: HTMLElement | null = null;

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function customRules(): FieldRule[] {
    const validators = options.customValidators?.() ?? {};

    return Object.entries(validators).map(([name, value]) => ({
      name,
      run: () => (typeof value === 'function' ? Boolean((value as () => unknown)()) : Boolean(value)),
    }));
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function scannedDefinition(element: HTMLElement): FieldDefinition {
    const name = element.getAttribute('name') ?? '';

    const cached = scannedCache.get(name);
    if (cached && cached.element === element) {
      return cached.definition;
    }

    const definition: FieldDefinition = {
      name,
      getValue: () => elementValue(element),
      getRules: () => {
        const rules = rulesFromElement(element);
        if (name === options.name()) {
          rules.push(...customRules());
        }
        return rules;
      },
      getAttrs: () => collectAttributes(element),
      getElement: () => element,
    };

    scannedCache.set(name, { element, definition });
    return definition;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function sync() {
    if (!form) {
      return;
    }

    if (options.enabled && !options.enabled()) {
      return;
    }

    const root = options.root();
    if (!root) {
      return;
    }

    const found = new Map<string, FieldDefinition>();

    for (const element of root.querySelectorAll<HTMLElement>('[name]')) {
      const name = element.getAttribute('name');
      if (!name) {
        continue;
      }
      found.set(name, scannedDefinition(element));
    }

    for (const [name, definition] of externalFields) {
      found.set(name, definition);
    }

    for (const [name, active] of activeFields) {
      if (found.get(name) !== active.definition) {
        active.unregister();
        activeFields.delete(name);
      }
    }

    for (const [name, definition] of found) {
      if (!activeFields.has(name)) {
        activeFields.set(name, {
          definition,
          unregister: form.registerField(definition),
        });
      }
    }

    const nextNames = [...found.keys()];
    if (nextNames.length !== names.value.length || nextNames.some((name, index) => name !== names.value[index])) {
      names.value = nextNames;
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function validate() {
    sync();
    void form?.validateForm();
  }

  const groupApi: EditorFieldGroupApi = {

    registerField(definition: FieldDefinition) {
      externalFields.set(definition.name, definition);
      sync();

      return () => {
        if (externalFields.get(definition.name) === definition) {
          externalFields.delete(definition.name);
          sync();
        }
      };
    },
    validate,
    markTouched(name: string) {
      form?.markTouched(name);
      validate();
    },
    getName: () => options.name(),
  };

  provide(EDITOR_FIELD_GROUP_KEY, groupApi);

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function onInput(event: Event) {
    const name = findFieldName(event.target);
    if (name) {
      form?.markDirty(name);
    }
    validate();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function onFocusOut(event: Event) {
    const name = findFieldName(event.target);
    if (!name) {
      return;
    }

    form?.markTouched(name);
    validate();
  }

  onMounted(() => {
    rootElement = options.root();
    if (rootElement) {
      rootElement.addEventListener('input', onInput);
      rootElement.addEventListener('change', onInput);
      rootElement.addEventListener('focusout', onFocusOut);
      mutationObserver = new MutationObserver(() => sync());
      mutationObserver.observe(rootElement, { childList: true, subtree: true });
    }

    sync();
  });

  onUpdated(() => {
    if (options.root() !== rootElement) {
      rootElement = options.root();
    }
    sync();
  });

  onBeforeUnmount(() => {
    mutationObserver?.disconnect();

    if (rootElement) {
      rootElement.removeEventListener('input', onInput);
      rootElement.removeEventListener('change', onInput);
      rootElement.removeEventListener('focusout', onFocusOut);
    }

    for (const active of activeFields.values()) {
      active.unregister();
    }
    activeFields.clear();
  });

  watch(() => options.name(), sync);

  return {
    names,

    getAttrs(name: string) {
      return externalFields.get(name)?.getAttrs() ?? activeFields.get(name)?.definition.getAttrs() ?? {};
    },
  };
}

/**
 * Registers a compound field (one that does not map 1:1 to a native input)
 * with the surrounding `LabeledInput`. `validateOn` triggers revalidation when
 * the compound value changes (e.g. selecting another unit).
 * @param {Function} getDefinition - Returns the field definition to register.
 * @param {Function} [validateOn] - Reactive source that triggers revalidation.
 * @returns {object} A `touch()` helper that marks the compound field touched.
 */
export function useEditorGroupField(
  getDefinition: () => FieldDefinition | null,
  validateOn?: () => unknown,
): { touch: () => void } {
  const group = inject(EDITOR_FIELD_GROUP_KEY, null);
  let unregister: (() => void) | null = null;

  // eslint-disable-next-line jsdoc/require-jsdoc -- local helper
  function register() {
    unregister?.();
    unregister = null;

    const definition = getDefinition();
    if (group && definition) {
      unregister = group.registerField(definition);
    }
  }

  onMounted(register);
  onBeforeUnmount(() => unregister?.());

  if (validateOn) {
    watch(validateOn, () => group?.validate(), { deep: true });
  }

  return {
    touch() {
      const definition = getDefinition();
      if (definition) {
        group?.markTouched(definition.name);
      }
    },
  };
}
