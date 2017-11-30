const svg = require('./svg.js');

module.exports = function(options) {
  const structuredData = options.structuredDataItems.map(
    data => '<script type="application/ld+json">' + JSON.stringify(data, null, process.env.NODE_ENV === 'production' ? 0 : 2) + '</script>'
  );

  let str = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">`;

  if (process.env.ALLOW_SEARCH_INDEXING !== 'allowed') {
    str += '<meta name="robots" content="noindex, nofollow, none, noodp, noarchive, nosnippet, noimageindex, noydir, nocache">';
  }

  str += `<title>${options.title}</title>
  <link rel="stylesheet" type="text/css" href="/style.css" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
  <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
  <link rel="manifest" href="/manifest.json">
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#64b5f6">
  <script type="text/javascript" src="/js/main.js" async></script>
  ${structuredData.join('\n  ')}
</head>
<body>
  <a href="#content" class="accessibility">Skip to content</a>
  <header id="header">
    <nav>
      <div id="left-nav">
        <a href="/" id="home-logo" title="Home">Open Fixture Library</a>

        <form action="/search">
          <div>
            <input type="search" name="q" placeholder="Search fixtures" aria-label="Search fixtures" value="${options.searchQueryEscaped || ''}" />
          </div>
          <button type="submit">
            Search
            ${svg.getSvg('magnify')}
          </button>
        </form>
      </div>

      <div id="right-nav">
        <a href="/fixture-editor" title="Fixture editor">Add fixture</a>
        <a href="/manufacturers" title="Browse fixtures by manufacturer">Manufacturers</a>
        <a href="/categories" title="Browse fixtures by category">Categories</a>
        <a href="/about" title="About the project">About</a>
      </div>
    </nav>
  </header>
<div id="content">`;

  for (let message of options.messages) {
    str += `<div class="message message-${message.type}">${message.text}</div>`;
  }

  return str;
};
