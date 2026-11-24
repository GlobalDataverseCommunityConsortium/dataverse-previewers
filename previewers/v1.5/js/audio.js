$(document).ready(function() {
    startPreview(false);
});

function translateBaseHtmlPage() {
    var audioPreviewText = $.i18n( "audioPreviewText" );
    $( '.audioPreviewText' ).text( audioPreviewText );
}

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    $('.preview').append($("<audio/>").attr("controls","").attr("src",fileUrl));
}

