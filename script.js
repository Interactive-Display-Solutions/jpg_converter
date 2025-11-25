let TARGET_WIDTH = 1200;
let TARGET_HEIGHT = 1600;

// Sample image file lists
const SAMPLE_IMAGES_1200 = [
    'demo00.jpg',
    'demo01.jpg',
    'demo02.jpg',
    'demo03.jpg',
    'demo04.jpg',
    'demo05.jpg',
    'demo06.jpg',
    'demo07.jpg',
    'demo10.jpg',
    'demo11.jpg'
];

const SAMPLE_IMAGES_2560 = [
    'demo_2560_01.jpg',
    'demo_2560_02.jpg',
    'demo_2560_03.jpg',
    'demo_2560_04.jpg',
    'demo_2560_05.jpg',
    'demo_2560_06.jpg'
];

let uploadArea, fileInput, previewSection, loading;
let originalPreview, resizedPreview, downloadBtn, resetBtn;
let downloadFileNameInput, rotateLeftBtn, rotateRightBtn, rotationInfo;
let sizeOptions, convertedImageTitle;
let samples1200Container, samples2560Container;
let resizedImageBlob = null;
let originalFileName = '';
let originalImage = null; // Original image object (for rotation)
let originalFile = null; // Original file object (for rotation)
let currentRotation = 0; // Current rotation angle (0, 90, 180, 270)

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    uploadArea = document.getElementById('uploadArea');
    fileInput = document.getElementById('fileInput');
    previewSection = document.getElementById('previewSection');
    loading = document.getElementById('loading');
    originalPreview = document.getElementById('originalPreview');
    resizedPreview = document.getElementById('resizedPreview');
    downloadBtn = document.getElementById('downloadBtn');
    resetBtn = document.getElementById('resetBtn');
    downloadFileNameInput = document.getElementById('downloadFileName');
    rotateLeftBtn = document.getElementById('rotateLeftBtn');
    rotateRightBtn = document.getElementById('rotateRightBtn');
    rotationInfo = document.getElementById('rotationInfo');
    sizeOptions = document.querySelectorAll('input[name="targetSize"]');
    convertedImageTitle = document.getElementById('convertedImageTitle');
    samples1200Container = document.getElementById('samples1200');
    samples2560Container = document.getElementById('samples2560');
    
    // Load sample images
    loadSampleImages();

    if (!uploadArea || !fileInput || !previewSection || !loading) {
        console.error('Required DOM elements not found.');
        return;
    }

    initEventListeners();
});

function initEventListeners() {
    // File input events
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Download button
    downloadBtn.addEventListener('click', () => {
        if (resizedImageBlob) {
            const url = URL.createObjectURL(resizedImageBlob);
            const a = document.createElement('a');
            a.href = url;
            
            // Use user-entered filename or default filename
            let downloadFileName = downloadFileNameInput.value.trim();
            
            if (downloadFileName) {
                // Use entered filename (remove extension and add .jpg)
                downloadFileName = downloadFileName.replace(/\.[^/.]+$/, '');
                a.download = `${downloadFileName}.jpg`;
            } else {
                // Use default filename
                const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
                a.download = `${nameWithoutExt}_${TARGET_WIDTH}x${TARGET_HEIGHT}.jpg`;
            }
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // Size selection
    if (sizeOptions && sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const [width, height] = e.target.value.split('x').map(Number);
                    TARGET_WIDTH = width;
                    TARGET_HEIGHT = height;
                    
                    // Update title
                    if (convertedImageTitle) {
                        convertedImageTitle.textContent = `Converted Image (${TARGET_WIDTH}x${TARGET_HEIGHT})`;
                    }
                    
                    // Reprocess image if already loaded
                    if (originalImage) {
                        processImage(originalImage, originalFile, currentRotation);
                    }
                }
            });
        });
    }

    // Rotation buttons
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', () => {
            rotateImage(-90);
        });
    }
    
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', () => {
            rotateImage(90);
        });
    }

    // Reset button
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewSection.style.display = 'none';
        loading.style.display = 'none';
        resizedImageBlob = null;
        originalFileName = '';
        originalImage = null;
        originalFile = null;
        currentRotation = 0;
        downloadFileNameInput.value = '';
        
        // Reset preview images
        if (originalPreview.src) {
            URL.revokeObjectURL(originalPreview.src);
        }
        if (resizedPreview.src) {
            URL.revokeObjectURL(resizedPreview.src);
        }
        originalPreview.src = '';
        resizedPreview.src = '';
        
        if (rotationInfo) {
            rotationInfo.textContent = '0°';
        }
    });

}

// File selection handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// File processing
function handleFile(file) {
    console.log('File selected:', file.name, file.type);
    
    // Support WebP, JPEG, GIF, PNG
    if (!file.type.match(/^image\/(webp|jpeg|jpg|gif|png)$/)) {
        alert('Only WebP, JPEG, GIF, PNG files are supported.');
        return;
    }

    originalFileName = file.name;
    const reader = new FileReader();

    reader.onerror = () => {
        console.error('File reading error');
        alert('An error occurred while reading the file.');
        loading.style.display = 'none';
    };

    reader.onload = (e) => {
        const img = new Image();
        
        img.onerror = () => {
            console.error('Image loading error');
            alert('An error occurred while loading the image.');
            loading.style.display = 'none';
        };
        
        img.onload = () => {
            console.log('Image loaded:', img.width, 'x', img.height);
            // Save original image object and file (for rotation)
            originalImage = img;
            originalFile = file;
            currentRotation = 0;
            processImage(img, file, 0);
        };
        
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// Rotation function
function rotateImage(angle) {
    if (!originalImage) {
        console.error('Original image not found.');
        return;
    }

    // Update rotation angle (normalize to 0~360 range)
    currentRotation = (currentRotation + angle + 360) % 360;
    console.log('Rotation angle:', currentRotation);

    // Reprocess with original image
    processImage(originalImage, originalFile, currentRotation);
}

    // Image processing
function processImage(img, originalFile, rotation = 0) {
    console.log('Image processing started, rotation:', rotation);
    loading.style.display = 'block';
    previewSection.style.display = 'none';

    // Always use original image dimensions (don't swap for rotation)
    const originalWidth = img.width;
    const originalHeight = img.height;
    
    // For display purposes, calculate rotated dimensions
    let displayWidth = originalWidth;
    let displayHeight = originalHeight;
    
    if (rotation === 90 || rotation === 270) {
        // Swap width/height when rotated 90° or 270° (for display calculation only)
        displayWidth = originalHeight;
        displayHeight = originalWidth;
    }

    // Display original image info (before rotation)
    const originalSize = originalFile ? formatFileSize(originalFile.size) : '-';
    const isTargetSize = displayWidth === TARGET_WIDTH && displayHeight === TARGET_HEIGHT;

    console.log('Original size:', originalWidth, 'x', originalHeight);
    console.log('Display size after rotation:', displayWidth, 'x', displayHeight);
    console.log('Target size:', TARGET_WIDTH, 'x', TARGET_HEIGHT);

    // Set original preview
    originalPreview.src = img.src;

    // Update status
    const fileExtension = originalFileName.split('.').pop().toUpperCase();
    const formatMap = {
        'WEBP': 'WebP',
        'JPG': 'JPEG',
        'JPEG': 'JPEG',
        'GIF': 'GIF',
        'PNG': 'PNG'
    };
    const formatName = formatMap[fileExtension] || fileExtension;
    
    document.getElementById('originalFileName').textContent = originalFileName;
    document.getElementById('originalSize').textContent = originalSize;
    document.getElementById('originalResolution').textContent = `${originalWidth} x ${originalHeight}`;
    document.getElementById('originalFormat').textContent = formatName;
    
    const statusElement = document.getElementById('resizeStatus');
    if (isTargetSize) {
        statusElement.textContent = 'Already correct size';
        statusElement.className = 'info-value status-ok';
    } else {
        statusElement.textContent = 'Resizing required';
        statusElement.className = 'info-value status-resize';
    }

    // Display rotation info
    if (rotationInfo) {
        rotationInfo.textContent = `${rotation}°`;
    }

    // Image resizing
    try {
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Cannot get canvas context.');
        }

        // Set white background (for transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        // Move to canvas center
        ctx.save();
        ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2);
        
        // Apply rotation first
        if (rotation !== 0) {
            ctx.rotate((rotation * Math.PI) / 180);
        }

        // Calculate scale to fit within 1200x1600 while maintaining aspect ratio
        // Use original dimensions for scaling (not rotated dimensions)
        const scale = Math.min(
            TARGET_WIDTH / originalWidth,
            TARGET_HEIGHT / originalHeight
        );

        // Use original dimensions for drawing (maintain original aspect ratio)
        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;

        // Center alignment (centered after rotation)
        const x = -scaledWidth / 2;
        const y = -scaledHeight / 2;

        console.log('Resizing info:', {
            rotation,
            originalSize: `${originalWidth}x${originalHeight}`,
            scale,
            scaledSize: `${scaledWidth}x${scaledHeight}`,
            position: { x, y }
        });

        // Draw image with original dimensions (no stretching)
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        ctx.restore();

        // Convert canvas to Blob
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Blob creation failed');
                alert('An error occurred while converting the image.');
                loading.style.display = 'none';
                return;
            }

            console.log('Blob created, size:', blob.size);
            resizedImageBlob = blob;
            const resizedUrl = URL.createObjectURL(blob);
            resizedPreview.src = resizedUrl;

            // Check image load
            resizedPreview.onload = () => {
                console.log('Resized image loaded');
                loading.style.display = 'none';
                previewSection.style.display = 'block';
                
                // Update title
                if (convertedImageTitle) {
                    convertedImageTitle.textContent = `Converted Image (${TARGET_WIDTH}x${TARGET_HEIGHT})`;
                }
                
                // Set default filename
                const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
                downloadFileNameInput.value = `${nameWithoutExt}_${TARGET_WIDTH}x${TARGET_HEIGHT}`;
            };

            resizedPreview.onerror = () => {
                console.error('Resized image load failed');
                alert('Cannot display the converted image.');
                loading.style.display = 'none';
            };
        }, 'image/jpeg', 0.92); // JPEG quality 92%
    } catch (error) {
        console.error('Image processing error:', error);
        alert('An error occurred while processing the image: ' + error.message);
        loading.style.display = 'none';
    }
}

// File size formatting
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Load and display sample images
function loadSampleImages() {
    // Load 1200x1600 samples
    if (samples1200Container) {
        loadSampleGroup(SAMPLE_IMAGES_1200, 'samples/1200x1600/', samples1200Container, 1200, 1600);
    }
    
    // Load 2560x1440 samples
    if (samples2560Container) {
        loadSampleGroup(SAMPLE_IMAGES_2560, 'samples/2560x1440/', samples2560Container, 2560, 1440);
    }
}

// Load sample images for a specific group
function loadSampleGroup(fileList, folder, container, width, height) {
    if (!container || fileList.length === 0) {
        if (container) {
            container.innerHTML = '<p class="no-samples">No sample images available</p>';
        }
        return;
    }
    
    container.innerHTML = '';
    
    fileList.forEach(filename => {
        const imageUrl = `${folder}${filename}`;
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = filename;
        img.className = 'sample-thumbnail';
        img.loading = 'lazy';
        
        // Create container for each sample
        const sampleItem = document.createElement('div');
        sampleItem.className = 'sample-item';
        
        // Add image
        sampleItem.appendChild(img);
        
        // Add filename label
        const label = document.createElement('div');
        label.className = 'sample-label';
        label.textContent = filename;
        sampleItem.appendChild(label);
        
        // Add download overlay
        const overlay = document.createElement('div');
        overlay.className = 'sample-overlay';
        overlay.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Click to Download</span>
        `;
        sampleItem.appendChild(overlay);
        
        // Click to download
        sampleItem.addEventListener('click', () => {
            downloadSampleFile(imageUrl, filename);
        });
        
        // Handle image load error
        img.onerror = () => {
            sampleItem.style.display = 'none';
        };
        
        container.appendChild(sampleItem);
    });
}

// Download sample file
function downloadSampleFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}



