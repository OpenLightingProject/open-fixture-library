/**
 * Basically JSON.stringify, but some fixture-related array properties are squashed
 * into one line instead of each array element having its own.
 * @param {object} object JSON object.
 * @returns {string} String representing the given object.
 */
export default function fixtureJsonStringify(object) {
  let string = JSON.stringify(object, null, 2);

  // make number arrays fit in one line
  string = string.replaceAll(
    /^( +)"(dmxRange|range|dimensions|spacing|degreesMinMax)": (\[\n[^]*?^\1])/gm,
    (match, spaces, key, values) => {
      const numbers = JSON.parse(values).join(`, `);
      return `${spaces}"${key}": [${numbers}]`;
    },
  );

  // make string arrays fit in one line
  string = string.replaceAll(
    /^( +)"(categories|authors|fineChannelAliases|colors(?:Start|End)?)": (\[\n[^]*?^\1])/gm,
    (match, spaces, key, values) => {
      const strings = JSON.parse(values).map(value => `"${value}"`).join(`, `);
      return `${spaces}"${key}": [${strings}]`;
    },
  );

  return `${string}\n`;
}
