// .wrangler/tmp/bundle-SYBEZ1/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/.pnpm/@upstash+vector@1.0.5/node_modules/@upstash/vector/dist/index.mjs
var s = class extends Error {
  constructor(e) {
    super(e), this.name = "UpstashError";
  }
};
var i = class {
  baseUrl;
  headers;
  options;
  retry;
  constructor(e) {
    this.options = { cache: e.cache, signal: e.signal }, this.baseUrl = e.baseUrl.replace(/\/$/, ""), this.headers = { "Content-Type": "application/json", ...e.headers }, typeof e?.retry == "boolean" && e?.retry === false ? this.retry = { attempts: 1, backoff: () => 0 } : this.retry = { attempts: e?.retry?.retries ?? 5, backoff: e?.retry?.backoff ?? ((t) => Math.exp(t) * 50) };
  }
  async request(e) {
    let t = { cache: this.options.cache, method: "POST", headers: this.headers, body: JSON.stringify(e.body), keepalive: true, signal: this.options.signal }, r = null, a = null;
    for (let f = 0; f <= this.retry.attempts; f++)
      try {
        r = await fetch([this.baseUrl, ...e.path ?? []].join("/"), t);
        break;
      } catch (g) {
        if (this.options.signal?.aborted) {
          let R = new Blob([JSON.stringify({ result: this.options.signal.reason ?? "Aborted" })]), b = { status: 200, statusText: this.options.signal.reason ?? "Aborted" };
          r = new Response(R, b);
          break;
        }
        a = g, await new Promise((R) => setTimeout(R, this.retry.backoff(f)));
      }
    if (!r)
      throw a ?? new Error("Exhausted all retries");
    let T = await r.json();
    if (!r.ok)
      throw new s(`${T.error}`);
    return { result: T.result, error: T.error };
  }
};
var n = class {
  payload;
  endpoint;
  constructor(e, t) {
    this.payload = e, this.endpoint = t;
  }
  async exec(e) {
    let { result: t, error: r } = await e.request({ body: this.payload, path: [this.endpoint] });
    if (r)
      throw new s(r);
    if (typeof t > "u")
      throw new Error("Request did not return a result");
    return t;
  }
};
var d = class extends n {
  constructor(e) {
    let t = [];
    Array.isArray(e) ? t.push(...e) : t.push(e), super(t, "delete");
  }
};
var p = class extends n {
  constructor(e) {
    let t = "query";
    "data" in e && (t = "query-data"), super(e, t);
  }
};
var c = class extends n {
  constructor(e) {
    let t = "upsert";
    Array.isArray(e) ? e.some((a) => "data" in a && a.data) && (t = "upsert-data") : "data" in e && (t = "upsert-data"), super(e, t);
  }
};
var u = class extends n {
  constructor([e, t]) {
    super({ ids: e, ...t }, "fetch");
  }
};
var l = class extends n {
  constructor(e) {
    super(e, "range");
  }
};
var m = class extends n {
  constructor() {
    super([], "reset");
  }
};
var h = class extends n {
  constructor() {
    super([], "info");
  }
};
var y = class {
  client;
  constructor(e) {
    this.client = e;
  }
  delete = (e) => new d(e).exec(this.client);
  query = (e) => new p(e).exec(this.client);
  upsert = (e) => new c(e).exec(this.client);
  fetch = (...e) => new u(e).exec(this.client);
  reset = () => new m().exec(this.client);
  range = (e) => new l(e).exec(this.client);
  info = () => new h().exec(this.client);
};
var x = class o extends y {
  constructor(e) {
    if (typeof e < "u" && "request" in e) {
      super(e);
      return;
    }
    let t = e?.token ?? process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_TOKEN ?? process.env.UPSTASH_VECTOR_REST_TOKEN, r = e?.url ?? process.env.NEXT_PUBLIC_UPSTASH_VECTOR_REST_URL ?? process.env.UPSTASH_VECTOR_REST_URL;
    if (!t)
      throw new Error("UPSTASH_VECTOR_REST_TOKEN is missing!");
    if (!r)
      throw new Error("UPSTASH_VECTOR_REST_URL is missing!");
    (r.startsWith(" ") || r.endsWith(" ") || /\r|\n/.test(r)) && console.warn("The vector url contains whitespace or newline, which can cause errors!"), (t.startsWith(" ") || t.endsWith(" ") || /\r|\n/.test(t)) && console.warn("The vector token contains whitespace or newline, which can cause errors!");
    let a = new i({ baseUrl: r, retry: e?.retry, headers: { authorization: `Bearer ${t}` }, cache: e?.cache || "no-store", signal: e?.signal });
    super(a);
  }
  static fromEnv(e) {
    let t = process?.env.UPSTASH_VECTOR_REST_URL;
    if (!t)
      throw new Error("Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`");
    let r = process?.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!r)
      throw new Error("Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`");
    return new o({ ...e, url: t, token: r });
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c2) => c2({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  Object.entries(map).forEach(([key, value]) => headers.set(key, value));
  return headers;
};
var Context = class {
  req;
  env = {};
  _var = {};
  finalized = false;
  error = void 0;
  #status = 200;
  #executionCtx;
  #headers = void 0;
  #preparedHeaders = void 0;
  #res;
  #isFresh = true;
  layout = void 0;
  renderer = (content) => this.html(content);
  notFoundHandler = () => new Response();
  constructor(req, options) {
    this.req = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      this.#res.headers.delete("content-type");
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => this.renderer(...args);
  setLayout = (layout) => this.layout = layout;
  getLayout = () => this.layout;
  setRenderer = (renderer) => {
    this.renderer = renderer;
  };
  header = (name, value, options) => {
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this._var ??= {};
    this._var[key] = value;
  };
  get = (key) => {
    return this._var ? this._var[key] : void 0;
  };
  get var() {
    return { ...this._var };
  }
  newResponse = (data, arg, headers) => {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v, k) => {
          header.set(k, v);
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v, k) => {
        this.#headers?.set(k, v);
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") {
        this.#headers.set(k, v);
      } else {
        this.#headers.delete(k);
        for (const v2 of v) {
          this.#headers.append(k, v2);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  };
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
  };
  text = (text, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json; charset=UTF-8";
    return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
  };
  html = (html, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html === "object") {
      if (!(html instanceof Promise)) {
        html = html.toString();
      }
      if (html instanceof Promise) {
        return html.then((html2) => resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {})).then((html2) => {
          return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
        });
      }
    }
    return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
  };
  redirect = (location, status = 302) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", location);
    return this.newResponse(null, status);
  };
  notFound = () => {
    return this.notFoundHandler(this);
  };
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index2 = -1;
    return dispatch(0);
    async function dispatch(i2) {
      if (i2 <= index2) {
        throw new Error("next() called multiple times");
      }
      index2 = i2;
      let res;
      let isError = false;
      let handler;
      if (middleware[i2]) {
        handler = middleware[i2][0][0];
        if (context instanceof Context) {
          context.req.routeIndex = i2;
        }
      } else {
        handler = i2 === middleware.length && next || void 0;
      }
      if (!handler) {
        if (context instanceof Context && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i2 + 1);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/http-exception.js
var HTTPException = class extends Error {
  res;
  status;
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = { all: false }) => {
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (isFormDataContent(contentType)) {
    return parseFormData(request, options);
  }
  return {};
};
function isFormDataContent(contentType) {
  if (contentType === null) {
    return false;
  }
  return contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded");
}
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = {};
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] && isArrayField(form[key])) {
    appendToExistingArray(form[key], value);
  } else if (form[key]) {
    convertToNewArray(form, key, value);
  } else {
    form[key] = value;
  }
};
function isArrayField(field) {
  return Array.isArray(field);
}
var appendToExistingArray = (arr, value) => {
  arr.push(value);
};
var convertToNewArray = (form, key, value) => {
  form[key] = [form[key], value];
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index2) => {
    const mark = `@${index2}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i2 = groups.length - 1; i2 >= 0; i2--) {
    const [mark] = groups[i2];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i2][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
};
var getPath = (request) => {
  const url = request.url;
  const queryIndex = url.indexOf("?", 8);
  return url.slice(url.indexOf("/", 8), queryIndex === -1 ? void 0 : queryIndex);
};
var getQueryStrings = (url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
};
var mergePath = (...paths) => {
  let p2 = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p2[p2.length - 1] === "/") {
      p2 = p2.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p2 = `${p2}/`;
    } else if (path !== "/") {
      p2 = `${p2}${path}`;
    }
    if (path === "/" && p2 === "") {
      p2 = "/";
    }
  }
  return p2;
};
var checkOptionalParameter = (path) => {
  if (!path.match(/\:.+\?$/)) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i2, a) => a.indexOf(v) === i2);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/request.js
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.getDecodedParam(key) : this.getAllDecodedParams();
  }
  getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.getParamValue(paramKey);
    return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : void 0;
  }
  getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
      }
    }
    return decoded;
  }
  getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    if (this.bodyCache.parsedBody) {
      return this.bodyCache.parsedBody;
    }
    const parsedBody = await parseBody(this, options);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    if (!bodyCache[key]) {
      for (const keyOfBodyCache of Object.keys(bodyCache)) {
        if (keyOfBodyCache === "parsedBody") {
          continue;
        }
        return (async () => {
          let body = await bodyCache[keyOfBodyCache];
          if (keyOfBodyCache === "json") {
            body = JSON.stringify(body);
          }
          return await new Response(body)[key]();
        })();
      }
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/hono-base.js
var COMPOSED_HANDLER = Symbol("composedHandler");
function defineDynamicClass() {
  return class {
  };
}
var notFoundHandler = (c2) => {
  return c2.text("404 Not Found", 404);
};
var errorHandler = (err, c2) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c2.text("Internal Server Error", 500);
};
var Hono = class extends defineDynamicClass() {
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    super();
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, this.#path, handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method) {
        return this;
      }
      for (const p2 of [path].flat()) {
        this.#path = p2;
        for (const m2 of [method].flat()) {
          handlers.map((handler) => {
            this.addRoute(m2.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    if (!app2) {
      return subApp;
    }
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c2, next) => (await compose([], app2.errorHandler)(c2, () => r.handler(c2, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = async (c2, next) => {
      let executionContext = void 0;
      try {
        executionContext = c2.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c2) : [c2.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings(c2.req.url);
      const res = await applicationHandler(
        new Request(
          new URL((c2.req.path.slice(pathPrefixLength) || "/") + queryStrings, c2.req.url),
          c2.req.raw
        ),
        ...optionsArray
      );
      if (res) {
        return res;
      }
      await next();
    };
    this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  matchRoute(method, path) {
    return this.router.match(method, path);
  }
  handleError(err, c2) {
    if (err instanceof Error) {
      return this.errorHandler(err, c2);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.matchRoute(method, path);
    const c2 = new Context(new HonoRequest(request, path, matchResult), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c2, async () => {
          c2.res = await this.notFoundHandler(c2);
        });
      } catch (err) {
        return this.handleError(err, c2);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c2.finalized ? c2.res : this.notFoundHandler(c2))
      ).catch((err) => this.handleError(err, c2)) : res;
    }
    const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c2);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. You may forget returning Response object or `await next()`"
          );
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c2);
      }
    })();
  }
  fetch = (request, Env, executionCtx) => {
    return this.dispatch(request, executionCtx, Env, request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      if (requestInit !== void 0) {
        input = new Request(input, requestInit);
      }
      return this.fetch(input, Env, executionCtx);
    }
    input = input.toString();
    const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
    const req = new Request(path, requestInit);
    return this.fetch(req, Env, executionCtx);
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class {
  index;
  varIndex;
  children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index2, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index2;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node();
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node();
      }
    }
    node.insert(restTokens, index2, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c2 = this.children[k];
      return (typeof c2.varIndex === "number" ? `(${k})@${c2.varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c2.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  context = { varIndex: 0 };
  root = new Node();
  insert(path, index2, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i2 = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m2) => {
        const mark = `@\\${i2}`;
        groups[i2] = [mark, m2];
        i2++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      const [mark] = groups[i2];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i2][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index2, paramAssoc, this.context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i2 = 0, j = -1, len = routesWithStaticPathFlag.length; i2 < len; i2++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i2];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h2]) => [h2, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h2, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h2, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i2 = 0, len = handlerData.length; i2 < len; i2++) {
    for (let j = 0, len2 = handlerData[i2].length; j < len2; j++) {
      const map = handlerData[i2][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i2 in indexReplacementMap) {
    handlerMap[i2] = handlerData[indexReplacementMap[i2]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  middleware;
  routes;
  constructor() {
    this.middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m2) => {
          middleware[m2][path] ||= findMiddleware(middleware[m2], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(middleware[m2]).forEach((p2) => {
            re.test(p2) && middleware[m2][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          Object.keys(routes[m2]).forEach(
            (p2) => re.test(p2) && routes[m2][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i2 = 0, len = paths.length; i2 < len; i2++) {
      const path2 = paths[i2];
      Object.keys(routes).forEach((m2) => {
        if (method === METHOD_NAME_ALL || method === m2) {
          routes[m2][path2] ||= [
            ...findMiddleware(middleware[m2], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m2][path2].push([handler, paramCount - len + i2 + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index2 = match.indexOf("", 1);
      return [matcher[1][index2], match];
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    [...Object.keys(this.routes), ...Object.keys(this.middleware)].forEach((method) => {
      matchers[method] ||= this.buildMatcher(method);
    });
    this.middleware = this.routes = void 0;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.middleware, this.routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  routers = [];
  routes = [];
  constructor(init) {
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i2 = 0;
    let res;
    for (; i2 < len; i2++) {
      const router = routers[i2];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = void 0;
      break;
    }
    if (i2 === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router/trie-router/node.js
var Node2 = class {
  methods;
  children;
  patterns;
  order = 0;
  name;
  params = /* @__PURE__ */ Object.create(null);
  constructor(method, handler, children) {
    this.children = children || /* @__PURE__ */ Object.create(null);
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m2 = /* @__PURE__ */ Object.create(null);
      m2[method] = { handler, possibleKeys: [], score: 0, name: this.name };
      this.methods = [m2];
    }
    this.patterns = [];
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i2 = 0, len = parts.length; i2 < len; i2++) {
      const p2 = parts[i2];
      if (Object.keys(curNode.children).includes(p2)) {
        curNode = curNode.children[p2];
        const pattern2 = getPattern(p2);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.children[p2] = new Node2();
      const pattern = getPattern(p2);
      if (pattern) {
        curNode.patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.children[p2];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m2 = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i2, a) => a.indexOf(v) === i2),
      name: this.name,
      score: this.order
    };
    m2[method] = handlerSet;
    curNode.methods.push(m2);
    return curNode;
  }
  gHSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i2 = 0, len = node.methods.length; i2 < len; i2++) {
      const m2 = node.methods[i2];
      const handlerSet = m2[method] || m2[METHOD_NAME_ALL];
      const processedSet = /* @__PURE__ */ Object.create(null);
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSet.possibleKeys.forEach((key) => {
          const processed = processedSet[handlerSet.name];
          handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
          processedSet[handlerSet.name] = true;
        });
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.params = /* @__PURE__ */ Object.create(null);
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i2 = 0, len = parts.length; i2 < len; i2++) {
      const part = parts[i2];
      const isLast = i2 === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.children[part];
        if (nextNode) {
          nextNode.params = node.params;
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(
                ...this.gHSets(nextNode.children["*"], method, node.params, /* @__PURE__ */ Object.create(null))
              );
            }
            handlerSets.push(...this.gHSets(nextNode, method, node.params, /* @__PURE__ */ Object.create(null)));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.patterns.length; k < len3; k++) {
          const pattern = node.patterns[k];
          const params = { ...node.params };
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method, node.params, /* @__PURE__ */ Object.create(null)));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i2).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.gHSets(child, method, node.params, params));
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              params[name] = part;
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method, params, node.params));
                if (child.children["*"]) {
                  handlerSets.push(...this.gHSets(child.children["*"], method, params, node.params));
                }
              } else {
                child.params = params;
                tempNodes.push(child);
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [results.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  node;
  constructor() {
    this.node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (const p2 of results) {
        this.node.insert(method, p2, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};

// node_modules/.pnpm/hono@4.2.4/node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// index.ts
var index = new x({
  url: "https://sound-pheasant-10312-profanity-vector.upstash.io",
  token: "AB4FMHNvdW5kLXBoZWFzYW50LTEwMzEyLXByb2Zhbml0eWFkbWluWWpoa1pUQTFOV0V0TUdRNE5pMDBabVUyTFdJeE16WXRZMlU1TkdFeU4yRTVNV1V4"
});
var app = new Hono2();
app.post("/", async (c2) => {
  const body = await c2.req.json();
  const { message } = body;
  console.log("message", message);
  const result = await isProfanity(message);
  console.log("result????", result);
  async function isProfanity(str) {
    try {
      const scores = [];
      console.log("h#");
      const idk = await index.query({
        topK: 1,
        data: str
      });
      const score = idk.map(({ score: score2 }) => score2);
      scores.push(...score);
      console.log("done waiting", scores);
      const highestScore = scores.sort().reverse()[0];
      console.log(highestScore);
      const isProfanity2 = highestScore > 0.85;
      return { score: highestScore, isProfanity: isProfanity2 };
    } catch (err) {
      console.log(err);
    }
  }
  return c2.json(result);
});
var ts_express_default = app;

// node_modules/.pnpm/wrangler@3.50.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
};
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/.pnpm/wrangler@3.50.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
var jsonError = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
};
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-SYBEZ1/middleware-insertion-facade.js
ts_express_default.middleware = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default,
  ...ts_express_default.middleware ?? []
].filter(Boolean);
var middleware_insertion_facade_default = ts_express_default;

// node_modules/.pnpm/wrangler@3.50.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}

// .wrangler/tmp/bundle-SYBEZ1/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (worker.middleware === void 0 || worker.middleware.length === 0) {
    return worker;
  }
  for (const middleware of worker.middleware) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  };
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      };
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
function wrapWorkerEntrypoint(klass) {
  if (klass.middleware === void 0 || klass.middleware.length === 0) {
    return klass;
  }
  for (const middleware of klass.middleware) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
