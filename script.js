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
const paymentArea = document.getElementById("payment-area");
const confirmacion = document.getElementById("confirmacion");

function mostrarProductos(filtro = "todos") {
  contenedorProductos.innerHTML = "";
  const productosFiltrados = filtro === "todos" ? productos : productos.filter(p => p.categoria === filtro);

  productosFiltrados.forEach(prod => {
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
  const productoExistente = carrito.find(p => p.id === id);
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    const producto = productos.find(p => p.id === id);
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    totalItems += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  document.querySelector(".carrito h2").textContent = `🧾 Carrito de Compras (${totalItems})`;

  paymentArea.style.display = carrito.length > 0 ? "block" : "none";
}

function vaciarCarrito() {
  if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
    carrito.length = 0;
    actualizarCarrito();
  }
}

document.getElementById("btn-paypal").onclick = function() {
  confirmacion.style.display = "block";
};
document.getElementById("btn-card").onclick = function() {
  confirmacion.style.display = "block";
};

filtroCategoria.addEventListener("change", e => mostrarProductos(e.target.value));

mostrarProductos();
