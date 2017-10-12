module.exports = function(options) {
  const {manufacturerId, modelId, register, manufacturers} = options;

  options.title = 'RDM Lookup - Open Fixture Library';

  let str = require('../includes/header.js')(options);

  const searchFor = (modelId === undefined || modelId === '') ? 'manufacturer' : 'fixture';

  str += `<h1>RDM ${searchFor} not found</h1>`;

  if (manufacturerId in register.rdm) {
    // manufacturer found, model not found
    const manufacturerKey = register.rdm[manufacturerId].key;
    const manufacturer = manufacturers[manufacturerKey];

    str += `<p>The requested <a href="/${manufacturerKey}">${manufacturer.name}</a> fixture was not found in the Open Fixture Library. Maybe a fixture in the library is missing the RDM ID?</p>`;
    str += `<p>Please consider <a href="https://github.com/FloEdelmann/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name of the requested fixture and mention RDM IDs <b>${manufacturerId} / ${modelId}</b>. Or you can <a href="/fixture-editor">add it yourself</a>!</p>`;
    str += '<p>Thank you either way!</p>';
  }
  else {
    // manufacturer not found
    if (searchFor === 'fixture') {
      str += `<p>The manufacturer of the requested fixture was not found in the Open Fixture Library. Please consider <a href="https://github.com/FloEdelmann/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name and manufacturer of the requested fixture and mention RDM IDs <b>${manufacturerId} / ${modelId}</b>. Or you can <a href="/fixture-editor">add it yourself</a>!</p>`;
      str += '<p>Thank you either way!</p>';
    }
    else {
      str += `<p>The requested manufacturer was not found in the Open Fixture Library. Please consider <a href="https://github.com/FloEdelmann/open-fixture-library/issues">filing a bug</a> to suggest adding the manufacturer. Include the full manufacturer and mention RDM ID <b>${manufacturerId}</b>. Thank you!</p>`;
    }
  }

  str += require('../includes/footer.js')(options);

  return str;
}
