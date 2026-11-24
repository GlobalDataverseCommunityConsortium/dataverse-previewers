$(document).ready(function() {
    startPreview(true);
});

function translateBaseHtmlPage() {
    var htmlPreviewText = $.i18n( "htmlPreviewText" ); 
    $( '.htmlPreviewText' ).text( htmlPreviewText );
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file,title, authors);
    options = {"stripIgnoreTag":true,
        "stripIgnoreTagBody":['script','head']};  // Custom rules

    $('.preview').append($("<div/>").html(filterXSS(data,options)));
}
