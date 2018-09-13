/**
 * Basically JSON.stringify, but some fixture-related array properties are squashed
 * into one line instead of each array element having its own.
 * @param {object} obj JSON object.
 * @returns {string} String representing the given object.
 */
module.exports = function fixtureJsonStringify(obj) {
  let str = JSON.stringify(obj, null, 2);

  // make number arrays fit in one line
  str = str.replace(/^( +)"(dmxRange|range|dimensions|degreesMinMax)": (\[\n(?:.|\n)*?^\1\])/mg,
    (match, spaces, key, values) => `${spaces}"${key}": [${JSON.parse(values).join(`, `)}]`
  );

  // make string arrays fit in one line
  str = str.replace(/^( +)"(categories|authors|fineChannelAliases|colors)": (\[\n(?:.|\n)*?^\1\])/mg,
    (match, spaces, key, values) => `${spaces}"${key}": [${JSON.parse(values).map(val => `"${val}"`).join(`, `)}]`
  );

  return `${str}\n`;
};
