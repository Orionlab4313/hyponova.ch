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
    status: 200,
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
    "/((?!api/|admin|_next|favicon.ico).*)",
  ],
};

function getLoginHTML() {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HYPONOVA – Zugang</title>
  <meta name="description" content="HYPONOVA – Ihr unabhängiger Hypothekenpartner in der Schweiz. Webseite in Bearbeitung." />
  <meta name="robots" content="noindex, nofollow" />
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
      color: #999;
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
      color: #999;
      margin-bottom: 12px;
    }
    .input-wrap {
      position: relative;
      margin-bottom: 16px;
    }
    input {
      width: 100%;
      padding: 14px 50px 14px 18px;
      font-size: 15px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #fff;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    input:focus { border-color: #666; }
    input::placeholder { color: #888; }
    .toggle-pw {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #888;
      opacity: 0.7;
      transition: opacity 0.15s;
    }
    .toggle-pw:hover { opacity: 1; color: #fff; }
    .toggle-pw svg { width: 20px; height: 20px; }
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
  <main>
  <div class="container">
    <img
      src="https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos/hyponova-logo-white.png"
      alt="HYPONOVA"
      class="logo"
    />
    <div class="badge">In Bearbeitung</div>
    <h1>Webseite wird gerade erstellt</h1>
    <p class="subtitle">Wir arbeiten an etwas Grossartigem.<br/>Besuchen Sie uns in 30 Tagen wieder.</p>
    <div class="divider"></div>
    <p class="auth-label">Zugang mit Berechtigung</p>
    <form id="authForm">
      <div class="input-wrap">
        <input type="password" id="password" placeholder="Passwort eingeben" autocomplete="off" autofocus />
        <button type="button" class="toggle-pw" id="togglePw" aria-label="Passwort anzeigen" tabindex="-1">
          <svg id="iconEye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <svg id="iconEyeOff" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            <line x1="2" y1="2" x2="22" y2="22"/>
          </svg>
        </button>
      </div>
      <button type="submit">Zugang erhalten</button>
      <p class="error" id="error">Falsches Passwort. Bitte versuchen Sie es erneut.</p>
    </form>
  </div>
  </main>
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

    document.getElementById('togglePw').addEventListener('click', () => {
      const input = document.getElementById('password');
      const eye = document.getElementById('iconEye');
      const eyeOff = document.getElementById('iconEyeOff');
      const btn = document.getElementById('togglePw');
      if (input.type === 'password') {
        input.type = 'text';
        eye.style.display = 'none';
        eyeOff.style.display = 'block';
        btn.setAttribute('aria-label', 'Passwort verbergen');
      } else {
        input.type = 'password';
        eye.style.display = 'block';
        eyeOff.style.display = 'none';
        btn.setAttribute('aria-label', 'Passwort anzeigen');
      }
      input.focus();
    });
  </script>
</body>
</html>`;
}
