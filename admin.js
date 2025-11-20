// Configura aquí tu repo
const GITHUB_OWNER = "jess90202";
const GITHUB_REPO = "luzcreaciones";
const GITHUB_BRANCH = "main"; // Cambia a "master" si tu rama se llama así

const TOKEN_KEY = "luzcreaciones_github_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function ensureToken() {
  const token = getToken();
  if (!token) {
    alert("Ingresa y guarda tu token de GitHub primero.");
    throw new Error("Sin token");
  }
  return token;
}

async function githubRequest(path, method = "GET", body = null) {
  const token = ensureToken();
  const headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": "Bearer " + token
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch("https://api.github.com" + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("GitHub error", res.status, text);
    throw new Error("Error GitHub: " + res.status);
  }
  return res.json();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Cargar y guardar productos.json

async function loadProductosJson() {
  try {
    const data = await githubRequest(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/productos.json?ref=${GITHUB_BRANCH}`
    );
    const content = atob(data.content.replace(/\n/g, ""));
    const json = JSON.parse(content);
    return { json, sha: data.sha };
  } catch (e) {
    console.warn("No existe productos.json, creando uno nuevo");
    return { json: { productos: [] }, sha: null };
  }
}

async function saveProductosJson(json, sha) {
  const content = btoa(JSON.stringify(json, null, 2));
  const body = {
    message: "Actualiza productos desde panel",
    content,
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha;

  return githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data/productos.json`,
    "PUT",
    body
  );
}

// Subir imagen y devolver ruta

async function uploadImage(file) {
  const base64 = await fileToBase64(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "_");
  const filename = Date.now() + "_" + safeName;
  const path = `images/${filename}`;

  const body = {
    message: "Sube imagen de producto desde panel",
    content: base64,
    branch: GITHUB_BRANCH
  };

  await githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    "PUT",
    body
  );

  // Ruta pública dentro del sitio
  return `images/${filename}`;
}

// Render lista admin

let productosState = [];
let productosSha = null;

function renderListaAdmin() {
  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (!productosState.length) {
    contenedor.innerHTML = "<p class='small'>Aún no hay productos guardados.</p>";
    return;
  }

  productosState.forEach((p, index) => {
    const catLabel = p.categoria === "madera" ? "Madera" : "Bisutería";
    contenedor.innerHTML += `
      <div class="admin-card">
        <img src="${p.imagen}" alt="${p.nombre || ""}">
        <div>
          <strong>${p.nombre || ""}</strong>
          <span>$${p.precio}</span><br>
          <small>${catLabel}</small>
        </div>
        <button onclick="eliminarProducto(${index})">Eliminar</button>
      </div>
    `;
  });
}

async function cargarProductosAdmin() {
  try {
    const { json, sha } = await loadProductosJson();
    productosState = json.productos || [];
    productosSha = sha;
    renderListaAdmin();
  } catch (e) {
    console.error("Error al cargar productos en admin", e);
  }
}

async function guardarNuevoProducto(e) {
  e.preventDefault();
  try {
    const file = document.getElementById("imagen").files[0];
    const nombre = document.getElementById("nombre").value.trim();
    const precio = document.getElementById("precio").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;

    if (!file) {
      alert("Selecciona una imagen.");
      return;
    }
    if (!nombre || !precio) {
      alert("Nombre y precio son obligatorios.");
      return;
    }

    const rutaImagen = await uploadImage(file);

    const nuevo = {
      id: Date.now(),
      nombre,
      precio: Number(precio),
      descripcion,
      categoria,
      imagen: rutaImagen
    };

    productosState.unshift(nuevo);

    const json = { productos: productosState };
    const result = await saveProductosJson(json, productosSha);
    productosSha = result.content.sha;

    document.getElementById("formProducto").reset();
    renderListaAdmin();
    alert("Producto guardado correctamente.");
  } catch (e) {
    console.error(e);
    alert("Hubo un problema al guardar el producto. Revisa la consola.");
  }
}

async function eliminarProducto(index) {
  if (!confirm("¿Eliminar este producto del catálogo?")) return;
  try {
    productosState.splice(index, 1);
    const json = { productos: productosState };
    const result = await saveProductosJson(json, productosSha);
    productosSha = result.content.sha;
    renderListaAdmin();
  } catch (e) {
    console.error(e);
    alert("No se pudo eliminar. Revisa la consola.");
  }
}

// Exponer para botón inline
window.eliminarProducto = eliminarProducto;

// Init
document.addEventListener("DOMContentLoaded", () => {
  const tokenInput = document.getElementById("githubToken");
  const btnGuardarToken = document.getElementById("btnGuardarToken");
  const btnBorrarToken = document.getElementById("btnBorrarToken");
  const formProducto = document.getElementById("formProducto");
  const adminSection = document.getElementById("admin-section");
  const loginCard = document.querySelector(".admin-login"); // tarjeta de login

  // Cargar token guardado (si hay)
  const savedToken = getToken();
  if (savedToken) {
    tokenInput.value = savedToken;
    if (loginCard) loginCard.style.display = "none";     // ocultar login
    if (adminSection) adminSection.style.display = "block";
    cargarProductosAdmin();
  }

  btnGuardarToken.addEventListener("click", () => {
    const token = tokenInput.value.trim();
    if (!token) {
      alert("Ingresa un token primero.");
      return;
    }
    setToken(token);
    if (loginCard) loginCard.style.display = "none";     // ocultar login
    if (adminSection) adminSection.style.display = "block";
    cargarProductosAdmin();
    alert("Token guardado en este navegador.");
  });

  btnBorrarToken.addEventListener("click", () => {
    clearToken();
    tokenInput.value = "";
    if (adminSection) adminSection.style.display = "none";
    if (loginCard) loginCard.style.display = "block";    // mostrar login otra vez
    alert("Token eliminado de este navegador.");
  });

  if (formProducto) {
    formProducto.addEventListener("submit", guardarNuevoProducto);
  }
});
