function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/** Régénère sitemap.xml en entier : accueil + tous les articles publiés. */
export function renderSitemap(publishedArticles) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [urlEntry("https://epc05.fr/", today, "monthly", "1.0")];
  for (const article of publishedArticles) {
    entries.push(
      urlEntry(
        `https://epc05.fr/blog/${article.slug}.html`,
        (article.published_at || today).slice(0, 10),
        "yearly",
        "0.8"
      )
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries.join("\n\n")}

</urlset>
`;
}
