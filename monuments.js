var Xray = require('x-ray');
var x = Xray().throttle(32,500);

x('http://www.monumentos.cl/catalogo/625/w3-propertyvalue-44171.html', '.articulocompleto', {
  nombre: 'h1.titulo',
  monumentos: x('#documentos_mediateca .titulo', [{
    id:'@class',
    nombre: 'a',
    link: 'a@href',
    datos: x('#documentos_mediateca .titulo a@href',  {
      direccion:'h4.abstract',
      descripcion:'#presentacion .articulocompleto',
      url_imagen: '.binary-imagen_1 a@href',
      coords: x('#kml_pa_access a@href', {xy: 'coordinates'})
    })
  }])
})
  .write('results.json')
  

