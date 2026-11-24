$(document).ready(function () {
    // Configure notebookjs with markdown and syntax highlighting when it loads
    if (typeof nb !== 'undefined') {
        // Configure markdown rendering
        if (typeof marked !== 'undefined') {
            nb.markdown = function (text) {
                return marked.parse(text);
            };
        }

        // Configure Prism syntax highlighting
        nb.highlighter = function (text, pre, code, lang) {
            if (typeof lang === 'undefined') {
                lang = 'text';
            }

            // Map notebook language to Prism language
            var languageMap = {
                'ipython': 'python',
                'ipython3': 'python',
                'python': 'python',
                'python3': 'python',
                'julia': 'julia',
                'r': 'r',
                'javascript': 'javascript',
                'js': 'javascript'
            };

            var prismLang = languageMap[lang.toLowerCase()] || lang.toLowerCase();

            // Set classes for styling
            pre.className = 'language-' + prismLang;
            if (typeof code !== 'undefined') {
                code.className = 'language-' + prismLang;
            }

            // Highlight if Prism has the language
            if (typeof Prism !== 'undefined' && Prism.languages[prismLang]) {
                return Prism.highlight(text, Prism.languages[prismLang], prismLang);
            }

            return text;
        };
    }

    // Start the preview, requesting file data retrieval
    startPreview(true);
});

function translateBaseHtmlPage() {
    // Jupyter Notebook Previewer has the title text
    var jupyterPreviewText = $.i18n("jupyterPreviewText");
    $('.jupyterPreviewText').text(jupyterPreviewText);
}

function writeContentAndData(data, fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);

    try {
        // Check if notebookjs is loaded
        if (typeof nb === 'undefined') {
            reportFailure('Error: notebookjs library failed to load. ', 'Library not available');
            return;
        }

        // Parse the notebook JSON
        var ipynbJson = JSON.parse(data);

        // Parse and render the notebook
        var notebook = nb.parse(ipynbJson);
        var rendered = notebook.render();

        // Hide spinner and display notebook
        $('.lds-spinner').hide();
        var notebookDiv = document.getElementById('notebook');
        notebookDiv.innerHTML = '';
        notebookDiv.appendChild(rendered);

    } catch (error) {
        reportFailure('Error rendering notebook: ' + error.message, error.toString());
        console.error('Rendering error:', error);
    }
}

