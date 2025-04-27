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
  // console.log(event);
  try {
    const orig = event.request;

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
      return uv.fetch(event);
    } else if (scramjet.route(event)) {
      const encoded = orig.url.split("/~/scramjet/")[1];
      if (!encoded.startsWith("data:")) {
        const realurl = decodeURIComponent(encoded);
        if (realurl) await tapAnalytics(new URL(realurl).host);
      }
      return scramjet.fetch(event);
    }
  } catch (error) {
    console.error(error);
  }

  return fetch(event.request);
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
