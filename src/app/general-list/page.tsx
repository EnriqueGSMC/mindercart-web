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

export default function GeneralListPage() {
  return (
    <main style={shellStyle()}>
      <div style={{ display: "grid", gap: 14 }}>
        <header style={cardStyle()}>
          <div style={{ fontSize: 26, fontWeight: 1000 }}>General List</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Memoria habitual del hogar con checkbox
          </div>
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" style={navLinkStyle()}>Home</Link>
          <Link href="/shopping-list" style={navLinkStyle()}>Shopping List</Link>
          <Link href="/general-list" style={navLinkStyle(true)}>General List</Link>
          <Link href="/in-store" style={navLinkStyle()}>In Store</Link>
          <Link href="/history" style={navLinkStyle()}>History</Link>
          <Link href="/settings" style={navLinkStyle()}>Settings</Link>
        </nav>

        <section style={cardStyle()}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>
            Review before shopping
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 12 }}>
            Aquí la usuaria revisa artículos frecuentes y marca lo que quiere agregar a la lista abierta.
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {[
              { name: "Tortillas", selected: true },
              { name: "Coffee / Café", selected: false },
              { name: "Toilet paper / Papel higiénico", selected: false },
              { name: "Dish soap / Jabón para trastes", selected: true },
            ].map((item) => (
              <label
                key={item.name}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <input type="checkbox" defaultChecked={item.selected} />
                <div>
                  <div style={{ fontWeight: 900 }}>{item.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                    unit: pza · store: Preferred store
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            style={{
              marginTop: 14,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Add checked to active list
          </button>
        </section>
      </div>
    </main>
  );
}