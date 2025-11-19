const firebaseConfig = {
    apiKey: "AIzaSyAAW4DEpbdgChCELt7EuvxJ3lMXwwZCr5A",
    authDomain: "rich-tea-384802.firebaseapp.com",
    projectId: "rich-tea-384802",
    storageBucket: "rich-tea-384802.firebasestorage.app",
    messagingSenderId: "442145119011",
    appId: "1:442145119011:web:3045cf3b505c5190cb0a96"
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
            <a class="btn" href="https://wa.me/525548270460?text=${encodeURIComponent('Me interesa: '+p.nombre)}">Pedir por WhatsApp</a>
        </div>`;
    });
}
cargarCatalogo();