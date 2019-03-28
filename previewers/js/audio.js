$(document).ready(function() {
startPreview(true);
});

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    $('.preview').append($("<audio/>").attr("controls","").attr("src",fileUrl));
}

