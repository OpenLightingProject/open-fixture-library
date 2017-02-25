module.exports = function(options) {
  const {manufacturer, fixtures} = options;

  let str = require('../partials/header')(options);

  str += `<h1>${manufacturer.name} fixtures</h1>`;

  str += '<section class="manufacturer manufacturer-info">';
  if ('website' in manufacturer) {
    str += `<div class="website"><a href="${manufacturer.website}">Website</a></div>`;
  }
  if ('comment' in manufacturer) {
    str += `<p class="comment">${manufacturer.comment}</p>`;
  }
  str += '</section>';

  str += '<ul class="fixtures">';
  fixtures.forEach((fix) => {
    str += `<li><a href="${fix.path}">${fix.name}</a></li>`;
  });
  str += '</ul>';

  str += require('../partials/footer')(options);

  return str;
};