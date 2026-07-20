import OrderForm from "@/components/OrderForm";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: products } = await supabase.from('products').select('*');

  return (
    <>
      <header style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('/Techai4.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
        padding: "50px 20px 30px",
        textAlign: "center",
        borderRadius: "0 0 18px 18px",
        position: "relative",
      }}>
        {/* Botón de cuenta en esquina superior derecha */}
        <div style={{ position: "absolute", top: "14px", right: "16px" }}>
          {user ? (
            <form action="/auth/signout" method="post">
              <span style={{ fontSize: "0.78rem", opacity: 0.8, marginRight: "8px" }}>
                {user.email}
              </span>
              <button type="submit" style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                borderRadius: "20px",
                padding: "5px 14px",
                fontSize: "0.8rem",
                cursor: "pointer",
                backdropFilter: "blur(6px)",
              }}>
                Salir
              </button>
            </form>
          ) : (
            <Link href="/login" style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "0.82rem",
              fontWeight: 500,
              textDecoration: "none",
              backdropFilter: "blur(6px)",
              display: "inline-block",
            }}>
              Iniciar sesión
            </Link>
          )}
        </div>

        <h1 style={{ marginBottom: "5px", fontSize: "2rem", textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>Umami</h1>
        <p style={{ color: "#ffffff", fontWeight: 400, textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>Alimentos 100% artesanales</p>
      </header>

      <main className="container">
        <OrderForm dbProducts={products || []} />
      </main>
    </>
  );
}
