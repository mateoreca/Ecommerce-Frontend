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

function mostrarProductos(filtro = "todos") {
  contenedorProductos.innerHTML = "";
  const lista = filtro === "todos" ? productos : productos.filter(p => p.categoria === filtro);
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

function agregarAlCarrito(id) {
  const existente = carrito.find(p => p.id === id);
  if (existente) existente.cantidad++;
  else carrito.push({ ...productos.find(p => p.id === id), cantidad: 1 });
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  carrito.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
  });
  totalCarrito.textContent = total.toFixed(2);
  paymentArea.style.display = carrito.length > 0 ? "block" : "none";
  renderPayPal();
}

function vaciarCarrito() {
  carrito.length = 0;
  actualizarCarrito();
}

filtroCategoria.addEventListener("change", e => mostrarProductos(e.target.value));
finalizarBtn.addEventListener("click", () => {
  if (carrito.length === 0) return alert("Carrito vacío");
  paymentArea.style.display = "block";
  renderPayPal();
});

/* PAYPAL (real) */
function calcularTotal() {
  return carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0).toFixed(2);
}

function renderPayPal() {
  paypalContainer.innerHTML = "";
  if (!paypal || carrito.length === 0) return;

  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{ amount: { value: calcularTotal() } }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(details => {
        procesarPagoExitoso(`Pago aprobado por ${details.payer.name.given_name}`);
      });
    }
  }).render('#paypal-button-container');
}

/* Pago con tarjeta (simulado) */
payCardBtn.addEventListener("click", () => {
  const num = document.getElementById("card-number").value.trim();
  const name = document.getElementById("card-name").value.trim();
  const exp = document.getElementById("card-exp").value.trim();
  const cvv = document.getElementById("card-cvv").value.trim();
  if (!num || !name || !exp || !cvv) return alert("Complete los datos.");
  procesarPagoExitoso("Pago con tarjeta exitoso (simulado).");
});

function procesarPagoExitoso(msg) {
  confirmMsg.textContent = "✅ " + msg;
  confirmMsg.style.display = "block";
  carrito.length = 0;
  actualizarCarrito();
  setTimeout(() => confirmMsg.style.display = "none", 3000);
}

mostrarProductos();
