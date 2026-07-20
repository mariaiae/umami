"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ user }) {
  const pathname = usePathname();
  const isAdmin = user?.email === "isarias09@gmail.com";

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      height: "56px",
    }}>
      {/* Logo */}
      <Link href="/" style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a", textDecoration: "none", letterSpacing: "-0.3px" }}>
        🍃 Umami
      </Link>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px" }}>
        <NavTab href="/" label="Inicio" active={pathname === "/"} />
        <NavTab href="/pedido" label="Hacer Pedido" active={pathname.startsWith("/pedido")} />
        {isAdmin && <NavTab href="/admin" label="Admin ⚙️" active={pathname.startsWith("/admin")} />}
      </div>

      {/* Auth button */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {user ? (
          <>
            <Link href="/perfil" style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "0.85rem", color: "#555", textDecoration: "none",
            }}>
              <span style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6B8F71, #A4C3A2)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "0.75rem", fontWeight: 600,
              }}>
                {user.email?.[0].toUpperCase()}
              </span>
              <span style={{ display: "none", "@media(min-width:480px)": { display: "inline" } }}>
                {user.email?.split("@")[0]}
              </span>
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" style={{
                background: "none", border: "1.5px solid #ddd", borderRadius: "20px",
                padding: "5px 14px", fontSize: "0.8rem", cursor: "pointer", color: "#666",
              }}>Salir</button>
            </form>
          </>
        ) : (
          <Link href="/login" style={{
            background: "linear-gradient(135deg, #4a7c59, #6B8F71)",
            color: "white", borderRadius: "20px", padding: "7px 18px",
            fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 2px 8px rgba(74,124,89,0.3)",
            transition: "all 0.2s ease",
          }}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}

function NavTab({ href, label, active }) {
  return (
    <Link href={href} style={{
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "0.875rem",
      fontWeight: active ? 600 : 400,
      color: active ? "#fff" : "#555",
      background: active ? "linear-gradient(135deg, #4a7c59, #6B8F71)" : "transparent",
      textDecoration: "none",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    }}>
      {label}
    </Link>
  );
}
