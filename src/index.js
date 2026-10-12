import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from "sweetalert2";
import Acciones from "./Acciones.js";
import { atk_basico, atk_especial, cargar_ki } from './interfaz.js';

const btn_player1 = document.getElementById("btn_player1");
const btn_player2 = document.getElementById("btn_player2");
const player1 = document.getElementById("py1");
const player2 = document.getElementById("py2");
const nombre1 = document.getElementById("player1");
const nombre2 = document.getElementById("player2");
const nombres = document.getElementById("nombres");
const panel_juego = document.getElementById("panel_juego"); 

// Elementos visuales
const username1 = document.getElementById("username1");
const personaje1 = document.getElementById("personaje1");
const img1 = document.getElementById("img1");

const username2 = document.getElementById("username2");
const personaje2 = document.getElementById("personaje2");
const img2 = document.getElementById("img2");

// Barras
const vida1 = document.getElementById("vida1");
const energia1 = document.getElementById("energia1");
const ki1 = document.getElementById("ki1");

const vida2 = document.getElementById("vida2");
const energia2 = document.getElementById("energia2");
const ki2 = document.getElementById("ki2");

// Contadores de semillas
const semillas1 = document.getElementById("semillas1");
const semillas2 = document.getElementById("semillas2");

// Botones de acción Jugador 1
const btn_atk1 = document.getElementById("atq_basico1");
const btn_esp1 = document.getElementById("atq_esp1");
const btn_ki1 = document.getElementById("cargar_ki1");
const btn_semilla1 = document.getElementById("semilla1");

// Botones de acción Jugador 2
const btn_atk2 = document.getElementById("atq_basico2");
const btn_esp2 = document.getElementById("atq_esp2");
const btn_ki2 = document.getElementById("cargar_ki2");
const btn_semilla2 = document.getElementById("semilla2");

let pj1 = "", pj2 = "";
let jugador1, jugador2;

// Control de inicio y descanso para recargar poderes
let batallaIniciada = false;
let turno = null; // NUEVO: jugador que tiene el turno actual
const descansos = new WeakMap();
const cooldownEspecial = new WeakMap();
const DURACION_DESCANSO_BASICO = 3;
const DURACION_DESCANSO_ESPECIAL = 5;

const inicializarCooldownEspecial = () => {
    cooldownEspecial.set(jugador1, 0);
    cooldownEspecial.set(jugador2, 0);
};

const puedeUsarEspecial = (jugador) => {
    if (!jugador) return false;
    return (cooldownEspecial.get(jugador) ?? 0) <= 0 && jugador.getKi() >= 50;
};

const reducirCooldownEspecial = () => {
    [jugador1, jugador2].forEach((jugador) => {
        if (!jugador) return;
        const turnos = cooldownEspecial.get(jugador) ?? 0;
        if (turnos > 0) {
            cooldownEspecial.set(jugador, turnos - 1);
        }
    });
};

const msj_error = (msj) => {
    Swal.fire({
        icon: "warning",
        title: "Error!",
        text: msj
    });
};

const actualizar_barra = (barra, valor) => {
    barra.style.width = `${valor}%`;
    barra.innerText = `${valor}%`;
};

const barras = () => {
    if (jugador1) {
        actualizar_barra(vida1, jugador1.getVida());
        actualizar_barra(energia1, jugador1.getEnergia());
        actualizar_barra(ki1, jugador1.getKi());
        semillas1.innerText = jugador1.getSemilla();
    }

    if (jugador2) {
        actualizar_barra(vida2, jugador2.getVida());
        actualizar_barra(energia2, jugador2.getEnergia());
        actualizar_barra(ki2, jugador2.getKi());
        semillas2.innerText = jugador2.getSemilla();
    }
};

const iniciar_juego = () => {
    panel_juego.classList.remove("d-none"); // NUEVO

    username1.innerText = nombre1.value;
    personaje1.innerText = pj1;
    img1.src = `./public/img/${pj1}/base.png`;

    username2.innerText = nombre2.value;
    personaje2.innerText = pj2;
    img2.src = `./public/img/${pj2}/base.png`;

    inicializarCooldownEspecial();
    barras();
    aplicarTurno(); // NUEVO: bloquea todo hasta que empiece la batalla

    // La batalla comienza únicamente después de la cuenta regresiva.
    batallaIniciada = false;
    iniciarCuentaRegresiva();
};

const remover_seleccion = (color, ...elementos) => {
    elementos.forEach((elemento) => {
        elemento.classList.remove("bg-warning");
        elemento.classList.add("bg-" + color);
    });
};

const juego_listo = () => {
    if (!jugador1 || !jugador2) {
        msj_error("¡El juego no ha comenzado!");
        return false;
    }
    if (!batallaIniciada) {
        msj_error("¡Espera a que termine la cuenta regresiva!");
        return false;
    }
    return true;
};

const obtenerBotonesAtaque = (jugador) => {
    if (jugador === jugador1) return [btn_atk1, btn_esp1];
    return [btn_atk2, btn_esp2];
};

const obtenerBotonesAccion = (jugador) => {
    if (jugador === jugador1) return [btn_atk1, btn_esp1, btn_ki1, btn_semilla1];
    return [btn_atk2, btn_esp2, btn_ki2, btn_semilla2];
};

const iniciarDescanso = (jugador, segundos) => {
    // Si ya estaba descansando, no se inicia otro contador.
    if (descansos.has(jugador)) return;

    let restantes = segundos;
    const botonesAtaque = obtenerBotonesAtaque(jugador);
    const botonesAccion = obtenerBotonesAccion(jugador);

    descansos.set(jugador, true);
    botonesAccion.forEach((boton) => {
        boton.disabled = true;
    });

    const actualizarDescanso = () => {
        botonesAtaque.forEach((boton) => {
            boton.innerText = `Recargando ${restantes}s`;
        });
        barras();
    };

    actualizarDescanso();

    const intervalo = setInterval(() => {
        restantes--;
        jugador.recargarPoderes(0);
        barras();

        if (restantes <= 0) {
            clearInterval(intervalo);
            descansos.delete(jugador);
            botonesAtaque.forEach((boton) => {
                boton.disabled = false;
                boton.innerText = boton.id.includes("esp") ? "Ataque especial" : "Ataque básico";
            });
            botonesAccion.filter((boton) => !botonesAtaque.includes(boton)).forEach((boton) => {
                boton.disabled = false;
            });
            aplicarTurno(); // NUEVO: respeta de quién es el turno
            barras();
        } else {
            actualizarDescanso();
        }
    }, 1000);
};

const estaDescansando = (jugador) => descansos.has(jugador);

// NUEVO: solo el jugador en turno (y que no esté recargando) tiene botones activos
const aplicarTurno = () => {
    [jugador1, jugador2].forEach((jugador) => {
        const habilitado = jugador === turno && !estaDescansando(jugador);
        const especialDisponible = jugador && puedeUsarEspecial(jugador);

        obtenerBotonesAccion(jugador).forEach((boton) => {
            if (boton.id && boton.id.includes("esp")) {
                boton.disabled = !(habilitado && especialDisponible);
                return;
            }
            boton.disabled = !habilitado;
        });
    });
};

// NUEVO: aviso del turno actual
const mostrarTurno = () => {
    const nombre = turno === jugador1 ? nombre1.value : nombre2.value;
    Swal.fire({
        toast: true,
        position: "top",
        icon: "info",
        title: `Turno de ${nombre}`,
        showConfirmButton: false,
        timer: 1500
    });
};

// NUEVO: pasa el turno al oponente y bloquea al jugador que acaba de actuar
const iniciarCuentaRegresiva = async () => {
    const pasos = [
        { titulo: "3", color: "#dc3545" },
        { titulo: "2", color: "#ffc107" },
        { titulo: "1", color: "#198754" }
    ];

    for (const paso of pasos) {
        await Swal.fire({
            title: paso.titulo,
            color: paso.color,
            background: "rgba(0,0,0,0.9)",
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 700,
            timerProgressBar: false
        });
    }

    batallaIniciada = true;
    await Swal.fire({
        icon: "success",
        title: "¡COMIENZA LA BATALLA!",
        text: "¡Que gane el mejor programador!",
        showConfirmButton: false,
        timer: 1000
    });

    turno = jugador1;
    aplicarTurno();
    mostrarTurno();
};

const resetearPantallaInicio = () => {
    batallaIniciada = false;
    turno = null;
    jugador1 = null;
    jugador2 = null;
    pj1 = "";
    pj2 = "";
    nombre1.value = "";
    nombre2.value = "";
    nombre1.disabled = false;
    nombre2.disabled = false;
    player1.classList.remove("d-none");
    player2.classList.remove("d-none");
    nombres.classList.remove("d-none");
    panel_juego.classList.add("d-none");

    [...player1.querySelectorAll("img")].forEach((imagen) => {
        imagen.classList.remove("bg-warning");
        imagen.classList.add("bg-danger");
    });

    [...player2.querySelectorAll("img")].forEach((imagen) => {
        imagen.classList.remove("bg-warning");
        imagen.classList.add("bg-primary");
    });

    [btn_atk1, btn_esp1, btn_ki1, btn_semilla1, btn_atk2, btn_esp2, btn_ki2, btn_semilla2].forEach((boton) => {
        boton.disabled = true;
        if (boton.id && boton.id.includes("esp")) {
            boton.innerText = "Ataque especial";
        }
        if (boton.id && boton.id.includes("basico")) {
            boton.innerText = "Ataque básico";
        }
    });
};

const finalizarBatalla = (ganador, perdedor) => {
    if (!ganador || !perdedor) return false;

    batallaIniciada = false;
    [btn_atk1, btn_esp1, btn_ki1, btn_semilla1, btn_atk2, btn_esp2, btn_ki2, btn_semilla2].forEach((boton) => {
        boton.disabled = true;
    });

    Swal.fire({
        icon: "success",
        title: `¡${ganador.getNombre()} derrotó a ${perdedor.getNombre()}!`,
        text: "Regresando al inicio...",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: false,
        willClose: () => {
            resetearPantallaInicio();
        }
    });
    return true;
};

const comprobarVictoria = () => {
    if (!jugador1 || !jugador2) return false;

    if (jugador2.getVida() <= 0) {
        return finalizarBatalla(jugador1, jugador2);
    }

    if (jugador1.getVida() <= 0) {
        return finalizarBatalla(jugador2, jugador1);
    }

    return false;
};

const pasarTurno = () => {
    if (comprobarVictoria()) return;
    reducirCooldownEspecial();
    turno = turno === jugador1 ? jugador2 : jugador1;
    aplicarTurno();
    mostrarTurno();
};

// Solo letras y números en los nombres
nombre1.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9]+/g, "");
});
nombre2.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9]+/g, "");
});

// Selección de personajes
[...player1.querySelectorAll("img")].forEach((imagen) => {
    imagen.addEventListener("click", (event) => {
        remover_seleccion("danger", ...player1.querySelectorAll("img"));
        event.target.classList.remove("bg-danger");
        event.target.classList.add("bg-warning");
        pj1 = event.target.alt;
    });
});

[...player2.querySelectorAll("img")].forEach((imagen) => {
    imagen.addEventListener("click", (event) => {
        remover_seleccion("primary", ...player2.querySelectorAll("img"));
        event.target.classList.remove("bg-primary");
        event.target.classList.add("bg-warning");
        pj2 = event.target.alt;
    });
});

// Confirmar jugadores
btn_player1.addEventListener("click", () => {
    if (nombre1.value == "") {
        return msj_error("El jugador 1 no ha ingresado un nombre de usuario!");
    } else if (pj1 == "") {
        return msj_error("El jugador 1 debe seleccionar un personaje!");
    }
    jugador1 = new Acciones(nombre1.value, pj1);
    nombre1.disabled = true;
    player1.classList.add("d-none");
    if (jugador1 && jugador2) {
        nombres.classList.add("d-none");
        iniciar_juego();
    }
});

btn_player2.addEventListener("click", () => {
    if (nombre2.value == "") {
        return msj_error("El jugador 2 no ha ingresado un nombre de usuario!");
    } else if (pj2 == "") {
        return msj_error("El jugador 2 debe seleccionar un personaje!");
    }
    jugador2 = new Acciones(nombre2.value, pj2);
    nombre2.disabled = true;
    player2.classList.add("d-none");
    if (jugador1 && jugador2) {
        nombres.classList.add("d-none");
        iniciar_juego();
    }
});

// --- ACCIONES JUGADOR 1 ---
btn_atk1.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador1)) return;
    atk_basico(jugador1, jugador2);
    barras();
    if (comprobarVictoria()) return;
    iniciarDescanso(jugador1, DURACION_DESCANSO_BASICO);
    pasarTurno(); // NUEVO
});

btn_esp1.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador1)) return;
    if (!puedeUsarEspecial(jugador1)) {
        return msj_error("El ataque especial solo se puede usar con 50 de Ki o más y sin recarga.");
    }
    if (!atk_especial(jugador1, jugador2)) {
        return msj_error("No tienes suficiente Ki o Energía para el ataque especial");
    }
    cooldownEspecial.set(jugador1, 2);
    barras();
    if (comprobarVictoria()) return;
    iniciarDescanso(jugador1, DURACION_DESCANSO_ESPECIAL);
    pasarTurno(); // NUEVO
});

btn_ki1.addEventListener("click", () => {
    if (!juego_listo()) return;
    if (jugador1.getKi() >= 100) {
        return msj_error("¡Tu Ki ya está completo! No puedes cargar más.");
    }
    cargar_ki(jugador1);
    barras();
    if (comprobarVictoria()) return;
    pasarTurno(); // NUEVO
});

btn_semilla1.addEventListener("click", () => {
    if (!juego_listo()) return;
    if (jugador1.getSemilla() <= 0) {
        return msj_error("¡No te quedan semillas del ermitaño!");
    }
    if (jugador1.getVida() >= 100) {
        return msj_error("¡Ya tienes toda la vida! No puedes usar la semilla.");
    }
    jugador1.curacion();
    barras();
    if (comprobarVictoria()) return;
    pasarTurno(); // NUEVO
});

// --- ACCIONES JUGADOR 2 ---
btn_atk2.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador2)) return;
    atk_basico(jugador2, jugador1);
    barras();
    if (comprobarVictoria()) return;
    iniciarDescanso(jugador2, DURACION_DESCANSO_BASICO);
    pasarTurno(); // NUEVO
});

btn_esp2.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador2)) return;
    if (!puedeUsarEspecial(jugador2)) {
        return msj_error("El ataque especial solo se puede usar con 50 de Ki o más y sin recarga.");
    }
    if (!atk_especial(jugador2, jugador1)) {
        return msj_error("No tienes suficiente Ki o Energía para el ataque especial");
    }
    cooldownEspecial.set(jugador2, 2);
    barras();
    if (comprobarVictoria()) return;
    iniciarDescanso(jugador2, DURACION_DESCANSO_ESPECIAL);
    pasarTurno(); // NUEVO
});

btn_ki2.addEventListener("click", () => {
    if (!juego_listo()) return;
    if (jugador2.getKi() >= 100) {
        return msj_error("¡Tu Ki ya está completo! No puedes cargar más.");
    }
    cargar_ki(jugador2);
    barras();
    if (comprobarVictoria()) return;
    pasarTurno(); // NUEVO
});

btn_semilla2.addEventListener("click", () => {
    if (!juego_listo()) return;
    if (jugador2.getSemilla() <= 0) {
        return msj_error("¡No te quedan semillas del ermitaño!");
    }
    if (jugador2.getVida() >= 100) {
        return msj_error("¡Ya tienes toda la vida! No puedes usar la semilla.");
    }
    jugador2.curacion();
    barras();
    if (comprobarVictoria()) return;
    pasarTurno(); // NUEVO
});