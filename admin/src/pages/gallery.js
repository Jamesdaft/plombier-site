import { escapeHtml } from "../util.js";
import { renderLayout } from "./layout.js";

export function renderGalleryPage({ photos, error }) {
  const grid = photos
    .map(
      (p) => `<div>
        <img src="${p.public_url}" alt="${escapeHtml(p.alt)}" />
        <form method="post" action="/admin/gallery/${p.id}/delete" onsubmit="return confirm('Supprimer cette photo ?');" style="margin-top:6px;">
          <button class="btn danger" type="submit" style="width:100%; margin-top:0; padding:6px;">Supprimer</button>
        </form>
      </div>`
    )
    .join("");

  const body = `
    <h1>Photos de chantier</h1>
    ${error ? `<div class="error-box">${escapeHtml(error)}</div>` : ""}
    <div class="card">
      <h2>Ajouter une photo</h2>
      <form method="post" action="/admin/gallery/upload" enctype="multipart/form-data">
        <label for="photo">Photo (JPG, PNG ou WebP)</label>
        <input type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp" required />
        <label for="alt">Description courte</label>
        <input type="text" id="alt" name="alt" placeholder="Chantier EPC Hautes-Alpes" />
        <button class="btn" type="submit">Ajouter à la galerie</button>
      </form>
    </div>
    <div class="card">
      <h2>Photos en ligne (${photos.length})</h2>
      <div class="gallery-grid">${grid || `<p class="muted">Aucune photo pour le moment — la galerie affiche des emplacements "À venir".</p>`}</div>
    </div>
  `;

  return renderLayout({ title: "Photos", active: "gallery", body });
}
