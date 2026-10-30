// QA proxy: / disables all JavaScript; /?qa=model-failure allows JavaScript
// but rejects every GLB. Both cases must still show all four homepage objects.
// Start the production site first, then pass its port (default 3003).
import { createServer } from "node:http";

const upstream = `http://127.0.0.1:${Number(process.argv[2] || 3003)}`;
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, upstream);
    if (url.pathname.endsWith(".glb")) {
      console.log(`Deliberately blocked: ${url.pathname}`);
      response.writeHead(503).end("Model unavailable for fallback verification");
      return;
    }
    const source = await fetch(url);
    response.statusCode = source.status;
    response.setHeader("Content-Type", source.headers.get("content-type") || "application/octet-stream");
    if (url.pathname === "/" && url.searchParams.get("qa") !== "model-failure") {
      response.setHeader("Content-Security-Policy", "script-src 'none'; object-src 'none'");
    }
    response.end(Buffer.from(await source.arrayBuffer()));
  } catch (error) {
    response.writeHead(502).end(String(error));
  }
}).listen(3011, "127.0.0.1", () => console.log(`First-paint QA: http://localhost:3011 → ${upstream}`));
