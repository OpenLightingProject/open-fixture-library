// see https://github.com/epoberezkin/ajv#validation-errors

const getDetailsPerAjvKeyword = {
  propertyNames(error, allErrors) {
    let errorMessage = `property name '${error.params.propertyName}' is invalid`;

    const relatedError = allErrors.find(
      otherError => otherError.propertyName === error.params.propertyName,
    );
    if (relatedError) {
      errorMessage += ` (${relatedError.message})`;
    }

    return errorMessage;
  },
  additionalProperties(error) {
    return `${error.message} (${error.params.additionalProperty})`;
  },
  enum(error) {
    const allowedValues = error.params.allowedValues.join(`, `);
    return `must be equal to one of [${allowedValues}]`;
  },
  oneOf(error) {
    if (error.params.passingSchemas) {
      const passingSchemas = error.params.passingSchemas.map(index => error.schema[index]);
      const allAreOnlyRequired = passingSchemas.every(
        schema => Object.keys(schema).length === 1 && `required` in schema,
      );

      if (allAreOnlyRequired) {
        const properties = passingSchemas.map(schema => schema.required.join(`+`)).join(` / `);
        return `must not have a combination of the properties ${properties}`;
      }
    }

    return error.message;
  },
  const(error) {
    return `${error.message} "${getShortenedString(error.params.allowedValue)}"`;
  },
};

/**
 * @param {object[]} ajvErrors The array of AJV error objects.
 * @param {string} [rootName=`root`] The display name of the root object in the error data path.
 * @returns {string} A human-readable validation error message.
 */
export default function getAjvErrorMessages(ajvErrors, rootName = `root`) {
  const errors = ajvErrors.filter(error => {
    if (`propertyName` in error) {
      // the information from this error will be displayed in the related `propertyNames` error
      return false;
    }

    const isUselessError = error.keyword === `if` && error.schema === true;
    return !isUselessError;
  });

  return errors.map(error => {
    const getDetails = getDetailsPerAjvKeyword[error.keyword] || (() => error.message);
    const details = getDetails(error, ajvErrors);
    const errorMessage = `${rootName}${error.instancePath}${getDataDescription(error.data)} ${details}`;
    return errorMessage.replaceAll(`\n`, `\\n`);
  });
}

/**
 * @param {any} data Any kind of data; not all types can be represented.
 * @returns {string} A short representation of the given data with a leading space. Empty if this is not possible.
 */
function getDataDescription(data) {
  if (typeof data === `string`) {
    return ` "${getShortenedString(data)}"`;
  }
  if (typeof data === `number` || typeof data === `boolean` || data === null) {
    return ` ${data}`;
  }
  if (typeof data === `object` && `type` in data) {
    return ` (type: ${data.type})`;
  }
  return ``;
}

/**
 * @param {string} string The string to shorten
 * @returns {string} The shortened string, or the original string if it's already short.
 */
function getShortenedString(string) {
  const maxLength = 30;
  return (string.length > maxLength) ? `${string.slice(0, maxLength - 1)}…` : string;
}
