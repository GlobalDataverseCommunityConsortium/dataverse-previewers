const { inspectSevenZipUrl, extractEntryBytes } = SevenZipHttpRangeParser

const MAX_ENTRIES_EXPANDED = 2000;
let entries = [];
let inspectionResult = null;
let currentFileUrl = null;

$(document).ready(function () {

    startPreview(false);
});

window.translateBaseHtmlPage = function translateBaseHtmlPage() {
    var sevenZipPreviewText = $.i18n("sevenZipPreviewText");
    $(".sevenZipPreviewText").text(sevenZipPreviewText);
    $(".sevenZipPreviewInfoText").html($.i18n("sevenZipPreviewInfoText"));
};

window.writeContent = async function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    await readSevenZip(fileUrl);
};

async function readSevenZip(fileUrl) {
    try {
        if (fileUrl.startsWith("https://localhost")) {
            fileUrl = fileUrl.replace("https://localhost", "http://localhost");
        }

        currentFileUrl = fileUrl;
        inspectionResult = await inspectSevenZipUrl(fileUrl);
        entries = inspectionResult.entries || [];

        if (entries.length) {
            createTree(buildTreeData(entries));
        }
    } catch (err) {
        const errorMsg = document.createTextNode(
            "7zip file structure could not be read (" + err + "). You can still download the archive file."
        );
        document.getElementById("sevenzip-preview").appendChild(errorMsg);
        console.log(err);
    } finally {
        const throbber = document.getElementById("throbber");
        if (throbber) {
            throbber.parentNode.removeChild(throbber);
        }
    }
}

function buildTreeData(currentEntries) {
    const rootList = [];
    const folderNodeMap = new Map();
    const listIsLarge = currentEntries.length > MAX_ENTRIES_EXPANDED;

    function ensureFolder(path, title, parentChildren) {
        if (folderNodeMap.has(path)) {
            return folderNodeMap.get(path);
        }
        const node = {
            title: title,
            folder: true,
            unselectable: true,
            expanded: !listIsLarge,
            lazy: listIsLarge,
            filename: path,
            children: []
        };
        folderNodeMap.set(path, node);
        parentChildren.push(node);
        return node;
    }

    currentEntries.forEach(function (entry, index) {
        const originalPath = entry.path || entry.name || "";
        const normalizedPath = originalPath.replace(/[\\/]+$/, "");
        const segments = normalizedPath.split(/[\\/]+/).filter(Boolean);
        if (!segments.length) {
            return;
        }

        let parentPath = "";
        let parentChildren = rootList;

        segments.forEach(function (segment, segmentIndex) {
            const isLast = segmentIndex === segments.length - 1;
            const nodePath = parentPath ? parentPath + "/" + segment : segment;

            if (isLast && !entry.isDirectory) {
                const treeObject = {
                    title: segment,
                    folder: false,
                    unselectable: true,
                    index: index,
                    size: formatEntrySize(entry.size),
                    filename: originalPath,
                    isAntiFile: entry.isAntiFile === true
                };
                parentChildren.push(treeObject);
                return;
            }

            const folderNode = ensureFolder(nodePath, segment, parentChildren);
            parentChildren = folderNode.children;
            parentPath = nodePath;
        });
    });

    return rootList;
}

function formatEntrySize(size) {
    if (size === null || size === undefined) {
        return "";
    }

    if (typeof size === "bigint") {
        if (size > BigInt(Number.MAX_SAFE_INTEGER)) {
            return size.toString() + " B";
        }
        return fileSizeSI(Number(size));
    }

    if (typeof size === "number" && Number.isFinite(size)) {
        return fileSizeSI(size);
    }

    return "";
}

function fileSizeSI(bytes) {
    if (bytes === 0) {
        return "0 Bytes";
    }
    const units = ["Bytes", "kB", "MB", "GB", "TB", "PB", "EB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
    const value = bytes / Math.pow(1000, exponent);
    return value.toFixed(2) + " " + units[exponent];
}

async function downloadFile(event) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget;
    if (target.dataset.entryIndex === undefined) {
        return;
    }

    const entry = entries[Number(target.dataset.entryIndex)];
    if (!entry) {
        return;
    }

    try {
        await download(entry, target.parentElement);
    } catch (error) {
        alert(error);
    }
}

function triggerBrowserDownload(fileName, bytes) {
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const blobURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobURL);
}

async function download(entry, li) {
    if (li.classList.contains("busy")) {
        return;
    }

    const fileName = (entry.path || "")
        .split(/[\\/]+/)
        .filter(Boolean)
        .pop() || "download.bin";

    $("#modalTextContent").text(entry.path || fileName);
    $("#modalAbortButton").hide();
    li.classList.add("busy");
    $("#myModal").modal("show");

    try {
        setProgressBarValue(25);
        const bytes = await extractEntryBytes(currentFileUrl, inspectionResult, entry.index);
        setProgressBarValue(90);
        triggerBrowserDownload(fileName, bytes);
    } finally {
        li.classList.remove("busy");
        $("#myModal").modal("hide");
        setProgressBarValue(0);
    }
}

function setProgressBarValue(val) {
    $("#modalProgressBar").css("width", val + "%").attr("aria-valuenow", val).text(val + " %");
}

function createTree(dataStructure) {
    $("#treegrid").fancytree({
        extensions: ["table", "glyph"],
        checkbox: false,
        table: {
            indentation: 20,
            nodeColumnIdx: 0
        },
        source: dataStructure,
        tooltip: function (event, data) {
            return data.node.data.filename;
        },
        glyph: {
            preset: "bootstrap3"
        },
        beforeActivate: function () {
            return false;
        },
        renderColumns: function (event, data) {
            var node = data.node;
            var $tdList = $(node.tr).find(">td");

            if (!node.folder) {
                $tdList.eq(1).text(node.data.size || "");
                /*
                if (!node.data.isAntiFile) {
                    const downloadButton = $('<button type="button" class="btn btn-link" data-entry-index="' + node.data.index + '">');
                    downloadButton.click(downloadFile);
                    downloadButton.append('<span class="icon glyphicon glyphicon-download-alt"></span>');
                    $tdList.eq(2).html(downloadButton);
                }

                 */
            }
        }
    });
}
