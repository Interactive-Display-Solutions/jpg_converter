# Image Baseline Resizer

A web application that converts WebP, JPEG, GIF, and PNG images to baseline 1200x1600 JPG format.

## Features

- 🖼️ **Multiple Format Support**: WebP, JPEG, GIF, PNG
- 🔄 **Auto Resize**: Automatically resizes images to 1200x1600 pixels
- 🔁 **Rotation**: Rotate images 90° clockwise or counterclockwise
- ✏️ **Custom Filename**: Set custom download filename
- 💻 **Client-Side Processing**: All processing happens in your browser (no server required)
- 🎨 **Modern UI**: Beautiful and intuitive user interface

## How to Use

1. Upload an image by dragging and dropping or clicking the upload area
2. The image will be automatically converted to 1200x1600 JPG format
3. Rotate the image if needed using the rotation buttons
4. Enter a custom filename (optional)
5. Click "Download" to save the converted image

## How to Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select the branch (usually `main` or `master`)
5. Select the folder (usually `/ (root)`)
6. Click Save
7. Your app will be available at `https://yourusername.github.io/repository-name`

## Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks or dependencies
- **Canvas API**: Used for image processing and rotation
- **File API**: Handles file uploads and downloads
- **Client-Side Only**: All processing happens in the browser

## Browser Support

Works on all modern browsers that support:
- HTML5 Canvas API
- File API
- ES6 JavaScript

## License

Free to use and modify.

