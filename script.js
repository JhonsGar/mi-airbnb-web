const PRECIO_POR_NOCHE = 85;
const MI_WHATSAPP = "18296350305";

// Función para calcular total y actualizar el resumen detallado dentro de la tarjeta
function calcularTotal(hacerScroll = false) {
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const huespedesInput = document.getElementById('huespedes');
  
  const resumenContainer = document.getElementById('resumen-precio');
  const resultadoBusquedaContainer = document.getElementById('resultado-busqueda');
  const tarjetaReserva = document.getElementById('reservar');

  if (!checkinInput || !checkoutInput) return;

  const checkinVal = checkinInput.value;
  const checkoutVal = checkoutInput.value;
  const huespedesVal = huespedesInput ? huespedesInput.value : "1";

  // Validación si no se han elegido fechas
  if (!checkinVal || !checkoutVal) {
    const errorMsg = '<p style="color: #e00b41; font-weight: bold; font-size: 0.9rem;">⚠️ Selecciona las fechas de llegada y salida para ver el desglose.</p>';
    if (resumenContainer) resumenContainer.innerHTML = errorMsg;
    if (resultadoBusquedaContainer) resultadoBusquedaContainer.innerHTML = errorMsg;

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

  if (noches <= 0) {
    const errorMsg = '<p style="color: #e00b41; font-weight: bold; font-size: 0.9rem;">⚠️ La fecha de salida debe ser posterior a la de llegada.</p>';
    if (resumenContainer) resumenContainer.innerHTML = errorMsg;
    if (resultadoBusquedaContainer) resultadoBusquedaContainer.innerHTML = errorMsg;

    if (hacerScroll && tarjetaReserva) {
      tarjetaReserva.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // Cálculo del total
  const total = noches * PRECIO_POR_NOCHE;

  // Formatear fechas para lectura clara (DD/MM/AAAA)
  const fLlegada = `${dayIn}/${monthIn}/${yearIn}`;
  const fSalida = `${dayOut}/${monthOut}/${yearOut}`;

  // Desglose completo en HTML
  const htmlDetalle = `
    <div style="text-align: left; font-size: 0.92rem; color: #333; line-height: 1.5;">
      <p style="margin: 3px 0;">👥 <strong>Huéspedes:</strong> ${huespedesVal} ${huespedesVal === "1" ? "persona" : "personas"}</p>
      <p style="margin: 3px 0;">🏠 <strong>Alojamiento:</strong> Villa Completa (2 Hab.)</p>
      <p style="margin: 3px 0;">📅 <strong>Fechas:</strong> ${fLlegada} al ${fSalida}</p>
      <p style="margin: 3px 0;">🌙 <strong>Estadía:</strong> ${noches} ${noches === 1 ? 'noche' : 'noches'}</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 8px 0;">
      <p style="margin: 3px 0; font-size: 0.9rem;">$${PRECIO_POR_NOCHE} USD x ${noches} ${noches === 1 ? 'noche' : 'noches'}</p>
      <p style="margin-top: 5px; font-size: 1.15rem; color: #008489;"><strong>Total: $${total} USD</strong></p>
    </div>
  `;

  if (resumenContainer) resumenContainer.innerHTML = htmlDetalle;
  if (resultadoBusquedaContainer) resultadoBusquedaContainer.innerHTML = htmlDetalle;

  if (hacerScroll && tarjetaReserva) {
    tarjetaReserva.scrollIntoView({ behavior: 'smooth' });
  }
}

// Inicializadores
document.addEventListener('DOMContentLoaded', () => {
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const huespedesInput = document.getElementById('huespedes');

  if (checkinInput) {
    checkinInput.addEventListener('change', () => calcularTotal(false));
  }
  if (checkoutInput) {
    checkoutInput.addEventListener('change', () => calcularTotal(false));
  }
  if (huespedesInput) {
    huespedesInput.addEventListener('change', () => calcularTotal(false));
  }
});

// Manejo del envío del formulario (Netlify Forms + WhatsApp)
function realizarReserva(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const checkinVal = document.getElementById('checkin')?.value;
  const checkoutVal = document.getElementById('checkout')?.value;
  const huespedesVal = document.getElementById('huespedes')?.value || "1";
  const telefonoVal = document.getElementById('telefono_cliente')?.value || "";

  if (!checkinVal || !checkoutVal) {
    alert("Por favor selecciona las fechas de llegada y salida antes de reservar.");
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Adjuntar los campos dinámicos al payload de envío
  formData.append('checkin', checkinVal);
  formData.append('checkout', checkoutVal);
  formData.append('huespedes', huespedesVal);

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString()
  })
  .then(() => {
    const resumenContainer = document.getElementById('resumen-precio');
    if (resumenContainer) {
      resumenContainer.innerHTML = `
        <div style="background: #e6f4ea; border: 1px solid #34a853; padding: 10px; border-radius: 6px; color: #137333; font-weight: bold; margin-bottom: 10px;">
          ¡Solicitud registrada! Redirigiendo a WhatsApp...
        </div>
      `;
    }

    const nombreVal = document.getElementById('nombre_completo')?.value || "";
    const correoVal = document.getElementById('correo_electronico')?.value || "";

    const mensaje = `¡Hola! Acabo de realizar una solicitud de reserva desde la web:%0A` +
      `👤 *Nombre:* ${encodeURIComponent(nombreVal)}%0A` +
      `✉️ *Correo:* ${encodeURIComponent(correoVal)}%0A` +
      `📞 *Teléfono:* ${encodeURIComponent(telefonoVal)}%0A` +
      `📅 *Llegada:* ${checkinVal}%0A` +
      `📅 *Salida:* ${checkoutVal}%0A` +
      `👥 *Huéspedes:* ${huespedesVal}`;

    const urlWhatsApp = `https://wa.me/${MI_WHATSAPP}?text=${mensaje}`;
    
    window.location.href = urlWhatsApp;
  })
  .catch((error) => console.error("Error al procesar el formulario:", error));
}