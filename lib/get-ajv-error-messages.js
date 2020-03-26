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
    return `(${error.data}) should be equal to one of [${error.params.allowedValues.join(`, `)}]`;
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
  const errors = ajvErrors.filter(error => !(`propertyName` in error));

  return errors.map(error => {
    const getDetails = getDetailsPerAjvKeyword[error.keyword] || (() => error.message);
    const details = getDetails(error, ajvErrors);
    const errorMessage = `${rootName}${error.dataPath} ${details}`;
    return errorMessage.replace(`\n`, `\\n`);
  });
};
