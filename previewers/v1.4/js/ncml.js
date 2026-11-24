$(document).ready(function () {
    startPreview(false);
});

function translateBaseHtmlPage() {
    var ncmlPreviewText = $.i18n("ncmlPreviewText");
    $('.ncmlPreviewText').text(ncmlPreviewText);
}

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    var ncmlUrl = queryParams.get("siteUrl") + "/api/access/datafile/" + queryParams.get("fileid") + "/auxiliary/NcML/0.1";
    // copied from text.js
    var whiteList = {
        a: ["title"],
        abbr: ["title"],
        address: [],
        area: [],
        article: [],
        aside: [],
        audio: [],
        b: [],
        bdi: ["dir"],
        bdo: ["dir"],
        big: [],
        blockquote: ["cite"],
        br: [],
        caption: [],
        center: [],
        cite: [],
        code: [],
        col: ["align", "valign", "span", "width"],
        colgroup: ["align", "valign", "span", "width"],
        dd: [],
        del: ["datetime"],
        details: ["open"],
        div: [],
        dl: [],
        dt: [],
        em: [],
        font: ["color", "size", "face"],
        footer: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        header: [],
        hr: [],
        i: [],
        img: ["src", "alt", "title", "width", "height"],
        ins: ["datetime"],
        li: [],
        mark: [],
        nav: [],
        ol: [],
        p: [],
        pre: [],
        s: [],
        section: [],
        small: [],
        span: [],
        sub: [],
        sup: [],
        strong: [],
        table: ["width", "border", "align", "valign"],
        tbody: ["align", "valign"],
        td: ["width", "rowspan", "colspan", "align", "valign"],
        tfoot: ["align", "valign"],
        th: ["width", "rowspan", "colspan", "align", "valign"],
        thead: ["align", "valign"],
        tr: ["rowspan", "align", "valign"],
        tt: [],
        u: [],
        ul: [],
        video: []
    };
    options = { "whiteList": whiteList };
    $.ajax({
        type: 'GET',
        dataType: 'text',
        crosssite: true,
        url: ncmlUrl,
        success: function (data, status) {
            $('.preview').append($("<textarea/>").html(filterXSS(data,options))
                .attr('style', 'width:100%;height:100%;')
            );
        },
        error: function (request, status, error) {
            reportFailure($.i18n("ncmlErrorText"), error);
        }
    });
}
