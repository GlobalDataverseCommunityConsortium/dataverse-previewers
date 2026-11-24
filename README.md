# The previewers are now hosted at https://github.com/gdcc/dataverse-previewers. This repository is strictly to support installations using previewers from this repository's github.io pages. All Pull Requests and Issues should be made to the new repository.

# Dataverse Previewers

A collection of data file previewers that conform to the [Dataverse](https://dataverse.org) external tools interface, originally developed by the [Qualitative Data Repository](https://qdr.syr.edu). v1.5 includes 19 previewers covering 40+ MIMEtypes. Earlier versions of Dataverse (v4.11+) make previewers available through the external tools button on Dataset pages (left). Newer versions (v4.18+) also use previewers for embedded display on Datafile pages (right). Even more recent versions (5.2+) can distinguish 'preview' and 'explore' tools and display them in different ways/separate places.

As of Dataverse 6.1, Previewers can use temporary signedUrls when accessing restricted files rather than long-lived API tokens. (SignedUrls were introduced in Dataverse 5.13 but did not work with Dataset PrivateUrl access until 6.1)

<img align="right" width="30%" src="https://github.com/gdcc/dataverse-previewers/blob/master/examples/previewInPage.PNG?raw=true">
<img width="65%" src="https://github.com/gdcc/dataverse-previewers/blob/master/examples/datasetdisplay.png?raw=true">

## Installation

These previewers can be run without downloading them by simply running the curl command(s) below to register then with your local dataverse instance. (You can also create local copies and register those).

For updates such as enabling Internationalization, which change the parameters you need to register with (Internationalization requires that Dataverse send the localeCode to the previewers), you'll need to delete the registrations for existing previewers (using the Dataverse externalTools API) and re-register them again using the updated curl commands below.  

There is one command per mimetype you wish to preview (i.e. multiple commands to cover different types of images.) You can run any/all of the commands as you like. Note that the Hypothesis annotation previewer assumes a custom mimetype and may not be useful for most Dataverses (contact [QDR](mailto:qdr@syr.edu) for more information). Dataverse 4.11+ is required.

Note that Dataverse installations configured to redirect to S3 storage for file downloads will need to enable CORS at the storage layer as well as the application layer (the latter is enabled by default). (See, for example, [Amazon's CORS configuration guidance](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-cors-configuration.html)). See also the [page on CORS](https://github.com/gdcc/dataverse-previewers/wiki/Using-Previewers-with-download-redirects-from-S3) in the wiki.

Also note that using the commands below means that your installation will automatically start using updated versions of the previewers when the master branch of this repository is updated. We intend to announce upcoming changes on the dataverse-community@google-groups.com mailing list, but if you do not want this behavior, you can download the previewers and host them on your own server, adjusting the curl commands below to reference your local copies.

## Updates

There are two options to update to new versions:

### API Method

Use the Dataverse API to list all of the registered previewers and to then delete each old version. Then follow the new installation instructions

    curl http://localhost:8080/api/admin/externalTools
and, for each tool registered, delete them by id number:

    curl -X DELETE http://localhost:8080/api/admin/externalTools/<id>

### Database method

Alternately, one can update the toolurl column in the externaltool table via SQL to change the repository and/or the version used. For example:

    update externaltool set toolurl=REPLACE(toolurl, 'globaldataversecommunityconsortium.github.io/dataverse-previewers/previewers', 'gdcc.github.io/dataverse-previewers/previewers/v1.1');

or, to just change between versions after you've switched to using the gdcc repository:

    update externaltool set toolurl=REPLACE(toolurl, 'v1.2', 'v1.3');

## Fully Local Installation
By default, previewers reference several JavaScript libraries and style files from their original web locations. If you would like to have a local installation that doesn't require access to other websites, you can use the localinstall.sh script. Download the repository to your local machine, change to the root directory where the localinstall.sh script is and run

    ./localinstall.sh previewers/v1.5 https://<your host>/<your base path to the previewers>

and the script will download all external JavaScript and css files required by the previewers for the version you specified and will update the example configuration commands in the 6.1curlcommands.md, 5.2curlcommands.md and pre5.2curlcommands.md files to reference your local URL. In the case above, using the parameters previewers/v1.5 and https://example.com/path would result example curl commands where the TextPreview.html would be available at https://example.com/path/previewers/v1.5/TextPreview.html.

Then make the directory previewers/v1.5 available via HTTP.
For example, if this is a RedHat-like instance running Apache, and you ran the local install script as follows:

```
./localinstall.sh previewers/v1.5 https://dataverse.example.edu
```
copy the directory to a location served by Apache:
```
sudo mkdir /var/www/html/previewers
sudo cp -ar previewers/v1.5 /var/www/html/previewers
```
If your instance is using a mostly standard Dataverse configuration, add the following exemption to your ```/etc/httpd/conf.d/ssl.conf```:

```ProxyPassMatch ^/previewers !```

following the other locations and services served under Apache that are exempt from being redirected to Payara, such as ```ProxyPassMatch ^/Shibboleth.sso !```

Restart Apache for the changes to take effect. 

## How do they work?

The tools here are lightweight wrappers around standard HTML5 functionality (e.g. audio, video), or third-party libraries (pdf, spreadsheets) or some combination (e.g. standard image displays with a third-party library to allow zooming, simple text/html displays with third-party libraries used to sanitize content to avoid security issues).

## Customizations

The previewers will use your favicon if it exists at the default Dataverse location: ```<your site URL>/javax.faces.resource/images/favicondataverse.png.xhtml```
They will also place your logo in the upper left corner (240px wide x 140px high recommended) if you add one at ```<your site URL>/logos/preview_logo.png``` (which, by default, corresponds to a file of that name in your payara (or glassfish) ./docroot/logos directory (e.g. /usr/local/payara5/glassfish/domains/domain1/docroot/logos)). By default, a blank white image is shown.

## Known Limitations

To preview restricted content, a user must have permission to view the relevant dataset version and download the relevant file. (Viewing public/published content does not require authentication/permission.) There are two authentication mechanisms available - passing the user's API Token, or, as of Dataverse v6.1 using signedUrls. Use of signedUrls is highly recommended as they limit Previewers to only the specific API calls listed (usually just for getting the dataset metadata and reading/downloading the file contents.) and have a limited lifetime (configurable, but e.g. an hour). In contrast, API Tokens are long-lived and allow use of any API calls the user has permissions for. Thus API Tokens should be treated like passwords - if you use previewers on public computers, you may want to 'Recreate' your API Token afterward (to invalidate the previous one). Also note that API Tokens expire - you may need to 'Recreate' one if you have not used it in a while. (Note that later versions of Dataverse change API token management and should create/recreate API tokens as needed.) Previewers using signedUrls will be registered with a set of "allowedApiCalls" and will not request the "{apiKey}" parameter - see [Dataverse 6.1+](6.1curlcommands.md) for examples.

File creation date is only shown in the header for Dataverse v4.12+.
  
Video seeking does not work on some browsers and some Dataverse instances due to the lack of support in some Dataverse storageIO drivers for partial file downloads. As of now, Seeking does not work in Chrome but does work in Firefox. Other browsers haven't been tested.

The image previewer only works with image/tiff files on some browsers (as of ~Jan 2020), so the registration for that mimetype has been removed from the list below.

## Acknowledgments

The original tools were developed through the [Qualitative Data Repository](https://qdr.syr.edu) but are being offered to the Dataverse community at large.

[qqmyers](https://github.com/qqmyers) - developer of the original previewer framework, contributions to the Rich Html Previewer, Voyager Previewer, REFI-QDA previewers, updating to use signed URLs

The Spreadsheet Previewer was contributed by [anncie-pcss](https://github.com/anncie-pcss).

[pdurbin](https://github.com/pdurbin) updated the retriever.js script to allow previewers to be embedded directly in the Dataverse file pages.

[juancorr](https://github.com/juancorr) added internationalization and provided a Spanish translation for the existing previewers.

[kaitlinnewson](https://github.com/kaitlinnewson) provided a French translation for the existing previewers, and contributed the GeoJSON previewer.

[Max Planck Digital Library](https://github.com/MPDL) contributed the ZIP previewer and the 7zip previewer.

[erykkul](https://github.com/erykkul) contributed the Markdown (MD) Previewer, the RO-Crate previewer, and the CDI (DDI Cross-Domain Integration) previewer. The CDI previewer displays all JSON-LD data nodes and properties with real-time SHACL validation, smart property classification (required/optional/extra fields), support for complex nested objects, and editing capabilities. See [https://github.com/libis/cdi-viewer](https://github.com/libis/cdi-viewer) for the source code, documentation and implementation details.

[Jan Range](https://github.com/JR-1991) contributed the H5Web Previewer, Rich Html Previewer.

[Paul Boon](https://github.com/PaulBoon) contributed the 3D Previewer.


## How can I help?

If you are interested in adding additional previewers, or in maintaining/enhancing existing ones, contact us at [dataverse-dev@googlegroups.com](mailto:dataverse-dev@googlegroups.com) or work through github to fork/make pull-requests against the repository.

The wiki now contains a [How To Create a Previewer](https://github.com/gdcc/dataverse-previewers/wiki/How-to-create-a-previewer) page that provides a detailed guide to developing new previewers starting from the existing HTML/Javascript templates. (You can also build previewers using any language you choose, starting from the External Tools API in Dataverse.)

Contributors are expected to keep the master branch in a 'production-ready' state, as Dataverse instances may be using the html, javascript, and css files there directly via their github.io URLs (see curl commands below).

By committing code to the repository, Contributors are agreeing to make it available under the [MIT Open Source license](https://gdcc/dataverse-previewers/LICENSE).

## Example Curl commands to configure these tools with your Dataverse instance. 
The examples configure Previewers from the specified location within https://github.io/gdcc/ corresponding to a given branch. To use older versions or locally installed versions of the previewers, you can change the "toolUrl" being used.

Note that the `.md` files below can be easily converted into executable shell scripts, by stripping the MD formatting (such as ```` ``` ```` lines) and comments. It is recommended however that you read the comments first, since they specify additional configuration requirements for some of the tools. 

Previewers v1.4+ (with betatest versions of newer previewers as noted, e.g. 3D Previewer)
- [Dataverse 6.1+](6.1curlcommands.md) - using SignedUrls
- [Dataverse 5.2+](5.2curlcommands.md) - using API tokens, not recommended beyond Dataverse 6.0

Previewers v1.3 (doesn't include newer previewers, configuration examples intended for Dataverse < v5.2. Newer previewers may work with Dataverse < v5.2 but they have not been tested.)
- [Dataverse <= v5.1](pre5.2curlcommands.md)

