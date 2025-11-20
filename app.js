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
        <img src="${p.imagen}" alt="${p.nombre || ""}">
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
  try {
    const res = await fetch("data/productos.json?cache=" + Date.now());
    if (!res.ok) {
      console.error("No se pudo cargar productos.json");
      return;
    }
    const data = await res.json();
    productosData = data.productos || [];
    renderCatalogo();
  } catch (e) {
    console.error("Error cargando catálogo", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const categoriaSelect = document.getElementById("categoriaSelect");
  const buscador = document.getElementById("buscador");

  if (categoriaSelect) {
    categoriaSelect.addEventListener("change", renderCatalogo);
  }
  if (buscador) {
    buscador.addEventListener("input", () => {
      renderCatalogo();
    });
  }

  cargarCatalogo();
});
