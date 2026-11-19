import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };

const server = createServer(async (req, res) => {
  const requested = decodeURIComponent((req.url || "/").split("?")[0]);
  const relative = requested === "/" ? "/public/index.html" : requested;
  const candidate = normalize(join(root, relative.startsWith("/public/") || relative.startsWith("/shared/") ? relative.slice(1) : `public${relative}`));
  if (!candidate.startsWith(root) || (!candidate.includes(`${join(root, "public")}`) && !candidate.includes(`${join(root, "shared")}`))) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  try {
    const body = await readFile(candidate);
    res.writeHead(200, { "content-type": `${types[extname(candidate)] || "text/plain"}; charset=utf-8`, "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => console.log(`[fieldshift] preview listening on http://0.0.0.0:${port}`));
