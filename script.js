const PRECIO_POR_NOCHE = 85;
const MI_WHATSAPP = "18296350305";

// Función para calcular total y hacer scroll
function calcularTotal(hacerScroll = false) {
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const resumenContainer = document.getElementById('resumen-precio');
  const tarjetaReserva = document.getElementById('reservar');

  if (!checkinInput || !checkoutInput || !resumenContainer) return;

  const checkinVal = checkinInput.value;
  const checkoutVal = checkoutInput.value;

  // Validación de fechas seleccionadas
  if (!checkinVal || !checkoutVal) {
    resumenContainer.innerHTML = '<p style="color: #e00b41; font-weight: bold;">Por favor, selecciona las fechas de llegada y salida.</p>';
    if (hacerScroll && tarjetaReserva) {
      tarjetaReserva.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // Parsear fechas evitando desfasajes de zona horaria
  const [yearIn, monthIn, dayIn] = checkinVal.split('-').map(Number);
  const [yearOut, monthOut, dayOut] = checkoutVal.split('-').map(Number);

  const fechaInicio = new Date(yearIn, monthIn - 1, dayIn);
  const fechaFin = new Date(yearOut, monthOut - 1, dayOut);

  const diferenciaTiempo = fechaFin - fechaInicio;
  const noches = Math.round(diferenciaTiempo / (1000 * 3600 * 24));

  // Validación de rango
  if (noches <= 0) {
    resumenContainer.innerHTML = '<p style="color: #e00b41; font-weight: bold;">La fecha de salida debe ser posterior a la fecha de llegada.</p>';
    if (hacerScroll && tarjetaReserva) {
      tarjetaReserva.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // Cálculo del total
  const total = noches * PRECIO_POR_NOCHE;

  resumenContainer.innerHTML = `
    <p><strong>$${PRECIO_POR_NOCHE} USD</strong> x ${noches} noches</p>
    <p style="margin-top:5px; font-size:1.1rem; color: #222;"><strong>Total: $${total} USD</strong></p>
  `;

  // Direcciona/desplaza a la caja de reserva
  if (hacerScroll && tarjetaReserva) {
    tarjetaReserva.scrollIntoView({ behavior: 'smooth' });
  }
}

// Inicializadores
document.addEventListener('DOMContentLoaded', () => {
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');

  if (checkinInput) {
    checkinInput.addEventListener('change', () => calcularTotal(false));
  }
  if (checkoutInput) {
    checkoutInput.addEventListener('change', () => calcularTotal(false));
  }
});

// Manejo del envío (Netlify + WhatsApp + Redirección)
function realizarReserva(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const checkinVal = document.getElementById('checkin')?.value;
  const checkoutVal = document.getElementById('checkout')?.value;
  const huespedesVal = document.getElementById('huespedes')?.value || "1";

  if (!checkinVal || !checkoutVal) {
    alert("Por favor selecciona las fechas de llegada y salida antes de reservar.");
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Se adjuntan los campos adicionales al payload de Netlify
  formData.append('checkin', checkinVal);
  formData.append('checkout', checkoutVal);
  formData.append('huespedes', huespedesVal);

  // 1. Envío asíncrono a Netlify Forms (esto dispara las notificaciones por Email en Netlify)
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString()
  })
  .then(() => {
    // 2. Feedback visual en la interfaz
    const resumenContainer = document.getElementById('resumen-precio');
    if (resumenContainer) {
      resumenContainer.innerHTML = `
        <div style="background: #e6f4ea; border: 1px solid #34a853; padding: 10px; border-radius: 6px; color: #137333; font-weight: bold; margin-bottom: 10px;">
          ¡Solicitud enviada! Redirigiendo a WhatsApp...
        </div>
      `;
    }

    // 3. Notificación y redirección a WhatsApp
    const nombreVal = document.getElementById('nombre_completo')?.value || "";
    const correoVal = document.getElementById('correo_electronico')?.value || "";

    const mensaje = `¡Hola! Acabo de realizar una solicitud de reserva desde la web:%0A` +
      `👤 *Nombre:* ${encodeURIComponent(nombreVal)}%0A` +
      `✉️ *Correo:* ${encodeURIComponent(correoVal)}%0A` +
      `📅 *Llegada:* ${checkinVal}%0A` +
      `📅 *Salida:* ${checkoutVal}%0A` +
      `👥 *Huéspedes:* ${huespedesVal}`;

    const urlWhatsApp = `https://wa.me/${MI_WHATSAPP}?text=${mensaje}`;
    
    // Redirecciona la pestaña actual hacia WhatsApp
    window.location.href = urlWhatsApp;
  })
  .catch((error) => console.error("Error al procesar el formulario:", error));
}