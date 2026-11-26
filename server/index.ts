import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || "5000", 10);

  // Try binding to a list of hosts. On some Windows environments binding to
  // 0.0.0.0 can throw ENOTSUP (operation not supported). In that case we
  // automatically retry on localhost and 127.0.0.1 so the dev server still works.
  const hostsToTry = [process.env.HOST || "0.0.0.0", "localhost", "127.0.0.1"];
  let tryIndex = 0;

  const tryListen = () => {
    const host = hostsToTry[tryIndex++] || "localhost";

    const onError = (err: NodeJS.ErrnoException) => {
      // If the error is ENOTSUP, try the next host in the list.
      if (err && err.code === "ENOTSUP" && tryIndex < hostsToTry.length) {
        log(`listen on ${host}:${port} failed (${err.code}), retrying on ${hostsToTry[tryIndex]}...`);
        server.off("error", onError);
        tryListen();
        return;
      }

      // Otherwise print and exit so we don't crash with an uncaught error.
      console.error("Server listen error:", err);
      process.exit(1);
    };

    server.once("error", onError);
    server.listen({ port, host }, () => {
      server.off("error", onError);
      // If we bound to 0.0.0.0 (INADDR_ANY) the browser can't connect to
      // that literal address — suggest localhost which routes to the same
      // interface for local development.
      const displayHost = host === "0.0.0.0" ? "localhost" : host;
      log(`✅ Server running on http://${host}:${port} — open http://${displayHost}:${port}`);
    });
  };

  tryListen();


})();
