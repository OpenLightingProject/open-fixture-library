import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { LRUCache } from 'lru-cache';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$2, dirname as dirname$1, join } from 'node:path';
import crypto$1, { createHash } from 'node:crypto';
import { toValue } from 'vue';
import { createConsola } from 'consola';
import { fileURLToPath } from 'node:url';
import { fileURLToPath as fileURLToPath$1 } from 'url';
import { inspect, styleText } from 'util';
import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend';
import { readFile as readFile$1 } from 'fs/promises';
import path$1 from 'path';
import { Octokit } from '@octokit/rest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ColorHash from 'color-hash';
import JSZip from 'jszip';
import { FilterXSS } from 'xss';
import { XMLParser } from 'fast-xml-parser';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}
function withHttps(input) {
  return withProtocol(input, "https://");
}
function withProtocol(input, protocol) {
  let match = input.match(PROTOCOL_REGEX);
  if (!match) {
    match = input.match(/^\/{2,}/);
  }
  if (!match) {
    return protocol + input;
  }
  return protocol + input.slice(match[0].length);
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject$5(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu$5(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject$5(defaults)) {
    return _defu$5(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject$5(value) && isPlainObject$5(object[key])) {
      object[key] = _defu$5(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu$5(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu$5(p, c, "", merger), {})
  );
}
const defu$5 = createDefu$5();

function o$1(n){throw new Error(`${n} is not implemented yet!`)}let i$2 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o$1("Readable.asyncIterator")}iterator(e){throw o$1("Readable.iterator")}map(e,t){throw o$1("Readable.map")}filter(e,t){throw o$1("Readable.filter")}forEach(e,t){throw o$1("Readable.forEach")}reduce(e,t,r){throw o$1("Readable.reduce")}find(e,t){throw o$1("Readable.find")}findIndex(e,t){throw o$1("Readable.findIndex")}some(e,t){throw o$1("Readable.some")}toArray(e){throw o$1("Readable.toArray")}every(e,t){throw o$1("Readable.every")}flatMap(e,t){throw o$1("Readable.flatMap")}drop(e,t){throw o$1("Readable.drop")}take(e,t){throw o$1("Readable.take")}asIndexedPairs(e){throw o$1("Readable.asIndexedPairs")}};let l$2 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$2,t=new l$2){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _$1(){return Object.assign(c$1.prototype,i$2.prototype),Object.assign(c$1.prototype,l$2.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_$1();let A$1 = class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};class y extends i$2{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$2{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$1(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$1=new Set([101,204,205,304]);async function b$1(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$1(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$1.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$1(n,e,t={}){try{const r=await b$1(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    appendResponseHeader(event, name, value);
  }
}
const appendHeaders = appendResponseHeaders;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

function resolveCorsOptions(options = {}) {
  const defaultOptions = {
    origin: "*",
    methods: "*",
    allowHeaders: "*",
    exposeHeaders: "*",
    credentials: false,
    maxAge: false,
    preflight: {
      statusCode: 204
    }
  };
  return defu$5(options, defaultOptions);
}
function isPreflightRequest(event) {
  const origin = getRequestHeader(event, "origin");
  const accessControlRequestMethod = getRequestHeader(
    event,
    "access-control-request-method"
  );
  return event.method === "OPTIONS" && !!origin && !!accessControlRequestMethod;
}
function isCorsOriginAllowed(origin, options) {
  const { origin: originOption } = options;
  if (!origin || !originOption || originOption === "*" || originOption === "null") {
    return true;
  }
  if (Array.isArray(originOption)) {
    return originOption.some((_origin) => {
      if (_origin instanceof RegExp) {
        return _origin.test(origin);
      }
      return origin === _origin;
    });
  }
  return originOption(origin);
}
function createOriginHeaders(event, options) {
  const { origin: originOption } = options;
  const origin = getRequestHeader(event, "origin");
  if (!origin || !originOption || originOption === "*") {
    return { "access-control-allow-origin": "*" };
  }
  if (typeof originOption === "string") {
    return { "access-control-allow-origin": originOption, vary: "origin" };
  }
  return isCorsOriginAllowed(origin, options) ? { "access-control-allow-origin": origin, vary: "origin" } : {};
}
function createMethodsHeaders(options) {
  const { methods } = options;
  if (!methods) {
    return {};
  }
  if (methods === "*") {
    return { "access-control-allow-methods": "*" };
  }
  return methods.length > 0 ? { "access-control-allow-methods": methods.join(",") } : {};
}
function createCredentialsHeaders(options) {
  const { credentials } = options;
  if (credentials) {
    return { "access-control-allow-credentials": "true" };
  }
  return {};
}
function createAllowHeaderHeaders(event, options) {
  const { allowHeaders } = options;
  if (!allowHeaders || allowHeaders === "*" || allowHeaders.length === 0) {
    const header = getRequestHeader(event, "access-control-request-headers");
    return header ? {
      "access-control-allow-headers": header,
      vary: "access-control-request-headers"
    } : {};
  }
  return {
    "access-control-allow-headers": allowHeaders.join(","),
    vary: "access-control-request-headers"
  };
}
function createExposeHeaders(options) {
  const { exposeHeaders } = options;
  if (!exposeHeaders) {
    return {};
  }
  if (exposeHeaders === "*") {
    return { "access-control-expose-headers": exposeHeaders };
  }
  return { "access-control-expose-headers": exposeHeaders.join(",") };
}
function appendCorsPreflightHeaders(event, options) {
  appendHeaders(event, createOriginHeaders(event, options));
  appendHeaders(event, createCredentialsHeaders(options));
  appendHeaders(event, createExposeHeaders(options));
  appendHeaders(event, createMethodsHeaders(options));
  appendHeaders(event, createAllowHeaderHeaders(event, options));
}
function appendCorsHeaders(event, options) {
  appendHeaders(event, createOriginHeaders(event, options));
  appendHeaders(event, createCredentialsHeaders(options));
  appendHeaders(event, createExposeHeaders(options));
}

function handleCors(event, options) {
  const _options = resolveCorsOptions(options);
  if (isPreflightRequest(event)) {
    appendCorsPreflightHeaders(event, options);
    sendNoContent(event, _options.preflight.statusCode);
    return true;
  }
  appendCorsHeaders(event, options);
  return false;
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function fromNodeMiddleware(handler) {
  if (isEventHandler(handler)) {
    return handler;
  }
  if (typeof handler !== "function") {
    throw new TypeError(
      "Invalid handler. It should be a function:",
      handler
    );
  }
  return eventHandler((event) => {
    return callNodeListener(
      handler,
      event.node.req,
      event.node.res
    );
  });
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}
function callNodeListener(handler, req, res) {
  const isMiddleware = handler.length > 2;
  return new Promise((resolve, reject) => {
    const next = (err) => {
      if (isMiddleware) {
        res.off("close", next);
        res.off("error", next);
      }
      return err ? reject(createError$1(err)) : resolve(void 0);
    };
    try {
      const returned = handler(req, res, next);
      if (isMiddleware && returned === void 0) {
        res.once("close", next);
        res.once("error", next);
      } else {
        resolve(returned);
      }
    } catch (error) {
      next(error);
    }
  });
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i$1=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i$1;
const ofetch = createFetch({ fetch, Headers: Headers$1, AbortController: AbortController$1 });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive$1(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive$1(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$2 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$2,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

const DRIVER_NAME$1 = "lru-cache";
const unstorage_47drivers_47lru_45cache = defineDriver((opts = {}) => {
  const cache = new LRUCache({
    max: 1e3,
    sizeCalculation: opts.maxSize || opts.maxEntrySize ? (value, key) => {
      return key.length + byteLength(value);
    } : void 0,
    ...opts
  });
  return {
    name: DRIVER_NAME$1,
    options: opts,
    getInstance: () => cache,
    hasItem(key) {
      return cache.has(key);
    },
    getItem(key) {
      return cache.get(key) ?? null;
    },
    getItemRaw(key) {
      return cache.get(key) ?? null;
    },
    setItem(key, value) {
      cache.set(key, value);
    },
    setItemRaw(key, value) {
      cache.set(key, value);
    },
    removeItem(key) {
      cache.delete(key);
    },
    getKeys() {
      return [...cache.keys()];
    },
    clear() {
      cache.clear();
    },
    dispose() {
      cache.clear();
    }
  };
});
function byteLength(value) {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.byteLength(value);
    } catch {
    }
  }
  try {
    return typeof value === "string" ? value.length : JSON.stringify(value).length;
  } catch {
  }
  return 0;
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$2(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage$1 = createStorage({});

storage$1.mount('/assets', assets$1);

storage$1.mount('#rate-limiter-storage', unstorage_47drivers_47lru_45cache({"driver":"lruCache"}));
storage$1.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage$1, base) : storage$1;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r$1="sha256",s="base64url";function digest(t){if(e)return e(r$1,t,s);const o=createHash(r$1).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

function isPlainObject$4(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu$4(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject$4(defaults)) {
    return _defu$4(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject$4(value) && isPlainObject$4(object[key])) {
      object[key] = _defu$4(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu$4(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu$4(p, c, "", merger), {})
  );
}
const defu$4 = createDefu$4();
const defuFn = createDefu$4((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "9f053eb2-9b56-40a7-b379-d3f6d9f610eb",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/**": {
        "headers": {
          "Referrer-Policy": "no-referrer",
          "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "X-Download-Options": "noopen",
          "X-Frame-Options": "SAMEORIGIN",
          "X-Permitted-Cross-Domain-Policies": "none",
          "X-XSS-Protection": "0"
        }
      },
      "/__sitemap__/style.xsl": {
        "headers": {
          "Content-Type": "application/xslt+xml"
        }
      },
      "/sitemap.xml": {},
      "/_nuxt": {
        "robots": "noindex",
        "headers": {
          "X-Robots-Tag": "noindex"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable",
          "X-Robots-Tag": "noindex"
        },
        "robots": "noindex"
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "websiteUrl": "http://localhost:3000/",
    "searchIndexingIsAllowed": false,
    "nuxt-robots": {
      "version": "5.7.1",
      "isNuxtContentV2": false,
      "debug": false,
      "credits": true,
      "groups": [
        {
          "userAgent": [
            "*"
          ],
          "disallow": [
            "/"
          ],
          "allow": [],
          "contentUsage": [],
          "contentSignal": [],
          "_indexable": false,
          "_rules": [
            {
              "pattern": "/",
              "allow": false
            }
          ],
          "_normalized": true
        }
      ],
      "sitemap": [
        "/sitemap.xml"
      ],
      "header": true,
      "robotsEnabledValue": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      "robotsDisabledValue": "noindex, nofollow",
      "cacheControl": "max-age=14400, must-revalidate",
      "botDetection": true,
      "pageMetaRobots": {}
    }
  },
  "private": {
    "basicAuth": false
  },
  "security": {
    "strict": false,
    "headers": {
      "crossOriginResourcePolicy": "same-origin",
      "crossOriginOpenerPolicy": "same-origin",
      "crossOriginEmbedderPolicy": false,
      "contentSecurityPolicy": {
        "base-uri": [
          "'self'"
        ],
        "font-src": [
          "'self'"
        ],
        "form-action": [
          "'self'"
        ],
        "frame-ancestors": [
          "'none'"
        ],
        "img-src": [
          "'self'",
          "https://*.open-fixture-library.org",
          "https://*.ytimg.com",
          "data:"
        ],
        "object-src": [
          "'none'"
        ],
        "script-src-attr": [
          "'none'"
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'"
        ],
        "script-src": [
          "'self'",
          "'unsafe-eval'"
        ],
        "upgrade-insecure-requests": true,
        "default-src": [
          "'none'"
        ],
        "frame-src": [
          "'self'",
          "https://*.vimeo.com",
          "*.youtube-nocookie.com",
          "https://www.facebook.com"
        ],
        "connect-src": [
          "'self'"
        ],
        "manifest-src": [
          "'self'"
        ],
        "media-src": [
          "*"
        ]
      },
      "originAgentCluster": "?1",
      "referrerPolicy": "no-referrer",
      "strictTransportSecurity": {
        "maxAge": 63072000,
        "includeSubdomains": true,
        "preload": true
      },
      "xContentTypeOptions": "nosniff",
      "xDNSPrefetchControl": "off",
      "xDownloadOptions": "noopen",
      "xFrameOptions": "SAMEORIGIN",
      "xPermittedCrossDomainPolicies": "none",
      "xXSSProtection": "0",
      "permissionsPolicy": {
        "camera": [],
        "display-capture": [],
        "fullscreen": [],
        "geolocation": [],
        "microphone": []
      }
    },
    "requestSizeLimiter": {
      "maxRequestSizeInBytes": 2000000,
      "maxUploadFileRequestInBytes": 8000000,
      "throwError": true
    },
    "rateLimiter": {
      "tokensPerInterval": 150,
      "interval": 300000,
      "headers": false,
      "driver": {
        "name": "lruCache"
      },
      "whiteList": "",
      "ipHeader": "",
      "throwError": true
    },
    "xssValidator": {
      "methods": [
        "GET",
        "POST"
      ],
      "throwError": true
    },
    "corsHandler": {
      "origin": "http://localhost:3000",
      "methods": [
        "GET",
        "HEAD",
        "PUT",
        "PATCH",
        "POST",
        "DELETE"
      ],
      "preflight": {
        "statusCode": 204
      }
    },
    "allowedMethodsRestricter": {
      "methods": "*",
      "throwError": true
    },
    "hidePoweredBy": true,
    "enabled": true,
    "csrf": false,
    "nonce": true,
    "removeLoggers": true,
    "ssg": {
      "meta": true,
      "hashScripts": true,
      "hashStyles": false,
      "nitroHeaders": true,
      "exportToPresets": true
    },
    "sri": true
  },
  "sitemap": {
    "isI18nMapped": false,
    "sitemapName": "sitemap.xml",
    "isMultiSitemap": false,
    "excludeAppSources": [],
    "cacheMaxAgeSeconds": 600,
    "autoLastmod": false,
    "defaultSitemapsChunkSize": 1000,
    "minify": false,
    "sortEntries": true,
    "debug": false,
    "discoverImages": true,
    "discoverVideos": true,
    "sitemapsPathPrefix": "/__sitemap__/",
    "isNuxtContentDocumentDriven": false,
    "xsl": "/__sitemap__/style.xsl",
    "xslTips": true,
    "xslColumns": [
      {
        "label": "URL",
        "width": "50%"
      },
      {
        "label": "Images",
        "width": "25%",
        "select": "count(image:image)"
      },
      {
        "label": "Last Updated",
        "width": "25%",
        "select": "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"
      }
    ],
    "credits": true,
    "version": "7.6.0",
    "sitemaps": {
      "sitemap.xml": {
        "sitemapName": "sitemap.xml",
        "route": "sitemap.xml",
        "defaults": {},
        "include": [],
        "exclude": [
          "/_**",
          "/_nuxt/**"
        ],
        "includeAppSources": true
      }
    }
  },
  "nuxt-site-config": {
    "stack": [
      {
        "_context": "system",
        "_priority": -15,
        "name": "open-fixture-library",
        "env": "production"
      },
      {
        "_context": "package.json",
        "_priority": -10,
        "name": "open-fixture-library",
        "description": "An open source library for lighting technology's fixture definition files"
      }
    ],
    "version": "3.2.21",
    "debug": false,
    "multiTenancy": []
  },
  "nuxt-robots": {
    "version": "5.7.1",
    "isNuxtContentV2": false,
    "debug": false,
    "credits": true,
    "groups": [
      {
        "userAgent": [
          "*"
        ],
        "disallow": [
          "/"
        ],
        "allow": [],
        "contentUsage": [],
        "contentSignal": [],
        "_indexable": false,
        "_rules": [
          {
            "pattern": "/",
            "allow": false
          }
        ],
        "_normalized": true
      }
    ],
    "sitemap": [
      "/sitemap.xml"
    ],
    "header": true,
    "robotsEnabledValue": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    "robotsDisabledValue": "noindex, nofollow",
    "cacheControl": "max-age=14400, must-revalidate",
    "botDetection": true,
    "pageMetaRobots": {}
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

function isPlainObject$3(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu$3(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject$3(defaults)) {
    return _defu$3(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject$3(value) && isPlainObject$3(object[key])) {
      object[key] = _defu$3(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu$3(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu$3(p, c, "", merger), {})
  );
}
const defu$3 = createDefu$3();

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu$3({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

/**
* Nitro internal functions extracted from https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/utils.ts
*/
function isJsonRequest(event) {
	// If the client specifically requests HTML, then avoid classifying as JSON.
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		// let Nitro handle JSON errors
		return;
	}
	// invoke default Nitro error handler (which will log appropriately if required)
	const defaultRes = await defaultHandler(error, event, { json: true });
	// let Nitro handle redirect if appropriate
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	// remove proto/hostname/port from URL
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	// add default server message (keep sanitized for unhandled errors)
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	// we will be rendering this error internally so we can pass along the error.data safely
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	// Access request headers
	const reqHeaders = getRequestHeaders(event);
	// Detect to avoid recursion in SSR rendering of errors
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
	// HTML response (via SSR)
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	// Fallback to static rendered error page
	if (!res) {
		const { template } = await import('../_/error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
const escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  const counts = /* @__PURE__ */ new Map();
  let logNum = 0;
  function log(message) {
    if (logNum < 100) {
      console.warn(message);
      logNum += 1;
    }
  }
  function walk(thing) {
    if (typeof thing === "function") {
      log(`Cannot stringify a function ${thing.name}`);
      return;
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          const proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            if (typeof thing.toJSON !== "function") {
              log(`Cannot stringify arbitrary non-POJOs ${thing.constructor.name}`);
            }
          } else if (Object.getOwnPropertySymbols(thing).length > 0) {
            log(`Cannot stringify POJOs with symbolic keys ${Object.getOwnPropertySymbols(thing).map((symbol) => symbol.toString())}`);
          } else {
            Object.keys(thing).forEach((key) => walk(thing[key]));
          }
      }
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    const type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify(thing.valueOf())})`;
      case "RegExp":
        return thing.toString();
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = thing.map((v, i) => i in thing ? stringify(v) : "");
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
      default:
        if (thing.toJSON) {
          let json = thing.toJSON();
          if (getType(json) === "String") {
            try {
              json = JSON.parse(json);
            } catch (e) {
            }
          }
          return stringify(json);
        }
        if (Object.getPrototypeOf(thing) === null) {
          if (Object.keys(thing).length === 0) {
            return "Object.create(null)";
          }
          return `Object.create(null,{${Object.keys(thing).map((key) => `${safeKey(key)}:{writable:true,enumerable:true,value:${stringify(thing[key])}}`).join(",")}})`;
        }
        return `{${Object.keys(thing).map((key) => `${safeKey(key)}:${stringify(thing[key])}`).join(",")}}`;
    }
  }
  const str = stringify(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (isPrimitive(thing)) {
        values.push(stringifyPrimitive(thing));
        return;
      }
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify(v)}`);
          });
          break;
        case "Set":
          values.push("new Set");
          statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify(v)})`).join(".")}`);
          break;
        case "Map":
          values.push("new Map");
          statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify(k)}, ${stringify(v)})`).join(".")}`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safeProp(key)}=${stringify(thing[key])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function getName(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string") {
    return stringifyString(thing);
  }
  if (thing === void 0) {
    return "void 0";
  }
  if (thing === 0 && 1 / thing < 0) {
    return "-0";
  }
  const str = String(thing);
  if (typeof thing === "number") {
    return str.replace(/^(-)?0\./, "$1.");
  }
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escapeUnsafeChars(JSON.stringify(key))}]`;
}
function stringifyString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

function normalizeSiteConfig(config) {
  if (typeof config.indexable !== "undefined")
    config.indexable = String(config.indexable) !== "false";
  if (typeof config.trailingSlash !== "undefined" && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== "false";
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url));
  const keys = Object.keys(config).sort((a, b) => a.localeCompare(b));
  const newConfig = {};
  for (const k of keys)
    newConfig[k] = config[k];
  return newConfig;
}
function createSiteConfigStack(options) {
  const debug = options?.debug || false;
  const stack = [];
  function push(input) {
    if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
      return () => {
      };
    }
    if (!input._context && debug) {
      let lastFunctionName = new Error("tmp").stack?.split("\n")[2]?.split(" ")[5];
      if (lastFunctionName?.includes("/"))
        lastFunctionName = "anonymous";
      input._context = lastFunctionName;
    }
    const entry = {};
    for (const k in input) {
      const val = input[k];
      if (typeof val !== "undefined" && val !== "")
        entry[k] = val;
    }
    if (Object.keys(entry).filter((k) => !k.startsWith("_")).length === 0) {
      return () => {
      };
    }
    stack.push(entry);
    return () => {
      const idx = stack.indexOf(entry);
      if (idx !== -1)
        stack.splice(idx, 1);
    };
  }
  function get(options2) {
    const siteConfig = {};
    if (options2?.debug)
      siteConfig._context = {};
    siteConfig._priority = {};
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k;
        const val = options2?.resolveRefs ? toValue(stack[o][k]) : stack[o][k];
        if (!k.startsWith("_") && typeof val !== "undefined" && val !== "") {
          siteConfig[k] = val;
          if (typeof stack[o]._priority !== "undefined" && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority;
          }
          if (options2?.debug)
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || "anonymous";
        }
      }
    }
    return options2?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig);
  }
  return {
    stack,
    push,
    get
  };
}

function envSiteConfig(env = {}) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith("NUXT_SITE_") || k.startsWith("NUXT_PUBLIC_SITE_")).map(([k, v]) => [
    k.replace(/^NUXT_(PUBLIC_)?SITE_/, "").split("_").map((s, i) => i === 0 ? s.toLowerCase() : s[0]?.toUpperCase() + s.slice(1).toLowerCase()).join(""),
    v
  ]));
}

function getSiteConfig(e, _options) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack();
  const options = defu$4(_options, useRuntimeConfig(e)["nuxt-site-config"], { debug: false });
  return e.context.siteConfig.get(options);
}

const _ULFRGF1_WEj5w0_Q4MBWcVc6bHN0wBDKH_qXv1tZCM = defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", async (ctx, { event }) => {
    const routeOptions = getRouteRules(event);
    const isIsland = process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith("/__nuxt_island");
    event.path;
    const noSSR = !!process.env.NUXT_NO_SSR || event.context.nuxt?.noSSR || routeOptions.ssr === false && !isIsland || (false);
    if (noSSR) {
      const siteConfig = Object.fromEntries(
        Object.entries(getSiteConfig(event)).map(([k, v]) => [k, toValue(v)])
      );
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}<\/script>`);
    }
  });
});

function isPlainObject$2(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu$2(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject$2(defaults)) {
    return _defu$2(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject$2(value) && isPlainObject$2(object[key])) {
      object[key] = _defu$2(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu$2(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu$2(p, c, "", merger), {})
  );
}
const defu$2 = createDefu$2();

const KNOWN_SEARCH_BOTS = [
  {
    pattern: "googlebot",
    name: "googlebot",
    secondaryPatterns: ["google.com/bot.html"]
  },
  {
    pattern: "bingbot",
    name: "bingbot",
    secondaryPatterns: ["msnbot"]
  },
  {
    pattern: "yandexbot",
    name: "yandexbot"
  },
  {
    pattern: "baiduspider",
    name: "baiduspider",
    secondaryPatterns: ["baidu.com"]
  },
  {
    pattern: "duckduckbot",
    name: "duckduckbot",
    secondaryPatterns: ["duckduckgo.com"]
  },
  {
    pattern: "slurp",
    name: "yahoo"
  },
  {
    pattern: "applebot",
    name: "applebot",
    secondaryPatterns: ["apple.com/go/applebot"]
  }
];
const SOCIAL_BOTS = [
  {
    pattern: "twitterbot",
    name: "twitter",
    secondaryPatterns: ["twitter"]
  },
  {
    pattern: "facebookexternalhit",
    name: "facebook",
    secondaryPatterns: ["facebook.com"]
  },
  {
    pattern: "linkedinbot",
    name: "linkedin",
    secondaryPatterns: ["linkedin"]
  },
  {
    pattern: "pinterestbot",
    name: "pinterest",
    secondaryPatterns: ["pinterest"]
  },
  {
    pattern: "discordbot",
    name: "discord",
    secondaryPatterns: ["discordapp"]
  }
];
const SEO_BOTS = [
  {
    pattern: "mj12bot",
    name: "majestic12",
    secondaryPatterns: ["majestic12.co.uk/bot"]
  },
  {
    pattern: "ahrefsbot",
    name: "ahrefs",
    secondaryPatterns: ["ahrefs.com"]
  },
  {
    pattern: "semrushbot",
    name: "semrush",
    secondaryPatterns: ["semrush.com/bot"]
  },
  {
    pattern: "screaming frog",
    name: "screaming-frog",
    secondaryPatterns: ["screamingfrog.co.uk"]
  },
  {
    pattern: "rogerbot",
    name: "moz"
  }
];
const AI_BOTS = [
  {
    pattern: "anthropic",
    name: "anthropic"
  },
  {
    pattern: "claude",
    name: "claude"
  },
  {
    pattern: "gptbot",
    name: "gpt",
    secondaryPatterns: ["openai.com"]
  },
  {
    pattern: "google-extended",
    name: "google-extended"
  },
  {
    pattern: "applebot-extended",
    name: "applebot-extended"
  },
  {
    pattern: "bytespider",
    name: "bytespider"
  },
  {
    pattern: "diffbot",
    name: "diffbot"
  },
  {
    pattern: "googlebot-news",
    name: "google-news"
  },
  {
    pattern: "cohere",
    name: "cohere",
    secondaryPatterns: ["cohere.com"]
  },
  {
    pattern: "ccbot",
    name: "commoncrawl",
    secondaryPatterns: ["commoncrawl.org"]
  },
  {
    pattern: "perplexitybot",
    name: "perplexity",
    secondaryPatterns: ["perplexity.ai"]
  }
];
const HTTP_TOOL_BOTS = [
  {
    pattern: "python-requests",
    name: "requests",
    secondaryPatterns: ["python"]
  },
  {
    pattern: "wget",
    name: "wget"
  },
  {
    pattern: "curl",
    name: "curl",
    secondaryPatterns: ["curl"]
  }
];
const SECURITY_SCANNING_BOTS = [
  {
    pattern: "zgrab",
    name: "zgrab"
  },
  {
    pattern: "masscan",
    name: "masscan"
  },
  {
    pattern: "nmap",
    name: "nmap",
    secondaryPatterns: ["insecure.org"]
  },
  {
    pattern: "nikto",
    name: "nikto"
  },
  {
    pattern: "wpscan",
    name: "wpscan"
  }
];
const SCRAPING_BOTS = [
  {
    pattern: "scrapy",
    name: "scrapy",
    secondaryPatterns: ["scrapy.org"]
  }
];
const AUTOMATION_BOTS = [
  {
    pattern: "phantomjs",
    name: "phantomjs"
  },
  {
    pattern: "headless",
    name: "headless-browser"
  },
  {
    pattern: "playwright",
    name: "playwright"
  },
  {
    pattern: "selenium",
    name: "selenium",
    secondaryPatterns: ["webdriver"]
  },
  {
    pattern: "puppeteer",
    name: "puppeteer",
    secondaryPatterns: ["headless"]
  }
];
const GENERIC_BOTS = [
  {
    pattern: "bot",
    name: "generic-bot"
  },
  {
    pattern: "spider",
    name: "generic-spider"
  },
  {
    pattern: "crawler",
    name: "generic-crawler"
  },
  {
    pattern: "scraper",
    name: "generic-scraper"
  }
];
const BOT_MAP = [
  {
    type: "search-engine",
    bots: KNOWN_SEARCH_BOTS,
    trusted: true
  },
  {
    type: "social",
    bots: SOCIAL_BOTS,
    trusted: true
  },
  {
    type: "seo",
    bots: SEO_BOTS,
    trusted: true
  },
  {
    type: "ai",
    bots: AI_BOTS,
    trusted: true
  },
  {
    type: "generic",
    bots: GENERIC_BOTS,
    trusted: false
  },
  {
    type: "automation",
    bots: AUTOMATION_BOTS,
    trusted: false
  },
  {
    type: "http-tool",
    bots: HTTP_TOOL_BOTS,
    trusted: false
  },
  {
    type: "security-scanner",
    bots: SECURITY_SCANNING_BOTS,
    trusted: false
  },
  {
    type: "scraping",
    bots: SCRAPING_BOTS,
    trusted: false
  }
];

const ROBOT_DIRECTIVE_VALUES = {
  // Standard directives
  enabled: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  disabled: "noindex, nofollow",
  index: "index",
  noindex: "noindex",
  follow: "follow",
  nofollow: "nofollow",
  none: "none",
  all: "all",
  // Non-standard directives (not part of official robots spec)
  noai: "noai",
  noimageai: "noimageai"
};
function formatMaxImagePreview(value) {
  return `max-image-preview:${value}`;
}
function formatMaxSnippet(value) {
  return `max-snippet:${value}`;
}
function formatMaxVideoPreview(value) {
  return `max-video-preview:${value}`;
}
function matches(pattern, path) {
  const pathLength = path.length;
  const patternLength = pattern.length;
  const matchingLengths = Array.from({ length: pathLength + 1 }).fill(0);
  let numMatchingLengths = 1;
  let p = 0;
  while (p < patternLength) {
    if (pattern[p] === "$" && p + 1 === patternLength) {
      return matchingLengths[numMatchingLengths - 1] === pathLength;
    }
    if (pattern[p] === "*") {
      numMatchingLengths = pathLength - matchingLengths[0] + 1;
      for (let i = 1; i < numMatchingLengths; i++) {
        matchingLengths[i] = matchingLengths[i - 1] + 1;
      }
    } else {
      let numMatches = 0;
      for (let i = 0; i < numMatchingLengths; i++) {
        const matchLength = matchingLengths[i];
        if (matchLength < pathLength && path[matchLength] === pattern[p]) {
          matchingLengths[numMatches++] = matchLength + 1;
        }
      }
      if (numMatches === 0) {
        return false;
      }
      numMatchingLengths = numMatches;
    }
    p++;
  }
  return true;
}
function matchPathToRule(path, _rules) {
  let matchedRule = null;
  const rules = _rules.filter(Boolean);
  const rulesLength = rules.length;
  let i = 0;
  while (i < rulesLength) {
    const rule = rules[i];
    if (!rule || !matches(rule.pattern, path)) {
      i++;
      continue;
    }
    if (!matchedRule || rule.pattern.length > matchedRule.pattern.length) {
      matchedRule = rule;
    } else if (rule.pattern.length === matchedRule.pattern.length && rule.allow && !matchedRule.allow) {
      matchedRule = rule;
    }
    i++;
  }
  return matchedRule;
}
function asArray(v) {
  return typeof v === "undefined" ? [] : Array.isArray(v) ? v : [v];
}
function contentUsageToString(prefs) {
  return Object.entries(prefs).filter(([_, value]) => value !== void 0).map(([key, value]) => `${key}=${value}`).join(", ");
}
function normalizeContentPreferences(value) {
  if (!value)
    return [];
  if (Array.isArray(value))
    return value.filter((rule) => Boolean(rule));
  if (typeof value === "object" && !Array.isArray(value)) {
    const str = contentUsageToString(value);
    return str ? [str] : [];
  }
  if (typeof value === "string")
    return value ? [value] : [];
  return [];
}
function normalizeGroup(group) {
  if (group._normalized) {
    const resolvedGroup = group;
    const disallow2 = asArray(resolvedGroup.disallow);
    resolvedGroup._indexable = !disallow2.includes("/");
    resolvedGroup._rules = [
      ...resolvedGroup.disallow.filter(Boolean).map((r) => ({ pattern: r, allow: false })),
      ...resolvedGroup.allow.map((r) => ({ pattern: r, allow: true }))
    ];
    return resolvedGroup;
  }
  const disallow = asArray(group.disallow);
  const allow = asArray(group.allow).filter((rule) => Boolean(rule));
  const contentUsage = normalizeContentPreferences(group.contentUsage);
  const contentSignal = normalizeContentPreferences(group.contentSignal);
  return {
    ...group,
    userAgent: group.userAgent ? asArray(group.userAgent) : ["*"],
    disallow,
    allow,
    contentUsage,
    contentSignal,
    _indexable: !disallow.includes("/"),
    _rules: [
      ...disallow.filter(Boolean).map((r) => ({ pattern: r, allow: false })),
      ...allow.map((r) => ({ pattern: r, allow: true }))
    ],
    _normalized: true
  };
}
function generateRobotsTxt({ groups, sitemaps }) {
  const lines = [];
  for (const group of groups) {
    for (const comment of group.comment || [])
      lines.push(`# ${comment}`);
    for (const userAgent of group.userAgent || ["*"])
      lines.push(`User-agent: ${userAgent}`);
    for (const allow of group.allow || [])
      lines.push(`Allow: ${allow}`);
    for (const disallow of group.disallow || [])
      lines.push(`Disallow: ${disallow}`);
    for (const cleanParam of group.cleanParam || [])
      lines.push(`Clean-param: ${cleanParam}`);
    for (const contentUsage of group.contentUsage || [])
      lines.push(`Content-Usage: ${contentUsage}`);
    for (const contentSignal of group.contentSignal || [])
      lines.push(`Content-Signal: ${contentSignal}`);
    lines.push("");
  }
  for (const sitemap of sitemaps)
    lines.push(`Sitemap: ${sitemap}`);
  return lines.join("\n");
}
function createPatternMap() {
  const patternMap = /* @__PURE__ */ new Map();
  for (const def of BOT_MAP) {
    for (const bot of def.bots) {
      const patterns = [bot.pattern, ...bot.secondaryPatterns || []];
      for (const pattern of patterns) {
        patternMap.set(pattern.toLowerCase(), {
          botName: bot.name,
          botCategory: def.type,
          trusted: def.trusted
        });
      }
    }
  }
  return patternMap;
}
function normaliseRobotsRouteRule(config) {
  let allow;
  if (typeof config.robots === "boolean")
    allow = config.robots;
  else if (typeof config.robots === "object" && "indexable" in config.robots && typeof config.robots.indexable !== "undefined")
    allow = config.robots.indexable;
  let rule;
  if (typeof config.robots === "object" && config.robots !== null) {
    if ("rule" in config.robots && typeof config.robots.rule !== "undefined") {
      rule = config.robots.rule;
    } else if (!("indexable" in config.robots)) {
      const directives = [];
      for (const [key, value] of Object.entries(config.robots)) {
        if (value === false || value === null || value === void 0)
          continue;
        if (key in ROBOT_DIRECTIVE_VALUES && typeof value === "boolean" && value) {
          directives.push(ROBOT_DIRECTIVE_VALUES[key]);
        } else if (key === "max-image-preview" && typeof value === "string") {
          directives.push(formatMaxImagePreview(value));
        } else if (key === "max-snippet" && typeof value === "number") {
          directives.push(formatMaxSnippet(value));
        } else if (key === "max-video-preview" && typeof value === "number") {
          directives.push(formatMaxVideoPreview(value));
        }
      }
      if (directives.length > 0) {
        rule = directives.join(", ");
      }
    }
  } else if (typeof config.robots === "string") {
    rule = config.robots;
  }
  if (rule && typeof allow === "undefined") {
    const disallowIndicators = ["none", "noindex", "noai", "noimageai"];
    allow = !disallowIndicators.some(
      (indicator) => rule === indicator || rule.split(",").some((part) => part.trim() === indicator)
    );
  }
  if (typeof allow === "undefined" && typeof rule === "undefined")
    return;
  return {
    allow,
    rule
  };
}

function useRuntimeConfigNuxtRobots(event) {
  return useRuntimeConfig(event)["nuxt-robots"];
}

const logger$1 = createConsola({
  defaults: { tag: "@nuxtjs/robots" }
});

async function resolveRobotsTxtContext(e, nitro = useNitroApp()) {
  const { groups, sitemap: sitemaps } = useRuntimeConfigNuxtRobots(e);
  const generateRobotsTxtCtx = {
    event: e,
    context: e ? "robots.txt" : "init",
    ...JSON.parse(JSON.stringify({ groups, sitemaps }))
  };
  await nitro.hooks.callHook("robots:config", generateRobotsTxtCtx);
  generateRobotsTxtCtx.groups = generateRobotsTxtCtx.groups.map(normalizeGroup);
  nitro._robots.ctx = generateRobotsTxtCtx;
  return generateRobotsTxtCtx;
}

const _x_X86JoVe8VqFcanK9vyKrNMDvKiRNVxGG_W4IO8MfE = defineNitroPlugin(async (nitroApp) => {
  const { isNuxtContentV2, robotsDisabledValue, botDetection } = useRuntimeConfigNuxtRobots();
  if (botDetection !== false) {
    nitroApp._robotsPatternMap = createPatternMap();
  }
  nitroApp._robots = {};
  await resolveRobotsTxtContext(void 0, nitroApp);
  const nuxtContentUrls = /* @__PURE__ */ new Set();
  if (isNuxtContentV2) {
    let urls;
    try {
      urls = await (await nitroApp.localFetch("/__robots__/nuxt-content.json", {})).json();
    } catch (e) {
      logger$1.error("Failed to read robot rules from content files.", e);
    }
    if (urls && Array.isArray(urls) && urls.length) {
      urls.forEach((url) => nuxtContentUrls.add(withoutTrailingSlash(url)));
    }
  }
  if (nuxtContentUrls.size) {
    nitroApp._robots.nuxtContentUrls = nuxtContentUrls;
  }
});

function isPlainObject$1(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu$1(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject$1(defaults)) {
    return _defu$1(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject$1(value) && isPlainObject$1(object[key])) {
      object[key] = _defu$1(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu$1(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu$1(p, c, "", merger), {})
  );
}
const defu$1 = createDefu$1();

const defuReplaceArray = createDefu$1((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value;
    return true;
  }
});

const nitroAppSecurityOptions = {};
function getAppSecurityOptions() {
  return nitroAppSecurityOptions;
}
function resolveSecurityRules(event) {
  if (!event.context.security) {
    event.context.security = {};
  }
  if (!event.context.security.rules) {
    const router = createRouter$1({ routes: structuredClone(nitroAppSecurityOptions) });
    const matcher = toRouteMatcher(router);
    const eventPathNoQuery = event.path.split("?")[0];
    const matches = eventPathNoQuery ? matcher.matchAll(eventPathNoQuery) : [];
    const rules = defuReplaceArray({}, ...matches.reverse());
    event.context.security.rules = rules;
  }
  return event.context.security.rules;
}
function resolveSecurityRoute(event) {
  if (!event.context.security) {
    event.context.security = {};
  }
  if (!event.context.security.route) {
    const routeNames = Object.fromEntries(Object.entries(nitroAppSecurityOptions).map(([name]) => [name, { name }]));
    const router = createRouter$1({ routes: routeNames });
    const eventPathNoQuery = event.path.split("?")[0];
    const match = eventPathNoQuery ? router.lookup(eventPathNoQuery) : void 0;
    const route = match?.name ?? "";
    event.context.security.route = route;
  }
  return event.context.security.route;
}

const KEYS_TO_NAMES = {
  contentSecurityPolicy: "Content-Security-Policy",
  crossOriginEmbedderPolicy: "Cross-Origin-Embedder-Policy",
  crossOriginOpenerPolicy: "Cross-Origin-Opener-Policy",
  crossOriginResourcePolicy: "Cross-Origin-Resource-Policy",
  originAgentCluster: "Origin-Agent-Cluster",
  referrerPolicy: "Referrer-Policy",
  strictTransportSecurity: "Strict-Transport-Security",
  xContentTypeOptions: "X-Content-Type-Options",
  xDNSPrefetchControl: "X-DNS-Prefetch-Control",
  xDownloadOptions: "X-Download-Options",
  xFrameOptions: "X-Frame-Options",
  xPermittedCrossDomainPolicies: "X-Permitted-Cross-Domain-Policies",
  xXSSProtection: "X-XSS-Protection",
  permissionsPolicy: "Permissions-Policy"
};
const NAMES_TO_KEYS = Object.fromEntries(Object.entries(KEYS_TO_NAMES).map(([key, name]) => [name, key]));
function getNameFromKey(key) {
  return KEYS_TO_NAMES[key];
}
function getKeyFromName(headerName) {
  const [, key] = Object.entries(NAMES_TO_KEYS).find(([name]) => name.toLowerCase() === headerName.toLowerCase()) || [];
  return key;
}
function headerStringFromObject(optionKey, optionValue) {
  if (optionValue === false) {
    return "";
  }
  if (optionKey === "contentSecurityPolicy") {
    const policies = optionValue;
    return Object.entries(policies).filter(([, value]) => value !== false).map(([directive, sources]) => {
      if (directive === "upgrade-insecure-requests") {
        return "upgrade-insecure-requests;";
      } else {
        const stringifiedSources = typeof sources === "string" ? sources : sources.map((source) => source.trim()).join(" ");
        return `${directive} ${stringifiedSources};`;
      }
    }).join(" ");
  } else if (optionKey === "strictTransportSecurity") {
    const policies = optionValue;
    return [
      `max-age=${policies.maxAge}`,
      policies.includeSubdomains && "includeSubDomains",
      policies.preload && "preload"
    ].filter(Boolean).join("; ");
  } else if (optionKey === "permissionsPolicy") {
    const policies = optionValue;
    return Object.entries(policies).filter(([, value]) => value !== false).map(([directive, sources]) => {
      if (typeof sources === "string") {
        return `${directive}=${sources}`;
      } else {
        return `${directive}=(${sources.join(" ")})`;
      }
    }).join(", ");
  } else {
    return optionValue;
  }
}
function headerObjectFromString(optionKey, headerValue) {
  if (!headerValue) {
    return false;
  }
  if (optionKey === "contentSecurityPolicy") {
    const directives = headerValue.split(";").map((directive) => directive.trim()).filter((directive) => directive);
    const objectForm = {};
    for (const directive of directives) {
      const [type, ...sources] = directive.split(" ").map((token) => token.trim());
      if (type === "upgrade-insecure-requests") {
        objectForm[type] = true;
      } else {
        objectForm[type] = sources.join(" ");
      }
    }
    return objectForm;
  } else if (optionKey === "strictTransportSecurity") {
    const directives = headerValue.split(";").map((directive) => directive.trim()).filter((directive) => directive);
    const objectForm = {};
    for (const directive of directives) {
      const [type, value] = directive.split("=").map((token) => token.trim());
      if (type === "max-age") {
        objectForm.maxAge = Number(value);
      } else if (type === "includeSubdomains" || type === "preload") {
        objectForm[type] = true;
      }
    }
    return objectForm;
  } else if (optionKey === "permissionsPolicy") {
    const directives = headerValue.split(",").map((directive) => directive.trim()).filter((directive) => directive);
    const objectForm = {};
    for (const directive of directives) {
      const [type, value] = directive.split("=").map((token) => token.trim());
      objectForm[type] = value;
    }
    return objectForm;
  } else {
    return headerValue;
  }
}
function standardToSecurity(standardHeaders) {
  if (!standardHeaders) {
    return void 0;
  }
  const standardHeadersAsObject = {};
  Object.entries(standardHeaders).forEach(([headerName, headerValue]) => {
    const optionKey = getKeyFromName(headerName);
    if (optionKey) {
      if (typeof headerValue === "string") {
        const objectValue = headerObjectFromString(optionKey, headerValue);
        standardHeadersAsObject[optionKey] = objectValue;
      } else {
        standardHeadersAsObject[optionKey] = headerValue;
      }
    }
  });
  if (Object.keys(standardHeadersAsObject).length === 0) {
    return void 0;
  }
  return standardHeadersAsObject;
}
function backwardsCompatibleSecurity(securityHeaders) {
  if (!securityHeaders) {
    return void 0;
  }
  const securityHeadersAsObject = {};
  Object.entries(securityHeaders).forEach(([key, value]) => {
    const optionKey = key;
    if ((optionKey === "contentSecurityPolicy" || optionKey === "permissionsPolicy" || optionKey === "strictTransportSecurity") && typeof value === "string") {
      const objectValue = headerObjectFromString(optionKey, value);
      securityHeadersAsObject[optionKey] = objectValue;
    } else if (value === "") {
      securityHeadersAsObject[optionKey] = false;
    } else {
      securityHeadersAsObject[optionKey] = value;
    }
  });
  return securityHeadersAsObject;
}

const _wzWqPj3EPaNsbZVXnKyhGZgzB2mxVAlCIMqlmdxogx8 = defineNitroPlugin(async (nitroApp) => {
  const appSecurityOptions = getAppSecurityOptions();
  const runtimeConfig = useRuntimeConfig();
  for (const route in runtimeConfig.nitro.routeRules) {
    const rule = runtimeConfig.nitro.routeRules[route];
    if (!rule) continue;
    const { headers: headers2 } = rule;
    const securityHeaders2 = standardToSecurity(headers2);
    if (securityHeaders2) {
      appSecurityOptions[route] = { headers: securityHeaders2 };
    }
  }
  const securityOptions = runtimeConfig.security;
  const { headers } = securityOptions;
  const securityHeaders = backwardsCompatibleSecurity(headers);
  appSecurityOptions["/**"] = defuReplaceArray(
    { headers: securityHeaders },
    securityOptions,
    appSecurityOptions["/**"]
  );
  for (const route in runtimeConfig.nitro.routeRules) {
    const rule = runtimeConfig.nitro.routeRules[route];
    if (!rule) continue;
    const { security } = rule;
    if (security) {
      const { headers: headers2 } = security;
      const securityHeaders2 = backwardsCompatibleSecurity(headers2);
      appSecurityOptions[route] = defuReplaceArray(
        { headers: securityHeaders2 },
        security,
        appSecurityOptions[route]
      );
    }
  }
  nitroApp.hooks.hook("nuxt-security:headers", ({ route, headers: headers2 }) => {
    appSecurityOptions[route] = defuReplaceArray(
      { headers: headers2 },
      appSecurityOptions[route]
    );
  });
  nitroApp.hooks.hook("nuxt-security:ready", async () => {
    await nitroApp.hooks.callHook("nuxt-security:routeRules", appSecurityOptions);
  });
  await nitroApp.hooks.callHook("nuxt-security:ready");
});

const sriHashes = {"/_nuxt/builds/meta/9f053eb2-9b56-40a7-b379-d3f6d9f610eb.json":"sha384-0qI7x4Pjqjj0AeE8dIhQUTfElUp/2IMx8Vl8X/cREdyAfHNwpbKCxtpUHFbt5p8w","/_nuxt/0Jl4k0Tq.js":"sha384-zzljnFLvBZL+qVquHpCnbZzITUmmNNlULcaL3fbfyD9etBqPh7aeoL3eFh3DTYV1","/_nuxt/3P5i3wGE.js":"sha384-emq5XvMYQddebFiPHKJRMBm7L+aHxwd6R2yMPMw9KB+IUk17jU77U3Gm3ADA9wN2","/_nuxt/5VOfrrK-.js":"sha384-K0Q25W416YBVhgcr6GF/bpGK5QzmjexsOwYL+pKWRj4ioiRGAjbmOIHD7+zXFJsX","/_nuxt/7OvyO8uw.js":"sha384-pY88tiizzYcXqR8HJJspDnW8zrUOD/5FZ4QXVI3UEboLK2QGvNCtZM26xqpCKUPp","/_nuxt/B8buFMx_.js":"sha384-FbH4/7jgSVegswKoqO9IuxYcAg1Ac6rNBzq6xmARwuOG32631tkXqLwH69b4riSs","/_nuxt/BHPKEiiR.js":"sha384-uW4lAI/VwvQd2YReEzQfNYsX2sdQahw0BfJ0q7o5DQ2Gk1/rOV9atIgJAlO9+Qy+","/_nuxt/BMBdF3Ep.js":"sha384-6tvloVcmjcvuBntAvqRiD0AUVLRWE97l0TybowkqHvR73ACTBEPmtLWklgstEgY8","/_nuxt/BOUu0zKy.js":"sha384-rM6ZdNUHhKiAkG8Tmni5vlmo3F8jUqjpQCVO9uDuFaiLod6eCWGH2edt1Z6GbtV7","/_nuxt/BebvaVSU.js":"sha384-lv0ocMYIJf4qbbIOzteUxUXKhXrl/B6yG6aT94ZEX2OS17lSVNPA7JyAU4qSymu7","/_nuxt/BmpCSaSO.js":"sha384-PJsTtxkZ7DEdF8H0pPcasSU89YRLedRQXCHbmujYonK7fNMLZCQcriMbrGueHsDu","/_nuxt/Bvh5HFZo.js":"sha384-1Xt6vXNV/zlLoxbLCJKTlKdlnwnnUNmVT6lk70a1TJS0O6LPQskZ6hb3lRTaAT1A","/_nuxt/C-zu9JwP.js":"sha384-KLZQGmTZ6Z7XRUxoZRR/dLLyPimBk/6DsTSgAu96/KqrIW6pRgNJ5Wa5g4BHNZ8B","/_nuxt/C7rlIOO8.js":"sha384-6iv/lo6+nA1icv0k4OrrtUDy8o1PExGoxYS10OLHDu5QG15sI4usdBxLXUk6Vr5k","/_nuxt/CBvxrV54.js":"sha384-HYOd0Q2senOE2aK/h1aWPYAQ3UDflYVcG2bDWWuj0vsIrvs0LqTHY+M3CsKu3D8A","/_nuxt/CI-ghjZS.js":"sha384-9/2gEsOen0pgsZA3CPunopMA/pggYzaXeWySFlQpypLOd3TTtJ6ISmVtlLGVaVaF","/_nuxt/Ckfo4Hvp.js":"sha384-ZcI/ZV8PXkf2NowZPhDDzR13dwy1wGcdedlt2jLlgLR4p20EezcYwNKuX2Fx1QEm","/_nuxt/CnKKIQyK.js":"sha384-Qa4gbk8PUGx79RBRglK5PO6Vh8TTNosSKQJWGT6J0OHj3R4rsI7Fp8MIiGtnfIhV","/_nuxt/ConditionalDetails.CF0FlNB4.css":"sha384-CMTcS+b7HrhYojQWgGIC6P5HYoFmxOA6gcXUVmXYgkJmMZluALVaWAAU4+5RDNU/","/_nuxt/CzKIqmcQ.js":"sha384-pN1NkytYZVXzs44bDRRXltu8V8d6RNvMxrN1g7jwYL+2yYTm97xrRhPeBGiMKw/+","/_nuxt/D0clN4Ej.js":"sha384-qbZUpwQackfPdhjcxEh7OyWa35aFX1il4xnvMnPj51/PQxIL4ZbcY8N8QR2Cr+Vj","/_nuxt/D2jksqcR.js":"sha384-nTyG9p6R99pWTlC71MSgsqi8jJuSpZDSYR6eGn0LV8wp7yJtl9EkFTfPJVoGhYuP","/_nuxt/DGZZ687E.js":"sha384-BoVBNWWsPlVoy3uMnhw6DEdo068rh4omeCx8LTsIlIH28uR8WkFuaVwQEdu/fTHZ","/_nuxt/DjgYIYWm.js":"sha384-DC0D8yxXclWi3pD1FHKHi8WrGglwZ1ovuIS49j8oTCFYth2/fVftckoE3ilyltq4","/_nuxt/Dv3G7nOz.js":"sha384-kdn5frTsx9s7iCcNDcEjzNFaQ7Z2Mm6wd5iTwY0m70w4i6o1tQFQHCHe45X/nSvL","/_nuxt/EditorSubmitDialog.Bf9OYAOA.css":"sha384-vcPF+cFTbjHNyyH44ZTh8+fMC2W321k1P/wKvHcyPZQ85gyMX8j2DCiDFlNt5WZh","/_nuxt/FixtureHeader.j65ulMYL.css":"sha384-gZ4bzjd0Ub1wTKRkC9jzDJE4H1dt9fG6CLYyULPMf3+t+ad9rvdEvLNjbIoBEewR","/_nuxt/HelpWantedMessage.BLPRoXw8.css":"sha384-T7nqwpS8QLrktGYso3QvmPJda6i3oNRNu43TgyB4smg8PjZO7ZwjFwJuD3c075a1","/_nuxt/KHZKbSie.js":"sha384-yb0xM2qV+Na1Brf+DZOtXoBByesDTNpwrNYWbHa29AxUnNqpT49ipBo9kzzgaMwk","/_nuxt/LabeledInput.CXxOnX6H.css":"sha384-W441OM7l2mN6kw390wA56f/dCMjeXP/C5RVC7rflbbH0IMYlDMmrrPKKE4Bn54MY","/_nuxt/Manufacturer.CahrkZQu.css":"sha384-rp8GxMlFEldGAhcWsarZ7GVtN7RQIkfeSd/uRCVlJsyXWNTfSbsWIEOfiZ7uUvdp","/_nuxt/NZN3Lq3x.js":"sha384-V1mOfaWWn2LYeFY+l66+3TGqZ/aIuM69e0IAjw0eQusa9ozRln3UmrfD1HjhGn8m","/_nuxt/_fixtureKey_.BwkUvQTz.css":"sha384-djXGQ4OlvV3XyucY9JRY86PNgnMWILQGwyOpvdSqWNfpZfmkel/IEHZKn4HoSmbz","/_nuxt/_plugin_.DTE6UF7x.css":"sha384-t3SW3ckeQ/4XnyihL0McrbUiJDSBp8dXyu7TLCl/TvsNo72zXVKeREW9TNbGBg+W","/_nuxt/default.QYO_WLod.css":"sha384-DzthIe6YIQzUids15G99cgmIDNdqdvgrHDWAqMNLR2SkLk0NB7ykPmCD6laYLfFZ","/_nuxt/entry.Dpba8gIp.css":"sha384-7MZ/GVlDL8nQZpeR78am3kbS1xYUNsYKWEvFEHOxY4m9SuuRNdUhIlu2dM4CTwOK","/_nuxt/f7Pdi7Nf.js":"sha384-kXogru2yHQIkZn0E8FXHDy/TeCDNtFFwnYQm5QPTVpFhxheHGv9Icb1lbBYM5vLV","/_nuxt/fixture-editor.BNL5ziCN.css":"sha384-xcf+1Gl+dPQLq5Inl+tUfdHgRqA45RmE7O6oJz/EgHDYr3XDVrKE69+s2Q4igsWV","/_nuxt/index.Cmcu8jDn.css":"sha384-GXBh9Xk6WzNfhNsBNVoWywzRm4IhGc4IkeckbrLNspz7sqtjm/ctTSWFKAH+W/9J","/_nuxt/index.DUhaXF7u.css":"sha384-z+wD5fK5zjxp0/9MwY2wKMhUyDbuOxzG1nhnz3VG3cdG9xbpPmpWHqiMhd6L3i9W","/_nuxt/manufacturers.Dk8ZM_92.css":"sha384-/5sB38jNlhC4fxRcI21VHx9gIc2aRo8tMFRx8yvXVafdFRp8lp7lCKFC4XLYw6ze","/_nuxt/njb4Ph7_.js":"sha384-dZAR2jB1Wby2T5DK1mtzRIKRK5XcuMwDNwSynTzvzOgMqWbmDSAPBif4B7SPlEnx","/_nuxt/search.BFGLDpp8.css":"sha384-C6mpRH2odBQ6Eb+S3B0CiTDXgU75H0QWoErpRTa3xzACl4K72Mq82NPQsIA/oTub","/_nuxt/yhuaJLdL.js":"sha384-uop+Mwu1e+YWqDlZSK7d7Rg8y5nJ/yb22U+y7wkd4+NXOgXmm60peZOZL7aJp9zj"};

const SCRIPT_RE$1 = /<script((?=[^>]+\bsrc="([^"]+)")(?![^>]+\bintegrity="[^"]+")[^>]+)(?:\/>|><\/script>)/g;
const LINK_RE$1 = /<link((?=[^>]+\brel="(?:stylesheet|preload|modulepreload)")(?=[^>]+\bhref="([^"]+)")(?![^>]+\bintegrity="[\w\-+/=]+")[^>]+)>/g;
const _obZeKRa5d1sd4DOmT7aWn49FrLat7W8JNdJGR1gM1c4 = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html, { event }) => {
    const rules = resolveSecurityRules(event);
    if (!rules.enabled || !rules.sri) {
      return;
    }
    const sections = ["body", "bodyAppend", "bodyPrepend", "head"];
    for (const section of sections) {
      html[section] = html[section].map((element) => {
        if (typeof element !== "string") {
          return element;
        }
        element = element.replace(SCRIPT_RE$1, (match, rest, src) => {
          const hash = sriHashes[src];
          if (hash) {
            const integrityScript = `<script integrity="${hash}"${rest}><\/script>`;
            return integrityScript;
          } else {
            return match;
          }
        });
        element = element.replace(LINK_RE$1, (match, rest, href) => {
          const hash = sriHashes[href];
          if (hash) {
            const integrityLink = `<link integrity="${hash}"${rest}>`;
            return integrityLink;
          } else {
            return match;
          }
        });
        return element;
      });
    }
  });
});

function generateRandomNonce() {
  const array = new Uint8Array(18);
  crypto.getRandomValues(array);
  const nonce = btoa(String.fromCharCode(...array));
  return nonce;
}

const _d_U2XXwO1rFSC_LgDPHUeExjK66LzIAjowAOnsco = defineNitroPlugin((nitroApp) => {
  {
    return;
  }
});

const LINK_RE = /<link\b([^>]*?>)/gi;
const NONCE_RE = /nonce="[^"]+"/i;
const SCRIPT_RE = /<script\b([^>]*?>)/gi;
const STYLE_RE = /<style\b([^>]*?>)/gi;
const QUOTE_MASK_RE = /"((?:[^"\\]|\\.)*)"/g;
const QUOTE_RESTORE_RE = /__QUOTE_PLACEHOLDER_(\d+)__/g;
function injectNonceToTags(element, nonce) {
  if (typeof element !== "string") {
    return element;
  }
  const quotes = [];
  let maskedElement = element.replace(QUOTE_MASK_RE, (match) => {
    quotes.push(match);
    return `__QUOTE_PLACEHOLDER_${quotes.length - 1}__`;
  });
  maskedElement = maskedElement.replace(LINK_RE, (match, rest) => {
    if (NONCE_RE.test(rest)) {
      return match.replace(NONCE_RE, `nonce="${nonce}"`);
    }
    return `<link nonce="${nonce}"` + rest;
  });
  maskedElement = maskedElement.replace(SCRIPT_RE, (match, rest) => {
    return `<script nonce="${nonce}"` + rest;
  });
  maskedElement = maskedElement.replace(STYLE_RE, (match, rest) => {
    return `<style nonce="${nonce}"` + rest;
  });
  const restoredHtml = maskedElement.replace(QUOTE_RESTORE_RE, (match, index) => {
    return quotes[parseInt(index, 10)];
  });
  return restoredHtml;
}
const _8pZu94aUvJrnC_YUbZAeLdhDSS74OwHPevY8a1cU3M = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    if (event.context.security?.nonce) {
      return;
    }
    const rules = resolveSecurityRules(event);
    if (rules.enabled && rules.nonce && true) {
      const nonce = generateRandomNonce();
      event.context.security.nonce = nonce;
    }
  });
  nitroApp.hooks.hook("render:html", (html, { event }) => {
    const rules = resolveSecurityRules(event);
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy || !rules.nonce) {
      return;
    }
    const nonce = event.context.security.nonce;
    const sections = ["body", "bodyAppend", "bodyPrepend", "head"];
    for (const section of sections) {
      html[section] = html[section].map((element) => injectNonceToTags(element, nonce));
    }
  });
});

const _5DZL8enQwR9iH_JwY2xwP2VoPQ8g5qEA2K6K17UHAsk = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (response, { event }) => {
    if (response.island) {
      return;
    }
    const rules = resolveSecurityRules(event);
    if (rules.enabled && rules.headers) {
      const headers = rules.headers;
      if (headers.contentSecurityPolicy) {
        const csp = headers.contentSecurityPolicy;
        const nonce = event.context.security?.nonce;
        const scriptHashes = event.context.security?.hashes?.script;
        const styleHashes = event.context.security?.hashes?.style;
        headers.contentSecurityPolicy = updateCspVariables(csp, nonce, scriptHashes, styleHashes);
      }
    }
  });
});
function updateCspVariables(csp, nonce, scriptHashes, styleHashes) {
  const generatedCsp = Object.fromEntries(Object.entries(csp).map(([directive, value]) => {
    if (typeof value === "boolean") {
      return [directive, value];
    }
    const sources = typeof value === "string" ? value.split(" ").map((token) => token.trim()).filter((token) => token) : value;
    const modifiedSources = sources.filter((source) => {
      if (source.startsWith("'nonce-") && source !== "'nonce-{{nonce}}'") {
        console.warn("[nuxt-security] removing static nonce from CSP header");
        return false;
      }
      return true;
    }).map((source) => {
      if (source === "'nonce-{{nonce}}'") {
        return nonce ? `'nonce-${nonce}'` : "";
      } else {
        return source;
      }
    }).filter((source) => source);
    if (["script-src", "script-src-elem"].includes(directive) && scriptHashes) {
      modifiedSources.push(...scriptHashes);
    }
    if (["style-src", "style-src-elem"].includes(directive) && styleHashes) {
      modifiedSources.push(...styleHashes);
    }
    return [directive, modifiedSources];
  }));
  return generatedCsp;
}

const _5ZRrR2a6qsqpWSg1JxbNb59mbEeKfBrHWVlvlaPuGDE = defineNitroPlugin((nitroApp) => {
  {
    return;
  }
});

const _5tYkZufktEAE1WzY3w62Mp6gFyughdZ3Z_Q4lVitRfg = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const rules = resolveSecurityRules(event);
    if (rules.enabled && rules.headers) {
      const headers = rules.headers;
      Object.entries(headers).forEach(([header, value]) => {
        const headerName = getNameFromKey(header);
        if (value === false) {
          const { headers: standardHeaders } = getRouteRules(event);
          const standardHeaderValue = standardHeaders?.[headerName];
          const currentHeaderValue = getResponseHeader(event, headerName);
          if (standardHeaderValue === currentHeaderValue) {
            removeResponseHeader(event, headerName);
          }
        } else {
          const headerValue = headerStringFromObject(header, value);
          setResponseHeader(event, headerName, headerValue);
        }
      });
    }
  });
});

const __nJ0iQ3TGxEE7Uf1W9pZHe2Be7F6VASwJeIhMXveo7g = defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    const rules = resolveSecurityRules(event);
    if (rules.enabled && rules.hidePoweredBy && !event.node.res.headersSent) {
      removeResponseHeader(event, "x-powered-by");
    }
  });
});

const _9dFXfmzVBAPmvodQSA8LvpjQ3QxY3LM0HwLml3goE = defineNitroPlugin(async (nitroApp) => {
  {
    const prerenderedHeaders = await useStorage("assets:nuxt-security").getItem("headers.json") || {};
    nitroApp.hooks.hook("beforeResponse", (event) => {
      const rules = resolveSecurityRules(event);
      if (rules.enabled && rules.ssg && rules.ssg.nitroHeaders) {
        const path = event.path.split("?")[0];
        if (path && prerenderedHeaders[path]) {
          setResponseHeaders(event, prerenderedHeaders[path]);
        }
      }
    });
  }
});

const plugins$1 = [
  _ULFRGF1_WEj5w0_Q4MBWcVc6bHN0wBDKH_qXv1tZCM,
_x_X86JoVe8VqFcanK9vyKrNMDvKiRNVxGG_W4IO8MfE,
_wzWqPj3EPaNsbZVXnKyhGZgzB2mxVAlCIMqlmdxogx8,
_obZeKRa5d1sd4DOmT7aWn49FrLat7W8JNdJGR1gM1c4,
_d_U2XXwO1rFSC_LgDPHUeExjK66LzIAjowAOnsco,
_8pZu94aUvJrnC_YUbZAeLdhDSS74OwHPevY8a1cU3M,
_5DZL8enQwR9iH_JwY2xwP2VoPQ8g5qEA2K6K17UHAsk,
_5ZRrR2a6qsqpWSg1JxbNb59mbEeKfBrHWVlvlaPuGDE,
_5tYkZufktEAE1WzY3w62Mp6gFyughdZ3Z_Q4lVitRfg,
__nJ0iQ3TGxEE7Uf1W9pZHe2Be7F6VASwJeIhMXveo7g,
_9dFXfmzVBAPmvodQSA8LvpjQ3QxY3LM0HwLml3goE
];

const assets = {
  "/_nuxt/0Jl4k0Tq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ab-VeCiEJMIYq4SUqwIusdl/6A41Ds\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 5291,
    "path": "../public/_nuxt/0Jl4k0Tq.js"
  },
  "/_nuxt/3P5i3wGE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bc1-E0r/WjPbo7bQqTW+1SM93rgCoPQ\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 7105,
    "path": "../public/_nuxt/3P5i3wGE.js"
  },
  "/_nuxt/5VOfrrK-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f616-aaL5DlB93wqTNvwsQJ/mXlUYWOI\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 128534,
    "path": "../public/_nuxt/5VOfrrK-.js"
  },
  "/_nuxt/7OvyO8uw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"386-wTK6MIhdhBJAwEomkmUuqX6zTXw\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 902,
    "path": "../public/_nuxt/7OvyO8uw.js"
  },
  "/_nuxt/B8buFMx_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1678-rFOu1Dk8j8l6ZUlRiO1hxRsiHKc\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 5752,
    "path": "../public/_nuxt/B8buFMx_.js"
  },
  "/_nuxt/BHPKEiiR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"41664-DpSg/gLQgdriNxQJjZ8X7MDZ75Q\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 267876,
    "path": "../public/_nuxt/BHPKEiiR.js"
  },
  "/_nuxt/BMBdF3Ep.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13f1-M1exZT6FQfd9OOkXpB29dMUJ6H0\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 5105,
    "path": "../public/_nuxt/BMBdF3Ep.js"
  },
  "/_nuxt/BOUu0zKy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"146f-31gRf9NWjVXs6xV3zzG28XEsaA4\"",
    "mtime": "2026-03-06T11:23:44.759Z",
    "size": 5231,
    "path": "../public/_nuxt/BOUu0zKy.js"
  },
  "/_nuxt/BebvaVSU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3de2-bp77PUT1Rfn54C7dtFFVd14rrgo\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 15842,
    "path": "../public/_nuxt/BebvaVSU.js"
  },
  "/_nuxt/C-zu9JwP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"108d-QlENuxDHudkChQ0+NlMtjsOZ59A\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 4237,
    "path": "../public/_nuxt/C-zu9JwP.js"
  },
  "/_nuxt/BmpCSaSO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"94a-XG3vdxftD7HRjqKgVLz4Vi6rdvg\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 2378,
    "path": "../public/_nuxt/BmpCSaSO.js"
  },
  "/_nuxt/Bvh5HFZo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75-SOgY6DAXwHlAO13tzZPv9xRxDM0\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 117,
    "path": "../public/_nuxt/Bvh5HFZo.js"
  },
  "/_nuxt/C7rlIOO8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eac-ODtZ4r3rSFdY1uTuk9z5lVTdo1o\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 7852,
    "path": "../public/_nuxt/C7rlIOO8.js"
  },
  "/_nuxt/CI-ghjZS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12ce-rs7VDUST4rlORH27403hMbK5wu8\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 4814,
    "path": "../public/_nuxt/CI-ghjZS.js"
  },
  "/_nuxt/CBvxrV54.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f51-voGmP5lm2gwLxHabV9Q767XNXzE\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 3921,
    "path": "../public/_nuxt/CBvxrV54.js"
  },
  "/_nuxt/Ckfo4Hvp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"127d-dfvUBMEbSgJYNm/B7lzPJh6Um1A\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 4733,
    "path": "../public/_nuxt/Ckfo4Hvp.js"
  },
  "/_nuxt/CnKKIQyK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b6-v0QBPRFhifTG5RaSomQEMxczHvI\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 438,
    "path": "../public/_nuxt/CnKKIQyK.js"
  },
  "/_nuxt/ConditionalDetails.CF0FlNB4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"399-FtF4f3B0Ut0AhRhObd5EEWa8pKA\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 921,
    "path": "../public/_nuxt/ConditionalDetails.CF0FlNB4.css"
  },
  "/_nuxt/CzKIqmcQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6ac-QPwAPz0sMw7eZA2absLEiY93gCI\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 1708,
    "path": "../public/_nuxt/CzKIqmcQ.js"
  },
  "/_nuxt/D0clN4Ej.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"730-HNTmsXx82xTu1KiLI4Sypb27uL8\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 1840,
    "path": "../public/_nuxt/D0clN4Ej.js"
  },
  "/_nuxt/D2jksqcR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f62-WO2AinVOj/wscDjLe7Ig4wWxg+M\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 3938,
    "path": "../public/_nuxt/D2jksqcR.js"
  },
  "/_nuxt/DjgYIYWm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16bd-eeArZ6Rv2IMFHzVTCYtTfJqLB1E\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 5821,
    "path": "../public/_nuxt/DjgYIYWm.js"
  },
  "/_nuxt/DGZZ687E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"139-s4y33MAOG2VJCoCzYGbfSbTPVrk\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 313,
    "path": "../public/_nuxt/DGZZ687E.js"
  },
  "/_nuxt/Dv3G7nOz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6c-IJccG/hGVAQNpDT9OSp5NE0ZWHs\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 2924,
    "path": "../public/_nuxt/Dv3G7nOz.js"
  },
  "/_nuxt/EditorSubmitDialog.Bf9OYAOA.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2a0-Ck4AE65gQkioflQt8+81qr9v91w\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 672,
    "path": "../public/_nuxt/EditorSubmitDialog.Bf9OYAOA.css"
  },
  "/_nuxt/HelpWantedMessage.BLPRoXw8.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"789-cwzj61hB4ktvQXQPdTeECA0gSQE\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 1929,
    "path": "../public/_nuxt/HelpWantedMessage.BLPRoXw8.css"
  },
  "/_nuxt/FixtureHeader.j65ulMYL.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"dec-+QJh+D9ZG3UEXicwq3oqf7NsFTY\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 3564,
    "path": "../public/_nuxt/FixtureHeader.j65ulMYL.css"
  },
  "/_nuxt/LabeledInput.CXxOnX6H.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"15b-+0jxzSiyBqh+LmMQAZlgV1aeLlE\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 347,
    "path": "../public/_nuxt/LabeledInput.CXxOnX6H.css"
  },
  "/_nuxt/KHZKbSie.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24f5d-4JYh0UgSYEF7WUws5Da9J+XV9Lo\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 151389,
    "path": "../public/_nuxt/KHZKbSie.js"
  },
  "/_nuxt/Manufacturer.CahrkZQu.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"16a4-VNkI44rZfeYosQgGUpmJJ9NnsYE\"",
    "mtime": "2026-03-06T11:23:44.760Z",
    "size": 5796,
    "path": "../public/_nuxt/Manufacturer.CahrkZQu.css"
  },
  "/_nuxt/_fixtureKey_.BwkUvQTz.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d0-QA5YeJP0wEXKJz9Q+iKNE9gP5jk\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 208,
    "path": "../public/_nuxt/_fixtureKey_.BwkUvQTz.css"
  },
  "/_nuxt/_plugin_.DTE6UF7x.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5ae-uCEAH47fZQ8Pxeom/OBVjQzMR+k\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 1454,
    "path": "../public/_nuxt/_plugin_.DTE6UF7x.css"
  },
  "/_nuxt/NZN3Lq3x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"55e17-ZHPXIOOVh+bp8ZNrP+Hiekp2X2A\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 351767,
    "path": "../public/_nuxt/NZN3Lq3x.js"
  },
  "/_nuxt/default.QYO_WLod.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"14c0-IWcYiic0RTTtj47F+JTtAgwlVV8\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 5312,
    "path": "../public/_nuxt/default.QYO_WLod.css"
  },
  "/_nuxt/entry.Dpba8gIp.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4691-gOs8p56yhw8t08Ox/6HIB0C81G8\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 18065,
    "path": "../public/_nuxt/entry.Dpba8gIp.css"
  },
  "/_nuxt/f7Pdi7Nf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"176c-8NdhP6up28+Id5mGKJPaOL3yFr0\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 5996,
    "path": "../public/_nuxt/f7Pdi7Nf.js"
  },
  "/_nuxt/fixture-editor.BNL5ziCN.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"168d-oIeQuD8X05RC8yeOxSl0Ny1CX3Y\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 5773,
    "path": "../public/_nuxt/fixture-editor.BNL5ziCN.css"
  },
  "/_nuxt/index.Cmcu8jDn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"66-CcsuKCpp4wj9ffwEx754byJTvUo\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 102,
    "path": "../public/_nuxt/index.Cmcu8jDn.css"
  },
  "/_nuxt/index.DUhaXF7u.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"cd-yNxOsRHgEQBz9hff2X5MyGVGe7M\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 205,
    "path": "../public/_nuxt/index.DUhaXF7u.css"
  },
  "/_nuxt/search.BFGLDpp8.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"9c-gKg00VwzhtLfkqAY5TBMgX+JINU\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 156,
    "path": "../public/_nuxt/search.BFGLDpp8.css"
  },
  "/_nuxt/manufacturers.Dk8ZM_92.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"8a-K8TGaZaJLhUYqnNTuOVT46EB92E\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 138,
    "path": "../public/_nuxt/manufacturers.Dk8ZM_92.css"
  },
  "/_nuxt/yhuaJLdL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b6-GM39kglIDt34I0orQFddQuPOODI\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 6326,
    "path": "../public/_nuxt/yhuaJLdL.js"
  },
  "/_nuxt/njb4Ph7_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1531-jEY6Gz5hfkzELSmZRyT6csnNgOo\"",
    "mtime": "2026-03-06T11:23:44.761Z",
    "size": 5425,
    "path": "../public/_nuxt/njb4Ph7_.js"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-XmUrpfJiI7Svk3A4RbgNGO5oA0g\"",
    "mtime": "2026-03-06T11:23:44.744Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/9f053eb2-9b56-40a7-b379-d3f6d9f610eb.json": {
    "type": "application/json",
    "etag": "\"58-0qdM36nY1qc2wjF7p17PIYFNq8U\"",
    "mtime": "2026-03-06T11:23:44.739Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/9f053eb2-9b56-40a7-b379-d3f6d9f610eb.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$1 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath('file:// virtual:#nitro-internal-virtual/public-assets-node'));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _J1QwQi = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const getDetailsPerAjvKeyword = {
  propertyNames(error, allErrors) {
    let errorMessage = `property name '${error.params.propertyName}' is invalid`;
    const relatedError = allErrors.find(
      (otherError) => otherError.propertyName === error.params.propertyName
    );
    if (relatedError) {
      errorMessage += ` (${relatedError.message})`;
    }
    return errorMessage;
  },
  additionalProperties(error) {
    return `${error.message} (${error.params.additionalProperty})`;
  },
  enum(error) {
    const allowedValues = error.params.allowedValues.join(", ");
    return `must be equal to one of [${allowedValues}]`;
  },
  oneOf(error) {
    if (error.params.passingSchemas) {
      const passingSchemas = error.params.passingSchemas.map((index) => error.schema[index]);
      const allAreOnlyRequired = passingSchemas.every(
        (schema) => Object.keys(schema).length === 1 && "required" in schema
      );
      if (allAreOnlyRequired) {
        const properties = passingSchemas.map((schema) => schema.required.join("+")).join(" / ");
        return `must not have a combination of the properties ${properties}`;
      }
    }
    return error.message;
  },
  const(error) {
    return `${error.message} "${getShortenedString(error.params.allowedValue)}"`;
  }
};
function getAjvErrorMessages(ajvErrors, rootName = "root") {
  const errors = ajvErrors.filter((error) => {
    if ("propertyName" in error) {
      return false;
    }
    const isUselessError = error.keyword === "if" && error.schema === true;
    return !isUselessError;
  });
  return errors.map((error) => {
    const getDetails = getDetailsPerAjvKeyword[error.keyword] || (() => error.message);
    const details = getDetails(error, ajvErrors);
    const errorMessage = `${rootName}${error.instancePath}${getDataDescription(error.data)} ${details}`;
    return errorMessage.replaceAll("\n", String.raw`\n`);
  });
}
function getDataDescription(data) {
  if (typeof data === "string") {
    return ` "${getShortenedString(data)}"`;
  }
  if (typeof data === "number" || typeof data === "boolean" || data === null) {
    return ` ${data}`;
  }
  if (typeof data === "object" && "type" in data) {
    return ` (type: ${data.type})`;
  }
  return "";
}
function getShortenedString(string) {
  const maxLength = 30;
  return string.length > maxLength ? `${string.slice(0, maxLength - 1)}\u2026` : string;
}

function sendJson(response, jsonObject) {
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(jsonObject));
}
function sendAttachment(response, { name, mimetype, content }) {
  response.setHeader("Content-Type", mimetype);
  response.setHeader("Content-Disposition", `attachment; filename="${name}"`);
  response.end(content);
}

async function importJson(jsonPath, basePath) {
  if (typeof basePath === "string" && !basePath.startsWith("file:")) {
    jsonPath = path$1.resolve(basePath, jsonPath);
  } else if (basePath) {
    jsonPath = new URL(jsonPath, basePath);
  }
  const buffer = await readFile$1(jsonPath);
  return JSON.parse(buffer);
}

let register$1;
let manufacturers;
async function getSearchResults({ request }) {
  const { searchQuery, manufacturersQuery, categoriesQuery } = request.requestBody;
  register$1 = await importJson("../../../fixtures/register.json", globalThis._importMeta_.url);
  manufacturers = await importJson("../../../fixtures/manufacturers.json", globalThis._importMeta_.url);
  const results = Object.keys(register$1.filesystem).filter(
    (key) => queryMatch(searchQuery, key) && manufacturerMatch(manufacturersQuery, key) && categoryMatch(categoriesQuery, key)
  );
  return {
    body: results
  };
}
function queryMatch(searchQuery, fixtureKey) {
  const manufacturer = fixtureKey.split("/")[0];
  const fixtureData = register$1.filesystem[fixtureKey];
  return fixtureKey.includes(searchQuery.toLowerCase()) || `${manufacturers[manufacturer].name} ${fixtureData.name}`.toLowerCase().includes(searchQuery.toLowerCase());
}
function manufacturerMatch(manufacturersQuery, fixtureKey) {
  const manufacturer = fixtureKey.split("/")[0];
  return manufacturersQuery.length === 0 || manufacturersQuery.length === 1 && manufacturersQuery[0] === "" || manufacturersQuery.includes(manufacturer);
}
function categoryMatch(categoriesQuery, fixtureKey) {
  return categoriesQuery.length === 0 || categoriesQuery.length === 1 && categoriesQuery[0] === "" || categoriesQuery.some(
    (category) => {
      var _a;
      return (_a = register$1.categories[category]) == null ? void 0 : _a.includes(fixtureKey);
    }
  );
}

async function createIssue(title, body, labels = []) {
  const repository = "open-fixture-library" ;
  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === void 0) {
    console.error(".env file does not contain GITHUB_USER_TOKEN variable");
    throw new Error("GitHub user token was not set");
  }
  const githubClient = new Octokit({
    auth: `token ${userToken}`
  });
  const result = await githubClient.rest.issues.create({
    owner: "OpenLightingProject",
    repo: repository,
    title,
    body,
    labels
  });
  return result.data.html_url;
}

function cacheResult(classInstance, propertyName, value) {
  Object.defineProperty(classInstance, propertyName, {
    value,
    writable: false,
    configurable: false,
    enumerable: false
  });
  return value;
}

function scaleDmxValue(dmxValue, currentResolution, desiredResolution) {
  const bytes = getBytes(dmxValue, currentResolution);
  while (currentResolution < desiredResolution) {
    bytes.push(bytes[currentResolution - 1]);
    currentResolution++;
  }
  while (currentResolution > desiredResolution) {
    bytes.length--;
    currentResolution--;
  }
  return bytesToDmxValue(bytes);
}
function scaleDmxRange(dmxRangeStart, dmxRangeEnd, currentResolution, desiredResolution) {
  return scaleDmxRangeIndividually(dmxRangeStart, currentResolution, dmxRangeEnd, currentResolution, desiredResolution);
}
function scaleDmxRangeIndividually(dmxRangeStart, startResolution, dmxRangeEnd, endResolution, desiredResolution) {
  let startBytes = getBytes(dmxRangeStart, startResolution);
  const endBytes = getBytes(dmxRangeEnd, endResolution);
  while (endResolution < desiredResolution) {
    endBytes.push(255);
    endResolution++;
  }
  while (startResolution < desiredResolution) {
    startBytes.push(0);
    startResolution++;
  }
  while (endResolution > desiredResolution) {
    endBytes.length--;
    endResolution--;
  }
  while (startResolution > desiredResolution) {
    const deletedStartByte = startBytes[startResolution - 1];
    startBytes.length--;
    startResolution--;
    if (deletedStartByte > 0 && bytesToDmxValue(startBytes) < bytesToDmxValue(endBytes)) {
      startBytes = getBytes(bytesToDmxValue(startBytes) + 1, startResolution);
    }
  }
  return [bytesToDmxValue(startBytes), bytesToDmxValue(endBytes)];
}
function bytesToDmxValue(bytes) {
  let dmxValue = 0;
  for (const [index, byte] of bytes.entries()) {
    dmxValue += byte * Math.pow(256, bytes.length - index - 1);
  }
  return dmxValue;
}
function getBytes(dmxValue, resolution) {
  const bytes = [];
  while (resolution > 0) {
    const byte = dmxValue % 256;
    bytes.push(byte);
    dmxValue = (dmxValue - byte) / 256;
    resolution--;
  }
  if (dmxValue > 0) {
    throw new Error("Given DMX value was outside the given resolution");
  }
  bytes.reverse();
  return bytes;
}

class AbstractChannel {
  /**
   * Create a new AbstractChannel instance. Call this from child classes as `super(key)`.
   * @param {string} key The channel's identifier, must be unique in the fixture.
   * @throws {TypeError} If the AbstractChannel is instantiated directly.
   */
  constructor(key) {
    if (this.constructor === AbstractChannel) {
      throw new TypeError("Cannot instantiate AbstractChannel directly");
    }
    this._key = key;
    this._pixelKey = null;
  }
  /**
   * @abstract
   * @returns {Fixture} The fixture instance this channel is associated to.
   * @throws {TypeError} If this property is not overridden in child classes.
   */
  get fixture() {
    throw new TypeError(`Class ${this.constructor.name} must implement property fixture`);
  }
  /**
   * @returns {string} The channel key.
   */
  get key() {
    return this._key;
  }
  /**
   * Override this method for more sensible implementation.
   * @returns {string} The channel key (as name).
   */
  get name() {
    return this._key;
  }
  /**
   * @see {@link Fixture#uniqueChannelNames}
   * @returns {string} Unique version of this channel's name.
   */
  get uniqueName() {
    return this.fixture.uniqueChannelNames[this.key];
  }
  /**
   * @returns {string | null} The key of the pixel (group) that this channel is associated to. Defaults to null.
   */
  get pixelKey() {
    return this._pixelKey;
  }
  /**
   * @param {string | null} pixelKey The key of the pixel (group) that this channel is associated to. Set to null to dereference a channel from a pixel (group).
   */
  set pixelKey(pixelKey) {
    this._pixelKey = pixelKey;
  }
}

const KEYWORDS = {
  "fast reverse": -100,
  "slow reverse": -1,
  "stop": 0,
  "slow": 1,
  "fast": 100,
  "fast CCW": -100,
  "slow CCW": -1,
  "slow CW": 1,
  "fast CW": 100,
  "instant": 0,
  "short": 1,
  "long": 100,
  "near": 1,
  "far": 100,
  "off": 0,
  "dark": 1,
  "bright": 100,
  "warm": -100,
  "CTO": -100,
  "default": 0,
  "cold": 100,
  "CTB": 100,
  "weak": 1,
  "strong": 100,
  "left": -100,
  "top": -100,
  "center": 0,
  "right": 100,
  "bottom": 100,
  "closed": 0,
  "narrow": 1,
  "wide": 100,
  "low": 1,
  "high": 100,
  "out": 0,
  "in": 100,
  "open": 100,
  "small": 1,
  "big": 100
};
const unitConversions = {
  ms: {
    baseUnit: "s",
    factor: 1 / 1e3
  },
  bpm: {
    baseUnit: "Hz",
    factor: 1 / 60
  },
  rpm: {
    baseUnit: "Hz",
    factor: 1 / 60
  }
};
class Entity {
  /**
   * Creates a new Entity instance.
   * @param {number} number The numerical value.
   * @param {string} unit The unit symbol, e.g. 'Hz'. Must be the same as in the schema.
   * @param {string | null} keyword The keyword if defined using a keyword. Optional.
   */
  constructor(number, unit, keyword = null) {
    this._number = number;
    this._unit = unit;
    this._keyword = keyword;
  }
  /**
   * @returns {number} The numerical value of this entity.
   */
  get number() {
    return this._number;
  }
  /**
   * @returns {string} The unit symbol, like "Hz" or "%".
   */
  get unit() {
    return this._unit;
  }
  /**
   * @returns {string | null} The used keyword, or null if no keyword was used.
   */
  get keyword() {
    return this._keyword || null;
  }
  /**
   * @returns {Entity} An entity of the same value, but scaled to the base unit. Returns the entity itself if it is already in the base unit.
   */
  get baseUnitEntity() {
    if (Object.keys(unitConversions).includes(this.unit)) {
      const { baseUnit, factor } = unitConversions[this.unit];
      return cacheResult(this, "baseUnitEntity", new Entity(this.number * factor, baseUnit, this.keyword));
    }
    return cacheResult(this, "baseUnitEntity", this);
  }
  /**
   * Used to allow comparing like `entity1 < entity2`
   * @returns {number} The numerical value of this entity.
   */
  valueOf() {
    return this.number;
  }
  /**
   * @returns {string} The entity string that could be used in the fixture's JSON data.
   */
  toString() {
    return this.keyword || `${this.number}${this.unit}`;
  }
  /**
   * @param {Entity} anotherEntity Another Entity instance to compare with.
   * @returns {boolean} Whether this entity exactly equals the given one.
   */
  equals(anotherEntity) {
    return this.number === anotherEntity.number && this.unit === anotherEntity.unit && this.keyword === anotherEntity.keyword;
  }
  /**
   * @param {string} entityString The string for a single entity value from the JSON data. May also be a keyword.
   * @returns {Entity} A new entity from the given string.
   * @throws {Error} If the entity string is invalid.
   */
  static createFromEntityString(entityString) {
    if (entityString in KEYWORDS) {
      return new Entity(KEYWORDS[entityString], "%", entityString);
    }
    try {
      const [, numberString, unitString] = /^([\d.-]+)(.*)$/.exec(entityString);
      return new Entity(Number.parseFloat(numberString), unitString);
    } catch {
      throw new Error(`'${entityString}' is not a valid entity string.`);
    }
  }
}

class Range {
  /**
   * Creates a new Range instance.
   * @param {number[]} rangeArray Array of start and end value. Start value may not be greater than end value.
   */
  constructor(rangeArray) {
    this._rangeArray = rangeArray;
  }
  /**
   * @returns {number} The start number of the range. Lower or equal to end.
   */
  get start() {
    return this._rangeArray[0];
  }
  /**
   * @returns {number} The end number of the range. Higher or equal to start.
   */
  get end() {
    return this._rangeArray[1];
  }
  /**
   * @returns {number} The arithmetic mean of start and end value. Can be a fraction.
   */
  get center() {
    return Math.floor((this.start + this.end) / 2);
  }
  /**
   * @param {number} value The number to check whether it's in the range.
   * @returns {boolean} Whether the given number is inside this range, i.e. if it's not lower than the start value and not higher than the end value.
   */
  contains(value) {
    return this.start <= value && value <= this.end;
  }
  /**
   * @param {Range} range Another Range object.
   * @returns {boolean} Whether this range overlaps with the given one.
   */
  overlapsWith(range) {
    return range.end > this.start && range.start < this.end;
  }
  /**
   * @param {Range[]} ranges An array of Range objects.
   * @returns {boolean} Whether this range overlaps with any of the given ones.
   */
  overlapsWithOneOf(ranges) {
    return ranges.some((range) => this.overlapsWith(range));
  }
  /**
   * @param {Range} range Another Range object.
   * @returns {boolean} Whether this range is exactly next to the given one, i.e. the lower range's end value is by 1 lower than the higher range's start value.
   */
  isAdjacentTo(range) {
    return range.end + 1 === this.start || this.end + 1 === range.start;
  }
  /**
   * @param {Range} range Another range to merge with.
   * @returns {Range} A new range that covers both the initial and the other range.
   */
  getRangeMergedWith(range) {
    return new Range([Math.min(this.start, range.start), Math.max(this.end, range.end)]);
  }
  /**
   * @returns {string} Textual representation of this range.
   */
  toString() {
    return this.start === this.end ? this.start.toString() : `${this.start}\u2026${this.end}`;
  }
  /**
   * Merge specified Range objects. Asserts that ranges don't overlap and that all ranges are valid (start<=end).
   * @param {Range[]} ranges Range objects to merge into as few ranges as possible.
   * @returns {Range[]} Merged ranges.
   */
  static getMergedRanges(ranges) {
    const mergedRanges = ranges.map((range) => new Range([range.start, range.end]));
    for (let index = 0; index < mergedRanges.length; index++) {
      const range = mergedRanges[index];
      const mergableRangeIndex = mergedRanges.findIndex((otherRange) => otherRange.isAdjacentTo(range));
      if (mergableRangeIndex !== -1) {
        mergedRanges[index] = mergedRanges[mergableRangeIndex].getRangeMergedWith(range);
        mergedRanges.splice(mergableRangeIndex, 1);
        index--;
      }
    }
    return mergedRanges;
  }
}

const START_END_ENTITIES = ["speed", "duration", "time", "brightness", "slotNumber", "angle", "horizontalAngle", "verticalAngle", "colorTemperature", "soundSensitivity", "shakeAngle", "shakeSpeed", "distance", "openPercent", "frostIntensity", "insertion", "fogOutput", "parameter"];
const namePerType$1 = {
  NoFunction: (capability) => capability.comment || "No function",
  ShutterStrobe: (capability) => {
    let name = {
      Open: "Shutter open",
      Closed: "Shutter closed",
      Strobe: "Strobe",
      Pulse: "Pulse strobe",
      RampUp: "Ramp up strobe",
      RampDown: "Ramp down strobe",
      RampUpDown: "Ramp up and down strobe",
      Lightning: "Lightning strobe effect",
      Spikes: "Spikes strobe effect",
      Burst: "Burst strobe effect"
    }[capability.shutterEffect];
    if (capability.randomTiming) {
      name = `Random ${name.toLowerCase()}`;
    }
    if (capability.isSoundControlled) {
      name += " sound-controlled";
    }
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    if (capability.duration) {
      name += " ";
      name += startEndToString(capability.duration, "duration");
    }
    return appendInBrackets(name, capability.comment);
  },
  StrobeSpeed: (capability) => getSimpleCapabilityName(capability, "Strobe speed", "speed"),
  StrobeDuration: (capability) => getSimpleCapabilityName(capability, "Strobe duration", "duration"),
  Intensity: (capability) => getSimpleCapabilityName(capability, "Intensity", "brightness"),
  ColorIntensity: (capability) => getSimpleCapabilityName(capability, capability.color, "brightness"),
  ColorPreset: (capability) => {
    const name = capability.comment || "Color preset";
    if (capability.colorTemperature) {
      return appendInBrackets(name, colorTemperaturesToString(capability.colorTemperature));
    }
    return name;
  },
  ColorTemperature: (capability) => getSimpleCapabilityName(capability, "Color temperature", "colorTemperature"),
  Pan: (capability) => getSimpleCapabilityName(capability, "Pan", "angle", "angle", true),
  PanContinuous: (capability) => getSimpleCapabilityName(capability, "Pan", "speed", "speed", true),
  Tilt: (capability) => getSimpleCapabilityName(capability, "Tilt", "angle", "angle", true),
  TiltContinuous: (capability) => getSimpleCapabilityName(capability, "Tilt", "speed", "speed", true),
  PanTiltSpeed: (capability) => {
    const speedOrDuration = capability.speed === null ? "duration" : "speed";
    let name = "Pan/tilt movement ";
    if (capability[speedOrDuration][0].keyword === null && capability[speedOrDuration][0].unit === "%") {
      name += `${speedOrDuration} `;
    }
    name += startEndToString(capability[speedOrDuration]);
    return appendInBrackets(name, capability.comment);
  },
  WheelSlot: (capability) => appendInBrackets(getSlotCapabilityName(capability), capability.comment),
  WheelShake: (capability) => {
    let name = capability.slotNumber ? getSlotCapabilityName(capability) : capability.wheels.map((wheel) => wheel.name).join(", ");
    if (capability.isShaking === "slot") {
      name += " slot";
    }
    name += " shake";
    if (capability.shakeAngle) {
      name += " ";
      name += startEndToString(capability.shakeAngle, "angle", true);
    }
    if (capability.shakeSpeed) {
      name += " ";
      name += startEndToString(capability.shakeSpeed, "speed", true);
    }
    return appendInBrackets(name, capability.comment);
  },
  WheelSlotRotation: (capability) => {
    let wheelSlotName;
    if (capability.wheelSlot) {
      wheelSlotName = capability.wheelSlot[0].name;
    } else if (capability.wheels[0]) {
      wheelSlotName = capability.wheels[0].type.replace(/^Gobo$/, "Gobo stencil");
    } else {
      wheelSlotName = "Wheel slot";
    }
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, `${wheelSlotName} rotation`, speedOrAngle, speedOrAngle, true);
  },
  WheelRotation: (capability) => {
    const wheelName = capability.wheels[0] ? capability.wheels[0].name : "Wheel";
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, `${wheelName} rotation`, speedOrAngle, speedOrAngle, true);
  },
  Effect: (capability) => {
    let name = capability.effectName;
    if (capability.effectPreset !== null && capability.isSoundControlled) {
      name += " sound-controlled";
    }
    if (capability.parameter) {
      name += " ";
      name += startEndToString(capability.parameter);
    }
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    if (capability.duration) {
      name += " ";
      name += startEndToString(capability.duration, "duration");
    }
    let soundSensitivity = null;
    if (capability.soundSensitivity) {
      soundSensitivity = `sound sensitivity ${startEndToString(capability.soundSensitivity)}`;
    }
    return appendInBrackets(name, soundSensitivity, capability.comment);
  },
  EffectSpeed: (capability) => getSimpleCapabilityName(capability, "Effect speed", "speed"),
  EffectDuration: (capability) => getSimpleCapabilityName(capability, "Effect duration", "duration"),
  EffectParameter: (capability) => {
    const name = capability.comment || "Effect parameter";
    return `${name} ${startEndToString(capability.parameter)}`;
  },
  SoundSensitivity: (capability) => getSimpleCapabilityName(capability, "Sound sensitivity", "soundSensitivity"),
  BeamAngle: (capability) => getSimpleCapabilityName(capability, "Beam", "angle", "angle", true),
  BeamPosition: (capability) => {
    if (capability.horizontalAngle && capability.verticalAngle) {
      return appendInBrackets(`Beam position (${startEndToString(capability.horizontalAngle)}, ${startEndToString(capability.verticalAngle)})`, capability.comment);
    }
    const orientation = capability.horizontalAngle ? "Horizontal" : "Vertical";
    const angleStartEnd = capability[`${orientation.toLowerCase()}Angle`];
    const hasOrientationKeyword = angleStartEnd.some(
      (entity) => entity.keyword !== null && entity.keyword !== "center"
    );
    const prefix = hasOrientationKeyword ? "Beam position" : `${orientation} beam position`;
    return appendInBrackets(`${prefix} ${startEndToString(angleStartEnd)}`, capability.comment);
  },
  Focus: (capability) => getSimpleCapabilityName(capability, "Focus", "distance", "distance"),
  Zoom: (capability) => getSimpleCapabilityName(capability, "Zoom", "angle", "beam angle"),
  Iris: (capability) => getSimpleCapabilityName(capability, "Iris", "openPercent", "open"),
  IrisEffect: (capability) => {
    let name = `Iris ${capability.effectName}`;
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    return appendInBrackets(name, capability.comment);
  },
  Frost: (capability) => getSimpleCapabilityName(capability, "Frost", "frostIntensity"),
  FrostEffect: (capability) => {
    let name = `Frost ${capability.effectName}`;
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    }
    return appendInBrackets(name, capability.comment);
  },
  Prism: (capability) => {
    let name = "Prism";
    if (capability.speed) {
      name += " ";
      name += startEndToString(capability.speed, "speed");
    } else if (capability.angle) {
      name += " ";
      name += startEndToString(capability.angle, "angle");
    }
    return appendInBrackets(name, capability.comment);
  },
  PrismRotation: (capability) => {
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, "Prism rotation", speedOrAngle, speedOrAngle, true);
  },
  BladeInsertion: (capability) => getSimpleCapabilityName(capability, `Blade ${capability.blade} insertion`, "insertion"),
  BladeRotation: (capability) => getSimpleCapabilityName(capability, `Blade ${capability.blade} rotation`, "angle", "angle", true),
  BladeSystemRotation: (capability) => getSimpleCapabilityName(capability, "Blade system rotation", "angle", "angle", true),
  Fog: (capability) => {
    let name = capability.fogType || "Fog";
    if (capability.fogOutput) {
      name += ` ${startEndToString(capability.fogOutput)}`;
    }
    return appendInBrackets(name, capability.comment);
  },
  FogOutput: (capability) => getSimpleCapabilityName(capability, "Fog output", "fogOutput"),
  FogType: (capability) => appendInBrackets(`Fog type: ${capability.fogType}`, capability.comment),
  Rotation: (capability) => {
    const speedOrAngle = capability.speed === null ? "angle" : "speed";
    return getSimpleCapabilityName(capability, "Rotation", speedOrAngle, speedOrAngle, true);
  },
  Speed: (capability) => getSimpleCapabilityName(capability, "Speed", "speed"),
  Time: (capability) => getSimpleCapabilityName(capability, "Time", "time"),
  Maintenance: (capability) => {
    let name = capability.comment || "Maintenance";
    if (capability.parameter) {
      name += ` ${startEndToString(capability.parameter)}`;
    }
    let holdString = null;
    if (capability.hold) {
      holdString = `hold ${startEndToString([capability.hold, capability.hold])}`;
    }
    return appendInBrackets(name, holdString);
  },
  Generic: (capability) => capability.comment || "Generic"
};
function getSlotCapabilityName(capability) {
  if (capability.wheelSlot === null) {
    return "Unknown wheel slot";
  }
  return capability.slotNumber[0].number === capability.slotNumber[1].number ? capability.wheelSlot[0].name : capability.wheelSlot.map((slot) => slot.name).join(" \u2026 ");
}
class Capability {
  /**
   * @returns {string[]} Type-specific properties that may have a start and an end value.
   */
  static get START_END_ENTITIES() {
    return START_END_ENTITIES;
  }
  /**
   * Create a new Capability instance.
   * @param {object} jsonObject The capability data from the channel's JSON.
   * @param {Resolution} resolution How fine this capability is declared.
   * @param {CoarseChannel} channel The channel instance this channel is associated to.
   */
  constructor(jsonObject, resolution, channel) {
    this._jsonObject = jsonObject;
    this._resolution = resolution;
    this._channel = channel;
    this._dmxRangePerResolution = [];
  }
  /**
   * @returns {object} The capability data from the channel's JSON.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {Range} The capability's DMX bounds in the channel's highest resolution.
   */
  get dmxRange() {
    return this.getDmxRangeWithResolution(this._channel.maxResolution);
  }
  /**
   * @returns {Range} The capability's DMX bounds from the JSON data.
   */
  get rawDmxRange() {
    return this.getDmxRangeWithResolution(this._resolution);
  }
  /**
   * @param {number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {Range} The capability's DMX bounds scaled (down) to the given resolution.
   */
  getDmxRangeWithResolution(desiredResolution) {
    this._channel.ensureProperResolution(desiredResolution);
    if (!this._dmxRangePerResolution[desiredResolution]) {
      this._dmxRangePerResolution[desiredResolution] = new Range(scaleDmxRange(
        this._jsonObject.dmxRange[0],
        this._jsonObject.dmxRange[1],
        this._resolution,
        desiredResolution
      ));
    }
    return this._dmxRangePerResolution[desiredResolution];
  }
  /**
   * @returns {string} Describes which feature is controlled by this capability.
   */
  get type() {
    return this._jsonObject.type;
  }
  /**
   * @returns {string} Short one-line description of the capability, generated from the capability's type and type-specific properties.
   */
  get name() {
    if (this.type in namePerType$1) {
      return cacheResult(this, "name", namePerType$1[this.type](this));
    }
    return cacheResult(this, "name", `${this.type}: ${this.comment}`);
  }
  /**
   * @returns {boolean} Whether this capability has a comment set.
   */
  get hasComment() {
    return "comment" in this._jsonObject;
  }
  /**
   * @returns {string} Short additional information on this capability
   */
  get comment() {
    return this._jsonObject.comment || "";
  }
  /**
   * @returns {boolean} Whether this capability has the same effect from the start to the end.
   */
  get isStep() {
    const steppedStartEndProperties = this.usedStartEndEntities.every(
      (property) => this[property][0].number === this[property][1].number
    );
    const steppedColors = !this.colors || this.colors.isStep;
    return cacheResult(this, "isStep", steppedStartEndProperties && steppedColors);
  }
  /**
   * @returns {boolean} Whether this capability ranges from a high to a low value (e.g. speed fast…slow).
   */
  get isInverted() {
    if (this.isStep) {
      return cacheResult(this, "isInverted", false);
    }
    const proportionalProperties = this.usedStartEndEntities.filter(
      (property) => this[property][0].number !== this[property][1].number
    );
    const isInverted = proportionalProperties.length > 0 && proportionalProperties.every(
      (property) => Math.abs(this[property][0].number) > Math.abs(this[property][1].number)
    );
    return cacheResult(this, "isInverted", isInverted);
  }
  /**
   * @returns {string[]} Names of non-null properties with (maybe equal) start/end value.
   */
  get usedStartEndEntities() {
    return cacheResult(this, "usedStartEndEntities", Capability.START_END_ENTITIES.filter(
      (property) => this[property] !== null
    ));
  }
  /**
   * @param {Capability} nextCapability The next capability after this one.
   * @returns {boolean} Whether this capability's end value equals the given capability's start value, i. e. one can fade from this capability to the given one.
   */
  canCrossfadeTo(nextCapability) {
    if (this.type !== nextCapability.type) {
      return false;
    }
    if (this.usedStartEndEntities.length === 0 || this.usedStartEndEntities.length !== nextCapability.usedStartEndEntities.length) {
      return false;
    }
    const usesSameStartEndEntities = this.usedStartEndEntities.every(
      (property) => nextCapability.usedStartEndEntities.includes(property)
    );
    if (!usesSameStartEndEntities) {
      return false;
    }
    return this.usedStartEndEntities.every((property) => {
      const tolerance = property === "slotNumber" ? 0 : 1;
      const delta = nextCapability[property][0].number - this[property][1].number;
      return Math.abs(delta) <= tolerance;
    });
  }
  /**
   * @returns {string | null} A string describing the help that is needed for this capability, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }
  /**
   * @returns {'start' | 'center' | 'end' | 'hidden'} The method which DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClick() {
    return this._jsonObject.menuClick || "start";
  }
  /**
   * @returns {number} The DMX value to set when this capability is chosen in a lighting software's auto menu.
   */
  get menuClickDmxValue() {
    return this.getMenuClickDmxValueWithResolution(this._channel.maxResolution);
  }
  /**
   * @param {number} desiredResolution The grade of resolution the dmxRange should be scaled to.
   * @returns {number} The DMX value (scaled to the given resolution) to set when this capability is chosen in a lighting software's auto menu, or -1 if the capability should be hidden in the auto menu.
   */
  getMenuClickDmxValueWithResolution(desiredResolution) {
    const dmxRange = this.getDmxRangeWithResolution(desiredResolution);
    switch (this.menuClick) {
      case "start": {
        return dmxRange.start;
      }
      case "center": {
        return dmxRange.center;
      }
      case "end": {
        return dmxRange.end;
      }
      case "hidden": {
        return -1;
      }
      default: {
        throw new Error(`Unknown menuClick value '${this.menuClick}' in capability '${this.name}' (${this.rawDmxRange}).`);
      }
    }
  }
  /**
   * @returns {Record<string, string>} Switching channel aliases mapped to the channel key to which the switching channel should be set to when this capability is activated.
   */
  get switchChannels() {
    return this._jsonObject.switchChannels || {};
  }
  /**
   * TYPE-SPECIFIC PROPERTIES (no start-end)
   */
  /**
   * @returns {string | null} Behavior for the shutter, for example 'Closed', 'Strobe' or 'Pulse'. Defaults to null.
   */
  get shutterEffect() {
    return this._jsonObject.shutterEffect || null;
  }
  /**
   * @returns {'Red' | 'Green' | 'Blue' | 'Cyan' | 'Magenta' | 'Yellow' | 'Amber' | 'White' | 'Warm White' | 'Cold White' | 'UV' | 'Lime' | 'Indigo' | null} The color of the lamp that is controlled by this ColorIntensity capability. Defaults to null.
   */
  get color() {
    return this._jsonObject.color || null;
  }
  /**
   * @returns {object | null} The color hex codes for each visually distinguishable light beam. Defaults to null.
   */
  get colors() {
    let startColors = this._jsonObject.colors;
    let endColors = this._jsonObject.colors;
    let isStep = true;
    const isColorWheelSlot = () => this.wheelSlot !== null && this.wheelSlot[0].colors !== null && this.wheelSlot[1].colors !== null;
    if (isColorWheelSlot()) {
      startColors = this.wheelSlot[0].colors;
      endColors = this.wheelSlot[1].colors;
      isStep = this.slotNumber[0].number === this.slotNumber[1].number;
    } else if ("colorsStart" in this._jsonObject) {
      startColors = this._jsonObject.colorsStart;
      endColors = this._jsonObject.colorsEnd;
      isStep = false;
    }
    if (!startColors) {
      return cacheResult(this, "colors", null);
    }
    return cacheResult(this, "colors", {
      startColors,
      endColors,
      allColors: isStep ? [...startColors] : [...startColors, ...endColors],
      isStep
    });
  }
  /**
   * @returns {Wheel[]} The wheels this capability refers to. The array has one or more elements in wheel-related capabilities, zero otherwise.
   */
  get wheels() {
    let wheelNames;
    if ("wheel" in this._jsonObject) {
      wheelNames = [this._jsonObject.wheel].flat();
    } else if (this.type.includes("Wheel")) {
      wheelNames = [this._channel.name];
    } else {
      wheelNames = [];
    }
    return cacheResult(this, "wheels", wheelNames.map(
      (wheelName) => this._channel.fixture.getWheelByName(wheelName)
    ));
  }
  /**
   * @param {string | RegExp} slotType The type of the slot to check. Can be a regular expression to be checked against the type.
   * @returns {boolean} True if the capability references a slot (or range of slots) of the given type, false otherwise.
   */
  isSlotType(slotType) {
    const slotTypeRegExp = slotType instanceof RegExp ? slotType : new RegExp(`^${slotType}$`);
    const isCorrectSlotType = (slot) => slotTypeRegExp.test(slot.type) || ["Open", "Closed"].includes(slot.type) && slotTypeRegExp.test(this.wheels[0].type);
    return this.slotNumber !== null && this.wheelSlot.every((slot) => {
      return isCorrectSlotType(slot) || slot.type === "Split" && isCorrectSlotType(slot.floorSlot) && isCorrectSlotType(slot.ceilSlot);
    });
  }
  /**
   * Use only in `WheelShake` capabilities!
   * @returns {'slot' | 'wheel'} The fixture component that is shaking.
   */
  get isShaking() {
    return this.jsonObject.isShaking || "wheel";
  }
  /**
   * @returns {string | null} Describes the effect that this capability activates. May be a pretty name for an effect preset. Defaults to null.
   */
  get effectName() {
    if ("effectName" in this._jsonObject) {
      return cacheResult(this, "effectName", this._jsonObject.effectName);
    }
    if ("effectPreset" in this._jsonObject) {
      const effectName = {
        ColorFade: "Color fade",
        ColorJump: "Color jump"
      }[this._jsonObject.effectPreset];
      return cacheResult(this, "effectName", effectName);
    }
    return cacheResult(this, "effectName", null);
  }
  /**
   * @returns {string | null} Describes the effect that this capability activates by using a predefined, standard name. Defaults to null.
   */
  get effectPreset() {
    return this._jsonObject.effectPreset || null;
  }
  /**
   * @returns {boolean} Whether this effect is controlled by sound perceived by a microphone. Defaults to false.
   */
  get isSoundControlled() {
    return this._jsonObject.soundControlled === true;
  }
  /**
   * @returns {boolean} Whether this capability's speed / duration varies by a random offset. Defaults to false.
   */
  get randomTiming() {
    return this._jsonObject.randomTiming === true;
  }
  /**
   * @returns {'Top' | 'Right' | 'Bottom' | 'Left' | number | null} At which position the blade is attached. Defaults to null.
   */
  get blade() {
    return this._jsonObject.blade || null;
  }
  /**
   * @returns {'Fog' | 'Haze' | null} The kind of fog that should be emitted. Defaults to null.
   */
  get fogType() {
    return this._jsonObject.fogType || null;
  }
  /**
   * @returns {Entity | null} How long this capability should be selected to take effect. Defaults to null.
   */
  get hold() {
    if ("hold" in this._jsonObject) {
      return cacheResult(this, "hold", Entity.createFromEntityString(this._jsonObject.hold));
    }
    return cacheResult(this, "hold", null);
  }
  /**
   * TYPE-SPECIFIC PROPERTIES (only start-end)
   */
  /**
   * @returns {Entity[] | null} Start and end speed values. Defaults to null.
   */
  get speed() {
    return cacheResult(this, "speed", this._getStartEndArray("speed"));
  }
  /**
   * @returns {Entity[] | null} Start and end duration values. Defaults to null.
   */
  get duration() {
    return cacheResult(this, "duration", this._getStartEndArray("duration"));
  }
  /**
   * @returns {Entity[] | null} Start and end time values. Defaults to null.
   */
  get time() {
    return cacheResult(this, "time", this._getStartEndArray("time"));
  }
  /**
   * @returns {Entity[] | null} Start and end brightness values. Defaults to null.
   */
  get brightness() {
    let brightness = this._getStartEndArray("brightness");
    if (brightness === null && ["Intensity", "ColorIntensity"].includes(this.type)) {
      brightness = [Entity.createFromEntityString("off"), Entity.createFromEntityString("bright")];
    }
    return cacheResult(this, "brightness", brightness);
  }
  /**
   * @returns {Entity[] | null} Start and end slot numbers. Defaults to null.
   */
  get slotNumber() {
    return cacheResult(this, "slotNumber", this._getStartEndArray("slotNumber"));
  }
  /**
   * @returns {WheelSlot[] | null} Start and end wheel slot objects this capability is referencing. Defaults to null.
   */
  get wheelSlot() {
    if (this.slotNumber === null) {
      return cacheResult(this, "wheelSlot", null);
    }
    if (this.wheels.length !== 1) {
      throw new RangeError("When accessing the current wheel slot, the referenced wheel must be unambiguous.");
    }
    if (this.wheels[0]) {
      return cacheResult(this, "wheelSlot", this.slotNumber.map(
        (slotNumber) => this.wheels[0].getSlot(slotNumber.number)
      ));
    }
    return cacheResult(this, "wheelSlot", null);
  }
  /**
   * @returns {Entity[] | null} Start and end angle values. Defaults to null.
   */
  get angle() {
    return cacheResult(this, "angle", this._getStartEndArray("angle"));
  }
  /**
   * @returns {Entity[] | null} Start and end horizontal angle values. Defaults to null.
   */
  get horizontalAngle() {
    return cacheResult(this, "horizontalAngle", this._getStartEndArray("horizontalAngle"));
  }
  /**
   * @returns {Entity[] | null} Start and end vertical angle values. Defaults to null.
   */
  get verticalAngle() {
    return cacheResult(this, "verticalAngle", this._getStartEndArray("verticalAngle"));
  }
  /**
   * @returns {Entity[] | null} Start and end colorTemperature values. Defaults to null.
   */
  get colorTemperature() {
    return cacheResult(this, "colorTemperature", this._getStartEndArray("colorTemperature"));
  }
  /**
   * @returns {Entity[] | null} Start and end sound sensitivity values. Defaults to null.
   */
  get soundSensitivity() {
    return cacheResult(this, "soundSensitivity", this._getStartEndArray("soundSensitivity"));
  }
  /**
   * @returns {Entity[] | null} Start and end shake angle values. Defaults to null.
   */
  get shakeAngle() {
    return cacheResult(this, "shakeAngle", this._getStartEndArray("shakeAngle"));
  }
  /**
   * @returns {Entity[] | null} Start and end shake speed values. Defaults to null.
   */
  get shakeSpeed() {
    return cacheResult(this, "shakeSpeed", this._getStartEndArray("shakeSpeed"));
  }
  /**
   * @returns {Entity[] | null} Start and end distance values. Defaults to null.
   */
  get distance() {
    return cacheResult(this, "distance", this._getStartEndArray("distance"));
  }
  /**
   * @returns {Entity[] | null} Start and end openPercent values. Defaults to null.
   */
  get openPercent() {
    return cacheResult(this, "openPercent", this._getStartEndArray("openPercent"));
  }
  /**
   * @returns {Entity[] | null} Start and end frostIntensity values. Defaults to null.
   */
  get frostIntensity() {
    return cacheResult(this, "frostIntensity", this._getStartEndArray("frostIntensity"));
  }
  /**
   * @returns {Entity[] | null} Start and end insertion values. Defaults to null.
   */
  get insertion() {
    return cacheResult(this, "insertion", this._getStartEndArray("insertion"));
  }
  /**
   * @returns {Entity[] | null} Start and end fogOutput values. Defaults to null.
   */
  get fogOutput() {
    return cacheResult(this, "fogOutput", this._getStartEndArray("fogOutput"));
  }
  /**
   * @returns {Entity[] | null} Start and end parameter values. Defaults to null.
   */
  get parameter() {
    return cacheResult(this, "parameter", this._getStartEndArray("parameter"));
  }
  /**
   * Parses a property that has start and end variants by generating an array with start and end value.
   * @private
   * @param {string} property The base property name. 'Start' and 'End' will be appended to get the start/end variants.
   * @returns {Entity[] | null} Start and end value of the property (may be equal), parsed to Entity instances. null if it isn't defined in JSON.
   */
  _getStartEndArray(property) {
    if (property in this._jsonObject) {
      return [
        this._jsonObject[property],
        this._jsonObject[property]
      ].map((value) => Entity.createFromEntityString(value));
    }
    if (`${property}Start` in this._jsonObject) {
      return [
        this._jsonObject[`${property}Start`],
        this._jsonObject[`${property}End`]
      ].map((value) => Entity.createFromEntityString(value));
    }
    return null;
  }
}
function getSimpleCapabilityName(capability, name, property, propertyName = null, propertyNameBeforeValue = false) {
  const propertyString = startEndToString(capability[property], propertyName, propertyNameBeforeValue);
  return appendInBrackets(`${name} ${propertyString}`, capability.comment);
}
function appendInBrackets(string, ...inBrackets) {
  inBrackets = inBrackets.filter(
    (inBracket) => inBracket !== void 0 && inBracket !== null && inBracket !== ""
  );
  if (inBrackets.length === 0) {
    return string;
  }
  const inBracketsString = inBrackets.join(", ");
  return `${string} (${inBracketsString})`;
}
function colorTemperaturesToString([start, end]) {
  if (start.keyword || start.unit !== "%") {
    return startEndToString([start, end]);
  }
  if (start.equals(end)) {
    return colorTemperatureToString(start.number);
  }
  if (start <= 0) {
    if (end <= 0) {
      return `${-start}\u2026${-end}% warm`;
    }
    return `${-start}% warm \u2026 ${end}% cold`;
  }
  if (end <= 0) {
    return `${start}% cold \u2026 ${-end}% warm`;
  }
  return `${start}\u2026${end}% cold`;
  function colorTemperatureToString(temperature) {
    if (temperature < 0) {
      return `${-temperature}% warm`;
    }
    if (temperature > 0) {
      return `${temperature}% cold`;
    }
    return "default";
  }
}
function startEndToString([start, end], propertyName = null, propertyNameBeforeValue = false) {
  if (start.keyword) {
    return handleKeywords();
  }
  const unitAliases = {
    "deg": "\xB0",
    "m^3/min": "m\xB3/min"
  };
  const unit = unitAliases[start.unit] || start.unit;
  const words = [];
  if (start.equals(end)) {
    words.push(`${start.number}${unit}`);
  } else {
    words.push(`${start.number}\u2026${end.number}${unit}`);
  }
  if (propertyName && unit === "%") {
    words.push(propertyName);
  }
  if (propertyNameBeforeValue) {
    words.reverse();
  }
  return words.join(" ");
  function handleKeywords() {
    if (start.equals(end)) {
      return start.keyword;
    }
    const hasSpecifier = / (?:CW|CCW|reverse)$/;
    if (hasSpecifier.test(start.keyword) && hasSpecifier.test(end.keyword)) {
      const [speedStart, specifierStart] = start.keyword.split(" ");
      const [speedEnd, specifierEnd] = end.keyword.split(" ");
      if (specifierStart === specifierEnd) {
        return `${specifierStart} ${speedStart}\u2026${speedEnd}`;
      }
    }
    return `${start.keyword}\u2026${end.keyword}`;
  }
}

class FineChannel extends AbstractChannel {
  /**
   * Creates a new FineChannel instance.
   * @param {string} key The fine channel alias as defined in the coarse channel.
   * @param {CoarseChannel} coarseChannel The coarse (MSB) channel.
   */
  constructor(key, coarseChannel) {
    super(key);
    this._coarseChannel = coarseChannel;
  }
  /**
   * @returns {CoarseChannel} The coarse (MSB) channel.
   */
  get coarseChannel() {
    return this._coarseChannel;
  }
  /**
   * @returns {CoarseChannel | FineChannel} The next coarser channel. May also be a fine channel, if this fine channel's resolution is 24bit or higher.
   */
  get coarserChannel() {
    return this.resolution === CoarseChannel.RESOLUTION_16BIT ? this.coarseChannel : this.coarseChannel.fineChannels[this.resolution - 3];
  }
  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} A generated channel name, based upon the coarse channel's name.
   */
  get name() {
    const suffix = this.resolution > CoarseChannel.RESOLUTION_16BIT ? `^${this.resolution - 1}` : "";
    return `${this.coarseChannel.name} fine${suffix}`;
  }
  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture this channel belongs to.
   */
  get fixture() {
    return this.coarseChannel.fixture;
  }
  /**
   * @returns {Resolution} The resolution of this fine channel. E.g. 2 (16bit) for the first fine channel, 3 (24bit) for the second fine channel, etc.
   */
  get resolution() {
    return this._coarseChannel.fineChannelAliases.indexOf(this.key) + 2;
  }
  /**
   * @returns {number} The DMX value (from 0 to 255) this channel should be set to by default.
   */
  get defaultValue() {
    return this._coarseChannel.getDefaultValueWithResolution(this.resolution) % 256;
  }
}

class SwitchingChannel extends AbstractChannel {
  /**
   * Creates a new SwitchingChannel instance.
   * @param {string} alias The unique switching channel alias as defined in the trigger channel's `switchChannels` properties.
   * @param {AbstractChannel} triggerChannel The channel whose DMX value this channel depends on.
   */
  constructor(alias, triggerChannel) {
    super(alias);
    this._triggerChannel = triggerChannel;
  }
  /**
   * @returns {AbstractChannel} The channel whose DMX value this switching channel depends on.
   */
  get triggerChannel() {
    return this._triggerChannel;
  }
  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture in which this channel is used.
   */
  get fixture() {
    return this.triggerChannel.fixture;
  }
  /**
   * @typedef {object} TriggerCapability
   * @property {Range} dmxRange The DMX range that triggers the switching channel.
   * @property {string} switchTo The channel to switch to in the given DMX range.
   */
  /**
   * @returns {TriggerCapability[]} The trigger channel's capabilities in a compact form to only include the DMX range and which channel should be switched to. DMX values are given in the trigger channel's highest possible resolution.
   */
  get triggerCapabilities() {
    return cacheResult(this, "triggerCapabilities", this.triggerChannel.capabilities.map(
      (capability) => ({
        dmxRange: capability.dmxRange,
        switchTo: capability.switchChannels[this.key]
      })
    ));
  }
  /**
   * @returns {Record<string, Range[]>} Keys of channels that can be switched to pointing to an array of DMX values the trigger channel must be set to to active the channel. DMX values are given in the trigger channel's highest possible resolution.
   */
  get triggerRanges() {
    const triggerRanges = {};
    for (const capability of this.triggerCapabilities) {
      if (!(capability.switchTo in triggerRanges)) {
        triggerRanges[capability.switchTo] = [];
      }
      triggerRanges[capability.switchTo].push(capability.dmxRange);
    }
    for (const channel of Object.keys(triggerRanges)) {
      triggerRanges[channel] = Range.getMergedRanges(triggerRanges[channel]);
    }
    return cacheResult(this, "triggerRanges", triggerRanges);
  }
  /**
   * @returns {string} The key of the channel that is activated when the trigger channel is set to its default value.
   */
  get defaultChannelKey() {
    return cacheResult(this, "defaultChannelKey", this.triggerCapabilities.find(
      (capability) => capability.dmxRange.contains(this.triggerChannel.defaultValue)
    ).switchTo);
  }
  /**
   * @returns {AbstractChannel} The channel that is activated when the trigger channel is set to its default value.
   */
  get defaultChannel() {
    return cacheResult(this, "defaultChannel", this.fixture.getChannelByKey(this.defaultChannelKey));
  }
  /**
   * @returns {string[]} All channel keys this channel can be switched to.
   */
  get switchToChannelKeys() {
    const switchToChannelKeys = this.triggerCapabilities.map((capability) => capability.switchTo).filter((channelKey, index, array) => array.indexOf(channelKey) === index);
    return cacheResult(this, "switchToChannelKeys", switchToChannelKeys);
  }
  /**
   * @returns {AbstractChannel[]} All channels this channel can be switched to.
   */
  get switchToChannels() {
    return cacheResult(this, "switchToChannels", this.switchToChannelKeys.map(
      (channelKey) => this.fixture.getChannelByKey(channelKey)
    ));
  }
  /**
   * @typedef {'keyOnly' | 'defaultOnly' | 'switchedOnly' | 'all'} SwitchingChannelBehavior
   */
  /**
   * @param {string} channelKey The channel key to search for.
   * @param {SwitchingChannelBehavior} [switchingChannelBehavior='all'] Define which channels to include in the search.
   * @returns {boolean} Whether this SwitchingChannel contains the given channel key.
   */
  usesChannelKey(channelKey, switchingChannelBehavior = "all") {
    if (switchingChannelBehavior === "keyOnly") {
      return this.key === channelKey;
    }
    if (switchingChannelBehavior === "defaultOnly") {
      return this.defaultChannel.key === channelKey;
    }
    if (switchingChannelBehavior === "switchedOnly") {
      return this.switchToChannelKeys.includes(channelKey);
    }
    return this.switchToChannelKeys.includes(channelKey) || this.key === channelKey;
  }
  /**
   * @returns {boolean} True if help is needed in one of the switched channels, false otherwise.
   */
  get isHelpWanted() {
    return cacheResult(this, "isHelpWanted", this.switchToChannels.some(
      (channel) => channel.isHelpWanted
    ));
  }
}

const channelTypeConstraints = {
  "Single Color": ["ColorIntensity"],
  "Multi-Color": {
    required: ["ColorPreset", "WheelSlot"],
    predicate: (channel) => channel.capabilities.every(
      (capability) => capability.type !== "WheelSlot" || capability.wheels[0] && capability.wheels[0].type === "Color"
    )
  },
  "Pan": ["Pan", "PanContinuous"],
  "Tilt": ["Tilt", "TiltContinuous"],
  "Focus": ["Focus"],
  "Zoom": ["Zoom"],
  "Iris": ["Iris", "IrisEffect"],
  "Gobo": {
    required: ["WheelSlot", "WheelShake"],
    predicate: (channel) => channel.capabilities.every(
      (capability) => capability.wheels.every((wheel) => wheel && wheel.type === "Gobo")
    )
  },
  "Prism": ["Prism"],
  "Color Temperature": ["ColorTemperature"],
  "Effect": ["Effect", "EffectParameter", "Frost", "FrostEffect", "SoundSensitivity", "WheelSlot"],
  "Strobe": {
    required: ["ShutterStrobe"],
    predicate: (channel) => channel.capabilities.some(
      (capability) => capability.type === "ShutterStrobe" && !["Open", "Closed"].includes(capability.shutterEffect)
    )
  },
  "Shutter": ["ShutterStrobe", "BladeInsertion", "BladeRotation", "BladeSystemRotation"],
  "Fog": ["Fog", "FogOutput", "FogType"],
  "Speed": ["StrobeSpeed", "StrobeDuration", "PanTiltSpeed", "EffectSpeed", "EffectDuration", "BeamAngle", "BeamPosition", "PrismRotation", "Rotation", "Speed", "Time", "WheelSlotRotation", "WheelRotation", "WheelShake"],
  "Maintenance": ["Maintenance"],
  "Intensity": ["Intensity", "Generic"],
  "NoFunction": ["NoFunction"]
};
class CoarseChannel extends AbstractChannel {
  /**
   * 1 for 8bit, 2 for 16bit, ...
   * @typedef {number} Resolution
   */
  /**
   * @returns {Resolution} Resolution of an 8bit channel.
   */
  static get RESOLUTION_8BIT() {
    return 1;
  }
  /**
   * @returns {Resolution} Resolution of a 16bit channel.
   */
  static get RESOLUTION_16BIT() {
    return 2;
  }
  /**
   * @returns {Resolution} Resolution of a 24bit channel.
   */
  static get RESOLUTION_24BIT() {
    return 3;
  }
  /**
   * @returns {Resolution} Resolution of a 32bit channel.
   */
  static get RESOLUTION_32BIT() {
    return 4;
  }
  /**
   * Create a new CoarseChannel instance.
   * @param {string} key The channel's identifier, must be unique in the fixture.
   * @param {object} jsonObject The channel data from the fixture's JSON.
   * @param {Fixture} fixture The fixture instance this channel is associated to.
   */
  constructor(key, jsonObject, fixture) {
    super(key);
    this._jsonObject = jsonObject;
    this._fixture = fixture;
  }
  /**
   * @returns {object} The channel data from the fixture's JSON.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * Overrides [`AbstractChannel.fixture`]{@link AbstractChannel#fixture}.
   * @returns {Fixture} The fixture instance this channel is associated to.
   */
  get fixture() {
    return this._fixture;
  }
  /**
   * Overrides [`AbstractChannel.name`]{@link AbstractChannel#name}.
   * @returns {string} The channel name if present or else the channel key.
   */
  get name() {
    return this._jsonObject.name || this.key;
  }
  /**
   * @returns {string} The channel type, derived from the channel's capability types.
   */
  get type() {
    const type = Object.keys(channelTypeConstraints).find((potentialType) => {
      let constraints = channelTypeConstraints[potentialType];
      if (Array.isArray(constraints)) {
        constraints = {
          required: constraints
        };
      }
      const requiredCapabilityTypeUsed = this.capabilities.some(
        (capability) => constraints.required.includes(capability.type)
      );
      const predicateFulfilled = !("predicate" in constraints) || constraints.predicate(this);
      return requiredCapabilityTypeUsed && predicateFulfilled;
    }) || "Unknown";
    return cacheResult(this, "type", type);
  }
  /**
   * @returns {string | null} The color of an included ColorIntensity capability, null if there's no such capability.
   */
  get color() {
    var _a;
    const color = (_a = this.capabilities.find((capability) => capability.type === "ColorIntensity")) == null ? void 0 : _a.color;
    return cacheResult(this, "color", color != null ? color : null);
  }
  /**
   * @returns {string[]} This channel's fine channel aliases, ordered by resolution (coarsest first).
   */
  get fineChannelAliases() {
    return this._jsonObject.fineChannelAliases || [];
  }
  /**
   * @returns {FineChannel[]} This channel's fine channels, ordered by resolution (coarsest first).
   */
  get fineChannels() {
    return cacheResult(this, "fineChannels", this.fineChannelAliases.map(
      (alias) => new FineChannel(alias, this)
    ));
  }
  /**
   * @returns {Resolution} How fine this channel can be used at its maximum. Equals the amount of coarse and fine channels.
   */
  get maxResolution() {
    return 1 + this.fineChannelAliases.length;
  }
  /**
   * Checks the given resolution if it can safely be used in this channel.
   * @param {Resolution} uncheckedResolution The resolution to be checked.
   * @throws {RangeError} If the given resolution is invalid in this channel.
   */
  ensureProperResolution(uncheckedResolution) {
    if (uncheckedResolution > this.maxResolution || uncheckedResolution < CoarseChannel.RESOLUTION_8BIT || uncheckedResolution % 1 !== 0) {
      throw new RangeError("resolution must be a positive integer not greater than maxResolution");
    }
  }
  /**
   * @returns {Resolution} How fine this channel is declared in the JSON data. Defaults to {@link CoarseChannel#maxResolution}.
   */
  get dmxValueResolution() {
    if ("dmxValueResolution" in this._jsonObject) {
      const resolutionStringToResolution = {
        "8bit": CoarseChannel.RESOLUTION_8BIT,
        "16bit": CoarseChannel.RESOLUTION_16BIT,
        "24bit": CoarseChannel.RESOLUTION_24BIT
      };
      return cacheResult(this, "dmxValueResolution", resolutionStringToResolution[this._jsonObject.dmxValueResolution]);
    }
    return cacheResult(this, "dmxValueResolution", this.maxResolution);
  }
  /**
   * @param {Mode} mode The mode in which this channel is used.
   * @param {SwitchingChannelBehavior} switchingChannelBehavior How switching channels are treated, see {@link Mode#getChannelIndex}.
   * @returns {Resolution} How fine this channel is used in the given mode. 0 if the channel isn't used at all.
   */
  getResolutionInMode(mode, switchingChannelBehavior) {
    const channelKeys = [this.key, ...this.fineChannelAliases];
    const usedChannels = channelKeys.filter(
      (channelKey) => mode.getChannelIndex(channelKey, switchingChannelBehavior) !== -1
    );
    return usedChannels.length;
  }
  /**
   * @returns {number} The maximum DMX value in the highest possible resolution. E.g. 65535 for a 16bit channel.
   */
  get maxDmxBound() {
    return Math.pow(256, this.maxResolution) - 1;
  }
  /**
   * @returns {boolean} Whether this channel has a defaultValue.
   */
  get hasDefaultValue() {
    return "defaultValue" in this._jsonObject;
  }
  /**
   * @returns {number} The DMX value this channel initially should be set to. Specified in the finest possible resolution. Defaults to 0.
   */
  get defaultValue() {
    return this.getDefaultValueWithResolution(this.maxResolution);
  }
  /**
   * @private
   * @returns {Record<Resolution, number>} The default DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.
   */
  get _defaultValuePerResolution() {
    let rawDefaultValue = this._jsonObject.defaultValue || 0;
    if (!Number.isInteger(rawDefaultValue)) {
      const percentage = Entity.createFromEntityString(rawDefaultValue).number / 100;
      rawDefaultValue = Math.floor(percentage * (Math.pow(256, this.dmxValueResolution) - 1));
    }
    const defaultValuePerResolution = {};
    for (let index = 1; index <= this.maxResolution; index++) {
      defaultValuePerResolution[index] = scaleDmxValue(rawDefaultValue, this.dmxValueResolution, index);
    }
    return cacheResult(this, "_defaultValuePerResolution", defaultValuePerResolution);
  }
  /**
   * @param {Resolution} desiredResolution The grade of resolution the defaultValue should be scaled to.
   * @returns {number} The DMX value this channel initially should be set to, scaled to match the given resolution.
   */
  getDefaultValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);
    return this._defaultValuePerResolution[desiredResolution];
  }
  /**
   * @returns {boolean} Whether this channel has a highlightValue.
   */
  get hasHighlightValue() {
    return "highlightValue" in this._jsonObject;
  }
  /**
   * @returns {number} A DMX value that "highlights" the function of this channel. Specified in the finest possible resolution. Defaults to the highest possible DMX value.
   */
  get highlightValue() {
    return this.getHighlightValueWithResolution(this.maxResolution);
  }
  /**
   * @private
   * @returns {Record<Resolution, number>} The highlight DMX value of this channel in the given resolution, for all resolutions up to the channel's maximum resolution.
   */
  get _highlightValuePerResolution() {
    let rawHighlightValue = this._jsonObject.highlightValue;
    if (!Number.isInteger(rawHighlightValue)) {
      const maxDmxBoundInResolution = Math.pow(256, this.dmxValueResolution) - 1;
      if (this.hasHighlightValue) {
        const percentage = Entity.createFromEntityString(rawHighlightValue).number / 100;
        rawHighlightValue = Math.floor(percentage * maxDmxBoundInResolution);
      } else {
        rawHighlightValue = maxDmxBoundInResolution;
      }
    }
    const highlightValuePerResolution = {};
    for (let index = 1; index <= this.maxResolution; index++) {
      highlightValuePerResolution[index] = scaleDmxValue(rawHighlightValue, this.dmxValueResolution, index);
    }
    return cacheResult(this, "_highlightValuePerResolution", highlightValuePerResolution);
  }
  /**
   * @param {Resolution} desiredResolution The grade of resolution the highlightValue should be scaled to.
   * @returns {number} A DMX value that "highlights" the function of this channel, scaled to match the given resolution.
   */
  getHighlightValueWithResolution(desiredResolution) {
    this.ensureProperResolution(desiredResolution);
    return this._highlightValuePerResolution[desiredResolution];
  }
  /**
   * @returns {boolean} Whether a fader for this channel should be displayed upside down.
   */
  get isInverted() {
    const proportionalCapabilities = this.capabilities.filter((capability) => !capability.isStep);
    const isInverted = proportionalCapabilities.length > 0 && proportionalCapabilities.every((capability) => capability.isInverted);
    return cacheResult(this, "isInverted", isInverted);
  }
  /**
   * @returns {boolean} Whether this channel should constantly stay at the same value.
   */
  get isConstant() {
    return "constant" in this._jsonObject && this._jsonObject.constant;
  }
  /**
   * @returns {boolean} Whether switching from one DMX value to another in this channel can be faded smoothly.
   */
  get canCrossfade() {
    if (this.capabilities.length === 1) {
      return cacheResult(this, "canCrossfade", !this.isConstant && this.type !== "NoFunction");
    }
    const canCrossfade = this.capabilities.every(
      (capability, index, array) => index + 1 === array.length || capability.canCrossfadeTo(array[index + 1])
    ) && this.capabilities.some((capability) => !capability.isStep);
    return cacheResult(this, "canCrossfade", canCrossfade);
  }
  /**
   * @returns {'HTP' | 'LTP'} The channel's behavior when being affected by multiple faders: HTP (Highest Takes Precedent) or LTP (Latest Takes Precedent).
   */
  get precedence() {
    return "precedence" in this._jsonObject ? this._jsonObject.precedence : "LTP";
  }
  /**
   * @returns {string[]} Aliases of the switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannelAliases() {
    return cacheResult(this, "switchingChannelAliases", Object.keys(this.capabilities[0].switchChannels));
  }
  /**
   * @returns {SwitchingChannel[]} Switching channels defined by this channel, ordered by appearance in the JSON.
   */
  get switchingChannels() {
    return cacheResult(this, "switchingChannels", this.switchingChannelAliases.map(
      (alias) => new SwitchingChannel(alias, this)
    ));
  }
  /**
   * @returns {string[]} The keys of the channels to which the switching channels defined by this channel can be switched to.
   */
  get switchToChannelKeys() {
    return cacheResult(this, "switchToChannelKeys", this.switchingChannels.flatMap(
      (switchingChannel) => switchingChannel.switchToChannelKeys
    ));
  }
  /**
   * @returns {Capability[]} All capabilities of this channel, ordered by DMX range.
   */
  get capabilities() {
    if ("capability" in this._jsonObject) {
      const capabilityData = {
        dmxRange: [0, Math.pow(256, this.dmxValueResolution) - 1],
        ...this._jsonObject.capability
      };
      return cacheResult(this, "capabilities", [
        new Capability(capabilityData, this.dmxValueResolution, this)
      ]);
    }
    return cacheResult(this, "capabilities", this._jsonObject.capabilities.map(
      (capability) => new Capability(capability, this.dmxValueResolution, this)
    ));
  }
  /**
   * @returns {boolean} True if help is needed in a capability of this channel, false otherwise.
   */
  get isHelpWanted() {
    return cacheResult(this, "isHelpWanted", this.capabilities.some(
      (capability) => capability.helpWanted !== null
    ));
  }
}

class Matrix {
  /**
   * @param {object} jsonObject The fixture's JSON object containing the matrix information.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {object} The fixture's JSON object containing the matrix information.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {number[]} Amount of pixels in X, Y and Z direction. A horizontal bar with 4 LEDs would be `[4, 1, 1]`, a 5x5 pixel head would be `[5, 5, 1]`.
   * @throws {ReferenceError} If neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelCount() {
    if ("pixelCount" in this._jsonObject) {
      return cacheResult(this, "pixelCount", this._jsonObject.pixelCount);
    }
    if ("pixelKeys" in this._jsonObject) {
      const xyz = [1, 1, this.pixelKeyStructure.length];
      for (const yItems of this.pixelKeyStructure) {
        xyz[1] = Math.max(xyz[1], yItems.length);
        for (const xItems of yItems) {
          xyz[0] = Math.max(xyz[0], xItems.length);
        }
      }
      return cacheResult(this, "pixelCount", xyz);
    }
    throw new ReferenceError("Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.");
  }
  /**
   * @returns {number} Amount of pixels in X direction.
   */
  get pixelCountX() {
    return this.pixelCount[0];
  }
  /**
   * @returns {number} Amount of pixels in Y direction.
   */
  get pixelCountY() {
    return this.pixelCount[1];
  }
  /**
   * @returns {number} Amount of pixels in Z direction.
   */
  get pixelCountZ() {
    return this.pixelCount[2];
  }
  /**
   * @returns {string[]} Contains each of 'X', 'Y', 'Z' if its respective axis is defined (= if its `pixelCount` is > 1).
   */
  get definedAxes() {
    const definedAxes = [];
    if (this.pixelCountX > 1) {
      definedAxes.push("X");
    }
    if (this.pixelCountY > 1) {
      definedAxes.push("Y");
    }
    if (this.pixelCountZ > 1) {
      definedAxes.push("Z");
    }
    return cacheResult(this, "definedAxes", definedAxes);
  }
  /**
   * @returns {string[][][]} Pixel keys by Z, Y and X position.
   * @throws {ReferenceError} if neither `pixelCount` nor `pixelKeys` are defined in the matrix JSON object.
   */
  get pixelKeyStructure() {
    if ("pixelKeys" in this._jsonObject) {
      return cacheResult(this, "pixelKeyStructure", this._jsonObject.pixelKeys);
    }
    if ("pixelCount" in this._jsonObject) {
      return cacheResult(this, "pixelKeyStructure", this._getPixelDefaultKeys());
    }
    throw new ReferenceError("Either pixelCount or pixelKeys has to be specified in a fixture's matrix object.");
  }
  /**
   * Generate default keys for all pixels.
   * @private
   * @returns {string[][][]} Default pixel keys by Z, Y and X position.
   */
  _getPixelDefaultKeys() {
    const zItems = [];
    for (let z = 1; z <= this.pixelCountZ; z++) {
      const yItems = [];
      for (let y = 1; y <= this.pixelCountY; y++) {
        const xItems = [];
        for (let x = 1; x <= this.pixelCountX; x++) {
          xItems.push(this._getPixelDefaultKey(x, y, z));
        }
        yItems.push(xItems);
      }
      zItems.push(yItems);
    }
    return zItems;
  }
  /**
   * Generate default name based on defined axes and given position if no custom names are set via `pixelKeys`.
   *
   * | Dimension | Default pixelKey |
   * | --------- | ---------------- |
   * | 1D        | `"$number"`      |
   * | 2D        | `"($x, $y)"`     |
   * | 3D        | `"($x, $y, $z)"` |
   *
   * @private
   * @param {number} x Position of pixel in X direction.
   * @param {number} y Position of pixel in Y direction.
   * @param {number} z Position of pixel in Z direction.
   * @returns {string} The pixel's default key.
   * @throws {RangeError} If {@link Matrix#definedAxes}.length is not 1, 2 or 3.
   */
  _getPixelDefaultKey(x, y, z) {
    switch (this.definedAxes.length) {
      case 1: {
        return Math.max(x, y, z).toString();
      }
      case 2: {
        const first = this.definedAxes.includes("X") ? x : y;
        const last = this.definedAxes.includes("Y") ? y : z;
        return `(${first}, ${last})`;
      }
      case 3: {
        return `(${x}, ${y}, ${z})`;
      }
      default: {
        throw new RangeError("Only 1, 2 or 3 axes can be defined.");
      }
    }
  }
  /**
   * @returns {string[]} All pixelKeys, ordered alphanumerically (1 < 2 < 10 < alice < bob < carol)
   */
  get pixelKeys() {
    const pixelKeys = Object.keys(this.pixelKeyPositions).toSorted(
      (a, b) => a.toString().localeCompare(b, void 0, { numeric: true })
    );
    return cacheResult(this, "pixelKeys", pixelKeys);
  }
  /**
   * Sorts the pixelKeys by given X/Y/Z order. Order of the parameters equals the order in a `repeatFor`'s "eachPixelXYZ".
   * @param {'X' | 'Y' | 'Z'} firstAxis Axis with highest ordering.
   * @param {'X' | 'Y' | 'Z'} secondAxis Axis with middle ordering.
   * @param {'X' | 'Y' | 'Z'} thirdAxis Axis with lowest ordering.
   * @returns {string[]} All pixelKeys ordered by given axis order.
   */
  getPixelKeysByOrder(firstAxis, secondAxis, thirdAxis) {
    const axisToPosIndex = { X: 0, Y: 1, Z: 2 };
    const firstPosIndex = axisToPosIndex[firstAxis];
    const secondPosIndex = axisToPosIndex[secondAxis];
    const thirdPosIndex = axisToPosIndex[thirdAxis];
    return this.pixelKeys.toSorted((keyA, keyB) => {
      const [posA, posB] = [this.pixelKeyPositions[keyA], this.pixelKeyPositions[keyB]];
      if (posA[thirdPosIndex] !== posB[thirdPosIndex]) {
        return posA[thirdPosIndex] - posB[thirdPosIndex];
      }
      if (posA[secondPosIndex] !== posB[secondPosIndex]) {
        return posA[secondPosIndex] - posB[secondPosIndex];
      }
      return posA[firstPosIndex] - posB[firstPosIndex];
    });
  }
  /**
   * @returns {Record<string, number[]>} Each pixelKey pointing to an array of its X/Y/Z position
   */
  get pixelKeyPositions() {
    const pixelKeyPositions = {};
    for (let z = 0; z < this.pixelCountZ; z++) {
      for (let y = 0; y < this.pixelCountY; y++) {
        for (let x = 0; x < this.pixelCountX; x++) {
          if (this.pixelKeyStructure[z][y][x] !== null) {
            pixelKeyPositions[this.pixelKeyStructure[z][y][x]] = [x + 1, y + 1, z + 1];
          }
        }
      }
    }
    return cacheResult(this, "pixelKeyPositions", pixelKeyPositions);
  }
  /**
   * @returns {string[]} All available pixel group keys, ordered by appearance.
   */
  get pixelGroupKeys() {
    return cacheResult(this, "pixelGroupKeys", Object.keys(this.pixelGroups));
  }
  /**
   * @returns {Record<string, string[]>} Key is the group key, value is an array of pixel keys.
   */
  get pixelGroups() {
    const pixelGroups = {};
    if ("pixelGroups" in this._jsonObject) {
      for (const [groupKey, group] of Object.entries(this._jsonObject.pixelGroups)) {
        if (Array.isArray(group)) {
          pixelGroups[groupKey] = group;
        } else if (group === "all") {
          pixelGroups[groupKey] = this.pixelKeys;
        } else {
          const constraints = convertConstraintsToFunctions(group);
          const pixelKeys = "name" in group ? this.pixelKeys : this.getPixelKeysByOrder("X", "Y", "Z");
          pixelGroups[groupKey] = pixelKeys.filter(
            (key) => this._pixelKeyFulfillsConstraints(key, constraints)
          );
        }
      }
    }
    return cacheResult(this, "pixelGroups", pixelGroups);
  }
  /**
   * @param {string} pixelKey The pixel key to check against the constraints.
   * @param {object} constraints The constraints to apply.
   * @returns {boolean} True if the pixel key fulfills all constraints, false otherwise.
   */
  _pixelKeyFulfillsConstraints(pixelKey, constraints) {
    const position = this.pixelKeyPositions[pixelKey];
    const numberConstraintsFulfilled = ["x", "y", "z"].every((axis, axisIndex) => {
      const axisPos = position[axisIndex];
      return constraints[axis].every((constraintFunction) => constraintFunction(axisPos));
    });
    const stringConstraintsFulfilled = constraints.name.every(
      (constraintFunction) => constraintFunction(pixelKey)
    );
    return numberConstraintsFulfilled && stringConstraintsFulfilled;
  }
}
function convertConstraintsToFunctions(constraints) {
  const constraintFunctions = {};
  for (const axis of ["x", "y", "z"]) {
    constraintFunctions[axis] = (constraints[axis] || []).map(
      (constraint) => convertNumberConstraintToFunction(constraint)
    );
  }
  constraintFunctions.name = (constraints.name || []).map(
    (pattern) => (name) => new RegExp(pattern).test(name)
  );
  return constraintFunctions;
}
function convertNumberConstraintToFunction(constraint) {
  if (constraint.startsWith("=")) {
    const eqPos = Number.parseInt(constraint.slice(1), 10);
    return (position) => position === eqPos;
  }
  if (constraint.startsWith(">=")) {
    const minPos = Number.parseInt(constraint.slice(2), 10);
    return (position) => position >= minPos;
  }
  if (constraint.startsWith("<=")) {
    const maxPos = Number.parseInt(constraint.slice(2), 10);
    return (position) => position <= maxPos;
  }
  constraint = constraint.replace(/^even$/, "2n");
  constraint = constraint.replace(/^odd$/, "2n+1");
  const match = constraint.match(/^(\d+)n(?:\+(\d+)|)$/);
  if (match !== null) {
    const divisor = Number.parseInt(match[1], 10);
    const remainder = Number.parseInt(match[2] || "0", 10);
    return (position) => position % divisor === remainder;
  }
  throw new Error(`Invalid pixel key constraint '${constraint}'.`);
}

class Meta {
  /**
   * Creates a new Meta instance.
   * @param {object} jsonObject A meta object from the fixture's JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {string[]} Names of people who contributed to this fixture.
   */
  get authors() {
    return this._jsonObject.authors;
  }
  /**
   * @returns {Date} When this fixture was created. Might not refer to the creation in OFL, but in the lighting software from which this fixture was imported.
   */
  get createDate() {
    return new Date(this._jsonObject.createDate);
  }
  /**
   * @returns {Date} When this fixture was changed the last time. Might not refer to a modification in OFL, but in the lighting software from which this fixture was imported.
   */
  get lastModifyDate() {
    return new Date(this._jsonObject.lastModifyDate);
  }
  /**
   * @returns {string | null} The key of the plugin with which this fixture was imported. Null if it's not imported.
   */
  get importPlugin() {
    return "importPlugin" in this._jsonObject ? this._jsonObject.importPlugin.plugin : null;
  }
  /**
   * @returns {Date | null} When this fixture was imported. Null if it's not imported.
   */
  get importDate() {
    return "importPlugin" in this._jsonObject ? new Date(this._jsonObject.importPlugin.date) : null;
  }
  /**
   * @returns {string | null} A comment further describing the import process. Null if it's not imported.
   */
  get importComment() {
    return "importPlugin" in this._jsonObject ? this._jsonObject.importPlugin.comment || "" : null;
  }
  /**
   * @returns {boolean} Whether there is an import comment. Always false if it's not imported.
   */
  get hasImportComment() {
    return this.importPlugin !== null && "comment" in this._jsonObject.importPlugin;
  }
}

class Physical {
  /**
   * Creates a new Physical instance.
   * @param {object} jsonObject A fixture's or mode's physical JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {object} The object from the JSON data that is represented by this Physical object.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {number[] | null} Width, height and depth of the fixture in millimeters. Defaults to null.
   */
  get dimensions() {
    return this._jsonObject.dimensions || null;
  }
  /**
   * @returns {number | null} Width of the fixture in millimeters. Defaults to null.
   */
  get width() {
    return this.dimensions === null ? null : this.dimensions[0];
  }
  /**
   * @returns {number | null} Height of the fixture in millimeters. Defaults to null.
   */
  get height() {
    return this.dimensions === null ? null : this.dimensions[1];
  }
  /**
   * @returns {number | null} Depth of the fixture in millimeters. Defaults to null.
   */
  get depth() {
    return this.dimensions === null ? null : this.dimensions[2];
  }
  /**
   * @returns {number | null} Weight of the fixture in kilograms. Defaults to null.
   */
  get weight() {
    return this._jsonObject.weight || null;
  }
  /**
   * @returns {number | null} Power consumption of the fixture in watts. Defaults to null.
   */
  get power() {
    return this._jsonObject.power || null;
  }
  /**
   * @returns {Record<string, string>} Power connector information.
   */
  get powerConnectors() {
    return this._jsonObject.powerConnectors || {};
  }
  /**
   * @returns {string | null} The DMX plug to be used to control the fixture, e.g. "3-pin" (XLR). Defaults to null.
   */
  get DMXconnector() {
    return this._jsonObject.DMXconnector || null;
  }
  /**
   * @returns {boolean} Whether physical data about the light source is available.
   */
  get hasBulb() {
    return "bulb" in this._jsonObject;
  }
  /**
   * @returns {string | null} The kind of lamp that is used in the fixture, e.g. "LED". Defaults to null.
   */
  get bulbType() {
    return this.hasBulb ? this._jsonObject.bulb.type || null : null;
  }
  /**
   * @returns {number | null} The color temperature of the bulb in kelvins. Defaults to null.
   */
  get bulbColorTemperature() {
    return this.hasBulb ? this._jsonObject.bulb.colorTemperature || null : null;
  }
  /**
   * @returns {number | null} The luminous flux of the bulb in lumens. Defaults to null.
   */
  get bulbLumens() {
    return this.hasBulb ? this._jsonObject.bulb.lumens || null : null;
  }
  /**
   * @returns {boolean} Whether physical data about the lens is available.
   */
  get hasLens() {
    return "lens" in this._jsonObject;
  }
  /**
   * @returns {string | null} The kind of lens that is used in the fixture, e.g. "Fresnel". Defaults to null.
   */
  get lensName() {
    return this.hasLens ? this._jsonObject.lens.name || null : null;
  }
  /**
   * @returns {number | null} The minimum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMin() {
    return this.hasLens && "degreesMinMax" in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[0] : null;
  }
  /**
   * @returns {number | null} The maximum possible beam angle in degrees. Defaults to null.
   */
  get lensDegreesMax() {
    return this.hasLens && "degreesMinMax" in this._jsonObject.lens ? this._jsonObject.lens.degreesMinMax[1] : null;
  }
  /**
   * @returns {boolean} Whether physical data about the matrix is available.
   */
  get hasMatrixPixels() {
    return "matrixPixels" in this._jsonObject;
  }
  /**
   * @returns {number[] | null} Width, height, depth of a matrix pixel in millimeters.
   */
  get matrixPixelsDimensions() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.dimensions : null;
  }
  /**
   * @returns {number[] | null} XYZ-Spacing between matrix pixels in millimeters.
   */
  get matrixPixelsSpacing() {
    return this.hasMatrixPixels ? this._jsonObject.matrixPixels.spacing : null;
  }
}

class TemplateChannel extends CoarseChannel {
  /**
   * Creates new TemplateChannel instance. Also clears cache by setting jsonObject.
   * @param {string} key The templateChannel's key with the required variables.
   * @param {object} jsonObject The template's JSON data which looks pretty similar to a normal channel's data except that channel aliases must include variables.
   * @param {Fixture} fixture The Fixture instance.
   */
  constructor(key, jsonObject, fixture) {
    super(key, jsonObject, fixture);
  }
  /**
   * @returns {string[]} Template keys and aliases introduced by this channel, i.e. the channel key itself and defined fine and switching channels.
   */
  get allTemplateKeys() {
    return cacheResult(this, "allTemplateKeys", [this.key, ...this.fineChannelAliases, ...this.switchingChannelAliases]);
  }
  /**
   * @returns {Map<string, string[]>} All template keys pointing to the key resolved with each pixel key to a matrix channel key.
   */
  get possibleMatrixChannelKeys() {
    const possibleMatrixChannelKeys = /* @__PURE__ */ new Map();
    for (const templateKey of this.allTemplateKeys) {
      const pixelKeys = [...this.fixture.matrix.pixelKeys, ...this.fixture.matrix.pixelGroupKeys];
      possibleMatrixChannelKeys.set(templateKey, pixelKeys.map(
        (pixelKey) => TemplateChannel.resolveTemplateString(templateKey, { pixelKey })
      ));
    }
    return cacheResult(this, "possibleMatrixChannelKeys", possibleMatrixChannelKeys);
  }
  /**
   * Creates matrix channels from this template channel (together with its fine and switching channels if defined) and all pixel keys.
   * @returns {AbstractChannel[]} The generated channels associated to the given pixel key and its fine and switching channels.
   */
  createMatrixChannels() {
    const matrixChannels = [];
    const pixelKeys = [...this.fixture.matrix.pixelKeys, ...this.fixture.matrix.pixelGroupKeys];
    for (const pixelKey of pixelKeys) {
      const templateVariables = { pixelKey };
      const jsonData = TemplateChannel.resolveTemplateObject(this._jsonObject, templateVariables);
      const channelKey = TemplateChannel.resolveTemplateString(this._key, templateVariables);
      const mainChannel = new CoarseChannel(channelKey, jsonData, this.fixture);
      const channels = [mainChannel, ...mainChannel.fineChannels, ...mainChannel.switchingChannels];
      for (const channel of channels) {
        channel.pixelKey = pixelKey;
      }
      matrixChannels.push(...channels);
    }
    return matrixChannels;
  }
  /**
   * Replaces the specified variables in the specified object by cloning the object.
   * @param {object} object The object which has to be modified.
   * @param {Record<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {object} A copy of the object with replaced variables.
   */
  static resolveTemplateObject(object, variables) {
    return JSON.parse(TemplateChannel.resolveTemplateString(JSON.stringify(object), variables));
  }
  /**
   * Replaces the specified variables in the specified string.
   * @param {string} string The string which has to be modified.
   * @param {Record<string, string>} variables Each variable (without $) pointing to its value.
   * @returns {string} The modified string.
   */
  static resolveTemplateString(string, variables) {
    for (const variable of Object.keys(variables)) {
      string = stringReplaceAll(string, `$${variable}`, variables[variable]);
    }
    return string;
  }
}
function stringReplaceAll(string, search, replacement) {
  return string.split(search).join(replacement);
}

class Mode {
  /**
   * Creates a new Mode instance
   * @param {object} jsonObject The mode object from the fixture's JSON data.
   * @param {Fixture} fixture The fixture this mode is associated to.
   */
  constructor(jsonObject, fixture) {
    this._jsonObject = jsonObject;
    this._fixture = fixture;
  }
  /**
   * @returns {object} The JSON data representing this mode. It's a fragment of a fixture's JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {Fixture} The fixture this mode belongs to.
   */
  get fixture() {
    return this._fixture;
  }
  /**
   * @returns {string} The mode's name from the JSON data.
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {string} A shorter mode name from the JSON data. Defaults to the normal name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }
  /**
   * @returns {boolean} Whether this mode has a short name set in the JSON data.
   */
  get hasShortName() {
    return "shortName" in this._jsonObject;
  }
  /**
   * @returns {number | null} The index used in the RDM protocol to reference this mode. Defaults to null.
   */
  get rdmPersonalityIndex() {
    return this._jsonObject.rdmPersonalityIndex || null;
  }
  /**
   * @returns {Physical | null} Extend the fixture's physical data with this physical data object when this mode is activated. Defaults to null.
   */
  get physicalOverride() {
    if ("physical" in this._jsonObject) {
      return cacheResult(this, "physicalOverride", new Physical(this._jsonObject.physical));
    }
    return cacheResult(this, "physicalOverride", null);
  }
  /**
   * @returns {Physical | null} Fixture's physical with mode's physical override (if present) applied on. Null if neither fixture nor mode define physical data.
   */
  get physical() {
    if (this.fixture.physical === null) {
      return cacheResult(this, "physical", this.physicalOverride);
    }
    if (this.physicalOverride === null) {
      return cacheResult(this, "physical", this.fixture.physical);
    }
    const fixturePhysical = this.fixture.physical.jsonObject;
    const physicalOverride = this._jsonObject.physical;
    const physicalData = { ...fixturePhysical, ...physicalOverride };
    for (const property of ["bulb", "lens", "matrixPixels"]) {
      if (property in physicalData) {
        physicalData[property] = {
          ...fixturePhysical[property],
          ...physicalOverride[property]
        };
      }
    }
    return cacheResult(this, "physical", new Physical(physicalData));
  }
  /**
   * @returns {string[]} The mode's channel keys. The count and position equals to actual DMX channel count and position.
   */
  get channelKeys() {
    const channelKeys = this._jsonObject.channels.flatMap((rawReference) => {
      if (rawReference !== null && rawReference.insert === "matrixChannels") {
        return this._getMatrixChannelKeysFromInsertBlock(rawReference);
      }
      return rawReference;
    });
    return cacheResult(this, "channelKeys", channelKeys);
  }
  /**
   * @returns {number} The number of null channels used in this mode.
   */
  get nullChannelCount() {
    return this.channelKeys.filter((channelKey) => channelKey === null).length;
  }
  /**
   * Resolves the matrix channel insert block into a list of channel keys
   * @private
   * @param {object} channelInsert The JSON channel insert block
   * @returns {string[]} The resolved channel keys
   */
  _getMatrixChannelKeysFromInsertBlock(channelInsert) {
    const pixelKeys = this._getRepeatForPixelKeys(channelInsert.repeatFor);
    const channelKeys = [];
    if (channelInsert.channelOrder === "perPixel") {
      for (const pixelKey of pixelKeys) {
        for (const templateChannelKey of channelInsert.templateChannels) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey
          }));
        }
      }
    } else if (channelInsert.channelOrder === "perChannel") {
      for (const templateChannelKey of channelInsert.templateChannels) {
        for (const pixelKey of pixelKeys) {
          channelKeys.push(TemplateChannel.resolveTemplateString(templateChannelKey, {
            pixelKey
          }));
        }
      }
    }
    return channelKeys;
  }
  /**
   * Resolves `repeatFor` keywords into a list of pixel (group) keys or just returns the given pixel (group) key array.
   * @private
   * @param {string | string[]} repeatFor A matrix channel insert's repeatFor property.
   * @returns {string[]} The properly ordered list of pixel (group) keys.
   */
  _getRepeatForPixelKeys(repeatFor) {
    if (Array.isArray(repeatFor)) {
      return repeatFor;
    }
    const matrix = this.fixture.matrix;
    if (repeatFor === "eachPixelGroup") {
      return matrix.pixelGroupKeys;
    }
    if (repeatFor === "eachPixelABC") {
      return matrix.pixelKeys;
    }
    const orderByAxes = repeatFor.replace("eachPixel", "");
    return matrix.getPixelKeysByOrder(orderByAxes[0], orderByAxes[1], orderByAxes[2]);
  }
  /**
   * @returns {AbstractChannel[]} The mode's channels. The count and position equals to actual DMX channel count and position.
   */
  get channels() {
    let nullChannelsFound = 0;
    const channels = this.channelKeys.map((channelKey) => {
      if (channelKey === null) {
        nullChannelsFound++;
        return this.fixture.nullChannels[nullChannelsFound - 1];
      }
      return this.fixture.getChannelByKey(channelKey);
    });
    return cacheResult(this, "channels", channels);
  }
  /**
   * @param {string} channelKey The key of the channel to get the index for.
   * @param {SwitchingChannelBehavior} [switchingChannelBehavior='all'] Controls how switching channels are counted, see {@link SwitchingChannel#usesChannelKey} for possible values.
   * @returns {number} The index of the given channel in this mode or -1 if not found.
   */
  getChannelIndex(channelKey, switchingChannelBehavior = "all") {
    return this.channels.findIndex((channel) => {
      if (channel === null) {
        return false;
      }
      if (channel instanceof SwitchingChannel) {
        return channel.usesChannelKey(channelKey, switchingChannelBehavior);
      }
      return channel.key === channelKey;
    });
  }
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  //
  // Note to future-self: No, you can't remove the `toLowerCase()` call.
  // REF: https://github.com/uuidjs/uuid/pull/677#issuecomment-1757351351
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate
let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto$1.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

const native = {
  randomUUID: crypto$1.randomUUID
};

function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80;
  return unsafeStringify(rnds);
}

class NullChannel extends CoarseChannel {
  /**
   * Creates a new NullChannel instance by creating a Channel object with NoFunction channel data.
   * Uses a unique uuid as channel key.
   * @param {Fixture} fixture The fixture this channel is associated to.
   */
  constructor(fixture) {
    super(`null-${v4()}`, {
      name: "No Function",
      capability: {
        type: "NoFunction"
      }
    }, fixture);
  }
}

class Resource {
  /**
   * Creates a new Resource instance.
   * @param {object} jsonObject An embedded resource object from the fixture's JSON data.
   */
  constructor(jsonObject) {
    this._jsonObject = jsonObject;
  }
  // part of the resource JSON:
  /**
   * @returns {string} The resource's name.
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {string[]} An array of keywords belonging to this resource.
   */
  get keywords() {
    return (this._jsonObject.keywords || "").split(" ");
  }
  /**
   * @returns {string | null} The source this resource was taken from, or null if it's not specified.
   */
  get source() {
    return this._jsonObject.source || null;
  }
  // added by embedding into the fixture:
  /**
   * @returns {string} The resource key.
   */
  get key() {
    return this._jsonObject.key;
  }
  /**
   * @returns {string} The resource name, i.e. its directory.
   */
  get type() {
    return this._jsonObject.type;
  }
  /**
   * @returns {string | null} The resource alias, as specified in the fixture, or null if the resource was referenced directly.
   */
  get alias() {
    return this._jsonObject.alias || null;
  }
  /**
   * @returns {boolean} True if this resource has an associated image, false otherwise.
   */
  get hasImage() {
    return "image" in this._jsonObject;
  }
  /**
   * @returns {string | null} The resource image's file extension, or null if there is no image.
   */
  get imageExtension() {
    return this.hasImage ? this._jsonObject.image.extension : null;
  }
  /**
   * @returns {string | null} The resource image's MIME type, or null if there is no image.
   */
  get imageMimeType() {
    return this.hasImage ? this._jsonObject.image.mimeType : null;
  }
  /**
   * @returns {string | null} The resource image data (base64 or utf-8 encoded), or null if there is no image.
   */
  get imageData() {
    return this.hasImage ? this._jsonObject.image.data : null;
  }
  /**
   * @returns {'base64' | 'utf-8' | null} The resource image's data encoding, or null if there is no image.
   */
  get imageEncoding() {
    return this.hasImage ? this._jsonObject.image.encoding : null;
  }
  /**
   * @returns {string | null} A data URL containing the resource image, or null if there is no image.
   */
  get imageDataUrl() {
    if (!this.hasImage) {
      return cacheResult(this, "imageDataUrl", null);
    }
    let mimeType = this.imageMimeType;
    const imageData = encodeURIComponent(this.imageData).replaceAll("(", "%28").replaceAll(")", "%29");
    if (this.imageEncoding === "base64") {
      mimeType += ";base64";
    }
    return cacheResult(this, "imageDataUrl", `data:${mimeType},${imageData}`);
  }
}

const namePerType = {
  Color: (slot, name) => {
    if (name !== null && slot.colorTemperature !== null) {
      return `${name} (${slot.colorTemperature.toString()})`;
    }
    if (slot.colorTemperature !== null) {
      return slot.colorTemperature.toString();
    }
    return name;
  },
  Gobo: (slot, name) => {
    if (name === null) {
      if (slot.resource !== null) {
        return `Gobo ${slot.resource.name}`;
      }
      return null;
    }
    if (name.startsWith("Gobo")) {
      return name;
    }
    return `Gobo ${name}`;
  },
  Prism: (slot, name) => {
    if (name !== null && slot.facets !== null) {
      return `${slot.facets}-facet ${name}`;
    }
    if (slot.facets !== null) {
      return `${slot.facets}-facet prism`;
    }
    return name;
  },
  Iris: (slot, name) => {
    if (slot.openPercent !== null) {
      return `Iris ${slot.openPercent.toString()}`;
    }
    return null;
  },
  Frost: (slot, name) => {
    if (slot.frostIntensity !== null) {
      return `Frost ${slot.frostIntensity.toString()}`;
    }
    return null;
  },
  Split: (slot, name) => {
    return `Split ${slot.floorSlot.name} / ${slot.ceilSlot.name}`;
  },
  AnimationGoboStart: (slot, name) => {
    return name === null ? null : `${name} Start`;
  },
  AnimationGoboEnd: (slot, name) => {
    const slotNumber = slot._wheel.slots.indexOf(slot) + 1;
    const previousSlot = slot._wheel.getSlot(slotNumber - 1);
    return previousSlot._jsonObject.name ? `${previousSlot._jsonObject.name} End` : null;
  },
  AnimationGobo: (slot, name) => {
    return slot.floorSlot.name.replace(" Start", "");
  },
  Default: (slot, name) => {
    return name;
  }
};
class WheelSlot {
  /**
   * Creates a new WheelSlot instance.
   * @param {object | null} jsonObject A wheel slot object from the fixture's JSON data. If null, this WheelSlot is a split slot.
   * @param {Wheel} wheel The wheel that this slot belongs to.
   * @param {WheelSlot | null} floorSlot For split slots, the WheelSlot instance at the start.
   * @param {WheelSlot | null} ceilSlot For split slots, the WheelSlot instance at the end.
   */
  constructor(jsonObject, wheel, floorSlot = null, ceilSlot = null) {
    this._jsonObject = jsonObject;
    this._wheel = wheel;
    this._floorSlot = floorSlot;
    this._ceilSlot = ceilSlot;
  }
  /**
   * @returns {boolean} True if this WheelSlot instance represents a split slot.
   */
  get isSplitSlot() {
    return this._jsonObject === null;
  }
  /**
   * @returns {string} The slot's type.
   */
  get type() {
    if (!this.isSplitSlot) {
      return cacheResult(this, "type", this._jsonObject.type);
    }
    if (this._floorSlot.type === "AnimationGoboStart") {
      return cacheResult(this, "type", "AnimationGobo");
    }
    return cacheResult(this, "type", "Split");
  }
  /**
   * @returns {number} The zero-based index of this slot amongst all slots with the same type in this wheel.
   */
  get nthOfType() {
    return cacheResult(this, "nthOfType", this._wheel.getSlotsOfType(this.type).indexOf(this));
  }
  /**
   * @returns {Resource | string | null} The gobo resource object if it was previously embedded, or the gobo resource reference string, or null if no resource is specified for the slot.
   */
  get resource() {
    if (this.isSplitSlot || !("resource" in this._jsonObject)) {
      return cacheResult(this, "resource", null);
    }
    if (typeof this._jsonObject.resource === "string") {
      return cacheResult(this, "resource", this._jsonObject.resource);
    }
    return cacheResult(this, "resource", new Resource(this._jsonObject.resource));
  }
  /**
   * @returns {string} The wheel slot's name.
   */
  get name() {
    const nameFunction = this.type in namePerType ? namePerType[this.type] : namePerType.Default;
    let name = nameFunction(this, this.isSplitSlot ? null : this._jsonObject.name || null);
    if (name === null) {
      const typeName = this.type.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
      name = this._wheel.getSlotsOfType(this.type).length === 1 ? typeName : `${typeName} ${this.nthOfType + 1}`;
    }
    return cacheResult(this, "name", name);
  }
  /**
   * @returns {string[] | null} The colors of this wheel slot, or null if this slot has no colors.
   */
  get colors() {
    const fixedColors = {
      Open: ["#ffffff"],
      Closed: ["#000000"]
    };
    if (this.type in fixedColors) {
      return cacheResult(this, "colors", fixedColors[this.type]);
    }
    if (this.isSplitSlot) {
      if (this._floorSlot.colors && this._ceilSlot.colors) {
        return cacheResult(this, "colors", [...this._floorSlot.colors, ...this._ceilSlot.colors]);
      }
    } else if ("colors" in this._jsonObject) {
      return cacheResult(this, "colors", this._jsonObject.colors);
    }
    return cacheResult(this, "colors", null);
  }
  /**
   * @returns {Entity | null} For Color slots, the slot's color temperature. Null if this slot has no color temperature.
   */
  get colorTemperature() {
    if ("colorTemperature" in this._jsonObject) {
      return cacheResult(this, "colorTemperature", Entity.createFromEntityString(this._jsonObject.colorTemperature));
    }
    return cacheResult(this, "colorTemperature", null);
  }
  /**
   * @returns {number | null} For Prism slots, the number of prism facets. Null if number of facets is not defined.
   */
  get facets() {
    return this._jsonObject.facets || null;
  }
  /**
   * @returns {Entity | null} For Iris slots, the slot's openPercent value. Null if this slot has no openPercent value.
   */
  get openPercent() {
    if ("openPercent" in this._jsonObject) {
      return cacheResult(this, "openPercent", Entity.createFromEntityString(this._jsonObject.openPercent));
    }
    return cacheResult(this, "openPercent", null);
  }
  /**
   * @returns {Entity | null} For Frost slots, the slot's frost intensity. Null if this slot has no frost intensity.
   */
  get frostIntensity() {
    if ("frostIntensity" in this._jsonObject) {
      return cacheResult(this, "frostIntensity", Entity.createFromEntityString(this._jsonObject.frostIntensity));
    }
    return cacheResult(this, "frostIntensity", null);
  }
  /**
   * @returns {WheelSlot | null} For split slots, the floor (start) slot. Null for non-split slots.
   */
  get floorSlot() {
    return this._floorSlot || null;
  }
  /**
   * @returns {WheelSlot | null} For split slots, the ceil (end) slot. Null for non-split slots.
   */
  get ceilSlot() {
    return this._ceilSlot || null;
  }
}

class Wheel {
  /**
   * Creates a new Wheel instance.
   * @param {string} wheelName The wheel's name, like specified in the JSON.
   * @param {object} jsonObject A wheel object from the fixture's JSON data.
   */
  constructor(wheelName, jsonObject) {
    this._name = wheelName;
    this._jsonObject = jsonObject;
    this._splitSlots = {};
    this._slotsOfType = {};
  }
  /**
   * @returns {string} The wheel's name.
   */
  get name() {
    return this._name;
  }
  /**
   * @returns {'CW' | 'CCW'} The direction the wheel's slots are arranged in. Defaults to clockwise.
   */
  get direction() {
    return this._jsonObject.direction || "CW";
  }
  /**
   * @returns {string} The type of the Wheel, i.e. the most frequent slot type (except for animation gobo wheels; the wheel type is AnimationGobo there).
   */
  get type() {
    const slotTypes = this.slots.map((slot) => slot.type);
    slotTypes.sort((a, b) => {
      const occurrencesOfA = slotTypes.filter((type2) => type2 === a);
      const occurrencesOfB = slotTypes.filter((type2) => type2 === b);
      return occurrencesOfA.length - occurrencesOfB.length;
    });
    const type = slotTypes.pop();
    if (type.startsWith("AnimationGobo")) {
      return "AnimationGobo";
    }
    return type;
  }
  /**
   * @returns {WheelSlot[]} Array of wheel slots.
   */
  get slots() {
    return cacheResult(this, "slots", this._jsonObject.slots.map(
      (slotJson) => new WheelSlot(slotJson, this)
    ));
  }
  /**
   * @param {number} slotNumber The one-based slot number.
   * @returns {WheelSlot} The slot object. Can be a split slot object, if a non-integer index is specified.
   */
  getSlot(slotNumber) {
    if (slotNumber % 1 === 0) {
      return this.slots[this.getAbsoluteSlotIndex(slotNumber)];
    }
    const floorIndex = this.getAbsoluteSlotIndex(Math.floor(slotNumber));
    const ceilIndex = this.getAbsoluteSlotIndex(Math.ceil(slotNumber));
    const splitKey = `Split ${floorIndex}/${ceilIndex}`;
    if (!(splitKey in this._splitSlots)) {
      const floorSlot = this.slots[floorIndex];
      const ceilSlot = this.slots[ceilIndex];
      this._splitSlots[splitKey] = new WheelSlot(null, this, floorSlot, ceilSlot);
    }
    return this._splitSlots[splitKey];
  }
  /**
   * @param {number} slotNumber The one-based slot number, can be smaller than 1 and greater than the number of slots.
   * @returns {number} The zero-based slot index, bounded by the number of slots.
   */
  getAbsoluteSlotIndex(slotNumber) {
    return (slotNumber - 1) % this.slots.length + (slotNumber < 1 ? this.slots.length : 0);
  }
  /**
   * @param {string} type The wheel slot type to search for.
   * @returns {WheelSlot[]} All slots with the given type.
   */
  getSlotsOfType(type) {
    if (!(type in this._slotsOfType)) {
      this._slotsOfType[type] = this.slots.filter(
        (slot) => slot.type === type
      );
    }
    return this._slotsOfType[type];
  }
}

class Fixture {
  /**
   * Create a new Fixture instance.
   * @param {Manufacturer} manufacturer A Manufacturer instance.
   * @param {string} key The fixture's unique key. Equals to filename without '.json'.
   * @param {object} jsonObject The fixture's parsed JSON data.
   */
  constructor(manufacturer, key, jsonObject) {
    this._manufacturer = manufacturer;
    this._key = key;
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {Manufacturer} The fixture's manufacturer.
   */
  get manufacturer() {
    return this._manufacturer;
  }
  /**
   * @returns {string} The fixture's unique key. Equals to filename without '.json'.
   */
  get key() {
    return this._key;
  }
  /**
   * @returns {object} The fixture's parsed JSON data.
   */
  get jsonObject() {
    return this._jsonObject;
  }
  /**
   * @returns {string} An URL pointing to the fixture's page on the Open Fixture Library website.
   */
  get url() {
    const websiteUrl = process.env.WEBSITE_URL || "https://open-fixture-library.org/";
    return `${websiteUrl}${this.manufacturer.key}/${this.key}`;
  }
  /**
   * @returns {string} The fixture's product name.
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {boolean} Whether a short name is defined for this fixture.
   */
  get hasShortName() {
    return "shortName" in this._jsonObject;
  }
  /**
   * @returns {string} A globally unique and as short as possible product name, defaults to name.
   */
  get shortName() {
    return this._jsonObject.shortName || this._jsonObject.name;
  }
  /**
   * @returns {string[]} The fixture's categories with the most applicable one first.
   */
  get categories() {
    return this._jsonObject.categories;
  }
  /**
   * @returns {string} The fixture's most applicable category. Equals to first item of categories.
   */
  get mainCategory() {
    return this.categories[0];
  }
  /**
   * @returns {Meta} A Meta instance providing information like author or create date.
   */
  get meta() {
    return cacheResult(this, "meta", new Meta(this._jsonObject.meta));
  }
  /**
   * @returns {boolean} Whether a comment is defined for this fixture.
   */
  get hasComment() {
    return "comment" in this._jsonObject;
  }
  /**
   * @returns {string} A comment about the fixture (often a note about an incorrectness in the manual). Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || "";
  }
  /**
   * @returns {string | null} A string describing the help that is needed for this fixture, or null if no help is needed.
   */
  get helpWanted() {
    return this._jsonObject.helpWanted || null;
  }
  /**
   * @returns {boolean} True if help is needed in this fixture (maybe in a capability), false otherwise.
   */
  get isHelpWanted() {
    return this.helpWanted !== null || this.isCapabilityHelpWanted;
  }
  /**
   * @returns {boolean} True if help is needed in a capability, false otherwise.
   */
  get isCapabilityHelpWanted() {
    return cacheResult(this, "isCapabilityHelpWanted", this.allChannels.some(
      (channel) => channel.isHelpWanted
    ));
  }
  /**
   * @returns {Record<string, string[]> | null} An object with URL arrays, organized by link type, or null if no links are available for this fixture.
   */
  get links() {
    return this._jsonObject.links || null;
  }
  /**
   * @param {string} type The type of the links that should be returned.
   * @returns {string[]} An array of URLs of the specified type (may be empty).
   */
  getLinksOfType(type) {
    if (this.links === null) {
      return [];
    }
    return this.links[type] || [];
  }
  /**
   * @returns {object | null} Information about the RDM functionality of this fixture. Defaults to null.
   * @property {number} modelId The RDM model/product id of the fixture, given in decimal format.
   * @property {string | null} softwareVersion The software version used as reference in this fixture definition.
   */
  get rdm() {
    return this._jsonObject.rdm || null;
  }
  /**
   * @returns {Physical | null} The general physical information for the fixture, may be overridden by modes.
   */
  get physical() {
    if ("physical" in this._jsonObject) {
      return cacheResult(this, "physical", new Physical(this._jsonObject.physical));
    }
    return cacheResult(this, "physical", null);
  }
  /**
   * @returns {Matrix | null} The matrix information for this fixture.
   */
  get matrix() {
    if ("matrix" in this._jsonObject) {
      return cacheResult(this, "matrix", new Matrix(this._jsonObject.matrix));
    }
    return cacheResult(this, "matrix", null);
  }
  /**
   * @returns {Wheel[]} The fixture's wheels as {@link Wheel} instances.
   */
  get wheels() {
    const wheels = Object.entries(this._jsonObject.wheels || {}).map(
      ([wheelName, wheelJson]) => new Wheel(wheelName, wheelJson)
    );
    return cacheResult(this, "wheels", wheels);
  }
  /**
   * @private
   * @returns {Record<string, Wheel>} This fixture's wheel names pointing to the respective Wheel instance.
   */
  get _wheelByName() {
    return cacheResult(this, "_wheelByName", Object.fromEntries(
      this.wheels.map((wheel) => [wheel.name, wheel])
    ));
  }
  /**
   * @param {string} wheelName The name of the wheel.
   * @returns {Wheel | null} The wheel with the given name, or null if no wheel with the given name exists.
   */
  getWheelByName(wheelName) {
    return this._wheelByName[wheelName] || null;
  }
  /**
   * @returns {Record<string, string>} Channel keys from {@link Fixture#allChannelKeys} pointing to unique versions of their channel names.
   */
  get uniqueChannelNames() {
    const uniqueChannelNames = {};
    const names = this.allChannels.map((channel) => channel.name);
    for (let index = 0; index < names.length; index++) {
      const originalName = names[index];
      let duplicates = 1;
      while (names.indexOf(names[index]) !== index) {
        duplicates++;
        names[index] = `${originalName} ${duplicates}`;
      }
      uniqueChannelNames[this.allChannelKeys[index]] = names[index];
    }
    return cacheResult(this, "uniqueChannelNames", uniqueChannelNames);
  }
  /**
   * @returns {string[]} Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.
   */
  get availableChannelKeys() {
    return cacheResult(this, "availableChannelKeys", Object.keys(this._jsonObject.availableChannels || {}));
  }
  /**
   * @returns {CoarseChannel[]} Coarse channels from the fixture definition's `availableChannels` section. Ordered by appearance.
   */
  get availableChannels() {
    return cacheResult(this, "availableChannels", this.availableChannelKeys.map(
      (channelKey) => new CoarseChannel(channelKey, this._jsonObject.availableChannels[channelKey], this)
    ));
  }
  /**
   * @returns {string[]} Coarse channels' keys, including matrix channels' keys. If possible, ordered by appearance.
   */
  get coarseChannelKeys() {
    return cacheResult(this, "coarseChannelKeys", this.coarseChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {CoarseChannel[]} Coarse channels, including matrix channels. If possible, ordered by appearance.
   */
  get coarseChannels() {
    return cacheResult(this, "coarseChannels", this.allChannels.filter(
      (channel) => channel instanceof CoarseChannel
    ));
  }
  /**
   * @returns {string[]} All fine channels' aliases, including matrix fine channels' aliases. If possible, ordered by appearance.
   */
  get fineChannelAliases() {
    return cacheResult(this, "fineChannelAliases", this.fineChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {FineChannel[]} All fine channels, including matrix fine channels. If possible, ordered by appearance.
   */
  get fineChannels() {
    return cacheResult(this, "fineChannels", this.allChannels.filter(
      (channel) => channel instanceof FineChannel
    ));
  }
  /**
   * @returns {string[]} All switching channels' aliases, including matrix switching channels' aliases. If possible, ordered by appearance.
   */
  get switchingChannelAliases() {
    return cacheResult(this, "switchingChannelAliases", this.switchingChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {SwitchingChannel[]} All switching channels, including matrix switching channels. If possible, ordered by appearance.
   */
  get switchingChannels() {
    return cacheResult(this, "switchingChannels", this.allChannels.filter(
      (channel) => channel instanceof SwitchingChannel
    ));
  }
  /**
   * Template channels are used to automatically generate channels.
   * @returns {string[]} All template channel keys from the fixture definition's `templateChannels` section. Ordered by appearance.
   */
  get templateChannelKeys() {
    return Object.keys(this._jsonObject.templateChannels || {});
  }
  /**
   * Template channels are used to automatically generate channels.
   * @returns {TemplateChannel[]} TemplateChannel instances for all template channels from the fixture definition's `templateChannels` section. Ordered by appearance.
   */
  get templateChannels() {
    return cacheResult(this, "templateChannels", this.templateChannelKeys.map(
      (key) => new TemplateChannel(key, this._jsonObject.templateChannels[key], this)
    ));
  }
  /**
   * @private
   * @returns {Record<string, TemplateChannel>} This fixture's template channel keys pointing to the respective template channel.
   */
  get _templateChannelByKey() {
    return cacheResult(this, "_templateChannelByKey", Object.fromEntries(
      this.templateChannels.map((channel) => [channel.key, channel])
    ));
  }
  /**
   * Searches the template channel with the given key. Fine and switching template channel aliases *can't* be found.
   * @param {string} channelKey The template channel's key
   * @returns {TemplateChannel | null} The corresponding template channel.
   */
  getTemplateChannelByKey(channelKey) {
    return this._templateChannelByKey[channelKey] || null;
  }
  /**
   * @returns {string[]} Keys of all resolved matrix channels.
   */
  get matrixChannelKeys() {
    return cacheResult(this, "matrixChannelKeys", this.matrixChannels.map(
      (channel) => channel.key
    ));
  }
  /**
   * @returns {AbstractChannel[]} All (resolved) channels with `pixelKey` information (including fine and switching channels).
   */
  get matrixChannels() {
    if (this.matrix === null) {
      return cacheResult(this, "matrixChannels", []);
    }
    return cacheResult(this, "matrixChannels", this.allChannels.filter(
      (channel) => channel.pixelKey !== null
    ));
  }
  /**
   * @returns {string[]} All null channels' keys.
   */
  get nullChannelKeys() {
    return this.nullChannels.map((channel) => channel.key);
  }
  /**
   * @returns {NullChannel[]} Automatically generated null channels.
   */
  get nullChannels() {
    const maxNullPerMode = Math.max(...this.modes.map((mode) => mode.nullChannelCount));
    const nullChannels = Array.from({ length: maxNullPerMode }, () => new NullChannel(this));
    return cacheResult(this, "nullChannels", nullChannels);
  }
  /**
   * @returns {string[]} All channel keys used in this fixture, including resolved matrix channels' keys. If possible, ordered by appearance.
   */
  get allChannelKeys() {
    return cacheResult(this, "allChannelKeys", Object.keys(this.allChannelsByKey));
  }
  /**
   * @returns {AbstractChannel[]} All channels used in this fixture, including resolved matrix channels. If possible, ordered by appearance.
   */
  get allChannels() {
    return cacheResult(this, "allChannels", Object.values(this.allChannelsByKey));
  }
  /**
   * @returns {Record<string, AbstractChannel>} All channel keys used in this fixture pointing to the respective channel, including matrix channels. If possible, ordered by appearance.
   */
  get allChannelsByKey() {
    const allChannels = [
      ...this.availableChannels.flatMap((mainChannel) => [
        mainChannel,
        ...mainChannel.fineChannels,
        ...mainChannel.switchingChannels
      ]),
      ...this.nullChannels
    ];
    const allChannelsByKey = Object.fromEntries(
      allChannels.map((channel) => [channel.key, channel])
    );
    const allMatrixChannelsByKey = Object.fromEntries(
      this.templateChannels.flatMap((templateChannel) => templateChannel.createMatrixChannels()).map((matrixChannel) => [matrixChannel.key, matrixChannel])
    );
    for (let matrixChannel of Object.values(allMatrixChannelsByKey)) {
      if (matrixChannel.key in allChannelsByKey) {
        const overrideChannel = allChannelsByKey[matrixChannel.key];
        overrideChannel.pixelKey = matrixChannel.pixelKey;
        delete allChannelsByKey[matrixChannel.key];
        matrixChannel = overrideChannel;
      }
      const matrixChannelUsed = this.modes.some(
        (mode) => mode.channelKeys.some((channelKey) => {
          if (matrixChannel.key === channelKey) {
            return true;
          }
          const otherChannel = allChannelsByKey[channelKey] || allMatrixChannelsByKey[channelKey];
          return otherChannel instanceof SwitchingChannel && otherChannel.switchToChannelKeys.includes(matrixChannel.key);
        })
      );
      if (matrixChannelUsed) {
        allChannelsByKey[matrixChannel.key] = matrixChannel;
      }
    }
    return cacheResult(this, "allChannelsByKey", allChannelsByKey);
  }
  /**
   * @param {string} key The channel's key.
   * @returns {AbstractChannel | null} The found channel, null if not found.
   */
  getChannelByKey(key) {
    return this.allChannelsByKey[key] || null;
  }
  /**
   * @returns {Capability[]} All available channels' and template channels' capabilities.
   */
  get capabilities() {
    const channels = [...this.availableChannels, ...this.templateChannels];
    const capabilities = channels.flatMap((channel) => channel.capabilities);
    return cacheResult(this, "capabilities", capabilities);
  }
  /**
   * @returns {Mode[]} The fixture's modes.
   */
  get modes() {
    return cacheResult(this, "modes", this._jsonObject.modes.map(
      (jsonMode) => new Mode(jsonMode, this)
    ));
  }
}

class Manufacturer {
  /**
   * Creates a new Manufacturer instance.
   * @param {string} key The manufacturer key. Equals to directory name in the fixtures directory.
   * @param {object} jsonObject The manufacturer's JSON object.
   */
  constructor(key, jsonObject) {
    this.key = key;
    this._jsonObject = jsonObject;
  }
  /**
   * @returns {string} The manufacturer's display name. Often used as prefix of fixture names, e.g. "cameo" + "Hydrabeam 100".
   */
  get name() {
    return this._jsonObject.name;
  }
  /**
   * @returns {string} An additional description or explanation, if the name doesn't give enough information. Defaults to an empty string.
   */
  get comment() {
    return this._jsonObject.comment || "";
  }
  /**
   * @returns {boolean} Whether this manufacturer has a comment.
   */
  get hasComment() {
    return "comment" in this._jsonObject;
  }
  /**
   * @returns {string | null} An URL pointing to the manufacturer's website (with fixture product pages).
   */
  get website() {
    return this._jsonObject.website || null;
  }
  /**
   * @returns {number | null} The id associated to this manufacturer in the RDM protocol.
   */
  get rdmId() {
    return this._jsonObject.rdmId || null;
  }
}

async function fixtureFromRepository(manufacturerKey, fixtureKey) {
  let fixturePath = `../fixtures/${manufacturerKey}/${fixtureKey}.json`;
  let fixtureJson = await importJson(fixturePath, globalThis._importMeta_.url);
  if (fixtureJson.$schema.endsWith("/fixture-redirect.json")) {
    fixturePath = `../fixtures/${fixtureJson.redirectTo}.json`;
    fixtureJson = {
      ...await importJson(fixturePath, globalThis._importMeta_.url),
      name: fixtureJson.name
    };
  }
  const manufacturer = await manufacturerFromRepository(manufacturerKey);
  await embedResourcesIntoFixtureJson(fixtureJson);
  return new Fixture(manufacturer, fixtureKey, fixtureJson);
}
async function manufacturerFromRepository(manufacturerKey) {
  const manufacturers = await importJson("../fixtures/manufacturers.json", globalThis._importMeta_.url);
  return new Manufacturer(manufacturerKey, manufacturers[manufacturerKey]);
}
async function embedResourcesIntoFixtureJson(fixtureJson) {
  if ("wheels" in fixtureJson) {
    for (const wheel of Object.values(fixtureJson.wheels)) {
      for (const slot of wheel.slots) {
        if (typeof slot.resource === "string") {
          slot.resource = await getResourceFromString(slot.resource);
        }
      }
    }
  }
}
async function getResourceFromString(resourceName) {
  const { type, key, alias } = await resolveResourceName(resourceName);
  const resourceBaseUrl = new URL(`../resources/${type}/`, globalThis._importMeta_.url);
  const resourceUrl = new URL(`${key}.json`, resourceBaseUrl);
  let resourceData;
  try {
    resourceData = await importJson(resourceUrl);
  } catch (error) {
    throw error instanceof SyntaxError ? new Error(`Resource file '${fileURLToPath$1(resourceUrl)}' could not be parsed as JSON.`) : new Error(`Resource '${resourceName}' not found.`);
  }
  resourceData.key = key;
  resourceData.type = type;
  resourceData.alias = alias;
  resourceData.image = await getImageForResource(type, resourceBaseUrl, key);
  delete resourceData.$schema;
  return resourceData;
}
async function resolveResourceName(resourceName) {
  const [type, ...remainingParts] = resourceName.split("/");
  if (remainingParts[0] === "aliases") {
    const aliasFileName = remainingParts[1];
    const aliasKey = remainingParts.slice(2).join("/");
    const aliasesFilePath = `resources/${type}/aliases/${aliasFileName}.json`;
    let aliases;
    try {
      aliases = await importJson(`../${aliasesFilePath}`, globalThis._importMeta_.url);
    } catch {
      throw new Error(`Resource aliases file '${aliasesFilePath}' not found.`);
    }
    if (!(aliasKey in aliases)) {
      throw new Error(`Resource alias '${aliasKey}' not defined in file '${aliasesFilePath}'.`);
    }
    return {
      type,
      key: aliases[aliasKey],
      alias: `${aliasFileName}/${aliasKey}`
    };
  }
  return {
    type,
    key: remainingParts.join("/"),
    alias: null
  };
}
const resourceFileFormats = [
  {
    extension: "svg",
    mimeType: "image/svg+xml;charset=utf-8",
    encoding: "utf-8"
  },
  {
    extension: "png",
    mimeType: "image/png",
    encoding: "base64"
  }
];
async function getImageForResource(type, baseUrl, key) {
  for (const { extension, mimeType, encoding } of resourceFileFormats) {
    try {
      let data = await readFile$1(new URL(`${key}.${extension}`, baseUrl), encoding);
      if (extension === "svg") {
        data = data.replaceAll(/[\t\n\r]/gim, "").replaceAll(/\s\s+/g, " ").replaceAll(/'/gim, String.raw`\i`).replaceAll(/<!--(.*(?=-->))-->/gim, "");
      }
      return { mimeType, extension, data, encoding };
    } catch {
    }
  }
  if (type === "gobos") {
    const fileExtensions = resourceFileFormats.map(({ extension }) => extension).join(", ");
    throw new Error(`Expected gobo image for resource '${fileURLToPath$1(new URL(key, baseUrl))}' not found (supported file extensions: ${fileExtensions}).`);
  }
  return void 0;
}

async function createFeedbackIssue({ request }) {
  const {
    type,
    context,
    location,
    helpWanted,
    message,
    githubUsername
  } = request.requestBody;
  let title;
  const issueContentData = {};
  const labels = ["via-editor"];
  if (type === "plugin") {
    title = `Feedback for plugin \`${context}\``;
    labels.push("component-plugin");
  } else {
    title = `Feedback for fixture \`${context}\``;
    labels.push("component-fixture");
    const [manufacturerKey, fixtureKey] = context.split("/");
    const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);
    issueContentData.Manufacturer = fixture.manufacturer.name;
    issueContentData.Fixture = `[${fixture.name}](${fixture.url})`;
  }
  issueContentData["Problem location"] = location;
  issueContentData["Problem description"] = helpWanted;
  issueContentData.Message = message;
  const lines = Object.entries(issueContentData).filter(
    ([key, value]) => value !== null
  ).map(([key, value]) => {
    const separator = value.includes("\n") ? "\n" : " ";
    return `**${key}**:${separator}${value}`;
  });
  if (githubUsername) {
    const isValidUsername = /^[\dA-Za-z]+$/.test(githubUsername);
    const githubUsernameMarkdown = isValidUsername ? `@${githubUsername}` : `**${githubUsername}**`;
    lines.push(`
Thank you ${githubUsernameMarkdown}!`);
  }
  let issueUrl;
  let error;
  try {
    issueUrl = await createIssue(title, lines.join("\n"), labels);
    console.log(`Created issue at ${issueUrl}`);
  } catch (createIssueError) {
    error = createIssueError.message;
  }
  return {
    statusCode: 201,
    body: {
      issueUrl,
      error
    }
  };
}

var $schema$6 = "http://json-schema.org/draft-07/schema#";
var $id$6 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json";
var version$2 = "12.5.0";
var type$5 = "object";
var properties$3 = {
	$schema: {
		"const": "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json"
	}
};
var required$2 = [
	"$schema"
];
var propertyNames = {
	$comment: "manufacturer key",
	type: "string",
	pattern: "^[a-z0-9\\-]+$|^\\$"
};
var additionalProperties$3 = {
	type: "object",
	properties: {
		name: {
			$ref: "definitions.json#/nonEmptyString"
		},
		comment: {
			$ref: "definitions.json#/nonEmptyMultilineString"
		},
		website: {
			$ref: "definitions.json#/urlString"
		},
		rdmId: {
			type: "integer",
			minimum: 1,
			maximum: 32767
		}
	},
	required: [
		"name"
	],
	additionalProperties: false
};
const require$$0 = {
	$schema: $schema$6,
	$id: $id$6,
	version: version$2,
	type: type$5,
	properties: properties$3,
	required: required$2,
	propertyNames: propertyNames,
	additionalProperties: additionalProperties$3
};

var $schema$5 = "http://json-schema.org/draft-07/schema#";
var $id$5 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture-redirect.json";
var version$1 = "12.5.0";
var type$4 = "object";
var properties$2 = {
	$schema: {
		"const": "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture-redirect.json"
	},
	name: {
		description: "unique in manufacturer",
		$ref: "definitions.json#/nonEmptyString"
	},
	redirectTo: {
		type: "string",
		pattern: "^[a-z0-9\\-]+/[a-z0-9\\-]+$"
	},
	reason: {
		"enum": [
			"FixtureRenamed",
			"SameAsDifferentBrand"
		]
	}
};
var required$1 = [
	"$schema",
	"name",
	"redirectTo",
	"reason"
];
var additionalProperties$2 = false;
const require$$1 = {
	$schema: $schema$5,
	$id: $id$5,
	version: version$1,
	type: type$4,
	properties: properties$2,
	required: required$1,
	additionalProperties: additionalProperties$2
};

var $schema$4 = "http://json-schema.org/draft-07/schema#";
var $id$4 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json";
var version = "12.5.0";
var type$3 = "object";
var properties$1 = {
	$schema: {
		"const": "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json"
	},
	name: {
		description: "unique in manufacturer",
		$ref: "definitions.json#/nonEmptyString"
	},
	shortName: {
		description: "unique globally; if not set: use name",
		$ref: "definitions.json#/nonEmptyString"
	},
	categories: {
		type: "array",
		description: "most important category first",
		minItems: 1,
		uniqueItems: true,
		items: {
			"enum": [
				"Barrel Scanner",
				"Blinder",
				"Color Changer",
				"Dimmer",
				"Effect",
				"Fan",
				"Flower",
				"Hazer",
				"Laser",
				"Matrix",
				"Moving Head",
				"Pixel Bar",
				"Scanner",
				"Smoke",
				"Stand",
				"Strobe",
				"Other"
			]
		}
	},
	meta: {
		type: "object",
		properties: {
			authors: {
				type: "array",
				minItems: 1,
				uniqueItems: true,
				items: {
					$ref: "definitions.json#/nonEmptyString"
				}
			},
			createDate: {
				$ref: "definitions.json#/isoDateString"
			},
			lastModifyDate: {
				$ref: "definitions.json#/isoDateString"
			},
			importPlugin: {
				type: "object",
				properties: {
					plugin: {
						$ref: "definitions.json#/nonEmptyString"
					},
					date: {
						$ref: "definitions.json#/isoDateString"
					},
					comment: {
						$ref: "definitions.json#/nonEmptyMultilineString"
					}
				},
				required: [
					"plugin",
					"date"
				],
				additionalProperties: false
			}
		},
		required: [
			"authors",
			"createDate",
			"lastModifyDate"
		],
		additionalProperties: false
	},
	comment: {
		$ref: "definitions.json#/nonEmptyMultilineString"
	},
	links: {
		type: "object",
		properties: {
			manual: {
				$ref: "definitions.json#/urlArray"
			},
			productPage: {
				$ref: "definitions.json#/urlArray"
			},
			video: {
				$ref: "definitions.json#/urlArray"
			},
			other: {
				$ref: "definitions.json#/urlArray"
			}
		},
		anyOf: [
			{
				required: [
					"manual"
				]
			},
			{
				required: [
					"productPage"
				]
			},
			{
				required: [
					"video"
				]
			},
			{
				required: [
					"other"
				]
			}
		],
		additionalProperties: false
	},
	helpWanted: {
		$ref: "definitions.json#/nonEmptyString"
	},
	rdm: {
		type: "object",
		properties: {
			modelId: {
				type: "integer",
				minimum: 0,
				maximum: 65535
			},
			softwareVersion: {
				$ref: "definitions.json#/nonEmptyString"
			}
		},
		required: [
			"modelId"
		],
		additionalProperties: false
	},
	physical: {
		type: "object",
		minProperties: 1,
		properties: {
			dimensions: {
				$ref: "definitions.json#/dimensionsXYZ"
			},
			weight: {
				description: "in kg",
				type: "number",
				exclusiveMinimum: 0
			},
			power: {
				description: "in W",
				type: "number",
				exclusiveMinimum: 0
			},
			powerConnectors: {
				type: "object",
				minProperties: 1,
				additionalProperties: false,
				properties: {
					"IEC C13": {
						$ref: "definitions.json#/powerConnectorType"
					},
					"IEC C19": {
						type: "string",
						"const": "input only"
					},
					powerCON: {
						$ref: "definitions.json#/powerConnectorType"
					},
					"powerCON TRUE1": {
						$ref: "definitions.json#/powerConnectorType"
					},
					"powerCON TRUE1 TOP": {
						$ref: "definitions.json#/powerConnectorType"
					},
					"powerCON 32 A": {
						type: "string",
						"const": "input only"
					},
					Hardwired: {
						$ref: "definitions.json#/powerConnectorType"
					},
					Proprietary: {
						$ref: "definitions.json#/powerConnectorType"
					}
				}
			},
			DMXconnector: {
				$comment: "additions are welcome",
				"enum": [
					"3-pin",
					"3-pin (swapped +/-)",
					"3-pin XLR IP65",
					"5-pin",
					"5-pin XLR IP65",
					"3-pin and 5-pin",
					"3.5mm stereo jack",
					"RJ45"
				]
			},
			bulb: {
				type: "object",
				minProperties: 1,
				properties: {
					type: {
						description: "e.g. 'LED'",
						$ref: "definitions.json#/nonEmptyString"
					},
					colorTemperature: {
						description: "in K",
						type: "number",
						exclusiveMinimum: 0
					},
					lumens: {
						type: "number",
						exclusiveMinimum: 0
					}
				},
				additionalProperties: false
			},
			lens: {
				type: "object",
				minProperties: 1,
				properties: {
					name: {
						description: "e.g. 'PC', 'Fresnel'",
						$ref: "definitions.json#/nonEmptyString"
					},
					degreesMinMax: {
						type: "array",
						minItems: 2,
						maxItems: 2,
						items: {
							type: "number",
							minimum: 0,
							maximum: 360
						}
					}
				},
				additionalProperties: false
			},
			matrixPixels: {
				type: "object",
				minProperties: 1,
				properties: {
					dimensions: {
						$ref: "definitions.json#/dimensionsXYZ"
					},
					spacing: {
						$ref: "definitions.json#/dimensionsXYZ"
					}
				},
				additionalProperties: false
			}
		},
		additionalProperties: false
	},
	matrix: {
		$ref: "matrix.json#"
	},
	wheels: {
		type: "object",
		minProperties: 1,
		propertyNames: {
			$comment: "wheel names",
			$ref: "definitions.json#/nonEmptyString"
		},
		additionalProperties: {
			type: "object",
			properties: {
				direction: {
					"enum": [
						"CW",
						"CCW"
					]
				},
				slots: {
					type: "array",
					minItems: 2,
					items: {
						$ref: "wheel-slot.json#"
					}
				}
			},
			required: [
				"slots"
			],
			additionalProperties: false
		}
	},
	availableChannels: {
		type: "object",
		minProperties: 1,
		propertyNames: {
			$comment: "channel keys",
			$ref: "definitions.json#/noVariablesString"
		},
		additionalProperties: {
			$ref: "channel.json#"
		}
	},
	templateChannels: {
		type: "object",
		minProperties: 1,
		propertyNames: {
			$comment: "template channel keys",
			$ref: "definitions.json#/variablePixelKeyString"
		},
		additionalProperties: {
			$ref: "channel.json#"
		}
	},
	modes: {
		type: "array",
		minItems: 1,
		items: {
			type: "object",
			properties: {
				name: {
					$ref: "definitions.json#/modeNameString"
				},
				shortName: {
					$ref: "definitions.json#/modeNameString"
				},
				rdmPersonalityIndex: {
					type: "integer",
					minimum: 1
				},
				physical: {
					$ref: "#/properties/physical"
				},
				channels: {
					type: "array",
					minItems: 1,
					items: {
						oneOf: [
							{
								$comment: "for unused channels",
								type: "null"
							},
							{
								$comment: "normal channel keys, resolved template channel keys or channel alias keys",
								$ref: "definitions.json#/noVariablesString"
							},
							{
								$comment: "matrix channel insert block",
								type: "object",
								properties: {
									insert: {
										"const": "matrixChannels"
									},
									repeatFor: {
										oneOf: [
											{
												"enum": [
													"eachPixelABC",
													"eachPixelXYZ",
													"eachPixelXZY",
													"eachPixelYXZ",
													"eachPixelYZX",
													"eachPixelZXY",
													"eachPixelZYX",
													"eachPixelGroup"
												]
											},
											{
												type: "array",
												minItems: 1,
												uniqueItems: true,
												items: {
													$comment: "pixel key or pixel group key",
													$ref: "definitions.json#/noVariablesString"
												}
											}
										]
									},
									channelOrder: {
										"enum": [
											"perPixel",
											"perChannel"
										]
									},
									templateChannels: {
										type: "array",
										minItems: 1,
										items: {
											oneOf: [
												{
													$comment: "for unused channels",
													type: "null"
												},
												{
													$comment: "template channel key or template channel alias key",
													$ref: "definitions.json#/variablePixelKeyString"
												}
											]
										}
									}
								},
								required: [
									"insert",
									"repeatFor",
									"channelOrder",
									"templateChannels"
								],
								additionalProperties: false
							}
						]
					}
				}
			},
			required: [
				"name",
				"channels"
			],
			additionalProperties: false
		}
	}
};
var dependencies$1 = {
	matrix: [
		"templateChannels"
	],
	templateChannels: [
		"matrix"
	]
};
var required = [
	"$schema",
	"name",
	"categories",
	"meta",
	"modes"
];
var allOf$1 = [
	{
		"if": {
			properties: {
				modes: {
					contains: {
						required: [
							"rdmPersonalityIndex"
						]
					}
				}
			}
		},
		then: {
			required: [
				"rdm"
			]
		}
	},
	{
		anyOf: [
			{
				required: [
					"availableChannels"
				]
			},
			{
				required: [
					"templateChannels"
				]
			}
		]
	}
];
var additionalProperties$1 = false;
const require$$2 = {
	$schema: $schema$4,
	$id: $id$4,
	version: version,
	type: type$3,
	properties: properties$1,
	dependencies: dependencies$1,
	required: required,
	allOf: allOf$1,
	additionalProperties: additionalProperties$1
};

var $schema$3 = "http://json-schema.org/draft-07/schema#";
var $id$3 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/channel.json";
var $comment$3 = "This file is used by another schema file and should not be used directly as a JSON schema.";
var type$2 = "object";
var properties = {
	name: {
		description: "if not set: use channel key",
		$ref: "definitions.json#/nonEmptyString"
	},
	fineChannelAliases: {
		type: "array",
		minItems: 1,
		uniqueItems: true,
		items: {
			oneOf: [
				{
					$ref: "definitions.json#/noVariablesString"
				},
				{
					$ref: "definitions.json#/variablePixelKeyString",
					$comment: "only in template channels"
				}
			]
		}
	},
	dmxValueResolution: {
		"enum": [
			"8bit",
			"16bit",
			"24bit"
		]
	},
	defaultValue: {
		oneOf: [
			{
				$ref: "definitions.json#/units/dmxValue"
			},
			{
				$ref: "definitions.json#/units/dmxValuePercent"
			}
		]
	},
	highlightValue: {
		oneOf: [
			{
				$ref: "definitions.json#/units/dmxValue"
			},
			{
				$ref: "definitions.json#/units/dmxValuePercent"
			}
		]
	},
	constant: {
		type: "boolean"
	},
	precedence: {
		"enum": [
			"LTP",
			"HTP"
		]
	},
	capability: {
		allOf: [
			{
				$ref: "capability.json#"
			}
		],
		not: {
			anyOf: [
				{
					required: [
						"dmxRange"
					]
				},
				{
					required: [
						"switchChannels"
					]
				}
			]
		}
	},
	capabilities: {
		type: "array",
		minItems: 2,
		uniqueItems: true,
		items: {
			allOf: [
				{
					$ref: "capability.json#"
				}
			],
			required: [
				"dmxRange"
			]
		}
	}
};
var dependencies = {
	dmxValueResolution: [
		"fineChannelAliases"
	]
};
var oneOf$2 = [
	{
		required: [
			"capability"
		]
	},
	{
		required: [
			"capabilities"
		]
	}
];
var allOf = [
	{
		"if": {
			$comment: "one capability sets switchChannels",
			properties: {
				capabilities: {
					contains: {
						required: [
							"switchChannels"
						]
					}
				}
			},
			required: [
				"capabilities"
			]
		},
		then: {
			$comment: "defaultValue must be set and all capabilities have to set switchChannels",
			required: [
				"defaultValue"
			],
			properties: {
				capabilities: {
					items: {
						required: [
							"switchChannels"
						]
					}
				}
			}
		}
	},
	{
		"if": {
			$comment: "channel contains only one NoFunction capability",
			properties: {
				capability: {
					properties: {
						type: {
							"const": "NoFunction"
						}
					}
				}
			},
			required: [
				"capability"
			]
		},
		then: {
			$comment: "fineChannelAliases must not be set",
			not: {
				required: [
					"fineChannelAliases"
				]
			}
		}
	}
];
var additionalProperties = false;
const require$$3 = {
	$schema: $schema$3,
	$id: $id$3,
	$comment: $comment$3,
	type: type$2,
	properties: properties,
	dependencies: dependencies,
	oneOf: oneOf$2,
	allOf: allOf,
	additionalProperties: additionalProperties
};

var $schema$2 = "http://json-schema.org/draft-07/schema#";
var $id$2 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/capability.json";
var $comment$2 = "This file is used by another schema file and should not be used directly as a JSON schema.";
var definitions = {
	dmxRange: {
		type: "array",
		minItems: 2,
		maxItems: 2,
		items: {
			$ref: "definitions.json#/units/dmxValue"
		}
	},
	menuClick: {
		"enum": [
			"start",
			"center",
			"end",
			"hidden"
		]
	},
	switchChannels: {
		type: "object",
		minProperties: 1,
		propertyNames: {
			$comment: "switching channel alias keys",
			oneOf: [
				{
					$ref: "definitions.json#/noVariablesString"
				},
				{
					$ref: "definitions.json#/variablePixelKeyString"
				}
			]
		},
		additionalProperties: {
			oneOf: [
				{
					$comment: "channel key or channel alias key",
					$ref: "definitions.json#/noVariablesString"
				},
				{
					$comment: "template channel key or template channel alias key",
					$ref: "definitions.json#/variablePixelKeyString"
				}
			]
		}
	}
};
var type$1 = "object";
var discriminator$1 = {
	propertyName: "type"
};
var oneOf$1 = [
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "NoFunction"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "ShutterStrobe"
			},
			shutterEffect: {
				"enum": [
					"Open",
					"Closed",
					"Strobe",
					"Pulse",
					"RampUp",
					"RampDown",
					"RampUpDown",
					"Lightning",
					"Spikes",
					"Burst"
				]
			},
			soundControlled: {
				type: "boolean"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			duration: {
				$ref: "definitions.json#/entities/time"
			},
			durationStart: {
				$ref: "definitions.json#/entities/time"
			},
			durationEnd: {
				$ref: "definitions.json#/entities/time"
			},
			randomTiming: {
				type: "boolean"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"shutterEffect"
		],
		not: {
			anyOf: [
				{
					required: [
						"speed",
						"speedStart"
					]
				},
				{
					required: [
						"duration",
						"durationStart"
					]
				}
			]
		},
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			durationStart: [
				"durationEnd"
			],
			durationEnd: [
				"durationStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "StrobeSpeed"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "StrobeDuration"
			},
			duration: {
				$ref: "definitions.json#/entities/time"
			},
			durationStart: {
				$ref: "definitions.json#/entities/time"
			},
			durationEnd: {
				$ref: "definitions.json#/entities/time"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"duration"
				]
			},
			{
				required: [
					"durationStart"
				]
			}
		],
		dependencies: {
			durationStart: [
				"durationEnd"
			],
			durationEnd: [
				"durationStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Intensity"
			},
			brightness: {
				$ref: "definitions.json#/entities/brightness"
			},
			brightnessStart: {
				$ref: "definitions.json#/entities/brightness"
			},
			brightnessEnd: {
				$ref: "definitions.json#/entities/brightness"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		not: {
			required: [
				"brightness",
				"brightnessStart"
			]
		},
		dependencies: {
			brightnessStart: [
				"brightnessEnd"
			],
			brightnessEnd: [
				"brightnessStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "ColorIntensity"
			},
			color: {
				"enum": [
					"Red",
					"Green",
					"Blue",
					"Cyan",
					"Magenta",
					"Yellow",
					"Amber",
					"White",
					"Warm White",
					"Cold White",
					"UV",
					"Lime",
					"Indigo"
				]
			},
			brightness: {
				$ref: "definitions.json#/entities/brightness"
			},
			brightnessStart: {
				$ref: "definitions.json#/entities/brightness"
			},
			brightnessEnd: {
				$ref: "definitions.json#/entities/brightness"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"color"
		],
		not: {
			required: [
				"brightness",
				"brightnessStart"
			]
		},
		dependencies: {
			brightnessStart: [
				"brightnessEnd"
			],
			brightnessEnd: [
				"brightnessStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "ColorPreset"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			colors: {
				type: "array",
				minItems: 1,
				items: {
					$ref: "definitions.json#/colorString"
				}
			},
			colorsStart: {
				type: "array",
				minItems: 1,
				items: {
					$ref: "definitions.json#/colorString"
				}
			},
			colorsEnd: {
				type: "array",
				minItems: 1,
				items: {
					$ref: "definitions.json#/colorString"
				}
			},
			colorTemperature: {
				$ref: "definitions.json#/entities/colorTemperature"
			},
			colorTemperatureStart: {
				$ref: "definitions.json#/entities/colorTemperature"
			},
			colorTemperatureEnd: {
				$ref: "definitions.json#/entities/colorTemperature"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		not: {
			anyOf: [
				{
					required: [
						"colors",
						"colorsStart"
					]
				},
				{
					required: [
						"colorTemperature",
						"colorTemperatureStart"
					]
				}
			]
		},
		dependencies: {
			colorsStart: [
				"colorsEnd"
			],
			colorsEnd: [
				"colorsStart"
			],
			colorTemperatureStart: [
				"colorTemperatureEnd"
			],
			colorTemperatureEnd: [
				"colorTemperatureStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "ColorTemperature"
			},
			colorTemperature: {
				$ref: "definitions.json#/entities/colorTemperature"
			},
			colorTemperatureStart: {
				$ref: "definitions.json#/entities/colorTemperature"
			},
			colorTemperatureEnd: {
				$ref: "definitions.json#/entities/colorTemperature"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"colorTemperature"
				]
			},
			{
				required: [
					"colorTemperatureStart"
				]
			}
		],
		dependencies: {
			colorTemperatureStart: [
				"colorTemperatureEnd"
			],
			colorTemperatureEnd: [
				"colorTemperatureStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Pan"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "PanContinuous"
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Tilt"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "TiltContinuous"
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "PanTiltSpeed"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			duration: {
				$ref: "definitions.json#/entities/time"
			},
			durationStart: {
				$ref: "definitions.json#/entities/time"
			},
			durationEnd: {
				$ref: "definitions.json#/entities/time"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			},
			{
				required: [
					"duration"
				]
			},
			{
				required: [
					"durationStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			durationStart: [
				"durationEnd"
			],
			durationEnd: [
				"durationStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "WheelSlot"
			},
			wheel: {
				$ref: "definitions.json#/nonEmptyString"
			},
			slotNumber: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			slotNumberStart: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			slotNumberEnd: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"slotNumber"
				]
			},
			{
				required: [
					"slotNumberStart"
				]
			}
		],
		dependencies: {
			slotNumberStart: [
				"slotNumberEnd"
			],
			slotNumberEnd: [
				"slotNumberStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "WheelShake"
			},
			wheel: {
			},
			isShaking: {
				"enum": [
					"wheel",
					"slot"
				]
			},
			slotNumber: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			slotNumberStart: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			slotNumberEnd: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			shakeSpeed: {
				$ref: "definitions.json#/entities/speed"
			},
			shakeSpeedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			shakeSpeedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			shakeAngle: {
				$ref: "definitions.json#/entities/swingAngle"
			},
			shakeAngleStart: {
				$ref: "definitions.json#/entities/swingAngle"
			},
			shakeAngleEnd: {
				$ref: "definitions.json#/entities/swingAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		not: {
			anyOf: [
				{
					required: [
						"slotNumber",
						"slotNumberStart"
					]
				},
				{
					required: [
						"shakeSpeed",
						"shakeSpeedStart"
					]
				},
				{
					required: [
						"shakeAngle",
						"shakeAngleStart"
					]
				}
			]
		},
		dependencies: {
			shakeSpeedStart: [
				"shakeSpeedEnd"
			],
			shakeSpeedEnd: [
				"shakeSpeedStart"
			],
			shakeAngleStart: [
				"shakeAngleEnd"
			],
			shakeAngleEnd: [
				"shakeAngleStart"
			],
			slotNumberStart: [
				"slotNumberEnd"
			],
			slotNumberEnd: [
				"slotNumberStart"
			]
		},
		"if": {
			$comment: "slotNumber is set",
			anyOf: [
				{
					required: [
						"slotNumber"
					]
				},
				{
					required: [
						"slotNumberStart"
					]
				}
			]
		},
		then: {
			$comment: "wheel must be a single wheel",
			properties: {
				wheel: {
					$ref: "definitions.json#/nonEmptyString"
				}
			}
		},
		"else": {
			$comment: "wheel can be a single wheel or multiple wheels",
			properties: {
				wheel: {
					oneOf: [
						{
							$ref: "definitions.json#/nonEmptyString"
						},
						{
							type: "array",
							uniqueItems: true,
							minItems: 2,
							items: {
								$ref: "definitions.json#/nonEmptyString"
							}
						}
					]
				}
			}
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "WheelSlotRotation"
			},
			wheel: {
			},
			slotNumber: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			slotNumberStart: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			slotNumberEnd: {
				$ref: "definitions.json#/entities/slotNumber"
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			},
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		not: {
			required: [
				"slotNumber",
				"slotNumberStart"
			]
		},
		dependencies: {
			slotNumberStart: [
				"slotNumberEnd"
			],
			slotNumberEnd: [
				"slotNumberStart"
			],
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		"if": {
			$comment: "slotNumber is set",
			anyOf: [
				{
					required: [
						"slotNumber"
					]
				},
				{
					required: [
						"slotNumberStart"
					]
				}
			]
		},
		then: {
			$comment: "wheel must be a single wheel",
			properties: {
				wheel: {
					$ref: "definitions.json#/nonEmptyString"
				}
			}
		},
		"else": {
			$comment: "wheel can be a single wheel or multiple wheels",
			properties: {
				wheel: {
					oneOf: [
						{
							$ref: "definitions.json#/nonEmptyString"
						},
						{
							type: "array",
							uniqueItems: true,
							minItems: 2,
							items: {
								$ref: "definitions.json#/nonEmptyString"
							}
						}
					]
				}
			}
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "WheelRotation"
			},
			wheel: {
				oneOf: [
					{
						$ref: "definitions.json#/nonEmptyString"
					},
					{
						type: "array",
						uniqueItems: true,
						minItems: 2,
						items: {
							$ref: "definitions.json#/nonEmptyString"
						}
					}
				]
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			},
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Effect"
			},
			effectName: {
				$ref: "definitions.json#/nonEmptyString"
			},
			effectPreset: {
				$ref: "definitions.json#/effectPreset"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			duration: {
				$ref: "definitions.json#/entities/time"
			},
			durationStart: {
				$ref: "definitions.json#/entities/time"
			},
			durationEnd: {
				$ref: "definitions.json#/entities/time"
			},
			parameter: {
				$ref: "definitions.json#/entities/parameter"
			},
			parameterStart: {
				$ref: "definitions.json#/entities/parameter"
			},
			parameterEnd: {
				$ref: "definitions.json#/entities/parameter"
			},
			soundControlled: {
				type: "boolean"
			},
			soundSensitivity: {
				$ref: "definitions.json#/entities/percent"
			},
			soundSensitivityStart: {
				$ref: "definitions.json#/entities/percent"
			},
			soundSensitivityEnd: {
				$ref: "definitions.json#/entities/percent"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"effectName"
				]
			},
			{
				required: [
					"effectPreset"
				]
			}
		],
		not: {
			anyOf: [
				{
					required: [
						"speed",
						"speedStart"
					]
				},
				{
					required: [
						"duration",
						"durationStart"
					]
				},
				{
					required: [
						"parameter",
						"parameterStart"
					]
				},
				{
					required: [
						"soundSensitivity",
						"soundSensitivityStart"
					]
				}
			]
		},
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			durationStart: [
				"durationEnd"
			],
			durationEnd: [
				"durationStart"
			],
			parameterStart: [
				"parameterEnd"
			],
			parameterEnd: [
				"parameterStart"
			],
			soundSensitivityStart: [
				"soundSensitivityEnd"
			],
			soundSensitivityEnd: [
				"soundSensitivityStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "EffectSpeed"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "EffectDuration"
			},
			duration: {
				$ref: "definitions.json#/entities/time"
			},
			durationStart: {
				$ref: "definitions.json#/entities/time"
			},
			durationEnd: {
				$ref: "definitions.json#/entities/time"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"duration"
				]
			},
			{
				required: [
					"durationStart"
				]
			}
		],
		dependencies: {
			durationStart: [
				"durationEnd"
			],
			durationEnd: [
				"durationStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "EffectParameter"
			},
			parameter: {
				$ref: "definitions.json#/entities/parameter"
			},
			parameterStart: {
				$ref: "definitions.json#/entities/parameter"
			},
			parameterEnd: {
				$ref: "definitions.json#/entities/parameter"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"parameter"
				]
			},
			{
				required: [
					"parameterStart"
				]
			}
		],
		dependencies: {
			parameterStart: [
				"parameterEnd"
			],
			parameterEnd: [
				"parameterStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "SoundSensitivity"
			},
			soundSensitivity: {
				$ref: "definitions.json#/entities/percent"
			},
			soundSensitivityStart: {
				$ref: "definitions.json#/entities/percent"
			},
			soundSensitivityEnd: {
				$ref: "definitions.json#/entities/percent"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"soundSensitivity"
				]
			},
			{
				required: [
					"soundSensitivityStart"
				]
			}
		],
		dependencies: {
			soundSensitivityStart: [
				"soundSensitivityEnd"
			],
			soundSensitivityEnd: [
				"soundSensitivityStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "BeamAngle"
			},
			angle: {
				$ref: "definitions.json#/entities/beamAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/beamAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/beamAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "BeamPosition"
			},
			horizontalAngle: {
				$ref: "definitions.json#/entities/horizontalAngle"
			},
			horizontalAngleStart: {
				$ref: "definitions.json#/entities/horizontalAngle"
			},
			horizontalAngleEnd: {
				$ref: "definitions.json#/entities/horizontalAngle"
			},
			verticalAngle: {
				$ref: "definitions.json#/entities/verticalAngle"
			},
			verticalAngleStart: {
				$ref: "definitions.json#/entities/verticalAngle"
			},
			verticalAngleEnd: {
				$ref: "definitions.json#/entities/verticalAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		anyOf: [
			{
				oneOf: [
					{
						required: [
							"horizontalAngle"
						]
					},
					{
						required: [
							"horizontalAngleStart"
						]
					}
				]
			},
			{
				oneOf: [
					{
						required: [
							"verticalAngle"
						]
					},
					{
						required: [
							"verticalAngleStart"
						]
					}
				]
			}
		],
		dependencies: {
			horizontalAngleStart: [
				"horizontalAngleEnd"
			],
			horizontalAngleEnd: [
				"horizontalAngleStart"
			],
			verticalAngleStart: [
				"verticalAngleEnd"
			],
			verticalAngleEnd: [
				"verticalAngleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Focus"
			},
			distance: {
				$ref: "definitions.json#/entities/distance"
			},
			distanceStart: {
				$ref: "definitions.json#/entities/distance"
			},
			distanceEnd: {
				$ref: "definitions.json#/entities/distance"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"distance"
				]
			},
			{
				required: [
					"distanceStart"
				]
			}
		],
		dependencies: {
			distanceStart: [
				"distanceEnd"
			],
			distanceEnd: [
				"distanceStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Zoom"
			},
			angle: {
				$ref: "definitions.json#/entities/beamAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/beamAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/beamAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Iris"
			},
			openPercent: {
				$ref: "definitions.json#/entities/irisPercent"
			},
			openPercentStart: {
				$ref: "definitions.json#/entities/irisPercent"
			},
			openPercentEnd: {
				$ref: "definitions.json#/entities/irisPercent"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"openPercent"
				]
			},
			{
				required: [
					"openPercentStart"
				]
			}
		],
		dependencies: {
			openPercentStart: [
				"openPercentEnd"
			],
			openPercentEnd: [
				"openPercentStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "IrisEffect"
			},
			effectName: {
				$ref: "definitions.json#/nonEmptyString"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"effectName"
		],
		not: {
			required: [
				"speed",
				"speedStart"
			]
		},
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Frost"
			},
			frostIntensity: {
				$ref: "definitions.json#/entities/percent"
			},
			frostIntensityStart: {
				$ref: "definitions.json#/entities/percent"
			},
			frostIntensityEnd: {
				$ref: "definitions.json#/entities/percent"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"frostIntensity"
				]
			},
			{
				required: [
					"frostIntensityStart"
				]
			}
		],
		dependencies: {
			frostIntensityStart: [
				"frostIntensityEnd"
			],
			frostIntensityEnd: [
				"frostIntensityStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "FrostEffect"
			},
			effectName: {
				$ref: "definitions.json#/nonEmptyString"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"effectName"
		],
		not: {
			required: [
				"speed",
				"speedStart"
			]
		},
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Prism"
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		not: {
			anyOf: [
				{
					required: [
						"speed",
						"speedStart"
					]
				},
				{
					required: [
						"angle",
						"angleStart"
					]
				},
				{
					required: [
						"speed",
						"angle"
					]
				},
				{
					required: [
						"speed",
						"angleStart"
					]
				},
				{
					required: [
						"speedStart",
						"angle"
					]
				},
				{
					required: [
						"speedStart",
						"angleStart"
					]
				}
			]
		},
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "PrismRotation"
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			},
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "BladeInsertion"
			},
			blade: {
				oneOf: [
					{
						"enum": [
							"Top",
							"Right",
							"Bottom",
							"Left"
						]
					},
					{
						$ref: "definitions.json#/units/positiveInteger"
					}
				]
			},
			insertion: {
				$ref: "definitions.json#/entities/insertion"
			},
			insertionStart: {
				$ref: "definitions.json#/entities/insertion"
			},
			insertionEnd: {
				$ref: "definitions.json#/entities/insertion"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"blade"
		],
		oneOf: [
			{
				required: [
					"insertion"
				]
			},
			{
				required: [
					"insertionStart"
				]
			}
		],
		dependencies: {
			insertionStart: [
				"insertionEnd"
			],
			insertionEnd: [
				"insertionStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "BladeRotation"
			},
			blade: {
				oneOf: [
					{
						"enum": [
							"Top",
							"Right",
							"Bottom",
							"Left"
						]
					},
					{
						$ref: "definitions.json#/units/positiveInteger"
					}
				]
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"blade"
		],
		oneOf: [
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "BladeSystemRotation"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Fog"
			},
			fogType: {
				"enum": [
					"Fog",
					"Haze"
				]
			},
			fogOutput: {
				$ref: "definitions.json#/entities/fogOutput"
			},
			fogOutputStart: {
				$ref: "definitions.json#/entities/fogOutput"
			},
			fogOutputEnd: {
				$ref: "definitions.json#/entities/fogOutput"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		not: {
			required: [
				"fogOutput",
				"fogOutputStart"
			]
		},
		dependencies: {
			fogOutputStart: [
				"fogOutputEnd"
			],
			fogOutputEnd: [
				"fogOutputStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "FogOutput"
			},
			fogOutput: {
				$ref: "definitions.json#/entities/fogOutput"
			},
			fogOutputStart: {
				$ref: "definitions.json#/entities/fogOutput"
			},
			fogOutputEnd: {
				$ref: "definitions.json#/entities/fogOutput"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"fogOutput"
				]
			},
			{
				required: [
					"fogOutputStart"
				]
			}
		],
		dependencies: {
			fogOutputStart: [
				"fogOutputEnd"
			],
			fogOutputEnd: [
				"fogOutputStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "FogType"
			},
			fogType: {
				"enum": [
					"Fog",
					"Haze"
				]
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type",
			"fogType"
		],
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Rotation"
			},
			speed: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/rotationSpeed"
			},
			angle: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleStart: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			angleEnd: {
				$ref: "definitions.json#/entities/rotationAngle"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			},
			{
				required: [
					"angle"
				]
			},
			{
				required: [
					"angleStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			],
			angleStart: [
				"angleEnd"
			],
			angleEnd: [
				"angleStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Speed"
			},
			speed: {
				$ref: "definitions.json#/entities/speed"
			},
			speedStart: {
				$ref: "definitions.json#/entities/speed"
			},
			speedEnd: {
				$ref: "definitions.json#/entities/speed"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"speed"
				]
			},
			{
				required: [
					"speedStart"
				]
			}
		],
		dependencies: {
			speedStart: [
				"speedEnd"
			],
			speedEnd: [
				"speedStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Time"
			},
			time: {
				$ref: "definitions.json#/entities/time"
			},
			timeStart: {
				$ref: "definitions.json#/entities/time"
			},
			timeEnd: {
				$ref: "definitions.json#/entities/time"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		oneOf: [
			{
				required: [
					"time"
				]
			},
			{
				required: [
					"timeStart"
				]
			}
		],
		dependencies: {
			timeStart: [
				"timeEnd"
			],
			timeEnd: [
				"timeStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Maintenance"
			},
			parameter: {
				$ref: "definitions.json#/entities/parameter"
			},
			parameterStart: {
				$ref: "definitions.json#/entities/parameter"
			},
			parameterEnd: {
				$ref: "definitions.json#/entities/parameter"
			},
			hold: {
				$ref: "definitions.json#/entities/time"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		not: {
			required: [
				"parameter",
				"parameterStart"
			]
		},
		dependencies: {
			parameterStart: [
				"parameterEnd"
			],
			parameterEnd: [
				"parameterStart"
			]
		},
		additionalProperties: false
	},
	{
		properties: {
			dmxRange: {
				$ref: "#/definitions/dmxRange"
			},
			type: {
				"const": "Generic"
			},
			comment: {
				$ref: "definitions.json#/nonEmptyString"
			},
			helpWanted: {
				$ref: "definitions.json#/nonEmptyString"
			},
			menuClick: {
				$ref: "#/definitions/menuClick"
			},
			switchChannels: {
				$ref: "#/definitions/switchChannels"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	}
];
const require$$4 = {
	$schema: $schema$2,
	$id: $id$2,
	$comment: $comment$2,
	definitions: definitions,
	type: type$1,
	discriminator: discriminator$1,
	oneOf: oneOf$1
};

var $schema$1 = "http://json-schema.org/draft-07/schema#";
var $id$1 = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/wheel-slot.json";
var $comment$1 = "This file is used by another schema file and should not be used directly as a JSON schema.";
var type = "object";
var discriminator = {
	propertyName: "type"
};
var oneOf = [
	{
		properties: {
			type: {
				"const": "Open"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "Closed"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "Color"
			},
			name: {
				$ref: "definitions.json#/nonEmptyString"
			},
			colors: {
				type: "array",
				minItems: 1,
				items: {
					$ref: "definitions.json#/colorString"
				}
			},
			colorTemperature: {
				$ref: "definitions.json#/entities/colorTemperature"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "Gobo"
			},
			resource: {
				$ref: "definitions.json#/goboResourceString"
			},
			name: {
				$ref: "definitions.json#/nonEmptyString"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "Prism"
			},
			name: {
				$ref: "definitions.json#/nonEmptyString"
			},
			facets: {
				type: "integer",
				minimum: 2
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "Iris"
			},
			openPercent: {
				$ref: "definitions.json#/entities/irisPercent"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "Frost"
			},
			frostIntensity: {
				$ref: "definitions.json#/entities/percent"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "AnimationGoboStart"
			},
			name: {
				$ref: "definitions.json#/nonEmptyString"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	},
	{
		properties: {
			type: {
				"const": "AnimationGoboEnd"
			}
		},
		required: [
			"type"
		],
		additionalProperties: false
	}
];
const require$$5 = {
	$schema: $schema$1,
	$id: $id$1,
	$comment: $comment$1,
	type: type,
	discriminator: discriminator,
	oneOf: oneOf
};

var $schema = "http://json-schema.org/draft-07/schema#";
var $id = "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/definitions.json";
var $comment = "This file is used by another schema file and should not be used directly as a JSON schema.";
var nonEmptyString = {
	type: "string",
	pattern: "^[^\n]+$"
};
var noVariablesString = {
	type: "string",
	pattern: "^[^$\n]+$"
};
var variablePixelKeyString = {
	type: "string",
	pattern: "\\$pixelKey"
};
var nonEmptyMultilineString = {
	type: "string",
	minLength: 1
};
var modeNameString = {
	allOf: [
		{
			$ref: "#/nonEmptyString"
		},
		{
			pattern: "^((?!mode)(?!Mode).)*$"
		}
	]
};
var urlString = {
	type: "string",
	pattern: "^(ftp|http|https)://[^ \"]+$",
	format: "uri"
};
var urlArray = {
	type: "array",
	minItems: 1,
	uniqueItems: true,
	items: {
		$ref: "#/urlString"
	}
};
var isoDateString = {
	type: "string",
	pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
	format: "date"
};
var colorString = {
	type: "string",
	pattern: "^#[0-9a-f]{6}$",
	format: "color-hex"
};
var dimensionsXYZ = {
	description: "width, height, depth (in mm)",
	type: "array",
	minItems: 3,
	maxItems: 3,
	items: {
		type: "number",
		minimum: 0
	}
};
var effectPreset = {
	"enum": [
		"ColorJump",
		"ColorFade"
	]
};
var goboResourceString = {
	type: "string",
	pattern: "^gobos/[a-z0-9-]+$|^gobos/aliases/[a-z0-9_.-]+/"
};
var powerConnectorType = {
	"enum": [
		"input only",
		"output only",
		"input and output"
	]
};
var units = {
	number: {
		type: "number"
	},
	nonNegativeNumber: {
		type: "number",
		minimum: 0
	},
	positiveInteger: {
		type: "integer",
		minimum: 0,
		exclusiveMinimum: 0
	},
	dmxValue: {
		type: "integer",
		minimum: 0,
		$comment: "maximum depends on how many fine channels there are (255 if none, 65535 if one, etc.)"
	},
	dmxValuePercent: {
		type: "string",
		pattern: "^(([1-9][0-9]?|0)(\\.[0-9]+)?|100)%$"
	},
	percent: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?%$"
	},
	hertz: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?Hz$"
	},
	beatsPerMinute: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?bpm$"
	},
	roundsPerMinute: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?rpm$"
	},
	seconds: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?s$"
	},
	milliSeconds: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?ms$"
	},
	meters: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?m$"
	},
	lumens: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?lm$"
	},
	kelvin: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?K$"
	},
	volumePerMinute: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?m\\^3/min$"
	},
	degrees: {
		type: "string",
		pattern: "^-?[0-9]+(\\.[0-9]+)?deg$"
	}
};
var entities = {
	speed: {
		oneOf: [
			{
				$ref: "#/units/hertz"
			},
			{
				$ref: "#/units/beatsPerMinute"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"fast",
					"slow",
					"stop",
					"slow reverse",
					"fast reverse"
				]
			}
		]
	},
	rotationSpeed: {
		oneOf: [
			{
				$ref: "#/units/hertz"
			},
			{
				$ref: "#/units/roundsPerMinute"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"fast CW",
					"slow CW",
					"stop",
					"slow CCW",
					"fast CCW"
				]
			}
		]
	},
	time: {
		oneOf: [
			{
				$ref: "#/units/seconds"
			},
			{
				$ref: "#/units/milliSeconds"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"instant",
					"short",
					"long"
				]
			}
		]
	},
	distance: {
		oneOf: [
			{
				$ref: "#/units/meters"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"near",
					"far"
				]
			}
		]
	},
	brightness: {
		oneOf: [
			{
				$ref: "#/units/lumens"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"off",
					"dark",
					"bright"
				]
			}
		]
	},
	colorTemperature: {
		oneOf: [
			{
				$ref: "#/units/kelvin"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"warm",
					"CTO",
					"default",
					"cold",
					"CTB"
				]
			}
		]
	},
	fogOutput: {
		oneOf: [
			{
				$ref: "#/units/volumePerMinute"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"off",
					"weak",
					"strong"
				]
			}
		]
	},
	rotationAngle: {
		oneOf: [
			{
				$ref: "#/units/degrees"
			},
			{
				$ref: "#/units/percent"
			}
		]
	},
	beamAngle: {
		oneOf: [
			{
				$ref: "#/units/degrees"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"closed",
					"narrow",
					"wide"
				]
			}
		]
	},
	horizontalAngle: {
		oneOf: [
			{
				$ref: "#/units/degrees"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"left",
					"center",
					"right"
				]
			}
		]
	},
	verticalAngle: {
		oneOf: [
			{
				$ref: "#/units/degrees"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"top",
					"center",
					"bottom"
				]
			}
		]
	},
	swingAngle: {
		oneOf: [
			{
				$ref: "#/units/degrees"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"closed",
					"narrow",
					"wide"
				]
			}
		]
	},
	parameter: {
		oneOf: [
			{
				$ref: "#/units/number"
			},
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"off",
					"low",
					"high",
					"slow",
					"fast",
					"small",
					"big",
					"instant",
					"short",
					"long"
				]
			}
		]
	},
	slotNumber: {
		$ref: "#/units/nonNegativeNumber"
	},
	percent: {
		oneOf: [
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"off",
					"low",
					"high"
				]
			}
		]
	},
	insertion: {
		oneOf: [
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"out",
					"in"
				]
			}
		]
	},
	irisPercent: {
		oneOf: [
			{
				$ref: "#/units/percent"
			},
			{
				"enum": [
					"closed",
					"open"
				]
			}
		]
	}
};
const require$$6 = {
	$schema: $schema,
	$id: $id,
	$comment: $comment,
	nonEmptyString: nonEmptyString,
	noVariablesString: noVariablesString,
	variablePixelKeyString: variablePixelKeyString,
	nonEmptyMultilineString: nonEmptyMultilineString,
	modeNameString: modeNameString,
	urlString: urlString,
	urlArray: urlArray,
	isoDateString: isoDateString,
	colorString: colorString,
	dimensionsXYZ: dimensionsXYZ,
	effectPreset: effectPreset,
	goboResourceString: goboResourceString,
	powerConnectorType: powerConnectorType,
	units: units,
	entities: entities
};

/**
 * @fileoverview
 * There are some JSON files that need to be imported synchronously, but we
 * don't want to use the `--experimental-json-modules` command-line flag for
 * every `node` command. Thus, we require them all here in this CommonJS module
 * and re-export them for use in ECMAScript modules.
 * @see https://nodejs.org/docs/latest-v14.x/api/esm.html#esm_experimental_json_modules
 */

var manufacturersSchema = require$$0;
var fixtureRedirectSchema = require$$1;
var fixtureSchema = require$$2;
var channelSchema = require$$3;
var capabilitySchema = require$$4;
var wheelSlotSchema = require$$5;
var definitionsSchema = require$$6;

const fixtureProperties = fixtureSchema.properties;
const physicalProperties = fixtureProperties.physical.properties;
const capabilityTypes = Object.fromEntries(capabilitySchema.oneOf.map(
  (schema) => [schema.properties.type.const, schema]
));
const wheelSlotTypes = Object.fromEntries(wheelSlotSchema.oneOf.map(
  (schema) => [schema.properties.type.const, schema]
));
manufacturersSchema.additionalProperties.properties;
fixtureRedirectSchema.properties;
const linksProperties = fixtureProperties.links.properties;
physicalProperties.bulb.properties;
physicalProperties.lens.properties;
const modeProperties = fixtureProperties.modes.items.properties;
const channelProperties = channelSchema.properties;
capabilitySchema.definitions.dmxRange;
const schemaDefinitions = definitionsSchema;
definitionsSchema.units;
definitionsSchema.entities;

const ajv = new Ajv({
  verbose: true,
  strict: false,
  allErrors: true,
  discriminator: true
});
addFormats(ajv);
ajv.addKeyword("version");
ajv.addFormat("color-hex", true);
const loadSchemasPromise = (async () => {
  const schemas = await Promise.all([
    importJson("../schemas/capability.json", globalThis._importMeta_.url),
    importJson("../schemas/channel.json", globalThis._importMeta_.url),
    importJson("../schemas/definitions.json", globalThis._importMeta_.url),
    importJson("../schemas/fixture-redirect.json", globalThis._importMeta_.url),
    importJson("../schemas/fixture.json", globalThis._importMeta_.url),
    importJson("../schemas/gobo.json", globalThis._importMeta_.url),
    importJson("../schemas/manufacturers.json", globalThis._importMeta_.url),
    importJson("../schemas/matrix.json", globalThis._importMeta_.url),
    importJson("../schemas/plugin.json", globalThis._importMeta_.url),
    importJson("../schemas/wheel-slot.json", globalThis._importMeta_.url)
  ]);
  ajv.addSchema(schemas);
})();
async function getAjvValidator(schemaName) {
  await loadSchemasPromise;
  const schemaId = `https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/${schemaName}.json`;
  const validationFunction = ajv.getSchema(schemaId);
  if (!validationFunction) {
    throw new Error(`Schema '${schemaName}' not found.`);
  }
  return validationFunction;
}

let initialized = false;
let register;
let plugins;
async function checkFixture(manufacturerKey, fixtureKey, fixtureJson, uniqueValues = null) {
  if (!initialized) {
    register = await importJson("../fixtures/register.json", globalThis._importMeta_.url);
    plugins = await importJson("../plugins/plugins.json", globalThis._importMeta_.url);
    initialized = true;
  }
  const result = {
    errors: [],
    warnings: []
  };
  let fixture;
  const definedChannelKeys = /* @__PURE__ */ new Set();
  const usedChannelKeys = /* @__PURE__ */ new Set();
  const allPossibleMatrixChannelKeys = /* @__PURE__ */ new Set();
  const usedWheels = /* @__PURE__ */ new Set();
  const usedWheelSlots = /* @__PURE__ */ new Set();
  const modeNames = /* @__PURE__ */ new Set();
  const modeShortNames = /* @__PURE__ */ new Set();
  if (!("$schema" in fixtureJson)) {
    result.errors.push(getErrorString("File does not contain '$schema' property."));
    return result;
  }
  if (fixtureJson.$schema.endsWith("/fixture-redirect.json")) {
    await checkFixtureRedirect();
    return result;
  }
  const schemaValidate = await getAjvValidator("fixture");
  const schemaValid = schemaValidate(fixtureJson);
  if (!schemaValid) {
    const errorMessages = getAjvErrorMessages(schemaValidate.errors, "fixture");
    result.errors.push(...errorMessages.map((message) => getErrorString("File does not match schema:", message)));
    return result;
  }
  try {
    const manufacturer = await manufacturerFromRepository(manufacturerKey);
    fixture = new Fixture(manufacturer, fixtureKey, fixtureJson);
    checkFixtureIdentifierUniqueness();
    checkMeta(fixture.meta);
    checkLinks();
    checkPhysical(fixture.physical);
    checkMatrix(fixture.matrix);
    await checkWheels(fixture.wheels);
    checkTemplateChannels();
    checkChannels();
    for (const mode of fixture.modes) {
      checkMode(mode);
    }
    checkUnusedChannels();
    checkUnusedWheels();
    checkUnusedWheelSlots();
    checkCategories();
    checkRdm();
  } catch (error) {
    result.errors.push(getErrorString("File could not be imported into model.", error));
  }
  return result;
  async function checkFixtureRedirect() {
    const redirectSchemaValidate = await getAjvValidator("fixture-redirect");
    const redirectSchemaValid = redirectSchemaValidate(fixtureJson);
    if (!redirectSchemaValid) {
      result.errors.push(getErrorString("File does not match schema.", redirectSchemaValidate.errors));
    }
    if (!(fixtureJson.redirectTo in register.filesystem) || "redirectTo" in register.filesystem[fixtureJson.redirectTo]) {
      result.errors.push("'redirectTo' is not a valid fixture.");
    }
    result.name = `${manufacturerKey}/${fixtureKey}.json (redirect)`;
  }
  function checkFixtureIdentifierUniqueness() {
    if (uniqueValues === null) {
      return;
    }
    if (!(manufacturerKey in uniqueValues.fixKeysInMan)) {
      uniqueValues.fixKeysInMan[manufacturerKey] = /* @__PURE__ */ new Set();
    }
    checkUniqueness(
      uniqueValues.fixKeysInMan[manufacturerKey],
      fixture.key,
      result,
      `Fixture key '${fixture.key}' is not unique in manufacturer ${manufacturerKey} (test is not case-sensitive).`
    );
    if (!(manufacturerKey in uniqueValues.fixNamesInMan)) {
      uniqueValues.fixNamesInMan[manufacturerKey] = /* @__PURE__ */ new Set();
    }
    checkUniqueness(
      uniqueValues.fixNamesInMan[manufacturerKey],
      fixture.name,
      result,
      `Fixture name '${fixture.name}' is not unique in manufacturer ${manufacturerKey} (test is not case-sensitive).`
    );
    checkUniqueness(
      uniqueValues.fixShortNames,
      fixture.shortName,
      result,
      `Fixture shortName '${fixture.shortName}' is not unique (test is not case-sensitive).`
    );
  }
  function checkMeta(meta) {
    if (meta.lastModifyDate < meta.createDate) {
      result.errors.push("meta.lastModifyDate is earlier than meta.createDate.");
    }
    if (meta.importPlugin) {
      const pluginData = plugins.data[meta.importPlugin];
      const isImportPlugin = plugins.importPlugins.includes(meta.importPlugin);
      const isOutdatedImportPlugin = pluginData && plugins.importPlugins.includes(pluginData.newPlugin);
      if (!(isImportPlugin || isOutdatedImportPlugin)) {
        result.errors.push(`Unknown import plugin ${meta.importPlugin}`);
      }
    }
  }
  function checkLinks() {
    var _a;
    if (fixture.links === null) {
      return;
    }
    const linkTypesPerUrl = {};
    for (const [linkType, urls] of Object.entries(fixture.links)) {
      for (const url of urls) {
        (_a = linkTypesPerUrl[url]) != null ? _a : linkTypesPerUrl[url] = [];
        linkTypesPerUrl[url].push(linkType);
      }
    }
    for (const [url, linkTypes] of Object.entries(linkTypesPerUrl)) {
      if (linkTypes.length > 1) {
        const linkTypesList = linkTypes.join(", ");
        result.errors.push(`URL '${url}' is used in multiple link types: ${linkTypesList}.`);
      }
    }
  }
  function checkPhysical(physical, modeDescription = "") {
    if (physical === null) {
      return;
    }
    if (physical.lensDegreesMin > physical.lensDegreesMax) {
      result.errors.push(`physical.lens.degreesMinMax${modeDescription} is an invalid range.`);
    }
    if (physical.dimensions !== null && physical.DMXconnector !== null) {
      const hasSmallDimensions = physical.dimensions.some((dimension) => dimension < 30);
      const dimensionsString = physical.dimensions.join("\xD7");
      if (hasSmallDimensions) {
        result.errors.push(`physical.dimensions${modeDescription} are too small (${dimensionsString}mm) for a fixture with a ${physical.DMXconnector} DMX connector. Did you accidentally enter the dimensions in centimeters instead of millimeters?`);
      }
    }
    if (physical.hasMatrixPixels && fixture.matrix === null) {
      result.errors.push("physical.matrixPixels is set but fixture.matrix is missing.");
    } else if (physical.matrixPixelsSpacing !== null) {
      checkPhysicalMatrixPixelsSpacing(physical.matrixPixelsSpacing);
    }
  }
  function checkPhysicalMatrixPixelsSpacing(matrixPixelsSpacing) {
    for (const [index, axis] of ["X", "Y", "Z"].entries()) {
      if (matrixPixelsSpacing[index] !== 0 && !fixture.matrix.definedAxes.includes(axis)) {
        result.errors.push(`physical.matrixPixels.spacing is nonzero for ${axis} axis, but no pixels are defined in that axis.`);
      }
    }
  }
  function checkMatrix(matrix) {
    if (matrix === null) {
      return;
    }
    if (matrix.definedAxes.length === 0) {
      result.errors.push("Matrix may not consist of only a single pixel.");
      return;
    }
    const variesInAxisLength = matrix.pixelKeyStructure.some(
      (rows) => rows.length !== matrix.pixelCountY || rows.some(
        (columns) => columns.length !== matrix.pixelCountX
      )
    );
    if (variesInAxisLength) {
      result.errors.push("Matrix must not vary in axis length.");
    }
    if ("pixelGroups" in matrix.jsonObject) {
      checkPixelGroups();
    }
    function checkPixelGroups() {
      const pixelGroupKeys = Object.keys(matrix.jsonObject.pixelGroups);
      for (const pixelGroupKey of pixelGroupKeys) {
        const usedMatrixChannels = /* @__PURE__ */ new Set();
        if (matrix.pixelKeys.includes(pixelGroupKey)) {
          result.errors.push(`pixelGroupKey '${pixelGroupKey}' is already used as pixelKey. Please choose a different name.`);
        }
        if (matrix.pixelGroups[pixelGroupKey].length === 0) {
          result.errors.push(`pixelGroup '${pixelGroupKey}' does not contain any pixelKeys. Please relax the pixel key constraints.`);
        }
        for (const pixelKey of matrix.pixelGroups[pixelGroupKey]) {
          if (!matrix.pixelKeys.includes(pixelKey)) {
            result.errors.push(`pixelGroup '${pixelGroupKey}' references unknown pixelKey '${pixelKey}'.`);
          }
          if (usedMatrixChannels.has(pixelKey)) {
            result.errors.push(`pixelGroup '${pixelGroupKey}' can't reference pixelKey '${pixelKey}' more than once.`);
          }
          usedMatrixChannels.add(pixelKey);
        }
      }
    }
  }
  async function checkWheels(wheels) {
    for (const wheel of wheels) {
      if (!/\b(?:wheel|disk)\b/i.test(wheel.name)) {
        result.warnings.push(`Name of wheel '${wheel.name}' does not contain the word 'wheel' or 'disk', which could lead to confusing capability names.`);
      }
      const expectedAnimationGoboEndSlots = [];
      const foundAnimationGoboEndSlots = [];
      await Promise.all(wheel.slots.map(async (slot, index) => {
        if (slot.type === "AnimationGoboStart") {
          expectedAnimationGoboEndSlots.push(index + 1);
        } else if (slot.type === "AnimationGoboEnd") {
          foundAnimationGoboEndSlots.push(index);
        }
        if (typeof slot.resource === "string") {
          try {
            await getResourceFromString(slot.resource);
          } catch (error) {
            result.errors.push(error.message);
          }
        }
      }));
      if (!arraysEqual(expectedAnimationGoboEndSlots, foundAnimationGoboEndSlots)) {
        result.errors.push(`An 'AnimationGoboEnd' slot must be used after an 'AnimationGoboStart' slot in wheel ${wheel.name}. (${expectedAnimationGoboEndSlots}; ${foundAnimationGoboEndSlots})`);
      }
    }
  }
  function checkTemplateChannels() {
    if (fixtureJson.templateChannels) {
      for (const templateChannel of fixture.templateChannels) {
        checkTemplateChannel(templateChannel);
      }
    }
  }
  function checkTemplateChannel(templateChannel) {
    checkTemplateVariables(templateChannel.name, ["$pixelKey"]);
    for (const templateKey of templateChannel.allTemplateKeys) {
      checkTemplateVariables(templateKey, ["$pixelKey"]);
      const possibleMatrixChannelKeys = templateChannel.possibleMatrixChannelKeys.get(templateKey);
      const templateChannelUsed = fixture.allChannelKeys.some(
        (channelKey) => possibleMatrixChannelKeys.includes(channelKey)
      );
      if (!templateChannelUsed) {
        result.warnings.push(`Template channel '${templateKey}' is never used.`);
      }
      for (const channelKey of possibleMatrixChannelKeys) {
        checkUniqueness(
          allPossibleMatrixChannelKeys,
          channelKey,
          result,
          `Generated channel key ${channelKey} can be produced by multiple template channels (test is not case-sensitive).`
        );
      }
    }
  }
  function checkChannels() {
    for (const channel of fixture.coarseChannels) {
      if (!(channel instanceof NullChannel)) {
        checkUniqueness(
          definedChannelKeys,
          channel.key,
          result,
          `Channel key '${channel.key}' is already defined (maybe in another letter case).`
        );
        checkChannel(channel);
      }
    }
  }
  function checkChannel(channel) {
    checkTemplateVariables(channel.key, []);
    if (/\bfine\b|\d+[\s_-]*bit/i.test(channel.name)) {
      result.errors.push(`Channel '${channel.key}' should rather be a fine channel alias of its corresponding coarse channel.`);
    }
    checkTemplateVariables(channel.name, []);
    if (channel.type === "Unknown") {
      result.errors.push(`Channel '${channel.key}' has an unknown type.`);
    }
    for (const alias of channel.fineChannelAliases) {
      checkTemplateVariables(alias, []);
      checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Fine channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
      );
    }
    for (const alias of channel.switchingChannelAliases) {
      checkTemplateVariables(alias, []);
      checkUniqueness(
        definedChannelKeys,
        alias,
        result,
        `Switching channel alias '${alias}' in channel '${channel.key}' is already defined (maybe in another letter case).`
      );
    }
    const maxDmxValue = Math.pow(256, channel.dmxValueResolution) - 1;
    checkChannelDmxValues();
    checkCapabilities();
    function checkChannelDmxValues() {
      if (channel.dmxValueResolution > channel.maxResolution) {
        result.errors.push(`dmxValueResolution must be less or equal to ${channel.maxResolution * 8}bit in channel '${channel.key}'.`);
      }
      if (channel.hasDefaultValue && channel.getDefaultValueWithResolution(channel.dmxValueResolution) > maxDmxValue) {
        result.errors.push(`defaultValue must be less or equal to ${maxDmxValue} in channel '${channel.key}'.`);
      }
      if (channel.hasHighlightValue && channel.getHighlightValueWithResolution(channel.dmxValueResolution) > maxDmxValue) {
        result.errors.push(`highlightValue must be less or equal to ${maxDmxValue} in channel '${channel.key}'.`);
      }
    }
    function checkCapabilities() {
      var _a;
      let dmxRangesInvalid = false;
      if (channel.capabilities.length === 1 && channel.capabilities[0].type === "ShutterStrobe" && fixture.mainCategory !== "Strobe" && !((_a = channel.capabilities[0].helpWanted) == null ? void 0 : _a.startsWith("At which DMX values is strobe disabled? When is the lamp constantly on/off?"))) {
        result.errors.push(`Channel '${channel.key}' only has a single ShutterStrobe capability and the fixture is not a Strobe, so it is not clear when strobe is disabled.`);
      }
      for (let index = 0; index < channel.capabilities.length; index++) {
        const capability = channel.capabilities[index];
        if (!dmxRangesInvalid) {
          dmxRangesInvalid = !checkDmxRange(index);
        }
        const rangeString = `${capability.jsonObject.dmxRange[0]}\u2026${capability.jsonObject.dmxRange[1]}`;
        checkCapability(capability, `Capability '${capability.name}' (${rangeString}) in channel '${channel.key}'`);
      }
      function checkDmxRange(capabilityNumber) {
        const capability = channel.capabilities[capabilityNumber];
        const [rawDmxStart, rawDmxEnd] = capability.jsonObject.dmxRange;
        const errorLocationString = `capability '${capability.name}' (${rawDmxStart}\u2026${rawDmxEnd}) in channel '${channel.key}'`;
        return checkDmxRangeWithinBounds() && checkFirstCapabilityRangeStart() && checkRangeValid() && checkRangesAdjacent() && checkLastCapabilityRangeEnd();
        function checkDmxRangeWithinBounds() {
          if (rawDmxStart > maxDmxValue || rawDmxEnd > maxDmxValue) {
            result.errors.push(`dmxRange is out of bounds (maximum ${maxDmxValue} for ${channel.dmxValueResolution * 8}bit resolution) in ${errorLocationString}.`);
            return false;
          }
          return true;
        }
        function checkFirstCapabilityRangeStart() {
          if (capabilityNumber === 0 && capability.rawDmxRange.start !== 0) {
            result.errors.push(`The first dmxRange has to start at 0 in ${errorLocationString}.`);
            return false;
          }
          return true;
        }
        function checkRangeValid() {
          if (capability.rawDmxRange.start > capability.rawDmxRange.end) {
            result.errors.push(`dmxRange invalid in ${errorLocationString}.`);
            return false;
          }
          return true;
        }
        function checkRangesAdjacent() {
          if (capabilityNumber > 0) {
            const previousCapability = channel.capabilities[capabilityNumber - 1];
            if (capability.rawDmxRange.start !== previousCapability.rawDmxRange.end + 1) {
              result.errors.push(`dmxRanges must be adjacent in capabilities '${previousCapability.name}' (${previousCapability.rawDmxRange}) and '${capability.name}' (${capability.rawDmxRange}) in channel '${channel.key}'.`);
              return false;
            }
          }
          return true;
        }
        function checkLastCapabilityRangeEnd() {
          if (capabilityNumber === channel.capabilities.length - 1 && channel.capabilities[capabilityNumber].rawDmxRange.end !== maxDmxValue) {
            result.errors.push(`The last dmxRange has to end at ${maxDmxValue} (or another channel.dmxValueResolution must be chosen) in ${errorLocationString}.`);
            return false;
          }
          return true;
        }
      }
      function checkCapability(capability, errorPrefix) {
        const switchingChannelAliases = Object.keys(capability.switchChannels);
        if (arraysEqual(switchingChannelAliases, channel.switchingChannelAliases)) {
          for (const alias of switchingChannelAliases) {
            const channelKey = capability.switchChannels[alias];
            usedChannelKeys.add(channelKey.toLowerCase());
            if (channel.fixture.getChannelByKey(channelKey) === null) {
              result.errors.push(`${errorPrefix} references unknown channel '${channelKey}'.`);
            }
          }
        } else {
          result.errors.push(`${errorPrefix} must define the same switching channel aliases as all other capabilities.`);
        }
        checkStartEndEntities();
        const capabilityTypeChecks = {
          ShutterStrobe: checkShutterStrobeCapability,
          StrobeSpeed: checkStrobeSpeedCapability,
          Pan: checkPanTiltCapability,
          Tilt: checkPanTiltCapability,
          WheelSlot: checkWheelCapability,
          WheelShake: checkWheelCapability,
          WheelSlotRotation: checkWheelCapability,
          WheelRotation: checkWheelCapability,
          Effect: checkEffectCapability
        };
        if (Object.keys(capabilityTypeChecks).includes(capability.type)) {
          capabilityTypeChecks[capability.type]();
        }
        function checkStartEndEntities() {
          for (const property of capability.usedStartEndEntities) {
            const [startEntity, endEntity] = capability[property];
            if (startEntity.keyword === null !== (endEntity.keyword === null)) {
              result.errors.push(`${errorPrefix} must use keywords for both start and end value or for neither in ${property}.`);
            } else if (startEntity.unit !== endEntity.unit) {
              result.errors.push(`${errorPrefix} uses different units for ${property}.`);
            }
            if (property === "speed" && startEntity.number * endEntity.number < 0) {
              result.errors.push(`${errorPrefix} uses different signs (+ or \u2013) in ${property} (maybe behind a keyword). Split it into several capabilities instead.`);
            }
            if (`${property}Start` in capability.jsonObject && startEntity.equals(endEntity)) {
              result.errors.push(`${errorPrefix} uses ${property}Start and ${property}End with equal values. Use the single property '${property}: "${startEntity}"' instead.`);
            }
          }
        }
        function checkShutterStrobeCapability() {
          if (["Closed", "Open"].includes(capability.shutterEffect)) {
            if (capability.isSoundControlled) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't be sound-controlled.`);
            }
            if (capability.speed !== null || capability.duration !== null) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't define speed or duration.`);
            }
            if (capability.randomTiming) {
              result.errors.push(`${errorPrefix}: Shutter open/closed can't have random timing.`);
            }
          }
        }
        function checkStrobeSpeedCapability() {
          const otherCapabilityHasShutterStrobe = channel.capabilities.some((otherCapability) => otherCapability.type === "ShutterStrobe");
          const hasOtherStrobeChannel = fixture.coarseChannels.some((otherChannel) => otherChannel !== channel && otherChannel.type === "Strobe");
          if (otherCapabilityHasShutterStrobe && !hasOtherStrobeChannel) {
            result.errors.push(`${errorPrefix}: StrobeSpeed can't be used in the same channel as ShutterStrobe. Should this rather be a ShutterStrobe capability with shutterEffect "Strobe"?`);
          }
        }
        function checkWheelCapability() {
          let shouldCheckSlotNumbers = true;
          checkReferencedWheels();
          if (capability.slotNumber !== null && shouldCheckSlotNumbers) {
            checkSlotNumbers();
          }
          function checkReferencedWheels() {
            if ("wheel" in capability.jsonObject) {
              const wheelNames = [capability.jsonObject.wheel].flat();
              for (const wheelName of wheelNames) {
                const wheel = fixture.getWheelByName(wheelName);
                if (wheel) {
                  usedWheels.add(wheelName);
                } else {
                  result.errors.push(`${errorPrefix} references wheel '${wheelName}' which is not defined in the fixture.`);
                  shouldCheckSlotNumbers = false;
                }
              }
              if (wheelNames.length === 1 && wheelNames[0] === capability._channel.name) {
                result.errors.push(`${errorPrefix} explicitly references wheel '${wheelNames[0]}', which is the default anyway (through the channel name). Please remove the 'wheel' property.`);
              }
            } else if (capability.wheels.includes(null)) {
              result.errors.push(`${errorPrefix} does not explicitly reference any wheel, but the default wheel '${capability._channel.name}' (through the channel name) does not exist.`);
              shouldCheckSlotNumbers = false;
            } else {
              usedWheels.add(capability._channel.name);
            }
          }
          function checkSlotNumbers() {
            var _a2;
            const min = Math.min(capability.slotNumber[0], capability.slotNumber[1]);
            const max = Math.max(capability.slotNumber[0], capability.slotNumber[1]);
            for (let index = Math.floor(min); index <= Math.ceil(max); index++) {
              usedWheelSlots.add(`${capability.wheels[0].name} (slot ${index})`);
            }
            if (max - min > 1 && !((_a2 = capability.helpWanted) == null ? void 0 : _a2.endsWith("can be selected at which DMX values?"))) {
              result.errors.push(`${errorPrefix} references a wheel slot range (${min}\u2026${max}) which is greater than 1.`);
            }
            const minSlotNumber = 1;
            const maxSlotNumber = capability.wheels[0].slots.length;
            const isInRangeExclusive = (number, start, end) => number > start && number < end;
            const isInRangeInclusive = (number, start, end) => number >= start && number <= end;
            if (capability.slotNumber[0].equals(capability.slotNumber[1])) {
              if (!isInRangeExclusive(capability.slotNumber[0].number, minSlotNumber - 1, maxSlotNumber + 1)) {
                result.errors.push(`${errorPrefix} references wheel slot ${capability.slotNumber[0].number} which is outside the allowed range ${minSlotNumber - 1}\u2026${maxSlotNumber + 1} (exclusive).`);
              }
              return;
            }
            if (!isInRangeInclusive(capability.slotNumber[0].number, minSlotNumber - 1, maxSlotNumber)) {
              result.errors.push(`${errorPrefix} starts at wheel slot ${capability.slotNumber[0].number} which is outside the allowed range ${minSlotNumber - 1}\u2026${maxSlotNumber} (inclusive).`);
            } else if (!isInRangeInclusive(capability.slotNumber[1].number, minSlotNumber, maxSlotNumber + 1)) {
              result.errors.push(`${errorPrefix} ends at wheel slot ${capability.slotNumber[1].number} which is outside the allowed range ${minSlotNumber}\u2026${maxSlotNumber + 1} (inclusive).`);
            }
          }
        }
        function checkPanTiltCapability() {
          const usesPercentageAngle = capability.angle[0].unit === "%";
          if (usesPercentageAngle && capability.helpWanted !== "Can you provide exact angles?") {
            result.errors.push(`${errorPrefix} defines an imprecise percentaged angle. Please try to find the value in degrees.`);
          }
        }
        function checkEffectCapability() {
          if (capability.effectPreset === null && schemaDefinitions.effectPreset.enum.includes(capability.effectName)) {
            result.errors.push(`${errorPrefix} must use effectPreset instead of effectName with '${capability.effectName}'.`);
          }
          if (!capability.isSoundControlled && capability.soundSensitivity !== null) {
            result.errors.push(`${errorPrefix} can't set soundSensitivity if soundControlled is not true.`);
          }
        }
      }
    }
  }
  function checkMode(mode) {
    checkUniqueness(
      modeNames,
      mode.name,
      result,
      `Mode name '${mode.name}' is not unique (test is not case-sensitive).`
    );
    checkUniqueness(
      modeShortNames,
      mode.shortName,
      result,
      `Mode shortName '${mode.shortName}' is not unique (test is not case-sensitive).`
    );
    checkModeName();
    checkPhysical(mode.physicalOverride, ` in mode '${mode.shortName}'`);
    for (const rawReference of mode.jsonObject.channels) {
      if (rawReference !== null && typeof rawReference !== "string") {
        checkChannelInsertBlock(rawReference);
      }
    }
    for (let channelIndex = 0; channelIndex < mode.channelKeys.length; channelIndex++) {
      checkModeChannelKey(channelIndex);
    }
    function checkModeName() {
      for (const nameProperty of ["name", "shortName"]) {
        const match = mode[nameProperty].match(/(\d+)(?:\s+|-|)(?:channels?|ch)/i);
        if (match !== null) {
          const intendedLength = Number.parseInt(match[1], 10);
          if (mode.channels.length !== intendedLength) {
            result.errors.push(`Mode '${mode.name}' should have ${intendedLength} channels according to its ${nameProperty} but actually has ${mode.channels.length}.`);
          }
          const allowedShortNames = [`${intendedLength}ch`, `Ch${intendedLength}`, `Ch0${intendedLength}`];
          if (mode[nameProperty].length === match[0].length && !allowedShortNames.includes(mode.shortName)) {
            result.warnings.push(`Mode '${mode.name}' should have shortName '${intendedLength}ch' instead of '${mode.shortName}'.`);
          }
        }
      }
    }
    function checkChannelInsertBlock(insertBlock) {
      if (insertBlock.insert === "matrixChannels") {
        checkMatrixInsertBlock(insertBlock);
      }
      function checkMatrixInsertBlock(matrixInsertBlock) {
        checkMatrixInsertBlockRepeatFor();
        for (const templateKey of matrixInsertBlock.templateChannels) {
          const templateChannelExists = fixture.templateChannels.some((channel) => channel.allTemplateKeys.includes(templateKey));
          if (!templateChannelExists) {
            result.errors.push(`Template channel '${templateKey}' doesn't exist.`);
          }
        }
        function checkMatrixInsertBlockRepeatFor() {
          if (typeof matrixInsertBlock.repeatFor === "string") {
            return;
          }
          for (const pixelKey of matrixInsertBlock.repeatFor) {
            if (!fixture.matrix.pixelKeys.includes(pixelKey) && !(pixelKey in fixture.matrix.pixelGroups)) {
              result.errors.push(`Unknown pixelKey or pixelGroupKey '${pixelKey}'`);
            }
          }
        }
      }
    }
    function checkModeChannelKey(channelIndex) {
      const channelKey = mode.channelKeys[channelIndex];
      if (channelKey === null) {
        return;
      }
      usedChannelKeys.add(channelKey.toLowerCase());
      const channel = mode.fixture.getChannelByKey(channelKey);
      if (channel === null) {
        result.errors.push(`Channel '${channelKey}' is referenced from mode '${mode.shortName}' but is not defined.`);
        return;
      }
      if (mode.getChannelIndex(channel.key, "all") < channelIndex) {
        result.errors.push(`Channel '${channel.key}' is referenced more than once from mode '${mode.shortName}' (maybe through switching channels).`);
      }
      if (channel instanceof SwitchingChannel) {
        checkSwitchingChannelReference();
      } else if (channel instanceof FineChannel) {
        checkCoarserChannelsInMode(channel);
      }
      function checkSwitchingChannelReference() {
        if (mode.getChannelIndex(channel.triggerChannel.key) === -1) {
          result.errors.push(`mode '${mode.shortName}' uses switching channel '${channel.key}' but is missing its trigger channel '${channel.triggerChannel.key}'`);
        }
        for (const switchToChannel of channel.switchToChannels) {
          if (switchToChannel === null) {
            continue;
          }
          if (switchToChannel instanceof FineChannel) {
            checkCoarserChannelsInMode(switchToChannel);
          }
        }
        for (let index = 0; index < mode.getChannelIndex(channel.key); index++) {
          const otherChannel = mode.channels[index];
          checkSwitchingChannelReferenceDuplicate(otherChannel);
        }
        function checkSwitchingChannelReferenceDuplicate(otherChannel) {
          if (channel.switchToChannels.includes(otherChannel)) {
            result.errors.push(`Channel '${otherChannel.key}' is referenced more than once from mode '${mode.shortName}' through switching channel '${channel.key}'.`);
            return;
          }
          if (!(otherChannel instanceof SwitchingChannel)) {
            return;
          }
          if (otherChannel.triggerChannel === channel.triggerChannel) {
            for (const switchToChannelKey of channel.switchToChannelKeys) {
              const overlap = channel.triggerRanges[switchToChannelKey].some(
                // `?? []` because otherChannel.switchToChannelKeys may not include switchToChannelKey
                (range) => {
                  var _a;
                  return range.overlapsWithOneOf((_a = otherChannel.triggerRanges[switchToChannelKey]) != null ? _a : []);
                }
              );
              if (overlap) {
                result.errors.push(`Channel '${switchToChannelKey}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
              }
            }
          } else {
            const firstDuplicate = channel.switchToChannels.find(
              (switchToChannel) => otherChannel.usesChannelKey(switchToChannel.key, "all")
            );
            if (firstDuplicate !== void 0) {
              result.errors.push(`Channel '${firstDuplicate.key}' is referenced more than once from mode '${mode.shortName}' through switching channels '${otherChannel.key}' and ${channel.key}'.`);
            }
          }
        }
      }
      function checkCoarserChannelsInMode(fineChannel) {
        const coarseChannel = fineChannel.coarseChannel;
        const coarserChannelKeys = [...coarseChannel.fineChannelAliases.filter(
          (alias, index) => index < fineChannel.resolution - 2
        ), coarseChannel.key];
        const notInMode = coarserChannelKeys.filter(
          (coarseChannelKey) => mode.getChannelIndex(coarseChannelKey) === -1
        );
        if (notInMode.length > 0) {
          result.errors.push(`Mode '${mode.shortName}' contains the fine channel '${fineChannel.key}' but is missing its coarser channels ${notInMode}.`);
        }
      }
    }
  }
  function checkUnusedChannels() {
    const unused = [...definedChannelKeys].filter(
      (channelKey) => !usedChannelKeys.has(channelKey)
    ).join(", ");
    if (unused.length > 0) {
      result.warnings.push(`Unused channel(s): ${unused}`);
    }
  }
  function checkUnusedWheels() {
    const unusedWheels = fixture.wheels.filter(
      (wheel) => !usedWheels.has(wheel.name)
    ).map((wheel) => wheel.name).join(", ");
    if (unusedWheels.length > 0) {
      result.warnings.push(`Unused wheel(s): ${unusedWheels}`);
    }
  }
  function checkUnusedWheelSlots() {
    const slotsOfUsedWheels = [];
    for (const wheelName of usedWheels) {
      const wheel = fixture.getWheelByName(wheelName);
      if (wheel.type !== "AnimationGobo") {
        slotsOfUsedWheels.push(...wheel.slots.map(
          (slot, slotIndex) => `${wheelName} (slot ${slotIndex + 1})`
        ));
      }
    }
    const unusedWheelSlots = slotsOfUsedWheels.filter(
      (slot) => !usedWheelSlots.has(slot)
    ).join(", ");
    if (unusedWheelSlots.length > 0) {
      result.warnings.push(`Unused wheel slot(s): ${unusedWheelSlots}`);
    }
  }
  function checkCategories() {
    const mutuallyExclusiveGroups = [
      ["Moving Head", "Scanner", "Barrel Scanner"],
      ["Pixel Bar", "Flower"],
      ["Pixel Bar", "Stand"]
    ];
    const fixtureIsColorChanger = isColorChanger();
    const fixtureHasBothPanTiltChannels = hasPanTiltChannels(true);
    const fixtureHasPanOrTiltChannels = hasPanTiltChannels(false);
    const isFogTypeFog = isFogType("Fog");
    const isFogTypeHaze = isFogType("Haze");
    const fixtureIsNotMatrix = isNotMatrix();
    const fixtureIsPixelBar = isPixelBar();
    const fixtureIsNotPixelBar = isNotPixelBar();
    const categories = {
      "Color Changer": {
        isSuggested: fixtureIsColorChanger,
        isInvalid: !fixtureIsColorChanger,
        suggestedPhrase: "there are ColorPreset or ColorIntensity capabilities or Color wheel slots",
        invalidPhrase: "there are no ColorPreset and less than two ColorIntensity capabilities and no Color wheel slots"
      },
      "Moving Head": {
        isSuggested: fixtureHasBothPanTiltChannels,
        isInvalid: !fixtureHasBothPanTiltChannels,
        suggestedPhrase: "there are pan and tilt channels",
        invalidPhrase: "there are not both pan and tilt channels"
      },
      "Scanner": {
        isSuggested: fixtureHasBothPanTiltChannels,
        isInvalid: !fixtureHasPanOrTiltChannels,
        suggestedPhrase: "there are pan and tilt channels",
        invalidPhrase: "there are no pan or tilt channels"
      },
      "Barrel Scanner": {
        isSuggested: fixtureHasBothPanTiltChannels,
        isInvalid: !fixtureHasPanOrTiltChannels,
        suggestedPhrase: "there are pan and tilt channels",
        invalidPhrase: "there are no pan or tilt channels"
      },
      "Smoke": {
        isSuggested: isFogTypeFog,
        isInvalid: !isFogTypeFog,
        suggestedPhrase: "there are Fog/FogType capabilities with no fogType or fogType 'Fog'",
        invalidPhrase: "there are no Fog/FogType capabilities or none has fogType 'Fog'"
      },
      "Hazer": {
        isSuggested: isFogTypeHaze,
        isInvalid: !isFogTypeHaze,
        suggestedPhrase: "there are Fog/FogType capabilities with no fogType or fogType 'Haze'",
        invalidPhrase: "there are no Fog/FogType capabilities or none has fogType 'Haze'"
      },
      "Matrix": {
        isInvalid: fixtureIsNotMatrix,
        invalidPhrase: "fixture does not define a matrix"
      },
      "Pixel Bar": {
        isSuggested: fixtureIsPixelBar,
        isInvalid: fixtureIsNotPixelBar,
        suggestedPhrase: "matrix pixels are horizontally aligned",
        invalidPhrase: "no horizontally aligned matrix is defined"
      }
    };
    for (const [categoryName, categoryProperties] of Object.entries(categories)) {
      const isCategoryUsed = fixture.categories.includes(categoryName);
      const exclusiveGroups = mutuallyExclusiveGroups.filter(
        (group) => group.includes(categoryName) && group.some(
          (category) => category !== categoryName && fixture.categories.includes(category)
        )
      );
      if (!isCategoryUsed) {
        if (categoryProperties.isSuggested && exclusiveGroups.length === 0) {
          result.warnings.push(`Category '${categoryName}' suggested since ${categoryProperties.suggestedPhrase}.`);
        }
      } else if (categoryProperties.isInvalid) {
        result.errors.push(`Category '${categoryName}' invalid since ${categoryProperties.invalidPhrase}.`);
      } else if (exclusiveGroups.length > 0) {
        result.errors.push(...exclusiveGroups.map((group) => {
          const usedCategories = group.filter((category) => fixture.categories.includes(category)).map((category) => `'${category}'`).join(", ");
          return `Categories ${usedCategories} can't be used together.`;
        }));
      }
    }
    function isColorChanger() {
      return hasCapabilityOfType("ColorPreset") || hasMultipleColorIntensityCapabilities() || fixture.wheels.some(
        (wheel) => wheel.slots.some((slot) => slot.type === "Color")
      );
    }
    function hasMultipleColorIntensityCapabilities() {
      return fixture.capabilities.filter(
        (capability) => capability.type === "ColorIntensity" && capability.color !== "UV" && capability.color !== "Cold White" && capability.color !== "Warm White"
      ).length >= 2;
    }
    function hasPanTiltChannels(both = false) {
      const hasPan = hasCapabilityOfType("Pan") || hasCapabilityOfType("PanContinuous");
      const hasTilt = hasCapabilityOfType("Tilt") || hasCapabilityOfType("TiltContinuous");
      return both ? hasPan && hasTilt : hasPan || hasTilt;
    }
    function hasCapabilityOfType(type, minimum = 1) {
      return fixture.capabilities.filter(
        (capability) => capability.type === type
      ).length >= minimum;
    }
    function isFogType(fogType) {
      const fogCapabilities = fixture.capabilities.filter(
        (capability) => capability.type.startsWith("Fog")
      );
      if (fogCapabilities.length === 0) {
        return false;
      }
      return fogCapabilities.some((capability) => capability.fogType === fogType) || fogCapabilities.every((capability) => capability.fogType === null);
    }
    function isNotMatrix() {
      return fixture.matrix === null || fixture.matrix.definedAxes.length < 2;
    }
    function isPixelBar() {
      if (fixture.matrix === null) {
        return false;
      }
      const definedAxes = fixture.matrix.definedAxes;
      const definedAxis = definedAxes[0];
      return definedAxes.length === 1 && fixture.matrix[`pixelCount${definedAxis}`] > 4;
    }
    function isNotPixelBar() {
      return fixture.matrix === null || fixture.matrix.definedAxes.length > 1;
    }
  }
  function checkRdm() {
    if (fixture.rdm === null || uniqueValues === null) {
      return;
    }
    if (!(manufacturerKey in uniqueValues.fixRdmIdsInMan)) {
      uniqueValues.fixRdmIdsInMan[manufacturerKey] = /* @__PURE__ */ new Set();
    }
    checkUniqueness(
      uniqueValues.fixRdmIdsInMan[manufacturerKey],
      `${fixture.rdm.modelId}`,
      result,
      `Fixture RDM model ID '${fixture.rdm.modelId}' is not unique in manufacturer ${manufacturerKey}.`
    );
    if (fixture.manufacturer.rdmId === null) {
      result.errors.push(`Fixture has RDM data, but manufacturer '${fixture.manufacturer.name}' has not.`);
    }
    const rdmPersonalityIndices = /* @__PURE__ */ new Set();
    for (const mode of fixture.modes) {
      if (mode.rdmPersonalityIndex !== null) {
        checkUniqueness(
          rdmPersonalityIndices,
          `${mode.rdmPersonalityIndex}`,
          result,
          `RDM personality index '${mode.rdmPersonalityIndex}' in mode '${mode.shortName}' is not unique in the fixture.`
        );
      }
    }
  }
  function checkTemplateVariables(string, allowedVariables) {
    const usedVariables = string.match(/\$\w+/g) || [];
    for (const usedVariable of usedVariables) {
      if (!allowedVariables.includes(usedVariable)) {
        result.errors.push(`Variable ${usedVariable} not allowed in '${string}'`);
      }
    }
    for (const allowedVariable of allowedVariables) {
      if (!usedVariables.includes(allowedVariable)) {
        result.errors.push(`Variable ${allowedVariable} missing in '${string}'`);
      }
    }
  }
}
function checkUniqueness(set, value, result, messageIfNotUnique) {
  if (set.has(value.toLowerCase())) {
    result.errors.push(messageIfNotUnique);
  }
  set.add(value.toLowerCase());
}
function getErrorString(description, error) {
  if (typeof error === "string") {
    return `${description} ${error}`;
  }
  return `${description} ${inspect(error, false, null)}`;
}
function arraysEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a == null || b == null || a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}

async function createFixtureFromEditor({ request }) {
  try {
    const fixtureCreateResult = await getFixtureCreateResult(request.requestBody);
    return {
      statusCode: 201,
      body: fixtureCreateResult
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: {
        error: error.message
      }
    };
  }
}
async function getFixtureCreateResult(fixtures) {
  const result = {
    manufacturers: {},
    fixtures: {},
    warnings: {},
    errors: {}
  };
  const manufacturers = await importJson("../../../../fixtures/manufacturers.json", globalThis._importMeta_.url);
  const channelKeyMapping = {};
  await Promise.all(fixtures.map((fixture) => addFixture(fixture)));
  return result;
  async function addFixture(fixture) {
    const manufacturerKey = getManufacturerKey(fixture);
    const fixtureKey = getFixtureKey(fixture, manufacturerKey);
    const key = `${manufacturerKey}/${fixtureKey}`;
    result.fixtures[key] = {
      $schema: "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/fixture.json"
    };
    for (const property of Object.keys(fixtureProperties)) {
      switch (property) {
        case "physical": {
          const physical = getPhysical(fixture.physical);
          if (!isEmptyObject(physical)) {
            result.fixtures[key].physical = physical;
          }
          break;
        }
        case "meta": {
          const now = (/* @__PURE__ */ new Date()).toISOString().replace(/T.*/, "");
          result.fixtures[key].meta = {
            authors: [fixture.metaAuthor],
            createDate: now,
            lastModifyDate: now
          };
          break;
        }
        case "links": {
          addLinks(result.fixtures[key], fixture.links);
          break;
        }
        case "availableChannels": {
          result.fixtures[key].availableChannels = {};
          for (const channelId of Object.keys(fixture.availableChannels)) {
            addAvailableChannel(key, fixture.availableChannels, channelId);
          }
          break;
        }
        default: {
          if (property === "rdm" && propertyExistsIn("rdmModelId", fixture)) {
            result.fixtures[key].rdm = {
              modelId: fixture.rdmModelId
            };
            if (propertyExistsIn("rdmSoftwareVersion", fixture)) {
              result.fixtures[key].rdm.softwareVersion = fixture.rdmSoftwareVersion;
            }
          } else if (property === "modes") {
            result.fixtures[key].modes = [];
            for (const mode of fixture.modes) {
              addMode(key, mode);
            }
          } else if (property === "wheels") {
            addWheels(result.fixtures[key], fixture);
          } else if (propertyExistsIn(property, fixture)) {
            result.fixtures[key][property] = fixture[property];
          }
        }
      }
    }
    const checkResult = await checkFixture(manufacturerKey, fixtureKey, result.fixtures[key]);
    result.warnings[key] = checkResult.warnings;
    result.errors[key] = checkResult.errors;
  }
  function getManufacturerKey(fixture) {
    if (fixture.useExistingManufacturer) {
      result.manufacturers[fixture.manufacturerKey] = manufacturers[fixture.manufacturerKey];
      return fixture.manufacturerKey;
    }
    const manufacturerKey = slugify(fixture.newManufacturerName);
    result.manufacturers[manufacturerKey] = {
      name: fixture.newManufacturerName
    };
    if (propertyExistsIn("newManufacturerComment", fixture)) {
      result.manufacturers[manufacturerKey].comment = fixture.newManufacturerComment;
    }
    if (propertyExistsIn("newManufacturerWebsite", fixture)) {
      result.manufacturers[manufacturerKey].website = fixture.newManufacturerWebsite;
    }
    if (propertyExistsIn("newManufacturerRdmId", fixture)) {
      result.manufacturers[manufacturerKey].rdmId = fixture.newManufacturerRdmId;
    }
    return manufacturerKey;
  }
  function getFixtureKey(fixture, manufacturerKey) {
    if ("key" in fixture && fixture.key !== "[new]") {
      return fixture.key;
    }
    let fixtureKey = slugify(fixture.name);
    const otherFixtureKeys = new Set(Object.keys(result.fixtures).filter(
      (key) => key.startsWith(manufacturerKey)
    ).map((key) => key.slice(manufacturerKey.length + 1)));
    while (otherFixtureKeys.has(fixtureKey)) {
      fixtureKey += "-2";
    }
    return fixtureKey;
  }
  function getPhysical(from) {
    const physical = {};
    for (const property of Object.keys(physicalProperties)) {
      if (physicalProperties[property].type === "object") {
        physical[property] = {};
        for (const subProperty of Object.keys(physicalProperties[property].properties)) {
          if (propertyExistsIn(subProperty, from[property])) {
            physical[property][subProperty] = getComboboxInput(subProperty, from[property]);
          }
        }
        if (isEmptyObject(physical[property])) {
          delete physical[property];
        }
      } else if (propertyExistsIn(property, from)) {
        physical[property] = getComboboxInput(property, from);
      }
    }
    return physical;
  }
  function addLinks(fixture, editorLinksArray) {
    fixture.links = {};
    const resolveShortenedYouTubeUrl = (url) => {
      if (url.startsWith("https://youtu.be/")) {
        const urlObject = new URL(url);
        const videoId = urlObject.pathname.slice(1);
        const queryParameters = [["v", videoId], ...urlObject.searchParams];
        const queryParameterString = new URLSearchParams(Object.fromEntries(queryParameters));
        urlObject.host = "www.youtube.com";
        urlObject.pathname = "watch";
        urlObject.search = `?${queryParameterString}`;
        return urlObject.toString();
      }
      return url;
    };
    const linkTypes = Object.keys(linksProperties);
    for (const linkType of linkTypes) {
      const linksOfType = editorLinksArray.filter(({ type }) => type === linkType).map(({ url }) => resolveShortenedYouTubeUrl(url));
      if (linksOfType.length > 0) {
        fixture.links[linkType] = linksOfType;
      }
    }
  }
  function addWheels(fixture, editorFixture) {
    const editorWheelChannels = Object.values(editorFixture.availableChannels).filter(
      (editorChannel) => editorChannel.wheel && editorChannel.wheel.slots.some(
        (editorWheelSlot) => editorWheelSlot !== null && editorWheelSlot.type !== ""
      )
    );
    if (editorWheelChannels.length === 0) {
      return;
    }
    fixture.wheels = {};
    for (const editorChannel of editorWheelChannels) {
      const slots = editorChannel.wheel.slots.map((editorWheelSlot) => {
        if (editorWheelSlot === null || editorWheelSlot.type === "") {
          return null;
        }
        const wheelSlot = {
          type: editorWheelSlot.type
        };
        const wheelSlotSchema = wheelSlotTypes[wheelSlot.type];
        for (const slotProperty of Object.keys(wheelSlotSchema.properties)) {
          if (propertyExistsIn(slotProperty, editorWheelSlot.typeData)) {
            wheelSlot[slotProperty] = editorWheelSlot.typeData[slotProperty];
          }
        }
        return wheelSlot;
      });
      while (slots.at(-1) === null) {
        slots.pop();
      }
      fixture.wheels[editorChannel.name] = {
        slots
      };
    }
  }
  function addAvailableChannel(fixtureKey, availableChannels, channelId) {
    const from = availableChannels[channelId];
    if ("coarseChannelId" in from) {
      return;
    }
    const channel = {};
    for (const property of Object.keys(channelProperties)) {
      if (property === "capabilities") {
        const capabilities = getCapabilities(from);
        if (capabilities.length === 1) {
          delete capabilities[0].dmxRange;
          channel.capability = capabilities[0];
        } else {
          channel.capabilities = capabilities;
        }
      } else if (property === "fineChannelAliases" && from.resolution > CoarseChannel.RESOLUTION_8BIT) {
        channel.fineChannelAliases = [];
      } else if (property === "dmxValueResolution") {
        if (from.resolution !== from.dmxValueResolution && from.capabilities.length > 1) {
          channel.dmxValueResolution = `${from.dmxValueResolution * 8}bit`;
        }
      } else if (propertyExistsIn(property, from)) {
        channel[property] = getComboboxInput(property, from);
      }
    }
    const channelKey = getChannelKey(channel, fixtureKey);
    if ("fineChannelAliases" in channel) {
      for (const otherChannel of Object.values(availableChannels)) {
        if ("coarseChannelId" in otherChannel && otherChannel.coarseChannelId === channelId) {
          const alias = getFineChannelAlias(channelKey, otherChannel.resolution);
          channel.fineChannelAliases[otherChannel.resolution - 2] = alias;
          channelKeyMapping[otherChannel.uuid] = alias;
        }
      }
    }
    if (channel.name === channelKey) {
      delete channel.name;
    }
    channelKeyMapping[from.uuid] = channelKey;
    result.fixtures[fixtureKey].availableChannels[channelKey] = channel;
  }
  function getChannelKey(channel, fixtureKey) {
    let channelKey = channel.name;
    const availableChannelKeys = Object.keys(result.fixtures[fixtureKey].availableChannels);
    if (availableChannelKeys.includes(channelKey)) {
      let appendNumber = 2;
      while (availableChannelKeys.includes(`${channelKey} ${appendNumber}`)) {
        appendNumber++;
      }
      channelKey = `${channelKey} ${appendNumber}`;
    }
    return channelKey;
  }
  function getFineChannelAlias(channelKey, resolution) {
    const suffix = resolution > CoarseChannel.RESOLUTION_16BIT ? `^${resolution - 1}` : "";
    return `${channelKey} fine${suffix}`;
  }
  function getCapabilities(channel) {
    return channel.capabilities.map((editorCapability) => {
      const capability = {};
      const capabilitySchema = capabilityTypes[editorCapability.type];
      for (const capabilityProperty of Object.keys(capabilitySchema.properties)) {
        if (propertyExistsIn(capabilityProperty, editorCapability)) {
          capability[capabilityProperty] = editorCapability[capabilityProperty];
        } else if (propertyExistsIn(capabilityProperty, editorCapability.typeData)) {
          capability[capabilityProperty] = editorCapability.typeData[capabilityProperty];
        }
      }
      if (capability.brightnessStart === "off" && capability.brightnessEnd === "bright") {
        delete capability.brightnessStart;
        delete capability.brightnessEnd;
      }
      return capability;
    });
  }
  function addMode(fixtureKey, from) {
    const mode = {};
    for (const property of Object.keys(modeProperties)) {
      if (property === "physical") {
        const physical = getPhysical(from.physical);
        if (!isEmptyObject(physical)) {
          mode.physical = physical;
        }
      } else if (property === "channels") {
        mode.channels = from.channels.map((uuid) => channelKeyMapping[uuid]);
      } else if (propertyExistsIn(property, from)) {
        mode[property] = from[property];
      }
    }
    result.fixtures[fixtureKey].modes.push(mode);
  }
}
function isEmptyObject(object) {
  return JSON.stringify(object) === "{}";
}
function propertyExistsIn(property, object) {
  const objectValid = object !== void 0 && object !== null;
  return objectValid && object[property] !== void 0 && object[property] !== null && object[property] !== "";
}
function getComboboxInput(property, from) {
  return from[property] === "[add-value]" && from[`${property}New`] !== "" ? from[`${property}New`] : from[property];
}
function slugify(string) {
  return string.toLowerCase().replaceAll(/[^\da-z-]+/g, " ").trim().replaceAll(/\s+/g, "-");
}

async function importFixtureFile({ request }) {
  try {
    const fixtureCreateResult = await importFixture(request.requestBody);
    return {
      statusCode: 201,
      body: fixtureCreateResult
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: {
        error: error.message
      }
    };
  }
}
async function importFixture(body) {
  const { importPlugins } = await importJson("../../../../plugins/plugins.json", globalThis._importMeta_.url);
  if (!body.plugin || !importPlugins.includes(body.plugin)) {
    throw new Error(`'${body.plugin}' is not a valid import plugin.`);
  }
  const plugin = await import(`../../../../plugins/${body.plugin}/import.js`);
  const { manufacturers, fixtures, warnings } = await plugin.importFixtures(
    Buffer.from(body.fileContentBase64, "base64"),
    body.fileName,
    body.author
  ).catch((parseError) => {
    parseError.message = `Parse error (${parseError.message})`;
    throw parseError;
  });
  const result = {
    manufacturers,
    fixtures,
    warnings,
    errors: {}
  };
  const oflManufacturers = await importJson("../../../../fixtures/manufacturers.json", globalThis._importMeta_.url);
  for (const [key, fixture] of Object.entries(result.fixtures)) {
    const [manufacturerKey, fixtureKey] = key.split("/");
    const checkResult = await checkFixture(manufacturerKey, fixtureKey, fixture);
    if (!(manufacturerKey in result.manufacturers)) {
      result.manufacturers[manufacturerKey] = oflManufacturers[manufacturerKey];
    }
    result.warnings[key] = [...result.warnings[key], ...checkResult.warnings];
    result.errors[key] = checkResult.errors;
  }
  return result;
}

function fixtureJsonStringify(object) {
  let string = JSON.stringify(object, null, 2);
  string = string.replaceAll(
    /^( +)"(dmxRange|range|dimensions|spacing|degreesMinMax)": (\[\n[^]*?^\1])/gm,
    (match, spaces, key, values) => {
      const numbers = JSON.parse(values).join(", ");
      return `${spaces}"${key}": [${numbers}]`;
    }
  );
  string = string.replaceAll(
    /^( +)"(categories|authors|fineChannelAliases|colors(?:Start|End)?)": (\[\n[^]*?^\1])/gm,
    (match, spaces, key, values) => {
      const strings = JSON.parse(values).map((value) => `"${value}"`).join(", ");
      return `${spaces}"${key}": [${strings}]`;
    }
  );
  return `${string}
`;
}

new (ColorHash.default || ColorHash)({
  lightness: [0.5, 0.6],
  saturation: [0.5, 0.6, 0.7],
  hash: (string) => [...string].reduce((accumulator, char, index) => {
    return accumulator + (char.codePointAt() * (index + 1)) ** 2;
  }, 0)
});
function getObjectSortedByKeys(object, itemMapFunction) {
  var _a;
  const sortedObject = {};
  const keys = Object.keys(object).toSorted(localeSort);
  for (const key of keys) {
    sortedObject[key] = (_a = void 0 ) != null ? _a : object[key];
  }
  return sortedObject;
}
function localeSort(a, b) {
  return a.localeCompare(b, "en", {
    numeric: true
  });
}

const repository = "open-fixture-library" ;
let branchName;
let changedFiles;
let githubErrors;
let githubClient;
async function createPullRequest(fixtureCreateResult, githubUsername = null, githubComment = null) {
  const {
    manufacturers,
    fixtures,
    warnings,
    errors
  } = fixtureCreateResult;
  const userToken = process.env.GITHUB_USER_TOKEN;
  if (userToken === void 0) {
    console.error(".env file does not contain GITHUB_USER_TOKEN variable");
    throw new Error("GitHub user token was not set");
  }
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").replace(/\..+/, "");
  branchName = `branch${timestamp}`;
  changedFiles = [];
  githubErrors = [];
  githubClient = new Octokit({
    auth: `token ${userToken}`
  });
  try {
    console.log("get latest commit hash ...");
    const latestCommitRef = await githubClient.rest.git.getRef({
      owner: "OpenLightingProject",
      repo: repository,
      ref: "heads/master"
    });
    const latestCommitHash = latestCommitRef.data.object.sha;
    console.log(latestCommitHash);
    console.log(`create new branch '${branchName}' ...`);
    await githubClient.rest.git.createRef({
      owner: "OpenLightingProject",
      repo: repository,
      ref: `refs/heads/${branchName}`,
      sha: latestCommitHash
    });
    console.log("done");
    const user = await getGithubUserInfo(githubUsername);
    const skipCi = Object.keys(fixtures).length > 0;
    await addOrUpdateFile("fixtures/manufacturers.json", "manufacturers.json", (oldFileContent) => {
      const mergedManufacturers = Object.assign(
        oldFileContent ? JSON.parse(oldFileContent) : {
          $schema: "https://raw.githubusercontent.com/OpenLightingProject/open-fixture-library/master/schemas/manufacturers.json"
        },
        manufacturers
      );
      return prettyJsonStringify(getObjectSortedByKeys(mergedManufacturers));
    }, user, skipCi);
    const fixtureEntries = Object.entries(fixtures);
    let index = 0;
    for (const [fixtureKey, fixture] of fixtureEntries) {
      await addOrUpdateFile(
        `fixtures/${fixtureKey}.json`,
        `fixture \`${fixtureKey}\``,
        (oldFileContent) => fixtureJsonStringify(fixture),
        user,
        index !== fixtureEntries.length - 1
        // all but the last fixture should skip CI
      );
      index++;
    }
    console.log("create pull request ...");
    const addedFixtures = changedFiles.filter((line) => line.startsWith("Add fixture"));
    let title = `Add ${addedFixtures.length} new fixtures`;
    if (addedFixtures.length === 1) {
      title = addedFixtures[0];
    }
    const fixtureWarningsErrorsMarkdown = getFixtureWarningsErrorsMarkdownList(fixtures, errors, warnings);
    const submitterNameMarkdown = getSubmitterNameMarkdown(user, githubUsername, fixtures);
    const result = await githubClient.rest.pulls.create({
      owner: "OpenLightingProject",
      repo: repository,
      title,
      body: getPrDescriptionMarkdown(submitterNameMarkdown, fixtureWarningsErrorsMarkdown, githubComment),
      head: branchName,
      base: "master",
      draft: true
    });
    console.log("done");
    console.log("add labels to pull request ...");
    await githubClient.rest.issues.addLabels({
      owner: "OpenLightingProject",
      repo: repository,
      // eslint-disable-next-line camelcase -- required by GitHub API
      issue_number: result.data.number,
      labels: ["new-fixture", "via-editor"]
    });
    console.log("done");
    const pullRequestUrl = result.data.html_url;
    console.log(`View the pull request at ${pullRequestUrl}`);
    return pullRequestUrl;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}
async function getGithubUserInfo(username) {
  if (!username) {
    return null;
  }
  console.log(`get info for GitHub user @${username} ...`);
  try {
    const { data: user } = await githubClient.rest.users.getByUsername({ username });
    console.log(`done (name: ${user.name}, email: ${user.email})`);
    return user;
  } catch {
    console.log("error getting user");
    return null;
  }
}
function getPrDescriptionMarkdown(submitterNameMarkdown, fixtureWarningsErrorsMarkdown, githubComment) {
  let body = changedFiles.map((line) => `* ${line}`).join("\n");
  if (githubErrors.length > 0) {
    const githubErrorList = githubErrors.map((error) => `* \u26A0\uFE0F ${error}`).join("\n");
    body += `

### Errors:
${githubErrorList}`;
  }
  if (fixtureWarningsErrorsMarkdown.length > 0) {
    body += "\n\n### Fixture warnings / errors\n\n";
    body += fixtureWarningsErrorsMarkdown;
  }
  if (githubComment) {
    body += "\n\n### User comment\n\n";
    body += githubComment;
  }
  body += `

Thank you ${submitterNameMarkdown}!`;
  return body;
}
function getFixtureWarningsErrorsMarkdownList(fixtures, errors, warnings) {
  let markdownList = "";
  for (const fixtureKey of Object.keys(fixtures)) {
    const fixtureErrors = errors[fixtureKey] || [];
    const fixtureWarnings = warnings[fixtureKey] || [];
    const messages = [
      ...fixtureErrors.map((error) => `  - \u274C ${error}`),
      ...fixtureWarnings.map((warning) => `  - \u26A0\uFE0F ${warning}`)
    ].join("\n");
    if (messages.length > 0) {
      markdownList += `* ${fixtureKey}
${messages}
`;
    }
  }
  return markdownList;
}
function getSubmitterNameMarkdown(user, githubUsername, fixtures) {
  if (user) {
    return `@${user.login}`;
  }
  if (githubUsername) {
    return `**${githubUsername}**`;
  }
  return Object.values(fixtures).flatMap((fixture) => fixture.meta.authors).filter((author, index, list) => list.indexOf(author) === index).map((author) => `**${author}**`).join(" and ");
}
async function addOrUpdateFile(filename, displayName, newContentFunction, user, excludeFromCi = false) {
  const appendToCommitMessage = excludeFromCi ? "\n\n[skip ci]" : "";
  let action;
  let sha;
  let newFileContent;
  console.log(`does ${displayName} exist?`);
  try {
    const result = await githubClient.rest.repos.getContent({
      owner: "OpenLightingProject",
      repo: repository,
      path: filename
    });
    console.log("yes -> update it ...");
    const oldFileContent = Buffer.from(result.data.content, result.data.encoding).toString("utf-8");
    newFileContent = newContentFunction(oldFileContent);
    if (oldFileContent === newFileContent) {
      console.log("no need to update, files are the same");
      return;
    }
    action = "Update";
    sha = result.data.sha;
  } catch {
    console.log("no -> create it ...");
    action = "Add";
    newFileContent = newContentFunction(null);
  }
  const committer = user && user.email ? {
    name: user.name,
    email: user.email
  } : void 0;
  try {
    await githubClient.rest.repos.createOrUpdateFileContents({
      owner: "OpenLightingProject",
      repo: repository,
      path: filename,
      message: `${action} ${displayName} via editor${appendToCommitMessage}`,
      content: encodeBase64(newFileContent),
      sha,
      branch: branchName,
      committer
    });
    console.log("done");
    changedFiles.push(`${action} ${displayName}`);
  } catch (error) {
    console.error(`Error (${action.toLowerCase()} ${displayName}): ${error.message}`);
    githubErrors.push(`Error (${action.toLowerCase()} ${displayName}): \`${error.message}\``);
  }
}
function encodeBase64(string) {
  return Buffer.from(string).toString("base64");
}
function prettyJsonStringify(object) {
  const string = JSON.stringify(object, null, 2);
  return `${string}
`;
}

async function submitFixtures({ request }) {
  try {
    const pullRequestUrl = await createPullRequest(
      request.requestBody.fixtureCreateResult,
      request.requestBody.githubUsername,
      request.requestBody.githubComment
    );
    return {
      statusCode: 201,
      body: {
        pullRequestUrl
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: `${error.toString()}
${error.stack}`
      }
    };
  }
}

async function getManufacturers(context) {
  const manufacturers = await importJson("../../../../fixtures/manufacturers.json", globalThis._importMeta_.url);
  const register = await importJson("../../../../fixtures/register.json", globalThis._importMeta_.url);
  const manufacturerData = {};
  for (const manufacturerKey of Object.keys(manufacturers)) {
    if (manufacturerKey !== "$schema") {
      manufacturerData[manufacturerKey] = {
        name: manufacturers[manufacturerKey].name,
        fixtureCount: register.manufacturers[manufacturerKey].length,
        color: register.colors[manufacturerKey]
      };
    }
  }
  return {
    body: manufacturerData
  };
}

async function getManufacturerByKey({ request }) {
  const { manufacturerKey } = request.params;
  const manufacturers = await importJson("../../../../fixtures/manufacturers.json", globalThis._importMeta_.url);
  if (!(manufacturerKey in manufacturers) || manufacturerKey === "$schema") {
    return {
      statusCode: 404,
      body: {
        error: "Manufacturer not found"
      }
    };
  }
  const register = await importJson("../../../../fixtures/register.json", globalThis._importMeta_.url);
  const manufacturer = {
    ...manufacturers[manufacturerKey],
    key: manufacturerKey,
    color: register.colors[manufacturerKey],
    fixtures: (register.manufacturers[manufacturerKey] || []).map(
      (fixtureKey) => ({
        key: fixtureKey,
        name: register.filesystem[`${manufacturerKey}/${fixtureKey}`].name,
        categories: Object.keys(register.categories).filter(
          (category) => register.categories[category].includes(`${manufacturerKey}/${fixtureKey}`)
        )
      })
    )
  };
  return {
    body: manufacturer
  };
}

async function getPlugins(context) {
  const plugins = await importJson("../../../../plugins/plugins.json", globalThis._importMeta_.url);
  return {
    body: plugins
  };
}

async function getPluginByKey({ request }) {
  let { pluginKey } = request.params;
  const plugins = await importJson("../../../../plugins/plugins.json", globalThis._importMeta_.url);
  if (!(pluginKey in plugins.data)) {
    return {
      statusCode: 404,
      body: {
        error: "Plugin not found"
      }
    };
  }
  if (plugins.data[pluginKey].outdated) {
    pluginKey = plugins.data[pluginKey].newPlugin;
  }
  const pluginData = await importJson(`../../../../plugins/${pluginKey}/plugin.json`, globalThis._importMeta_.url);
  return {
    body: {
      key: pluginKey,
      name: pluginData.name,
      previousVersions: pluginData.previousVersions || {},
      description: pluginData.description.join("\n"),
      links: pluginData.links,
      fixtureUsage: pluginData.fixtureUsage && pluginData.fixtureUsage.join("\n"),
      fileLocations: pluginData.fileLocations,
      additionalInfo: pluginData.additionalInfo && pluginData.additionalInfo.join("\n"),
      helpWanted: pluginData.helpWanted,
      exportPluginVersion: plugins.data[pluginKey].exportPluginVersion,
      importPluginVersion: plugins.data[pluginKey].importPluginVersion
    }
  };
}

const routeHandlers = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  createFeedbackIssue: createFeedbackIssue,
  createFixtureFromEditor: createFixtureFromEditor,
  getManufacturerByKey: getManufacturerByKey,
  getManufacturers: getManufacturers,
  getPluginByKey: getPluginByKey,
  getPlugins: getPlugins,
  getSearchResults: getSearchResults,
  importFixtureFile: importFixtureFile,
  submitFixtures: submitFixtures
}, Symbol.toStringTag, { value: 'Module' }));

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "50mb" }));
const corsWhitelist = [
  /[./]open-fixture-library\.org(?::\d+|)$/,
  /\/localhost(?::\d+|)$/
];
app.use(cors({
  origin(origin, callback) {
    const corsAllowed = !origin || corsWhitelist.some((regex) => regex.test(origin));
    callback(null, corsAllowed ? true : "https://open-fixture-library.org");
  },
  optionsSuccessStatus: 200
  // IE11 chokes on default 204
}));
const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;
const api = new OpenAPIBackend({
  definition: fileURLToPath$1(new URL("openapi.json", globalThis._importMeta_.url)),
  strict: false,
  ajvOpts: {
    formats: {
      base64: base64Regex
    }
  },
  handlers: {
    ...routeHandlers,
    validationFail({ validation, request, operation }) {
      let error = validation.errors;
      if (typeof error !== "string") {
        error = getAjvErrorMessages(Array.isArray(error) ? error : [error], "request").join(",\n");
      }
      const errorDescription = `API request for ${request.originalUrl} (${operation.operationId}) doesn't match schema:`;
      console.error(styleText("bgRed", errorDescription));
      console.error(error);
      return {
        statusCode: 400,
        body: { error: `${errorDescription}
${error}` }
      };
    },
    notFound(context) {
      return {
        statusCode: 404,
        body: { error: "Not found" }
      };
    },
    methodNotAllowed(context) {
      return {
        statusCode: 405,
        body: { error: "Method not allowed" }
      };
    },
    notImplemented(context) {
      return {
        statusCode: 501,
        body: { error: "No handler registered for operation" }
      };
    },
    postResponseHandler({ request, response, operation }) {
      if (!response || !operation) {
        return null;
      }
      const { statusCode = 200, body } = (
        /** @type {ApiResponse} */
        response
      );
      return response;
    }
  }
});
app.use(async (request, response) => {
  const { statusCode = 200, body } = await api.handleRequest(request);
  response.statusCode = statusCode;
  sendJson(response, body);
});

const _K88_yp = fromNodeMiddleware((req, res, next) => {
  var _a;
  if (!((_a = req.url) == null ? void 0 : _a.startsWith("/api/v1"))) {
    return next();
  }
  const originalUrl = req.url;
  req.url = req.url.slice("/api/v1".length) || "/";
  const wrappedNext = () => {
    req.url = originalUrl;
    next();
  };
  return app(req, res, wrappedNext);
});

const pluginsPromise = importJson("../../plugins/plugins.json", globalThis._importMeta_.url);
const registerPromise = importJson("../../fixtures/register.json", globalThis._importMeta_.url);
async function downloadFixtures(response, pluginKey, fixtures, zipName, errorDesc) {
  const plugin = await import(`../../plugins/${pluginKey}/export.js`);
  try {
    const files = await plugin.exportFixtures(fixtures, {
      baseDirectory: fileURLToPath$1(new URL("../../", globalThis._importMeta_.url)),
      date: /* @__PURE__ */ new Date()
    });
    if (files.length === 1) {
      response.statusCode = 200;
      sendAttachment(response, files[0]);
      return;
    }
    const archive = new JSZip();
    for (const file of files) {
      archive.file(file.name, file.content);
    }
    const zipBuffer = await archive.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE"
    });
    response.statusCode = 200;
    sendAttachment(response, {
      name: `ofl_export_${zipName}.zip`,
      mimetype: "application/zip",
      content: zipBuffer
    });
  } catch (error) {
    response.statusCode = 500;
    response.write(`Exporting ${errorDesc} with ${pluginKey} failed: ${error.toString()}`);
    response.end();
  }
}
const router = express.Router();
router.use(express.json({ limit: "50mb" }));
router.get(/^\/download\.(?<format>[a-z0-9_.-]+)$/, async (request, response, next) => {
  const { format } = request.params;
  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    next();
    return;
  }
  const register = await registerPromise;
  const fixtures = await Promise.all(
    Object.keys(register.filesystem).filter(
      (fixtureKey) => !("redirectTo" in register.filesystem[fixtureKey]) || register.filesystem[fixtureKey].reason === "SameAsDifferentBrand"
    ).map((fixture) => {
      const [manufacturer, key] = fixture.split("/");
      return fixtureFromRepository(manufacturer, key);
    })
  );
  downloadFixtures(response, format, fixtures, format, "all fixtures");
});
router.post(/^\/download-editor\.(?<format>[a-z0-9_.-]+)$/, async (request, response) => {
  const { format } = request.params;
  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    response.statusCode = 500;
    response.write(`Exporting fixture with ${format} failed: Plugin is not supported.`);
    response.end();
    return;
  }
  const outObject = request.body;
  const fixtures = await Promise.all(Object.entries(outObject.fixtures).map(async ([key, jsonObject]) => {
    const [manufacturerKey, fixtureKey] = key.split("/");
    const manufacturer = new Manufacturer(manufacturerKey, outObject.manufacturers[manufacturerKey]);
    await embedResourcesIntoFixtureJson(jsonObject);
    return new Fixture(manufacturer, fixtureKey, jsonObject);
  }));
  let zipName;
  let errorDesc;
  if (fixtures.length === 1) {
    zipName = `${fixtures[0].manufacturer.key}_${fixtures[0].key}_${format}`;
    errorDesc = `fixture ${fixtures[0].manufacturer.key}/${fixtures[0].key}`;
  } else {
    zipName = format;
    errorDesc = `${fixtures.length} fixtures`;
  }
  downloadFixtures(response, format, fixtures, zipName, errorDesc);
});
router.get(/^\/(?<manufacturerKey>[^/]+)\/(?<fixtureKey>[^/.]+)\.(?<format>[a-z0-9_.-]+)$/, async (request, response, next) => {
  const { manufacturerKey, fixtureKey, format } = request.params;
  const register = await registerPromise;
  if (!(`${manufacturerKey}/${fixtureKey}` in register.filesystem)) {
    next();
    return;
  }
  if (format === "json") {
    try {
      const json = await importJson(`../../fixtures/${manufacturerKey}/${fixtureKey}.json`, globalThis._importMeta_.url);
      await embedResourcesIntoFixtureJson(json);
      sendJson(response, json);
    } catch (error) {
      response.statusCode = 500;
      response.write(`Fetching ${manufacturerKey}/${fixtureKey}.json failed: ${error.toString()}`);
      response.end();
    }
    return;
  }
  const plugins = await pluginsPromise;
  if (!plugins.exportPlugins.includes(format)) {
    next();
    return;
  }
  const fixtures = [await fixtureFromRepository(manufacturerKey, fixtureKey)];
  const zipName = `${manufacturerKey}_${fixtureKey}_${format}`;
  const errorDesc = `fixture ${manufacturerKey}/${fixtureKey}`;
  downloadFixtures(response, format, fixtures, zipName, errorDesc);
});

const _BeS6Bf = fromNodeMiddleware((req, res, next) => {
  var _a;
  if (!((_a = req.url) == null ? void 0 : _a.match(/\.[a-z0-9_-]+$/))) {
    return next();
  }
  return router(req, res, next);
});

const _SxA8c9 = defineEventHandler(() => {});

const defaultThrowErrorValue = { throwError: true };
const defaultSecurityConfig = (serverlUrl, strict) => {
  const defaultConfig = {
    strict,
    headers: {
      crossOriginResourcePolicy: "same-origin",
      crossOriginOpenerPolicy: "same-origin",
      crossOriginEmbedderPolicy: "credentialless",
      contentSecurityPolicy: {
        "base-uri": ["'none'"],
        "font-src": ["'self'", "https:", "data:"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'self'"],
        "img-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "script-src-attr": ["'none'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "script-src": ["'self'", "https:", "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'"],
        "upgrade-insecure-requests": true
      },
      originAgentCluster: "?1",
      referrerPolicy: "no-referrer",
      strictTransportSecurity: {
        maxAge: 15552e3,
        includeSubdomains: true
      },
      xContentTypeOptions: "nosniff",
      xDNSPrefetchControl: "off",
      xDownloadOptions: "noopen",
      xFrameOptions: "SAMEORIGIN",
      xPermittedCrossDomainPolicies: "none",
      xXSSProtection: "0",
      permissionsPolicy: {
        camera: [],
        "display-capture": [],
        fullscreen: [],
        geolocation: [],
        microphone: []
      }
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2e6,
      maxUploadFileRequestInBytes: 8e6,
      ...defaultThrowErrorValue
    },
    rateLimiter: {
      // Twitter search rate limiting
      tokensPerInterval: 150,
      interval: 3e5,
      headers: false,
      driver: {
        name: "lruCache"
      },
      whiteList: void 0,
      ipHeader: void 0,
      ...defaultThrowErrorValue
    },
    xssValidator: {
      methods: ["GET", "POST"],
      ...defaultThrowErrorValue
    },
    corsHandler: {
      // Options by CORS middleware for Express https://github.com/expressjs/cors#configuration-options
      origin: serverlUrl,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      preflight: {
        statusCode: 204
      }
    },
    allowedMethodsRestricter: {
      methods: "*",
      ...defaultThrowErrorValue
    },
    hidePoweredBy: true,
    basicAuth: false,
    enabled: true,
    csrf: false,
    nonce: true,
    removeLoggers: true,
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: false,
      nitroHeaders: true,
      exportToPresets: true
    },
    sri: true
  };
  {
    defaultConfig.headers.crossOriginEmbedderPolicy = "require-corp";
    defaultConfig.headers.contentSecurityPolicy = {
      "base-uri": ["'none'"],
      "default-src": ["'none'"],
      "connect-src": ["'self'"],
      "font-src": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'self'"],
      "frame-src": ["'self'"],
      "img-src": ["'self'"],
      "manifest-src": ["'self'"],
      "media-src": ["'self'"],
      "object-src": ["'none'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "'nonce-{{nonce}}'"],
      "script-src": ["'self'", "'strict-dynamic'", "'nonce-{{nonce}}'"],
      "upgrade-insecure-requests": true,
      "worker-src": ["'self'"]
    };
    defaultConfig.ssg.hashStyles = true;
    defaultConfig.headers.strictTransportSecurity = {
      maxAge: 31536e3,
      includeSubdomains: true,
      preload: true
    }, defaultConfig.headers.xFrameOptions = "DENY";
    defaultConfig.headers.permissionsPolicy = {
      accelerometer: [],
      /* Disable OWASP Experimental values
      'ambient-light-sensor':[],
      */
      autoplay: [],
      /* Disable OWASP Experimental values
      battery:[],
      */
      camera: [],
      "display-capture": [],
      /* Disable OWASP Experimental values
      'document-domain':[],
      */
      "encrypted-media": [],
      fullscreen: [],
      /* Disable OWASP Experimental values
      gamepad:[],
      */
      geolocation: [],
      gyroscope: [],
      /* Disable OWASP Experimental values
      'layout-animations':['self'],
      */
      /* Disable OWASP Experimental values
      'legacy-image-formats':['self'],
      */
      magnetometer: [],
      microphone: [],
      midi: [],
      /* Disable OWASP Experimental values
      'oversized-images':['self'],
      */
      payment: [],
      "picture-in-picture": [],
      "publickey-credentials-get": [],
      "screen-wake-lock": [],
      /* Disable OWASP Experimental values
      'speaker-selection':[],
      */
      "sync-xhr": ["self"],
      /* Disable OWASP Experimental values
      'unoptimized-images':['self'],
      */
      /* Disable OWASP Experimental values
      'unsized-media':['self'],
      */
      usb: [],
      "web-share": [],
      "xr-spatial-tracking": []
    };
  }
  return defaultConfig;
};

const FILE_UPLOAD_HEADER = "multipart/form-data";
const defaultSizeLimiter = defaultSecurityConfig("", true).requestSizeLimiter;
const _8vVJpR = defineEventHandler((event) => {
  const rules = resolveSecurityRules(event);
  if (rules.enabled && rules.requestSizeLimiter) {
    const requestSizeLimiter = defu$1(
      rules.requestSizeLimiter,
      defaultSizeLimiter
    );
    if (["POST", "PUT", "DELETE"].includes(event.node.req.method)) {
      const contentLengthValue = getRequestHeader(event, "content-length");
      const contentTypeValue = getRequestHeader(event, "content-type");
      const isFileUpload = contentTypeValue?.includes(FILE_UPLOAD_HEADER);
      const requestLimit = isFileUpload ? requestSizeLimiter.maxUploadFileRequestInBytes : requestSizeLimiter.maxRequestSizeInBytes;
      if (parseInt(contentLengthValue) >= requestLimit) {
        const payloadTooLargeError = {
          statusCode: 413,
          statusMessage: "Payload Too Large"
        };
        if (requestSizeLimiter.throwError === false) {
          return payloadTooLargeError;
        }
        throw createError$1(payloadTooLargeError);
      }
    }
  }
});

const _pyLHUR = defineEventHandler((event) => {
  const rules = resolveSecurityRules(event);
  if (rules.enabled && rules.corsHandler) {
    const { corsHandler } = rules;
    let origin;
    if (typeof corsHandler.origin === "string" && corsHandler.origin !== "*") {
      origin = [corsHandler.origin];
    } else {
      origin = corsHandler.origin;
    }
    if (origin && origin !== "*" && corsHandler.useRegExp) {
      origin = origin.map((o) => new RegExp(o, "i"));
    }
    handleCors(event, {
      origin,
      methods: corsHandler.methods,
      allowHeaders: corsHandler.allowHeaders,
      exposeHeaders: corsHandler.exposeHeaders,
      credentials: corsHandler.credentials,
      maxAge: corsHandler.maxAge,
      preflight: corsHandler.preflight
    });
  }
});

const _vyPWNu = defineEventHandler((event) => {
  const rules = resolveSecurityRules(event);
  if (rules.enabled && rules.allowedMethodsRestricter) {
    const { allowedMethodsRestricter } = rules;
    const allowedMethods = allowedMethodsRestricter.methods;
    if (allowedMethods !== "*" && !allowedMethods.includes(event.node.req.method)) {
      const methodNotAllowedError = {
        statusCode: 405,
        statusMessage: "Method not allowed"
      };
      if (allowedMethodsRestricter.throwError === false) {
        return methodNotAllowedError;
      }
      throw createError$1(methodNotAllowedError);
    }
  }
});

const storage = useStorage("#rate-limiter-storage");
const defaultRateLimiter = defaultSecurityConfig("", true).rateLimiter;
const _yXdTVw = defineEventHandler(async (event) => {
  const rules = resolveSecurityRules(event);
  const route = resolveSecurityRoute(event);
  if (rules.enabled && rules.rateLimiter) {
    const rateLimiter = defu$1(
      rules.rateLimiter,
      defaultRateLimiter
    );
    const ip = getIP(event, rateLimiter.ipHeader);
    if (rateLimiter.whiteList && rateLimiter.whiteList.includes(ip)) {
      return;
    }
    const url = ip + route;
    let storageItem = await storage.getItem(url);
    if (!storageItem) {
      await setStorageItem(rateLimiter, url);
    } else {
      if (typeof storageItem !== "object") {
        return;
      }
      const timeSinceFirstRateLimit = storageItem.date;
      const timeForInterval = storageItem.date + Number(rateLimiter.interval);
      if (Date.now() >= timeForInterval) {
        await setStorageItem(rateLimiter, url);
        storageItem = await storage.getItem(url);
      }
      const isLimited = timeSinceFirstRateLimit <= timeForInterval && storageItem.value === 0;
      if (isLimited) {
        const tooManyRequestsError = {
          statusCode: 429,
          statusMessage: "Too Many Requests"
        };
        if (rules.rateLimiter.headers) {
          setResponseHeader(event, "x-ratelimit-remaining", 0);
          setResponseHeader(event, "x-ratelimit-limit", rateLimiter.tokensPerInterval);
          setResponseHeader(event, "x-ratelimit-reset", timeForInterval);
        }
        if (rateLimiter.throwError === false) {
          return tooManyRequestsError;
        }
        throw createError$1(tooManyRequestsError);
      }
      const newItemDate = timeSinceFirstRateLimit > timeForInterval ? Date.now() : storageItem.date;
      const newStorageItem = { value: storageItem.value - 1, date: newItemDate };
      await storage.setItem(url, newStorageItem);
      const currentItem = await storage.getItem(url);
      if (currentItem && rateLimiter.headers) {
        setResponseHeader(event, "x-ratelimit-remaining", currentItem.value);
        setResponseHeader(event, "x-ratelimit-limit", rateLimiter.tokensPerInterval);
        setResponseHeader(event, "x-ratelimit-reset", timeForInterval);
      }
    }
  }
});
async function setStorageItem(rateLimiter, url) {
  const rateLimitedObject = { value: rateLimiter.tokensPerInterval, date: Date.now() };
  await storage.setItem(url, rateLimitedObject);
}
function getIP(event, customIpHeader) {
  const ip = customIpHeader ? getRequestHeader(event, customIpHeader) || "" : getRequestIP(event, { xForwardedFor: true }) || "";
  return ip;
}

const _jco4lZ = defineEventHandler(async (event) => {
  const rules = resolveSecurityRules(event);
  if (rules.enabled && rules.xssValidator) {
    const filterOpt = {
      ...rules.xssValidator,
      escapeHtml: void 0
    };
    if (rules.xssValidator.escapeHtml === false) {
      filterOpt.escapeHtml = (value) => value;
    }
    const xssValidator = new FilterXSS(filterOpt);
    if (event.node.req.socket.readyState !== "readOnly") {
      if (rules.xssValidator.methods && rules.xssValidator.methods.includes(
        event.node.req.method
      )) {
        const valueToFilter = event.node.req.method === "GET" ? getQuery(event) : event.node.req.headers["content-type"]?.includes(
          "multipart/form-data"
        ) ? await readMultipartFormData(event) : await readBody(event);
        if (valueToFilter && Object.keys(valueToFilter).length) {
          if (valueToFilter.statusMessage && valueToFilter.statusMessage !== "Bad Request") {
            return;
          }
          const stringifiedValue = JSON.stringify(valueToFilter);
          const processedValue = xssValidator.process(
            JSON.stringify(valueToFilter)
          );
          if (processedValue !== stringifiedValue) {
            const badRequestError = {
              statusCode: 400,
              statusMessage: "Bad Request"
            };
            if (rules.xssValidator.throwError === false) {
              return badRequestError;
            }
            throw createError$1(badRequestError);
          }
        }
      }
    }
  }
});

const r=Object.create(null),i=e=>globalThis.process?.env||globalThis._importMeta_.env||globalThis.Deno?.env.toObject()||globalThis.__env__||(e?r:globalThis),o=new Proxy(r,{get(e,s){return i()[s]??r[s]},has(e,s){const E=i();return s in E||s in r},set(e,s,E){const B=i(true);return B[s]=E,true},deleteProperty(e,s){if(!s)return  false;const E=i(true);return delete E[s],true},ownKeys(){const e=i(true);return Object.keys(e)}}),t=typeof process<"u"&&process.env&&"production"||"",f=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:true}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:true}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:true}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:false}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:false}],["VERCEL","VERCEL_ENV",{ci:false}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:false}],["CODESANDBOX","CODESANDBOX_HOST",{ci:false}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:true}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:true}]];function b(){if(globalThis.process?.env)for(const e of f){const s=e[1]||e[0];if(globalThis.process?.env[s])return {name:e[0].toLowerCase(),...e[2]}}return globalThis.process?.env?.SHELL==="/bin/jsh"&&globalThis.process?.versions?.webcontainer?{name:"stackblitz",ci:false}:{name:"",ci:false}}const l=b();l.name;function n(e){return e?e!=="false":false}const I=globalThis.process?.platform||"",T=n(o.CI)||l.ci!==false,R=n(globalThis.process?.stdout&&globalThis.process?.stdout.isTTY);n(o.DEBUG);const a=t==="test"||n(o.TEST),h=t==="dev"||t==="development";n(o.MINIMAL)||T||a||!R;const A=/^win/i.test(I);!n(o.NO_COLOR)&&(n(o.FORCE_COLOR)||(R||A)&&o.TERM!=="dumb"||T);const C=(globalThis.process?.versions?.node||"").replace(/^v/,"")||null;Number(C?.split(".")[0])||null;const W=globalThis.process||Object.create(null),_={versions:{}};new Proxy(W,{get(e,s){if(s==="env")return o;if(s in e)return e[s];if(s in _)return _[s]}});const O=globalThis.process?.release?.name==="node",c=!!globalThis.Bun||!!globalThis.process?.versions?.bun,D=!!globalThis.Deno,L=!!globalThis.fastly,S=!!globalThis.Netlify,u=!!globalThis.EdgeRuntime,N=globalThis.navigator?.userAgent==="Cloudflare-Workers",F=[[S,"netlify"],[u,"edge-light"],[N,"workerd"],[L,"fastly"],[D,"deno"],[c,"bun"],[O,"node"]];function G(){const e=F.find(s=>s[0]);if(e)return {name:e[1]}}const P=G();P?.name||"";

function isLocalhostHost(host) {
  if (!host || host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("0.0.0.0"))
    return true;
  const hostname = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host;
  return hostname === "[::1]" || hostname === "::1" || hostname === "[::]" || hostname === "::";
}
function extractHostname(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    return close !== -1 ? host.slice(0, close + 1) : host;
  }
  const colonCount = host.split(":").length - 1;
  return colonCount === 1 ? host.slice(0, host.indexOf(":")) : host;
}
function splitHostPort(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    const hostname = close !== -1 ? host.slice(0, close + 1) : host;
    const port = close !== -1 && host[close + 1] === ":" ? host.slice(close + 2) : "";
    const normalized = hostname === "[::1]" || hostname === "[::]" ? "localhost" : hostname;
    return { host: normalized, port };
  }
  if (host === "0.0.0.0" || host.startsWith("0.0.0.0:")) {
    const i = host.indexOf(":");
    return { host: "localhost", port: i !== -1 ? host.slice(i + 1) : "" };
  }
  const colonCount = host.split(":").length - 1;
  if (colonCount === 1) {
    const i = host.indexOf(":");
    return { host: host.slice(0, i), port: host.slice(i + 1) };
  }
  if (colonCount > 1) {
    const normalized = host === "::1" || host === "::" ? "localhost" : `[${host}]`;
    return { host: normalized, port: "" };
  }
  return { host, port: "" };
}
function getNitroOrigin$1(ctx = {}) {
  const isDev = ctx.isDev ?? h;
  const isPrerender = ctx.isPrerender ?? !!o.prerender;
  let host = "";
  let port = "";
  let protocol = o.NITRO_SSL_CERT && o.NITRO_SSL_KEY ? "https" : "http";
  if (isDev || isPrerender) {
    const devEnv = o.__NUXT_DEV__ || o.NUXT_VITE_NODE_OPTIONS;
    if (devEnv) {
      const parsed = JSON.parse(devEnv);
      const origin = parsed.proxy?.url || parsed.baseURL?.replace("/__nuxt_vite_node__", "");
      host = origin.replace(/^https?:\/\//, "").replace(/\/$/, "");
      protocol = origin.startsWith("https") ? "https" : "http";
    }
  }
  if (isDev && isLocalhostHost(host) && ctx.requestHost) {
    const reqHost = extractHostname(ctx.requestHost);
    if (reqHost && !isLocalhostHost(reqHost)) {
      host = ctx.requestHost;
      protocol = ctx.requestProtocol || protocol;
    }
  }
  if (!host && ctx.requestHost) {
    host = ctx.requestHost;
    protocol = ctx.requestProtocol || protocol;
  }
  if (!host) {
    host = o.NITRO_HOST || o.HOST || "";
    if (isDev)
      port = o.NITRO_PORT || o.PORT || "3000";
  }
  const split = splitHostPort(host);
  host = split.host;
  if (split.port)
    port = split.port;
  host = o.NUXT_SITE_HOST_OVERRIDE || host;
  port = o.NUXT_SITE_PORT_OVERRIDE || port;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    protocol = host.startsWith("https://") ? "https" : "http";
    host = host.replace(/^https?:\/\//, "");
  } else if (!isDev && (!host || !isLocalhostHost(host))) {
    protocol = "https";
  }
  return `${protocol}://${host}${port ? `:${port}` : ""}/`;
}

function getNitroOrigin(e) {
  return getNitroOrigin$1({
    isDev: false,
    isPrerender: false,
    requestHost: e ? getRequestHost(e, { xForwardedHost: true }) : void 0,
    requestProtocol: e ? getRequestProtocol(e, { xForwardedProto: true }) : void 0
  });
}

const _4f3Rzc = eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return;
  const runtimeConfig = useRuntimeConfig(e);
  const config = runtimeConfig["nuxt-site-config"];
  const nitroApp = useNitroApp();
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug
  });
  const nitroOrigin = getNitroOrigin(e);
  e.context.siteConfigNitroOrigin = nitroOrigin;
  {
    siteConfig.push({
      _context: "nitro:init",
      _priority: -4,
      url: nitroOrigin
    });
  }
  siteConfig.push({
    _context: "runtimeEnv",
    _priority: 0,
    ...runtimeConfig.site || {},
    ...runtimeConfig.public.site || {},
    ...envSiteConfig(globalThis._importMeta_.env || {})
    // just in-case, shouldn't be needed
  });
  const buildStack = config.stack || [];
  buildStack.forEach((c) => siteConfig.push(c));
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: "route-rules",
      ...e.context._nitro.routeRules.site
    });
  }
  if (config.multiTenancy) {
    const host = parseURL(nitroOrigin).host?.replace(/:\d+$/, "") || "";
    const tenant = config.multiTenancy?.find((t) => t.hosts.includes(host));
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: 0,
        ...tenant.config
      });
    }
  }
  const ctx = { siteConfig, event: e };
  await nitroApp.hooks.callHook("site-config:init", ctx);
  e.context.siteConfig = ctx.siteConfig;
  e.context._initedSiteConfig = true;
});

function resolveSitePath(pathOrUrl, options) {
  let path = pathOrUrl;
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    const parsed = parseURL(pathOrUrl);
    path = parsed.pathname;
  }
  const base = withLeadingSlash(options.base || "/");
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : "");
  if (base !== "/" && origin.endsWith(base)) {
    origin = origin.slice(0, origin.indexOf(base));
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || "/") : origin;
  const resolvedUrl = withBase(path, baseWithOrigin);
  return path === "/" && !options.withBase ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl);
}
const fileExtensions = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "markdown",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  // Audio
  "mp3",
  "wav",
  "flac",
  "ogg",
  "opus",
  "m4a",
  "aac",
  "midi",
  "mid",
  // Video
  "mp4",
  "avi",
  "mkv",
  "mov",
  "wmv",
  "flv",
  "webm",
  // Web
  "html",
  "css",
  "js",
  "json",
  "xml",
  "tsx",
  "jsx",
  "ts",
  "vue",
  "svelte",
  "xsl",
  "rss",
  "atom",
  // Programming
  "php",
  "py",
  "rb",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  // Data formats
  "csv",
  "tsv",
  "sql",
  "yaml",
  "yml",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  // Executables/Binaries
  "exe",
  "msi",
  "apk",
  "ipa",
  "dmg",
  "iso",
  "bin",
  // Scripts/Config
  "bat",
  "cmd",
  "sh",
  "env",
  "htaccess",
  "conf",
  "toml",
  "ini",
  // Package formats
  "deb",
  "rpm",
  "jar",
  "war",
  // E-books
  "epub",
  "mobi",
  // Common temporary/backup files
  "log",
  "tmp",
  "bak",
  "old",
  "sav"
];
function isPathFile(path) {
  const lastSegment = path.split("/").pop();
  const ext = (lastSegment || path).match(/\.[0-9a-z]+$/i)?.[0];
  return ext && fileExtensions.includes(ext.replace(".", ""));
}
function fixSlashes(trailingSlash, pathOrUrl) {
  const $url = parseURL(pathOrUrl);
  if (isPathFile($url.pathname))
    return pathOrUrl;
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname);
  return `${$url.protocol ? `${$url.protocol}//` : ""}${$url.host || ""}${fixedPath}${$url.search || ""}${$url.hash || ""}`;
}

function createSitePathResolver(e, options = {}) {
  const siteConfig = getSiteConfig(e);
  const nitroOrigin = getNitroOrigin(e);
  const nuxtBase = useRuntimeConfig(e).app.baseURL || "/";
  return (path) => {
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || false ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    });
  };
}
function withSiteUrl(e, path, options = {}) {
  const siteConfig = e.context.siteConfig?.get();
  let siteUrl = e.context.siteConfigNitroOrigin;
  if ((options.canonical !== false || false) && siteConfig.url)
    siteUrl = siteConfig.url;
  return resolveSitePath(path, {
    absolute: true,
    siteUrl,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase
  });
}

function getSiteIndexable(e) {
  const { env, indexable } = getSiteConfig(e);
  if (typeof indexable !== "undefined")
    return String(indexable) === "true";
  return env === "production";
}

function useSiteConfig(e, _options) {
  return getSiteConfig(e, _options);
}

function getSiteRobotConfig(e) {
  const query = getQuery(e);
  const hints = [];
  const { groups, debug } = useRuntimeConfigNuxtRobots(e);
  let indexable = getSiteIndexable(e);
  const queryIndexableEnabled = String(query.mockProductionEnv) === "true" || query.mockProductionEnv === "";
  if (debug || false) {
    const { _context } = getSiteConfig(e, { debug: debug || false });
    if (queryIndexableEnabled) {
      indexable = true;
      hints.push("You are mocking a production enviroment with ?mockProductionEnv query.");
    } else if (!indexable && _context.indexable === "nuxt-robots:config") {
      hints.push("You are blocking indexing with your Nuxt Robots config.");
    } else if (!queryIndexableEnabled && !_context.indexable) {
      hints.push(`Indexing is blocked in development. You can mock a production environment with ?mockProductionEnv query.`);
    } else if (!indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is blocked by site config set by ${_context.indexable}.`);
    } else if (indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is enabled from ${_context.indexable}.`);
    }
  }
  if (groups.some((g) => g.userAgent.includes("*") && g.disallow.includes("/"))) {
    indexable = false;
    hints.push("You are blocking all user agents with a wildcard `Disallow /`.");
  } else if (groups.some((g) => g.disallow.includes("/"))) {
    hints.push("You are blocking specific user agents with `Disallow /`.");
  }
  return { indexable, hints };
}

const _AfERpf = defineEventHandler(async (e) => {
  const nitroApp = useNitroApp();
  const { indexable} = getSiteRobotConfig(e);
  const { credits, isNuxtContentV2, cacheControl } = useRuntimeConfigNuxtRobots(e);
  let robotsTxtCtx = {
    sitemaps: [],
    groups: [
      {
        allow: [],
        comment: [],
        userAgent: ["*"],
        disallow: ["/"]
      }
    ]
  };
  if (indexable) {
    robotsTxtCtx = await resolveRobotsTxtContext(e);
    robotsTxtCtx.sitemaps = [...new Set(
      asArray(robotsTxtCtx.sitemaps).map((s) => !s.startsWith("http") ? withSiteUrl(e, s, { withBase: true}) : s)
    )];
    if (isNuxtContentV2) {
      const contentWithRobotRules = await e.$fetch("/__robots__/nuxt-content.json", {
        headers: {
          Accept: "application/json"
        }
      });
      if (String(contentWithRobotRules).trim().startsWith("<!DOCTYPE")) {
        logger$1.error("Invalid HTML returned from /__robots__/nuxt-content.json, skipping.");
      } else {
        for (const group of robotsTxtCtx.groups) {
          if (group.userAgent.includes("*")) {
            group.disallow.push(...contentWithRobotRules);
            group.disallow = group.disallow.filter(Boolean);
          }
        }
      }
    }
  }
  let robotsTxt = generateRobotsTxt(robotsTxtCtx);
  if (credits) {
    robotsTxt = [
      `# START nuxt-robots (${indexable ? "indexable" : "indexing disabled"})`,
      robotsTxt,
      "# END nuxt-robots"
    ].filter(Boolean).join("\n");
  }
  setHeader(e, "Content-Type", "text/plain; charset=utf-8");
  setHeader(e, "Cache-Control", globalThis._importMeta_.test || !cacheControl ? "no-store" : cacheControl);
  const hookCtx = { robotsTxt, e };
  await nitroApp.hooks.callHook("robots:robots-txt", hookCtx);
  return hookCtx.robotsTxt;
});

function withoutQuery$1(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher$1(e) {
  const { nitro, app } = useRuntimeConfig(e);
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (path) => {
    return defu$2({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(withoutTrailingSlash(withoutQuery$1(path)), app.baseURL)
    ).reverse());
  };
}

function getPathRobotConfig(e, options) {
  const runtimeConfig = useRuntimeConfig(e);
  const { robotsDisabledValue, robotsEnabledValue, isNuxtContentV2 } = useRuntimeConfigNuxtRobots(e);
  if (!options?.skipSiteIndexable) {
    if (!getSiteRobotConfig(e).indexable) {
      return {
        rule: robotsDisabledValue,
        indexable: false,
        debug: {
          source: "Site Config"
        }
      };
    }
  }
  const path = options?.path || e.path;
  let userAgent = options?.userAgent;
  if (!userAgent) {
    try {
      userAgent = getRequestHeader(e, "User-Agent");
    } catch {
    }
  }
  const nitroApp = useNitroApp();
  const groups = [
    // run explicit user agent matching first
    ...nitroApp._robots.ctx.groups.filter((g) => {
      if (userAgent) {
        return g.userAgent.some((ua) => ua.toLowerCase().includes(userAgent.toLowerCase()));
      }
      return false;
    }),
    // run wildcard matches second
    ...nitroApp._robots.ctx.groups.filter((g) => g.userAgent.includes("*"))
  ];
  for (const group of groups) {
    if (group._indexable === false) {
      return {
        indexable: false,
        rule: robotsDisabledValue,
        debug: {
          source: "/robots.txt",
          line: JSON.stringify(group)
        }
      };
    }
    const robotsTxtRule = matchPathToRule(path, group._rules || []);
    if (robotsTxtRule) {
      if (!robotsTxtRule.allow) {
        return {
          indexable: false,
          rule: robotsDisabledValue,
          debug: {
            source: "/robots.txt",
            line: `Disallow: ${robotsTxtRule.pattern}`
          }
        };
      }
      break;
    }
  }
  if (isNuxtContentV2 && nitroApp._robots?.nuxtContentUrls?.has(withoutTrailingSlash(path))) {
    return {
      indexable: false,
      rule: robotsDisabledValue,
      debug: {
        source: "Nuxt Content"
      }
    };
  }
  const { pageMetaRobots } = useRuntimeConfigNuxtRobots(e);
  const pageMetaRule = pageMetaRobots?.[withoutTrailingSlash(path)];
  if (typeof pageMetaRule !== "undefined") {
    const normalised = normaliseRobotsRouteRule({ robots: pageMetaRule });
    if (normalised && (typeof normalised.allow !== "undefined" || typeof normalised.rule !== "undefined")) {
      return {
        indexable: normalised.allow ?? false,
        rule: normalised.rule || (normalised.allow ? robotsEnabledValue : robotsDisabledValue),
        debug: {
          source: "Page Meta"
        }
      };
    }
  }
  nitroApp._robotsRuleMatcher = nitroApp._robotsRuleMatcher || createNitroRouteRuleMatcher$1(e);
  let robotRouteRules = nitroApp._robotsRuleMatcher(path);
  let routeRulesPath = path;
  if (runtimeConfig.public?.i18n?.locales && typeof robotRouteRules.robots === "undefined") {
    const { locales } = runtimeConfig.public.i18n;
    const locale = locales.find((l) => routeRulesPath.startsWith(`/${l.code}`));
    if (locale) {
      routeRulesPath = routeRulesPath.replace(`/${locale.code}`, "");
      robotRouteRules = nitroApp._robotsRuleMatcher(routeRulesPath);
    }
  }
  const routeRules = normaliseRobotsRouteRule(robotRouteRules);
  if (routeRules && (typeof routeRules.allow !== "undefined" || typeof routeRules.rule !== "undefined")) {
    return {
      indexable: routeRules.allow ?? false,
      rule: routeRules.rule || (routeRules.allow ? robotsEnabledValue : robotsDisabledValue),
      debug: {
        source: "Route Rules"
      }
    };
  }
  return {
    indexable: true,
    rule: robotsEnabledValue
  };
}

const _cdgEvJ = defineEventHandler(async (e) => {
  if (e.path === "/robots.txt" || e.path.startsWith("/__") || e.path.startsWith("/api") || e.path.startsWith("/_nuxt"))
    return;
  const nuxtRobotsConfig = useRuntimeConfigNuxtRobots(e);
  if (nuxtRobotsConfig) {
    const { header } = nuxtRobotsConfig;
    const robotConfig = getPathRobotConfig(e, { skipSiteIndexable: Boolean(getQuery(e)?.mockProductionEnv) });
    if (header) {
      setHeader(e, "X-Robots-Tag", robotConfig.rule);
    }
    e.context.robots = robotConfig;
  }
});

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();

const logger = createConsola({
  defaults: {
    tag: "@nuxt/sitemap"
  }
});
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value))
    obj[key] = Array.from(/* @__PURE__ */ new Set([...obj[key], ...value]));
  return obj[key];
});
function mergeOnKey(arr, key) {
  const seen = /* @__PURE__ */ new Map();
  let resultLength = 0;
  const result = Array.from({ length: arr.length });
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      const existingIndex = seen.get(k);
      result[existingIndex] = merger(item, result[existingIndex]);
    } else {
      seen.set(k, resultLength);
      result[resultLength++] = item;
    }
  }
  result.length = resultLength;
  return result;
}
function splitForLocales(path, locales) {
  const prefix = withLeadingSlash(path).split("/")[1];
  if (prefix && locales.includes(prefix))
    return [prefix, path.replace(`/${prefix}`, "")];
  return [null, path];
}
const StringifiedRegExpPattern = /\/(.*?)\/([gimsuy]*)$/;
function normalizeRuntimeFilters(input) {
  return (input || []).map((rule) => {
    if (rule instanceof RegExp || typeof rule === "string")
      return rule;
    const match = rule.regex.match(StringifiedRegExpPattern);
    if (match)
      return new RegExp(match[1], match[2]);
    return false;
  }).filter(Boolean);
}
function createPathFilter(options = {}) {
  const urlFilter = createFilter(options);
  return (loc) => {
    let path = loc;
    try {
      path = parseURL(loc).pathname;
    } catch {
      return false;
    }
    return urlFilter(path);
  };
}
function findPageMapping(pathWithoutPrefix, pages) {
  const stripped = pathWithoutPrefix[0] === "/" ? pathWithoutPrefix.slice(1) : pathWithoutPrefix;
  const pageKey = stripped.endsWith("/index") ? stripped.slice(0, -6) || "index" : stripped || "index";
  if (pages[pageKey])
    return { mappings: pages[pageKey], paramSegments: [] };
  const sortedKeys = Object.keys(pages).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pageKey.startsWith(key + "/")) {
      const paramPath = pageKey.slice(key.length + 1);
      return { mappings: pages[key], paramSegments: paramPath.split("/") };
    }
  }
  return null;
}
function applyDynamicParams(customPath, paramSegments) {
  if (!paramSegments.length)
    return customPath;
  let i = 0;
  return customPath.replace(/\[[^\]]+\]/g, () => paramSegments[i++] || "");
}
function createFilter(options = {}) {
  const include = options.include || [];
  const exclude = options.exclude || [];
  if (include.length === 0 && exclude.length === 0)
    return () => true;
  const excludeRegex = exclude.filter((r) => r instanceof RegExp);
  const includeRegex = include.filter((r) => r instanceof RegExp);
  const excludeStrings = exclude.filter((r) => typeof r === "string");
  const includeStrings = include.filter((r) => typeof r === "string");
  const excludeMatcher = excludeStrings.length > 0 ? toRouteMatcher(createRouter$1({
    routes: Object.fromEntries(excludeStrings.map((r) => [r, true])),
    strictTrailingSlash: false
  })) : null;
  const includeMatcher = includeStrings.length > 0 ? toRouteMatcher(createRouter$1({
    routes: Object.fromEntries(includeStrings.map((r) => [r, true])),
    strictTrailingSlash: false
  })) : null;
  const excludeExact = new Set(excludeStrings);
  const includeExact = new Set(includeStrings);
  return function(path) {
    if (excludeRegex.some((r) => r.test(path)))
      return false;
    if (excludeExact.has(path))
      return false;
    if (excludeMatcher && excludeMatcher.matchAll(path).length > 0)
      return false;
    if (includeRegex.some((r) => r.test(path)))
      return true;
    if (includeExact.has(path))
      return true;
    if (includeMatcher && includeMatcher.matchAll(path).length > 0)
      return true;
    return include.length === 0;
  };
}

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function useSitemapRuntimeConfig(e) {
  const clone = JSON.parse(JSON.stringify(useRuntimeConfig(e).sitemap));
  for (const k in clone.sitemaps) {
    const sitemap = clone.sitemaps[k];
    sitemap.include = normalizeRuntimeFilters(sitemap.include);
    sitemap.exclude = normalizeRuntimeFilters(sitemap.exclude);
    clone.sitemaps[k] = sitemap;
  }
  return Object.freeze(clone);
}

const _GyfqSt = defineEventHandler(async (e) => {
  const fixPath = createSitePathResolver(e, { absolute: false, withBase: true });
  const { sitemapName: fallbackSitemapName, cacheMaxAgeSeconds, version, xslColumns, xslTips } = useSitemapRuntimeConfig();
  setHeader(e, "Content-Type", "application/xslt+xml");
  if (cacheMaxAgeSeconds)
    setHeader(e, "Cache-Control", `public, max-age=${cacheMaxAgeSeconds}, must-revalidate`);
  else
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  const { name: siteName, url: siteUrl } = useSiteConfig(e);
  const referrer = getHeader(e, "Referer") || "/";
  const referrerPath = parseURL(referrer).pathname;
  const isNotIndexButHasIndex = referrerPath !== "/sitemap.xml" && referrerPath !== "/sitemap_index.xml" && referrerPath.endsWith(".xml");
  const sitemapName = parseURL(referrer).pathname.split("/").pop()?.split("-sitemap")[0] || fallbackSitemapName;
  const title = `${siteName}${sitemapName !== "sitemap.xml" ? ` - ${sitemapName === "sitemap_index.xml" ? "index" : sitemapName}` : ""}`.replace(/&/g, "&amp;");
  getQuery$1(referrer).canonical;
  const debugUrl = xmlEscape(withQuery("/__sitemap__/debug.json", { sitemap: sitemapName }));
  xmlEscape(referrerPath);
  xmlEscape(withQuery(referrerPath, { canonical: "" }));
  const fetchErrors = [];
  const xslQuery = getQuery(e);
  if (xslQuery.error_messages) {
    const errorMessages = xslQuery.error_messages;
    const errorUrls = xslQuery.error_urls;
    if (errorMessages) {
      const messages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
      const urls = Array.isArray(errorUrls) ? errorUrls : errorUrls ? [errorUrls] : [];
      messages.forEach((msg, i) => {
        const errorParts = [xmlEscape(msg)];
        if (urls[i])
          errorParts.push(xmlEscape(urls[i]));
        fetchErrors.push(`<span class="error-item">${errorParts.join(" \u2014 ")}</span>`);
      });
    }
  }
  const hasRuntimeErrors = fetchErrors.length > 0;
  let columns = [...xslColumns];
  if (!columns.length) {
    columns = [
      { label: "URL", width: "50%" },
      { label: "Images", width: "25%", select: "count(image:image)" },
      { label: "Last Updated", width: "25%", select: "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))" }
    ];
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          :root {
            --accent: #00dc82;
            --accent-hover: #00b86b;
            --bg: #0a0a0a;
            --bg-elevated: #141414;
            --bg-subtle: #1a1a1a;
            --border: #262626;
            --border-subtle: #1f1f1f;
            --text: #e5e5e5;
            --text-muted: #737373;
            --text-faint: #525252;
            --error: #ef4444;
            --error-bg: rgba(239,68,68,0.1);
            --warning: #f59e0b;
          }
          * { box-sizing: border-box; }
          body {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
            font-size: 13px;
            color: var(--text);
            background: var(--bg);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; transition: color 0.15s; }
          a:hover { color: var(--accent); }

          /* Debug bar (dev only) */
          .debug-bar {
            position: fixed;
            bottom: 0.75rem;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0 1rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 100;
            font-size: 11px;
          }
          .debug-bar-brand {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            text-decoration: none;
          }
          .debug-bar-brand:hover { color: var(--text); }
          .debug-bar-brand svg { flex-shrink: 0; }
          .debug-bar-hint {
            color: var(--text-faint);
            margin-right: auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .debug-bar-hint code {
            background: var(--bg-subtle);
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-size: 10px;
          }
          .mode-badge {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
          }
          .mode-dev { background: rgba(245,158,11,0.15); color: var(--warning); }
          .mode-prod { background: rgba(0,220,130,0.12); color: var(--accent); }
          .mode-toggle {
            display: inline-flex;
            border-radius: 4px;
            overflow: hidden;
            background: var(--bg-subtle);
            padding: 2px;
            gap: 1px;
          }
          .mode-toggle a {
            padding: 0.2rem 0.4rem;
            font-size: 9px;
            font-weight: 500;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 2px;
            transition: all 0.15s;
          }
          .mode-toggle a:hover { color: var(--text); }
          .mode-toggle a.active {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 10px;
            font-weight: 500;
            transition: all 0.15s;
          }
          .btn-primary {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn-primary:hover { background: var(--accent-hover); color: #0a0a0a; }
          .btn svg { width: 12px; height: 12px; }

          /* Error banner */
          .error-banner {
            background: var(--error-bg);
            border-bottom: 1px solid rgba(239,68,68,0.2);
            padding: 0.75rem 1.5rem;
            color: #fca5a5;
            font-size: 12px;
          }
          .error-banner strong { color: var(--error); }
          .error-item { display: block; margin-top: 0.375rem; color: #fca5a5; }
          .error-debug-link {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.625rem;
            padding: 0.25rem 0.5rem;
            background: var(--error);
            color: #fff;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.15s;
          }
          .error-debug-link:hover { background: #dc2626; color: #fff; }

          /* Main content */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
          }
          .header {
            margin-bottom: 1.25rem;
          }
          .header h1 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.25rem 0;
            color: var(--text);
          }
          .header-meta {
            color: var(--text-muted);
            font-size: 12px;
          }
          .header-meta a {
            color: var(--text-muted);
            text-decoration: underline;
            text-decoration-color: var(--border);
            text-underline-offset: 2px;
          }
          .header-meta a:hover { color: var(--accent); text-decoration-color: var(--accent); }

          /* Table */
          .table-wrap {
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-elevated);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding: 0.625rem 1rem;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            background: var(--bg-subtle);
            border-bottom: 1px solid var(--border);
          }
          td {
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            color: var(--text);
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: rgba(255,255,255,0.02); }
          td a {
            text-decoration: none;
            word-break: break-all;
            color: var(--text);
          }
          td a:hover { color: var(--accent); }
          .inline-warning {
            font-size: 11px;
            color: var(--warning);
            margin-top: 0.25rem;
            line-height: 1.4;
          }
          .inline-warning::before {
            content: "\u26A0 ";
          }
          .count {
            display: inline-block;
            min-width: 1.25rem;
            padding: 0.125rem 0.375rem;
            background: var(--bg-subtle);
            border-radius: 4px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
            font-variant-numeric: tabular-nums;
          }
          .count:empty::before { content: "0"; }

          /* Light mode */
          @media (prefers-color-scheme: light) {
            :root {
              --accent: #00a963;
              --accent-hover: #008f54;
              --bg: #ffffff;
              --bg-elevated: #f5f5f5;
              --bg-subtle: #ebebeb;
              --border: #d4d4d4;
              --border-subtle: #e5e5e5;
              --text: #171717;
              --text-muted: #525252;
              --text-faint: #737373;
              --error: #dc2626;
              --error-bg: rgba(220,38,38,0.08);
              --warning: #b45309;
            }
            tr:hover td { background: rgba(0,0,0,0.02); }
            .btn-primary { color: #fff; }
            .btn-primary:hover { color: #fff; }
            .mode-toggle a.active { color: #fff; }
            .error-banner { color: #991b1b; }
            .error-item { color: #b91c1c; }
            .error-debug-link { color: #fff; }
            .error-debug-link:hover { color: #fff; }
          }

          .debug-bar-version {
            color: var(--text-faint);
            font-size: 10px;
          }

          /* Responsive */
          @media (max-width: 640px) {
            .debug-bar { padding: 0 0.75rem; gap: 0.5rem; width: 95%; }
            .debug-bar-brand span { display: none; }
            .debug-bar-hint { display: none; }
            .debug-bar-version { display: none; }
            .mode-badge { display: none; }
            .container { padding: 1rem; }
            th, td { padding: 0.5rem 0.75rem; }
          }
          ${""}
        </style>
      </head>
      <body>
        ${hasRuntimeErrors ? `<div class="error-banner">
            <strong>Sitemap Generation Errors</strong>
            ${fetchErrors.join("")}
            <a href="${debugUrl}" target="_blank" class="error-debug-link">View Debug Info \u2192</a>
          </div>` : ""}
        <div class="container">
          <div class="header">
            <h1>${xmlEscape(title)}</h1>
            <div class="header-meta">
              ${isNotIndexButHasIndex ? `Part of <a href="${xmlEscape(fixPath("/sitemap_index.xml"))}">${xmlEscape(fixPath("/sitemap_index.xml"))}</a> \xB7 ` : ""}
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps
              </xsl:if>
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs
              </xsl:if>
            </div>
          </div>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width:70%">Sitemap</th>
                    <th style="width:30%">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <xsl:variable name="sitemapURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <tr>
                      <td>
                        <a href="{$sitemapURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td>
                        <xsl:value-of
                          select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    ${columns.map((c) => `<th style="width:${c.width}">${c.label}</th>`).join("\n")}
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <xsl:variable name="itemURL">
                          <xsl:value-of select="sitemap:loc"/>
                        </xsl:variable>
                        <a href="{$itemURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                        ${""}
                      </td>
                      ${columns.filter((c) => c.label !== "URL").map((c) => `<td><span class="count"><xsl:value-of select="${c.select}"/></span></td>`).join("\n")}
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
        </div>
        ${""}
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
});

function withoutQuery(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [path === "/" ? path : withoutTrailingSlash(path), rules])
      )
    })
  );
  return (pathOrUrl) => {
    const path = pathOrUrl[0] === "/" ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname;
    const pathWithoutQuery = withoutQuery(path);
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(pathWithoutQuery === "/" ? pathWithoutQuery : withoutTrailingSlash(pathWithoutQuery), app.baseURL)
    ).reverse());
  };
}

function resolve(s, resolvers) {
  if (typeof s === "undefined")
    return void 0;
  const str = typeof s === "string" ? s : s.toString();
  if (!resolvers)
    return str;
  if (hasProtocol(str, { acceptRelative: true, strict: false }))
    return resolvers.fixSlashes(str);
  return resolvers.canonicalUrlResolver(str);
}
function removeTrailingSlash(s) {
  return s.replace(/\/(\?|#|$)/, "$1");
}
function preNormalizeEntry(_e, resolvers) {
  const input = typeof _e === "string" ? { loc: _e } : { ..._e };
  if (input.url && !input.loc) {
    input.loc = input.url;
  }
  delete input.url;
  if (typeof input.loc !== "string") {
    input.loc = "";
  }
  const skipEncoding = input._encoded === true;
  const e = input;
  e.loc = removeTrailingSlash(e.loc);
  e._abs = hasProtocol(e.loc, { acceptRelative: false, strict: false });
  try {
    e._path = e._abs ? parseURL(e.loc) : parsePath(e.loc);
  } catch {
    e._path = null;
  }
  if (e._path) {
    const search = e._path.search;
    const qs = search && search.length > 1 ? stringifyQuery(parseQuery(search)) : "";
    const pathname = skipEncoding ? e._path.pathname : encodePath(e._path.pathname);
    e._relativeLoc = `${pathname}${qs.length ? `?${qs}` : ""}`;
    if (e._path.host) {
      e.loc = stringifyParsedURL(e._path);
    } else {
      e.loc = e._relativeLoc;
    }
  } else if (!skipEncoding && !isEncoded(e.loc)) {
    e.loc = encodeURI(e.loc);
  }
  if (e.loc === "")
    e.loc = `/`;
  e.loc = resolve(e.loc, resolvers);
  e._key = `${e._sitemap || ""}${withoutTrailingSlash(e.loc)}`;
  return e;
}
function isEncoded(url) {
  try {
    return url !== decodeURIComponent(url);
  } catch {
    return false;
  }
}
function normaliseEntry(_e, defaults, resolvers) {
  const e = defu(_e, defaults);
  if (e.lastmod) {
    const date = normaliseDate(e.lastmod);
    if (date)
      e.lastmod = date;
    else
      delete e.lastmod;
  }
  if (!e.lastmod)
    delete e.lastmod;
  e.loc = resolve(e.loc, resolvers);
  if (e.alternatives) {
    const alternatives = e.alternatives.map((a) => ({ ...a }));
    for (const alt of alternatives) {
      if (typeof alt.href === "string") {
        alt.href = resolve(alt.href, resolvers);
      } else if (typeof alt.href === "object" && alt.href) {
        alt.href = resolve(alt.href.href, resolvers);
      }
    }
    e.alternatives = mergeOnKey(alternatives, "hreflang");
  }
  if (e.images) {
    const images = e.images.map((i) => ({ ...i }));
    for (const img of images) {
      img.loc = resolve(img.loc, resolvers);
    }
    e.images = mergeOnKey(images, "loc");
  }
  if (e.videos) {
    const videos = e.videos.map((v) => ({ ...v }));
    for (const video of videos) {
      if (video.content_loc) {
        video.content_loc = resolve(video.content_loc, resolvers);
      }
    }
    e.videos = mergeOnKey(videos, "content_loc");
  }
  return e;
}
const IS_VALID_W3C_DATE = [
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
  /^\d{4}-[01]\d-[0-3]\d$/,
  /^\d{4}-[01]\d$/,
  /^\d{4}$/
];
function isValidW3CDate(d) {
  return IS_VALID_W3C_DATE.some((r) => r.test(d));
}
function normaliseDate(d) {
  if (typeof d === "string") {
    const tIdx = d.indexOf("T");
    if (tIdx !== -1) {
      const t = d.slice(tIdx + 1);
      if (!t.includes("+") && !t.includes("-") && !t.includes("Z")) {
        d += "Z";
      }
    }
    if (!isValidW3CDate(d))
      return false;
    d = new Date(d);
    d.setMilliseconds(0);
    if (Number.isNaN(d.getTime()))
      return false;
  }
  const z = (n) => `0${n}`.slice(-2);
  const date = `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())}`;
  if (d.getUTCHours() > 0 || d.getUTCMinutes() > 0 || d.getUTCSeconds() > 0) {
    return `${date}T${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`;
  }
  return date;
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseFloat(value.trim());
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function parseInteger(value) {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseInt(value.trim(), 10);
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function extractUrlFromParsedElement(urlElement, warnings) {
  if (!isValidString(urlElement.loc)) {
    warnings.push({
      type: "validation",
      message: "URL entry missing required loc element",
      context: { url: String(urlElement.loc || "undefined") }
    });
    return null;
  }
  const urlObj = { loc: urlElement.loc };
  if (isValidString(urlElement.lastmod)) {
    urlObj.lastmod = urlElement.lastmod;
  }
  if (isValidString(urlElement.changefreq)) {
    const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (validFreqs.includes(urlElement.changefreq)) {
      urlObj.changefreq = urlElement.changefreq;
    } else {
      warnings.push({
        type: "validation",
        message: "Invalid changefreq value",
        context: { url: urlElement.loc, field: "changefreq", value: urlElement.changefreq }
      });
    }
  }
  const priority = parseNumber(urlElement.priority);
  if (priority !== void 0 && !Number.isNaN(priority)) {
    if (priority < 0 || priority > 1) {
      warnings.push({
        type: "validation",
        message: "Priority value should be between 0.0 and 1.0, clamping to valid range",
        context: { url: urlElement.loc, field: "priority", value: priority }
      });
    }
    urlObj.priority = Math.max(0, Math.min(1, priority));
  } else if (urlElement.priority !== void 0) {
    warnings.push({
      type: "validation",
      message: "Invalid priority value",
      context: { url: urlElement.loc, field: "priority", value: urlElement.priority }
    });
  }
  if (urlElement.image) {
    const images = Array.isArray(urlElement.image) ? urlElement.image : [urlElement.image];
    const validImages = images.map((img) => {
      if (isValidString(img.loc)) {
        return { loc: img.loc };
      } else {
        warnings.push({
          type: "validation",
          message: "Image missing required loc element",
          context: { url: urlElement.loc, field: "image.loc" }
        });
        return null;
      }
    }).filter((img) => img !== null);
    if (validImages.length > 0) {
      urlObj.images = validImages;
    }
  }
  if (urlElement.video) {
    const videos = Array.isArray(urlElement.video) ? urlElement.video : [urlElement.video];
    const validVideos = videos.map((video) => {
      const missingFields = [];
      if (!isValidString(video.title)) missingFields.push("title");
      if (!isValidString(video.thumbnail_loc)) missingFields.push("thumbnail_loc");
      if (!isValidString(video.description)) missingFields.push("description");
      if (!isValidString(video.content_loc)) missingFields.push("content_loc");
      if (missingFields.length > 0) {
        warnings.push({
          type: "validation",
          message: `Video missing required fields: ${missingFields.join(", ")}`,
          context: { url: urlElement.loc, field: "video" }
        });
        return null;
      }
      const videoObj = {
        title: video.title,
        thumbnail_loc: video.thumbnail_loc,
        description: video.description,
        content_loc: video.content_loc
      };
      if (isValidString(video.player_loc)) {
        videoObj.player_loc = video.player_loc;
      }
      const duration = parseInteger(video.duration);
      if (duration !== void 0) {
        videoObj.duration = duration;
      } else if (video.duration !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video duration value",
          context: { url: urlElement.loc, field: "video.duration", value: video.duration }
        });
      }
      if (isValidString(video.expiration_date)) {
        videoObj.expiration_date = video.expiration_date;
      }
      const rating = parseNumber(video.rating);
      if (rating !== void 0) {
        if (rating < 0 || rating > 5) {
          warnings.push({
            type: "validation",
            message: "Video rating should be between 0.0 and 5.0",
            context: { url: urlElement.loc, field: "video.rating", value: rating }
          });
        }
        videoObj.rating = rating;
      } else if (video.rating !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video rating value",
          context: { url: urlElement.loc, field: "video.rating", value: video.rating }
        });
      }
      const viewCount = parseInteger(video.view_count);
      if (viewCount !== void 0) {
        videoObj.view_count = viewCount;
      } else if (video.view_count !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video view_count value",
          context: { url: urlElement.loc, field: "video.view_count", value: video.view_count }
        });
      }
      if (isValidString(video.publication_date)) {
        videoObj.publication_date = video.publication_date;
      }
      if (isValidString(video.family_friendly)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.family_friendly)) {
          videoObj.family_friendly = video.family_friendly;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video family_friendly value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.family_friendly", value: video.family_friendly }
          });
        }
      }
      if (isValidString(video.requires_subscription)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.requires_subscription)) {
          videoObj.requires_subscription = video.requires_subscription;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video requires_subscription value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.requires_subscription", value: video.requires_subscription }
          });
        }
      }
      if (isValidString(video.live)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.live)) {
          videoObj.live = video.live;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video live value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.live", value: video.live }
          });
        }
      }
      if (video.restriction && typeof video.restriction === "object") {
        const restriction = video.restriction;
        if (isValidString(restriction.relationship) && isValidString(restriction["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(restriction.relationship)) {
            videoObj.restriction = {
              relationship: restriction.relationship,
              restriction: restriction["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video restriction relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.restriction.relationship", value: restriction.relationship }
            });
          }
        }
      }
      if (video.platform && typeof video.platform === "object") {
        const platform = video.platform;
        if (isValidString(platform.relationship) && isValidString(platform["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(platform.relationship)) {
            videoObj.platform = {
              relationship: platform.relationship,
              platform: platform["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video platform relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.platform.relationship", value: platform.relationship }
            });
          }
        }
      }
      if (video.price) {
        const prices = Array.isArray(video.price) ? video.price : [video.price];
        const validPrices = prices.map((price) => {
          const priceValue = price["#text"];
          if (priceValue == null || typeof priceValue !== "string" && typeof priceValue !== "number") {
            warnings.push({
              type: "validation",
              message: "Video price missing value",
              context: { url: urlElement.loc, field: "video.price" }
            });
            return null;
          }
          const validTypes = ["rent", "purchase", "package", "subscription"];
          if (price.type && !validTypes.includes(price.type)) {
            warnings.push({
              type: "validation",
              message: `Invalid video price type "${price.type}", should be one of: ${validTypes.join(", ")}`,
              context: { url: urlElement.loc, field: "video.price.type", value: price.type }
            });
          }
          return {
            price: String(priceValue),
            currency: price.currency,
            type: price.type
          };
        }).filter((p) => p !== null);
        if (validPrices.length > 0) {
          videoObj.price = validPrices;
        }
      }
      if (video.uploader && typeof video.uploader === "object") {
        const uploader = video.uploader;
        if (isValidString(uploader.info) && isValidString(uploader["#text"])) {
          videoObj.uploader = {
            uploader: uploader["#text"],
            info: uploader.info
          };
        } else {
          warnings.push({
            type: "validation",
            message: "Video uploader missing required info or name",
            context: { url: urlElement.loc, field: "video.uploader" }
          });
        }
      }
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        const validTags = tags.filter(isValidString);
        if (validTags.length > 0) {
          videoObj.tag = validTags;
        }
      }
      return videoObj;
    }).filter((video) => video !== null);
    if (validVideos.length > 0) {
      urlObj.videos = validVideos;
    }
  }
  if (urlElement.link) {
    const links = Array.isArray(urlElement.link) ? urlElement.link : [urlElement.link];
    const alternatives = links.map((link) => {
      if (link.rel === "alternate" && isValidString(link.hreflang) && isValidString(link.href)) {
        return {
          hreflang: link.hreflang,
          href: link.href
        };
      } else {
        warnings.push({
          type: "validation",
          message: 'Alternative link missing required rel="alternate", hreflang, or href',
          context: { url: urlElement.loc, field: "link" }
        });
        return null;
      }
    }).filter((alt) => alt !== null);
    if (alternatives.length > 0) {
      urlObj.alternatives = alternatives;
    }
  }
  if (urlElement.news && typeof urlElement.news === "object") {
    const news = urlElement.news;
    if (isValidString(news.title) && isValidString(news.publication_date) && news.publication && isValidString(news.publication.name) && isValidString(news.publication.language)) {
      urlObj.news = {
        title: news.title,
        publication_date: news.publication_date,
        publication: {
          name: news.publication.name,
          language: news.publication.language
        }
      };
    } else {
      warnings.push({
        type: "validation",
        message: "News entry missing required fields (title, publication_date, publication.name, publication.language)",
        context: { url: urlElement.loc, field: "news" }
      });
    }
  }
  return Object.fromEntries(
    Object.entries(urlObj).filter(
      ([_, value]) => value != null && (!Array.isArray(value) || value.length > 0)
    )
  );
}
async function parseSitemapXml(xml) {
  const warnings = [];
  if (!xml) {
    throw new Error("Empty XML input provided");
  }
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    isArray: (tagName) => ["url", "image", "video", "link", "tag", "price"].includes(tagName),
    removeNSPrefix: true,
    parseAttributeValue: false,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true
  });
  try {
    const parsed = parser.parse(xml);
    if (!parsed?.urlset) {
      throw new Error("XML does not contain a valid urlset element");
    }
    if (!parsed.urlset.url) {
      throw new Error("Sitemap contains no URL entries");
    }
    const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    const validUrls = urls.map((url) => extractUrlFromParsedElement(url, warnings)).filter((url) => url !== null);
    if (validUrls.length === 0 && urls.length > 0) {
      warnings.push({
        type: "validation",
        message: "No valid URLs found in sitemap after validation"
      });
    }
    return { urls: validUrls, warnings };
  } catch (error) {
    if (error instanceof Error && (error.message === "Empty XML input provided" || error.message === "XML does not contain a valid urlset element" || error.message === "Sitemap contains no URL entries")) {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

new XMLParser({
  isArray: (tagName) => tagName === "sitemap",
  removeNSPrefix: true,
  trimValues: true
});

function normalizeSourceInput(source) {
  if (typeof source === "string") {
    return { context: { name: "hook" }, fetch: source };
  }
  if (Array.isArray(source)) {
    return { context: { name: "hook" }, fetch: source };
  }
  return source;
}
async function tryFetchWithFallback(url, options, event) {
  const isExternalUrl = !url.startsWith("/");
  if (isExternalUrl) {
    const strategies = [
      // Strategy 1: Use globalThis.$fetch (original approach)
      () => globalThis.$fetch(url, options),
      // Strategy 2: If event is available, try using event context even for external URLs
      event ? () => event.$fetch(url, options) : null,
      // Strategy 3: Use native fetch as last resort
      () => $fetch(url, options)
    ].filter(Boolean);
    let lastError = null;
    for (const strategy of strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    throw lastError;
  }
  const fetchContainer = url.startsWith("/") && event ? event : globalThis;
  return await fetchContainer.$fetch(url, options);
}
async function fetchDataSource(input, event) {
  const context = typeof input.context === "string" ? { name: input.context } : input.context || { name: "fetch" };
  const url = typeof input.fetch === "string" ? input.fetch : input.fetch[0];
  const options = typeof input.fetch === "string" ? {} : input.fetch[1];
  const start = Date.now();
  const isExternalUrl = !url.startsWith("/");
  const timeout = isExternalUrl ? 1e4 : options.timeout || 5e3;
  const timeoutController = new AbortController();
  const abortRequestTimeout = setTimeout(() => timeoutController.abort(), timeout);
  try {
    let isMaybeErrorResponse = false;
    const isXmlRequest = parseURL(url).pathname.endsWith(".xml");
    const mergedHeaders = defu(
      options?.headers,
      {
        Accept: isXmlRequest ? "text/xml" : "application/json"
      },
      event && !isExternalUrl ? { host: getRequestHost(event, { xForwardedHost: true }) } : {}
    );
    const fetchOptions = {
      ...options,
      responseType: isXmlRequest ? "text" : "json",
      signal: timeoutController.signal,
      headers: mergedHeaders,
      // Use ofetch's built-in retry for external sources
      ...isExternalUrl && {
        retry: 2,
        retryDelay: 200
      },
      // @ts-expect-error untyped
      onResponse({ response }) {
        if (typeof response._data === "string" && response._data.startsWith("<!DOCTYPE html>"))
          isMaybeErrorResponse = true;
      }
    };
    const res = await tryFetchWithFallback(url, fetchOptions, event);
    const timeTakenMs = Date.now() - start;
    if (isMaybeErrorResponse) {
      return {
        ...input,
        context,
        urls: [],
        timeTakenMs,
        error: "Received HTML response instead of JSON"
      };
    }
    let urls = [];
    if (typeof res === "object") {
      urls = res.urls || res;
    } else if (typeof res === "string" && parseURL(url).pathname.endsWith(".xml")) {
      const result = await parseSitemapXml(res);
      urls = result.urls;
    }
    return {
      ...input,
      context,
      timeTakenMs,
      urls
    };
  } catch (_err) {
    const error = _err;
    if (isExternalUrl) {
      const errorInfo = {
        url,
        timeout,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        method: options?.method || "GET"
      };
      logger.error("Failed to fetch external source.", errorInfo);
    } else {
      logger.error("Failed to fetch source.", { url, error: error.message });
    }
    return {
      ...input,
      context,
      urls: [],
      error: error.message,
      _isFailure: true
      // Mark as failure to prevent caching
    };
  } finally {
    if (abortRequestTimeout) {
      clearTimeout(abortRequestTimeout);
    }
  }
}
async function globalSitemapSources() {
  const m = await import('../virtual/global-sources.mjs');
  return [...m.sources];
}
async function childSitemapSources(definition) {
  if (!definition?._hasSourceChunk)
    return [];
  const m = await import('../virtual/child-sources.mjs');
  return [...m.sources[definition.sitemapName] || []];
}
async function resolveSitemapSources(sources, event) {
  return (await Promise.all(
    sources.map((source) => {
      const normalized = normalizeSourceInput(source);
      if ("urls" in normalized) {
        return {
          timeTakenMs: 0,
          ...normalized,
          urls: normalized.urls
        };
      }
      if (normalized.fetch)
        return fetchDataSource(normalized, event);
      return {
        ...normalized,
        error: "Invalid source"
      };
    })
  )).flat();
}

function sortInPlace(urls) {
  urls.sort((a, b) => {
    const aLoc = typeof a === "string" ? a : a.loc;
    const bLoc = typeof b === "string" ? b : b.loc;
    const aSegments = aLoc.split("/").length;
    const bSegments = bLoc.split("/").length;
    if (aSegments !== bSegments) {
      return aSegments - bSegments;
    }
    return aLoc.localeCompare(bLoc, void 0, { numeric: true });
  });
  return urls;
}

function parseChunkInfo(sitemapName, sitemaps, defaultChunkSize) {
  defaultChunkSize = defaultChunkSize || 1e3;
  if (typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName))) {
    return {
      isChunked: true,
      baseSitemapName: "sitemap",
      chunkIndex: Number(sitemapName),
      chunkSize: defaultChunkSize
    };
  }
  if (sitemapName.includes("-")) {
    const parts = sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const baseSitemapName = parts.join("-");
      const baseSitemap = sitemaps[baseSitemapName];
      if (baseSitemap && (baseSitemap.chunks || baseSitemap._isChunking)) {
        const chunkSize = typeof baseSitemap.chunks === "number" ? baseSitemap.chunks : baseSitemap.chunkSize || defaultChunkSize;
        return {
          isChunked: true,
          baseSitemapName,
          chunkIndex: Number(lastPart),
          chunkSize
        };
      }
    }
  }
  return {
    isChunked: false,
    baseSitemapName: sitemapName,
    chunkIndex: void 0,
    chunkSize: defaultChunkSize
  };
}
function sliceUrlsForChunk(urls, sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const startIndex = chunkInfo.chunkIndex * chunkInfo.chunkSize;
    const endIndex = (chunkInfo.chunkIndex + 1) * chunkInfo.chunkSize;
    return urls.slice(startIndex, endIndex);
  }
  return urls;
}

function escapeValueForXml(value) {
  if (value === true || value === false)
    return value ? "yes" : "no";
  return xmlEscape(String(value));
}
const yesNo = (v) => v === "yes" || v === true ? "yes" : "no";
const URLSET_OPENING_TAG = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
function buildUrlXml(url, NL, I1, I2, I3, I4) {
  let xml = `${I1}<url>${NL}`;
  if (url.loc) xml += `${I2}<loc>${xmlEscape(url.loc)}</loc>${NL}`;
  if (url.lastmod) xml += `${I2}<lastmod>${url.lastmod}</lastmod>${NL}`;
  if (url.changefreq) xml += `${I2}<changefreq>${url.changefreq}</changefreq>${NL}`;
  if (url.priority !== void 0) {
    const p = typeof url.priority === "number" ? url.priority : Number.parseFloat(url.priority);
    xml += `${I2}<priority>${p.toFixed(1)}</priority>${NL}`;
  }
  if (url.alternatives) {
    for (const alt of url.alternatives) {
      let attrs = "";
      for (const [k, v] of Object.entries(alt)) attrs += ` ${k}="${xmlEscape(String(v))}"`;
      xml += `${I2}<xhtml:link rel="alternate"${attrs} />${NL}`;
    }
  }
  if (url.images) {
    for (const img of url.images) {
      xml += `${I2}<image:image>${NL}${I3}<image:loc>${xmlEscape(img.loc)}</image:loc>${NL}`;
      if (img.title) xml += `${I3}<image:title>${xmlEscape(img.title)}</image:title>${NL}`;
      if (img.caption) xml += `${I3}<image:caption>${xmlEscape(img.caption)}</image:caption>${NL}`;
      if (img.geo_location) xml += `${I3}<image:geo_location>${xmlEscape(img.geo_location)}</image:geo_location>${NL}`;
      if (img.license) xml += `${I3}<image:license>${xmlEscape(img.license)}</image:license>${NL}`;
      xml += `${I2}</image:image>${NL}`;
    }
  }
  if (url.videos) {
    for (const video of url.videos) {
      xml += `${I2}<video:video>${NL}${I3}<video:title>${xmlEscape(video.title)}</video:title>${NL}`;
      if (video.thumbnail_loc) xml += `${I3}<video:thumbnail_loc>${xmlEscape(video.thumbnail_loc)}</video:thumbnail_loc>${NL}`;
      xml += `${I3}<video:description>${xmlEscape(video.description)}</video:description>${NL}`;
      if (video.content_loc) xml += `${I3}<video:content_loc>${xmlEscape(video.content_loc)}</video:content_loc>${NL}`;
      if (video.player_loc) xml += `${I3}<video:player_loc>${xmlEscape(video.player_loc)}</video:player_loc>${NL}`;
      if (video.duration !== void 0) xml += `${I3}<video:duration>${video.duration}</video:duration>${NL}`;
      if (video.expiration_date) xml += `${I3}<video:expiration_date>${video.expiration_date}</video:expiration_date>${NL}`;
      if (video.rating !== void 0) xml += `${I3}<video:rating>${video.rating}</video:rating>${NL}`;
      if (video.view_count !== void 0) xml += `${I3}<video:view_count>${video.view_count}</video:view_count>${NL}`;
      if (video.publication_date) xml += `${I3}<video:publication_date>${video.publication_date}</video:publication_date>${NL}`;
      if (video.family_friendly !== void 0) xml += `${I3}<video:family_friendly>${yesNo(video.family_friendly)}</video:family_friendly>${NL}`;
      if (video.restriction) xml += `${I3}<video:restriction relationship="${video.restriction.relationship || "allow"}">${xmlEscape(video.restriction.restriction)}</video:restriction>${NL}`;
      if (video.platform) xml += `${I3}<video:platform relationship="${video.platform.relationship || "allow"}">${xmlEscape(video.platform.platform)}</video:platform>${NL}`;
      if (video.requires_subscription !== void 0) xml += `${I3}<video:requires_subscription>${yesNo(video.requires_subscription)}</video:requires_subscription>${NL}`;
      if (video.price) {
        for (const price of video.price) {
          const c = price.currency ? ` currency="${price.currency}"` : "";
          const t = price.type ? ` type="${price.type}"` : "";
          xml += `${I3}<video:price${c}${t}>${xmlEscape(String(price.price ?? ""))}</video:price>${NL}`;
        }
      }
      if (video.uploader) {
        const info = video.uploader.info ? ` info="${xmlEscape(video.uploader.info)}"` : "";
        xml += `${I3}<video:uploader${info}>${xmlEscape(video.uploader.uploader)}</video:uploader>${NL}`;
      }
      if (video.live !== void 0) xml += `${I3}<video:live>${yesNo(video.live)}</video:live>${NL}`;
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        for (const t of tags) xml += `${I3}<video:tag>${xmlEscape(t)}</video:tag>${NL}`;
      }
      if (video.category) xml += `${I3}<video:category>${xmlEscape(video.category)}</video:category>${NL}`;
      if (video.gallery_loc) xml += `${I3}<video:gallery_loc>${xmlEscape(video.gallery_loc)}</video:gallery_loc>${NL}`;
      xml += `${I2}</video:video>${NL}`;
    }
  }
  if (url.news) {
    xml += `${I2}<news:news>${NL}${I3}<news:publication>${NL}`;
    xml += `${I4}<news:name>${xmlEscape(url.news.publication.name)}</news:name>${NL}`;
    xml += `${I4}<news:language>${xmlEscape(url.news.publication.language)}</news:language>${NL}`;
    xml += `${I3}</news:publication>${NL}`;
    if (url.news.title) xml += `${I3}<news:title>${xmlEscape(url.news.title)}</news:title>${NL}`;
    if (url.news.publication_date) xml += `${I3}<news:publication_date>${url.news.publication_date}</news:publication_date>${NL}`;
    xml += `${I2}</news:news>${NL}`;
  }
  xml += `${I1}</url>`;
  return xml;
}
function urlsToXml(urls, resolvers, { version, xsl, credits, minify }, errorInfo) {
  let xslHref = xsl ? resolvers.relativeBaseUrlResolver(xsl) : false;
  if (xslHref && errorInfo?.messages.length) {
    xslHref = withQuery(xslHref, {
      errors: "true",
      error_messages: errorInfo.messages,
      error_urls: errorInfo.urls
    });
  }
  const NL = minify ? "" : "\n";
  const I1 = minify ? "" : "    ";
  const I2 = minify ? "" : "        ";
  const I3 = minify ? "" : "            ";
  const I4 = minify ? "" : "                ";
  let xml = xslHref ? `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${escapeValueForXml(xslHref)}"?>${NL}` : `<?xml version="1.0" encoding="UTF-8"?>${NL}`;
  xml += URLSET_OPENING_TAG + NL;
  for (const url of urls) {
    xml += buildUrlXml(url, NL, I1, I2, I3, I4) + NL;
  }
  xml += "</urlset>";
  if (credits) {
    xml += `${NL}<!-- XML Sitemap generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`;
  }
  return xml;
}

function resolveSitemapEntries(sitemap, urls, runtimeConfig, resolvers) {
  const {
    autoI18n,
    isI18nMapped
  } = runtimeConfig;
  const filterPath = createPathFilter({
    include: sitemap.include,
    exclude: sitemap.exclude
  });
  const _urls = urls.map((_e) => {
    const e = preNormalizeEntry(_e, resolvers);
    if (!e.loc || !filterPath(e.loc))
      return false;
    return e;
  }).filter(Boolean);
  let validI18nUrlsForTransform = [];
  const withoutPrefixPaths = {};
  if (autoI18n && autoI18n.strategy !== "no_prefix") {
    const localeCodes = autoI18n.locales.map((l) => l.code);
    const localeByCode = new Map(autoI18n.locales.map((l) => [l.code, l]));
    const isPrefixStrategy = autoI18n.strategy === "prefix";
    const isPrefixExceptOrAndDefault = autoI18n.strategy === "prefix_and_default" || autoI18n.strategy === "prefix_except_default";
    const xDefaultAndLocales = [{ code: "x-default", _hreflang: "x-default" }, ...autoI18n.locales];
    const defaultLocale = autoI18n.defaultLocale;
    const hasPages = !!autoI18n.pages;
    const hasDifferentDomains = !!autoI18n.differentDomains;
    validI18nUrlsForTransform = _urls.map((_e, i) => {
      if (_e._abs)
        return false;
      const split = splitForLocales(_e._relativeLoc, localeCodes);
      let localeCode = split[0];
      const pathWithoutPrefix = split[1];
      if (!localeCode)
        localeCode = defaultLocale;
      const e = _e;
      e._pathWithoutPrefix = pathWithoutPrefix;
      const locale = localeByCode.get(localeCode);
      if (!locale)
        return false;
      e._locale = locale;
      e._index = i;
      e._key = `${e._sitemap || ""}${e._path?.pathname || "/"}${e._path?.search || ""}`;
      withoutPrefixPaths[pathWithoutPrefix] = withoutPrefixPaths[pathWithoutPrefix] || [];
      if (!withoutPrefixPaths[pathWithoutPrefix].some((e2) => e2._locale.code === locale.code))
        withoutPrefixPaths[pathWithoutPrefix].push(e);
      return e;
    }).filter(Boolean);
    for (const e of validI18nUrlsForTransform) {
      if (!e._i18nTransform && !e.alternatives?.length) {
        const alternatives = (withoutPrefixPaths[e._pathWithoutPrefix] || []).map((u) => {
          const entries = [];
          if (u._locale.code === defaultLocale) {
            entries.push({
              href: u.loc,
              hreflang: "x-default"
            });
          }
          entries.push({
            href: u.loc,
            hreflang: u._locale._hreflang || defaultLocale
          });
          return entries;
        }).flat().filter(Boolean);
        if (alternatives.length)
          e.alternatives = alternatives;
      } else if (e._i18nTransform) {
        delete e._i18nTransform;
        if (hasDifferentDomains) {
          const defLocale = localeByCode.get(defaultLocale);
          e.alternatives = [
            {
              ...defLocale,
              code: "x-default"
            },
            ...autoI18n.locales.filter((l) => !!l.domain)
          ].map((locale) => {
            return {
              hreflang: locale._hreflang,
              href: joinURL(withHttps(locale.domain), e._pathWithoutPrefix)
            };
          });
        } else {
          const pageMatch = hasPages ? findPageMapping(e._pathWithoutPrefix, autoI18n.pages) : null;
          const pathSearch = e._path?.search || "";
          const pathWithoutPrefix = e._pathWithoutPrefix;
          for (const l of autoI18n.locales) {
            let loc = pathWithoutPrefix;
            if (pageMatch && pageMatch.mappings[l.code] !== void 0) {
              const customPath = pageMatch.mappings[l.code];
              if (customPath === false)
                continue;
              if (typeof customPath === "string") {
                loc = customPath[0] === "/" ? customPath : `/${customPath}`;
                loc = applyDynamicParams(loc, pageMatch.paramSegments);
                if (isPrefixStrategy || isPrefixExceptOrAndDefault && l.code !== defaultLocale)
                  loc = joinURL(`/${l.code}`, loc);
              }
            } else if (!hasDifferentDomains && !(isPrefixExceptOrAndDefault && l.code === defaultLocale)) {
              loc = joinURL(`/${l.code}`, pathWithoutPrefix);
            }
            const _sitemap = isI18nMapped ? l._sitemap : void 0;
            const alternatives = [];
            for (const locale of xDefaultAndLocales) {
              const code = locale.code === "x-default" ? defaultLocale : locale.code;
              const isDefault = locale.code === "x-default" || locale.code === defaultLocale;
              let href = pathWithoutPrefix;
              if (pageMatch && pageMatch.mappings[code] !== void 0) {
                const customPath = pageMatch.mappings[code];
                if (customPath === false)
                  continue;
                if (typeof customPath === "string") {
                  href = customPath[0] === "/" ? customPath : `/${customPath}`;
                  href = applyDynamicParams(href, pageMatch.paramSegments);
                  if (isPrefixStrategy || isPrefixExceptOrAndDefault && !isDefault)
                    href = joinURL("/", code, href);
                }
              } else if (isPrefixStrategy) {
                href = joinURL("/", code, pathWithoutPrefix);
              } else if (isPrefixExceptOrAndDefault && !isDefault) {
                href = joinURL("/", code, pathWithoutPrefix);
              }
              if (!filterPath(href))
                continue;
              alternatives.push({
                hreflang: locale._hreflang,
                href
              });
            }
            const { _index: _, ...rest } = e;
            const newEntry = preNormalizeEntry({
              _sitemap,
              ...rest,
              _key: `${_sitemap || ""}${loc || "/"}${pathSearch}`,
              _locale: l,
              loc,
              alternatives
            }, resolvers);
            if (e._locale.code === newEntry._locale.code) {
              _urls[e._index] = newEntry;
              e._index = void 0;
            } else {
              _urls.push(newEntry);
            }
          }
        }
      }
      if (isI18nMapped) {
        e._sitemap = e._sitemap || e._locale._sitemap;
        e._key = `${e._sitemap || ""}${e.loc || "/"}${e._path?.search || ""}`;
      }
      if (e._index)
        _urls[e._index] = e;
    }
  }
  return _urls;
}
async function buildSitemapUrls(sitemap, resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    // enhancing
    autoI18n,
    isI18nMapped,
    isMultiSitemap,
    // sorting
    sortEntries,
    // chunking
    defaultSitemapsChunkSize
  } = runtimeConfig;
  const chunkSize = defaultSitemapsChunkSize || void 0;
  const chunkInfo = parseChunkInfo(sitemap.sitemapName, sitemaps, chunkSize);
  function maybeSort(urls2) {
    return sortEntries ? sortInPlace(urls2) : urls2;
  }
  function maybeSlice(urls2) {
    return sliceUrlsForChunk(urls2, sitemap.sitemapName, sitemaps, chunkSize);
  }
  if (autoI18n?.differentDomains) {
    const domain = autoI18n.locales.find((e) => e.language === sitemap.sitemapName || e.code === sitemap.sitemapName)?.domain;
    if (domain) {
      const _tester = resolvers.canonicalUrlResolver;
      resolvers.canonicalUrlResolver = (path) => resolveSitePath(path, {
        absolute: true,
        withBase: false,
        siteUrl: withHttps(domain),
        trailingSlash: _tester("/test/").endsWith("/"),
        base: "/"
      });
    }
  }
  let effectiveSitemap = sitemap;
  const baseSitemapName = chunkInfo.baseSitemapName;
  if (chunkInfo.isChunked && baseSitemapName !== sitemap.sitemapName && sitemaps[baseSitemapName]) {
    effectiveSitemap = sitemaps[baseSitemapName];
  }
  let sourcesInput = effectiveSitemap.includeAppSources ? [...await globalSitemapSources(), ...await childSitemapSources(effectiveSitemap)] : await childSitemapSources(effectiveSitemap);
  if (nitro && resolvers.event) {
    const ctx = {
      event: resolvers.event,
      sitemapName: baseSitemapName,
      sources: sourcesInput
    };
    await nitro.hooks.callHook("sitemap:sources", ctx);
    sourcesInput = ctx.sources;
  }
  const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
  const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
    url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
    error: source.error || "Unknown error"
  }));
  const resolvedCtx = {
    urls: sources.flatMap((s) => s.urls),
    sitemapName: sitemap.sitemapName,
    event: resolvers.event
  };
  await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
  const enhancedUrls = resolveSitemapEntries(sitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
  if (isMultiSitemap) {
    const sitemapNames = Object.keys(sitemaps).filter((k) => k !== "index");
    const warnedSitemaps = nitro?._sitemapWarnedSitemaps || /* @__PURE__ */ new Set();
    for (const e of enhancedUrls) {
      if (typeof e._sitemap === "string" && !sitemapNames.includes(e._sitemap)) {
        if (!warnedSitemaps.has(e._sitemap)) {
          warnedSitemaps.add(e._sitemap);
          logger.error(`Sitemap \`${e._sitemap}\` not found in sitemap config. Available sitemaps: ${sitemapNames.join(", ")}. Entry \`${e.loc}\` will be omitted.`);
        }
      }
    }
    if (nitro) {
      nitro._sitemapWarnedSitemaps = warnedSitemaps;
    }
  }
  const filteredUrls = enhancedUrls.filter((e) => {
    if (e._sitemap === false)
      return false;
    if (isMultiSitemap && e._sitemap && sitemap.sitemapName) {
      if (sitemap._isChunking)
        return sitemap.sitemapName.startsWith(e._sitemap + "-");
      return e._sitemap === sitemap.sitemapName;
    }
    return true;
  });
  const sortedUrls = maybeSort(filteredUrls);
  const urls = maybeSlice(sortedUrls);
  return { urls, failedSources };
}

function useNitroUrlResolvers(e) {
  const canonicalQuery = getQuery(e).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const siteConfig = getSiteConfig(e);
  return {
    event: e,
    fixSlashes: (path) => fixSlashes(siteConfig.trailingSlash, path),
    // we need these as they depend on the nitro event
    canonicalUrlResolver: createSitePathResolver(e, {
      canonical: isShowingCanonical || true,
      absolute: true,
      withBase: true
    }),
    relativeBaseUrlResolver: createSitePathResolver(e, { absolute: false, withBase: true })
  };
}
async function buildSitemapXml(event, definition, resolvers, runtimeConfig) {
  const { sitemapName } = definition;
  const nitro = useNitroApp();
  const { urls: sitemapUrls, failedSources } = await buildSitemapUrls(definition, resolvers, runtimeConfig, nitro);
  const routeRuleMatcher = createNitroRouteRuleMatcher();
  const { autoI18n } = runtimeConfig;
  let validCount = 0;
  for (let i = 0; i < sitemapUrls.length; i++) {
    const u = sitemapUrls[i];
    const path = u._path?.pathname || u.loc;
    if (!getPathRobotConfig(event, { path, skipSiteIndexable: true }).indexable)
      continue;
    let routeRules = routeRuleMatcher(path);
    if (autoI18n?.locales && autoI18n?.strategy !== "no_prefix") {
      const match = splitForLocales(path, autoI18n.locales.map((l) => l.code));
      const pathWithoutPrefix = match[1];
      if (pathWithoutPrefix && pathWithoutPrefix !== path)
        routeRules = defu(routeRules, routeRuleMatcher(pathWithoutPrefix));
    }
    if (routeRules.sitemap === false)
      continue;
    if (typeof routeRules.robots !== "undefined" && !routeRules.robots)
      continue;
    const hasRobotsDisabled = Object.entries(routeRules.headers || {}).some(([name, value]) => name.toLowerCase() === "x-robots-tag" && value.toLowerCase().includes("noindex"));
    if (routeRules.redirect || hasRobotsDisabled)
      continue;
    sitemapUrls[validCount++] = routeRules.sitemap ? defu(u, routeRules.sitemap) : u;
  }
  sitemapUrls.length = validCount;
  const locSize = sitemapUrls.length;
  const resolvedCtx = {
    urls: sitemapUrls,
    sitemapName,
    event
  };
  await nitro.hooks.callHook("sitemap:resolved", resolvedCtx);
  if (resolvedCtx.urls.length !== locSize) {
    resolvedCtx.urls = resolvedCtx.urls.map((e) => preNormalizeEntry(e, resolvers));
  }
  const maybeSort = (urls2) => runtimeConfig.sortEntries ? sortInPlace(urls2) : urls2;
  const defaults = definition.defaults || {};
  const normalizedPreDedupe = resolvedCtx.urls.map((e) => normaliseEntry(e, defaults, resolvers));
  const urls = maybeSort(mergeOnKey(normalizedPreDedupe, "_key").map((e) => normaliseEntry(e, defaults, resolvers)));
  if (definition._isChunking && definition.sitemapName.includes("-")) {
    const parts = definition.sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const chunkIndex = Number(lastPart);
      const baseSitemapName = parts.join("-");
      if (urls.length === 0 && chunkIndex > 0) {
        throw createError$1({
          statusCode: 404,
          message: `Sitemap chunk ${chunkIndex} for "${baseSitemapName}" does not exist.`
        });
      }
    }
  }
  const errorInfo = failedSources.length > 0 ? {
    messages: failedSources.map((f) => f.error),
    urls: failedSources.map((f) => f.url)
  } : void 0;
  const sitemap = urlsToXml(urls, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap, sitemapName, event };
  await nitro.hooks.callHook("sitemap:output", ctx);
  return ctx.sitemap;
}
const buildSitemapXmlCached = defineCachedFunction(
  buildSitemapXml,
  {
    name: "sitemap:xml",
    group: "sitemap",
    maxAge: 60 * 10,
    // Default 10 minutes
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event, definition) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      const sitemapName = definition.sitemapName || "default";
      return `${sitemapName}-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function createSitemap(event, definition, runtimeConfig) {
  const resolvers = useNitroUrlResolvers(event);
  const shouldCache = typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0;
  const xml = shouldCache ? await buildSitemapXmlCached(event, definition, resolvers, runtimeConfig) : await buildSitemapXml(event, definition, resolvers, runtimeConfig);
  setHeader(event, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(event, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(event, "X-Sitemap-Generated", now.toISOString());
    setHeader(event, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(event, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(event, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(event, "Cache-Control", `no-cache, no-store`);
  }
  event.context._isSitemap = true;
  return xml;
}

async function sitemapXmlEventHandler(e) {
  const runtimeConfig = useSitemapRuntimeConfig();
  const { sitemaps } = runtimeConfig;
  if ("index" in sitemaps)
    return sendRedirect(e, withBase("/sitemap_index.xml", useRuntimeConfig().app.baseURL), 301);
  return createSitemap(e, Object.values(sitemaps)[0], runtimeConfig);
}

const _iZLL1D = defineEventHandler(sitemapXmlEventHandler);

const _lazy_UfXuFS = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _J1QwQi, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _K88_yp, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _BeS6Bf, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_UfXuFS, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _8vVJpR, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _pyLHUR, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _vyPWNu, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _yXdTVw, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _jco4lZ, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _4f3Rzc, lazy: false, middleware: true, method: undefined },
  { route: '/robots.txt', handler: _AfERpf, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _cdgEvJ, lazy: false, middleware: true, method: undefined },
  { route: '/__sitemap__/style.xsl', handler: _GyfqSt, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _iZLL1D, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_UfXuFS, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$1(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins$1) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineNitroPlugin(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch$1 as $, getResponseStatus as a, getQuery as b, createError$1 as c, defineRenderHandler as d, destr as e, getRouteRules as f, getResponseStatusText as g, joinURL as h, useNitroApp as i, joinRelativeURL as j, encodePath as k, decodePath as l, hasProtocol as m, isScriptProtocol as n, getContext as o, parseURL as p, createHooks as q, executeAsync as r, sanitizeStatusCode as s, parseQuery as t, useRuntimeConfig as u, v4 as v, withQuery as w, withTrailingSlash as x, withoutTrailingSlash as y, nodeServer as z };
//# sourceMappingURL=nitro.mjs.map
