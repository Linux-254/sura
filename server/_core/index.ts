import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createSuraApi } from "../sura-api";

const app = createSuraApi();
const publicPath = path.resolve(process.cwd(), "dist/public");

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, { maxAge: "1h" }));
  app.get("*", (_req, res) => res.sendFile(path.join(publicPath, "index.html")));
}

const port = Number(process.env.PORT ?? 3000);
const server = createServer(app);
server.listen(port, "0.0.0.0", () => console.log(`SURA running on http://0.0.0.0:${port}`));
export { app };
