$(document).ready(function() {
    startPreview(true);
});
    
function translateBaseHtmlPage() {
    var mapPreviewText = $.i18n( "mapPreviewText" );
    $( '.mapPreviewText' ).text( mapPreviewText );
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    // convert string data to json
    var geoJsonData = JSON.parse(data);

    // initialize the map
    var map = L.map('map').fitWorld();

    // load a tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // add data to map, including properties if set
    var geoJson = L.geoJSON(geoJsonData, {
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
      }).addTo(map);

    // zoom to added features
    map.fitBounds(geoJson.getBounds());
}
