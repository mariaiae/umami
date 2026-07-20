import "./globals.css";

export const metadata = {
  title: "Umami - Pedidos",
  description: "Alimentos 100% artesanales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
