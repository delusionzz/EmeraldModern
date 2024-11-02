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

type Sponser = {
  title: string;
  icon: string;
  url: string;
  discord: string;
};

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

const serverFactory = (handler, opts) => {
  return createServer()
    .on("request", (req, res) => {
      handler(req, res);
    })
    .on("upgrade", (req, socket, head) => {
      // @ts-ignore          VVVVVV
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

// async function* readStream(body: ReadableStream<Uint8Array>) {
//   const reader = body.getReader();
//   const decoder = new TextDecoder("utf-8");

//   let partial = "";

//   let done = false;
//   while (!done) {
//     const { value, done: streamDone } = await reader.read();
//     done = streamDone;
//     if (value) {
//       let decodedData = decoder.decode(value, { stream: false });

//       // Remove "data: " from each line in the decoded data
//       decodedData = decodedData
//         .split("\n")
//         .map((line) => (line.startsWith("data: ") ? line.substring(6) : line))
//         .join("\n")
//         .trim();

//       if (decodedData !== "[DONE]") {
//         const arr = decodedData.split("\n");
//         for (let i = 0; i < arr.length; i++) {
//           const el = arr[i].replaceAll("\n", "");
//           if (el === "\n") continue;
//           if (el === "[DONE]") {
//             done = true;
//             continue;
//           }
//           if (el.charAt(el.length - 1) === "}") {
//             try {
//               partial += el;
//               yield `${partial}`;
//               partial = "";
//             } catch (error) {
//               console.log("Got error while parsing JSON", error);
//               console.log("Partial: ", partial);
//             }
//           } else {
//             partial += el;
//           }
//         }
//       }
//     }
//   }

//   console.log("Stream complete.");
// }
