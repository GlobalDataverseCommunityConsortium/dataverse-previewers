$(document).ready(function() {
    startPreview(false);   
});

// set file size limit for non tiled tiff
const fileSizeLimit = 50; // in MB

// enable spinner
var target = document.getElementById('map');
var spinner = new Spinner().spin(target);

function translateBaseHtmlPage() {
    var mapPreviewText = $.i18n( "mapPreviewText" );
    $( '.mapPreviewText' ).text( mapPreviewText );
}

async function loadMetadata(metadataUrl) {
  const response = await fetch(metadataUrl);

  if (!response.ok) {
    show_error(`request on metadata failed`);
    throw new Error(`HTTP Error: ${response.status}`);    
  }

  const metadata = await response.json();

  return metadata;
}

async function registerEPSG(epsg) {

    // Schon bekannt?
    if (ol.proj.get("EPSG:" + epsg)) {
        return;
    }

    const response = await fetch(
        `https://epsg.io/${epsg}.proj4`
    );

    if (!response.ok) {
        show_error(`EPSG-Code ${epsg.toString()} not found`);
        throw new Error("EPSG-Code not found");        
    }

    const def = (await response.text()).trim();

    proj4.defs("EPSG:" + epsg, def);
    ol.proj.proj4.register(proj4);
}

async function getRasterInfo(url) {
    try {
        const tiff = await GeoTIFF.fromUrl(url);
        const image = await tiff.getImage();

        return image;

    } catch (e) {
        //console.log("no valid TIFF file", e);
        show_error(`no valid TIFF file`);
        return false;
    }
}


async function checkIfGeoTiff(image) {

    console.log(image);

    try {
        const geoKeys = image.getGeoKeys();

        const isGeoTIFF =
            Object.keys(image.getFileDirectory()).some(k =>
                [
                    "ModelPixelScale",
                    "ModelTiepoint",
                    "ModelTransformation"
                ].includes(k)
            ) ||
            Object.keys(image.getGeoKeys()).length > 0;

        console.log({
            width: image.getWidth(),
            height: image.getHeight(),
            tiled: image.isTiled,
            bands: image.getSamplesPerPixel(),
            geoKeys,
            isGeoTIFF
        });

        // add epsg to ol
        ol.proj.proj4.register(proj4);

        const epsg =
            geoKeys.ProjectedCSTypeGeoKey ??
            geoKeys.GeographicTypeGeoKey;

        if (epsg) {
            await registerEPSG(epsg);
        }
    
        return isGeoTIFF;


    } catch (e) {
        console.log("no GeoTIFF file", e);
        return false;
    }    
}

async function checkPyramidsTiles(url){

    try {
        // check if overviews exists, wich are not subsets or bands

        const tiff = await GeoTIFF.fromUrl(url);
        const count = await tiff.getImageCount();

        let hasOverviews = false;
        let isTiled = false;

        let hasOverviewsAndTiles = false;

        if (count > 1) {
            const full = await tiff.getImage(0);
        
            for (let i = 1; i < count; i++) {
                const overview = await tiff.getImage(i);
            
                if (overview.getWidth() < full.getWidth() && overview.getHeight() < full.getHeight()) {
                    hasOverviews = true;
                    break;
                }
            }
        }

        const image = await tiff.getImage();

        isTiled = image.isTiled;

        if(hasOverviews == true && isTiled == true){
            hasOverviewsAndTiles = true;
        }

        return hasOverviewsAndTiles;

    } catch (e) {
        console.log("no pyramide found", e);
        return false;
    }

}

async function checkMinMax(image) {
    const md = image.getGDALMetadata();
    const fd = image.getFileDirectory();

    let min = null;
    let max = null;

    // 1. GDAL-Statistiken
    if (md?.STATISTICS_MINIMUM && md?.STATISTICS_MAXIMUM) {
        min = parseFloat(md.STATISTICS_MINIMUM);
        max = parseFloat(md.STATISTICS_MAXIMUM);
    }
    // 2. TIFF-Tags
    else if (fd.SMinSampleValue !== undefined && fd.SMaxSampleValue !== undefined) {
        min = fd.SMinSampleValue;
        max = fd.SMaxSampleValue;
    }
    else if (fd.MinSampleValue !== undefined && fd.MaxSampleValue !== undefined) {
        min = fd.MinSampleValue;
        max = fd.MaxSampleValue;
    }

    // number of bands
    const bands = image.getSamplesPerPixel();

    return [min,max,bands];

}

async function getMinMax(image) {
    
    const noData = Number(image.getGDALNoData());

    // small sample 512x512 Pixel
    const width = image.getWidth();
    const height = image.getHeight();

    const raster = await image.readRasters({
        samples: [0],
        window: [
            0,
            0,
            Math.min(width, 512),
            Math.min(height, 512)
        ]
    });

    let min = null;
    let max = null;

    for (const value of raster[0]) {

        if (
            Number.isNaN(value) ||
            value === noData
        ) {
            continue;
        }

        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return [min,max];
}


function loadGeoTiff(sources,style,normalize){
    const osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    console.log("normalize", normalize);

    const source = new ol.source.GeoTIFF({
        interpolate: false,
        normalize: normalize,
        sources: sources,
    });

    // WebGL-optimierter Kachel-Layer aus dem Bundle
    const tileLayer = new ol.layer.WebGLTile({
        source: source, 
        style:style,
        interpolate: false
    });
    

    const map = new ol.Map({
        target: 'map',
        layers: [osm, tileLayer],
        // Automatischer Zoom und Zentrierung auf die Geometrie der TIF-Datei
        view: source.getView()
    });


    // fit to layer
    source.on('change', async () => {
        if (source.getState() === 'ready') {
            const view = await source.getView();
        
            map.getView().fit(view.extent, {
                padding: [20, 20, 20, 20],
                duration: 100
            });
        }
    });

}

async function loadTiff(url) {
    const buffer = await fetch(url).then(r => r.arrayBuffer());

    const ifds = UTIF.decode(buffer);
    UTIF.decodeImage(buffer, ifds[0]);

    const rgba = UTIF.toRGBA8(ifds[0]);

    const canvas = document.createElement("canvas");
    canvas.width = ifds[0].width;
    canvas.height = ifds[0].height;

    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    imageData.data.set(rgba);
    ctx.putImageData(imageData, 0, 0);

    // In das map-Div einfügen
    const map = document.getElementById("map");

    // Vorherigen Inhalt entfernen
    map.innerHTML = "";

    // Optional: Canvas an den Container anpassen
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";

    map.appendChild(canvas);
}

async function getColors(colorMap) {
    const colors = [];

    const entries = colorMap.length / 3;

    for (let i = 0; i < entries; i++) {
        const r = Math.round(colorMap[i] / 257);
        const g = Math.round(colorMap[i + entries] / 257);
        const b = Math.round(colorMap[i + 2 * entries] / 257);

        colors.push([r, g, b, 1]);
    }

    return colors;
}

async function getFileSize(){
    
    // size via header (replaced with metadata...)
    //  fetch(fileUrl, { method: "HEAD" })
    //    .then(r => console.log(r.headers.get("Content-Length")));

    const fileid = queryParams.fileid;
    const datasetMetadataUrl = queryParams.versionUrl;

    // metadata of dataset
    const metadata = await loadMetadata(datasetMetadataUrl);

    // metadata of all files including name and id
    const filesMetadata = metadata.data.files;

    // metadata of tiff what to preview
    const fileMetadata = filesMetadata.find(f => f.dataFile.id === fileid);

    // get file name and size (mb) of tiff
    const fileName = fileMetadata.dataFile.filename;
    const fileSize = Math.round(fileMetadata.dataFile.filesize/(1024**2));
    console.log(fileName, fileSize);

    return fileSize
}

async function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    // get file size
    const fileSize = await getFileSize();    

    // get info of raster
    const imageInfo = await getRasterInfo(fileUrl);

    // exit on invalid tiff
    if(!imageInfo){return}
    
    // check if GeoTiff
    const isGeoTiff = await checkIfGeoTiff(imageInfo);
    
    if(isGeoTiff){

        // check for pyramides and tile
        const hasOverviewsAndTiles = await checkPyramidsTiles(fileUrl);

        if (hasOverviewsAndTiles == false && fileSize > fileSizeLimit){
            show_error(`The file is too big to be displayed (limit is ${fileSizeLimit.toString()} MB).
                \nLarger GeoTIFFs can only be displayed if they use pyramids and tiles, such as COG (Cloud-Optimized GeoTIFFs).`);
        }else{

            // check min, max and bands
            let [min,max,bands] = await checkMinMax(imageInfo);            

            // get min maxif in case of one bands
            if(bands==1 && min == null){
                [min,max] = await getMinMax(imageInfo);
            } 
            //console.log(min,max,bands);

            // set nodata
            const noData = Number(imageInfo.getGDALNoData());

            let normalize = true;

            // set source
            let sources = [{url: fileUrl, noData:noData}];

            let style = null;

            // set default color ramp for greyscale
            if (bands==1){
                style = {
                  color: [
                    "case",
                
                    // NoData transparent
                    // note: ol added band 2 as nodata mask
                    ["==", ["band", 2], 0],
                    [0, 0, 0, 0],
                
                    // Farbverlauf
                    [
                      "interpolate",
                      ["linear"],
                      ["band", 1],
                    
                      0,     [30, 20, 60, 1],
                      0.25,  [80, 40, 120, 1],
                      0.5,   [180, 70, 80, 1],
                      0.75,  [240, 150, 40, 1],
                      1,     [255, 240, 180, 1]
                    ]
                  ]
                };
            }

            // check colormap           
            const fileDirectory = imageInfo.getFileDirectory();
            const colorMap = await fileDirectory.loadValue("ColorMap");

            if (colorMap!=null){

                const colors = await getColors(colorMap);
            
                normalize = false;

                style = {
                  color: [
                    "case",
                    // NoData transparent
                    // note: ol added band 2 as nodata mask
                    ["==", ["band", 2], 0],
                    [0, 0, 0, 0],

                    // pallete colors
                    [
                      "palette",
                      ["band",1],
                      colors
                    ]
                  ]
                };
            }
            // add min max in case of 1 bands for stretching
            else if(bands==1 && min != null && max != null){
                sources=[{ 
                    url: fileUrl,
                    min: min,
                    max: max 
                }];
            }

            // load geotiff
            loadGeoTiff(sources,style,normalize);
        }    

    // else it is a "normal" tiff
    }else{   
        
        // check file size
        if (fileSize > fileSizeLimit){
            show_error(`The file is too big to be displayed (limit is ${fileSizeLimit.toString()} MB).`);
        }else{
            loadTiff(fileUrl);
        }
    }

    // disable spinner
    spinner.stop();

}




function show_error(error_text){
    $('#map').hide();
    $('#file_error').show();
    $('#file_error').append(error_text);
}     

