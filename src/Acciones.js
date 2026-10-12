import Personaje from "./Personaje.js";

class Acciones extends Personaje {

    constructor(nombre, personaje) {
        super(nombre, personaje);
    }

  
    atkBasico(oponente) {
        this.setEnergia(Math.max(0, this.getEnergia() - 5));
        this.setKi(Math.max(0, this.getKi() - 10));

        if (oponente) {
            oponente.setVida(Math.max(0, oponente.getVida() - 10));
        }

        this.mostrarEstadisticas();
    }

    /**
     * Solo recupera energía por descanso, pero el Ki no se regenera automáticamente.
     * @param {number} cantidad - cantidad a recuperar
     */
    recargarPoderes(cantidad = 0) {
        this.setKi(Math.min(100, this.getKi() + cantidad));
        this.setEnergia(Math.min(100, this.getEnergia() + 0));
    }

   
    atkEspecial(oponente) {
        const COSTO_ENERGIA = 15;
        const COSTO_KI = 50;

        if (this.getKi() < COSTO_KI || this.getEnergia() < COSTO_ENERGIA) {
            return false;
        }

        this.setEnergia(this.getEnergia() - COSTO_ENERGIA);
        this.setKi(Math.max(0, this.getKi() - COSTO_KI));

        if (oponente) {
            oponente.setVida(Math.max(0, oponente.getVida() - 25));
        }

        this.mostrarEstadisticas();
        return true;
    }

    curacion() {
        if (this.getSemilla() > 0) {
            this.setEnergia(100);
            this.setKi(100);
            this.setVida(100);
            this.setSemilla(this.getSemilla() - 1);
            this.mostrarEstadisticas();
            return true;
        }
        console.log("¡No te quedan semillas del ermitaño!");
        return false;
    }

    /**
     * Recarga energía (+15) y ki (+10) sin pasar de 100.
     */
    cargaEnergia() {
        this.setKi(Math.min(100, this.getKi() + 25));
        this.mostrarEstadisticas();
    }

    defensa() {
     
    }
}

// Exporta la clase 'Acciones' para su uso en el juego
export default Acciones;