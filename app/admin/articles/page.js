"use client";
// app/admin/articles/page.js
// Edit, unpublish, or trigger curation manually.

import { useEffect, useState } from "react";

const C = {
  bgCard: "#131316", bgInput: "#18181c", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", critical: "#c45c5c", sage: "#b8d0a8",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [curating, setCurating] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/articles");
    const d = await r.json();
    setArticles(d.articles || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const r = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (r.ok) {
      setMsg("Saved.");
      setEditing(null);
      load();
      setTimeout(() => setMsg(""), 2500);
    } else {
      const d = await r.json();
      setMsg(`Error: ${d.error || "unknown"}`);
    }
  }

  async function triggerCuration() {
    setCurating(true); setMsg("");
    try {
      const r = await fetch("/api/admin/articles?action=curate", { method: "POST" });
      const d = await r.json();
      if (r.ok && d.ok) {
        setMsg(`New brief generated: ${d.headline}`);
        load();
      } else {
        setMsg(`Curation failed: ${d.error || "unknown"}`);
      }
    } catch (e) {
      setMsg(`Curation error: ${e.message}`);
    }
    setCurating(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, margin: "0 0 6px" }}>Articles</h1>
          <p style={{ color: C.textSec, fontWeight: 300, fontSize: 13 }}>Edit headlines, body, or unpublish briefs.</p>
        </div>
        <button
          onClick={triggerCuration}
          disabled={curating}
          style={{ padding: "12px 22px", border: `1px solid ${C.gold}`, background: "transparent", color: C.gold, fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3, cursor: curating ? "default" : "pointer", opacity: curating ? 0.5 : 1 }}
        >
          {curating ? "Curating…" : "Run curation now"}
        </button>
      </div>

      {msg && <div style={{ marginBottom: 14, fontSize: 12, color: msg.startsWith("Error") || msg.includes("failed") ? C.critical : C.sage, fontFamily: mono }}>{msg}</div>}

      {loading ? <div style={{ color: C.textDim, fontFamily: mono }}>Loading…</div> : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
          {articles.length === 0 && <div style={{ padding: 24, color: C.textDim, fontSize: 12 }}>No articles yet.</div>}
          {articles.map((a) => (
            <div key={a.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontFamily: serif, color: C.text, marginBottom: 4 }}>{a.headline}</div>
                <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>
                  {a.published ? <span style={{ color: C.sage }}>● PUBLISHED</span> : <span style={{ color: C.textDim }}>○ DRAFT</span>}
                  {" · "}{new Date(a.published_at).toUTCString().slice(5, 22)} · {a.view_count || 0} views
                </div>
              </div>
              <button onClick={() => setEditing(a)} style={{ padding: "7px 14px", background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 9, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 2, cursor: "pointer" }}>Edit</button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: 4, padding: 30, maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, margin: "0 0 18px" }}>Edit brief</h2>

            <Field label="Headline">
              <input value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} style={inp()} />
            </Field>
            <Field label="Standfirst (dek)">
              <textarea value={editing.dek || ""} onChange={(e) => setEditing({ ...editing, dek: e.target.value })} rows={2} style={{ ...inp(), resize: "vertical" }} />
            </Field>
            <Field label="Body (markdown)">
              <textarea value={editing.body_markdown || ""} onChange={(e) => setEditing({ ...editing, body_markdown: e.target.value })} rows={14} style={{ ...inp(), resize: "vertical", fontFamily: mono, fontSize: 12 }} />
            </Field>
            <Field label="Published">
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textSec, cursor: "pointer" }}>
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Visible on site
              </label>
            </Field>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={() => setEditing(null)} style={btn(false)}>Cancel</button>
              <button onClick={save} style={btn(true)}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
function inp() {
  return {
    width: "100%", padding: "10px 12px", background: C.bgInput,
    border: `1px solid ${C.border}`, color: C.text, borderRadius: 3,
    fontSize: 13, fontFamily: serif, outline: "none", boxSizing: "border-box",
  };
}
function btn(primary) {
  return {
    padding: "10px 18px",
    background: primary ? C.gold : "transparent",
    border: `1px solid ${primary ? C.gold : C.border}`,
    color: primary ? "#09090b" : C.textSec,
    fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase",
    borderRadius: 3, cursor: "pointer",
  };
}
