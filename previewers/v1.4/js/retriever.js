var queryParams = {};
var datasetUrl = null;
var version = null;
var fileDownloadUrl = null;
var previewMode = null;
var locale = null;

function startPreview(retrieveFile) {
    // Retrieve tool launch parameters from URL
    var params = new URLSearchParams(window.location.search.substring(1));

    // Hide header and citation to embed on Dataverse file landing page.
    previewMode = params.get('preview');
    // i18n setup
    locale = params.get('locale');

    if (locale == null) {
        locale = 'en';
    }
    var i18n = $.i18n();
    i18n.locale = locale;

    // Set the html lang attribute
    document.documentElement.setAttribute('lang', locale);

    i18n.load('i18n/' + i18n.locale + '.json', i18n.locale).done(
        function() {
            if (params.has("callback")) {
                var callback = atob(params.get("callback"));
                // Get metadata for dataset/version/file
                $.ajax({
                    dataType: "json",
                    url: callback,
                    crossite: true,
                    success: function(json, status) {
                        queryParams = json.data.queryParameters;
                        if (params.has('preview')) {
                            queryParams.preview = params.get('preview');
                        }
                        var urls = json.data.signedUrls;
                        for (var i in urls) {
                            var url = urls[i];
                            switch (url.name) {
                                case 'retrieveFileContents':
                                    queryParams.fileUrl = url.signedUrl;
                                    break;
                                case 'downloadFile':
                                    queryParams.fileDownloadUrl = url.signedUrl;
                                    break;
                                case 'getDatasetVersionMetadata':
                                    queryParams.versionUrl = url.signedUrl;
                                    break;
                                default:
                            }
                        }
                        continuePreview(retrieveFile, queryParams);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        reportFailure("Unable to use callback.", textStatus);

                    }
                });

            } else {
                params.forEach((value, key) => {
                    queryParams[key] = value;
                });
                var fileUrl = queryParams.siteUrl + "/api/access/datafile/"
                    + queryParams.fileid + "?gbrecs=true";
                var fileDownloadUrl = queryParams.siteUrl + "/api/access/datafile/"
                    + queryParams.fileid + "?gbrecs=false";
                var versionUrl = queryParams.siteUrl + "/api/datasets/"
                    + queryParams.datasetid + "/versions/"
                    + queryParams.datasetversion;
                var apiKey = queryParams.key;
                if (apiKey != null) {
                    fileUrl = fileUrl + "&key=" + apiKey;
                    fileDownloadUrl = fileUrl + "&key=" + apiKey;
                    versionUrl = versionUrl + "?key=" + apiKey;
                }
                queryParams.fileUrl = fileUrl;
                queryParams.fileDownloadUrl = fileDownloadUrl;
                queryParams.versionUrl = versionUrl;
                continuePreview(retrieveFile, queryParams);
            }
        });
}
function continuePreview(retrieveFile, queryParams) {
    //Call previewer-specific translation code
    translateBaseHtmlPage();

    if (inIframe()) {
        callPreviewerScript(retrieveFile, queryParams.fileUrl, {}, '', '');
    } else {
        // Get metadata for dataset/version/file
        $.ajax({
            dataType: "json",
            url: queryParams.versionUrl,
            crossite: true,
            success: function(json, status) {
                var mdFields = json.data.metadataBlocks.citation.fields;

                var title = "";
                var authors = "";
                datasetUrl = json.data.storageIdentifier;
                datasetUrl = datasetUrl
                    .substring(datasetUrl.indexOf("//") + 2);
                version = queryParams.datasetversion;
                if (version === ":draft") {
                    version = "DRAFT";
                }

                for (var field in mdFields) {
                    if (mdFields[field].typeName === "title") {
                        title = mdFields[field].value;
                    }
                    if (mdFields[field].typeName === "author") {
                        var authorFields = mdFields[field].value;
                        for (var author in authorFields) {
                            if (authors.length > 0) {
                                authors = authors + "; ";
                            }
                            authors = authors
                                + authorFields[author].authorName.value;
                        }
                    }
                }
                var datafiles = json.data.files;
                var fileIndex = 0;
                for (var entry in datafiles) {
                    if (JSON.stringify(datafiles[entry].dataFile.id) == queryParams.fileid) {
                        fileIndex = entry;
                        callPreviewerScript(retrieveFile, queryParams.fileUrl, datafiles[fileIndex].dataFile, title, authors);
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reportFailure("Unable to retrieve metadata.", textStatus);

            }
        });
    }

}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function callPreviewerScript(retrieveFile, fileUrl, fileMetadata, title, authors) {
    if (retrieveFile) {
        $.ajax({
            type: 'GET',
            dataType: 'text',
            crosssite: true,
            url: fileUrl,
            success: function(data, status) {
                writeContentAndData(data, fileUrl,
                    fileMetadata,
                    title, authors);
            },
            error: function(request, status, error) {
                reportFailure(
                    "Unable to retrieve file.",
                    status);
            }
        });

    } else {
        writeContent(queryParams.fileUrl,
            fileMetadata, title,
            authors);
    }
}

var filePageUrl = null;

function addStandardPreviewHeader(file, title, authors) {
    if (previewMode !== 'true') {
        // Add favicon from source Dataverse
        $('head')
            .append(
                $('<link/>')
                    .attr('sizes', '180x180')
                    .attr('rel', 'apple-touch-icon')
                    .attr(
                        'href',
                        queryParams.siteUrl +
                        '/javax.faces.resource/images/fav/apple-touch-icon.png.xhtml'))
            .append(
                $('<link/>')
                    .attr('type', 'image/png')
                    .attr('sizes', '16x16')
                    .attr('rel', 'icon')
                    .attr(
                        'href',
                        queryParams.siteUrl +
                        '/javax.faces.resource/images/fav/favicon-16x16.png.xhtml'))
            .append(
                $('<link/>')
                    .attr('type', 'image/png')
                    .attr('sizes', '32x32')
                    .attr('rel', 'icon')
                    .attr(
                        'href',
                        queryParams.siteUrl +
                        '/javax.faces.resource/images/fav/favicon-32x32.png.xhtml'))

            .append(
                $('<link/>')
                    .attr('color', '#da532c')
                    .attr('rel', 'mask-icon')
                    .attr(
                        'href',
                        queryParams.siteUrl +
                        '/javax.faces.resource/images/fav/safari-pinned-tab.svg.xhtml'))
            .append(
                $('<meta/>')
                    .attr('content', '#da532c')
                    .attr('name', 'msapplication-TileColor'))
            .append(
                $('<meta/>')
                    .attr('content', '#ffffff')
                    .attr('name', 'theme-color'));

        // Add logo from source Dataverse or use a local one, unless we are in preview mode
        $('#logo')
            .attr('src', queryParams.siteUrl + '/logos/preview_logo.png')
            .attr(
                'onerror',
                'this.onerror=null;this.src="images/logo_placeholder.png";');
    }
    //Footer
    var footer = $.i18n("footer");
    $('body').append($('<footer/>').html(footer).attr('id', 'preview-footer'));

    if (previewMode !== 'true') {
        options = {
            "stripIgnoreTag": true,
            "stripIgnoreTagBody": ['script', 'head']
        }; // Custom rules  for filterXSS
        //Translated text used in the preview header

        var filenameText = $.i18n("filenameText");
        var inText = $.i18n("inText");
        var byText = $.i18n("byText");
        var uploadedOnText = $.i18n("uploadedOnText");
        var downloadFileText = $.i18n("downloadFileText");
        var closePreviewText = $.i18n("closePreviewText");
        var versionText = $.i18n("versionText");
        var descriptionText = $.i18n("descriptionText");
        filePageUrl = queryParams.siteUrl + "/file.xhtml?";
        if (!("persistentId" in file) || file.persistentId.length == 0) {
            filePageUrl = filePageUrl + "fileId=" + file.id;
        } else {
            filePageUrl = filePageUrl + "persistentId=" + file.persistentId;
        }
        filePageUrl = filePageUrl + "&version=" + version;
        var header = $('.preview-header').append($('<div/>'));
        header.append($("<div/>").append($("<span/>").text(filenameText)).append(
            $('<a/>').attr('href', filePageUrl).text(file.filename)).attr('id',
                'filename'));
        if ((file.description != null) && (file.description.length > 0)) {
            header.append($('<div/>').html(filterXSS("<span>" + descriptionText + "</span>" + file.description), options));
        }
        header.append($('<div/>').append($("<span/>").text(inText)).append(
            $('<span/>').attr('id', 'dataset').append(
                $('<a/>').attr(
                    'href',
                    queryParams.siteUrl
                    + "/dataset.xhtml?persistentId=doi:"
                    + datasetUrl + "&version=" + version).text(
                        title))).append(
                            $('<span/>').html(" (<span>" + versionText + "</span> " + version + ")").attr('id', 'version')).append(
                                $('<span/>').text(byText)).append(
                                    $('<span/>').text(authors).attr('id', 'authors')));
        header.append($("<div/>").addClass("btn btn-default").html(
            "<a href='" + queryParams.fileDownloadUrl + "'>" + downloadFileText + "</a>"));
        header.append($("<div/>").addClass("btn btn-default").html(
            "<a href=\"javascript:window.close();\">" + closePreviewText + "</a>"));
        if (file.creationDate != null) {
            header.append($("<div/>").addClass("preview-note").text(
                uploadedOnText + file.creationDate));
        }
    }
    if (previewMode === 'true') {
        $('#logo').hide();
        $('.page-title').hide();
        $('.preview-header').hide();
    }
}

function reportFailure(msg, statusCode) {
    var preview = $(".preview");
    preview.addClass("alert alert-danger");

    var errorText = $.i18n("errorText");

    preview
        .text(msg
            + errorText
            + statusCode);
}
