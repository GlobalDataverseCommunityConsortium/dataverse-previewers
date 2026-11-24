$(document).ready(function() {
    startPreview(false);   
});

// set limits
const file_size_limit = 15; // in MB
const row_col_limit = 50000; // number of columns or rows
const load_timeout = 30; // in seconds

var raster_loaded = false;

// enable spinner
var target = document.getElementById('map');
var spinner = new Spinner().spin(target);

function translateBaseHtmlPage() {
    var mapPreviewText = $.i18n( "mapPreviewText" );
    $( '.mapPreviewText' ).text( mapPreviewText );
}

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    //check file size
    const url_to_file_info = fileUrl.replace("access/data","").replace("file","files"); 

    $.getJSON(url_to_file_info, function( data ) {
        const file_size = data.data.dataFile.filesize/(1024**2);

        if (file_size > file_size_limit){
            show_error(`The file is too big to be displayed (limit is ${file_size_limit.toString()} MB)`);
        }else{
            // initialize the map
            var map = L.map('map').fitWorld(); 

            // add OpenStreetMap basemap
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // load the raster
            fetch(fileUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                parseGeoraster(arrayBuffer).then(georaster => {
                    raster_loaded = true;
                    // check row, col limits
                    if (georaster.width > row_col_limit || georaster.height > row_col_limit){
                        show_error(`The number of rows or columns is too high to be displayed (limit is ${row_col_limit.toString()})`);
                    // draw the raster
                    }else{
                    	//console.log("georaster:", georaster);

                    	var layer = new GeoRasterLayer({
                    	    georaster: georaster,
                    	    //debugLevel: 2,
                    	    opacity: 1,
                    	    resolution: 256
                    	});
                    	layer.addTo(map);	
                    	map.fitBounds(layer.getBounds());

                    	// disable spinner
                    	spinner.stop();
                    }
                });
            // check if raster is loaded    
            }).then(checkIfLoaded());                
        }
    })
}

function show_error(error_text){
    $('#map').hide();
    $('#file_error').show();
    $('#file_error').append(error_text);
}     

// it is not possible to catch the error of 'parseGeoraster' :\ see: https://github.com/GeoTIFF/georaster/issues/71 
// in case of not supported tiffs (e.g. Interleaving type "BSQ" with palette) an error is thrown by 'parseGeoraster', but the promise keeps pending :\
// therefore, after a certain time, it is checked whether the raster has been loaded.
// if the raster is not loaded, an error is shown..
function checkIfLoaded() {
    setTimeout(() => {
        if(!raster_loaded){
            show_error("The raster could not be loaded. This may be because it is not a valid GeoTIFF (e.g. projection information is missing). Or the TIFF has a palette with interleaving type 'BSQ', which is not supported.");
            spinner.stop();
        }  
    }, load_timeout * 1000);
}
