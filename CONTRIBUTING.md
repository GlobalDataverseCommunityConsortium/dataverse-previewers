# Contributions welcome

This repository is configured so that production instances of the Dataverse software can use previewers hosted at https://github.io/gdcc (as shown in the example [curl registration commands](https://github.com/gdcc/dataverse-previewers/blob/master/5.2curlcommands.md). To accommodate this, and to allow installations to migrate to new previewer versions as they wish, released versions of the previewers are frozen, in previewer/vX.Y subdirectories and all changes/pull requests are made to code in the previewers/betatest directory.

**All contributions are requested to be made as pull requests against the develop branch. Bug fixes and enhancements to existing previewers and new previewers should only be added to the previewers/betatest subdirectory**

The maintainers will then decide when to make a pull request from develop to master to also make the code changes live at github.io. (Maintainers will also periodically create a new release and create a new previewer subfolder for it, moving the updates from previewers/betatest to it.)

If anyone has a more elegant solution that avoids making dynamic changes to installations that use previewers hosted in the repository, please let us know.

