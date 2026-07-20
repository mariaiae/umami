import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

const TESTIMONIALS = [
  { name: "Camila R.", city: "Medellín", stars: 5, text: "La mermelada de mora es una cosa seria 😍 la combiné con queso crema y tostadas de centeno... ¡espectacular! Ya pedí otras 4." },
  { name: "Sebastián M.", city: "Bogotá", stars: 5, text: "El té chai es lo mejor que le ha pasado a mis mañanas. Sin azúcar, sin nada artificial, y con un sabor increíble. Lo recomiendo al 100%." },
  { name: "Valentina G.", city: "Medellín", stars: 5, text: "El ají de maracuyá picante es adictivo. Lo puse sobre unos tacos y se los comieron todos antes de que yo pudiera probar uno jaja." },
  { name: "Andrés P.", city: "Envigado", stars: 5, text: "Compro para mi cafetería. Los clientes siempre preguntan de dónde son los acompañamientos. Calidad artesanal, atención excelente y entregas puntuales." },
];

const PRODUCTS = [
  {
    name: "Mermelada de Mora",
    description: "Moras frescas de montaña, un toque de naranja y remolacha. Sin conservantes. Perfecta en tostadas, crepes o con queso.",
    image: "/Moras2.jpeg",
    tag: "Favorito del público",
  },
  {
    name: "Ají de Maracuyá",
    description: "La magia del ácido y el picante en un solo frasco. Disponible dulce o picante. Eleva cualquier plato al instante.",
    image: "/marac2.jpeg",
    tag: "Edición especial",
  },
  {
    name: "Té Chai",
    description: "Mezcla artesanal de especias: canela, cardamomo, jengibre y más. 100% natural, sin endulzantes. El abrazo perfecto en cada taza.",
    image: "/Techai2.jpeg",
    tag: "100% Natural",
  },
];

const COMBOS = [
  {
    title: "Mañanas de lujo",
    desc: "Mermelada de mora + tostadas integrales + café negro. El desayuno que mereces.",
    image: "/Moras3.jpeg",
  },
  {
    title: "Tarde de té",
    desc: "Té Chai con leche de avena caliente. Acompáñalo con galletas de mantequilla.",
    image: "/Techai1.jpeg",
  },
  {
    title: "Toque gourmet",
    desc: "Ají de maracuyá sobre pollo a la plancha o aguacate. Simple, distinto, delicioso.",
    image: "/marac1.jpeg",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8" }}>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        height: "88vh",
        minHeight: "520px",
        backgroundImage: "linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 100%), url('/Techai4.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        color: "#fff",
      }}>
        <span style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "20px",
          padding: "4px 14px",
          fontSize: "0.78rem",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "18px",
          display: "inline-block",
        }}>
          Alimentos 100% artesanales · Medellín
        </span>

        <h1 style={{
          fontSize: "clamp(2.2rem, 6vw, 4rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: "700px",
          marginBottom: "20px",
          letterSpacing: "-1px",
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}>
          El quinto sabor<br />en cada frasco
        </h1>

        <p style={{
          fontSize: "1.1rem",
          opacity: 0.9,
          maxWidth: "480px",
          marginBottom: "36px",
          lineHeight: 1.6,
          textShadow: "0 1px 8px rgba(0,0,0,0.4)",
        }}>
          Conservas y chai elaborados con ingredientes locales, sin aditivos, con toda el alma.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/pedido" style={{
            background: "linear-gradient(135deg, #4a7c59, #6B8F71)",
            color: "#fff",
            borderRadius: "30px",
            padding: "14px 32px",
            fontSize: "1rem",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(74,124,89,0.45)",
            transition: "transform 0.2s ease",
          }}>
            Hacer un pedido →
          </Link>
          {!user && (
            <Link href="/login" style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              color: "#fff",
              borderRadius: "30px",
              padding: "14px 28px",
              fontSize: "1rem",
              fontWeight: 500,
              textDecoration: "none",
            }}>
              Crear cuenta
            </Link>
          )}
        </div>
      </section>

      {/* ── NUESTROS PRODUCTOS ── */}
      <section style={{ padding: "72px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>Nuestros productos</h2>
          <p style={{ color: "#777", marginTop: "8px", fontSize: "1rem" }}>Tres productos, infinitas combinaciones.</p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "28px",
        }}>
          {PRODUCTS.map(p => (
            <div key={p.name} style={{
              background: "#fff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}>
              <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span style={{
                  position: "absolute", top: "14px", left: "14px",
                  background: "rgba(74,124,89,0.92)",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "3px 12px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}>
                  {p.tag}
                </span>
              </div>
              <div style={{ padding: "22px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>{p.name}</h3>
                <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INSPIRACIÓN / COMBINACIONES ── */}
      <section style={{ background: "linear-gradient(135deg, #f0f5f1, #e8f0ea)", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>Inspiración para usarlos</h2>
            <p style={{ color: "#777", marginTop: "8px" }}>Ideas para sacarles el máximo provecho.</p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}>
            {COMBOS.map(c => (
              <div key={c.title} style={{
                background: "#fff",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
              }}>
                <img src={c.image} alt={c.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#2d5a3d", marginBottom: "6px" }}>{c.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.6 }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ padding: "72px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>Lo que dicen nuestros clientes</h2>
          <p style={{ color: "#777", marginTop: "8px" }}>Opiniones reales de personas que ya los probaron.</p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "22px",
        }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{
              background: "#fff",
              border: "1px solid #f0ede8",
              borderRadius: "18px",
              padding: "26px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}>
              <div style={{ color: "#e8a045", fontSize: "1rem", marginBottom: "12px" }}>
                {"★".repeat(t.stars)}
              </div>
              <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.7, marginBottom: "18px", fontStyle: "italic" }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #6B8F71, #a4c3a2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1a1a", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: "linear-gradient(135deg, #2d5a3d, #4a7c59)",
        padding: "64px 24px",
        textAlign: "center",
        color: "#fff",
      }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "14px", letterSpacing: "-0.3px" }}>
          ¿Listo para probarlos?
        </h2>
        <p style={{ opacity: 0.85, marginBottom: "30px", fontSize: "1rem" }}>
          Pedidos en 4–5 días hábiles. Envíos a Medellín y área metropolitana.
        </p>
        <Link href="/pedido" style={{
          background: "#fff",
          color: "#2d5a3d",
          borderRadius: "30px",
          padding: "14px 36px",
          fontSize: "1rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          Hacer mi pedido →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1a1a1a", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ color: "#666", fontSize: "0.82rem", margin: 0 }}>
          © 2026 Umami · Alimentos artesanales · Medellín, Colombia ·{" "}
          <a href="https://wa.me/573332796527" style={{ color: "#6B8F71", textDecoration: "none" }}>
            WhatsApp
          </a>
        </p>
      </footer>
    </div>
  );
}
