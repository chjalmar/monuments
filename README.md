#Sinopsis
Dos pequeños scripts en Node:

- El primero (monuments.js), para hacer un scrap y generar un API del sitio web de la Comisión de Monumentos Nacionales de Chile (www.monumentos.cl).
- El segundo (stream.js), para servir el archivo resultante a través de un puerto de 'localhost'.
- Y el archivo "results.json" resultante del 1er script.

En monuments.js se observa un buen ejemplo de implementación del método 'throttle()' de x-ray, útil para dosificar requests a servidores lentos.