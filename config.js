// Slide Show Config Generator
let configImageList = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initConfigGenerator();
});

// Initialize config generator
function initConfigGenerator() {
    const configUploadArea = document.getElementById('configUploadArea');
    const configFileInput = document.getElementById('configFileInput');
    const generateConfigBtn = document.getElementById('generateConfigBtn');
    const clearConfigBtn = document.getElementById('clearConfigBtn');

    if (!configUploadArea || !configFileInput) {
        console.error('Config generator elements not found');
        return;
    }

    // Upload area click
    configUploadArea.addEventListener('click', () => configFileInput.click());
    
    // File selection
    configFileInput.addEventListener('change', (e) => {
        handleConfigFiles(e.target.files);
    });

    // Drag and drop
    configUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        configUploadArea.classList.add('dragover');
    });

    configUploadArea.addEventListener('dragleave', () => {
        configUploadArea.classList.remove('dragover');
    });

    configUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        configUploadArea.classList.remove('dragover');
        handleConfigFiles(e.dataTransfer.files);
    });

    // Generate config
    if (generateConfigBtn) {
        generateConfigBtn.addEventListener('click', generateConfigFile);
    }

    // Clear
    if (clearConfigBtn) {
        clearConfigBtn.addEventListener('click', clearConfigList);
    }
}

// Handle config files
function handleConfigFiles(files) {
    const imageFiles = Array.from(files).filter(file => 
        file.type.match(/^image\/(jpeg|jpg)$/)
    );

    if (imageFiles.length === 0) {
        alert('Please select JPG image files only.');
        return;
    }

    imageFiles.forEach(file => {
        // Check if file already exists
        if (!configImageList.find(item => item.file.name === file.name)) {
            configImageList.push({
                file: file,
                duration: 5 // Default 5 seconds
            });
        }
    });

    updateConfigList();
}

// Update config list display
function updateConfigList() {
    const configList = document.getElementById('configList');
    const configItems = document.getElementById('configItems');

    if (!configList || !configItems) return;

    if (configImageList.length === 0) {
        configList.style.display = 'none';
        return;
    }

    configList.style.display = 'block';
    configItems.innerHTML = '';

    configImageList.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'config-item';
        
        const fileName = item.file.name;
        const preview = URL.createObjectURL(item.file);
        
        itemDiv.innerHTML = `
            <div class="config-item-preview">
                <img src="${preview}" alt="${fileName}">
            </div>
            <div class="config-item-info">
                <div class="config-item-name">${fileName}</div>
                <div class="config-item-controls">
                    <label>
                        Duration (seconds):
                        <input type="number" 
                               class="config-duration" 
                               value="${item.duration}" 
                               min="1" 
                               max="999"
                               data-index="${index}">
                    </label>
                    <button class="btn-remove" data-index="${index}" title="Remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Duration change
        const durationInput = itemDiv.querySelector('.config-duration');
        durationInput.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 999) {
                configImageList[idx].duration = value;
            } else {
                e.target.value = configImageList[idx].duration;
            }
        });

        // Remove button
        const removeBtn = itemDiv.querySelector('.btn-remove');
        removeBtn.addEventListener('click', () => {
            const idx = parseInt(removeBtn.dataset.index);
            // Revoke object URL to free memory
            const previewUrl = configImageList[idx].file ? 
                URL.createObjectURL(configImageList[idx].file) : null;
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            configImageList.splice(idx, 1);
            updateConfigList();
        });

        configItems.appendChild(itemDiv);
    });
}

// Generate config.txt file
function generateConfigFile() {
    if (configImageList.length === 0) {
        alert('Please add at least one image.');
        return;
    }

    let configContent = '[SlideShow Config]\n\n';

    configImageList.forEach(item => {
        const fileName = item.file.name;
        const duration = item.duration || 5;
        configContent += `/slide_show/${fileName} ${duration}\n`;
    });

    // Create and download
    const blob = new Blob([configContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear config list
function clearConfigList() {
    // Revoke all object URLs
    configImageList.forEach(item => {
        const previewUrl = URL.createObjectURL(item.file);
        URL.revokeObjectURL(previewUrl);
    });
    
    configImageList = [];
    updateConfigList();
    
    const configFileInput = document.getElementById('configFileInput');
    if (configFileInput) {
        configFileInput.value = '';
    }
}

