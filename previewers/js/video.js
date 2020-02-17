$(document).ready(function() {
startPreview(false);
});

function writeContent(fileUrl, file, title, authors) {
addStandardPreviewHeader(file, title, authors);
          $(".preview").append($("<video/>").prop("controls",true).append($('<source/>').attr("src",fileUrl)));

}
