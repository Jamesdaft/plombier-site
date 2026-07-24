from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

BLUE   = HexColor('#2E6DA4')
RED    = HexColor('#C0392B')
GOLD   = HexColor('#C9A84C')
SLATE  = HexColor('#2C3A47')
LIGHT  = HexColor('#F0F4F8')
LGRAY  = HexColor('#E2E8F0')
DGRAY  = HexColor('#4A5568')

W, H = A4

doc = SimpleDocTemplate(
    '/Users/julianetaulelle/Documents/eliott/plan-developpement-epc.pdf',
    pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
)

styles = getSampleStyleSheet()

def style(name, **kw):
    return ParagraphStyle(name, **kw)

S = {
    'title': style('title',
        fontName='Helvetica-Bold', fontSize=26, textColor=white,
        leading=32, alignment=TA_CENTER),
    'subtitle': style('subtitle',
        fontName='Helvetica', fontSize=13, textColor=HexColor('#BDD8F0'),
        leading=18, alignment=TA_CENTER),
    'date': style('date',
        fontName='Helvetica', fontSize=10, textColor=HexColor('#90B8D8'),
        leading=14, alignment=TA_CENTER),
    'section': style('section',
        fontName='Helvetica-Bold', fontSize=14, textColor=white,
        leading=20, spaceAfter=4),
    'h2': style('h2',
        fontName='Helvetica-Bold', fontSize=12, textColor=BLUE,
        leading=16, spaceBefore=14, spaceAfter=4),
    'body': style('body',
        fontName='Helvetica', fontSize=10, textColor=DGRAY,
        leading=16, spaceAfter=4),
    'bullet': style('bullet',
        fontName='Helvetica', fontSize=10, textColor=DGRAY,
        leading=16, leftIndent=14, spaceAfter=3,
        bulletIndent=0),
    'check': style('check',
        fontName='Helvetica-Bold', fontSize=10, textColor=SLATE,
        leading=16, leftIndent=14, spaceAfter=3),
    'done': style('done',
        fontName='Helvetica', fontSize=10, textColor=HexColor('#27AE60'),
        leading=16, leftIndent=14, spaceAfter=3),
    'todo': style('todo',
        fontName='Helvetica-Bold', fontSize=10, textColor=RED,
        leading=16, leftIndent=14, spaceAfter=3),
    'caption': style('caption',
        fontName='Helvetica-Oblique', fontSize=9, textColor=HexColor('#888'),
        leading=13, spaceAfter=8),
    'url': style('url',
        fontName='Helvetica', fontSize=10, textColor=BLUE,
        leading=14),
    'note': style('note',
        fontName='Helvetica-Oblique', fontSize=9.5, textColor=SLATE,
        leading=14, spaceAfter=4),
}

def section_header(title, color=BLUE):
    data = [[Paragraph(title, S['section'])]]
    t = Table(data, colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('ROUNDEDCORNERS', [6]),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
    ]))
    return t

def info_box(lines, color=LIGHT, border=BLUE):
    content = '<br/>'.join(lines)
    data = [[Paragraph(content, S['body'])]]
    t = Table(data, colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('LINEAFTER', (0,0), (0,-1), 3, border),  # left border trick via right of col -1
        ('LINEBEFORE', (0,0), (0,-1), 4, border),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

def check_row(label, done=True):
    icon = '✓' if done else '→'
    col  = HexColor('#27AE60') if done else RED
    st   = S['done'] if done else S['todo']
    return Paragraph(f'<font color="#{("27AE60" if done else "C0392B")}">{icon}</font>  {label}', st)

story = []

# ── COVER ──────────────────────────────────────────────────────────────────────
cover_data = [[
    Paragraph('EPC – Plombier Chauffagiste', S['title']),
    Spacer(1, 0.3*cm),
    Paragraph('Plan de développement du site web', S['subtitle']),
    Spacer(1, 0.2*cm),
    Paragraph('Juillet 2026', S['date']),
]]
cover = Table([[cover_data[0][0]], [cover_data[0][1]], [cover_data[0][2]], [cover_data[0][3]], [cover_data[0][4]]],
              colWidths=[W - 4*cm])
cover.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), SLATE),
    ('TOPPADDING', (0,0), (-1,-1), 24),
    ('BOTTOMPADDING', (0,0), (-1,-1), 24),
    ('LEFTPADDING', (0,0), (-1,-1), 24),
    ('RIGHTPADDING', (0,0), (-1,-1), 24),
    ('ROUNDEDCORNERS', [10]),
]))
story.append(cover)
story.append(Spacer(1, 0.8*cm))

# ── INTRO ──────────────────────────────────────────────────────────────────────
story.append(Paragraph(
    'Ce document récapitule le travail réalisé sur votre site, ce qui reste à faire de votre côté, '
    'et les prochaines étapes pour mettre le site en ligne sur votre propre domaine.',
    S['body']))
story.append(Spacer(1, 0.4*cm))

# Site actuel
story.append(info_box([
    '<b>Site en ligne (temporaire) :</b> https://plombier-site.taulelle-juliane.workers.dev/',
    '<b>Code source :</b> https://github.com/Jamesdaft/plombier-site',
]))
story.append(Spacer(1, 0.6*cm))

# ── 1. CE QUI EST FAIT ────────────────────────────────────────────────────────
story.append(section_header('1.  Ce qui est déjà fait', BLUE))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph('Site vitrine', S['h2']))
items_done = [
    'Page principale (one-page) : hero, services, à propos, galerie, témoignages, formulaire de devis, contact, footer',
    'Design mobile-first avec barre d\'action fixe (Appeler / Devis gratuit)',
    'Formulaire de devis Netlify Forms (fonctionnel)',
    'Favicon robinet aux couleurs EPC',
    'Mentions légales complètes (modal)',
    'Carte interactive avec zone d\'intervention 50 km (isochrone réelle par route)',
    'Galerie photos avec carousel (2 vraies photos + emplacements "à venir")',
    'Section témoignages clients',
]
for item in items_done:
    story.append(check_row(item, done=True))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph('SEO & Référencement', S['h2']))
items_seo = [
    'Balises title, meta description, robots sur toutes les pages',
    'Schema.org LocalBusiness / Plumber (nom, adresse, téléphone, horaires)',
    'Schema.org Article sur chaque article de blog',
    'Données structurées : SIRET, zone d\'intervention, horaires lun–sam 8h–18h',
    'URLs canoniques configurées',
    'Open Graph (partage réseaux sociaux)',
]
for item in items_seo:
    story.append(check_row(item, done=True))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph('Blog (6 articles publiés)', S['h2']))
articles = [
    'Entretien de chaudière : pourquoi c\'est obligatoire',
    'Adoucisseur d\'eau : protégez vos installations du calcaire',
    'Poêle à granulés : pose, entretien et obligations',
    'Fuite d\'eau : les bons réflexes à avoir immédiatement',
    'Chauffe-eau en panne : comment diagnostiquer le problème',
    'Pression chaudière trop basse : causes et solutions',
]
for a in articles:
    story.append(check_row(a, done=True))
story.append(Spacer(1, 0.6*cm))

# ── 2. CE QUI RESTE À FAIRE (ELIOTT) ─────────────────────────────────────────
story.append(section_header('2.  Ce qui reste à faire — actions Eliott', RED))
story.append(Spacer(1, 0.3*cm))

# 2.1 Hébergement
story.append(Paragraph('A.  Acheter l\'hébergement et le nom de domaine (OVH)', S['h2']))
story.append(Paragraph(
    'Le site est actuellement hébergé gratuitement sur Cloudflare Pages (URL temporaire). '
    'Pour avoir une adresse professionnelle (ex : epc-plombier05.fr), il faut acheter un nom de domaine.',
    S['body']))
story.append(Spacer(1, 0.15*cm))

steps_ovh = [
    '1. Aller sur ovh.com → "Nom de domaine" → rechercher epc-plombier05.fr (ou epc-hautes-alpes.fr, eliott-plombier.fr...)',
    '2. Acheter le domaine (~7 €/an pour un .fr)',
    '3. Dans le panneau OVH → DNS → ajouter un enregistrement CNAME :\n       www  →  plombier-site.taulelle-juliane.workers.dev',
    '4. Dans Cloudflare Pages → Settings → Custom domains → ajouter votre domaine',
    '5. Me communiquer l\'URL finale pour mettre à jour les canonicals et le Schema.org',
]
for s in steps_ovh:
    story.append(Paragraph(f'→  {s}', S['bullet']))
story.append(Spacer(1, 0.15*cm))
story.append(info_box([
    '💡 Pas besoin d\'hébergement payant OVH — Cloudflare Pages est gratuit et performant. '
    'Il suffit d\'acheter uniquement le nom de domaine (~7 €/an) et de le pointer vers Cloudflare.'
], color=HexColor('#EEF6EE'), border=HexColor('#27AE60')))
story.append(Spacer(1, 0.4*cm))

# 2.2 Google Business
story.append(Paragraph('B.  Créer et optimiser la fiche Google Business Profile', S['h2']))
story.append(Paragraph(
    'La fiche Google Business (anciennement Google My Business) est indispensable pour apparaître '
    'sur Google Maps et dans les résultats locaux "Plombier Gap". C\'est gratuit et très efficace.',
    S['body']))
story.append(Spacer(1, 0.15*cm))
steps_google = [
    '1. Aller sur business.google.com → créer une fiche au nom de "EPC – Eliott Van Holderbeke"',
    '2. Renseigner : adresse (Impasse de Jussel, 05130 Piégut), téléphone (07 71 80 60 82), email',
    '3. Choisir la catégorie principale : "Plombier" + catégories secondaires : "Chauffagiste", "Entreprise de chauffage"',
    '4. Ajouter les horaires : Lun–Sam 8h–18h',
    '5. Uploader le logo EPC + quelques photos de chantier',
    '6. Valider la fiche (Google envoie un code par courrier ou par téléphone)',
    '7. Une fois la fiche validée : me communiquer l\'URL Google Business pour activer le bouton "Laisser un avis" sur le site',
]
for s in steps_google:
    story.append(Paragraph(f'→  {s}', S['bullet']))
story.append(Spacer(1, 0.4*cm))

# 2.3 Articles blog
story.append(Paragraph('C.  Relire et corriger les articles du blog', S['h2']))
story.append(Paragraph(
    'Les 6 articles ont été rédigés avec les informations disponibles. '
    'Il est important qu\'Eliott les relise pour vérifier l\'exactitude technique '
    'et corriger ce qui ne correspond pas à sa pratique réelle.',
    S['body']))
story.append(Spacer(1, 0.15*cm))
story.append(Paragraph('Les fichiers Word à corriger sont dans le dossier export-word/ :', S['note']))
docs = [
    ('entretien-chaudiere-hautes-alpes.docx', 'Obligation légale — décret 2009, attestation'),
    ('adoucisseur-eau-hautes-alpes.docx', 'Conseil pratique — dureté de l\'eau, pose'),
    ('pose-poele-granules-hautes-alpes.docx', 'Installation & entretien — DTU 24.1, ramonage'),
    ('fuite-eau-urgence-hautes-alpes.docx', 'Urgence — réflexes, assurance'),
    ('chauffe-eau-en-panne-hautes-alpes.docx', 'Dépannage — résistance, thermostat, anode'),
    ('pression-chaudiere-hautes-alpes.docx', 'Dépannage — vase d\'expansion, soupape'),
]
for fname, desc in docs:
    story.append(Paragraph(f'→  <b>{fname}</b> — {desc}', S['bullet']))
story.append(Spacer(1, 0.15*cm))
story.append(info_box([
    '📝 Retourner les fichiers corrigés → les modifications seront intégrées et publiées sur le site.'
], color=HexColor('#FEF9E7'), border=GOLD))
story.append(Spacer(1, 0.4*cm))

# 2.4 Galerie
story.append(Paragraph('D.  Compléter la galerie photos', S['h2']))
story.append(Paragraph(
    'La galerie affiche actuellement 2 vraies photos et 4 emplacements "À venir". '
    'Dès qu\'Eliott a de nouvelles photos de chantier, il suffit de les envoyer pour les intégrer.',
    S['body']))
steps_gallery = [
    'Photos au format JPG ou PNG, idéalement en format paysage (4:3)',
    'Avant/après, installations, chantiers en cours — tout est bienvenu',
    'Minimum 4 photos supplémentaires pour remplir la galerie',
]
for s in steps_gallery:
    story.append(Paragraph(f'→  {s}', S['bullet']))
story.append(Spacer(1, 0.4*cm))

# 2.5 Témoignages
story.append(Paragraph('E.  Remplacer les témoignages fictifs par de vrais avis', S['h2']))
story.append(Paragraph(
    'Les 3 témoignages actuels sont des exemples. Dès qu\'Eliott a des vrais retours clients '
    '(avec accord), il faut les remplacer — c\'est ce qui donnera le plus de crédibilité.',
    S['body']))
story.append(Spacer(1, 0.6*cm))

# ── 3. PROCHAINES ÉTAPES ─────────────────────────────────────────────────────
story.append(section_header('3.  Récapitulatif des prochaines étapes', SLATE))
story.append(Spacer(1, 0.3*cm))

recap = [
    ('Priorité 1', 'Créer la fiche Google Business Profile', 'Gratuit — impact SEO immédiat'),
    ('Priorité 2', 'Acheter le nom de domaine sur OVH', '~7 €/an — adresse professionnelle'),
    ('Priorité 3', 'Relire et corriger les 6 articles Word', 'Fichiers dans export-word/'),
    ('Priorité 4', 'Envoyer de nouvelles photos de chantier', 'Pour compléter la galerie'),
    ('Priorité 5', 'Remplacer les témoignages par de vrais avis', 'Au fil des retours clients'),
]

table_data = [['Priorité', 'Action', 'Note']]
for row in recap:
    table_data.append(list(row))

t = Table(table_data, colWidths=[3*cm, 8.5*cm, 5.5*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), SLATE),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('ALIGN', (0,0), (-1,0), 'CENTER'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 9.5),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [LIGHT, white]),
    ('TEXTCOLOR', (0,1), (0,-1), RED),
    ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
    ('ALIGN', (0,1), (0,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 10),
    ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ('GRID', (0,0), (-1,-1), 0.5, LGRAY),
    ('ROUNDEDCORNERS', [4]),
]))
story.append(t)
story.append(Spacer(1, 0.6*cm))

# ── FOOTER NOTE ───────────────────────────────────────────────────────────────
story.append(HRFlowable(width='100%', thickness=1, color=LGRAY))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph(
    'Document préparé par Juliane Taulelle — Juillet 2026 · Pour toute question sur le site, contacter Juliane.',
    S['caption']))

doc.build(story)
print("PDF généré : plan-developpement-epc.pdf")
