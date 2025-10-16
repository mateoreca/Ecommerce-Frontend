const productos = [
  {
    id: 1,
    nombre: "Cinturon de Levantamiento",
    precio: 35.00,
    categoria: "Accesorios",
    imagen: "https://media.falabella.com/falabellaCO/140909162_01/w=1500,h=1500,fit=pad"
  },
  {
    id: 2,
    nombre: "Magnesio Liquido",
    precio: 50.00,
    categoria: "Suplementos",
    imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now01288/l/14.jpg"
  },
  {
    id: 3,
    nombre: "Straps",
    precio: 30.00,
    categoria: "Accesorios",
    imagen: "https://contents.mediadecathlon.com/p2720151/k$5222640a73abcde5e5f703d80b05079f/lifting-strap-peso-muerto-correas-levantamiento-pesas-powerlifting.jpg"
  },
  {
    id: 4,
    nombre: "Creatina",
    precio: 18.00,
    categoria: "Suplementos",
    imagen: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/opn/opn02135/l/8.jpg"
  },
  {
    id: 5,
    nombre: "Proteína",
    precio: 22.00,
    categoria: "Suplementos",
    imagen: "https://www.optimumnutrition.com.co/wp-content/uploads/2023/08/gold-standard-5-lb-french-vanilla.jpg"
  }
];

const carrito = [];

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const filtro = document.getElementById("filtro-categoria");
const paymentArea = document.getElementById("payment-area");
const confirmMsg = document.getElementById("confirm-msg");

function mostrarProductos(categoriaSeleccionada = "todas") {
  contenedorProductos.innerHTML = "";
  const productosFiltrados =
    categoriaSeleccionada === "todas"
      ? productos
      : productos.filter(p => p.categoria === categoriaSeleccionada);

  productosFiltrados.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <p>Categoría: ${prod.categoria}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

filtro.addEventListener("change", e => {
  mostrarProductos(e.target.value);
});

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
}

function vaciarCarrito() {
  if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
    carrito.length = 0;
    actualizarCarrito();
  }
}

document.getElementById("finalizar").addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
    return;
  }
  paymentArea.style.display = "block";
});

function simularPago() {
  confirmMsg.style.display = "block";
  carrito.length = 0;
  actualizarCarrito();
  setTimeout(() => {
    confirmMsg.style.display = "none";
    paymentArea.style.display = "none";
  }, 3000);
}

if (window.paypal) {
  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: { value: totalCarrito.textContent }
        }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(() => {
        confirmMsg.style.display = "block";
        carrito.length = 0;
        actualizarCarrito();
        setTimeout(() => {
          confirmMsg.style.display = "none";
          paymentArea.style.display = "none";
        }, 3000);
      });
    }
  }).render('#paypal-button-container');
}

mostrarProductos();
