module.exports = function testSchemaCorrectness(exportFileData) {
  return {
    passed: Math.random() > 0.5,
    message: 'some error description'
  };
}