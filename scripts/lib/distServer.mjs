// A missing MIME type silently breaks `<img>`/font loading in the browser scripts that share this.
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, sep } from "node:path";
import { chromium } from "playwright-core";

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export function createDistServer(distDir) {
  return createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let filePath = join(distDir, urlPath);

      if (!filePath.startsWith(distDir + sep) && filePath !== distDir) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
      }
      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, {
        "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
      });
      res.end(readFileSync(filePath));
    } catch {
      res.writeHead(500);
      res.end();
    }
  });
}

/** Callers must `server.close()` when done. */
export async function serveDist(distDir) {
  const server = createDistServer(distDir);

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const { port } = server.address();

  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

// The last attempt is Playwright's own Chromium, installed in CI via `npx playwright-core install --with-deps chromium`.
export async function launchBrowser(
  message = "Could not launch a browser. Install Chrome or set CHROME_PATH."
) {
  const attempts = process.env.CHROME_PATH
    ? [{ executablePath: process.env.CHROME_PATH }]
    : [{ channel: "chrome" }, { channel: "msedge" }, {}];

  let lastError;

  for (const options of attempts) {
    try {
      return await chromium.launch({ headless: true, ...options });
    } catch (error) {
      lastError = error;
    }
  }
  console.error(message);
  throw lastError;
}
