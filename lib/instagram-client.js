// lib/instagram-client.js
// Instagram Graph API publishing client. Two-step container model.
// FEATURE-FLAGGED: requires INSTAGRAM_ENABLED=true plus credentials below.
// Posting is gated until Meta approves `instagram_business_content_publish`.
//
// REQUIRED ENV (once approved):
//   INSTAGRAM_ENABLED=true
//   INSTAGRAM_BUSINESS_ACCOUNT_ID — IG business account ID (from Graph API debug)
//   INSTAGRAM_ACCESS_TOKEN        — long-lived page access token (60-day TTL, refreshable)
//
// Daily cap: 100 API-published posts per 24h per account.
// Image must be a publicly reachable URL (we serve it from /api/og/[slug]).

const GRAPH_VERSION = "v22.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function instagramEnabled() {
  return (
    process.env.INSTAGRAM_ENABLED === "true" &&
    !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID &&
    !!process.env.INSTAGRAM_ACCESS_TOKEN
  );
}

async function igFetch(path, body) {
  const url = `${GRAPH_BASE}/${path}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok || data.error) {
    const msg = data?.error?.message || `HTTP ${r.status}`;
    throw new Error(`Instagram API error: ${msg}`);
  }
  return data;
}

// Step 1: create a media container (the post-in-waiting)
async function createContainer({ imageUrl, caption }) {
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  return igFetch(`${igId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: token,
  });
}

// Step 2: publish that container
async function publishContainer(creationId) {
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  return igFetch(`${igId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
}

// Container needs a moment to validate the image. Poll briefly.
async function waitForContainer(creationId, { maxAttempts = 8, delayMs = 1500 } = {}) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  for (let i = 0; i < maxAttempts; i++) {
    const r = await fetch(`${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${token}`);
    const data = await r.json();
    if (data.status_code === "FINISHED") return true;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new Error(`Instagram container ${data.status_code}`);
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  return true; // proceed and let publish surface any error
}

export async function postToInstagram({ imageUrl, caption }) {
  if (!instagramEnabled()) throw new Error("Instagram posting not enabled");
  const container = await createContainer({ imageUrl, caption });
  await waitForContainer(container.id);
  const published = await publishContainer(container.id);
  return { id: published.id, container_id: container.id };
}
