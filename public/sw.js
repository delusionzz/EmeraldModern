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
  await scramjet.loadConfig();
  if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
    const encoded = event.request.url.split(__uv$config.prefix)[1];
    if (!encoded.startsWith("data:")) {
      const realurl = decodeURIComponent(encoded);
      if (realurl) {
        const url = new URL(realurl);
        // console.log(`Posting analytics for ${url.host}${url.pathname}`);
        await postAnalytics(url.host);
      }
    }
    return await uv.fetch(event);
  } else if (scramjet.route(event)) {
    // post to analytics
    const encoded = event.request.url.split("/~/scramjet/")[1];
    // // console.log(`Posting analytics for ${encoded}`);
    if (!encoded.startsWith("data:")) {
      const realurl = decodeURIComponent(encoded);
      if (realurl) {
        const url = new URL(realurl);
        await postAnalytics(url.host);
      }
    }

    return scramjet.fetch(event);
  }
  return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function postAnalytics(host) {
  await fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      analytics: {
        host,
      },
    }),
  });
}

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
