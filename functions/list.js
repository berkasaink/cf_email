export async function onRequest(context) {
  const AUTH = context.request.headers.get("Authorization");
  if (AUTH !== "GoenkTea404") {
    return new Response("Unauthorized", { status: 401 });
  }

  const API_TOKEN = "fUB7ucne1e2huJMO-BfTVJX3QzjXPKETOX_upCNc";
  const ZONE_ID = "81a4d9f5d1aaf9c826a5e5d0aa7fa514";

  const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/rules`;

  const resp = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  return resp;
}
