import OrderForm from "@/components/OrderForm";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0; // Para ver siempre los datos frescos

export default async function Home() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');

  return (
    <>
      <header className="apple-header" style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/Techai4.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#ffffff",
        padding: "60px 20px",
        textAlign: "center",
        borderRadius: "0 0 15px 15px"
      }}>
        <h1 style={{ marginBottom: "5px", fontSize: "2rem", textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>Umami</h1>
        <p style={{ color: "#ffffff", fontWeight: 400, textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>Alimentos 100% artesanales</p>
      </header>

      <main className="container">
        <OrderForm dbProducts={products || []} />
      </main>
    </>
  );
}
