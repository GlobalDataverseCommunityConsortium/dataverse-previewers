$(document).ready(function() {
    startPreview(true);
});
    
function translateBaseHtmlPage() {
    var x3dPreviewText = $.i18n( "x3dPreviewText" );
    $( '.x3dPreviewText' ).text( x3dPreviewText );
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    
    /** Human readable formats could also be displayed (as text or xml or json).
    options = {};  // Custom rules
    $('.preview').append($("<pre/>").html(filterXSS(data,options)));
    */
    
    var browser = X3D.getBrowser("x3d-canvas#x3dpreviewcanvas");
    console.log("X3D Browser: " + browser.getName() + " " + browser.getVersion());
    console.log("Start loading file: " + fileUrl);
    browser.loadURL(new X3D.MFString(fileUrl));
    //browser.viewAll();
}
