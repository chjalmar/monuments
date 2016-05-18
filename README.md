#Sinopsis
Dos pequeños scripts en Node:

- El primero (monuments.js), para hacer un scrap y generar un API del sitio web de la Comisión de Monumentos Nacionales de Chile (www.monumentos.cl).
- El segundo (stream.js), para servir el archivo resultante a través de un puerto de 'localhost'.
- Y el archivo "results.json" resultante del 1er script.

En monuments.js se observa un buen ejemplo de implementación del método 'throttle()' de x-ray, útil para dosificar requests a servidores lentos.

#Nuevo:

Agregada aplicación móvil en Ionic/Cordova que descarga, almacena localmente (PouchDB) y muestra en un mapa (Google Maps API v3) los monumentos que poseen coordenadas.

Los monumentos se muestran a partir de la localización del móvil, de modo que la aplicación necesita utilizar el GPS (ngCordova). Conforme el usuario se mueve, puede pulsar el botón 'Actualizar mapa', y el mapa agregará los monumentos que entran en la vista.