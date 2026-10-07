// ⚠️ REEMPLAZA ESTO CON TU URL REAL DE GOOGLE APPS SCRIPT (la que termina en /exec)
const URL_BASE_DATOS = "PEGA_AQUI_TU_URL_DE_GOOGLE";

let idiomaActual = "es";
let respuestasGlobales = [];

const textos = {
    es: {
        titulo: "Opiniones de nuestros clientes 🍓",
        subtitulo: "Aquí puedes ver lo que las personas opinan sobre su experiencia en Liva Fresas.",
        btnVolver: "📋 Volver a la encuesta",
        sinOpiniones: "Aún no hay opiniones registradas. ¡Sé la primera persona en enviar una! 🍓",
        cargando: "Cargando opiniones... 🍓",
        anonimo: "Anónimo",
        fechaVisita: "Fecha de visita",
        comida: "Comida",
        local: "El local",
        atencion: "Atención",
        general: "General",
        recomendacion: "Recomendación",
        registradoEl: "Registrado el",
        sinComentario: "Sin comentario"
    },
    en: {
        titulo: "Customer Feedback 🍓",
        subtitulo: "Here you can see what people think about their experience at Liva Fresas.",
        btnVolver: "📋 Back to survey",
        sinOpiniones: "No opinions registered yet. Be the first one to leave feedback! 🍓",
        cargando: "Loading feedback... 🍓",
        anonimo: "Anonymous",
        fechaVisita: "Visit date",
        comida: "Food",
        local: "Our place",
        atencion: "Customer service",
        general: "Overall",
        recomendacion: "Recommendation",
        registradoEl: "Registered on",
        sinComentario: "No comment"
    }
};

function convertirEstrellas(valor) {
    let num = parseInt(valor) || 0;
    let estrellas = "";
    for (let i = 1; i <= 5; i++) {
        estrellas += (i <= num) ? "★" : "☆";
    }
    return estrellas;
}

function renderizarPagina() {
    let t = textos[idiomaActual];
    let contenedor = document.getElementById("contenedor-opiniones");

    let elemTitulo = document.getElementById("titulo-opiniones-pagina");
    let elemSubtitulo = document.getElementById("subtitulo-opiniones-pagina");
    let elemBtnVolver = document.getElementById("btn-comentarios");

    if (elemTitulo) elemTitulo.textContent = t.titulo;
    if (elemSubtitulo) elemSubtitulo.textContent = t.subtitulo;
    if (elemBtnVolver) elemBtnVolver.textContent = t.btnVolver;

    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (!respuestasGlobales || respuestasGlobales.length === 0) {
        contenedor.innerHTML = `
            <div class="tarjeta-vacia">
                <p id="texto-sin-opiniones">${t.sinOpiniones}</p>
            </div>
        `;
        return;
    }

    // Mostrar de la más reciente a la más antigua
    respuestasGlobales.slice().reverse().forEach(function(r) {
        let tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-opinion";

        let nombreFinal = (r.nombre && r.nombre.trim() !== "" && r.nombre !== "Anónimo" && r.nombre !== "Anonymous") 
            ? r.nombre 
            : t.anonimo;

        let comentarioFinal = (r.comentario && r.comentario.trim() !== "" && r.comentario !== "Sin comentario" && r.comentario !== "No comment")
            ? r.comentario
            : t.sinComentario;

        tarjeta.innerHTML = `
            <div class="header-tarjeta">
                <span class="nombre-cliente">👤 ${nombreFinal}</span>
                <span class="fecha-visita">📅 ${t.fechaVisita}: ${r.fechaVisita || "N/A"}</span>
            </div>

            <div class="detalles-calificacion">
                <p><strong>${t.comida}:</strong> <span class="estrellas-doradas">${convertirEstrellas(r.comida)}</span></p>
                <p><strong>${t.local}:</strong> <span class="estrellas-doradas">${convertirEstrellas(r.local)}</span></p>
                <p><strong>${t.atencion}:</strong> <span class="estrellas-doradas">${convertirEstrellas(r.atencion)}</span></p>
                <p><strong>${t.general}:</strong> <span class="estrellas-doradas">${convertirEstrellas(r.general)}</span></p>
                <p><strong>${t.recomendacion}:</strong> <span class="porcentaje-badge">${r.nps || "50%"}</span></p>
            </div>

            <div class="comentario-cliente">
                <p>"${comentarioFinal}"</p>
            </div>

            <div class="footer-tarjeta">
                <span>${t.registradoEl} ${r.fechaRegistro || ""}</span>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}

function cargarOpiniones() {
    // 1. Cargar respuestas guardadas en este navegador de inmediato
    let locales = JSON.parse(localStorage.getItem("respuestasEncuesta")) || [];
    respuestasGlobales = locales;
    renderizarPagina();

    // 2. Si hay URL de Google configurada, intentar sincronizar con la nube
    if (URL_BASE_DATOS && URL_BASE_DATOS !== "PEGA_AQUI_TU_URL_DE_GOOGLE" && URL_BASE_DATOS.startsWith("http")) {
        fetch(URL_BASE_DATOS)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Fusionar datos evitando duplicados exactos
                    let combinadas = [...data];
                    locales.forEach(loc => {
                        let existe = combinadas.some(rem => 
                            rem.nombre === loc.nombre && 
                            rem.comentario === loc.comentario && 
                            rem.fechaRegistro === loc.fechaRegistro
                        );
                        if (!existe) combinadas.push(loc);
                    });
                    respuestasGlobales = combinadas;
                    renderizarPagina();
                }
            })
            .catch(() => {
                // Si falla la red, mantiene las respuestas locales
            });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let btnEs = document.getElementById("espanol");
    let btnEn = document.getElementById("ingles");

    if (btnEs) {
        btnEs.onclick = function() {
            idiomaActual = "es";
            renderizarPagina();
        };
    }

    if (btnEn) {
        btnEn.onclick = function() {
            idiomaActual = "en";
            renderizarPagina();
        };
    }

    cargarOpiniones();
});
