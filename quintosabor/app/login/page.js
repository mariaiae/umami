"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('B2C'); // B2C (Personas), B2B (Negocios)
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/');
                router.refresh();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            role: role,
                        }
                    }
                });
                if (error) throw error;
                alert("¡Registro exitoso! Revisa tu correo (si aplica) o inicia sesión.");
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="apple-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: '600' }}>
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>

                {error && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="apple-form-group" style={{ marginBottom: '1rem' }}>
                            <label>Tipo de Cuenta</label>
                            <div className="segmented-control">
                                <input type="radio" id="b2c" checked={role === 'B2C'} onChange={() => setRole('B2C')} />
                                <label htmlFor="b2c">Persona</label>

                                <input type="radio" id="b2b" checked={role === 'B2B'} onChange={() => setRole('B2B')} />
                                <label htmlFor="b2b">Negocio</label>
                            </div>
                        </div>
                    )}

                    <div className="apple-form-group">
                        {!isLogin && (
                            <input 
                                type="text" 
                                className="apple-input list-input-top" 
                                placeholder={role === 'B2B' ? "Nombre del Negocio" : "Nombre completo"}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required 
                            />
                        )}
                        {!isLogin && <hr className="apple-divider" style={{ margin: 0, marginLeft: '15px' }} />}
                        
                        <input 
                            type="email" 
                            className={`apple-input ${!isLogin ? 'list-input-bottom' : ''}`} 
                            style={{ borderRadius: isLogin ? '8px 8px 0 0' : '0' }}
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required 
                        />
                        <hr className="apple-divider" style={{ margin: 0, marginLeft: '15px' }} />
                        <input 
                            type="password" 
                            className="apple-input list-input-bottom" 
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="apple-btn-primary" 
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarme')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)} 
                        style={{ background: 'none', border: 'none', color: 'var(--apple-blue)', cursor: 'pointer', fontWeight: '500' }}
                    >
                        {isLogin ? "Regístrate" : "Inicia sesión"}
                    </button>
                </p>
            </div>
        </div>
    );
}
