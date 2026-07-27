import { isAuthenticated, verifyPassword, createSessionCookie, clearSessionCookie } from "./auth.js";
import { renderLoginPage } from "./pages/layout.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderArticlesListPage, renderArticleEditorPage } from "./pages/articles.js";
import { renderGalleryPage } from "./pages/gallery.js";
import { publishArticle, unpublishArticle } from "./publish.js";
import { uploadPhoto, deletePhoto } from "./photos.js";
import { getDashboardStats } from "./ga4.js";
import { logDevisSubmission, listDevisSubmissions } from "./devis.js";
import { slugify } from "./util.js";

const SITE_ORIGIN = "https://epc05.fr";

function html(body, init = {}) {
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
    ...init,
  });
}

function redirect(location, extraHeaders = {}) {
  return new Response(null, { status: 302, headers: { Location: location, ...extraHeaders } });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": SITE_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function readForm(request) {
  const data = await request.formData();
  return Object.fromEntries(data.entries());
}

async function handleApiDevis(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const body = await request.json();
    await logDevisSubmission(env, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}

async function handlePhoto(env, key) {
  const object = await env.PHOTOS.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

async function handleLogin(request, env) {
  if (request.method === "GET") {
    return html(renderLoginPage());
  }
  const form = await readForm(request);
  const ok = env.ADMIN_PASSWORD_HASH && (await verifyPassword(form.password || "", env.ADMIN_PASSWORD_HASH));
  if (!ok) {
    return html(renderLoginPage({ error: "Mot de passe incorrect." }), { status: 401 });
  }
  const cookie = await createSessionCookie(env.SESSION_SECRET);
  return redirect("/admin/dashboard", { "Set-Cookie": cookie });
}

async function handleLogout() {
  return redirect("/admin/login", { "Set-Cookie": clearSessionCookie() });
}

async function handleDashboard(env) {
  let stats = null;
  let statsError = null;
  try {
    stats = await getDashboardStats(env);
  } catch (err) {
    statsError = err.message;
  }

  const submissions = await listDevisSubmissions(env, 20);
  const { results: articleCountRows } = await env.DB.prepare(
    "SELECT COUNT(*) as n FROM articles WHERE status = 'published'"
  ).all();
  const { results: photoCountRows } = await env.DB.prepare("SELECT COUNT(*) as n FROM photos").all();
  const { results: devisCountRows } = await env.DB.prepare(
    "SELECT COUNT(*) as n FROM devis_submissions WHERE created_at >= datetime('now', '-30 days')"
  ).all();

  return html(
    renderDashboardPage({
      stats,
      statsError,
      submissions,
      counts: {
        articles: articleCountRows[0]?.n ?? 0,
        photos: photoCountRows[0]?.n ?? 0,
        devis: devisCountRows[0]?.n ?? 0,
      },
    })
  );
}

async function handleArticlesList(env) {
  const { results } = await env.DB.prepare("SELECT * FROM articles ORDER BY updated_at DESC").all();
  return html(renderArticlesListPage({ articles: results }));
}

function articleFromForm(form) {
  return {
    title: form.title || "",
    slug: (form.slug || slugify(form.title || "")).trim(),
    excerpt: form.excerpt || "",
    tag_label: form.tag_label || "",
    tag_type: form.tag_type === "obligatoire" ? "obligatoire" : "conseille",
    icon_theme: form.icon_theme || "flamme",
    meta_description: form.meta_description || "",
    reading_time: form.reading_time || "5 min de lecture",
    content_html: form.content_html || "",
  };
}

async function handleArticleNew(request, env) {
  if (request.method === "GET") {
    return html(renderArticleEditorPage({ article: null, isNew: true }));
  }
  const form = await readForm(request);
  const article = articleFromForm(form);
  if (!article.slug) {
    return html(
      renderArticleEditorPage({ article, isNew: true, error: "Le titre ou l'identifiant web est requis." }),
      { status: 400 }
    );
  }
  try {
    const result = await env.DB.prepare(
      `INSERT INTO articles (slug, title, excerpt, tag_label, tag_type, icon_theme, meta_description, reading_time, content_html)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        article.slug,
        article.title,
        article.excerpt,
        article.tag_label,
        article.tag_type,
        article.icon_theme,
        article.meta_description,
        article.reading_time,
        article.content_html
      )
      .run();
    return redirect(`/admin/articles/${result.meta.last_row_id}`);
  } catch (err) {
    return html(
      renderArticleEditorPage({
        article,
        isNew: true,
        error: `Impossible de créer l'article (identifiant web déjà utilisé ?) : ${err.message}`,
      }),
      { status: 400 }
    );
  }
}

async function handleArticleEdit(request, env, id) {
  const article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
  if (!article) return new Response("Article introuvable", { status: 404 });

  if (request.method === "GET") {
    return html(renderArticleEditorPage({ article, isNew: false }));
  }

  const form = await readForm(request);
  const updated = articleFromForm(form);
  await env.DB.prepare(
    `UPDATE articles SET title = ?, slug = ?, excerpt = ?, tag_label = ?, tag_type = ?, icon_theme = ?,
       meta_description = ?, reading_time = ?, content_html = ?, updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      updated.title,
      updated.slug,
      updated.excerpt,
      updated.tag_label,
      updated.tag_type,
      updated.icon_theme,
      updated.meta_description,
      updated.reading_time,
      updated.content_html,
      id
    )
    .run();

  if (article.status === "published") {
    await publishArticle(env, id);
  }

  return redirect(`/admin/articles/${id}`);
}

async function handlePublish(env, id) {
  await publishArticle(env, id);
  return redirect(`/admin/articles/${id}`);
}

async function handleUnpublish(env, id) {
  await unpublishArticle(env, id);
  return redirect(`/admin/articles/${id}`);
}

async function handleDeleteArticle(env, id) {
  const article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
  if (article?.status === "published") {
    await unpublishArticle(env, id);
  }
  await env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
  return redirect("/admin/articles");
}

async function handleGallery(env) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM photos ORDER BY position ASC, uploaded_at ASC"
  ).all();
  return html(renderGalleryPage({ photos: results }));
}

async function handleGalleryUpload(request, env) {
  const data = await request.formData();
  const file = data.get("photo");
  const alt = data.get("alt");
  if (!file || typeof file === "string") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM photos ORDER BY position ASC, uploaded_at ASC"
    ).all();
    return html(renderGalleryPage({ photos: results, error: "Merci de choisir un fichier image." }), {
      status: 400,
    });
  }
  try {
    const arrayBuffer = await file.arrayBuffer();
    await uploadPhoto(env, { arrayBuffer, contentType: file.type, alt });
    return redirect("/admin/gallery");
  } catch (err) {
    const { results } = await env.DB.prepare(
      "SELECT * FROM photos ORDER BY position ASC, uploaded_at ASC"
    ).all();
    return html(renderGalleryPage({ photos: results, error: err.message }), { status: 400 });
  }
}

async function handleGalleryDelete(env, id) {
  await deletePhoto(env, id);
  return redirect("/admin/gallery");
}

async function route(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/api/devis") {
      return handleApiDevis(request, env);
    }

    if (pathname.startsWith("/photos/")) {
      return handlePhoto(env, pathname.slice("/photos/".length));
    }

    if (pathname === "/admin/login") {
      return handleLogin(request, env);
    }

    if (pathname === "/admin/logout" && request.method === "POST") {
      return handleLogout();
    }

    if (pathname.startsWith("/admin")) {
      const authed = await isAuthenticated(request, env.SESSION_SECRET);
      if (!authed) return redirect("/admin/login");

      if (pathname === "/admin" || pathname === "/admin/") {
        return redirect("/admin/dashboard");
      }
      if (pathname === "/admin/dashboard") {
        return handleDashboard(env);
      }
      if (pathname === "/admin/articles") {
        return handleArticlesList(env);
      }
      if (pathname === "/admin/articles/new") {
        return handleArticleNew(request, env);
      }

      let match = pathname.match(/^\/admin\/articles\/(\d+)\/publish$/);
      if (match && request.method === "POST") return handlePublish(env, match[1]);

      match = pathname.match(/^\/admin\/articles\/(\d+)\/unpublish$/);
      if (match && request.method === "POST") return handleUnpublish(env, match[1]);

      match = pathname.match(/^\/admin\/articles\/(\d+)\/delete$/);
      if (match && request.method === "POST") return handleDeleteArticle(env, match[1]);

      match = pathname.match(/^\/admin\/articles\/(\d+)$/);
      if (match) return handleArticleEdit(request, env, match[1]);

      if (pathname === "/admin/gallery") {
        return handleGallery(env);
      }
      if (pathname === "/admin/gallery/upload" && request.method === "POST") {
        return handleGalleryUpload(request, env);
      }
      match = pathname.match(/^\/admin\/gallery\/(\d+)\/delete$/);
      if (match && request.method === "POST") return handleGalleryDelete(env, match[1]);

      return new Response("Not found", { status: 404 });
    }

  return new Response("Not found", { status: 404 });
}

function errorPage(message) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" />
  <title>Erreur — Espace EPC</title>
  <style>body{font-family:-apple-system,sans-serif;background:#F7F8FA;padding:40px 20px;text-align:center;}
  .box{background:#fff;border-radius:10px;padding:30px;max-width:420px;margin:0 auto;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
  h1{color:#C0392B;font-size:1.2rem;}p{color:#6B7480;font-size:0.9rem;}</style></head>
  <body><div class="box"><h1>Une erreur est survenue</h1>
  <p>${message}</p>
  <p>Réessayez dans un instant, ou contactez Juliane si ça persiste.</p>
  <p><a href="/admin/dashboard">Retour au tableau de bord</a></p></div></body></html>`;
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (err) {
      console.error(err);
      const isPublicApi = new URL(request.url).pathname.startsWith("/api/");
      if (isPublicApi) {
        return new Response(JSON.stringify({ ok: false }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(errorPage("Impossible de terminer cette action."), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=UTF-8" },
      });
    }
  },
};
