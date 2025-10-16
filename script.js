const productos = [
  { id: 1, nombre: "Cinturon de Levantamiento", precio: 35.00, imagen: "https://media.falabella.com/falabellaCO/140909162_01/w=1500,h=1500,fit=pad", categoria: "Accesorios" },
  { id: 2, nombre: "Magnesio Liquido", precio: 50.00, imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now01288/l/14.jpg", categoria: "Suplementos" },
  { id: 3, nombre: "Straps", precio: 30.00, imagen: "https://contents.mediadecathlon.com/p2720151/k$5222640a73abcde5e5f703d80b05079f/lifting-strap-peso-muerto-correas-levantamiento-pesas-powerlifting.jpg", categoria: "Accesorios" },
  { id: 4, nombre: "Creatina", precio: 18.00, imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/opn/opn02135/l/8.jpg", categoria: "Suplementos" },
  { id: 5, nombre: "Proteína", precio: 22.00, imagen: "https://www.optimumnutrition.com.co/wp-content/uploads/2023/08/gold-standard-5-lb-french-vanilla.jpg", categoria: "Suplementos" }
];

const carrito = [];
const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const filtro = document.getElementById("filtro");
const paymentArea = document.getElementById('payment-area');
const confirmContainer = document.getElementById('confirm-container');

function mostrarProductos(categoria = 'all') {
  contenedorProductos.innerHTML = '';
  const lista = productos.filter(p => categoria === 'all' ? true : p.categoria === categoria);
  if (lista.length === 0) {
    contenedorProductos.innerHTML = '<p>No hay productos en esta categoría.</p>';
    return;
  }

  lista.forEach(prod => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <p style="font-size:0.85em; color:#666">Categoría: ${prod.categoria}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

filtro.addEventListener('change', () => mostrarProductos(filtro.value));

function agregarAlCarrito(id) {
  const productoExistente = carrito.find(p => p.id === id);
  if (productoExistente) productoExistente.cantidad++;
  else {
    const producto = productos.find(p => p.id === id);
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = '';
  let total = 0;
  let totalItems = 0;

  carrito.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    totalItems += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  actualizarTituloCarrito(totalItems);
  renderizarBotonPayPalIfReady();
}

function actualizarTituloCarrito(cantidad) {
  const titulo = document.querySelector('.carrito h2');
  titulo.textContent = `🧾 Carrito de Compras (${cantidad})`;
}

function vaciarCarrito() {
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    carrito.length = 0;
    actualizarCarrito();
  }
}

document.getElementById('btn-finalizar').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío. Agrega productos antes de finalizar la compra.');
    return;
  }
  paymentArea.style.display = 'block';
  paymentArea.setAttribute('aria-hidden', 'false');
  renderizarBotonPayPalIfReady();
  paymentArea.scrollIntoView({ behavior: 'smooth' });
});

function confirmarPago(mensaje) {
  confirmContainer.innerHTML = `<div class="confirm-msg">${mensaje}</div>`;
  carrito.length = 0;
  actualizarCarrito();
  setTimeout(() => { paymentArea.style.display = 'none'; paymentArea.setAttribute('aria-hidden', 'true'); confirmContainer.innerHTML = ''; }, 3000);
}

function pagarConTarjetaSimulada() {
  const num = document.getElementById('card-number').value.trim();
  const exp = document.getElementById('card-exp').value.trim();
  const cvv = document.getElementById('card-cvv').value.trim();
  if (!num || !exp || !cvv) { alert('Complete los datos de la tarjeta (simulación).'); return; }
  if (num.length < 12) { alert('Número de tarjeta simulado inválido.'); return; }

  confirmarPago('Pago con tarjeta simulado exitoso. Gracias por su compra.');
  alert('🎉 Pago simulado exitoso — se ha enviado una confirmación por correo (simulado).');
}

// PayPal SDK
(function cargarPayPalSDK() {
  const script = document.createElement('script');
  script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
  script.onload = () => { renderizarBotonPayPalIfReady(); };
  script.onerror = () => { renderizarBotonPayPalIfReady(); };
  document.head.appendChild(script);
})();

function renderizarBotonPayPalIfReady() {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';
  if (typeof paypal !== 'undefined' && paypal.Buttons && carrito.length > 0) {
    try {
      paypal.Buttons({
        createOrder: function(data, actions) {
          const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0).toFixed(2);
          return actions.order.create({ purchase_units: [{ amount: { value: total } }] });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function() {
            confirmarPago('Pago con PayPal (sandbox) exitoso. Gracias por su compra.');
            alert('🎉 Pago con PayPal completado (sandbox).');
          });
        },
        onError: function() {
          renderizarBotonPayPalSimulado();
        }
      }).render('#paypal-button-container');
    } catch {
      renderizarBotonPayPalSimulado();
    }
  } else {
    renderizarBotonPayPalSimulado();
  }
}

function renderizarBotonPayPalSimulado() {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';
  const btn = document.createElement('button');
  btn.textContent = 'Pagar con PayPal (Simulado)';
  btn.style.padding = '10px 12px';
  btn.style.borderRadius = '6px';
  btn.style.border = 'none';
  btn.onclick = () => {
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0).toFixed(2);
    if (!confirm(`Simular pago por $${total} con PayPal?`)) return;
    confirmarPago('Pago con PayPal simulado exitoso. Gracias por su compra.');
    alert('🎉 Pago con PayPal simulado exitoso.');
  };
  container.appendChild(btn);
}

mostrarProductos();
actualizarCarrito();
