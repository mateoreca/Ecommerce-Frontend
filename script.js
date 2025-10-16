/* script.js — Versión corregida: asegura binding después de DOMContentLoaded,
   validaciones claras y fallback si algún elemento falta. */

/* Datos de productos */
const productos = [
  { id: 1, nombre: "Cinturón de Levantamiento", precio: 35.00, imagen: "https://media.falabella.com/falabellaCO/140909162_01/w=1500,h=1500,fit=pad", categoria: "accesorios" },
  { id: 2, nombre: "Magnesio Líquido", precio: 50.00, imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now01288/l/14.jpg", categoria: "suplementos" },
  { id: 3, nombre: "Straps", precio: 30.00, imagen: "https://contents.mediadecathlon.com/p2720151/k$5222640a73abcde5e5f703d80b05079f/lifting-strap-peso-muerto-correas-levantamiento-pesas-powerlifting.jpg", categoria: "accesorios" },
  { id: 4, nombre: "Creatina", precio: 18.00, imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/opn/opn02135/l/8.jpg", categoria: "suplementos" },
  { id: 5, nombre: "Proteína", precio: 22.00, imagen: "https://www.optimumnutrition.com.co/wp-content/uploads/2023/08/gold-standard-5-lb-french-vanilla.jpg", categoria: "suplementos" }
];

let carrito = [];

/* Inicializa todo cuando el DOM esté listo */
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM (después del DOMContentLoaded ya existen)
  const contenedorProductos = document.getElementById("productos");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const finalizarBtn = document.getElementById("finalizar");
  const paymentArea = document.getElementById("payment-area");
  const paypalContainer = document.getElementById("paypal-button-container");
  const confirmMsg = document.getElementById("confirm-msg");

  // Inputs de tarjeta
  const inputCardNumber = document.getElementById("card-number");
  const inputCardName = document.getElementById("card-name");
  const inputCardExp = document.getElementById("card-exp");
  const inputCardCvv = document.getElementById("card-cvv");
  const payCardBtn = document.getElementById("pay-card-btn");

  if (!contenedorProductos || !listaCarrito || !totalCarrito) {
    console.error("Elementos clave no encontrados en el DOM. Revisa index.html");
    return;
  }

  /* Funciones UI */
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
        <button data-id="${prod.id}" class="btn-add">Agregar al carrito</button>
      `;
      contenedorProductos.appendChild(div);
    });

    // Delegación: asignar listeners a los botones agregados
    contenedorProductos.querySelectorAll('.btn-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
        agregarAlCarrito(id);
      });
    });
  }

  function agregarAlCarrito(id) {
    const existente = carrito.find(p => p.id === id);
    if (existente) existente.cantidad++;
    else {
      const producto = productos.find(p => p.id === id);
      if (!producto) return;
      carrito.push({ ...producto, cantidad: 1 });
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
    const tituloCarrito = document.querySelector(".carrito h2");
    if (tituloCarrito) tituloCarrito.textContent = `🧾 Carrito de Compras (${items})`;

    // Mostrar/ocultar área de pago y renderizar PayPal si corresponde
    paymentArea.style.display = carrito.length > 0 ? "block" : "none";
    renderPayPal();
  }

  function vaciarCarrito() {
    if (!confirm("¿Estás seguro de que quieres vaciar el carrito?")) return;
    carrito = [];
    actualizarCarrito();
  }

  /* Eventos UI */
  filtroCategoria.addEventListener("change", (e) => mostrarProductos(e.target.value));
  finalizarBtn.addEventListener("click", () => {
    if (carrito.length === 0) return alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
    paymentArea.style.display = "block";
    renderPayPal();
  });

  /* PAYPAL (real) */
  function calcularTotal() {
    return carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0).toFixed(2);
  }

  // Renderiza botón PayPal si el SDK está disponible; si no, muestra mensaje
  function renderPayPal() {
    paypalContainer.innerHTML = "";
    if (carrito.length === 0) {
      paypalContainer.innerHTML = "<small style='color:#666'>Agrega productos para habilitar PayPal.</small>";
      return;
    }
    if (typeof paypal !== "undefined" && paypal.Buttons) {
      try {
        paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{ amount: { value: calcularTotal() } }]
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
              procesarPagoExitoso("Pago con PayPal (sandbox) exitoso. Gracias por su compra.");
            });
          },
          onError: err => {
            console.error("Error PayPal:", err);
            paypalContainer.innerHTML = "<small style='color:#c00'>Error al cargar PayPal. Intenta de nuevo.</small>";
          }
        }).render('#paypal-button-container');
      } catch (e) {
        console.warn("Fallo render PayPal:", e);
        paypalContainer.innerHTML = "<small style='color:#c00'>No se pudo mostrar PayPal.</small>";
      }
    } else {
      // SDK no cargado: mensaje claro (no fallback automático)
      paypalContainer.innerHTML = "<small style='color:#666'>SDK de PayPal no disponible; recarga la página o verifica la conexión.</small>";
      console.warn("PayPal SDK no detectado en window.paypal.");
    }
  }

  /* Pago con tarjeta (simulado) — ahora con binding seguro y validaciones */
  if (payCardBtn) {
    payCardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Validaciones básicas
      const num = inputCardNumber ? inputCardNumber.value.trim() : "";
      const name = inputCardName ? inputCardName.value.trim() : "";
      const exp = inputCardExp ? inputCardExp.value.trim() : "";
      const cvv = inputCardCvv ? inputCardCvv.value.trim() : "";

      if (!num || !name || !exp || !cvv) {
        alert("Complete todos los campos de la tarjeta (simulación).");
        return;
      }
      // formato mínimo para número (solo dígitos)
      const digits = num.replace(/\D/g, '');
      if (digits.length < 12) {
        alert("Número de tarjeta simulado inválido (mínimo 12 dígitos).");
        return;
      }

      // Simular procesamiento (puedes añadir más checks aquí)
      procesarPagoExitoso("Pago con tarjeta simulado exitoso. Gracias por su compra.");
    });
  } else {
    console.warn("Botón de pago con tarjeta (pay-card-btn) no encontrado.");
  }

  /* Procesar pago exitoso: mensaje, limpiar carrito */
  function procesarPagoExitoso(mensaje) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.textContent = "✅ " + mensaje;
    } else {
      alert(mensaje);
    }
    carrito = [];
    actualizarCarrito();
    setTimeout(() => {
      if (confirmMsg) confirmMsg.style.display = "none";
      paymentArea.style.display = "none";
    }, 2500);
  }

  /* Inicializa viewport */
  mostrarProductos();
  actualizarCarrito();

  /* Exponer funciones útiles en window para debugging (opcional) */
  window._gf = {
    productos, carrito, agregarAlCarrito, vaciarCarrito, calcularTotal
  };
});
