# Dataverse HDF5 Previewer
#### Powered by [H5Web](https://h5web.panosc.eu)

This is the source code of the Dataverse HDF5 file previewer that has been adopted from the [H5Web demo](https://github.com/silx-kit/h5web) and adjusted towards the needs of Dataverse's requirements for [external tools](https://guides.dataverse.org/en/latest/api/external-tools.html). The following adjustments have been done:

* Reduction to the H5Wasm example (others were not applicable)
* Query parsing for `siteUrl`, `fileid` and `key` parameters
* GET request to fetch files from a Dataverse installation
* Build options to result into a non-index HTML file for previewer hosting
* Some styling here and there 🌈

----

❤️ Kudos to [H5Web](https://h5web.panosc.eu) for supplying their awesome [npm package](https://www.npmjs.com/package/@h5web/app) and examples!