const OWNER = "Jamesdaft";
const REPO = "plombier-site";
const BRANCH = "master";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64Utf8(base64) {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function headers(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "epc-admin-worker",
    ...extra,
  };
}

/** Lit un fichier du repo. Retourne { content, sha } ou null si le fichier n'existe pas encore. */
export async function getFile(env, path) {
  const res = await fetch(`${API_BASE}/contents/${path}?ref=${BRANCH}`, {
    headers: headers(env.GITHUB_TOKEN),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub getFile(${path}) a échoué: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return { content: decodeBase64Utf8(data.content), sha: data.sha };
}

/** Crée ou met à jour un fichier texte dans le repo (commit direct sur master). */
export async function putFile(env, path, contentText, message) {
  const existing = await getFile(env, path);
  const body = {
    message,
    content: encodeBase64Utf8(contentText),
    branch: BRANCH,
  };
  if (existing) body.sha = existing.sha;

  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: headers(env.GITHUB_TOKEN, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub putFile(${path}) a échoué: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Supprime un fichier du repo (nécessite son sha courant). */
export async function deleteFile(env, path, message) {
  const existing = await getFile(env, path);
  if (!existing) return null;

  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "DELETE",
    headers: headers(env.GITHUB_TOKEN, { "Content-Type": "application/json" }),
    body: JSON.stringify({ message, sha: existing.sha, branch: BRANCH }),
  });
  if (!res.ok) {
    throw new Error(`GitHub deleteFile(${path}) a échoué: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
