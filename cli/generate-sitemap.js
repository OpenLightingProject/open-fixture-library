const SitemapGenerator = require('sitemap-generator');
 
// create generator
const generator = SitemapGenerator('http://localhost:5000', {
  stripQuerystring: false
});
 
// register event listeners
generator.on('add', (url) => {
  console.log('Generator found url: ', url);
});
generator.on('error', (error) => {
  console.log('Generator error on:', error);
});
generator.on('done', () => {
  console.log('Generator has finished.');
});
 
// start the crawler
generator.start();