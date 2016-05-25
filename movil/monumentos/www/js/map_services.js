angular.module('starter.services', [])
//SOLOMARCO: l�neas as� comentadas son para mostrar s�lo los marcadores que caben en la parte visible del mapa;
//esa parte visible est� delimitada por la localizaci�n actual, lo que impide proyectar la caminata hacia lugares
//que se salen del marco. No me gust�, as� que las coment�
.factory('Markers', function($http, pouchService) {
 
  var markers = [];
 
  return {
    getMarkers: function(){
      //Inicializar la BD
      pouchService.initDB();
      return pouchService.getAllMonuments().then(function(monumentos) {
      	
        
        if (monumentos.length > 1) {
          return monumentos;	
        }	else {
          var url = "http://intense-shelf-84410.herokuapp.com/";
          return $http.get(url).then(function(response){
            //addMonuments al terminar devuelve el arreglo de puntos validados (con coordenadas)
            return pouchService.addMonuments(response);
          });  	
        }
      });
    },
    getMarker: function(id){
 
    }
  }
})

.factory('GoogleMaps', function($cordovaGeolocation, $ionicLoading, $rootScope, $cordovaNetwork, Markers, ConnectivityMonitor){
  
  var apiKey = false;
  var markerCache = [];
  var map = null;
  var breadCrumbs = [];
  var redDot = {};
    
  function initMap(){
 
    var options = {timeout: 10000, enableHighAccuracy: true};
    redDot = {
          	fillColor: '#F75C50',
          	fillOpacity: 0.8,
          	strokeWeight: 0.5,
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4
          };
    
     
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
 
        //agregar marcador de mi posici�n actual
        
        var marcadoractual = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: latLng,
          
        });
        
        //agrego mi marcador de localizaci�n al arreglo de localizaciones
        breadCrumbs.push(marcadoractual);
              
        //Load the markers
        
        loadMarkers();
        enableMap();
 
      });
      
    }, function(error){
      console.log("No se pudo obtener la localizaci�n.");
    });
 
  }
  
  function relocalizar(){
  	var options = {timeout: 10000, enableHighAccuracy: true};
 
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
      map.setCenter(latLng);
 
      //Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){
 
        //TODO: c�digo para convertir los marcadores anteriores en puntos, y s�lo dejar como gota roja grande la �ltima posici�n
        
        //convierto en piuntos los marcadores de posici�n anteriores
        var zIndex;
        for (var i = 0; i < breadCrumbs.length; i++) {
          breadCrumbs[i].setIcon(redDot);	
          breadCrumbs[i].setZIndex(0);
        }
        
        //agregar marcador de mi posici�n actual
        
        var marcadoractual = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: latLng,
          zIndex: 100000
        });
        
        breadCrumbs.push(marcadoractual);
          
        //Load the markers
        
        loadMarkers();
 
      });
      
    }, function(error){
      console.log("No se pudo obtener la localizaci�n.");
 
        //Load the markers
        loadMarkers();
    });
  }
   
  function loadMarkers(){
 
      //Get all of the markers from our Markers factory
      Markers.getMarkers().then(function(markers){
 
         
        var records = markers;	
        
        
        //obtengo l�mites del rect�ngulo de la vista de mapa actual
        var vista = map.getBounds();
        
        //agrego funci�n de cerrar infoWindow
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
            
            //muestro s�lo los puntos que est�n dentro de mi vista actual
            
          if (vista.contains(markerPos) && !markerExists(markerPos.lat(), markerPos.lng())) {
              
              var image = 'img/7_flag.png';
              // A�adir marcador al mapa
              var marker = new google.maps.Marker({
                  map: map,
                  animation: google.maps.Animation.DROP,
                  icon: image,
                  position: markerPos
              });
              
              // A�adir marcador a markerCache para saber que no debemos agregarlo de nuevo
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
          
          //inyectar informaci�n del registro a la ventana div.aside_mapa y mostrar la ventana
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
  
  function enableMap(){
    $ionicLoading.hide();
  }
 
  function disableMap(){
    $ionicLoading.show({
      template: 'Debes estar conectado a Internet para poder ver este mapa.'
    });
  }
 
  function loadGoogleMaps(){
 
    $ionicLoading.show({
      template: 'Cargando Google Maps...'
    });
 
    //This function will be called once the SDK has been loaded
    window.mapInit = function(){
      initMap();
    };  
 
    //Create a script element to insert into the page
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "googleMaps";
 
    //Note the callback function in the URL is the one we created above
    if(apiKey){
      script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey 
        + '&callback=mapInit';
    } else {
      script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
    }
 
    document.body.appendChild(script);
 
  }
 
  function checkLoaded(){
  	
    if(typeof google == "undefined" || typeof google.maps == "undefined"){
      loadGoogleMaps();
    } else {
      enableMap();
    }       
  }
  
  function addConnectivityListeners(){
 
    if(ionic.Platform.isWebView()){
 
      // Check if the map is already loaded when the user comes online, 
      //if not, load it
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        checkLoaded();
      });
 
      // Disable the map when the user goes offline
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        disableMap();
      });
 
    }
    else {
 
      //Same as above but for when we are not running on a device
      window.addEventListener("online", function(e) {
        checkLoaded();
      }, false);    
 
      window.addEventListener("offline", function(e) {
        disableMap();
      }, false);  
    }
 
  }
  
  
  return {
    init: function(key){
 
      if(typeof key != "undefined"){
        apiKey = key;
      }
      
      if(typeof google == "undefined" || typeof google.maps == "undefined"){
        console.warn("Debe cargarse Google Maps SDK");
        disableMap();
 
        if(ConnectivityMonitor.isOnline()){
          loadGoogleMaps();
        }
      }
      else {
        if(ConnectivityMonitor.isOnline()){
          initMap();
          enableMap();
        } else {
          disableMap();
        }
      }
 
      addConnectivityListeners();
 
    },
    relocalizar: relocalizar
  }
 
});