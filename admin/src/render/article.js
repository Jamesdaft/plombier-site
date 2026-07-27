import { escapeHtml, frenchDate } from "../util.js";
import { renderCardIcon } from "../icons.js";

const GA4_ID = "G-1MW342DVGG";
const STYLE_VERSION = "13";
const SCRIPT_VERSION = "14";

const CALL_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>';
const QUOTE_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>';
const CHEVRON_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

/** Génère le fichier HTML complet blog/<slug>.html, sur le même gabarit que les articles existants. */
export function renderArticlePage(article) {
  const today = new Date().toISOString().slice(0, 10);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(article.title)} – Hautes-Alpes | EPC</title>
  <meta name="description" content="${escapeHtml(article.meta_description || article.excerpt)}" />
  <meta name="robots" content="index, follow" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

  <!-- Google Analytics GA4 — GA4 EPC actif -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA4_ID}');
  </script>

  <link rel="canonical" href="https://epc05.fr/blog/${article.slug}.html" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(article.title)},
    "description": ${JSON.stringify(article.meta_description || article.excerpt)},
    "author": { "@type": "Person", "name": "Eliott Van Holderbeke" },
    "publisher": {
      "@type": "Organization",
      "name": "EPC – Plombier Chauffagiste",
      "logo": { "@type": "ImageObject", "url": "https://epc05.fr/img/LOGO.png" }
    },
    "datePublished": "${article.published_at || today}",
    "dateModified": "${today}",
    "mainEntityOfPage": "https://epc05.fr/blog/${article.slug}.html"
  }
  </script>

  <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
  <link rel="stylesheet" href="../style.css?v=${STYLE_VERSION}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
</head>
<body>

  <nav class="navbar" id="navbar">
    <div class="nav-inner">
      <a href="../index.html" class="nav-logo">
        <img src="../img/LOGO.png" alt="Logo EPC Plombier Chauffagiste" />
        <span>EPC</span>
      </a>
      <ul class="nav-links">
        <li><a href="../index.html#services">Services</a></li>
        <li><a href="../index.html#about">À propos</a></li>
        <li><a href="../index.html#blog">Blog</a></li>
        <li><a href="../index.html#contact">Contact</a></li>
        <li><a href="../index.html#devis" class="btn-nav btn-nav-devis">Devis gratuit</a></li>
        <li><a href="tel:+33771806082" class="btn-nav">07 71 80 60 82</a></li>
      </ul>
      <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>

  <section class="article-hero">
    <div class="container">
      <p class="article-breadcrumb"><a href="../index.html">Accueil</a> › <a href="../index.html#blog">Blog</a> › ${escapeHtml(article.title)}</p>
      <span class="article-badge ${article.tag_type}">${escapeHtml(article.tag_label)}</span>
      <h1>${escapeHtml(article.title)}</h1>
      <div class="article-meta">
        <span>${frenchDate(article.published_at || today)}</span>
        <span>Eliott Van Holderbeke – EPC</span>
        <span>${escapeHtml(article.reading_time || "5 min de lecture")}</span>
      </div>
    </div>
  </section>

  <section class="article-body">
    <div class="container">
      <div class="article-content">
${article.content_html}
      </div>
    </div>
  </section>

  <section class="article-cta-section">
    <div class="container">
      <h2>Un besoin dans les Hautes-Alpes ?</h2>
      <p>Devis gratuit — Intervention rapide selon votre situation</p>
      <div class="article-cta-btns">
        <a href="tel:+33771806082" class="btn-primary">
          ${CALL_ICON}
          07 71 80 60 82
        </a>
        <a href="../index.html#devis" class="btn-secondary">
          ${QUOTE_ICON}
          Demander un devis
        </a>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-logo"><img src="../img/LOGO.png" alt="EPC" /><span>EPC</span></div>
      <p class="footer-slogan">Des solutions simples, un confort durable</p>
      <p class="footer-siret">Eliott Van Holderbeke – SIRET : 992 642 926 00016</p>
      <p class="footer-copy">© ${new Date().getFullYear()} EPC – Tous droits réservés</p>
    </div>
  </footer>

  <div class="mobile-bar">
    <a href="tel:+33771806082" class="mobile-bar-btn mobile-bar-call">
      ${CALL_ICON}
      Appeler
    </a>
    <a href="../index.html#devis" class="mobile-bar-btn mobile-bar-devis">
      ${QUOTE_ICON}
      Devis gratuit
    </a>
  </div>

  <script src="../script.js?v=${SCRIPT_VERSION}"></script>
</body>
</html>
`;
}

/** Génère une carte `.blog-slide` pour le carousel de la page d'accueil. */
export function renderBlogCard(article) {
  return `        <div class="blog-slide"><article class="blog-card">
          <div class="blog-card-icon">${renderCardIcon(article.icon_theme, article.tag_type)}</div>
          <div class="blog-card-body">
            <span class="blog-tag ${article.tag_type}">${escapeHtml(article.tag_label)}</span>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.excerpt)}</p>
            <a href="blog/${article.slug}.html" class="blog-link">Lire l'article ${CHEVRON_ICON}</a>
          </div>
        </article></div>`;
}

/** Injecte le bloc de cartes entre les marqueurs BLOG_CARDS:START/END dans le index.html donné. */
export function injectBlogCards(indexHtml, publishedArticles) {
  const cardsHtml = publishedArticles.map(renderBlogCard).join("\n\n");
  const block = `<!-- BLOG_CARDS:START -->\n\n${cardsHtml}\n\n        <!-- BLOG_CARDS:END -->`;
  return indexHtml.replace(
    /<!-- BLOG_CARDS:START -->[\s\S]*?<!-- BLOG_CARDS:END -->/,
    block
  );
}
