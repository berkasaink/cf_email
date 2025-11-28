export async function onRequest(context) {
  const AUTH = context.request.headers.get("Authorization");
  if (AUTH !== "GoenkTea404") {
    return new Response("Unauthorized", { status: 401 });
  }

  const API_TOKEN = "fUB7ucne1e2huJMO-BfTVJX3QzjXPKETOX_upCNc";
  const ZONE_ID = "81a4d9f5d1aaf9c826a5e5d0aa7fa514";
  const DOMAIN = "idssh.net";
  const DEFAULT_FORWARD = "berkasaink@gmail.com";

  const { alias } = await context.request.json();

  const payload = {
    name: `Alias ${alias}`,
    enabled: true,
    matchers: [{
      type: "literal",
      field: "to",
      value: `${alias}@${DOMAIN}`
    }],
    actions: [{
      type: "forward",
      value: [DEFAULT_FORWARD]
    }]
  };

  const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/rules`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return resp;
}
