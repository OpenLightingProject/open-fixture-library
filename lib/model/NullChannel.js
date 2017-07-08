const path = require('path');
const uuidv4 = require('uuid/v4');

const Channel = require(path.join(__dirname, 'Channel.js'));

// dummy channel used to represent null in a mode's channel list
module.exports = class NullChannel extends Channel {
  constructor(fixture) {
    super(`null-${uuidv4()}`, {
      name: 'No Function',
      type: 'Nothing'
    }, fixture);
  }
};