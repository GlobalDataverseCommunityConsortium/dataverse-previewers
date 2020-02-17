$(document).ready(function() {
startPreview(true);
});

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file,title, authors);
options = {"stripIgnoreTag":true,
           "stripIgnoreTagBody":['script','head']};  // Custom rules

    $('.preview').append($("<div/>").html(filterXSS(data,options)));
}
