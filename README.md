# ⚽ GeoSoccr

**GeoSoccr** es un emocionante juego web de adivinanzas donde tu conocimiento del fútbol y la geografía se ponen a prueba. ¿Puedes adivinar la nacionalidad de un futbolista basándote solo en su imagen? ¡Usa el mapa interactivo y acumula puntos para desbloquear pistas!

## 🎮 Cómo Jugar

1.  **Carga del Jugador**: En cada ronda, aparecerá la imagen de un futbolista profesional aleatorio.
2.  **Adivina la Nacionalidad**: Haz clic en el país que creas que es la nacionalidad del jugador en el mapa mundial interactivo.
3.  **Puntuación**: Recibirás puntos según qué tan cerca esté tu selección del país correcto (usando la fórmula de Haversine).
    *   0-500 km: 50 pts
    *   501-1500 km: 40 pts
    *   1501-3000 km: 30 pts
    *   3001-5000 km: 20 pts
    *   5001+ km: 10 pts
4.  **Intentos**: Tienes un máximo de **10 intentos** por ronda.
5.  **Pistas**: ¡Usa tus puntos acumulados para comprar pistas estratégicas!

## 💡 Sistema de Pistas

*   **📍 Posición** (10 pts): Muestra la posición del jugador en el campo.
*   **🏟️ Equipo** (20 pts): Revela el club actual del jugador.
*   **📏 Distancia Exacta** (30 pts): Muestra los kilómetros exactos desde tu último país seleccionado hasta el correcto.
*   **👤 Apellido** (30 pts): Muestra el apellido del jugador.
*   **✨ Nombre Completo** (40 pts): Revela el nombre real completo del futbolista.
*   **🔙 Clubes Anteriores** (50 pts): Muestra hasta 8 escudos de equipos por los que ha pasado el jugador (¡sin nombres, solo los escudos!).
*   **🧭 Brújula** (70 pts): Indica la dirección cardinal (Norte, Sur, etc.) desde tu último intento hacia el objetivo.
*   **🏙️ Ciudad de Nacimiento** (80 pts): Revela la ciudad donde nació el jugador (filtrando el nombre del país).

## 🚀 Tecnologías Utilizadas

*   **API TheSportsDB**: Para obtener datos de jugadores reales, imágenes y trayectorias.
*   **Leaflet.js**: Para el mapa mundial interactivo y manejo de coordenadas geográficas.
*   **Vanilla JavaScript (ES6+)**: Lógica del juego, cálculos de distancia y gestión de estado.
*   **CSS Moderno**: Tema oscuro con acentos neón, efectos de glassmorphism y animaciones fluidas.

## 🛠️ Instalación y Uso

1. Clona este repositorio o descarga los archivos.
2. Abre el archivo `index.html` en cualquier navegador moderno.
3. ¡Disfruta de **GeoSoccr**!

---
Desarrollado con ❤️ para los amantes del fútbol y los retos geográficos.
