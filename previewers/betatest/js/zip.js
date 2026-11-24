
$(document).ready(function () {
    startPreview(false);
});

function translateBaseHtmlPage() {
    var zipPreviewText = $.i18n("zipPreviewText");
    $('.zipPreviewText').text(zipPreviewText);
    $('.zipDownloadCompleteText').html($.i18n("zipDownloadCompleteText"));
}

async function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    readZip(fileUrl);



}

const MAX_ENTRIES_EXPANDED = 2000;
let entries;
let isSplitArchive = false;

async function readZip(fileUrl) {

    try {
        //Just a workaround, as current Dataverse delivers https links for localhost
        if (fileUrl.startsWith('https://localhost')) {
            fileUrl = fileUrl.replace('https://localhost', 'http://localhost');
        }


        const rangeReader = new zip.HttpRangeReader(fileUrl);
        await rangeReader.init();
        isSplitArchive = await isSplitZip(rangeReader);
        const reader = new zip.ZipReader(rangeReader);

        // get all entries from the zip
        entries = await reader.getEntries();
        if (entries.length) {

            const entryMap = {};
            const entryList = [];

            entries.forEach(function(entry, index) {

                const treeObject = {};
                
                let filename = entry.filename;
                //remove slash at end of string if available
                if (filename.endsWith('/')) {
                    filename = filename.slice(0, filename.length - 1);
                }

                //split into parts before and after last slash
                const lastIndex = filename.lastIndexOf('/');
                let before = 'root';
                if (lastIndex != -1) {
                    before = filename.slice(0, lastIndex + 1);
                }

                //the filename without directories
                const after = filename.slice(lastIndex + 1);
                //add the pure filename to the entry to be set in the donwload-link later
                entry.filenameOnly = after;

                const humanReadableSize = fileSizeSI(entry.uncompressedSize);
                const parentListNode = entryMap[before];

                //fancytree settings
                treeObject.title = after;
                treeObject.folder = entry.directory;
                treeObject.unselectable = true;

                //Additional settings to read out
                treeObject.index = index;
                treeObject.size = humanReadableSize;
                treeObject.encrypted = entry.encrypted;
                treeObject.filename = entry.filename;

                if(entry.directory) {
                    //if tree is too large, set lazy load and do not expand nodes at beginning
                    treeObject.expanded = entries.length <= MAX_ENTRIES_EXPANDED;
                    treeObject.lazy = entries.length > MAX_ENTRIES_EXPANDED;

                    entryMap[entry.filename] = treeObject;
                }
                
             
                

                if(parentListNode) {
                    if(!parentListNode.children){
                        parentListNode.children=[];
                    }
                    parentListNode.children.push(treeObject);
                }
                else {
                    entryList.push(treeObject);
                }

            });

            // close the ZipReader
            await reader.close();

            if (isSplitArchive) {
                showSplitWarning();
            }

            createTree(entryList);

         
        }
    }
    catch (err) {
        //Display error message
        const errorMsg = document.createTextNode("Zip file structure could not be read (" + err + "). You can still download the zip file.");
        document.getElementById('zip-preview').appendChild(errorMsg);
        console.log(err);

    }
    finally {
        //remove throbber
        const throbber = document.getElementById("throbber");
        if (throbber)
            throbber.parentNode.removeChild(throbber);
    }





}


async function isSplitZip(reader) {
    const EOCD_SIGNATURE = 0x06054b50;
    const EOCD_LENGTH = 22;
    const MAX_COMMENT_LENGTH = 0xFFFF;

    // Most zips have no comment, so the EOCD is exactly the last 22 bytes; only scan further if not
    for (const maxScan of [EOCD_LENGTH, EOCD_LENGTH + MAX_COMMENT_LENGTH]) {
        const scanLength = Math.min(reader.size, maxScan);
        const data = await reader.readUint8Array(reader.size - scanLength, scanLength);
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        for (let i = data.length - EOCD_LENGTH; i >= 0; i--) {
            if (view.getUint32(i, true) === EOCD_SIGNATURE) {
                const commentLength = view.getUint16(i + 20, true);
                if (i + EOCD_LENGTH + commentLength === data.length) {
                    const diskNumber = view.getUint16(i + 4, true);
                    return diskNumber > 0;
                }
            }
        }
        if (scanLength === reader.size) {
            break;
        }
    }
    return false;
}

function showSplitWarning() {
    const warning = document.createElement('div');
    warning.className = 'alert alert-warning';
    warning.innerHTML = $.i18n("zipSplitWarning");
    const downloadText = document.querySelector('.zipDownloadCompleteText');
    downloadText.parentNode.insertBefore(warning, downloadText);
}

function fileSizeSI(a, b, c, d, e) {
    return (b = Math, c = b.log, d = 1000, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2)
        + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes')
}


async function downloadFile(event) {
    const target = event.currentTarget;
    let href = target.getAttribute("href");
    if (target.dataset.entryIndex !== undefined && !target.download) {
        target.removeAttribute("href");
        event.preventDefault();
        try {
            await download(entries[Number(target.dataset.entryIndex)], target.parentElement, target);
            href = target.getAttribute("href");
        } catch (error) {
            alert(error);
        }
        target.setAttribute("href", href);
    }
}

async function download(entry, li, a) {
    if (!li.classList.contains("busy")) {
        
        $('#modalTextContent').text(entry.filename);
        const controller = new AbortController();
        const signal = controller.signal;

        $('#modalAbortButton').click(() => controller.abort());
        li.classList.add("busy");
        $('#myModal').modal('show');
        try {
            const blobURL = URL.createObjectURL(await entry.getData(new zip.BlobWriter(), {
                onprogress: (index, max) => {
                    
                    const percent = Math.round(index/max*100);
                    console.log(index + "   " + max  + "   " + percent);
                    setProgressBarValue(percent);
                    
                },
                signal
            }))

            a.href = blobURL;
            a.download = entry.filenameOnly;
            const clickEvent = new MouseEvent("click");
            a.dispatchEvent(clickEvent);
        } catch (error) {
            if (error.message != zip.ERR_ABORT) {
                throw error;
            }
        } finally {
            li.classList.remove("busy");
            $('#myModal').modal('hide');
            $('#modalAbortButton').unbind();
            setProgressBarValue(0);
        }
    }
}

async function setProgressBarValue(val) {
    $('#modalProgressBar').css('width', val+'%').attr('aria-valuenow', val).text(val + ' %');
}


async function lazyLoad(event, data) {

}

//Create Tree
async function createTree(dataStructure) {
    $("#treegrid").fancytree({
        extensions: ["table", "glyph"],
        checkbox: false,
        table: {
          indentation: 20,      // indent 20px per node level
          nodeColumnIdx: 0,     // render the node title into the 1st column
        },
        source: dataStructure,
        

        tooltip: function(event, data){
          return data.node.data.filename;
        },
        glyph: {
            // The preset defines defaults for all supported icon types.
            preset: "bootstrap3",
        },
        beforeActivate: function(event, data){
            //Prevent activation for every node
            return false;
            
          },
    
    
        renderColumns: function(event, data) {
          
            var node = data.node,
            $tdList = $(node.tr).find(">td");
            
            // (index #0 is rendered by fancytree by adding the title)
            if(!node.folder) {
                $tdList.eq(1).text(node.data.size);

                if(!node.data.encrypted && !isSplitArchive) {
                const downloadLink = $('<a href="#" data-entry-index="' + node.data.index + '">');
                downloadLink.click(downloadFile);
                downloadLink.append('<span class="icon glyphicon glyphicon-download-alt"></span>');
                
                $tdList.eq(2).html(downloadLink);
                }
            }

        }
      });
    
    

} 

