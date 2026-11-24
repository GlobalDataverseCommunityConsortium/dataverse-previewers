$(document).ready(function() {
    startPreview(false);
});

function translateBaseHtmlPage() {
    var videoPreviewText = $.i18n("videoPreviewText");
    $('.videoPreviewText').text(videoPreviewText);
}

function writeContent(fileUrl, file, title, authors) {
    // Currently the styling of Voyager hides this info anyway.
    //    addStandardPreviewHeader(file, title, authors);
    const lastIndexOfChar = fileUrl.lastIndexOf("/");
    const rootUrl = fileUrl.substring(0, lastIndexOfChar + 1);
    const fileName = fileUrl.substring(lastIndexOfChar + 1);
    console.log(fileUrl);
    // To use v0.43.0, we have to add the quality attribute
    // See https://github.com/Smithsonian/dpo-voyager/issues/297
    $("voyager-explorer").attr("root", rootUrl).attr("model", fileName).attr("quality", "High");
    //For Dataverse 6.4+, this can use the standard script:
    //$.getScript("https://3d-api.si.edu/resources/js/v0.42.1/voyager-explorer.min.js");
    $.getScript("lib/voyager-explorer.v0.43.0.gdcc.min.js");
}