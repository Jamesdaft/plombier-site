import { escapeHtml } from "../util.js";
import { renderLayout } from "./layout.js";

export function renderArticlesListPage({ articles }) {
  const rows = articles
    .map(
      (a) => `<tr>
        <td><a href="/admin/articles/${a.id}">${escapeHtml(a.title)}</a></td>
        <td><span class="badge ${a.status}">${a.status === "published" ? "Publié" : "Brouillon"}</span></td>
        <td class="muted">${a.updated_at}</td>
      </tr>`
    )
    .join("");

  const body = `
    <h1>Articles de blog</h1>
    <div class="card">
      <a class="btn" href="/admin/articles/new">+ Nouvel article</a>
      <table style="margin-top:16px;">
        <thead><tr><th>Titre</th><th>Statut</th><th>Modifié le</th></tr></thead>
        <tbody>${rows || `<tr><td class="muted">Aucun article pour le moment</td></tr>`}</tbody>
      </table>
    </div>
  `;

  return renderLayout({ title: "Articles", active: "articles", body });
}

const EDITOR_SCRIPT = `
<script>
  function exec(cmd, value) {
    document.getElementById('editor').focus();
    if (cmd === 'createLink') {
      const url = prompt('Lien (https://...)');
      if (!url) return;
      document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, value || null);
    }
  }
  document.getElementById('articleForm').addEventListener('submit', function () {
    document.getElementById('content_html').value = document.getElementById('editor').innerHTML;
  });
  document.getElementById('title')?.addEventListener('blur', function () {
    const slugField = document.getElementById('slug');
    if (slugField && !slugField.dataset.touched && !slugField.value) {
      slugField.value = this.value
        .toLowerCase()
        .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-hautes-alpes';
    }
  });
  document.getElementById('slug')?.addEventListener('input', function () { this.dataset.touched = '1'; });
<\/script>`;

function toolbar() {
  return `<div class="row" style="margin-bottom:8px;">
    <button type="button" class="btn secondary" onclick="exec('bold')">Gras</button>
    <button type="button" class="btn secondary" onclick="exec('italic')">Italique</button>
    <button type="button" class="btn secondary" onclick="exec('formatBlock','h2')">Titre H2</button>
    <button type="button" class="btn secondary" onclick="exec('formatBlock','h3')">Titre H3</button>
    <button type="button" class="btn secondary" onclick="exec('formatBlock','p')">Paragraphe</button>
    <button type="button" class="btn secondary" onclick="exec('insertUnorderedList')">Liste</button>
    <button type="button" class="btn secondary" onclick="exec('createLink')">Lien</button>
  </div>`;
}

const TAG_TYPES = [
  { value: "obligatoire", label: "Obligation légale / Urgence (rouge)" },
  { value: "conseille", label: "Conseil pratique (bleu)" },
];
const ICON_THEMES = [
  { value: "flamme", label: "Flamme" },
  { value: "goutte", label: "Goutte d'eau" },
  { value: "poele", label: "Poêle" },
  { value: "jauge", label: "Jauge de pression" },
];

export function renderArticleEditorPage({ article, isNew, error }) {
  const a = article || {
    id: null,
    title: "",
    slug: "",
    excerpt: "",
    tag_label: "",
    tag_type: "conseille",
    icon_theme: "flamme",
    meta_description: "",
    reading_time: "5 min de lecture",
    content_html: "",
    status: "draft",
  };

  const actionUrl = isNew ? "/admin/articles/new" : `/admin/articles/${a.id}`;

  const publishButtons = isNew
    ? ""
    : `<div class="row" style="margin-top:16px;">
        ${
          a.status === "published"
            ? `<form method="post" action="/admin/articles/${a.id}/unpublish"><button class="btn secondary" type="submit">Dépublier</button></form>`
            : `<form method="post" action="/admin/articles/${a.id}/publish"><button class="btn gold" type="submit">Publier sur le site</button></form>`
        }
        <form method="post" action="/admin/articles/${a.id}/delete" onsubmit="return confirm('Supprimer définitivement cet article ?');">
          <button class="btn danger" type="submit">Supprimer</button>
        </form>
      </div>`;

  const body = `
    <h1>${isNew ? "Nouvel article" : "Modifier l'article"}</h1>
    ${a.status ? `<p><span class="badge ${a.status}">${a.status === "published" ? "Publié" : "Brouillon"}</span></p>` : ""}
    ${error ? `<div class="error-box">${escapeHtml(error)}</div>` : ""}
    <div class="card">
      <form id="articleForm" method="post" action="${actionUrl}">
        <label for="title">Titre</label>
        <input type="text" id="title" name="title" value="${escapeHtml(a.title)}" required />

        <label for="slug">Identifiant web (slug — laisser vide pour auto)</label>
        <input type="text" id="slug" name="slug" value="${escapeHtml(a.slug)}" placeholder="ex: fuite-eau-urgence-hautes-alpes" />

        <div class="row">
          <div style="flex:1;">
            <label for="tag_type">Type</label>
            <select id="tag_type" name="tag_type">
              ${TAG_TYPES.map((t) => `<option value="${t.value}" ${a.tag_type === t.value ? "selected" : ""}>${t.label}</option>`).join("")}
            </select>
          </div>
          <div style="flex:1;">
            <label for="icon_theme">Icône</label>
            <select id="icon_theme" name="icon_theme">
              ${ICON_THEMES.map((t) => `<option value="${t.value}" ${a.icon_theme === t.value ? "selected" : ""}>${t.label}</option>`).join("")}
            </select>
          </div>
        </div>

        <label for="tag_label">Étiquette affichée (ex: "Urgence", "Conseil pratique")</label>
        <input type="text" id="tag_label" name="tag_label" value="${escapeHtml(a.tag_label)}" required />

        <label for="excerpt">Résumé court (affiché sur la carte de l'accueil)</label>
        <textarea id="excerpt" name="excerpt" required>${escapeHtml(a.excerpt)}</textarea>

        <label for="meta_description">Description SEO (Google — optionnel, sinon le résumé est réutilisé)</label>
        <textarea id="meta_description" name="meta_description">${escapeHtml(a.meta_description)}</textarea>

        <label for="reading_time">Temps de lecture affiché</label>
        <input type="text" id="reading_time" name="reading_time" value="${escapeHtml(a.reading_time)}" />

        <label>Contenu de l'article</label>
        ${toolbar()}
        <div id="editor" contenteditable="true" style="border:1px solid #E3E7EC; border-radius:6px; padding:14px; min-height:260px;">${a.content_html}</div>
        <textarea id="content_html" name="content_html" style="display:none;"></textarea>

        <button class="btn" type="submit">${isNew ? "Créer le brouillon" : "Enregistrer"}</button>
      </form>
    </div>
    ${publishButtons}
    ${EDITOR_SCRIPT}
  `;

  return renderLayout({ title: isNew ? "Nouvel article" : a.title, active: "articles", body });
}
