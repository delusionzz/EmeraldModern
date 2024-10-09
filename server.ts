import "dotenv/config";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { createServer } from "http";
import wisp from "wisp-server-node";
import path from "path";
import { fileURLToPath } from "url";
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
