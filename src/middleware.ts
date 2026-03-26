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
      margin-bottom: 40px;
      opacity: 0.9;
    }
    h1 {
      font-size: 20px;
      font-weight: 400;
      color: #999;
      margin-bottom: 32px;
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
    <h1>Diese Seite ist passwortgeschützt</h1>
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
