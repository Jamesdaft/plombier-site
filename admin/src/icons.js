// Presets d'icônes pour les cartes de blog, réutilisant les formes déjà dessinées
// sur le site (index.html) pour rester visuellement cohérent. La couleur est
// dérivée automatiquement du tag_type (obligatoire = rouge, conseille = bleu),
// donc Eliott n'a qu'une forme à choisir dans le formulaire admin.

const SHAPES = {
  flamme: (stroke, fillSoft) =>
    `<path d="M32 18 C29 23 25 28 25 32 C25 37 28.1 41 32 41 C35.9 41 39 37 39 32 C39 28 35 23 32 18Z" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" fill="${fillSoft}"/><path d="M29 36 C29 34 30.5 32 32 30" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`,
  goutte: (stroke, fillSoft) =>
    `<path d="M32 14 C28 20 22 27 22 33 C22 39.6 26.5 45 32 45 C37.5 45 42 39.6 42 33 C42 27 36 20 32 14Z" fill="${fillSoft}" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 36 C26 34 28.5 31 32 29" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`,
  poele: (stroke, fillSoft) =>
    `<rect x="20" y="36" width="24" height="14" rx="3" fill="${fillSoft}" stroke="${stroke}" stroke-width="2"/><path d="M26 36 L26 28 C26 22 38 22 38 28 L38 36" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  jauge: (stroke, fillSoft) =>
    `<circle cx="32" cy="32" r="14" stroke="${stroke}" stroke-width="2.5" fill="${fillSoft}"/><path d="M32 20 L32 24" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M32 40 L32 44" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M20 32 L24 32" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M40 32 L44 32" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/><path d="M26 32 L32 32 L36 28" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="32" r="2.5" fill="${stroke}"/>`,
};

export const ICON_THEMES = Object.keys(SHAPES);

const PALETTE = {
  obligatoire: { bg: "#FDEAEA", stroke: "#C0392B", fillSoft: "rgba(192,57,43,0.1)" },
  conseille: { bg: "#E8F0F8", stroke: "#2E6DA4", fillSoft: "rgba(46,109,164,0.1)" },
};

export function renderCardIcon(iconTheme, tagType) {
  const shapeFn = SHAPES[iconTheme] || SHAPES.flamme;
  const { bg, stroke, fillSoft } = PALETTE[tagType] || PALETTE.conseille;
  return `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="${bg}"/>${shapeFn(stroke, fillSoft)}</svg>`;
}
