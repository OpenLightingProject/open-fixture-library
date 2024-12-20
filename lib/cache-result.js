/**
 * Caches the passed value in the passed class instance, so that it doesn't have
 * to be recomputed. Note that the `propertyName` must be the same as the getter,
 * so that the getter is overwritten.
 * @example
 * ```js
 * class Example {
 *   get myProperty() {
 *     const result = someExpensiveComputation();
 *     return cacheResult(this, `myProperty`, result);
 *   }
 * }
 * ```
 * @see https://humanwhocodes.com/blog/2021/04/lazy-loading-property-pattern-javascript/
 * @param {object} classInstance The instance where the value should be cached.
 * @param {string} propertyName The name of the property to find this value.
 * @param {any} value The value to be cached.
 * @returns {any} The cached value, for easier chaining.
 */
export default function cacheResult(classInstance, propertyName, value) {
  Object.defineProperty(classInstance, propertyName, {
    value,
    writable: false,
    configurable: false,
    enumerable: false,
  });

  return value;
}
