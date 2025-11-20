/* TEMPLATE APP.JS WITH BEAUTIFUL WHATSAPP BUTTON */
/* Replace your WhatsApp part if needed */

function renderCatalogo() {
  const cont = document.getElementById("catalogo");
  cont.innerHTML = "";

  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <span class="chip-categoria ${p.categoria}">
        ${p.categoria === "madera" ? "Madera" : "Bisutería"}
      </span>

      <div class="image-frame">
        <img class="zoomable-img" src="${p.imagen}" alt="${p.nombre}">
      </div>

      <h3>${p.nombre}</h3>
      <p>${p.descripcion || ""}</p>
      <div class="precio">$${p.precio}</div>

      <a class="btn-whatsapp"
         href="https://wa.me/525548270460?text=${encodeURIComponent("Hola, me interesa el producto: " + p.nombre)}"
         target="_blank">
        <span class="icon-circle">💬</span>
        <span>Pedir por WhatsApp</span>
      </a>
    `;

    cont.appendChild(card);
  });
}
