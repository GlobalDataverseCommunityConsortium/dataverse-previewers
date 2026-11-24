$(document).ready(function () {
    startPreview(true);
});

function translateBaseHtmlPage() {
    $('.rocratePreviewText').text($.i18n("rocratePreviewText"));
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    const scripts = document.getElementById("scripts");
    var s1 = document.createElement("script");
    s1.type = "application/ld+json";
    s1.text = data;
    scripts.append(s1);
    var s2 = document.createElement("script");
    s2.type = "text/javascript";
    s2.src = "js/ro-crate-dynamic.min.js";
    scripts.append(s2);
}
