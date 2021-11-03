# Dataverse Previewers

A collection of data file previewers that conform to the [Dataverse](https://dataverse.org) external tools interface, originally developed by the [Qualitative Data Repository](https://qdr.syr.edu). Earlier versions of Dataverse (v4.11+) make previewers available through the external tools button on Dataset pages (left). Newer versions (v4.18+) also use previewers for embedded display on Datafile pages (right). Even more recent versions (5.2+) can distinguish 'preview' and 'explore' tools and display them in different ways/separate places.

<img align="right" width="30%" src="https://github.com/GlobalDataverseCommunityConsortium/dataverse-previewers/blob/master/examples/previewInPage.PNG?raw=true">
<img width="65%" src="https://github.com/GlobalDataverseCommunityConsortium/dataverse-previewers/blob/master/examples/datasetdisplay.png?raw=true">

## Installation

These previewers can be run without downloading them by simply running the curl command(s) below to register then with your local dataverse instance. (You can also create local copies and register those).

For updates such as enabling Internationalization, which change the parameters you need to register with (Internationalization requires that Dataverse send the localeCode to the previewers), you'll need to delete the registrations for existing previewers (using the Dataverse externalTools API) and re-register them again using the updated curl commands below.  

There is one command per mimetype you wish to preview (i.e. multiple commands to cover different types of images.) You can run any/all of the commands as you like. Note that the Hypothesis annotation previewer assumes a custom mimetype and may not be useful for most Dataverses (contact [QDR](mailto:qdr@syr.edu) for more information). Dataverse 4.11+ is required.

Note that Dataverse installations configured to redirect to S3 storage for file downloads will need to enable CORS at the storage layer as well as the application layer (the latter is enabled by default). (See, for example, [Amazon's CORS configuration guidance](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-cors-configuration.html)).

Also note that using the commands below means that your installation will automatically start using updated versions of the previewers when the master branch of this repository is updated. We intend to announce upcoming changes on the dataverse-community@google-groups.com mailing list, but if you do not want this behavior, you can download the previewers and host them on your own server, adjusting the curl commands below to reference your local copies.

## How do they work?

The tools here are lightweight wrappers around standard HTML5 functionality (e.g. audio, video), or third-party libraries (pdf, spreadsheets) or some combination (e.g. standard image displays with a third-party library to allow zooming, simple text/html displays with third-party libraries used to sanitize content to avoid security issues).

## Customizations

The previewers will use your favicon if it exists at the default Dataverse location: ```<your site URL>/javax.faces.resource/images/favicondataverse.png.xhtml```
They will also place your logo in the upper left corner (240px wide x 140px high recommended) if you add one at ```<your site URL>/logos/preview_logo.png``` (which, by default, corresponds to a file of that name in your payara (or glassfish) ./docroot/logos directory (e.g. /usr/local/payara5/glassfish/domains/domain1/docroot/logos)). By default, a blank white image is shown.

## Known Limitations

To preview restricted content, a user must have permission to view the relevant dataset version and download the relevant file and must have created an API Token for themselves in Dataverse. (Viewing public/published content does not require an API Token.) Note that API Tokens should be treated like passwords - if you use previewers on public computers, you may want to 'Recreate' your API Token afterward (to invalidate the previous one). Also note that API Tokens expire - you may need to 'Recreate' one if you have not used it in a while. (Note that later versions of Dataverse change API token management and should create/recreate API tokens as needed.)

File creation date is only shown in the header for Dataverse v4.12+.
  
Video seeking does not work on some browsers and some Dataverse instances due to the lack of support in some Dataverse storageIO drivers for partial file downloads. As of now, Seeking does not work in Chrome but does work in Firefox. Other browsers haven't been tested.

The image previewer only works with image/tiff files on some browsers (as of ~Jan 2020), so the registration for that mimetype has been removed from the list below.

## Acknowledgments

The original tools were developed through the [Qualitative Data Repository](https://qdr.syr.edu) but are being offered to the Dataverse community at large.

The Spreadsheet Previewer was contributed by [anncie-pcss](https://github.com/anncie-pcss).

[pdurbin](https://github.com/pdurbin) updated the retriever.js script to allow previewers to be embedded directly in the Dataverse file pages.

[juancorr](https://github.com/juancorr) added internationalization and provided a Spanish translation for the existing previewers.

[kaitlinnewson](https://github.com/kaitlinnewson) provided a French translation for the existing previewers.

## How can I help?

If you are interested in adding additional previewers, or in maintaining/enhancing existing ones, contact us at [dataverse-dev@googlegroups.com](mailto:dataverse-dev@googlegroups.com) or work through github to fork/make pull-requests against the repository.

The wiki now contains a [How To Create a Previewer](https://github.com/GlobalDataverseCommunityConsortium/dataverse-previewers/wiki/How-to-create-a-previewer) page that provides a detailed guide to developing new previewers starting from the existing HTML/Javascript templates. (You can also build previewers using any language you choose, starting from the External Tools API in Dataverse.)

Contributors are expected to keep the master branch in a 'production-ready' state, as Dataverse instances may be using the html, javascript, and css files there directly via their github.io URLs (see curl commands below).

By committing code to the repository, Contributors are agreeing to make it available under the [MIT Open Source license](https://globaldataversecommunityconsortium.github.io/dataverse-previewers/LICENSE).

## Curl commands to configure these tools with your Dataverse instance

- [Dataverse <= v5.1](pre5.2curlcommands.md)
- [Dataverse 5.2+](5.2curlcommands.md)
