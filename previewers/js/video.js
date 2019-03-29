$(document).ready(function() {
startPreview(false);
});

function writeContent(fileUrl, file, title, authors) {
addStandardPreviewHeader(file, title, authors);
          $(".preview").append($("<video/>").attr("controls","").attr("src",fileUrl));
}
