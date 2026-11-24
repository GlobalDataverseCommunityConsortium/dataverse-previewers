import os, yaml, subprocess, shutil
from checksumdir import dirhash


def _check_metadata_extension(source_dir):
    """Check if the previewer metadata file has the correct extension"""

    # List all the files in the previewers directory
    files = os.listdir(".")

    if "previewer-meta.yaml" in files:
        return "previewer-meta.yaml"
    elif "previewer-meta.yml" in files:
        return "previewer-meta.yml"
    else:
        raise FileNotFoundError(
            f"No previewer metadata file found for source directory {source_dir}"
        )


def build_react_app(source_dir, TARGET_DIR):
    """Builds the react app and copies the files to the target directory

    Args:
        source_dir (str): Source directory of the react app.
        TARGET_DIR (str): Target directory to copy the files to.
        REPO_DIR (str): Directory of the repository.
    """

    # Move to the source directory to read metadata and instructions
    os.chdir(source_dir)

    # Check if a previewer metadata file exists
    metadata_file = _check_metadata_extension(source_dir)

    # Read the previewers metadata
    metadata = yaml.safe_load(open(metadata_file))

    # Create path map to deploy the necessary files
    extension_paths = {
        "js": os.path.join(TARGET_DIR, "js"),
        "css": os.path.join(TARGET_DIR, "css"),
        "html": TARGET_DIR,
    }

    # Get the hash of the source directory
    source_hash = dirhash(metadata["checkdir"], "sha256")

    if metadata.get("checksum") == source_hash:
        print(f"No changes detected for {metadata['name']}")
        return

    print(f"Changes detected for {metadata['name']} - Building previewer")

    for command in metadata["build"]:
        # Run the build commands
        subprocess.call(command, shell=True)

    for file in metadata["files"]:
        # Copy the files to the target directory
        fname = os.path.basename(file)
        extension = fname.split(".")[-1]
        shutil.copy(file, os.path.join(extension_paths[extension], fname))

    # Update checksum in metadata file
    metadata["checksum"] = source_hash
    yaml.safe_dump(metadata, open(metadata_file, "w"), sort_keys=False)

    print("Successfully built previewer - Checksum updated")


if __name__ == "__main__":
    # Build the react previewers
    BASE_DIR = "./previewers/react-source/"
    REPO_DIR = os.getcwd()
    TARGET_DIR = os.path.join(REPO_DIR, "previewers", "betatest")

    # Get all the react previewers
    react_previewers = [
        os.path.join(BASE_DIR, path)
        for path in os.listdir(BASE_DIR)
        if not path.startswith(".") and path != "README.md"
    ]

    for source_dir in react_previewers:
        # Build the react app
        build_react_app(source_dir, TARGET_DIR)

        # Return to the repository directory
        os.chdir(REPO_DIR)
