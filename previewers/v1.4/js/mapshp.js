$(document).ready(function() {
    startPreview(false);   
});

// initialize the map
var map = L.map('map').fitWorld();

function translateBaseHtmlPage() {
    var mapPreviewText = $.i18n( "mapPreviewText" );
    $( '.mapPreviewText' ).text( mapPreviewText );
}

// set limits
const file_size_limit = 20; // in MB

// enable spinner
var target = document.getElementById('map');
var spinner = new Spinner().spin(target);

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    //check file size
    const url_to_file_info = fileUrl.replace("access/data","").replace("file","files");

    $.getJSON(url_to_file_info, function( data ) {
        const file_size = data.data.dataFile.filesize/(1024**2);

        if (file_size > file_size_limit){
            show_error(`The file is too big to be displayed (limit is ${file_size_limit.toString()} MB)`);
        }else{
            // load a tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // get data
            var request = new XMLHttpRequest();
            request.open('GET', fileUrl, true);
            request.responseType = 'blob';
            request.onload = function() {
                var reader = new FileReader();
                reader.readAsArrayBuffer(request.response);
                reader.onload =  function(e){
                    convertToLayer(e.target.result);        
                };
            };
            request.send();
        }
    });
} 

function convertToLayer(buffer){
    shp(buffer).then(function(shapeData){	//More info: https://github.com/calvinmetcalf/shapefile-js
        var shape = L.shapefile(shapeData, {
        	onEachFeature: function (feature, layer) {
        	    if (feature.properties) {
        	        var popupcontent = [];
        	        for (var propName in feature.properties) {
        	            propValue = feature.properties[propName];
        	            popupcontent.push("<strong>" + propName + "</strong>: " + JSON.stringify(propValue, null, 2));
        	        }
        	        layer.bindPopup(popupcontent.join("<br />"));
        	    }
        	}
        }).addTo(map);  //More info: https://github.com/calvinmetcalf/leaflet.shapefile
        map.fitBounds(shape.getBounds()); 
        // disable spinner
        spinner.stop();      
    });
}

function show_error(error_text){
	$('#map').hide();
	$('#file_error').show();
	$('#file_error').append(error_text);
}
