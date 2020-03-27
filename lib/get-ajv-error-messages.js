// see https://github.com/epoberezkin/ajv#validation-errors

const getDetailsPerAjvKeyword = {
  propertyNames(error, allErrors) {
    let errorMessage = error.message;

    const relatedError = allErrors.find(
      err => err.propertyName === error.params.propertyName
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
    return `should be equal to one of [${error.params.allowedValues.join(`, `)}]`;
  },
  oneOf(error) {
    if (error.params.passingSchemas) {
      const passingSchemas = error.params.passingSchemas.map(index => error.schema[index]);
      const allAreOnlyRequired = passingSchemas.every(
        schema => Object.keys(schema).length === 1 && `required` in schema
      );

      if (allAreOnlyRequired) {
        const properties = passingSchemas.map(schema => schema.required.join(`+`));
        return `should not have a combination of the properties ${properties.join(` / `)}`;
      }
    }

    return error.message;
  }
};

/**
 * @param {Array.<Object>} ajvErrors The array of AJV error objects.
 * @param {String} [rootName=`root`] The display name of the root object in the error data path.
 * @returns {String} A human-readable validation error message.
 */
module.exports = function getAjvErrorMessages(ajvErrors, rootName = `root`) {
  console.log(ajvErrors);
  const errors = ajvErrors.filter(error => !(`propertyName` in error));

  return errors.map(error => {
    const getDetails = getDetailsPerAjvKeyword[error.keyword] || (() => error.message);
    const details = getDetails(error, ajvErrors);
    const errorMessage = `${rootName}${error.dataPath}${getDataDescription(error.data)} ${details}`;
    return errorMessage.replace(/\n/g, `\\n`);
  });
};

/**
 * @param {*} data Any kind of data; not all types can be represented.
 * @returns {String} A short representation of the given data with a leading space. Empty if this is not possible.
 */
function getDataDescription(data) {
  if (data.constructor === String) {
    if (data.length > 16) {
      return ` "${data.substring(0, 15)}…"`;
    }
    return ` "${data}"`;
  }
  if (data.constructor === Number || data.constructor === Boolean) {
    return ` ${data}`;
  }
  if (data instanceof Object && data.type) {
    return ` (type: ${data.type})`;
  }
  return ``;
}
