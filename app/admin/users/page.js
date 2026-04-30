"use client";
// app/admin/users/page.js
// User management — search, view, change tier, change subscription status.

import { useEffect, useState } from "react";

const C = {
  bgCard: "#131316", bgInput: "#18181c", border: "#1f1f25",
  text: "#e4e0d9", textSec: "#9d9890", textDim: "#5c5854",
  gold: "#c4a265", critical: "#c45c5c", sage: "#b8d0a8",
};
const mono = "'IBM Plex Mono', monospace";
const serif = "'Cormorant Garamond', serif";

const TIERS = ["observer", "personal_pro", "business", "executive"];
const STATUSES = ["inactive", "trial", "active", "cancelled", "past_due"];

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");

  async function load(query = "") {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
      const d = await r.json();
      setUsers(d.users || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(updated) {
    const r = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (r.ok) {
      setSavedMsg("Saved.");
      setEditing(null);
      load(q);
      setTimeout(() => setSavedMsg(""), 3000);
    } else {
      const d = await r.json();
      setSavedMsg(`Error: ${d.error || "unknown"}`);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontFamily: serif, fontWeight: 300, margin: "0 0 6px" }}>Users</h1>
        <p style={{ color: C.textSec, fontWeight: 300, fontSize: 13 }}>Manage tiers and subscription overrides. Changes are auditable.</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(q)}
          placeholder="Search by email or name…"
          style={{ flex: 1, background: C.bgInput, border: `1px solid ${C.border}`, color: C.text, padding: "11px 14px", fontSize: 13, borderRadius: 3, outline: "none", fontFamily: mono }}
        />
        <button
          onClick={() => load(q)}
          style={{ padding: "11px 20px", border: `1px solid ${C.gold}`, color: C.gold, background: "transparent", fontSize: 10, fontFamily: mono, letterSpacing: 2, textTransform: "uppercase", borderRadius: 3, cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {savedMsg && <div style={{ marginBottom: 14, fontSize: 12, color: savedMsg.startsWith("Error") ? C.critical : C.sage, fontFamily: mono }}>{savedMsg}</div>}

      {loading ? (
        <div style={{ color: C.textDim, fontFamily: mono }}>Loading…</div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 110px", padding: "12px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase" }}>
            <div>Email</div><div>Name</div><div>Tier</div><div>Status</div><div></div>
          </div>
          {users.length === 0 && (
            <div style={{ padding: 24, color: C.textDim, fontSize: 12 }}>No users matched.</div>
          )}
          {users.map((u) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 110px", padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 13, alignItems: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 12, wordBreak: "break-all", color: C.text }}>{u.email}</div>
              <div style={{ color: C.textSec }}>{u.full_name || "—"}</div>
              <div><span style={{ fontSize: 10, fontFamily: mono, padding: "3px 10px", border: `1px solid ${C.border}`, borderRadius: 2, color: C.textSec, textTransform: "uppercase" }}>{u.tier}</span></div>
              <div><span style={{ fontSize: 10, fontFamily: mono, padding: "3px 10px", borderRadius: 2, color: u.subscription_status === "active" ? C.sage : C.textDim, background: u.subscription_status === "active" ? "rgba(184,208,168,0.10)" : "transparent" }}>{u.subscription_status}</span></div>
              <div>
                <button
                  onClick={() => setEditing(u)}
                  style={{ padding: "5px 10px", background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, fontSize: 9, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 2, cursor: "pointer" }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          onClick={() => setEditing(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: 4, padding: 30, maxWidth: 500, width: "100%" }}>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, margin: "0 0 18px" }}>Edit user</h2>
            <div style={{ fontSize: 12, fontFamily: mono, color: C.textDim, marginBottom: 18, wordBreak: "break-all" }}>{editing.email}</div>

            <label style={{ display: "block", marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginBottom: 6 }}>Tier</div>
              <select
                value={editing.tier || "observer"}
                onChange={(e) => setEditing({ ...editing, tier: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", background: C.bgInput, border: `1px solid ${C.border}`, color: C.text, borderRadius: 3, fontSize: 13, fontFamily: mono }}
              >
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 22 }}>
              <div style={{ fontSize: 9, fontFamily: mono, letterSpacing: 1.5, color: C.textDim, textTransform: "uppercase", marginBottom: 6 }}>Subscription status</div>
              <select
                value={editing.subscription_status || "inactive"}
                onChange={(e) => setEditing({ ...editing, subscription_status: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", background: C.bgInput, border: `1px solid ${C.border}`, color: C.text, borderRadius: 3, fontSize: 13, fontFamily: mono }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)} style={{ padding: "10px 18px", background: "transparent", border: `1px solid ${C.border}`, color: C.textSec, fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => save(editing)} style={{ padding: "10px 18px", background: C.gold, border: `1px solid ${C.gold}`, color: "#09090b", fontSize: 10, fontFamily: mono, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 3, cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
