$(document).ready(function() {
startPreview(false);
});

function translateBaseHtmlPage() {
      var imagePreviewText = $.i18n( "imagePreviewText" ); 
      $( '.imagePreviewText' ).text( imagePreviewText );
}

function writeContent(fileUrl, file, title, authors) {
addStandardPreviewHeader(file, title, authors);
$('.preview').append($('<img/>').attr('style','max-width:100%').attr('src',fileUrl).attr('id','previewImage'));
    $("#previewImage")
    .wrap('<span style="display:inline-block"></span>')
    .css('display', 'block')
    .parent()
    .zoom({on:'grab'});
}
