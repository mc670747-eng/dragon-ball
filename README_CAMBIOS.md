# Cambios realizados

- Cuenta regresiva al iniciar la pelea: 3 → 2 → 1 → ¡BATALLA!
- Los controles de combate permanecen bloqueados durante la cuenta regresiva.
- Ataque básico: descanso de 3 segundos.
- Ataque especial: descanso de 5 segundos.
- Durante el descanso se bloquean las acciones del jugador.
- Durante el descanso se recuperan 5 puntos de Ki y 5 de Energía por segundo, sin superar 100.
- El botón muestra el tiempo de recarga restante.
- Se mantiene el costo de Ki/Energía de los ataques.
- La batalla termina cuando uno de los personajes queda sin vida.
- Se actualizaron tanto `src/` como `dist/bundle.js` para que la carpeta `dist` pueda ejecutarse directamente.

Si quieres reconstruir el bundle desde el código fuente:
1. Ejecuta `npm install`.
2. Ejecuta `npm run build`.
