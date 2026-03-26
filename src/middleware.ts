import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = "Möhlin4313";
const COOKIE_NAME = "hyponova-auth";

export function middleware(request: NextRequest) {
  // Check if already authenticated
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // Handle password submission
  if (request.method === "POST" && request.nextUrl.pathname === "/api/auth") {
    return; // Let the API route handle it
  }

  // Show login page
  return new NextResponse(getLoginHTML(), {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/auth (password endpoint)
     * - /_next (Next.js internals)
     * - /favicon.ico
     */
    "/((?!api/auth|_next|favicon.ico).*)",
  ],
};

function getLoginHTML() {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HYPONOVA – Zugang</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      max-width: 400px;
      width: 100%;
      padding: 0 24px;
    }
    .logo {
      height: 48px;
      margin-bottom: 48px;
      opacity: 0.9;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #c8553d;
      border: 1px solid rgba(200,85,61,0.3);
      border-radius: 20px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 300;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .subtitle {
      font-size: 15px;
      color: #666;
      margin-bottom: 40px;
      line-height: 1.6;
    }
    .divider {
      width: 40px;
      height: 1px;
      background: #333;
      margin: 0 auto 32px;
    }
    .auth-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555;
      margin-bottom: 12px;
    }
    .input-wrap {
      position: relative;
      margin-bottom: 16px;
    }
    input {
      width: 100%;
      padding: 14px 18px;
      font-size: 15px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #fff;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #666; }
    input::placeholder { color: #555; }
    button {
      width: 100%;
      padding: 14px;
      font-size: 15px;
      font-weight: 500;
      background: #fff;
      color: #000;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.85; }
    .error {
      color: #c8553d;
      font-size: 13px;
      margin-top: 12px;
      display: none;
    }
    .error.show { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <img
      src="https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos/hyponova-logo.png"
      alt="HYPONOVA"
      class="logo"
      style="filter: brightness(0) invert(1);"
    />
    <div class="badge">In Bearbeitung</div>
    <h1>Webseite wird gerade erstellt</h1>
    <p class="subtitle">Wir arbeiten an etwas Grossartigem.<br/>Besuchen Sie uns in 30 Tagen wieder.</p>
    <div class="divider"></div>
    <p class="auth-label">Zugang mit Berechtigung</p>
    <form id="authForm">
      <div class="input-wrap">
        <input type="password" id="password" placeholder="Passwort eingeben" autocomplete="off" autofocus />
      </div>
      <button type="submit">Zugang erhalten</button>
      <p class="error" id="error">Falsches Passwort. Bitte versuchen Sie es erneut.</p>
    </form>
  </div>
  <script>
    document.getElementById('authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('password').value;
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        document.getElementById('error').classList.add('show');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
      }
    });
  </script>
</body>
</html>`;
}
