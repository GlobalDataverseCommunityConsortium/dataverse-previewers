$(document).ready(function() {
startPreview(false);
});

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    $('.preview').append($("<audio/>").attr("controls","").attr("src",fileUrl));
}

