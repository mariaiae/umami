// FORMATO DE MONEDA
const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// ESTADO GLOBAL DEL PEDIDO
let orderState = {
    items: [],
    subtotal: 0,
    shippingCost: 0,
    total: 0
};

// 1. LÓGICA DE NAVEGACIÓN (WIZARD)
function nextStep(step) {
    if (step === 2 && calculateSubtotal() === 0) {
        alert("Por favor, selecciona al menos un producto para continuar.");
        return;
    }
    if (step === 3) {
        updateOrderSummary();
    }
    showStep(step);
}

function prevStep(step) {
    showStep(step);
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step-${step}`).classList.add('active');
    for(let i = 1; i <= step; i++) {
        document.getElementById(`indicator-${i}`).classList.add('active');
    }
}

// 2. LÓGICA DEL CARRITO Y CÁLCULOS
document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', () => {
        calculateSubtotal();
    });
});

function calculateSubtotal() {
    orderState.items = [];
    orderState.subtotal = 0;

    document.querySelectorAll('.qty-input').forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            let name = input.dataset.name;
            const price = parseInt(input.dataset.price);
            
            // Verificar si es un producto con variante (Ají: Dulce/Picante)
            if (input.dataset.variantId) {
                const variant = document.getElementById(input.dataset.variantId).value;
                name = `${name} (${variant})`;
            }

            const itemTotal = qty * price;
            orderState.subtotal += itemTotal;
            
            orderState.items.push({
                product: name,
                quantity: qty,
                unitPrice: price,
                total: itemTotal
            });
        }
    });

    document.getElementById('subtotalDisplay').innerText = formatter.format(orderState.subtotal);
    updateTotal();
    return orderState.subtotal;
}

function toggleDeliveryOptions() {
    const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const domicilioFields = document.getElementById('domicilio-fields');
    
    if (method === 'domicilio') {
        domicilioFields.style.display = 'block';
    } else {
        domicilioFields.style.display = 'none';
        document.getElementById('address').value = ""; // Limpiar dirección
    }
    updateTotal();
}

function updateTotal() {
    const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
    
    if (method === 'domicilio') {
        orderState.shippingCost = parseInt(document.getElementById('deliveryZone').value);
    } else {
        orderState.shippingCost = 0;
    }

    orderState.total = orderState.subtotal + orderState.shippingCost;
}

function updateOrderSummary() {
    const list = document.getElementById('summaryList');
    list.innerHTML = '';

    orderState.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.quantity}x ${item.product}</span> <span>${formatter.format(item.total)}</span>`;
        list.appendChild(li);
    });

    document.getElementById('summarySubtotal').innerText = formatter.format(orderState.subtotal);
    document.getElementById('summaryShipping').innerText = formatter.format(orderState.shippingCost);
    document.getElementById('summaryTotal').innerText = formatter.format(orderState.total);
}

// 3. ENVÍO DEL FORMULARIO A MAKE (WEBHOOK)
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Recolectar datos del cliente
    const customerData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked').value,
        address: document.getElementById('address').value || 'N/A',
        dateTime: document.getElementById('dateTime').value,
        paymentMethod: document.getElementById('paymentMethod').value
    };

    // Paquete final de datos
    const payload = {
        customer: customerData,
        order: orderState
    };

    // --- INTEGRACIÓN CON MAKE ---
    // Reemplaza la URL de abajo por la URL de tu Webhook de Make
    const MAKE_WEBHOOK_URL = 'TU_URL_DE_WEBHOOK_AQUI'; 

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = 'Procesando...';
    submitBtn.disabled = true;

    try {
        /* Descomenta esto cuando tengas tu enlace de Make 
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Error al enviar webhook');
        

        // Simulación de éxito por ahora
        alert("¡Pedido enviado con éxito! En breve nos pondremos en contacto contigo."); */

        // --- AQUÍ INICIA EL ENVÍO A WHATSAPP ---
        const numeroWhatsApp = "573332796527"; // REEMPLAZA CON TU NÚMERO
        
        let waText = `¡Hola El Quinto Sabor! Soy *${customerData.name}* y acabo de registrar un pedido.\n\n`;
        waText += `*[PEDIDO] Mi pedido:*\n`;
        orderState.items.forEach(i => waText += `- ${i.quantity}x ${i.product}\n`);
        waText += `\n*[ENTREGA] Entrega:* ${customerData.deliveryMethod} - ${customerData.address}`;
        waText += `\n*[PAGO] Método de pago:* ${customerData.paymentMethod}`;
        waText += `\n*[TOTAL] Total a pagar:* ${formatter.format(orderState.total)}\n\n`;
        waText += `Quedo atento(a) a la confirmación. ¡Gracias!`;

        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(waText)}`;
        window.open(urlWhatsApp, '_blank');
        // --- AQUÍ TERMINA EL ENVÍO A WHATSAPP ---

        alert("¡Pedido registrado! Te redirigiremos a WhatsApp para finalizar.");
        
        // Reiniciar formulario
        document.getElementById('orderForm').reset();
        showStep(1);
        calculateSubtotal();

    } catch (error) {
        console.error('Error:', error);
        alert("Hubo un problema al procesar el pedido. Por favor intenta de nuevo.");
    } finally {
        submitBtn.innerText = 'Hacer Pedido';
        submitBtn.disabled = false;
    }
});