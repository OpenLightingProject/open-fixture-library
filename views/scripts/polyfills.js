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


// https://jsfiddle.net/brianblakely/h3EmY/
(function templatePolyfill(d) {
  if ('content' in d.createElement('template')) {
    return;
  }

  var qPlates = d.getElementsByTagName('template'),
    plateLen = qPlates.length,
    elPlate,
    qContent,
    docContent;

  for (var x=0; x<plateLen; ++x) {
    elPlate = qPlates[x];
    qContent = elPlate.childNodes;
    docContent = d.createDocumentFragment();

    while (qContent[0]) {
      docContent.appendChild(qContent[0]);
    }

    elPlate.content = docContent;
  }
})(document);


// https://developer.mozilla.org/de/docs/Web/API/ParentNode/firstElementChild
// Overwrites native 'firstElementChild' prototype.
// Adds Document & DocumentFragment support for IE9 & Safari.
// Returns array instead of HTMLCollection.
(function(constructor) {
  if (constructor && constructor.prototype && !constructor.prototype.firstElementChild) {
    Object.defineProperty(constructor.prototype, 'firstElementChild', {
      get: function() {
        var nodes = this.childNodes, i = 0;
        while (nodes[i]) {
          if (nodes[i].nodeType === 1) {
            return nodes[i];
          }
          i++;
        }
        return null;
      }
    });
  }
})(window.Node || window.Element);


if (!NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}


if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length - 1;
      while (i >= 0 && matches.item(i) !== this) {
        i--;
      }
      return i > -1;
    };
}


// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    while (el) {
      if (el.matches(s)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };
}