
$(document).ready(function() {
startPreview(true);
});

function writeContentAndData(json, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file,title, authors);
    

  // Order by TextPositionSelector.start
  json.rows.sort(annotationCompare);

  // Create header block
  var hypo = $(".hypothesis");
  var url = json.rows[0].target[0].source;
  var header = $("<div/>").addClass("annotation-header");
  header
      .append($("<div/>")
          .html(
              "This is the annotations-only view of the ATI data project <a href=\"javascript:returnToDataset(parentUrl);\">"
                  + title + "</a> by " + authors + "."));
  header.append($("<div/>").addClass("btn btn-default").append(
      $("<a/>").attr("href", json.rows[0].links.incontext).text(
          "View Annotations In Context")));
  header
      .append($("<div/>")
          .addClass("btn btn-default")
          .html(
              "<a href=\"javascript:returnToDataset(parentUrl);\">Return To The Data Project.</a>"));
  header.append($("<div/>").addClass("annotation-note").text(
      json.total + " annotations, retrieved on " + file.creationDate));

  hypo.before(header);

  if (hypo.length > 0) {
    var converter = new showdown.Converter({
      extensions : [ 'xssFilter' ]
    });
    hypo.html("");

    //Display annotations
    var list = $("<ol>").appendTo(hypo);
    for ( var row in json.rows) {
      var selectors = json.rows[row].target[0].selector;
      var quote = "";
      for ( var k in selectors) {
        if (selectors[k].type == "TextQuoteSelector") {
          quote = selectors[k].exact;
        }
      }
      var created = json.rows[row].created;
      list
          .append($('<li class="annotation-card">')
              .append(
                  $(
                      '<blockquote class="annotation-card__quote" title="Annotation quote">')
                      .text(quote))
              .append(
                  $('<div class="annotation-card__text">')
                      .html(
                          converter
                              .makeHtml(json.rows[row].text))));
      var tags = ($('<div class="annotation-card__tags" title="Tags">'))
          .appendTo(list);
      for ( var j in json.rows[row].tags) {
        tags.append($('<div class="annotation-card__tag">').text(
            json.rows[row].tags[j]));
      }
    }
    $('.annotation-card__text a').attr("rel", "noopener nofollow").attr(
        "target", "_blank");
  }
}

function annotationCompare(a, b) {
  var aPosition = 0;
  var bPosition = 0;
  for ( var j in a.target[0].selector) {
    if (a.target[0].selector[j].type === "TextPositionSelector") {
      aPosition = a.target[0].selector[j].start;
    }
  }
  for ( var j in b.target[0].selector) {
    if (b.target[0].selector[j].type === "TextPositionSelector") {
      bPosition = b.target[0].selector[j].start;
    }
  }
  if (aPosition < bPosition)
    return -1;
  if (aPosition > bPosition)
    return 1;
  return 0;
}


