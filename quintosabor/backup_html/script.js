// 1. Configuración principal
const TU_NUMERO_WHATSAPP = "573332796527"; // Tu número con código de país 57, sin el "+"
const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/v70vwj2ee7mohc1caybpdju8axkzbh3s"; // (Opcional) Tu enlace de Make si decides usarlo

const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

let orderState = { items: [], subtotal: 0, shippingCost: 0, total: 0 };

// 2. Lógica del Stepper de Apple (+ / -)
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    let newValue = parseInt(input.value) + change;
    if (newValue < 0) newValue = 0;
    input.value = newValue;
    calculateSubtotal();
}

// 3. Cálculos
function calculateSubtotal() {
    orderState.items = [];
    orderState.subtotal = 0;

    document.querySelectorAll('.qty-input').forEach(input => {
        const qty = parseInt(input.value);
        if (qty > 0) {
            let name = input.dataset.name;
            const price = parseInt(input.dataset.price);

            // Capturar variante si existe (Picante/Dulce)
            if (input.dataset.variantId) {
                const variant = document.getElementById(input.dataset.variantId).value;
                name = `${name} (${variant})`;
            }

            const itemTotal = qty * price;
            orderState.subtotal += itemTotal;
            orderState.items.push({ product: name, quantity: qty, total: itemTotal });
        }
    });

    document.getElementById('subtotalDisplay').innerText = formatter.format(orderState.subtotal);
    updateTotal();
    return orderState.subtotal;
}

// 4. Navegación
function nextStep(step) {
    if (step === 2 && calculateSubtotal() === 0) {
        alert("Por favor, selecciona al menos un producto.");
        return;
    }
    if (step === 3) updateOrderSummary();
    showStep(step);
}

function prevStep(step) { 
    showStep(step); 
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));

    document.getElementById(`step-${step}`).classList.add('active');
    for(let i = 1; i <= step; i++) document.getElementById(`indicator-${i}`).classList.add('active');

    // Ocultar barra flotante en el último paso
    const bottomBar = document.querySelector('.sticky-bottom-bar');
    if(step === 3) bottomBar.style.display = 'none';
    else bottomBar.style.display = 'flex';
}

// 5. Opciones de Entrega y Totales
function toggleDeliveryOptions() {
    const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const domicilioFields = document.getElementById('domicilio-fields');
    const hint = document.getElementById('deliveryHint');

    if (method === 'domicilio') {
        domicilioFields.style.display = 'block';
        hint.innerText = "Costo calculado según zona.";
    } else {
        domicilioFields.style.display = 'none';
        hint.innerText = "Entrega en Estación Hospital (Miércoles)";
    }
    updateTotal();
}

function updateTotal() {
    // Obtener método y botón
    const method = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const btnContinuar = document.getElementById('btn-continuar');

    // Lógica de costo de envío
    if (method === 'domicilio') {
        orderState.shippingCost = parseInt(document.getElementById('deliveryZone').value);
    } else {
        orderState.shippingCost = 0;
    }

    // Cálculo del total
    orderState.total = orderState.subtotal + orderState.shippingCost;

    // Validación para Metro Hospital (Bloqueo de botón)
    if (method === 'metro_hospital') {
        const totalQty = orderState.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalQty < 5 && orderState.subtotal < 40000) {
            btnContinuar.disabled = true;
            btnContinuar.innerText = "Mínimo 5 unid. o $40.000";
        } else {
            btnContinuar.disabled = false;
            btnContinuar.innerText = "Continuar";
        }
    } else {
        // Habilitar botón si no es metro_hospital
        btnContinuar.disabled = false;
        btnContinuar.innerText = "Continuar";
    }
}

// 6. Resumen de Orden (Paso 3)
function updateOrderSummary() {
    const list = document.getElementById('summaryList');
    list.innerHTML = '';
    orderState.items.forEach(item => {
        list.innerHTML += `<li>${item.quantity}x ${item.product}</li>`;
    });
    document.getElementById('summarySubtotal').innerText = formatter.format(orderState.subtotal);
    document.getElementById('summaryShipping').innerText = formatter.format(orderState.shippingCost);
    document.getElementById('summaryTotal').innerText = formatter.format(orderState.total);
}

// 7. Envío del Formulario: Redirección a WhatsApp (y Make opcional)
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submit-button');
    btn.innerText = 'Procesando...';
    btn.disabled = true;

    // Obtener datos de los inputs asegurando que coincidan con los IDs del HTML
    const customerName = document.getElementById('nombre').value;
    const paymentMethod = document.querySelector('input[name="pago"]:checked').value;
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    
    // Si es domicilio, saca el nombre de la zona (ej: "Zona Sur (+$14.000)"), sino, dice "Estación Metro"
    const zone = deliveryMethod === 'domicilio' 
        ? document.getElementById('deliveryZone').options[document.getElementById('deliveryZone').selectedIndex].text 
        : "Estación Metro";

    // Opcional: Enviar a Make para registro en Excel
    if (MAKE_WEBHOOK_URL) {
        const payload = {
            cliente: customerName,
            telefono: document.getElementById('customerPhone').value,
            entrega: deliveryMethod,
            pago: paymentMethod,
            total: orderState.total,
            items: orderState.items,
            cant_mora_150: orderState.items.find(i => i.product.includes("Mermelada 150"))?.quantity || 0,
            cant_mora_250: orderState.items.find(i => i.product.includes("Mermelada 250"))?.quantity || 0,
            cant_aji_150: orderState.items.find(i => i.product.includes("Ají maracuyá 150"))?.quantity || 0,
            cant_aji_250: orderState.items.find(i => i.product.includes("Ají maracuyá 250"))?.quantity || 0,
            chai_75: orderState.items.find(i => i.product.includes("Té chai 75"))?.quantity || 0,
            chai_125: orderState.items.find(i => i.product.includes("Té chai 125"))?.quantity || 0
        };

        console.log("Intentando enviar a Make este payload:", payload);

        try {
            const response = await fetch(MAKE_WEBHOOK_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });
            console.log("Respuesta del servidor de Make:", response.status);
        } catch (error) {
            console.error("Error al conectar con Make:", error);
        }
    }

    // Generar texto automático para WhatsApp
    let waText = `¡Hola Umami! Soy *${customerName}*, acabo de registrar un pedido.\n\n`;
    waText += "*Mi pedido:*\n";
    orderState.items.forEach(i => waText += `- ${i.quantity} x ${i.product}\n`);
    waText += `\n*Entrega:* ${zone}`;
    waText += `\n*Método de pago:* ${paymentMethod}`;
    waText += `\n*Total a pagar:* ${formatter.format(orderState.total)}\n\n`;

    if (paymentMethod === 'Transferencia/QR') {
        waText += "Por favor, confirma el pedido y compárteme el código QR para transferir. ¡Gracias!";
    } else {
        waText += "Quedo atento(a) para coordinar la entrega. ¡Gracias!";
    }

    // Abrir WhatsApp y redirigir
    const waLink = `https://wa.me/${TU_NUMERO_WHATSAPP}?text=${encodeURIComponent(waText)}`;
    window.location.href = waLink; 
});