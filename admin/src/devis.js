export async function logDevisSubmission(env, { name, phone, email, message }) {
  await env.DB.prepare(
    "INSERT INTO devis_submissions (name, phone, email, message) VALUES (?, ?, ?, ?)"
  )
    .bind(name || "", phone || "", email || "", message || "")
    .run();
}

export async function listDevisSubmissions(env, limit = 20) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM devis_submissions ORDER BY created_at DESC LIMIT ?"
  )
    .bind(limit)
    .all();
  return results;
}
