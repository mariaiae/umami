import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = { title: "Panel Admin · Umami" };
export const revalidate = 0;

const ADMIN_EMAIL = "isarias09@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, users(email, name, phone, role), order_items(*, products(name))")
    .order("created_at", { ascending: false });

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminDashboard orders={orders || []} users={users || []} />;
}
