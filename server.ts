import "dotenv/config";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { createServer } from "http";
import wisp from "wisp-server-node";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
// import { Readable } from "node:stream";
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

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://delusionz.xyz", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "Emerald", // Optional. Site title for rankings on openrouter.ai.
  },
});

let sponserFile: Sponser[] = [];
if (fs.existsSync(path.join(__dirname, "sponsers.json"))) {
  sponserFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "sponsers.json"), "utf8")
  );
}

type ChatPayload = {
  messages: { content: string; role: "user" | "assistant" }[];
  model: string;
};
// const syntheticHeaders = {
//   accept: "application/json",
//   "accept-language": "en-US,en;q=0.9",
//   "cache-control": "no-cache",
//   "content-type": "application/json",
//   pragma: "no-cache",
//   priority: "u=1, i",
//   "sec-ch-ua": '"Not?A_Brand";v="99", "Chromium";v="130"',
//   "sec-ch-ua-mobile": "?0",
//   "sec-ch-ua-platform": '"Windows"',
//   "sec-fetch-dest": "empty",
//   "sec-fetch-mode": "cors",
//   "sec-fetch-site": "same-origin",
//   cookie: "dcm=3",
//   Referer: "https://duckduckgo.com/",
//   "Referrer-Policy": "origin",
// };

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

app.post("/api/chat", async (req, res) => {
  const { messages, model } = req.body as ChatPayload;
  if (!messages || !model) {
    return res.status(400).send({
      success: false,
      error: "Missing messages or model",
    });
  }

  try {
    // Set headers for streaming response
    res.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const chatCompletion = await openai.chat.completions.create({
      messages: messages,
      model: model,
      stream: true,
      temperature: 0.5,
    });

    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.raw.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // End the stream
    res.raw.write("data: [DONE]\n\n");
    res.raw.end();
  } catch (error) {
    console.error("OpenAI API error:", error);
    // If headers haven't been sent yet, send error response
    if (!res.raw.headersSent) {
      res.status(500).send({
        success: false,
        error: "Failed to communicate with OpenAI API",
      });
    } else {
      // If streaming has started, send error in stream format
      res.raw.write(
        `data: ${JSON.stringify({ error: "Stream ended unexpectedly" })}\n\n`
      );
      res.raw.end();
    }
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
  wildcard: true,
});

app.setNotFoundHandler((req, res) => {
  res.sendFile("index.html");
});

app.listen({ port: parseInt(process.env.PORT || "3000") }, (err, address) => {
  if (err) {
    app.log.error(err);
    console.log(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
