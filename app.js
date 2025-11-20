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
        <div class="image-frame">
          <img src="${p.imagen}" alt="${p.nombre || ""}" class="zoomable-img" draggable="false">
        </div>
        <h3>${p.nombre || ""}</h3>
        <p class="precio">$${p.precio}</p>
        <p>${p.descripcion || ""}</p>
        <a class="btn btn-primary"
           href="https://wa.me/525548270460?text=${encodeURIComponent("Hola, me interesa el producto: " + (p.nombre || ""))}"
           target="_blank">
          <span class="icon">💬</span>Pedir por WhatsApp
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
    productosData = (data && data.productos) ? data.productos : [];
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

  // --- MOSTRAR / OCULTAR CONTACTO SEGÚN EL MENÚ ---
  const navInicio = document.getElementById("navInicio");
  const navContacto = document.getElementById("navContacto");
  const contactoSection = document.getElementById("contacto");

  function setActive(link) {
    if (!navInicio || !navContacto) return;
    navInicio.classList.remove("active");
    navContacto.classList.remove("active");
    link.classList.add("active");
  }

  if (navInicio && contactoSection) {
    navInicio.addEventListener("click", (e) => {
      e.preventDefault();
      // Ocultar sección de contacto y volver al catálogo
      contactoSection.style.display = "none";
      // Scroll hacia arriba
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Marcar activo
      setActive(navInicio);
      // Limpiar hash de la URL si estuviera
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname);
      }
    });
  }

  if (navContacto && contactoSection) {
    navContacto.addEventListener("click", (e) => {
      e.preventDefault();
      contactoSection.style.display = "block";
      contactoSection.scrollIntoView({ behavior: "smooth" });
      setActive(navContacto);
      // Actualizar hash
      history.replaceState(null, "", "#contacto");
    });

    // Si alguien entra directamente con #contacto en la URL
    if (window.location.hash === "#contacto") {
      contactoSection.style.display = "block";
      setTimeout(() => {
        contactoSection.scrollIntoView({ behavior: "smooth" });
      }, 100);
      setActive(navContacto);
    }
  }

  // --- ZOOM DE IMÁGENES ---
  const overlay = document.getElementById("imageOverlay");
  const overlayImg = document.getElementById("overlayImg");
  const overlayClose = document.getElementById("overlayClose");

  function cerrarOverlay() {
    if (!overlay || !overlayImg) return;
    overlay.style.display = "none";
    overlayImg.src = "";
  }

  if (overlay && overlayImg) {
    document.body.addEventListener("click", (e) => {
      const img = e.target.closest(".zoomable-img");
      if (img) {
        overlayImg.src = img.src;
        overlay.style.display = "flex";
        return;
      }
      // Cerrar si hacen click en el fondo oscuro
      if (e.target === overlay || e.target.classList.contains("image-overlay-backdrop")) {
        cerrarOverlay();
      }
    });
  }

  if (overlayClose) {
    overlayClose.addEventListener("click", (e) => {
      e.stopPropagation();
      cerrarOverlay();
    });
  }

  // --- DESACTIVAR CLIC DERECHO Y ARRASTRAR EN IMÁGENES ---
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
});
