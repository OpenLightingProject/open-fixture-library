var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index', {
    title: 'Open Fixture Library'
  });
});

app.get('/about', function(request, response) {
  response.render('pages/about', {
    title: 'About - Open Fixture Library'
  });
});

app.get('/search', function(request, response) {
  response.render('pages/search', {
    title: 'Search - Open Fixture Library'
  });
});

app.get('/manufacturers', function(request, response) {
  response.render('pages/manufacturers', {
    title: 'Manufacturers - Open Fixture Library'
  });
});

app.get('/categories', function(request, response) {
  response.render('pages/categories', {
    title: 'Categories - Open Fixture Library'
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
