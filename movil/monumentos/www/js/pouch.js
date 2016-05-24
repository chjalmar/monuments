angular.module('starter.pouch', [])

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
      var buenos = [];
      function guardaTodos(monuments) {
        var records = monuments.data.monumentos;
        
        for (var i = 0; i < records.length; i++) {
          if (records[i].datos.coords.xy) {
            _db.post(records[i]);
            buenos.push(records[i]);
          }
        }
      }
      return $q.when(guardaTodos(monuments)).then(function(){return buenos;});
      
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
    
    	
}]);