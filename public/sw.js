/* eslint-disable */

importScripts("/uv/uv.bundle.js");
importScripts("/uv/uv.sw.js");
importScripts("/uv/uv.config.js");

importScripts(
  "/scram/scramjet.wasm.js",
  "/scram/scramjet.shared.js",
  "/scram/scramjet.worker.js"
);

uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();
async function handleRequest(event) {
  const orig = event.request;
  const init = {
    method: orig.method,
    headers: orig.headers,
    body:
      orig.method !== "GET" && orig.method !== "HEAD"
        ? await orig.clone().blob()
        : undefined,
    credentials: orig.credentials,
    cache: orig.cache,
    redirect: orig.redirect,
    referrer: orig.referrer,
    referrerPolicy: orig.referrerPolicy,
    integrity: orig.integrity,
    keepalive: orig.keepalive,
    signal: orig.signal,
  };

  if (orig.mode !== "navigate") {
    init.mode = orig.mode;
  }

  const proxyReq = new Request(orig.url, init);

  async function tapAnalytics(url) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analytics: { host: url.host } }),
      });
    } catch (err) {
      console.warn("Analytics post failed:", err);
    }
  }

  await scramjet.loadConfig();

  if (orig.url.startsWith(location.origin + __uv$config.prefix)) {
    const encoded = orig.url.split(__uv$config.prefix)[1];
    if (!encoded.startsWith("data:")) {
      const realurl = decodeURIComponent(encoded);
      if (realurl) await tapAnalytics(new URL(realurl).host);
    }
    return uv.fetch(new FetchEvent("fetch", { request: proxyReq }));
  } else if (scramjet.route({ request: proxyReq })) {
    const encoded = orig.url.split("/~/scramjet/")[1];
    if (!encoded.startsWith("data:")) {
      const realurl = decodeURIComponent(encoded);
      if (realurl) await tapAnalytics(new URL(realurl).host);
    }
    return scramjet.fetch(new FetchEvent("fetch", { request: proxyReq }));
  }

  return fetch(proxyReq);
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

const Xor = {
  encode(str) {
    if (!str) return str;
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) =>
          ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char
        )
        .join("")
    );
  },
  decode(str) {
    if (!str) return str;
    let [input, ...search] = str.split("?");
    return (
      decodeURIComponent(input)
        .split("")
        .map((char, ind) =>
          ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char
        )
        .join("") + (search.length ? "?" + search.join("?") : "")
    );
  },
};
