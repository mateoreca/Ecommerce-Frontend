/* Datos de productos */
const productos = [
  { id: 1, nombre: "Cinturón de Levantamiento", precio: 35.00, imagen: "https://media.falabella.com/falabellaCO/140909162_01/w=1500,h=1500,fit=pad", categoria: "accesorios" },
  { id: 2, nombre: "Magnesio Líquido", precio: 50.00, imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now01288/l/14.jpg", categoria: "suplementos" },
  { id: 3, nombre: "Straps", precio: 30.00, imagen: "https://contents.mediadecathlon.com/p2720151/k$5222640a73abcde5e5f703d80b05079f/lifting-strap-peso-muerto-correas-levantamiento-pesas-powerlifting.jpg", categoria: "accesorios" },
  { id: 4, nombre: "Creatina", precio: 18.00, imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/opn/opn02135/l/8.jpg", categoria: "suplementos" },
  { id: 5, nombre: "Proteína", precio: 22.00, imagen: "https://www.optimumnutrition.com.co/wp-content/uploads/2023/08/gold-standard-5-lb-french-vanilla.jpg", categoria: "suplementos" }
];

const carrito = [];
const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const filtroCategoria = document.getElementById("filtro-categoria");
const finalizarBtn = document.getElementById("finalizar");
const paymentArea = document.getElementById("payment-area");
const paypalContainer = document.getElementById("paypal-button-container");
const confirmMsg = document.getElementById("confirm-msg");
const payCardBtn = document.getElementById("pay-card-btn");

/* Mostrar productos (filtrado por categoría) */
function mostrarProductos(filtro = "todos") {
  contenedorProductos.innerHTML = "";
  const lista = filtro === "todos" ? productos : productos.filter(p => p.categoria === filtro);

  if (lista.length === 0) {
    contenedorProductos.innerHTML = "<p style='padding:12px;color:#666'>No hay productos para esta categoría.</p>";
    return;
  }

  lista.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

/* Carrito */
function agregarAlCarrito(id) {
  const existente = carrito.find(p => p.id === id);
  if (existente) existente.cantidad++;
  else {
    const prod = productos.find(p => p.id === id);
    carrito.push({ ...prod, cantidad: 1 });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let items = 0;
  carrito.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    items += item.cantidad;
  });
  totalCarrito.textContent = total.toFixed(2);
  document.querySelector(".carrito h2").textContent = `🧾 Carrito de Compras (${items})`;

  // Mostrar/ocultar área de pago y re-renderizar botón PayPal
  paymentArea.setAttribute("aria-hidden", carrito.length === 0 ? "true" : "false");
  paymentArea.style.display = carrito.length === 0 ? "none" : "block";
  renderPayPalIfReady();
}

/* Vaciar carrito */
function vaciarCarrito() {
  if (!confirm("¿Estás seguro de que quieres vaciar el carrito?")) return;
  carrito.length = 0;
  actualizarCarrito();
}

/* Evento filtro */
filtroCategoria.addEventListener("change", e => mostrarProductos(e.target.value));

/* Finalizar (muestra área de pago si hay items) */
finalizarBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
    return;
  }
  paymentArea.style.display = "block";
  paymentArea.setAttribute("aria-hidden","false");
  renderPayPalIfReady();
});

/* ======= PayPal integration (SDK sandbox + fallback) ======= */

/* Intentamos cargar SDK dinámicamente si no está presente (opcional) */
(function loadPayPalSDK(){
  if (window.paypal) { renderPayPalIfReady(); return; }
  const s = document.createElement('script');
  s.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
  s.onload = () => renderPayPalIfReady();
  s.onerror = () => renderSimulatedPayPalButton();
  document.head.appendChild(s);
})();

/* Calcula total */
function calcularTotal() {
  return carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0).toFixed(2);
}

/* Renderiza PayPal si está listo, sino botón simulado */
function renderPayPalIfReady() {
  paypalContainer.innerHTML = "";
  const total = calcularTotal();
  if (carrito.length === 0) {
    paypalContainer.innerHTML = "<small style='color:#666'>Agrega productos para habilitar PayPal.</small>";
    return;
  }

  if (typeof paypal !== "undefined" && paypal.Buttons) {
    try {
      paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: total } }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            procesarPagoExitoso("Pago con PayPal (sandbox) exitoso. Gracias por su compra.");
          });
        },
        onError: err => {
          console.error("PayPal error:", err);
          renderSimulatedPayPalButton();
        }
      }).render('#paypal-button-container');
    } catch (e) {
      console.warn("Error rendering paypal.buttons:", e);
      renderSimulatedPayPalButton();
    }
  } else {
    renderSimulatedPayPalButton();
  }
}

/* Botón simulado de PayPal (fallback) */
function renderSimulatedPayPalButton(){
  paypalContainer.innerHTML = "";
  const btn = document.createElement("button");
  btn.textContent = `Pagar con PayPal (Simulado) — $${calcularTotal()}`;
  btn.style.padding = "10px";
  btn.style.borderRadius = "8px";
  btn.style.border = "none";
  btn.style.background = "#28A745";
  btn.style.color = "#fff";
  btn.onclick = () => {
    if (!confirm(`Simular pago por $${calcularTotal()} con PayPal?`)) return;
    procesarPagoExitoso("Pago con PayPal simulado exitoso. Gracias por su compra.");
  };
  paypalContainer.appendChild(btn);
}

/* ======= Pago con tarjeta (simulado) ======= */
payCardBtn.addEventListener("click", () => {
  const num = document.getElementById("card-number").value.trim();
  const name = document.getElementById("card-name").value.trim();
  const exp = document.getElementById("card-exp").value.trim();
  const cvv = document.getElementById("card-cvv").value.trim();

  if (!num || !name || !exp || !cvv) {
    alert("Complete los datos de la tarjeta (simulación).");
    return;
  }
  if (num.replace(/\s+/g,'').length < 12) {
    alert("Número de tarjeta simulado inválido.");
    return;
  }

  // Simulación de verificación (no real)
  procesarPagoExitoso("Pago con tarjeta simulado exitoso. Gracias por su compra.");
});

/* ======= Resultado de pago exitoso ======= */
function procesarPagoExitoso(mensaje) {
  confirmMsg.style.display = "block";
  confirmMsg.textContent = "✅ " + mensaje;
  carrito.length = 0;
  actualizarCarrito();
  setTimeout(() => {
    confirmMsg.style.display = "none";
    paymentArea.style.display = "none";
  }, 2800);
}

/* Inicialización */
mostrarProductos();
actualizarCarrito();
