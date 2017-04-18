// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    }
  });
}


// https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);


// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i,
        el = this;
    do {
      i = matches.length;
      while (--i >= 0 && matches.item(i) !== el) {};
    }
    while ((i < 0) && (el = el.parentElement));

    return el;
  };
}


// https://jsfiddle.net/brianblakely/h3EmY/
(function templatePolyfill(d) {
  if ('content' in d.createElement('template')) {
    return false;
  }

  var qPlates = d.getElementsByTagName('template'),
    plateLen = qPlates.length,
    elPlate,
    qContent,
    contentLen,
    docContent;

  for (var x=0; x<plateLen; ++x) {
    elPlate = qPlates[x];
    qContent = elPlate.childNodes;
    contentLen = qContent.length;
    docContent = d.createDocumentFragment();

    while (qContent[0]) {
      docContent.appendChild(qContent[0]);
    }

    elPlate.content = docContent;
  }
})(document);


if (!('forEach' in NodeList.prototype)) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}