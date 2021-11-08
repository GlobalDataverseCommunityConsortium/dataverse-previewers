# Example Curl Commands to register previewers for Dataverse, version <= 5.1

You should be able to cut/paste any/all of the commands below to run on your Dataverse machine:

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Read Text",
  "description":"Read the text file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/TextPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"text/plain"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Html",
  "description":"View the html file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/HtmlPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"text/html"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Audio",
  "description":"Listen to an audio file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/AudioPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"audio/mp3"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Audio",
  "description":"Listen to an audio file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/AudioPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"audio/mpeg"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Audio",
  "description":"Listen to an audio file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/AudioPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"audio/wav"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Audio",
  "description":"Listen to an audio file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/AudioPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"audio/ogg"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Image",
  "description":"Preview an image file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/ImagePreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"image/gif"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Image",
  "description":"Preview an image file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/ImagePreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"image/jpeg"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Image",
  "description":"Preview an image file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/ImagePreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"image/png"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Read Document",
  "description":"Read a pdf document.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/PDFPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"application/pdf"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Video",
  "description":"Watch a video file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/VideoPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"video/mp4"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Video",
  "description":"Watch a video file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/VideoPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"video/ogg"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"Play Video",
  "description":"Watch a video file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/VideoPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"video/quicktime"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Data",
  "description":"View the spreadsheet data.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/SpreadsheetPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"text/comma-separated-values"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Data",
  "description":"View the spreadsheet data.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/SpreadsheetPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"text/tab-separated-values"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Data",
  "description":"View the spreadsheet data.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/SpreadsheetPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"text/csv"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Data",
  "description":"View the spreadsheet data.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/SpreadsheetPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"text/tsv"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Stata File",
  "description":"View the Stata file as text.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/TextPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"application/x-stata-syntax"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View R file",
  "description":"View the R file as text.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/TextPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"type/x-r-syntax"
}'
```

```bash
curl -X POST -H 'Content-type: application/json' http://localhost:8080/api/admin/externalTools -d \
'{
  "displayName":"View Annotations",
  "description":"View the annotation entries in a file.",
  "scope":"file",
  "type":"explore",
  "hasPreviewMode":"true",
  "toolUrl":"https://gdcc.github.io/dataverse-previewers/previewers/v1.1/HypothesisPreview.html",
  "toolParameters": {
      "queryParameters":[
        {"fileid":"{fileId}"},
        {"siteUrl":"{siteUrl}"},
        {"key":"{apiToken}"},
        {"datasetid":"{datasetId}"},
        {"datasetversion":"{datasetVersion}"},
        {"locale":"{localeCode}"}
      ]
    },
  "contentType":"application/x-json-hypothesis"
}'
```
