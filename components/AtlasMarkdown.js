"use client";
// components/AtlasMarkdown.js
// A small, deliberate markdown renderer. We control what Claude generates
// (3-5 short paragraphs, optional bolded sentence, no headings) so the
// surface area is tiny. Avoids pulling in a 50KB dependency for ~80 lines of HTML.

import React from "react";

const C = { gold: "#c4a265", text: "#e4e0d9", textSec: "#9d9890" };

function inlineNodes(text, keyBase) {
  // Handle **bold**, *italic*, [link](url) inline.
  const out = [];
  let i = 0, k = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) out.push(text.slice(i, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(<strong key={`${keyBase}-${k++}`} style={{ color: C.gold, fontWeight: 500 }}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={`${keyBase}-${k++}`} style={{ fontStyle: "italic" }}>{tok.slice(1, -1)}</em>);
    } else {
      const m2 = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      out.push(<a key={`${keyBase}-${k++}`} href={m2[2]} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: "underline", textDecorationColor: "rgba(196,162,101,0.4)", textUnderlineOffset: 4 }}>{m2[1]}</a>);
    }
    i = m.index + tok.length;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

export default function AtlasMarkdown({ source, sliceTo = null }) {
  if (!source) return null;
  const text = sliceTo ? source.slice(0, sliceTo) : source;
  const blocks = text.split(/\n\s*\n/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={idx} style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 20, color: C.textSec, fontStyle: "italic", fontSize: 17, lineHeight: 1.65 }}>
              {inlineNodes(trimmed.slice(2), `q${idx}`)}
            </blockquote>
          );
        }
        if (/^[-*]\s+/m.test(trimmed)) {
          const items = trimmed.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ""));
          return (
            <ul key={idx} style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((li, j) => (
                <li key={j} style={{ display: "flex", gap: 12, fontSize: 16, lineHeight: 1.6, color: C.text, fontWeight: 300 }}>
                  <span style={{ color: C.gold, marginTop: 2 }}>✦</span>
                  <span>{inlineNodes(li, `i${idx}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} style={{ fontSize: 17, lineHeight: 1.75, color: C.text, fontWeight: 300, margin: 0, letterSpacing: 0.1 }}>
            {inlineNodes(trimmed, `p${idx}`)}
          </p>
        );
      })}
    </div>
  );
}
