import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Umami - Alimentos Artesanales",
  description: "Conservas artesanales y Té Chai 100% naturales, elaborados con amor en Medellín.",
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es">
      <body>
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}
