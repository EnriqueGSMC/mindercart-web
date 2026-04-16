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

export default function HomePage() {
  return (
    <main style={shellStyle()}>
      <div style={{ display: "grid", gap: 14 }}>
        <header style={cardStyle()}>
          <div style={{ fontSize: 28, fontWeight: 1000 }}>MinderCart</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Home / Quick Add · ES / EN
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5 }}>
            Agrega necesidades en segundos y construye una sola lista vigente.
            <br />
            Add household needs in seconds and keep a single active shopping list.
          </div>
        </header>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" style={navLinkStyle(true)}>Home</Link>
          <Link href="/shopping-list" style={navLinkStyle()}>Shopping List</Link>
          <Link href="/general-list" style={navLinkStyle()}>General List</Link>
          <Link href="/in-store" style={navLinkStyle()}>In Store</Link>
          <Link href="/history" style={navLinkStyle()}>History</Link>
          <Link href="/settings" style={navLinkStyle()}>Settings</Link>
        </nav>

        <section style={cardStyle()}>
          <div style={{ fontWeight: 1000, marginBottom: 10 }}>
            ¿Qué necesitas? / What do you need?
          </div>
          <input
            type="text"
            placeholder="ej. leche / milk"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #ddd",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            readOnly
          />
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
            Placeholder inicial del Quick Add. En el siguiente paso conectamos:
            artículo, unidad, cantidad y tienda.
          </div>
          <button
            type="button"
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Add / Agregar
          </button>
        </section>

        <section
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <div style={cardStyle()}>
            <div style={{ fontWeight: 1000 }}>Shopping List</div>
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
              Una sola lista abierta consolidada.
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href="/shopping-list" style={navLinkStyle()}>Open</Link>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontWeight: 1000 }}>General List</div>
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
              Revisión previa con checkbox para completar la compra.
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href="/general-list" style={navLinkStyle()}>Open</Link>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontWeight: 1000 }}>In Store</div>
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
              Checklist para marcar artículos mientras compras.
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href="/in-store" style={navLinkStyle()}>Open</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}