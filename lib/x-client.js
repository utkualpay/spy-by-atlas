// lib/x-client.js
// Minimal X (Twitter) v2 client for posting tweets via OAuth 1.0a User Context.
// Pay-per-use compatible. Costs ~$0.01 per post (Apr 2026).
//
// REQUIRED ENV:
//   X_API_KEY                 — consumer key
//   X_API_SECRET              — consumer secret
//   X_ACCESS_TOKEN            — user OAuth token (Atlas brand account)
//   X_ACCESS_TOKEN_SECRET     — user OAuth token secret
//
// All four come from the X Developer Portal -> Project -> App -> Keys & Tokens.
// Generate "Access Token and Secret" while signed in to the Atlas account.

import crypto from "node:crypto";

const TWEET_URL = "https://api.twitter.com/2/tweets";
const UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

function pctEncode(s) {
  return encodeURIComponent(s).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function oauthHeader(method, url, params, { consumerKey, consumerSecret, token, tokenSecret }) {
  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: token,
    oauth_version: "1.0",
  };
  const all = { ...params, ...oauth };
  const sorted = Object.keys(all).sort().map((k) => `${pctEncode(k)}=${pctEncode(all[k])}`).join("&");
  const base = `${method.toUpperCase()}&${pctEncode(url)}&${pctEncode(sorted)}`;
  const signingKey = `${pctEncode(consumerSecret)}&${pctEncode(tokenSecret)}`;
  oauth.oauth_signature = crypto.createHmac("sha1", signingKey).update(base).digest("base64");
  const header = "OAuth " + Object.keys(oauth).sort().map((k) => `${pctEncode(k)}="${pctEncode(oauth[k])}"`).join(", ");
  return header;
}

function creds() {
  const consumerKey = process.env.X_API_KEY;
  const consumerSecret = process.env.X_API_SECRET;
  const token = process.env.X_ACCESS_TOKEN;
  const tokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!consumerKey || !consumerSecret || !token || !tokenSecret) {
    throw new Error("X credentials missing — set X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET");
  }
  return { consumerKey, consumerSecret, token, tokenSecret };
}

// Upload a JPEG/PNG buffer; returns media_id_string
export async function uploadMedia(buffer, mimeType = "image/png") {
  const c = creds();
  // multipart/form-data via boundary
  const boundary = "----AtlasBoundary" + crypto.randomBytes(8).toString("hex");
  const head = `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="card.png"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const tail = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(head, "utf8"), buffer, Buffer.from(tail, "utf8")]);
  const auth = oauthHeader("POST", UPLOAD_URL, {}, c);
  const r = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  const data = await r.json();
  if (!r.ok || !data.media_id_string) {
    const msg = data?.errors?.[0]?.message || data?.error || `HTTP ${r.status}`;
    throw new Error(`X media upload failed: ${msg}`);
  }
  return data.media_id_string;
}

export async function postTweet({ text, mediaIds = [] }) {
  const c = creds();
  const auth = oauthHeader("POST", TWEET_URL, {}, c);
  const body = { text };
  if (mediaIds.length) body.media = { media_ids: mediaIds };
  const r = await fetch(TWEET_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) {
    const msg = data?.errors?.[0]?.message || data?.detail || data?.title || `HTTP ${r.status}`;
    throw new Error(`X post failed: ${msg}`);
  }
  return { id: data.data?.id, url: `https://x.com/i/web/status/${data.data?.id}` };
}
