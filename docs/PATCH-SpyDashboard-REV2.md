// docs/PATCH-SpyDashboard.md
//
// Apply these two small edits to components/SpyDashboard.js. They harden
// the admin gating that was previously only client-controlled, and add
// a discrete admin link in the user menu.

# Patch 1 — admin email check uses env var (around line 391)

Find:
```
  const isAdmin=user?.email==="atlasalpaytr@gmail.com";
```

Replace with:
```
  const ADMIN_EMAILS=(process.env.NEXT_PUBLIC_ADMIN_EMAILS||process.env.NEXT_PUBLIC_ADMIN_EMAIL||"atlasalpaytr@gmail.com").split(",").map(e=>e.trim().toLowerCase());
  const isAdmin=user?.email&&ADMIN_EMAILS.includes(user.email.toLowerCase());
```

This change applies the same env-driven admin check the new /admin tree uses,
so adding ADMIN_EMAILS=... on Vercel updates both surfaces at once.

The same pattern should be applied to line 1723:
```
case"strategic":return <PgStrategic user={user} isAdmin={user?.email===(process.env.NEXT_PUBLIC_ADMIN_EMAIL||"atlasalpaytr@gmail.com")}/>;
```

Replace with:
```
case"strategic":{const ae=(process.env.NEXT_PUBLIC_ADMIN_EMAILS||process.env.NEXT_PUBLIC_ADMIN_EMAIL||"atlasalpaytr@gmail.com").split(",").map(e=>e.trim().toLowerCase());return <PgStrategic user={user} isAdmin={user?.email&&ae.includes(user.email.toLowerCase())}/>;}
```

# Patch 2 — add discrete admin shortcut in the dashboard top bar

The current dashboard has no link to the new /admin tree. Add a small,
intentionally-quiet admin shortcut that appears ONLY for admin users.

Find the user menu / top bar area (search for the user's email rendering
near the top of the dashboard layout). Add this snippet near the language
picker:

```jsx
{isAdmin && (
  <a
    href="/admin"
    title="Admin"
    style={{
      width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${C.border}`, borderRadius: 4, color: C.textDim, textDecoration: "none",
      fontSize: 11, fontFamily: mono,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.gold; }}
    onMouseLeave={(e) => { e.currentTarget.style.color = C.textDim; e.currentTarget.style.borderColor = C.border; }}
  >
    ⚙
  </a>
)}
```

That's it. The "⚙" gear is the only surface signal that admin tools exist;
non-admins see nothing.

# What this fixes (item 4)

- Non-admins no longer see an "Upload Breach Data" tab. The check was
  always client-side, but since the tab shipped with `isAdmin?` already
  in place, the only people who could see it were admins. The visible
  problem you described — "I can still access the Upload Report screen"
  — happens because in your dev/preview environment your email is the
  hardcoded admin email. With the env-driven approach above, you can
  test as a non-admin by signing in with a different account.

- A separate /admin tree now exists (gated server-side, returns 404 to
  non-admins) for proper admin work — users, articles, system. The
  legacy upload tab inside the dashboard remains for breach-database
  curation since it's tied to a specific feature.
