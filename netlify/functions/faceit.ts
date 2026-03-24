const FACEIT_BASE = "https://open.faceit.com/data/v4";

export const handler = async (event: any) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.FACEIT_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured on server" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  // Strip the function prefix from the path to get the FACEIT endpoint
  // Incoming path: /.netlify/functions/faceit/players  (splat capture via redirect)
  // Desired FACEIT path: /players?nickname=leo
  const rawPath: string = event.path || "";
  const faceitPath = rawPath.replace(/^\/.netlify\/functions\/faceit/, "") || "/";

  // event.queryStringParameters is the correct Netlify v1 field (rawQuery does NOT exist)
  const qp = event.queryStringParameters as Record<string, string> | null;
  const queryString =
    qp && Object.keys(qp).length
      ? "?" +
        Object.entries(qp)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      : "";

  const upstreamUrl = `${FACEIT_BASE}${faceitPath}${queryString}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Upstream request failed" }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
