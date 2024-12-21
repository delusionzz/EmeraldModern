import "dotenv/config";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { createServer } from "http";
import wisp from "wisp-server-node";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "node:stream";
import fs from "node:fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { load } from "cheerio";
type Sponser = {
  title: string;
  icon: string;
  url: string;
  discord: string;
};
const analyticMap = new Map<string, { host: string; count: number }>();
let sponserFile: Sponser[] = [];
if (fs.existsSync(path.join(__dirname, "sponsers.json"))) {
  sponserFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "sponsers.json"), "utf8")
  );
}

type ChatPayload = {
  messages: { content: string; role: "user" | "assistant" }[];
  model: "gpt-4o-mini";
};
const syntheticHeaders = {
  accept: "application/json",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  "content-type": "application/json",
  pragma: "no-cache",
  priority: "u=1, i",
  "sec-ch-ua": '"Not?A_Brand";v="99", "Chromium";v="130"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  cookie: "dcm=3",
  Referer: "https://duckduckgo.com/",
  "Referrer-Policy": "origin",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serverFactory = (handler, _) => {
  return createServer()
    .on("request", (req, res) => {
      handler(req, res);
    })
    .on("upgrade", (req, socket, head) => {
      // @ts-expect-error          VVVVVV
      wisp.routeRequest(req, socket, head);
    });
};

const app = fastify({ logger: false, serverFactory });

app.get("/api/search", async (req, res) => {
  const { query } = req.query as { query: string }; // Define the type for req.params
  try {
    const response = await fetch(
      `https://duckduckgo.com/ac/?q=${query}&format=list`
    ).then((apiRes) => apiRes.json());
    res.send(response);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/api/sponser", async (req, res) => {
  if (sponserFile.length > 0) {
    res.send(sponserFile[Math.floor(Math.random() * sponserFile.length)]);
  } else {
    res.send([]);
  }
});

app.post("/api/analytics", async (req, res) => {
  const { analytics } = req.body as {
    analytics: { host: string; path: string };
  };
  if (!analytics) {
    return res.send({
      success: false,
      error: "Missing analytics",
    });
  }
  analyticMap.set(analytics.host, {
    host: analytics.host,
    count: (analyticMap.get(analytics.host)?.count || 0) + 1,
  });
  res.send({
    success: true,
  });
});

app.get("/api/analytics", async (req, res) => {
  res.send(
    Array.from(analyticMap.entries()).sort((a, b) => b[1].count - a[1].count)
  );
});

app.post("/api/chat", async (req, res) => {
  const { messages, model } = JSON.parse(req.body as string) as ChatPayload;
  if (!messages || !model) {
    return res.send({
      success: false,
      error: "Missing messages or model",
    });
  }
  let vqdToken;
  try {
    if (req.headers["x-vqd-4"]) {
      vqdToken = req.headers["x-vqd-4"];
    } else {
      const res = await fetch(`https://duckduckgo.com/duckchat/v1/status`, {
        headers: {
          "x-vqd-accept": "1",
          ...syntheticHeaders,
        },
      });
      vqdToken = res.headers.get("x-vqd-4");
    }

    const response = await fetch(`https://duckduckgo.com/duckchat/v1/chat`, {
      method: "POST",
      body: JSON.stringify({
        messages,
        model,
      }),
      headers: {
        ...syntheticHeaders,
        "X-Vqd-4": `${vqdToken}`,
      },
    });
    if (response.body) {
      res.header("X-Vqd-4", `${response.headers.get("X-Vqd-4")}`);
      return res.send(Readable.from(response.body));
    }
  } catch (error) {
    res.status(500);
    res.send({
      success: false,
      error: error,
    });
  }
});

app.get("/api/title", async (req, res) => {
  const { url } = req.query as { url: string };
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);
    res.send({
      title: $("title").text(),
    });
  } catch (error) {
    res.send({
      success: false,
      error: error,
    });
  }
});

app.register(fastifyStatic, {
  root: path.join(__dirname, "dist"),
  prefix: "/",
  serve: true,
  wildcard: false,
});

app.setNotFoundHandler((req, res) => {
  res.sendFile("index.html");
});

app.listen({ port: parseInt(process.env.PORT || "3000") }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
