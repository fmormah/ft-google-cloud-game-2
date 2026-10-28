# Downloading Assets from Google Cloud Storage Bucket

This document provides instructions for downloading assets from the `gs://ft-cloud-game-2` bucket using `gsutil`.

## Prerequisites

- Google Cloud SDK installed with `gsutil` command available
- Appropriate permissions to access the `ft-cloud-game-2` bucket

## Download Options

### Option 1: Put everything into ~/Downloads/assets/

Downloads all assets directly into `~/Downloads/assets/`:

```bash
mkdir -p ~/Downloads/assets
gsutil -m cp -r gs://ft-cloud-game-2/assets/* ~/Downloads/assets/
```

### Option 2: Create a dedicated dump folder (keeps assets/ inside it)

This creates `~/Downloads/ft-cloud-game-2/assets/...`:

```bash
mkdir -p ~/Downloads/ft-cloud-game-2
gsutil -m cp -r gs://ft-cloud-game-2/assets ~/Downloads/ft-cloud-game-2/
```

### Option 3: Date-stamped dump folder (handy if you'll do this a lot)

Creates a date-stamped folder for each download session:

```bash
DEST=~/Downloads/ft-cloud-game-2-$(date +%Y-%m-%d)
mkdir -p "$DEST"
gsutil -m cp -r gs://ft-cloud-game-2/assets "$DEST"/
```

## Notes

- The `-m` flag enables parallel processing for faster downloads
- The `-r` flag enables recursive copying of directories
- Make sure you have sufficient disk space before downloading
- The download may take some time depending on the size of the assets

