import { p as propOptionsGenerator } from '../build/server.mjs';

/**
 * Allows any string. No further runtime validation is performed by default.
 *
 * @template T - can be used to restrict the type at compile time with a union type.
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const stringProp = (validator) => propOptionsGenerator(String, validator);

/**
 * Allows any boolean (validated at runtime and compile time).
 *
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const booleanProp = (validator) => propOptionsGenerator(Boolean, validator);

/**
 * Allows any object. No further runtime validation is performed by default.
 *
 * @template T - can be used to restrict the type at compile time.
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const objectProp = (validator) => propOptionsGenerator(Object, validator);

export { booleanProp as b, objectProp as o, stringProp as s };
//# sourceMappingURL=object.mjs.map
