import "dotenv/config";
import express, { type Express } from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createApp(): Express {
  const app = express();

  // Configure body parser with a larger limit for image-led product uploads.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.VERCEL) {
    const clientPathCandidates = [
      path.resolve(process.cwd(), "public"),
      path.resolve(process.cwd(), "dist", "public"),
    ];
    const clientPath = clientPathCandidates.find(candidate => fs.existsSync(candidate));
    if (clientPath) {
      app.use(express.static(clientPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(clientPath, "index.html"));
      });
    }
  }

  return app;
}

/**
 * Serverless entry point used by Vercel. It intentionally excludes static-file
 * fallback handling because Vercel serves dist/public directly and rewrites
 * only backend requests to this function.
 */
export const app = createApp();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const { serveStatic, setupVite } = await import("./vite");
  const serverApp = createApp();
  const server = createServer(serverApp);

  if (process.env.NODE_ENV === "development") {
    await setupVite(serverApp, server);
  } else {
    serveStatic(serverApp);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

// Vercel imports `app` as a request handler. Local and Manus-hosted runs keep
// the existing persistent Express behavior.
if (!process.env.VERCEL) {
  startServer().catch(console.error);
}
