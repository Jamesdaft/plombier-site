import { escapeHtml, formatBytes } from "../util.js";
import { renderLayout } from "./layout.js";

const R2_FREE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 Go — quota gratuit Cloudflare R2

function renderStorageMeter(storage) {
  const pct = Math.min(100, (storage.usedBytes / R2_FREE_LIMIT_BYTES) * 100);
  const severity = pct >= 90 ? "danger" : pct >= 70 ? "warning" : "ok";
  return `<div class="card">
    <h2>Stockage des photos (R2)</h2>
    <div class="meter-track">
      <div class="meter-fill ${severity}" style="width:${pct.toFixed(1)}%"></div>
    </div>
    <p class="muted">${formatBytes(storage.usedBytes)} sur 10 Go utilisés (${pct.toFixed(1)}%) — ${storage.objectCount} photo${storage.objectCount === 1 ? "" : "s"}. Le forfait gratuit Cloudflare R2 s'arrête à 10 Go ; large marge pour des photos de chantier.</p>
  </div>`;
}

export function renderDashboardPage({ stats, statsError, submissions, counts, storage }) {
  const statsBlock = statsError
    ? `<p class="error-box">Stats Google Analytics indisponibles : ${escapeHtml(statsError)}</p>`
    : `<div class="stat-grid">
        <div class="stat-tile"><div class="n">${stats.users7}</div><div class="l">Visiteurs (7j)</div></div>
        <div class="stat-tile"><div class="n">${stats.sessions7}</div><div class="l">Sessions (7j)</div></div>
        <div class="stat-tile"><div class="n">${stats.users30}</div><div class="l">Visiteurs (30j)</div></div>
        <div class="stat-tile"><div class="n">${stats.sessions30}</div><div class="l">Sessions (30j)</div></div>
      </div>
      <h2 style="margin-top:20px;">Pages les plus vues (30j)</h2>
      <table>
        <tbody>
          ${stats.topPages
            .map((p) => `<tr><td>${escapeHtml(p.path)}</td><td>${p.views} vues</td></tr>`)
            .join("") || `<tr><td class="muted">Pas encore de données</td></tr>`}
        </tbody>
      </table>`;

  const body = `
    <h1>Tableau de bord</h1>
    <div class="card">
      ${statsBlock}
    </div>
    <div class="card">
      <div class="stat-grid">
        <div class="stat-tile"><div class="n">${counts.articles}</div><div class="l">Articles publiés</div></div>
        <div class="stat-tile"><div class="n">${counts.photos}</div><div class="l">Photos en ligne</div></div>
        <div class="stat-tile"><div class="n">${counts.devis}</div><div class="l">Demandes de devis (30j)</div></div>
      </div>
    </div>
    ${renderStorageMeter(storage)}
    <div class="card">
      <h2>Dernières demandes de devis</h2>
      <table>
        <thead><tr><th>Date</th><th>Nom</th><th>Téléphone</th><th>Message</th></tr></thead>
        <tbody>
          ${
            submissions.length
              ? submissions
                  .map(
                    (s) => `<tr>
                      <td class="muted">${escapeHtml(s.created_at)}</td>
                      <td>${escapeHtml(s.name)}</td>
                      <td>${escapeHtml(s.phone)}</td>
                      <td>${escapeHtml((s.message || "").slice(0, 80))}</td>
                    </tr>`
                  )
                  .join("")
              : `<tr><td class="muted">Aucune demande pour le moment</td></tr>`
          }
        </tbody>
      </table>
      <p class="muted">Ceci est une copie pour information — les demandes arrivent toujours par email via le formulaire du site.</p>
    </div>
  `;

  return renderLayout({ title: "Tableau de bord", active: "dashboard", body });
}
