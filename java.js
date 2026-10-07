// =========================================================
// CONFIGURACIÓN: URL DE TU GOOGLE APPS SCRIPT
// =========================================================
const URL_BASE_DATOS = "https://script.google.com/macros/s/AKfycbzv3GdnUzT24IC99RWxCjpnbyeVe9-tU1qlzu_1WnkuKvR_oE0POheOtgUgehEPSYDP/exec"; 

// =========================================================
// TRADUCCIONES PARA INDEX.HTML
// =========================================================
const traducciones = {
    es: {
        tituloEncuesta: "Cuéntanos sobre tu experiencia",
        tituloVisita: "Sobre tu visita",
        labelNombre: "Nombre (opcional)",
        phNombre: "Escribe tu nombre...",
        labelFecha: "Fecha de visita",
        tituloComida: "La comida",
        preguntaComida: "¿Cómo calificarías la calidad de nuestros productos?",
        tituloLocal: "El local",
        preguntaLocal: "¿Cómo calificarías el ambiente, la limpieza y la comodidad?",
        tituloAtencion: "Atención al cliente",
        preguntaAtencion: "¿Cómo calificarías la amabilidad y rapidez de nuestra atención?",
        tituloGeneral: "Experiencia general",
        preguntaGeneral: "En general, ¿cómo fue tu experiencia en Liva Fresas?",
        tituloNps: "Recomendación",
        preguntaNps: "¿Qué tan probable es que recomiendes Liva Fresas a otra persona?",
        tituloComentario: "Cuéntanos más",
        labelComentario: "¿Hay algo que quieras contarnos?",
        phComentario: "Escribe tu opinión aquí...",
        textoPrivacidad: "Acepto que mi respuesta sea almacenada para fines de evaluación y mejora del servicio.",
        btnEnviar: "Enviar opinión 🍓",
        btnComentarios: "💬 Ver Opiniones",
        alertaExito: "¡Gracias por responder la encuesta! 🍓 Tu opinión ha sido registrada."
    },
    en: {
        tituloEncuesta: "Tell us about your experience",
        tituloVisita: "About your visit",
        labelNombre: "Name (optional)",
        phNombre: "Type your name...",
        labelFecha: "Visit date",
        tituloComida: "Food",
        preguntaComida: "How would you rate the quality of our products?",
        tituloLocal: "Our place",
        preguntaLocal: "How would you rate the atmosphere, cleanliness, and comfort?",
        tituloAtencion: "Customer service",
        preguntaAtencion: "How would you rate the friendliness and speed of our service?",
        tituloGeneral: "Overall experience",
        preguntaGeneral: "Overall, how was your experience at Liva Fresas?",
        tituloNps: "Recommendation",
        preguntaNps: "How likely are you to recommend Liva Fresas to someone else?",
        tituloComentario: "Tell us more",
        labelComentario: "Is there anything else you would like to tell us?",
        phComentario: "Type your feedback here...",
        textoPrivacidad: "I agree that my response may be stored for evaluation and service improvement purposes.",
        btnEnviar: "Submit Feedback 🍓",
        btnComentarios: "💬 View Feedback",
        alertaExito: "Thank you for filling out the survey! 🍓 Your feedback has been recorded."
    }
};

let idiomaActual = "es";

function cambiarIdioma(lang) {
    idiomaActual = lang;
    const t = traducciones[lang];

    const elementos = {
        "titulo-encuesta": t.tituloEncuesta,
        "titulo-visita": t.tituloVisita,
        "label-nombre": t.labelNombre,
        "label-fecha": t.labelFecha,
        "titulo-comida": t.tituloComida,
        "pregunta-comida": t.preguntaComida,
        "titulo-local": t.tituloLocal,
        "pregunta-local": t.preguntaLocal,
        "titulo-atencion": t.tituloAtencion,
        "pregunta-atencion": t.preguntaAtencion,
        "titulo-general": t.tituloGeneral,
        "pregunta-general": t.preguntaGeneral,
        "titulo-nps": t.tituloNps,
        "pregunta-nps": t.preguntaNps,
        "titulo-comentario": t.tituloComentario,
        "label-comentario": t.labelComentario,
        "texto-privacidad": t.textoPrivacidad,
        "enviar": t.btnEnviar,
        "btn-comentarios": t.btnComentarios
    };

    for (let id in elementos) {
        let el = document.getElementById(id);
        if (el) el.textContent = elementos[id];
    }

    let inputNombre = document.getElementById("nombre");
    if (inputNombre) inputNombre.placeholder = t.phNombre;

    let inputComentario = document.getElementById("comentario");
    if (inputComentario) inputComentario.placeholder = t.phComentario;
}

document.addEventListener("DOMContentLoaded", function () {

    // 1. GENERAR ESTRELLAS INTERACTIVAS
    const IDsCalificaciones = [
        "calificacion-comida",
        "calificacion-local",
        "calificacion-atencion",
        "calificacion-general"
    ];

    IDsCalificaciones.forEach(id => {
        const contenedor = document.getElementById(id);
        if (!contenedor) return;

        contenedor.dataset.valor = "0";

        for (let i = 1; i <= 5; i++) {
            const btnEstrella = document.createElement("button");
            btnEstrella.type = "button";
            btnEstrella.textContent = "☆";
            btnEstrella.className = "btn-estrella";

            btnEstrella.onclick = function () {
                contenedor.dataset.valor = i;
                const todas = contenedor.querySelectorAll(".btn-estrella");
                todas.forEach((e, idx) => {
                    if (idx < i) {
                        e.textContent = "★";
                        e.classList.add("activa");
                    } else {
                        e.textContent = "☆";
                        e.classList.remove("activa");
                    }
                });
            };

            contenedor.appendChild(btnEstrella);
        }
    });

    // 2. MOSTRAR VALOR DEL NPS
    const sliderNps = document.getElementById("nps-range");
    const valorNps = document.getElementById("nps-valor");
    if (sliderNps && valorNps) {
        sliderNps.oninput = function () {
            valorNps.textContent = this.value + "%";
        };
    }

    // 3. CAMBIO DE IDIOMA
    const btnEs = document.getElementById("espanol");
    const btnEn = document.getElementById("ingles");

    if (btnEs) btnEs.onclick = () => cambiarIdioma("es");
    if (btnEn) btnEn.onclick = () => cambiarIdioma("en");

    // 4. ENVÍO DEL FORMULARIO
    const formulario = document.getElementById("formulario-encuesta");
    if (formulario) {
        formulario.onsubmit = function (event) {
            event.preventDefault();

            const nuevaRespuesta = {
                nombre: document.getElementById("nombre")?.value.trim() || (idiomaActual === "es" ? "Anónimo" : "Anonymous"),
                fechaVisita: document.getElementById("fecha")?.value || "N/A",
                comida: document.getElementById("calificacion-comida")?.dataset.valor || "0",
                local: document.getElementById("calificacion-local")?.dataset.valor || "0",
                atencion: document.getElementById("calificacion-atencion")?.dataset.valor || "0",
                general: document.getElementById("calificacion-general")?.dataset.valor || "0",
                nps: (document.getElementById("nps-range")?.value || "50") + "%",
                comentario: document.getElementById("comentario")?.value.trim() || (idiomaActual === "es" ? "Sin comentario" : "No comment"),
                fechaRegistro: new Date().toLocaleDateString("es-ES")
            };

            // Guardar localmente
            let respuestasLocales = JSON.parse(localStorage.getItem("respuestasEncuesta")) || [];
            respuestasLocales.push(nuevaRespuesta);
            localStorage.setItem("respuestasEncuesta", JSON.stringify(respuestasLocales));

            // Enviar a Google Apps Script
            if (URL_BASE_DATOS && URL_BASE_DATOS !== "PEGA_AQUI_TU_URL_DE_GOOGLE" && URL_BASE_DATOS.startsWith("http")) {
                fetch(URL_BASE_DATOS, {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(nuevaRespuesta)
                });
            }

            alert(traducciones[idiomaActual].alertaExito);

            // Reiniciar formulario
            formulario.reset();

            // Reiniciar estrellas
            IDsCalificaciones.forEach(id => {
                const cont = document.getElementById(id);
                if (cont) {
                    cont.dataset.valor = "0";
                    cont.querySelectorAll(".btn-estrella").forEach(e => {
                        e.textContent = "☆";
                        e.classList.remove("activa");
                    });
                }
            });

            if (valorNps) valorNps.textContent = "50%";
        };
    }
});
