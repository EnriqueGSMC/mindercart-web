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

export default function ShoppingListPage() {
  return (
    <main style={shellStyle()}>
      <div style={{ display: "grid", gap: 14 }}>
        <header style={cardStyle()}>
          <div style={{ fontSize: 26, fontWeight: 1000 }}>Shopping List</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Lista vigente consolidada
          </div>
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" style={navLinkStyle()}>Home</Link>
          <Link href="/shopping-list" style={navLinkStyle(true)}>Shopping List</Link>
          <Link href="/general-list" style={navLinkStyle()}>General List</Link>
          <Link href="/in-store" style={navLinkStyle()}>In Store</Link>
          <Link href="/history" style={navLinkStyle()}>History</Link>
          <Link href="/settings" style={navLinkStyle()}>Settings</Link>
        </nav>

        <section style={cardStyle()}>
          <div style={{ fontWeight: 1000, marginBottom: 10 }}>
            Lista abierta / Active shopping list
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {["Milk / Leche", "Eggs / Huevos", "Detergent / Detergente"].map((name) => (
              <div
                key={name}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                    qty: 1 · unit: pza · store: Walmart
                  </div>
                </div>
                <input type="checkbox" disabled />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
              }}
            >
              Share WhatsApp
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
                background: "#fff",
                color: "#111",
                fontWeight: 900,
              }}
            >
              Export PDF
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}