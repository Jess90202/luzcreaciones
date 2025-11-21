let productosData = [];
let categoriaActual = "todas";

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

  const buscador = document.getElementById("buscador");
  const texto = buscador ? buscador.value.trim() : "";

  contenedor.innerHTML = "";

  const filtrados = productosData.filter(p => coincideFiltro(p, categoriaActual, texto));

  if (filtrados.length === 0) {
    if (sinResultados) sinResultados.style.display = "block";
    return;
  } else if (sinResultados) {
    sinResultados.style.display = "none";
  }

  filtrados.forEach(p => {
    const chipClass = p.categoria === "madera" ? "chip-categoria madera" : "chip-categoria";
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <span class="${chipClass}">
        ${p.categoria === "madera" ? "Madera" : "Bisutería"}
      </span>
      <div class="image-frame">
        <img src="${p.imagen}" alt="${p.nombre || ""}" class="zoomable-img" draggable="false" oncontextmenu="return false;">
      </div>
      <h3>${p.nombre || ""}</h3>
      <div class="precio">$${p.precio}</div>
      <p>${p.descripcion || ""}</p>
      <a class="btn btn-whatsapp"
         href="https://wa.me/525548270460?text=${"${encodeURIComponent('Hola, me interesa el producto: ' + (p.nombre || ''))}"}"
         target="_blank">
        <span class="icon-circle">💬</span>
        <span>Pedir por WhatsApp</span>
      </a>
    `;

    contenedor.appendChild(card);
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
    productosData = (data && data.productos) ? data.productos : [];
    renderCatalogo();
  } catch (e) {
    console.error("Error cargando catálogo", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Píldoras de categoría
  const pills = document.querySelectorAll(".cat-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      categoriaActual = pill.getAttribute("data-cat") || "todas";
      renderCatalogo();
    });
  });

  // Buscador
  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", () => {
      renderCatalogo();
    });
  }

  // Navegación Inicio / Contacto + filtros
  const navInicio = document.getElementById("navInicio");
  const navContacto = document.getElementById("navContacto");
  const contactoSection = document.getElementById("contacto");
  const productosSection = document.getElementById("productos");
  const filtersBar = document.querySelector(".filters-bar");

  function mostrarInicio() {
    if (contactoSection) contactoSection.style.display = "none";
    if (productosSection) productosSection.style.display = "grid";
    if (filtersBar) filtersBar.style.display = "block";
    if (navInicio) navInicio.classList.add("active");
    if (navContacto) navContacto.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function mostrarContacto() {
    if (contactoSection) contactoSection.style.display = "block";
    if (productosSection) productosSection.style.display = "none";
    if (filtersBar) filtersBar.style.display = "none";
    if (navContacto) navContacto.classList.add("active");
    if (navInicio) navInicio.classList.remove("active");
    const contacto = document.getElementById("contacto");
    if (contacto) {
      contacto.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (navInicio) {
    navInicio.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarInicio();
    });
  }
  if (navContacto) {
    navContacto.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarContacto();
    });
  }

  // Zoom de imágenes
  const overlay = document.getElementById("imageOverlay");
  const overlayImg = document.getElementById("overlayImg");
  const overlayClose = document.getElementById("overlayClose");

  function cerrarOverlay() {
    if (!overlay || !overlayImg) return;
    overlay.style.display = "none";
    overlayImg.src = "";
  }

  document.body.addEventListener("click", (e) => {
    const img = e.target.closest(".zoomable-img");
    if (img && overlay && overlayImg) {
      overlayImg.src = img.src;
      overlay.style.display = "flex";
      return;
    }
    if (e.target === overlay || e.target.classList.contains("image-overlay-backdrop")) {
      cerrarOverlay();
    }
  });

  if (overlayClose) {
    overlayClose.addEventListener("click", (e) => {
      e.stopPropagation();
      cerrarOverlay();
    });
  }

  // Desactivar clic derecho y arrastrar en imágenes
  document.addEventListener("contextmenu", (e) => {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
    }
  });
  document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
    }
  });

  cargarCatalogo();
});
