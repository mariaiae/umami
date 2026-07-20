"use client";
import React, { useState, useMemo } from 'react';

const TU_NUMERO_WHATSAPP = "573332796527";
const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/v70vwj2ee7mohc1caybpdju8axkzbh3s";

const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

export default function OrderForm({ dbProducts = [], user = null }) {
    const [step, setStep] = useState(1);
    
    // Obtener precios dinámicos (usamos el default si la BD está vacía)
    const getPrice = (productName, defaultPrice) => {
        const product = dbProducts.find(p => p.name === productName);
        return product ? product.base_price || defaultPrice : defaultPrice; // Placeholder, en un esquema real buscaríamos en price_tiers
    };

    // Step 1 State: Products
    const [cart, setCart] = useState({});
    const [aji150Variant, setAji150Variant] = useState("Picante");
    const [aji250Variant, setAji250Variant] = useState("Picante");

    // Step 2 State: Delivery
    const [deliveryMethod, setDeliveryMethod] = useState("metro_hospital");
    const [deliveryZone, setDeliveryZone] = useState("10000");
    const [address, setAddress] = useState("");
    const [dateTime, setDateTime] = useState("");

    // Step 3 State: Payment
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Transferencia/QR");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived values
    const subtotal = useMemo(() => {
        return Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
    }, [cart]);

    const totalQty = useMemo(() => {
        return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    }, [cart]);

    const shippingCost = deliveryMethod === 'domicilio' ? parseInt(deliveryZone) : 0;
    const total = subtotal + shippingCost;

    // Helpers
    const updateQty = (id, name, price, change, variant = "") => {
        const key = variant ? `${name} (${variant})` : name;
        setCart(prev => {
            const currentQty = prev[key]?.qty || 0;
            const newQty = Math.max(0, currentQty + change);
            if (newQty === 0) {
                const newCart = { ...prev };
                delete newCart[key];
                return newCart;
            }
            return { ...prev, [key]: { id, name, price, qty: newQty, variant } };
        });
    };

    const getQty = (name, variant = "") => {
        const key = variant ? `${name} (${variant})` : name;
        return cart[key]?.qty || 0;
    };

    const nextStep = (targetStep) => {
        if (targetStep === 2 && subtotal === 0) {
            alert("Por favor, selecciona al menos un producto.");
            return;
        }
        // Regla: más de 10 unidades requiere login
        if (targetStep === 2 && totalQty >= 10 && !user) {
            if (confirm("Los pedidos de 10 o más unidades requieren una cuenta.\n\n¿Quieres iniciar sesión o registrarte ahora?")) {
                window.location.href = "/login";
            }
            return;
        }
        setStep(targetStep);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const itemsList = Object.keys(cart).map(k => ({ product: k, quantity: cart[k].qty, total: cart[k].qty * cart[k].price }));
        const zoneText = deliveryMethod === 'domicilio' ? `Zona (+$${deliveryZone})` : "Estación Metro";

        if (MAKE_WEBHOOK_URL) {
            const payload = {
                cliente: customerName,
                telefono: customerPhone,
                entrega: deliveryMethod,
                pago: paymentMethod,
                total: total,
                items: itemsList,
                cant_mora_150: itemsList.find(i => i.product.includes("Mermelada 150"))?.quantity || 0,
                cant_mora_250: itemsList.find(i => i.product.includes("Mermelada 250"))?.quantity || 0,
                cant_aji_150: itemsList.find(i => i.product.includes("Ají 150"))?.quantity || 0,
                cant_aji_250: itemsList.find(i => i.product.includes("Ají 250"))?.quantity || 0,
                chai_75: itemsList.find(i => i.product.includes("Té Chai 75"))?.quantity || 0,
                chai_125: itemsList.find(i => i.product.includes("Té Chai 125"))?.quantity || 0
            };

            try {
                await fetch(MAKE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error("Error al conectar con Make:", error);
            }
        }

        let waText = `¡Hola Umami! Soy *${customerName}*, acabo de registrar un pedido.\n\n`;
        waText += "*Mi pedido:*\n";
        itemsList.forEach(i => waText += `- ${i.quantity} x ${i.product}\n`);
        waText += `\n*Entrega:* ${zoneText}`;
        if(deliveryMethod === 'domicilio') waText += `\n*Dirección:* ${address}`;
        waText += `\n*Cuándo:* ${dateTime}`;
        waText += `\n*Método de pago:* ${paymentMethod}`;
        waText += `\n*Total a pagar:* ${formatter.format(total)}\n\n`;

        if (paymentMethod === 'Transferencia/QR') {
            waText += "Por favor, confirma el pedido y compárteme el código QR para transferir. ¡Gracias!";
        } else {
            waText += "Quedo atento(a) para coordinar la entrega. ¡Gracias!";
        }

        const waLink = `https://wa.me/${TU_NUMERO_WHATSAPP}?text=${encodeURIComponent(waText)}`;
        window.location.href = waLink;
    };

    const isMetroDisabled = deliveryMethod === 'metro_hospital' && (totalQty < 5 && subtotal < 40000);

    return (
        <div>
            {/* Barra de progreso */}
            <div className="progress-bar">
                <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>Productos</div>
                <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>Entrega</div>
                <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>Pago</div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* PASO 1: PRODUCTOS */}
                <section className={`form-step ${step === 1 ? 'active' : ''}`}>
                    <div className="products-grid">
                        
                        <div className="apple-card">
                            <img src="/Moras2.jpeg" alt="Mermelada" />
                            <div className="card-content">
                                <h3>Mermelada de mora</h3>
                                <p style={{ fontSize: '0.8em', color: '#888', fontStyle: 'italic', marginBottom: '10px' }}>
                                    Mezcla de moras, naranja y remolacha
                                </p>
                                <div className="options-list">
                                    <div className="option-row">
                                        <span>150gr ($9.000)</span>
                                        <div className="stepper">
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('mora_150', 'Mermelada 150gr', 9000, -1)}>-</button>
                                            <input type="number" value={getQty('Mermelada 150gr')} className="qty-input" readOnly />
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('mora_150', 'Mermelada 150gr', 9000, 1)}>+</button>
                                        </div>
                                    </div>
                                    <hr className="apple-divider" />
                                    <div className="option-row">
                                        <span>250gr ($12.000)</span>
                                        <div className="stepper">
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('mora_250', 'Mermelada 250gr', 12000, -1)}>-</button>
                                            <input type="number" value={getQty('Mermelada 250gr')} className="qty-input" readOnly />
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('mora_250', 'Mermelada 250gr', 12000, 1)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="apple-card">
                            <img src="/marac1.jpeg" alt="Ají" />
                            <div className="card-content">
                                <h3>Ají de maracuyá</h3>
                                <div className="options-list">
                                    <div className="option-row">
                                        <div className="variant-info">
                                            <span>150gr ($9.000)</span>
                                            <select className="apple-select inline-select" value={aji150Variant} onChange={e => setAji150Variant(e.target.value)}>
                                                <option value="Picante">Picante</option>
                                                <option value="Dulce">Dulce</option>
                                            </select>
                                        </div>
                                        <div className="stepper">
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('aji_150', 'Ají 150gr', 9000, -1, aji150Variant)}>-</button>
                                            <input type="number" value={getQty('Ají 150gr', aji150Variant)} className="qty-input" readOnly />
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('aji_150', 'Ají 150gr', 9000, 1, aji150Variant)}>+</button>
                                        </div>
                                    </div>
                                    <hr className="apple-divider" />
                                    <div className="option-row">
                                        <div className="variant-info">
                                            <span>250gr ($12.000)</span>
                                            <select className="apple-select inline-select" value={aji250Variant} onChange={e => setAji250Variant(e.target.value)}>
                                                <option value="Picante">Picante</option>
                                                <option value="Dulce">Dulce</option>
                                            </select>
                                        </div>
                                        <div className="stepper">
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('aji_250', 'Ají 250gr', 12000, -1, aji250Variant)}>-</button>
                                            <input type="number" value={getQty('Ají 250gr', aji250Variant)} className="qty-input" readOnly />
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('aji_250', 'Ají 250gr', 12000, 1, aji250Variant)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="apple-card">
                            <img src="/Techai1.jpeg" alt="Té Chai" />
                            <div className="card-content">
                                <h3 style={{ marginBottom: '5px' }}>Té Chai</h3>
                                <p style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic', marginBottom: '10px' }}>En polvo, 100% natural y sin endulzantes.</p>
                                <div className="options-list">
                                    <div className="option-row">
                                        <span>75gr ($11.000)</span>
                                        <div className="stepper">
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('chai_75', 'Té Chai 75gr', 11000, -1)}>-</button>
                                            <input type="number" value={getQty('Té Chai 75gr')} className="qty-input" readOnly />
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('chai_75', 'Té Chai 75gr', 11000, 1)}>+</button>
                                        </div>
                                    </div>
                                    <hr className="apple-divider" />
                                    <div className="option-row">
                                        <span>125gr ($20.000)</span>
                                        <div className="stepper">
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('chai_125', 'Té Chai 125gr', 20000, -1)}>-</button>
                                            <input type="number" value={getQty('Té Chai 125gr')} className="qty-input" readOnly />
                                            <button type="button" className="stepper-btn" onClick={() => updateQty('chai_125', 'Té Chai 125gr', 20000, 1)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky-bottom-bar" style={{ display: step === 3 ? 'none' : 'flex' }}>
                        <div className="subtotal-info">
                            <span>Total parcial</span>
                            <strong>{formatter.format(subtotal)}</strong>
                        </div>
                        <button type="button" className="apple-btn-primary" onClick={() => nextStep(2)}>Continuar</button>
                    </div>
                </section>

                {/* PASO 2: ENTREGA */}
                <section className={`form-step ${step === 2 ? 'active' : ''}`}>
                    <div className="apple-form-group">
                        <label>Método de entrega</label>
                        <div className="segmented-control">
                            <input type="radio" id="metro" name="deliveryMethod" value="metro_hospital" 
                                checked={deliveryMethod === 'metro_hospital'} onChange={() => setDeliveryMethod('metro_hospital')} />
                            <label htmlFor="metro">Estación Metro</label>

                            <input type="radio" id="domicilio" name="deliveryMethod" value="domicilio" 
                                checked={deliveryMethod === 'domicilio'} onChange={() => setDeliveryMethod('domicilio')} />
                            <label htmlFor="domicilio">Domicilio</label>
                        </div>
                        <p style={{ fontSize: '0.80em' }} className="apple-hint">
                            {deliveryMethod === 'domicilio' ? 'Costo calculado según zona.' : 'Entrega en Estación Hospital (fines de semana)'}
                        </p>
                    </div>

                    {deliveryMethod === 'domicilio' && (
                        <div className="apple-form-group">
                            <label>Zona de entrega</label>
                            <select className="apple-select" value={deliveryZone} onChange={e => setDeliveryZone(e.target.value)}>
                                <option value="10000">Zona Centro (+$10.000)</option>
                                <option value="12000">Zona Norte (+$12.000)</option>
                                <option value="14000">Zona Sur (+$14.000)</option>
                            </select>
                            
                            <p style={{ fontSize: '0.80em', color: '#888', marginTop: '5px' }}>Cobertura: Norte hasta Niquía, Sur hasta La Estrella.</p>

                            <label style={{ marginTop: '15px' }}>Dirección completa</label>
                            <input type="text" className="apple-input" placeholder="Ej: Calle 14B #17-90, Apto 201" 
                                value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                    )}

                    <div className="apple-form-group">
                        <label>Fecha y hora preferida</label>
                        <input type="text" className="apple-input" placeholder="Ej: 14 de julio, 5:00 p.m." 
                            value={dateTime} onChange={e => setDateTime(e.target.value)} />
                    </div>

                    <div className="action-buttons">
                        <button type="button" className="apple-btn-secondary" onClick={() => setStep(1)}>Atrás</button>
                        <button type="button" className="apple-btn-primary" onClick={() => nextStep(3)} disabled={isMetroDisabled}>
                            {isMetroDisabled ? "Mínimo 5 unid. o $40.000" : "Continuar"}
                        </button>
                    </div>
                </section>

                {/* PASO 3: CONFIRMACIÓN Y PAGO */}
                <section className={`form-step ${step === 3 ? 'active' : ''}`}>
                    <div className="apple-form-group">
                        <label>Tus datos</label>
                        <input type="text" className="apple-input list-input-top" placeholder="Nombre completo" required 
                            value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        <hr className="apple-divider" style={{ margin: 0, marginLeft: '15px' }} />
                        <input type="tel" className="apple-input list-input-bottom" placeholder="WhatsApp" required 
                            value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                    </div>

                    <div className="apple-form-group">
                        <label>Método de pago</label>
                        <div className="segmented-control">
                            <input type="radio" id="transferencia" name="pago" value="Transferencia/QR" 
                                checked={paymentMethod === 'Transferencia/QR'} onChange={() => setPaymentMethod('Transferencia/QR')} />
                            <label htmlFor="transferencia">Transferencia / QR</label>

                            <input type="radio" id="contraentrega" name="pago" value="Contra entrega" 
                                checked={paymentMethod === 'Contra entrega'} onChange={() => setPaymentMethod('Contra entrega')} />
                            <label htmlFor="contraentrega">Contra entrega</label>
                        </div>
                    </div>

                    <div className="apple-receipt">
                        <h3>Resumen</h3>
                        <ul>
                            {Object.keys(cart).map((key, idx) => (
                                <li key={idx}>{cart[key].qty}x {key}</li>
                            ))}
                        </ul>
                        <hr className="apple-divider" />
                        <div className="receipt-row">
                            <span>Subtotal</span>
                            <span>{formatter.format(subtotal)}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Envío</span>
                            <span>{formatter.format(shippingCost)}</span>
                        </div>
                        <div className="receipt-row total-row">
                            <span>Total a pagar</span>
                            <span className="blue-text">{formatter.format(total)}</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button type="button" className="apple-btn-secondary" onClick={() => setStep(2)}>Atrás</button>
                        <button type="submit" className="apple-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
                        </button>
                    </div>
                    
                    <p className="apple-hint" style={{ textAlign: 'center', marginTop: '15px' }}>
                        Al confirmar, continuamos con la gestión en nuestro WhatsApp.
                    </p>
                </section>
            </form>
        </div>
    );
}
