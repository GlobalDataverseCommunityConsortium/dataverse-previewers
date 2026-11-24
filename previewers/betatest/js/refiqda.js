function writeContent(fileUrl, file, title, authors) {
  addStandardPreviewHeader(file, title, authors);
  options = {
    "stripIgnoreTag": true,
    "stripIgnoreTagBody": ['script', 'head']
  };  // Custom rules
  showWaitingIndicator('refiqdaRetrievingFile');

  if (fileUrl.includes('auxiliary/qdpx')) {
    redactedMode = true;
  } else {
    redactedMode = false;
  }
  fetch(fileUrl)
    .then(response => response.text())
    .then(data => parseData(data, file));
}
