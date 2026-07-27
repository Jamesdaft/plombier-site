import { escapeHtml } from "../util.js";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", key: "dashboard" },
  { href: "/admin/articles", label: "Articles de blog", key: "articles" },
  { href: "/admin/gallery", label: "Photos", key: "gallery" },
];

export function renderLayout({ title, active, body }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(title)} — Espace EPC</title>
<style>
  :root {
    --blue: #2E6DA4;
    --red: #C0392B;
    --gold: #C9A84C;
    --bg: #F7F8FA;
    --card: #FFFFFF;
    --text: #23272B;
    --muted: #6B7480;
    --border: #E3E7EC;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  a { color: var(--blue); text-decoration: none; }
  .topbar {
    background: var(--blue);
    color: #fff;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .topbar strong { font-size: 1.1rem; }
  .topbar form { margin: 0; }
  .topbar button {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  nav.tabs {
    display: flex;
    gap: 4px;
    background: #fff;
    border-bottom: 1px solid var(--border);
    padding: 0 20px;
    overflow-x: auto;
  }
  nav.tabs a {
    padding: 14px 16px;
    color: var(--muted);
    font-weight: 600;
    font-size: 0.95rem;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  nav.tabs a.active { color: var(--blue); border-bottom-color: var(--blue); }
  main { max-width: 900px; margin: 0 auto; padding: 24px 16px 60px; }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 16px;
  }
  h1 { font-size: 1.4rem; margin: 0 0 16px; }
  h2 { font-size: 1.1rem; margin: 0 0 12px; }
  label { display: block; font-weight: 600; font-size: 0.85rem; margin: 14px 0 4px; }
  input[type=text], input[type=tel], input[type=email], input[type=password], input[type=file],
  select, textarea {
    width: 100%;
    padding: 9px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
  }
  textarea { min-height: 90px; }
  .btn {
    display: inline-block;
    background: var(--blue);
    color: #fff;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 12px;
  }
  .btn.secondary { background: var(--muted); }
  .btn.danger { background: var(--red); }
  .btn.gold { background: var(--gold); }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .row form { margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--border); }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
  }
  .badge.draft { background: #EEE; color: var(--muted); }
  .badge.published { background: #E4F6E9; color: #1E7A3C; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
  .stat-tile { background: var(--bg); border-radius: 8px; padding: 14px; text-align: center; }
  .stat-tile .n { font-size: 1.6rem; font-weight: 800; color: var(--blue); }
  .stat-tile .l { font-size: 0.8rem; color: var(--muted); }
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  .gallery-grid img { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; }
  .error-box { background: #FDEAEA; color: var(--red); padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 0.9rem; }
  .muted { color: var(--muted); font-size: 0.85rem; }
</style>
</head>
<body>
  <div class="topbar">
    <strong>Espace EPC</strong>
    <form method="post" action="/admin/logout"><button type="submit">Se déconnecter</button></form>
  </div>
  <nav class="tabs">
    ${NAV_ITEMS.map(
      (item) =>
        `<a href="${item.href}" class="${item.key === active ? "active" : ""}">${item.label}</a>`
    ).join("")}
  </nav>
  <main>${body}</main>
</body>
</html>`;
}

export function renderLoginPage({ error } = {}) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Connexion — Espace EPC</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #2E6DA4; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
  .box { background: #fff; padding: 32px; border-radius: 12px; width: 100%; max-width: 340px; }
  h1 { font-size: 1.2rem; margin: 0 0 16px; text-align: center; }
  input { width: 100%; padding: 10px; border: 1px solid #E3E7EC; border-radius: 6px; font-size: 1rem; box-sizing: border-box; }
  button { width: 100%; margin-top: 14px; background: #2E6DA4; color: #fff; border: none; padding: 11px; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; }
  .error-box { background: #FDEAEA; color: #C0392B; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 0.9rem; }
</style>
</head>
<body>
  <form class="box" method="post" action="/admin/login">
    <h1>Espace EPC — Connexion</h1>
    ${error ? `<div class="error-box">${escapeHtml(error)}</div>` : ""}
    <label for="password">Mot de passe</label>
    <input type="password" id="password" name="password" required autofocus />
    <button type="submit">Se connecter</button>
  </form>
</body>
</html>`;
}
