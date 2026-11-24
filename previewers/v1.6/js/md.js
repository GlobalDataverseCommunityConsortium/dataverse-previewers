$(document).ready(function () {
    startPreview(true);
});

function translateBaseHtmlPage() {
    var mdPreviewText = $.i18n("mdPreviewText");
    $('.mdPreviewText').text(mdPreviewText);
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    const converter = new showdown.Converter();
    converter.setOption('tables', true);
    const html = converter.makeHtml(data);
    $('.preview').append($("<div/>").html(html));
}
