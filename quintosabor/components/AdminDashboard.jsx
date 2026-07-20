"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import * as XLSX from "xlsx";

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_LABELS = { PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };
const STATUS_COLORS = { PENDING: "#e8a045", PAID: "#4a7c59", SHIPPED: "#4a6fa5", DELIVERED: "#2d5a3d", CANCELLED: "#c0392b" };

export default function AdminDashboard({ orders: initialOrders, users }) {
  const supabase = createClient();
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("orders");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const exportToExcel = () => {
    // Hoja de pedidos
    const ordersData = orders.map(o => ({
      "ID Pedido": o.id.slice(0, 8),
      "Fecha": new Date(o.created_at).toLocaleDateString("es-CO"),
      "Cliente": o.users?.name || "-",
      "Email": o.users?.email || "-",
      "Teléfono": o.users?.phone || "-",
      "Tipo": o.users?.role || "-",
      "Total (COP)": o.total_amount,
      "Dirección": o.shipping_address || "-",
      "Estado": STATUS_LABELS[o.status] || o.status,
      "Productos": o.order_items?.map(i => `${i.products?.name} x${i.quantity}`).join(", ") || "-",
    }));

    // Hoja de usuarios
    const usersData = users.map(u => ({
      "ID": u.id.slice(0, 8),
      "Nombre": u.name || "-",
      "Email": u.email,
      "Teléfono": u.phone || "-",
      "Tipo": u.role,
      "Estado B2B": u.b2b_status || "-",
      "Dirección": u.address || "-",
      "Registrado": new Date(u.created_at).toLocaleDateString("es-CO"),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordersData), "Pedidos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usersData), "Usuarios");
    XLSX.writeFile(wb, `umami_datos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredOrders = filterStatus === "ALL" ? orders : orders.filter(o => o.status === filterStatus);

  const tabStyle = (active) => ({
    padding: "8px 20px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
    background: active ? "#2d5a3d" : "#f0ede8",
    color: active ? "#fff" : "#555",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", padding: "32px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" }}>⚙️ Panel Admin</h1>
            <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "4px" }}>Gestión de pedidos y usuarios · Umami</p>
          </div>
          <button onClick={exportToExcel} style={{
            background: "linear-gradient(135deg, #2d5a3d, #4a7c59)",
            color: "#fff", border: "none", borderRadius: "12px",
            padding: "10px 22px", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
            boxShadow: "0 4px 14px rgba(45,90,61,0.3)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            📊 Exportar a Excel
          </button>
        </div>

        {/* Stats rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Total pedidos", value: orders.length, emoji: "📦" },
            { label: "Pendientes", value: orders.filter(o => o.status === "PENDING").length, emoji: "⏳" },
            { label: "Enviados", value: orders.filter(o => o.status === "SHIPPED").length, emoji: "🚚" },
            { label: "Usuarios", value: users.length, emoji: "👥" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "#fff", borderRadius: "14px", padding: "18px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center",
            }}>
              <p style={{ fontSize: "1.6rem", margin: 0 }}>{stat.emoji}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", margin: "4px 0 0" }}>{stat.value}</p>
              <p style={{ fontSize: "0.78rem", color: "#999", margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button onClick={() => setActiveTab("orders")} style={tabStyle(activeTab === "orders")}>Pedidos</button>
          <button onClick={() => setActiveTab("users")} style={tabStyle(activeTab === "users")}>Usuarios</button>
        </div>

        {/* ── PEDIDOS ── */}
        {activeTab === "orders" && (
          <div>
            {/* Filtro */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
              {["ALL", ...STATUS_OPTIONS].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: "5px 14px", borderRadius: "20px", border: "1.5px solid",
                  borderColor: filterStatus === s ? "#2d5a3d" : "#e0ddd8",
                  background: filterStatus === s ? "#2d5a3d" : "#fff",
                  color: filterStatus === s ? "#fff" : "#555",
                  cursor: "pointer", fontSize: "0.8rem", fontWeight: 500,
                  transition: "all 0.15s ease",
                }}>
                  {s === "ALL" ? "Todos" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredOrders.length === 0
                ? <p style={{ textAlign: "center", color: "#bbb", padding: "40px 0" }}>No hay pedidos en este estado.</p>
                : filteredOrders.map(order => (
                  <div key={order.id} style={{
                    background: "#fff", borderRadius: "16px",
                    padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    display: "grid", gap: "14px",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "start",
                  }}>
                    <div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.75rem", color: "#bbb", fontFamily: "monospace" }}>#{order.id.slice(0, 8)}</span>
                        <span style={{
                          background: STATUS_COLORS[order.status] + "22",
                          color: STATUS_COLORS[order.status],
                          borderRadius: "20px", padding: "2px 10px",
                          fontSize: "0.72rem", fontWeight: 700,
                        }}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#aaa" }}>
                          {new Date(order.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", margin: "0 0 4px" }}>
                        {order.users?.name || order.users?.email || "Invitado"} · ${order.total_amount?.toLocaleString("es-CO")}
                      </p>
                      {order.users?.phone && <p style={{ fontSize: "0.82rem", color: "#777", margin: "0 0 4px" }}>📞 {order.users.phone}</p>}
                      {order.shipping_address && <p style={{ fontSize: "0.82rem", color: "#777", margin: 0 }}>📍 {order.shipping_address}</p>}
                      {order.order_items?.length > 0 && (
                        <p style={{ fontSize: "0.82rem", color: "#555", marginTop: "8px" }}>
                          {order.order_items.map(i => `${i.products?.name} ×${i.quantity}`).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div style={{ minWidth: "140px" }}>
                      <label style={{ fontSize: "0.72rem", color: "#999", display: "block", marginBottom: "4px" }}>Cambiar estado</label>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        style={{
                          width: "100%", padding: "7px 10px", borderRadius: "10px",
                          border: "1.5px solid #e0ddd8", background: "#fafaf8",
                          fontSize: "0.82rem", cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      {updatingId === order.id && <p style={{ fontSize: "0.72rem", color: "#4a7c59", marginTop: "4px" }}>Guardando...</p>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── USUARIOS ── */}
        {activeTab === "users" && (
          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f8f6f3", borderBottom: "2px solid #f0ede8" }}>
                    {["Nombre", "Email", "Teléfono", "Tipo", "Estado B2B", "Registrado"].map(h => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f5f3f0", background: i % 2 === 0 ? "#fff" : "#fdfcfb" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>{u.name || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>{u.phone || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: u.role === "B2B" ? "#4a6fa522" : "#4a7c5922",
                          color: u.role === "B2B" ? "#4a6fa5" : "#4a7c59",
                          borderRadius: "12px", padding: "2px 10px", fontWeight: 600, fontSize: "0.75rem",
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>
                        {u.role === "B2B" ? (
                          <span style={{
                            background: u.b2b_status === "APPROVED" ? "#4a7c5922" : "#e8a04522",
                            color: u.b2b_status === "APPROVED" ? "#4a7c59" : "#b8762a",
                            borderRadius: "12px", padding: "2px 10px", fontWeight: 600, fontSize: "0.75rem",
                          }}>{u.b2b_status}</span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#aaa", fontSize: "0.78rem" }}>
                        {new Date(u.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
