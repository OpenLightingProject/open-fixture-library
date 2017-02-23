const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const staticPages = {
  '/index': 'Open Fixture Library',
  '/about': 'About - Open Fixture Library',
  '/manufacturers': 'Manufacturers - Open Fixture Library',
  '/categories': 'Categories - Open Fixture Library'
};

app.use(function(request, response, next) {
  let page = request.originalUrl;
  if (page == '/') {
    page = '/index';
  }

  if (page in staticPages) {
    response.render('pages' + page, {
      title: staticPages[page]
    });
  }
  else {
    next();
  }
});

app.get('/search', function(request, response) {
  response.render('pages/search', {
    title: 'Search - Open Fixture Library'
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.use(function(request, response, next) {
  response.status(404).render('pages/404', {
    title: 'Page not found - Open Fixture Library'
  })
});