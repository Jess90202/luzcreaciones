const storage = firebase.storage();
const auth = firebase.auth();
const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");

document.getElementById("btnLogin").onclick = ()=>{
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

auth.onAuthStateChanged(user=>{
    if(user){
        loginSection.style.display="none";
        adminSection.style.display="block";
        cargarProductosAdmin();
    } else {
        loginSection.style.display="block";
        adminSection.style.display="none";
    }
});

document.getElementById("formProducto").addEventListener("submit", async(e)=>{
    e.preventDefault();
    const archivo = document.getElementById("imagen").files[0];
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;

    const ref = storage.ref("productos/"+archivo.name);
    await ref.put(archivo);
    const imagenURL = await ref.getDownloadURL();

    await db.collection("productos").add({
        nombre, precio, descripcion, categoria, imagenURL,
        timestamp: Date.now()
    });

    alert("Producto guardado");
    document.getElementById("formProducto").reset();
    cargarProductosAdmin();
});

async function cargarProductosAdmin(){
    const c = document.getElementById("listaProductos");
    c.innerHTML="";
    const snap = await db.collection("productos").orderBy("timestamp","desc").get();
    snap.forEach(doc=>{
        const p = doc.data();
        c.innerHTML += `
            <div class="admin-card">
                <img src="${p.imagenURL}">
                <strong>${p.nombre}</strong> $${p.precio}
                <button onclick="eliminarProducto('${doc.id}','${p.imagenURL}')">Eliminar</button>
            </div>`;
    });
}

async function eliminarProducto(id,url){
    if(!confirm("¿Eliminar producto?")) return;
    const ref = storage.refFromURL(url);
    await ref.delete();
    await db.collection("productos").doc(id).delete();
    cargarProductosAdmin();
}