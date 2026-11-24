$(document).ready(function() {
    startPreview(true);
});

function translateBaseHtmlPage() {
    var htmlPreviewText = $.i18n("htmlPreviewText");
    $('.htmlPreviewText').text(htmlPreviewText);
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    options = {
        "stripIgnoreTag": true,
        "stripIgnoreTagBody": ['script', 'head']
    };  // Custom rules
    hasRichContent = false;
    if (data.includes('<script') || data.includes('<head')) {
        hasRichContent = true;
    }
    if (hasRichContent) {
        //Add Rich Content warning and choice buttons
        var header = $('<div/>').insertBefore($('.preview')).addClass('preview-header container center');;
        url = fileUrl;
        theData = data;
        header.append($('<div/>').html($.i18n('richContentWarning')).addClass('center'));
        subheader = $('<div/>').appendTo(header).addClass('center');
        subheader.append($("<div/>").addClass("btn btn-default")
             .html($('<a/>').html( $.i18n('displayWithRichContent'))
                 .click(function(){console.log('Click');$('.preview').html(theData);})
             )
        );
        subheader.append($("<div/>").addClass("btn btn-default")
             .html($('<a/>').html( $.i18n('displayWithoutRichContent'))
                 .click(function(){console.log('Click');$('.preview').html(filterXSS(theData,options));})
             )
        );
    } else {
        //Display filtered content as for normal HTML Previewer
        $('.preview').append($("<div/>").html(filterXSS(data)));
    }

}

