import { getFile, putFile } from "./github.js";
import { injectGallerySlides } from "./render/gallery.js";

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function commitGallery(env, photos) {
  const indexFile = await getFile(env, "index.html");
  const updatedIndex = injectGallerySlides(indexFile.content, photos);
  await putFile(env, "index.html", updatedIndex, "Met a jour la galerie photo (via admin)");
}

/**
 * Upload une photo vers R2 et republie la galerie sur le site — seulement si le commit
 * GitHub réussit est-elle enregistrée en base. Sinon la photo est retirée de R2 pour ne
 * pas laisser un fichier orphelin qui n'apparaît nulle part.
 */
export async function uploadPhoto(env, { arrayBuffer, contentType, alt }) {
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) throw new Error(`Type d'image non supporté: ${contentType}`);

  const key = `gallery/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const publicUrl = `https://gestion.epc05.fr/photos/${key}`;

  await env.PHOTOS.put(key, arrayBuffer, { httpMetadata: { contentType } });

  try {
    const { results: existing } = await env.DB.prepare(
      "SELECT * FROM photos ORDER BY position ASC, uploaded_at ASC"
    ).all();
    const candidate = { public_url: publicUrl, alt: alt || "Chantier EPC Hautes-Alpes" };
    await commitGallery(env, [...existing, candidate]);
  } catch (err) {
    await env.PHOTOS.delete(key);
    throw err;
  }

  const { results: countRows } = await env.DB.prepare("SELECT COUNT(*) as n FROM photos").all();
  await env.DB.prepare(
    "INSERT INTO photos (r2_key, public_url, alt, position) VALUES (?, ?, ?, ?)"
  )
    .bind(key, publicUrl, alt || "Chantier EPC Hautes-Alpes", countRows[0]?.n ?? 0)
    .run();
}

/** Calcule l'usage réel du bucket R2 (photos) pour la jauge de stockage du dashboard. */
export async function getStorageStats(env) {
  let usedBytes = 0;
  let objectCount = 0;
  let cursor;
  do {
    const listing = await env.PHOTOS.list({ cursor });
    for (const obj of listing.objects) {
      usedBytes += obj.size;
      objectCount++;
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
  return { usedBytes, objectCount };
}

/**
 * Supprime une photo : republie d'abord la galerie sans elle, puis seulement si le commit
 * réussit, la retire de R2 et de la base.
 */
export async function deletePhoto(env, photoId) {
  const photo = await env.DB.prepare("SELECT * FROM photos WHERE id = ?").bind(photoId).first();
  if (!photo) throw new Error("Photo introuvable");

  const { results: remaining } = await env.DB.prepare(
    "SELECT * FROM photos WHERE id != ? ORDER BY position ASC, uploaded_at ASC"
  )
    .bind(photoId)
    .all();

  await commitGallery(env, remaining);

  await env.PHOTOS.delete(photo.r2_key);
  await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(photoId).run();
}
