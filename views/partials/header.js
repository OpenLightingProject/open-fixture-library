module.exports = function(options) {
  let str = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <link rel="stylesheet" type="text/css" href="/style.css" />
  <script type="text/javascript" src="/client.js"></script>
</head>
<body>
  <header>
    <nav>
      <div id="left-nav">
        <a href="/" id="home-logo" title="Open Fixture Library">Open Fixture Library</a>

        <form action="/search">
          <div>
            <input type="search" name="q" placeholder="Search fixture" />
          </div>
          <button type="submit">
            Search
            ${require('../partials/svg')({svgBasename: 'magnify'})}
          </button>
        </form>
      </div>

      <div id="right-nav">
        <a href="/manufacturers">Manufacturers</a>
        <a href="/categories">Categories</a>
        <a href="/about">About</a>
      </div>
    </nav>
  </header>
<div id="main">`;

  options.messages.forEach(function(message) {
    str += `<div class="message message-${message.type}">${message.text}</div>`;
  });

  return str;
};