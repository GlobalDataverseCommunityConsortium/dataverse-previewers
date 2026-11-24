# React-Source

This directory holds the source code of all React previewers within this repository. Each previewer's source code is accompanied by a `previewer-meta.yml` file, which provides important information such as the previewer's name, a checksum functionality, build instructions, and relevant files for hosting the previewer.

Here is an example for the `HDF5-Previewer`

```yaml
name: HDF5-Previewer
checkdir: ./src
checksum: null
build:
- npm install
- npm run build
files:
- ./dist/js/hdf5.js
- ./dist/css/hdf5.css
- ./dist/HDF5Preview.html
```

## YAML schema

* **name**: Name of the previewer. This will also be the lower-case directory name of the build found in `react-previewers`
* **checkdir**: Directory from which the checksum needs to be calculated to detect changes. This is necessary, because upon `npm install` and building IDs are generate which alter the general checksum.
* **checksum**: SHA256 hash of the `checkdir` to detect changes within the source code. This is done to prevent redundant builds when nothing has changed.
* **build**: List of commands to build this app.
* **files**: Resulting build files that are copied to `react-previewers`. It is important to add these paths relative to your source directory.

## How can I add my own code?

1. Copy your developed app into the `react-source` directory.
2. Attach a `previewer-meta.yml` or `previewer-meta.yaml` file that includes all necessary informations on build and files.
3. Upon push the CI workflow will run and build your code.

> **Warning**
> Please make sure, that upon building your resulting `html` file points to the necessary `js` and `css` files using *relative* paths. Otherwise the page wont work since, the built files will be moved based on the given extension:
>
> * `css` to `previewers/betatest/css`
> * `js` to `previewers/betatest/js`
> * `html` to `previewers/betatest/`
>
> For an example, in `previewers/react-source/HDF5Previewer` the `vite.config.js` file has been adjusted to produce files already in the desired structure and thus no additional actions are necessary. You may adjust this based on the bundler you are using.