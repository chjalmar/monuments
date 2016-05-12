var http = require('http')
var fs = require("fs")

var server = http.createServer(function (request, response) {
             var src = fs.createReadStream(process.argv[3])
             src.pipe(response);
});
server.listen(process.argv[2]);

/* ejemplo de ejecuci�n (en el shell:) ~:node stream.js 8000 C:\eula.1028.txt */
/*A cualquier request enviado al servidor (localhost en nuestro caso) desde un navegador, al puerto especificado en
el 1er argumento enviado por l�nea de comandos, el programa le enviar� el archivo localizado en el servidor, 
especificado en el 2do argumento enviado por l�nea de comandos. */