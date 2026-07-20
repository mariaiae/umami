"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileForm({ profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      let avatar_url = profile?.avatar_url;

      if (avatarFile) {
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(`${profile.id}/${Date.now()}`, avatarFile, { upsert: true });
        if (!error) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path);
          avatar_url = urlData.publicUrl;
        }
      }

      await supabase
        .from("users")
        .update({ name, phone, address, avatar_url })
        .eq("id", profile.id);

      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
        <div style={{
          width: "90px", height: "90px", borderRadius: "50%",
          overflow: "hidden", marginBottom: "12px",
          background: "linear-gradient(135deg, #4a7c59, #6B8F71)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 16px rgba(74,124,89,0.25)",
        }}
          onClick={() => document.getElementById("avatar-input").click()}
        >
          {avatarPreview
            ? <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: "2rem", color: "#fff" }}>{profile?.email?.[0]?.toUpperCase()}</span>
          }
        </div>
        <input id="avatar-input" type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        <button type="button" onClick={() => document.getElementById("avatar-input").click()} style={{
          background: "none", border: "none", color: "#4a7c59", fontSize: "0.85rem",
          cursor: "pointer", fontWeight: 500, textDecoration: "underline",
        }}>
          Cambiar foto de perfil
        </button>
      </div>

      <div className="apple-form-group">
        <input className="apple-input list-input-top" type="text" placeholder="Nombre completo"
          value={name} onChange={e => setName(e.target.value)} />
        <hr className="apple-divider" style={{ margin: 0, marginLeft: "15px" }} />
        <input className="apple-input" type="tel" placeholder="Número de contacto"
          value={phone} onChange={e => setPhone(e.target.value)} />
        <hr className="apple-divider" style={{ margin: 0, marginLeft: "15px" }} />
        <input className="apple-input list-input-bottom" type="text" placeholder="Dirección de entrega habitual"
          value={address} onChange={e => setAddress(e.target.value)} />
      </div>

      {success && (
        <p style={{ textAlign: "center", color: "#4a7c59", fontWeight: 500, margin: "14px 0 0" }}>
          ✓ Perfil actualizado correctamente
        </p>
      )}

      <button type="submit" className="apple-btn-primary" style={{ width: "100%", marginTop: "18px" }} disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
