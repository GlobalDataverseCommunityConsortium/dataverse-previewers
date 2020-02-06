# dataverse-previewers
A collection of data file previewers that conform to the [Dataverse](https://dataverse.org) external tools interface

![Preview common data types](https://github.com/QualitativeDataRepository/dataverse-previewers/blob/master/examples/datasetdisplay.png?raw=true)

## Installation
These previewers can be run without downloading them by simply running the curl command(s) below to register then with your local dataverse instance. There is one command per mimetype you wish to preview (i.e. multiple commands to cover different types of images.) You can run any/all of the commands as you like. Note that the Hypothesis annotation previewer assumes a custom mimetype and may not be useful for most Dataverses (contact QDR for more information). Dataverse 4.11+ is required.

Dataverse installations configured to redirect to S3 storage for file downloads will need to enable CORS at the storage layer as well as the application layer. (See, for example, [Amazon's CORS configuration guidance](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-cors-configuration.html)).

## How do they work?
The tools here are lightweight wrappers around standard HTML5 functionality (e.g. audio, video), or third-party libraries (pdf) or some combination (e.g. standard image displays with a third-party library to allow zooming, simple text/html displays with third-party libraries used to sanitize content to avoid security issues). 

## Customizations: 
The previewers will use your favicon if it exists at the default Dataverse location: ```<your site URL>/javax.faces.resource/images/favicondataverse.png.xhtml```
They will also place your logo in the upper left corner (240px wide x 140px high recommended) if you add one at ```<your site URL>/logos/preview_logo.png``` (which, by default, corresponds to a file of that name in your glassfish ./docroot/logos directory (e.g. /usr/local/glassfish4/glassfish/domains/domain1/docroot/logos)). By default, a blank white image is shown.

## Known Limitations:

To preview restricted content, a user must have permission to view the relevant dataset version and download the relevant file and must have created an API Token for themselves in Dataverse. (Viewing public/published content does not require an API Token.) Note that API Tokens should be treated like passwords - if you use previewers on public computers, you may want to 'Recreate' your API Token afterward (to invalidate the previous one). Also note that API Tokens expire - you may need to 'Recreate' one if you have not used it in a while. 

File creation date is only shown in the header for Dataverse v4.12+.
  
Video seeking does not work on some browsers and some Dataverse instances due to the lack of support in some Dataverse storageIO drivers for partial file downloads. As of now, Seeking does not work in Chrome but does work in Firefox. Other browsers haven't been tested.

## How can I help?
The original tools were developed through the [Qualitative Data Repository](https://qdr.syr.edu) but are being offered to the Dataverse community at large. 

The Spreadsheet Previewer was contributed by [anncie-pcss](https://github.com/anncie-pcss).

If you are interested in adding additional previewers, or in maintaining/enhancing existing ones, contact us at [dataverse-dev@googlegroups.com](mailto:dataverse-dev@googlegroups.com) or work through github to fork/make pull-requests against the repository.

### Curl commands to configure these tools with your dataverse instance:
You should be able to cut/paste any/all of the commands below to run on your Dataverse machine:

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Read Text\\",
>  \\"description\\":\\"Read the text file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/TextPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"text/plain\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Html\\",
>  \\"description\\":\\"View the html file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/HtmlPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"text/html\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Play Audio\\",
>  \\"description\\":\\"Listen to an audio file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/AudioPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"audio/mp3\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Play Audio\\",
>  \\"description\\":\\"Listen to an audio file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/AudioPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"audio/ogg\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Image\\",
>  \\"description\\":\\"Preview an image file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/ImagePreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"image/gif\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Image\\",
>  \\"description\\":\\"Preview an image file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/ImagePreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"image/jpeg\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Image\\",
>  \\"description\\":\\"Preview an image file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/ImagePreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"image/png\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Read Document\\",
>  \\"description\\":\\"Read a pdf document.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/PDFPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"application/pdf\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Play Video\\",
>  \\"description\\":\\"Watch a video file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/VideoPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"video/mp4\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Play Video\\",
>  \\"description\\":\\"Watch a video file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/VideoPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"video/ogg\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"Play Video\\",
>  \\"description\\":\\"Watch a video file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/VideoPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"video/quicktime\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Data\\",
>  \\"description\\":\\"View the spreadsheet data.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/SpreadsheetPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"text/comma-separated-values\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Data\\",
>  \\"description\\":\\"View the spreadsheet data.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/SpreadsheetPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"text/tab-separated-values\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Stata File\\",
>  \\"description\\":\\"View the Stata file as text.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/TextPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"application/x-stata-syntax\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View R file\\",
>  \\"description\\":\\"View the R file as text.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/TextPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"type/x-r-syntax\\"
>}"

>curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \\
>"{
>  \\"displayName\\":\\"View Annotations\\",
>  \\"description\\":\\"View the annotation entries in a file.\\",
>  \\"scope\\":\\"file\\",
>  \\"type\\":\\"explore\\",
>  \\"hasPreviewMode\\":\\"true\\",
>  \\"toolUrl\\":\\"https://globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers/HypothesisPreview.html\",
>  \\"toolParameters\\": {
>      \\"queryParameters\\":[
>        {\\"fileid\\":\\"{fileId}\\"},
>        {\\"siteUrl\\":\\"{siteUrl}\\"},
>        {\\"key\\":\\"{apiToken}\\"},
>        {\\"datasetid\\":\\"{datasetId}\\"},
>        {\\"datasetversion\\":\\"{datasetVersion}\\"}
>      ]
>    },
>  \\"contentType\\":\\"application/x-json-hypothesis\\"
>}"




