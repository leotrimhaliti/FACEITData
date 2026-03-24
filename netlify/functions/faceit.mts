import type { Context } from "@netlify/functions";

const FACEIT_BASE = "https://open.faceit.com/data/v4";

export default async function handler(req: Request, context: Context): Promise<Response> {
  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(req.url);
  // Strip the /api/faceit prefix to get the downstream path
  const path = url.pathname.replace(/^\/.netlify\/functions\/faceit/, "").replace(/^\/api\/faceit/, "");
  const search = url.search;

  const apiKey = process.env.FACEIT_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstreamUrl = `${FACEIT_BASE}${path}${search}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        "Cache-Control": "public, max-age=60", // Cache responses for 60s
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream request failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/faceit/*",
};
