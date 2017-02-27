const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// setup port
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

// static files that shall be accessible
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');

// custom renderer
app.engine('js', (filePath, options, callback) => {
  const renderer = require(filePath);

  let opts = {
    manufacturers: manufacturers,
    manufacturersIndex: manufacturersIndex,
    typesIndex: typesIndex,
    messages: getMessages()
  };
  Object.assign(opts, options);

  callback(null, renderer(opts));
});
app.set('view engine', 'js');


// message objects to show to the user
let messages = [];

// the interesting data
let manufacturers = null;
let manufacturersIndex = null;
let typesIndex = null;

// read in the JSON files to fill those data structures
fs.readFile(path.join(__dirname, 'fixtures', 'manufacturers.json'), 'utf8', (error, data) => {
  if (error) {
    addFileReadError('There was an error reading in the manufacturer data.', error);
    return;
  }

  manufacturers = JSON.parse(data);
});
fs.readFile(path.join(__dirname, 'fixtures', 'index_manufacturers.json'), 'utf8', (error, data) => {
  if (error) {
    addFileReadError('There was an error reading in the manufacturer index data.', error);
    return;
  }

  manufacturersIndex = JSON.parse(data);
});
fs.readFile(path.join(__dirname, 'fixtures', 'index_types.json'), 'utf8', (error, data) => {
  if (error) {
    addFileReadError('There was an error reading in the category index data.', error);
    return;
  }

  typesIndex = JSON.parse(data);
});


const staticPages = {
  '/index': 'Open Fixture Library',
  '/about': 'About - Open Fixture Library',
  '/categories': 'Categories - Open Fixture Library'
};

app.use((request, response, next) => {
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

app.get('/manufacturers', (request, response) => {
  response.render('pages/manufacturers', {
    title: 'Manufacturers - Open Fixture Library'
  });
});

app.get('/search', (request, response) => {
  response.render('pages/search', {
    title: 'Search - Open Fixture Library'
  });
});

// if no other route applies
app.use((request, response, next) => {
  // first char is always a slash, last char has to be tested
  const sanitizedUrl = request.originalUrl.slice(1, (request.originalUrl.slice(-1) == '/') ? -1 : request.originalUrl.length);
  const segments = sanitizedUrl.split('/');


  if (segments.length == 1 && segments[0] in manufacturers) {
    renderSingleManufacturer(response, segments[0]);
    return;
  }
  else {
    if (segments.length == 2 && segments[0] in manufacturers && manufacturersIndex[segments[0]].indexOf(segments[1]) != -1) {
      renderSingleFixture(response, segments[0], segments[1]);
      return;
    }
  }

  response.status(404).render('pages/404', {
    title: 'Page not found - Open Fixture Library'
  })
});


function renderSingleManufacturer(response, man) {
  let fixtures = [];

  for (let fix of manufacturersIndex[man]) {
    const fixData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', man, fix + '.json'), 'utf-8'));

    fixtures.push({
      path: man + '/' + fix,
      name: fixData.name
    });
  }

  response.render('pages/single_manufacturer', {
    title: manufacturers[man].name + ' - Open Fixture Library',
    manufacturer: manufacturers[man],
    fixtures: fixtures
  });
}

function renderSingleFixture(response, man, fix) {
  const fixData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', man, fix + '.json'), 'utf-8'));

  response.render('pages/single_fixture', {
    title: `${manufacturers[man].name} ${fixData.name} - Open Fixture Library`,
    manufacturer: manufacturers[man],
    manufacturerPath: '/' + man,
    fixture: fixData
  });
}


function getMessages() {
  if (messages.length > 0) {
    return messages;
  }

  if (manufacturers == null || manufacturersIndex == null || typesIndex == null) {
    return [{
      type: 'info',
      text: 'We are still reading the data. Please reload the page in a few moments.'
    }];
  }

  return [];
}

function addFileReadError(text, error) {
  console.error(text, error.toString());
  messages.push({
    type: 'error',
    text: `${text}<br /><code>${error.toString()}</code>`
  });
}