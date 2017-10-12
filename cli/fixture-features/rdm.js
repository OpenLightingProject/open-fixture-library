module.exports = [{
  name: 'RDM',
  description: 'Whether an RDM model ID is set',
  order: 40,
  hasFeature: fixture => fixture.rdm !== null
}];
