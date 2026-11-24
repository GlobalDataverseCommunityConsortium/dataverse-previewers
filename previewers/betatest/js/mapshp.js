$(document).ready(function() {
    startPreview(false);   
});

// initialize the map
var map = L.map('map').fitWorld();

function translateBaseHtmlPage() {
    $('.mapPreviewText').text($.i18n("mapPreviewText"));
}

// set limits
const fileSizeLimit = 50; // MB

// enable spinner
var target = document.getElementById('map');
var spinner = new Spinner().spin(target);


async function loadMetadata(metadataUrl) {
    const response = await fetch(metadataUrl);

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
}


async function getFileSize() {

    const fileid = queryParams.fileid;
    const datasetMetadataUrl = queryParams.versionUrl;

    const metadata = await loadMetadata(datasetMetadataUrl);

    const filesMetadata = metadata.data.files;

    const fileMetadata = filesMetadata.find(f => f.dataFile.id === fileid);

    const fileName = fileMetadata.dataFile.filename;
    const fileSize = Math.round(fileMetadata.dataFile.filesize / (1024 ** 2));

    //console.log(fileName, fileSize);

    return fileSize;
}


async function writeContent(fileUrl, file, title, authors) {

    addStandardPreviewHeader(file, title, authors);

    const fileSize = await getFileSize();

    if (fileSize > fileSizeLimit) {
        show_error(`The file is too big to be displayed (limit is ${fileSizeLimit} MB)`);
        spinner.stop();
        return;
    }


    // load OpenStreetMap tiles
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);


    try {
        const buffer = await (
            await fetch(fileUrl)
        ).arrayBuffer();

        await convertToLayer(buffer);

    } catch (error) {
        console.error(error);
        show_error("Unable to display shapefile.");
    } finally {
        spinner.stop();
    }
}


async function convertToLayer(buffer) {

    // shapefile -> GeoJSON
    const shapeData = await shp(buffer);

    // GeoJSON -> Leaflet layer
    const shape = L.geoJSON(shapeData, {

        onEachFeature(feature, layer) {
            if (!feature.properties) {return;}

            const popupContent = Object.entries(feature.properties)
                .map(([key, value]) => `<strong>${key}</strong>: ${JSON.stringify(value)}`)
                .join("<br>");

            layer.bindPopup(popupContent);
        }

    }).addTo(map);

    map.fitBounds(shape.getBounds());
}
    

function show_error(error_text) {
    $('#map').hide();
    $('#file_error').show();
    $('#file_error').append(error_text);
}