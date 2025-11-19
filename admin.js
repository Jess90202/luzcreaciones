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

const storage = firebase.storage();
const auth = firebase.auth();
const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

document.getElementById("btnLogin").onclick = () => {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

auth.onAuthStateChanged(user => {
  if (user) {
    if (loginSection) loginSection.style.display = "none";
    if (adminSection) adminSection.style.display = "block";
    cargarProductosAdmin();
  } else {
    if (loginSection) loginSection.style.display = "block";
    if (adminSection) adminSection.style.display = "none";
  }
});

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const archivo = document.getElementById("imagen").files[0];
  const nombre = document.getElementById("nombre").value;
  const precio = document.getElementById("precio").value;
  const descripcion = document.getElementById("descripcion").value;
  const categoria = document.getElementById("categoria").value;

  if (!archivo) {
    alert("Por favor selecciona una imagen.");
    return;
  }

  const ref = storage.ref("productos/" + Date.now() + "_" + archivo.name);
  await ref.put(archivo);
  const imagenURL = await ref.getDownloadURL();

  await db.collection("productos").add({
    nombre,
    precio,
    descripcion,
    categoria,
    imagenURL,
    timestamp: Date.now()
  });

  alert("Producto guardado");
  document.getElementById("formProducto").reset();
  cargarProductosAdmin();
});

async function cargarProductosAdmin() {
  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  const snapshot = await db.collection("productos").orderBy("timestamp", "desc").get();
  snapshot.forEach(doc => {
    const p = doc.data();
    contenedor.innerHTML += `
      <div class="admin-card">
        <img src="${p.imagenURL}" alt="${p.nombre || ""}">
        <div>
          <strong>${p.nombre || ""}</strong>
          <span>$${p.precio}</span><br>
          <small>${p.categoria === "madera" ? "Madera" : "Bisutería"}</small>
        </div>
        <button onclick="eliminarProducto('${doc.id}','${p.imagenURL}')">Eliminar</button>
      </div>
    `;
  });
}

async function eliminarProducto(id, url) {
  if (!confirm("¿Eliminar producto?")) return;
  const ref = storage.refFromURL(url);
  await ref.delete();
  await db.collection("productos").doc(id).delete();
  cargarProductosAdmin();
}
