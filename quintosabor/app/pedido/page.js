import { createClient } from "@/utils/supabase/server";
import OrderForm from "@/components/OrderForm";

export const metadata = {
  title: "Hacer Pedido · Umami",
  description: "Selecciona tus productos artesanales Umami y realiza tu pedido.",
};

export const revalidate = 0;

export default async function PedidoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: products } = await supabase.from("products").select("*");

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8" }}>
      <main className="container">
        <OrderForm dbProducts={products || []} user={user} />
      </main>
    </div>
  );
}
