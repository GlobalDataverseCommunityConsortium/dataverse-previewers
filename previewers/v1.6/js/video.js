$(document).ready(function() {
    startPreview(false);
});

function translateBaseHtmlPage() {
    var videoPreviewText = $.i18n( "videoPreviewText" );
    $( '.videoPreviewText' ).text( videoPreviewText );
}

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    const queryParams = new URLSearchParams(window.location.search.substring(1));
    const id = queryParams.get("datasetid");
    const siteUrl = queryParams.get("siteUrl");
    const apiKey = queryParams.get("key");
    if (!siteUrl || !id) {
        // fallback to simple video element in case of signed URLs
        $(".preview").append($("<video/>") .prop("controls", true) .append($('<source/>').attr("src", fileUrl)))
        return;
    }
    const versionUrl = `${siteUrl}/api/datasets/${id}/versions/`
        + queryParams.get("datasetversion")
        + (apiKey?`?key=${apiKey}`:'');
    const videoId =queryParams.get("fileid") * 1; // converted to number
    const userLanguages = [...navigator.languages];
    const locale = queryParams.get("locale");
    if (locale && !userLanguages.includes(locale)) {
        userLanguages.unshift(locale); // add query argument as first element
    }

    $.ajax({
        type: 'GET',
        dataType: 'json',
        crosssite: true,
        url: versionUrl,
        success: function(data, status) {
            appendVideoElements(fileUrl, videoId, data.data.files, siteUrl, userLanguages, apiKey);
        },
        error: function(response, status, error) {
            // fallback to simple video element
            $(".preview").append($("<video/>") .prop("controls", true) .append($('<source/>').attr("src", fileUrl)))
        }
    });
}

function appendVideoElements(fileUrl, videoId, files, siteUrl, userLanguages, apiKey) {

    const baseName = files // the video file name without extension
        .find(item => item.dataFile.id === videoId)
        .label.replace(/\.[a-z0-9]+$/i,'');

    // find labels like "baseName.en.vtt", "baseName.de-CH.vtt" or "baseName.vtt"
    const regex = new RegExp(`${baseName}(\\.([-a-z]+))?\\.vtt$`, 'i')

    // create a map of URLs with their (optional) language
    let trackUrlWithoutLang = null;
    const subtitles = files
        .filter(item => regex.test(item.label))
        .reduce((map, item) => {
            const lang = item.label.match(regex)[2];
            const url = apiKey
                ?`${siteUrl}/api/access/datafile/${item.dataFile.id}?gbrecs=true&amp;key=${apiKey}`
                :`${siteUrl}/api/access/datafile/${item.dataFile.id}?gbrecs=true`
            map.set(url, lang);
            if (!lang) {
                trackUrlWithoutLang = url;
            }
            return map;
        }, new Map());

    // sort subtitles by language value, 'de-CH' before 'de'
    const sortedSubtitles = new Map([...subtitles.entries()].sort((a, b) => {
        if (!a[1]) return 1;
        if (!b[1]) return -1;
        if (a[1].startsWith(b[1])) return -1;
        if (b[1].startsWith(a[1])) return 1;
        return a[1].localeCompare(b[1]);
    }));

    // determine default track
    let defaultTrackUrl = null;
    loop: for (const lang of userLanguages) {
        // match user preferences with available subtitles
        for (const [url, trackLang] of sortedSubtitles) {
            if (trackLang) {
                if (trackLang === lang || trackLang.startsWith(lang.replace(/-.*/, ''))) {
                    defaultTrackUrl = url;
                    break loop;
                }
            }
        }
    }
    if (!defaultTrackUrl && subtitles) {
        // no match found, use track without language
        defaultTrackUrl = trackUrlWithoutLang;
    }
    if (!defaultTrackUrl && subtitles.size === 1) {
        // no match found, and only one track available, use that one
        defaultTrackUrl = subtitles.keys().next().value;
    }

    const videoElement = $("<video/>")
        .attr("crossorigin", "anonymous") // required for getting subtitles from object storage
        .prop("controls", true)
        .append($('<source/>').attr("src", fileUrl));

    sortedSubtitles.forEach((trackLang, url) => {
        const trackElement = $('<track/>')
            .attr("kind", "subtitles")
            .attr("src", url);
        if (trackLang) {
            trackElement
                .attr("label", trackLang)
                .attr("srclang", trackLang);
        } else {
            trackElement.attr("label", "default");
        }
        console.log("url: ", url, "defaultTrackUrl: ", defaultTrackUrl);
        if (url === defaultTrackUrl) {
            trackElement.attr("default", true);
        }
        videoElement.append(trackElement);
    });

    $(".preview").append(videoElement);
}
