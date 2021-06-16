/**
 * Basically JSON.stringify, but some fixture-related array properties are squashed
 * into one line instead of each array element having its own.
 * @param {Object} object JSON object.
 * @returns {String} String representing the given object.
 */
export default function fixtureJsonStringify(object) {
  let string = JSON.stringify(object, null, 2);

  // make number arrays fit in one line
  string = string.replace(/^( +)"(dmxRange|range|dimensions|spacing|degreesMinMax)": (\[\n[^]*?^\1])/gm,
    (match, spaces, key, values) => `${spaces}"${key}": [${JSON.parse(values).join(`, `)}]`,
  );

  // make string arrays fit in one line
  string = string.replace(/^( +)"(categories|authors|fineChannelAliases|colors(?:Start|End)?)": (\[\n[^]*?^\1])/gm,
    (match, spaces, key, values) => `${spaces}"${key}": [${JSON.parse(values).map(value => `"${value}"`).join(`, `)}]`,
  );

  return `${string}\n`;
}
