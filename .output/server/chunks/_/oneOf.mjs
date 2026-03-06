import { p as propOptionsGenerator } from '../build/server.mjs';

/** Validator that only allows any of the given values. */
const isOneOf = (allowedValues) => (value) => {
    if (!allowedValues.includes(value)) {
        return `value should be one of "${allowedValues.join('", "')}"`;
    }
    return undefined;
};

// inspired by https://github.com/dwightjack/vue-types/blob/4.1.1/src/validators/oneof.ts
const getOneOfType = (values) => {
    const allowedTypes = [
        ...new Set(values.flatMap((value) => {
            var _a;
            if (value === null || value === undefined) {
                return [];
            }
            return (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (_a = value.constructor) !== null && _a !== void 0 ? _a : []);
        })),
    ];
    if (allowedTypes.length === 0) {
        return undefined;
    }
    if (allowedTypes.length === 1) {
        return allowedTypes[0];
    }
    return allowedTypes;
};
/**
 * Allows any of the specified allowed values (validated at runtime and compile time).
 *
 * @template T - can be used to adjust the inferred type at compile time, this is usually not necessary.
 * @param allowedValues - The allowed values.
 * @param validator - Optional function for further runtime validation; should return `undefined` if valid, or an error string if invalid.
 */
const oneOfProp = (allowedValues, validator) => propOptionsGenerator(getOneOfType(allowedValues), validator, isOneOf(allowedValues));

export { oneOfProp as o };
//# sourceMappingURL=oneOf.mjs.map
