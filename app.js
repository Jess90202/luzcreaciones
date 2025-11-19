const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
async function cargarCatalogo() {
    const c = document.getElementById("productos");
    if (!c) return;
    const snap = await db.collection("productos").orderBy("timestamp","desc").get();
    c.innerHTML = "";
    snap.forEach(doc=>{
        const p = doc.data();
        c.innerHTML += `
        <div class="card">
            <img src="${p.imagenURL}">
            <h3>${p.nombre}</h3>
            <p class="precio">$${p.precio}</p>
            <p>${p.descripcion}</p>
            <a class="btn" href="https://wa.me/52XXXXXXXXXX?text=${encodeURIComponent('Me interesa: '+p.nombre)}">Pedir por WhatsApp</a>
        </div>`;
    });
}
cargarCatalogo();