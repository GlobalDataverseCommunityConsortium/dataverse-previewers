
$(document).ready(function() {
    startPreview(false);
});
    
function translateBaseHtmlPage() {
    var spreadsheetViewerText = $.i18n( "spreadsheetViewerText" ); 
    $( '.spreadsheetViewerText' ).text( spreadsheetViewerText );
}

function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    var handsontableContainer = document.getElementById('handsontable-container');
    var request = new XMLHttpRequest();

    request.open('GET', fileUrl, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader()

        reader.onload = function (e) {
          var csv = e.target.result;
          var data = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true
          })

          handsontableContainer.innerHTML = '';
          handsontableContainer.className = '';
      
          Handsontable(handsontableContainer, {
            data: data.data,
            rowHeaders: true,
            colHeaders: Object.keys(data.data[0]),
            columnSorting: true
          })
        }
      
        reader.readAsText(request.response);
    };
    request.send();
}

    