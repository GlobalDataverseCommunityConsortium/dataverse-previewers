function writeContent(fileUrl, file, title, authors) {
    addStandardPreviewHeader(file, title, authors);
    
    // Set the global zipUrl variable so other code knows we're in zip mode
    zipUrl = fileUrl;
    
    if(fileUrl.includes('auxiliary/qdpx')) {
      redactedMode = true;
    } else {
      redactedMode = false;
    }
    readZip(fileUrl, file);
}

let entries;
const entryMap = {};
var sourcesPathPrefix = "sources/";


async function readZip(fileUrl, file) {
    showWaitingIndicator('refiqdaParsingProject');

    try {
        //Just a workaround, as current Dataverse delivers https links for localhost
        if (fileUrl.startsWith('https://localhost')) {
            fileUrl = fileUrl.replace('https://localhost', 'http://localhost');
        }


        const reader = new zip.ZipReader(new zip.HttpRangeReader(fileUrl, ));

        // get all entries from the zip
        entries = await reader.getEntries();
        if (entries.length) {
            const hasUpperCase = entries.some(entry => entry.filename.startsWith('Sources/'));
            if (hasUpperCase) {
                sourcesPathPrefix = 'Sources/';
                console.log("Detected sources path prefix:", sourcesPathPrefix);
            }

            // First pass: Find and process the .qde file
            const qdeEntry = entries.find(entry => entry.filename.endsWith('.qde'));
            
            if (qdeEntry) {
                var projectBlob = qdeEntry.getData(new zip.TextWriter(), {
                  onprogress: (index, max) => {

                    const percent = Math.round(index / max * 100);
                    console.log(index + "   " + max + "   " + percent);
                    setProgressBarValue(percent);

                  },
                });
                projectBlob.then(text => parseData(text, file)).catch((err)=> {
                    showWaitingIndicator($.i18n('errorText') + err, true);
                });

                // Second pass: Build entry map for all other files
                entries.forEach(function(entry, index) {
                    if (!entry.directory && !entry.filename.endsWith('.qde')) {
                        entryMap[entry.filename] = index;
                    }
                });
            } else {
                showWaitingIndicator('refiqdaNoQdeError');
            }
        }

            // close the ZipReader
            await reader.close();

    }
    catch (err) {
        //Display error message
        const errorMsg = $.i18n('refiqdaZipReadError', err);
        showWaitingIndicator(errorMsg, true);
        console.log(err);

    }
    finally {
        // No longer need to manually remove throbber here as showWaitingIndicator/hideWaitingIndicator handles it
    }
}

// Add this function to fetch text excerpts from zip entries
async function fetchTextExcerpt(entryFilename, startPos, endPos) {
    try {
        // Find the entry in the entryMap
        const entryIndex = entryMap[entryFilename];
        if (entryIndex === undefined) {
            throw new Error('File not found in archive: ' + entryFilename);
        }

        const entry = entries[entryIndex];
        
        // Get the text content from the zip entry
        // The zip.js library will handle decompression automatically
        const text = await entry.getData(new zip.TextWriter());

        // Extract the requested portion
        const start = parseInt(startPos);
        const end = parseInt(endPos);
        const excerpt = text.substring(start, end);
        
        return excerpt;

    } catch (error) {
        console.error('Error fetching text excerpt:', error);
        throw error;
    }
}

/**
 * Resolves an internal URI (e.g., "internal://file.txt") to the correct path within the ZIP archive.
 * Standard QDPX stores files under "sources/", but we handle both for robustness and case sensitivity.
 * @param {string} uri The URI to resolve.
 * @returns {string|null} The resolved path in the ZIP, or null if not found.
 */
function resolveInternalZipPaths(uri) {
    if (!uri) return null;
    if (!uri.startsWith("internal://")) return uri;

    const relativePath = uri.substring(11); // Remove "internal://"

    // 1. Try with the detected/default prefix
    let path = sourcesPathPrefix + relativePath;
    if (entryMap[path] !== undefined) return path;

    // 2. Try without any prefix
    if (entryMap[relativePath] !== undefined) return relativePath;

    // 3. Try with the alternative prefix (just in case)
    const altPrefix = sourcesPathPrefix === "sources/" ? "Sources/" : "sources/";
    path = altPrefix + relativePath;
    if (entryMap[path] !== undefined) return path;

    // 4. Return null if not found in archive
    return null;
}

async function downloadSourceFile(sourceGuid, path) {
    const finalPath = resolveInternalZipPaths(path);
    const entryIndex = finalPath ? entryMap[finalPath] : undefined;

    if (entryIndex !== undefined) {
        const entry = entries[entryIndex];
        try {
            const blobURL = URL.createObjectURL(await entry.getData(new zip.BlobWriter()));
            const filename = finalPath.split('/').pop();
            const tempLink = document.createElement('a');
            tempLink.href = blobURL;
            tempLink.download = filename;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            setTimeout(() => URL.revokeObjectURL(blobURL), 10000);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed: ' + error);
        }
    } else {
        console.error('File not found in archive:', path);
        alert('File not found in archive: ' + path);
    }
}

async function setProgressBarValue(val) {
    // Dummy function since we don't have a progress bar in the UI yet
}

/**
 * Creates a new redacted zip archive and uploads it to Dataverse.
 *
 * @param {string} redactedXmlString The redacted project.qde content.
 * @param {Set<string>} pathsToRemove A set of file paths to exclude from the zip.
 */
async function createAndUploadRedactedZip(redactedXmlString, pathsToRemove = new Set()) {
    try {
        // Fetch the original zip file as a blob on-demand
        const zipResponse = await fetch(zipUrl);
        if (!zipResponse.ok) {
            throw new Error(`HTTP error! status: ${zipResponse.status}`);
        }
        const zipFileBlob = await zipResponse.blob();

        // 1. Create a new zip archive
        const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/x-zip-refiqda"));

        // 2. Read entries from the original zip blob
        const zipReader = new zip.ZipReader(new zip.BlobReader(zipFileBlob));
        const entries = await zipReader.getEntries();

        // 3. Copy entries to the new zip, excluding redacted files
        for (const entry of entries) {
            if (entry.filename === "project.qde") {
                // Skip the old project file; we'll add the new one later
                continue;
            }
            if (!pathsToRemove.has(entry.filename)) {
                await zipWriter.add(entry.filename, new zip.BlobReader(await entry.getData(new zip.BlobWriter())));
            } else {
                console.log(`Excluding ${entry.filename} from new zip.`);
            }
        }

        // 4. Add the new, redacted project.qde
        await zipWriter.add("project.qde", new zip.TextReader(redactedXmlString));

        // 5. Finalize the new zip file
        const redactedZipBlob = await zipWriter.close();

        // 6. Prepare for upload
        const originalFilename = file.filename || "project.qdpx";
        const redactedFilename = originalFilename.replace(/(\.qdpx)?$/, '-redacted.qdpx');

        await uploadRedactedFile(redactedZipBlob, redactedFilename);

    } catch (error) {
        console.error("Error during zip redaction and upload:", error);
        if (typeof hideWaitingIndicator === 'function') {
            hideWaitingIndicator();
        }
        alert($.i18n('refiqdaRedactError', error.message));
    }
}
