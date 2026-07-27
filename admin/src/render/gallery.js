import { escapeHtml } from "../util.js";

const MIN_SLIDES = 4;

const COMING_SOON_SLIDE = `        <div class="gallery-slide gallery-soon">
          <div class="gallery-soon-inner">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            <strong>À venir</strong>
            <span>Ma prochaine réalisation</span>
          </div>
        </div>`;

function renderGallerySlide(photo) {
  return `        <div class="gallery-slide"><img src="${photo.public_url}" alt="${escapeHtml(photo.alt)}" loading="lazy" /></div>`;
}

/** Injecte les vraies photos entre les marqueurs GALLERY_SLIDES:START/END, complétées par des slides "À venir" si besoin. */
export function injectGallerySlides(indexHtml, photos) {
  const slides = photos.map(renderGallerySlide);
  while (slides.length < MIN_SLIDES) slides.push(COMING_SOON_SLIDE);

  const block = `<!-- GALLERY_SLIDES:START -->\n${slides.join("\n")}\n        <!-- GALLERY_SLIDES:END -->`;
  return indexHtml.replace(
    /<!-- GALLERY_SLIDES:START -->[\s\S]*?<!-- GALLERY_SLIDES:END -->/,
    block
  );
}
