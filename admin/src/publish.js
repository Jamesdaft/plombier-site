import { getFile, putFile, deleteFile } from "./github.js";
import { renderArticlePage, injectBlogCards } from "./render/article.js";
import { renderSitemap } from "./render/sitemap.js";

async function getPublishedArticles(env, { excludeId } = {}) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM articles WHERE status = 'published' AND id != ? ORDER BY published_at DESC"
  )
    .bind(excludeId ?? -1)
    .all();
  return results;
}

/**
 * Publie (ou republie) un article : génère sa page, met à jour le carousel de l'accueil
 * et le sitemap, commit sur GitHub — puis seulement si tout a réussi, marque l'article
 * comme publié en base. Ordre volontaire : on ne veut jamais que D1 dise "publié" si le
 * commit GitHub a échoué en cours de route (ça mentirait sur l'état réel du site).
 */
export async function publishArticle(env, articleId) {
  const article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?")
    .bind(articleId)
    .first();
  if (!article) throw new Error("Article introuvable");

  const publishedAt = article.published_at || new Date().toISOString();
  const candidate = { ...article, published_at: publishedAt };
  const allPublished = [candidate, ...(await getPublishedArticles(env, { excludeId: articleId }))];

  const articlePage = renderArticlePage(candidate);
  await putFile(
    env,
    `blog/${candidate.slug}.html`,
    articlePage,
    `Publie l'article "${candidate.title}" (via admin)`
  );

  const indexFile = await getFile(env, "index.html");
  const updatedIndex = injectBlogCards(indexFile.content, allPublished);
  await putFile(env, "index.html", updatedIndex, `Ajoute "${candidate.title}" au carousel blog (via admin)`);

  const sitemap = renderSitemap(allPublished);
  await putFile(env, "sitemap.xml", sitemap, `Met a jour le sitemap avec "${candidate.title}" (via admin)`);

  // Les 3 commits ont réussi : on peut maintenant refléter l'état "publié" en base.
  await env.DB.prepare(
    "UPDATE articles SET status = 'published', published_at = ?, updated_at = ? WHERE id = ?"
  )
    .bind(publishedAt, new Date().toISOString(), articleId)
    .run();

  return candidate;
}

/** Dépublie un article : retire le fichier, la carte et l'entrée sitemap, puis repasse en brouillon en base. */
export async function unpublishArticle(env, articleId) {
  const article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?")
    .bind(articleId)
    .first();
  if (!article) throw new Error("Article introuvable");

  const remaining = await getPublishedArticles(env, { excludeId: articleId });

  await deleteFile(env, `blog/${article.slug}.html`, `Retire l'article "${article.title}" (via admin)`);

  const indexFile = await getFile(env, "index.html");
  const updatedIndex = injectBlogCards(indexFile.content, remaining);
  await putFile(env, "index.html", updatedIndex, `Retire "${article.title}" du carousel blog (via admin)`);

  const sitemap = renderSitemap(remaining);
  await putFile(env, "sitemap.xml", sitemap, `Met a jour le sitemap apres retrait de "${article.title}" (via admin)`);

  // Les commits ont réussi : on peut maintenant repasser l'article en brouillon.
  await env.DB.prepare("UPDATE articles SET status = 'draft' WHERE id = ?").bind(articleId).run();
}
