export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ============================
    // CONFIG
    // ============================
    const API_TOKEN = "fUB7ucne1e2huJMO-BfTVJX3QzjXPKETOX_upCNc";
    const ZONE_ID = "81a4d9f5d1aaf9c826a5e5d0aa7fa514";
    const DOMAIN = "idssh.net";
    const DEFAULT_FORWARD = "berkasaink@gmail.com";
    const PASSWORD = "GoenkTea404";

    const BASE_URL = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing`;

    const headers = {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    };

    // ============================
    // AUTHENTICATION
    // ============================
    const pwd = url.searchParams.get("pwd");
    if (pwd !== PASSWORD) {
      return new Response(`
        <html>
          <head>
            <title>Login</title>
            <style>
              body { background:#111; color:white; font-family:Arial; display:flex; justify-content:center; align-items:center; height:100vh; }
              .box { background:#1e1e1e; padding:30px; border-radius:12px; width:300px; text-align:center; }
              input { width:100%; padding:10px; border-radius:6px; border:none; margin-top:10px; }
              button { width:100%; margin-top:10px; padding:10px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>Login</h2>
              <input id="p" type="password" placeholder="Password"/>
              <button onclick="go()">Masuk</button>
            </div>

            <script>
              function go(){
                const p = document.getElementById("p").value;
                window.location = "?pwd=" + p;
              }
            </script>
          </body>
        </html>
      `, { headers: {"content-type":"text/html"}});
    }

    // ============================
    // HANDLE API REQUESTS
    // ============================

    // LIST EMAIL
    if (path === "/list") {
      const resp = await fetch(`${BASE_URL}/rules`, { headers });
      const data = await resp.json();
      return Response.json(data);
    }

    // CREATE EMAIL
    if (path === "/create" && request.method === "POST") {
      const body = await request.json();
      const alias = body.alias.toLowerCase();

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

      const resp = await fetch(`${BASE_URL}/rules`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      return Response.json(await resp.json());
    }

    // DELETE EMAIL
    if (path === "/delete" && request.method === "POST") {
      const body = await request.json();
      const id = body.id;

      const resp = await fetch(`${BASE_URL}/rules/${id}`, {
        method: "DELETE",
        headers
      });

      return Response.json(await resp.json());
    }

    // ============================
    // FRONT-END PAGE
    // ============================
    return new Response(`
      <html>
        <head>
          <title>Email Manager</title>
          <style>
            body { font-family: Arial; padding: 20px; background:#0f0f0f; color:white; }
            .container { max-width: 600px; margin:auto; }
            .card { background:#1a1a1a; padding:20px; border-radius:10px; margin-top:20px; }
            input { width:100%; padding:10px; border-radius:6px; border:none; }
            button { padding:10px 15px; margin-top:10px; background:#4CAF50; border:none; border-radius:6px; color:white; cursor:pointer; }
            .email-item { display:flex; justify-content:space-between; padding:10px; background:#222; border-radius:6px; margin-top:8px; }
            .del { background:#d9534f; padding:5px 10px; border:none; border-radius:4px; color:white; cursor:pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📨 Email Alias Manager</h1>

            <div class="card">
              <h3>Buat Email Baru</h3>
              <input id="alias" placeholder="contoh: admin"/>
              <button onclick="buat()">Buat Email</button>
            </div>

            <div class="card">
              <h3>Daftar Email Alias</h3>
              <div id="list">Loading...</div>
            </div>
          </div>

          <script>
            const pwd = "${PASSWORD}";

            async function loadList(){
              const res = await fetch("/list?pwd=" + pwd);
              const data = await res.json();

              let html = "";
              data.result.forEach(r => {
                const email = r.matchers[0].value;
                html += \`
                  <div class="email-item">
                    <span>\${email}</span>
                    <button class="del" onclick="hapus('\${r.id}')">Hapus</button>
                  </div>
                \`;
              });

              document.getElementById("list").innerHTML = html || "Belum ada alias.";
            }

            async function buat(){
              const alias = document.getElementById("alias").value;
              if(!alias) return alert("Isi alias!");

              await fetch("/create?pwd=" + pwd, {
                method:"POST",
                body: JSON.stringify({ alias })
              });

              loadList();
              document.getElementById("alias").value = "";
            }

            async function hapus(id){
              await fetch("/delete?pwd=" + pwd, {
                method:"POST",
                body: JSON.stringify({ id })
              });

              loadList();
            }

            loadList();
          </script>
        </body>
      </html>
    `, { headers: { "content-type": "text/html" }});
  }
};
