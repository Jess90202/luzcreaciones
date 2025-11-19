const firebaseConfig = {
  apiKey: "AIzaSyAAW4DEpbdgChCELt7EuvxJ3lMXwwZCr5A",
  authDomain: "rich-tea-384802.firebaseapp.com",
  projectId: "rich-tea-384802",
  storageBucket: "rich-tea-384802.firebasestorage.app",
  messagingSenderId: "442145119011",
  appId: "1:442145119011:web:3045cf3b505c5190cb0a96",
  measurementId: "G-84BY3RD23Q"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let productosData = [];

function coincideFiltro(producto, categoria, texto) {
  const catOk = categoria === "todas" || producto.categoria === categoria;
  if (!catOk) return false;
  if (!texto) return true;
  const t = texto.toLowerCase();
  return (
    (producto.nombre || "").toLowerCase().includes(t) ||
    (producto.descripcion || "").toLowerCase().includes(t)
  );
}

function renderCatalogo() {
  const contenedor = document.getElementById("productos");
  const sinResultados = document.getElementById("sinResultados");
  if (!contenedor) return;

  const categoriaSelect = document.getElementById("categoriaSelect");
  const buscador = document.getElementById("buscador");

  const categoria = categoriaSelect ? categoriaSelect.value : "todas";
  const texto = buscador ? buscador.value.trim() : "";

  contenedor.innerHTML = "";

  const filtrados = productosData.filter(p => coincideFiltro(p, categoria, texto));

  if (filtrados.length === 0) {
    if (sinResultados) sinResultados.style.display = "block";
    return;
  } else if (sinResultados) {
    sinResultados.style.display = "none";
  }

  filtrados.forEach(p => {
    const chipClass = p.categoria === "madera" ? "chip-categoria madera" : "chip-categoria";
    contenedor.innerHTML += `
      <article class="card">
        <span class="${chipClass}">
          ${p.categoria === "madera" ? "Madera" : "Bisutería"}
        </span>
        <img src="${p.imagenURL}" alt="${p.nombre || ""}">
        <h3>${p.nombre || ""}</h3>
        <p class="precio">$${p.precio}</p>
        <p>${p.descripcion || ""}</p>
        <a class="btn btn-primary"
           href="https://wa.me/525548270460?text=${encodeURIComponent("Hola, me interesa el producto: " + (p.nombre || ""))}"
           target="_blank">
          Pedir por WhatsApp
        </a>
      </article>
    `;
  });
}

async function cargarCatalogo() {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  const snapshot = await db.collection("productos").orderBy("timestamp", "desc").get();
  productosData = [];
  snapshot.forEach(doc => {
    productosData.push(doc.data());
  });
  renderCatalogo();
}

document.addEventListener("DOMContentLoaded", () => {
  const categoriaSelect = document.getElementById("categoriaSelect");
  const buscador = document.getElementById("buscador");

  if (categoriaSelect) {
    categoriaSelect.addEventListener("change", renderCatalogo);
  }
  if (buscador) {
    buscador.addEventListener("input", () => {
      // pequeña espera opcional, pero aquí directo
      renderCatalogo();
    });
  }

  cargarCatalogo();
});
