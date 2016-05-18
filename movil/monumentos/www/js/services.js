angular.module('starter.services', [])

.factory('pouchService',['$q', function($q){
  var _db;    

    // We'll need this later.
    var _monuments;

    return {
        initDB: initDB,

        // We'll add these later.
        getAllMonuments: getAllMonuments,
        addMonuments: addMonuments
        
    };

    function initDB() {
        // Creates the database or opens if it already exists
        _db = new PouchDB('monuments');
    };
    
    //En esta función agrego a la BD todos los monumentos con coordenadas
    function addMonuments(monuments) {  
      
      function guardaTodos(monuments) {
        var records = monuments.data.monumentos;
        for (var i = 0; i < records.length; i++) {
 
            if (records[i].datos.coords.xy) {
              _db.post(records[i]);
            }
        }
      }
      return $q.when(guardaTodos(monuments));
      
    };
    
    function getAllMonuments() {  
    if (!_monuments) {
       return $q.when(_db.allDocs({ include_docs: true}))
            .then(function(docs) {

                // Each row has a .doc object and we just want to send an 
                // array of birthday objects back to the calling controller,
                // so let's map the array to contain just the .doc objects.
                _monuments = docs.rows.map(function(row) {
                    return row.doc;
                });

                //CHJ:eliminada funcion para actualizar DB; no hace falta, DB será solo lectura
                
                return _monuments;
            });
    } else {
        // Return cached data as a promise
        return $q.when(_monuments);
    }
};
    
    	
}])


.factory('Markers', function($http, pouchService) {
 
  var markers = [];
 
  return {
    getMarkers: function(){
      //Inicializar la BD
      pouchService.initDB();
      return pouchService.getAllMonuments().then(function(monumentos) {
      	
        
        if (monumentos.length > 1) {
          markers = monumentos;
          return markers;	
        }	else {
          var url = "https://intense-shelf-84410.herokuapp.com/";
          return $http.get(url).then(function(response){
            markers = response;
            pouchService.addMonuments(response);
            //TODO: aquí debería devolver los objetos desde la BD
            //así luego puedo arreglar los registros antes del insert,
            //y pasar al mapa el objeto ordenado y limpio de monumentos sin coordenadas
            return markers.data.monumentos;
          });  	
        }
      
      	
      });
      
      
       
    },
    getMarker: function(id){
 
    }
  }
})

.factory('GoogleMaps', function($cordovaGeolocation, Markers){
 
  var markerCache = [];
  var map = null;
 
  function relocalizar(){
  	var options = {timeout: 10000, enableHighAccuracy: true};
 
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
      map.setCenter(latLng);
 
      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){
 
        //agregar marcador de mi posición actual
        
        var marcadoractual = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });
        
        //Load the markers
        
        loadMarkers();
 
      });
      
       
    }, function(error){
      console.log("Could not get location");
 
        //Load the markers
        loadMarkers();
    });
  }
  function initMap(){
 
    var options = {timeout: 10000, enableHighAccuracy: true};
 
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
 
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){
 
        //agregar marcador de mi posición actual
        
        var marcadoractual = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });
        
        //Load the markers
        
        loadMarkers();
 
      });
      
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById("elmio"));
 
    }, function(error){
      console.log("Could not get location");
 
        //Load the markers
        loadMarkers();
    });
 
  }
 
  function loadMarkers(){
 
      //Get all of the markers from our Markers factory
      Markers.getMarkers().then(function(markers){
 
         
        var records = markers;	
        
        
        //obtengo límites del rectángulo de la vista de mapa actual
        var vista = LimVistaActual();
        
        //agrego función de cerrar infoWindow
        jQuery('#cerrar_sucursal').click(function() {
          jQuery(".aside_mapa").slideUp('fast');
        });
        
        for (var i = 0; i < records.length; i++) {
 
          var record = records[i];   
          if (record.datos.coords.xy) {
            var coordenadas = record.datos.coords.xy.split(",");
            var latitud = coordenadas[1];
            var longitud = coordenadas[0];
            var markerPos = new google.maps.LatLng(latitud, longitud);
            
            //muestro sólo los puntos que están dentro de mi vista actual
            
            if (vista.contains(markerPos) && !markerExists(markerPos.lat(), markerPos.lng())) {
              
              var image = 'img/7_flag.png';
              // Añadir marcador al mapa
              var marker = new google.maps.Marker({
                  map: map,
                  animation: google.maps.Animation.DROP,
                  icon: image,
                  position: markerPos
              });
              
              // Añadir marcador a markerCache para saber que no debemos agregarlo de nuevo
              var markerData = {
                lat: markerPos.lat(),
                lng: markerPos.lng(),
                marker: marker
              };
 
              markerCache.push(markerData);
              
              addInfoWindow(marker, record);
              
            }
          }
        }
 
      }); 
 
  }
   
  function markerExists(lat, lng){
      var exists = false;
      var cache = markerCache;
      for(var i = 0; i < cache.length; i++){
        if(cache[i].lat === lat && cache[i].lng === lng){
          exists = true;
        }
      }
 
      return exists;
  } 
   
  function addInfoWindow(marker, record) {
 
      google.maps.event.addListener(marker, 'click', function () {
          
          //inyectar información del registro a la ventana div.aside_mapa y mostrar la ventana
          jQuery('#nombre_monumento').html("<h3>" + record.nombre + "</h3>");
          if (record.datos.direccion) {
            jQuery('#direccion_monumento').html("<i>" + record.datos.direccion + "</i>");
          } else {
          	jQuery('#direccion_monumento').html("");
          }
          if (record.datos.url_imagen) {
            jQuery('#imagen_monumento').html("<img src='" + record.datos.url_imagen + "'>");
          } else {
          	jQuery('#imagen_monumento').html("");
          }
          if (record.datos.descripcion) {
            jQuery('#info_monumento').html("<p>" + record.datos.descripcion + "</p>");
          } else {
          	jQuery('#info_monumento').html("");
          }
          jQuery(".aside_mapa").slideDown('fast');
          
      });
 
  }
  
  function LimVistaActual() {
    var vistaactual = map.getBounds();
    var sw = new google.maps.LatLng(vistaactual.H.H,vistaactual.j.j);
    var ne = new google.maps.LatLng(vistaactual.H.j,vistaactual.j.H);
    var vista = new google.maps.LatLngBounds(sw,ne);
    return vista;	
  }
  
  
  return {
    init: function(){
      initMap();
    },
    relocalizar: relocalizar
  }
 
});