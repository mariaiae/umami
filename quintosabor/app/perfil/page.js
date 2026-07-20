import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "Mi Perfil · Umami" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: orders } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });

  const STATUS_LABELS = { PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };
  const STATUS_COLORS = { PENDING: "#e8a045", PAID: "#4a7c59", SHIPPED: "#4a6fa5", DELIVERED: "#2d5a3d", CANCELLED: "#c0392b" };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "6px", color: "#1a1a1a" }}>Mi cuenta</h1>
        <p style={{ color: "#888", marginBottom: "32px", fontSize: "0.9rem" }}>{user.email}</p>

        {/* Perfil */}
        <div style={{ background: "#fff", borderRadius: "18px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "22px", color: "#1a1a1a" }}>Datos de contacto</h2>
          <ProfileForm profile={{ ...profile, email: user.email }} />
        </div>

        {/* Mis pedidos */}
        <div style={{ background: "#fff", borderRadius: "18px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px", color: "#1a1a1a" }}>Mis pedidos</h2>
          {!orders || orders.length === 0 ? (
            <p style={{ color: "#999", fontSize: "0.9rem", textAlign: "center", padding: "20px 0" }}>
              Aún no tienes pedidos. <a href="/pedido" style={{ color: "#4a7c59", fontWeight: 500 }}>¡Haz tu primer pedido!</a>
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {orders.map(order => (
                <div key={order.id} style={{
                  border: "1px solid #f0ede8",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <p style={{ fontSize: "0.82rem", color: "#999", margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 0" }}>
                      ${order.total_amount?.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <span style={{
                    background: STATUS_COLORS[order.status] + "22",
                    color: STATUS_COLORS[order.status],
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
