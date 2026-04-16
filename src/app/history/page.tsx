import Link from "next/link";

function navLinkStyle(active = false): React.CSSProperties {
  return {
    flex: 1,
    minWidth: 120,
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    textDecoration: "none",
    fontWeight: 900,
  };
}

function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid #eee",
    borderRadius: 18,
    padding: 14,
    background: "#fff",
    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
  };
}

function shellStyle(): React.CSSProperties {
  return {
    maxWidth: 860,
    margin: "0 auto",
    padding: 14,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "#111",
  };
}

export default function HistoryPage() {
  return (
    <main style={shellStyle()}>
      <div style={{ display: "grid", gap: 14 }}>
        <header style={cardStyle()}>
          <div style={{ fontSize: 26, fontWeight: 1000 }}>History</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Historial de compras cerradas
          </div>
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" style={navLinkStyle()}>Home</Link>
          <Link href="/shopping-list" style={navLinkStyle()}>Shopping List</Link>
          <Link href="/general-list" style={navLinkStyle()}>General List</Link>
          <Link href="/in-store" style={navLinkStyle()}>In Store</Link>
          <Link href="/history" style={navLinkStyle(true)}>History</Link>
          <Link href="/settings" style={navLinkStyle()}>Settings</Link>
        </nav>

        <section style={{ display: "grid", gap: 12 }}>
          {[
            "Apr 08, 2026 · Walmart · 18 items",
            "Apr 01, 2026 · Costco · 24 items",
          ].map((row) => (
            <div key={row} style={cardStyle()}>
              <div style={{ fontWeight: 900 }}>{row}</div>
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.75 }}>
                Snapshot de lista cerrada.
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}