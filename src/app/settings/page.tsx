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

export default function SettingsPage() {
  return (
    <main style={shellStyle()}>
      <div style={{ display: "grid", gap: 14 }}>
        <header style={cardStyle()}>
          <div style={{ fontSize: 26, fontWeight: 1000 }}>Settings</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Idioma, tienda preferida y preferencias básicas
          </div>
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" style={navLinkStyle()}>Home</Link>
          <Link href="/shopping-list" style={navLinkStyle()}>Shopping List</Link>
          <Link href="/general-list" style={navLinkStyle()}>General List</Link>
          <Link href="/in-store" style={navLinkStyle()}>In Store</Link>
          <Link href="/history" style={navLinkStyle()}>History</Link>
          <Link href="/settings" style={navLinkStyle(true)}>Settings</Link>
        </nav>

        <section style={cardStyle()}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Language / Idioma</div>
              <select
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                }}
                defaultValue="es"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Preferred store / Tienda preferida</div>
              <input
                type="text"
                defaultValue="Walmart"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}