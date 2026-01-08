/**
 * Search Data Management - Admin Panel
 * For adding and managing videos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    initVideoForm();
    
    // Load existing videos
    loadExistingVideos();
    
    // Setup preview functionality
    setupPreview();
});

// Initialize video form
function initVideoForm() {
    const form = document.getElementById('videoForm');
    if (!form) return;
    
    // Load categories for dropdown
    loadCategoriesToForm();
    
    // Tag management
    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagsContainer = document.getElementById('tagsContainer');
    
    let tags = [];
    
    // Add tag function
    function addTag(tagText) {
        const tag = tagText.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
            tags.push(tag);
            updateTagsDisplay();
        }
        tagInput.value = '';
    }
    
    // Update tags display
    function updateTagsDisplay() {
        tagsContainer.innerHTML = '';
        tags.forEach((tag, index) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="tag-remove" data-index="${index}">&times;</span>
            `;
            tagsContainer.appendChild(tagElement);
        });
        
        // Add remove event listeners
        tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                tags.splice(index, 1);
                updateTagsDisplay();
            });
        });
    }
    
    // Add tag on button click
    if (addTagBtn) {
        addTagBtn.addEventListener('click', function() {
            addTag(tagInput.value);
        });
    }
    
    // Add tag on Enter key
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag(this.value);
            }
        });
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            title: document.getElementById('videoTitle').value,
            id: document.getElementById('videoId').value,
            embedUrl: document.getElementById('embedUrl').value,
            thumbnail: document.getElementById('thumbnailUrl').value,
            category: document.getElementById('videoCategory').value,
            duration: document.getElementById('videoDuration').value,
            description: document.getElementById('videoDescription').value,
            views: parseInt(document.getElementById('videoViews').value) || 0,
            tags: tags
        };
        
        // Validate form
        if (!formData.title || !formData.id || !formData.embedUrl || !formData.thumbnail || !formData.category) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate duration format (MM:SS)
        const durationRegex = /^[0-9]+:[0-9]{2}$/;
        if (!durationRegex.test(formData.duration)) {
            showToast('Duration must be in MM:SS format', 'error');
            return;
        }
        
        // Convert duration to seconds
        const [minutes, seconds] = formData.duration.split(':').map(Number);
        formData.duration = minutes * 60 + seconds;
        
        // Add video to database
        const newVideo = addVideo(formData);
        
        if (newVideo) {
            showToast('Video added successfully!', 'success');
            
            // Reset form
            form.reset();
            tags = [];
            updateTagsDisplay();
            
            // Reload video list
            loadExistingVideos();
            
            // Update preview
            updatePreview({}, true);
        } else {
            showToast('Failed to add video', 'error');
        }
    });
}

// Load categories to form dropdown
function loadCategoriesToForm() {
    const categorySelect = document.getElementById('videoCategory');
    if (!categorySelect) return;
    
    const categories = getAllCategories();
    
    // Clear existing options except first one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Setup preview functionality
function setupPreview() {
    const titleInput = document.getElementById('videoTitle');
    const thumbnailInput = document.getElementById('thumbnailUrl');
    
    if (titleInput) {
        titleInput.addEventListener('input', updatePreview);
    }
    
    if (thumbnailInput) {
        thumbnailInput.addEventListener('input', updatePreview);
    }
}

// Update preview
function updatePreview(e, reset = false) {
    const previewThumb = document.getElementById('previewThumb');
    const previewTitle = document.getElementById('previewTitle');
    
    if (reset) {
        if (previewThumb) previewThumb.src = '';
        if (previewTitle) previewTitle.textContent = '';
        return;
    }
    
    if (e && e.target) {
        const id = e.target.id;
        
        if (id === 'videoTitle' && previewTitle) {
            previewTitle.textContent = e.target.value || 'Video Title Preview';
        }
        
        if (id === 'thumbnailUrl' && previewThumb) {
            previewThumb.src = e.target.value || '';
            previewThumb.onerror = function() {
                this.src = '/assets/thumbnails/default.jpg';
            };
        }
    }
}

// Load existing videos
function loadExistingVideos() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;
    
    const videos = getAllVideos();
    
    if (videos.length === 0) {
        videoList.innerHTML = '<p class="no-results">No videos added yet</p>';
        return;
    }
    
    videoList.innerHTML = '';
    
    // Sort by newest first
    videos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    videos.forEach(video => {
        const listItem = document.createElement('div');
        listItem.className = 'video-list-item';
        listItem.dataset.id = video.id;
        
        const duration = formatDuration(video.duration);
        const views = formatNumber(video.views);
        
        listItem.innerHTML = `
            <div class="video-list-info">
                <h4>${video.title}</h4>
                <p>Category: ${video.category} | Duration: ${duration} | Views: ${views}</p>
                <small>ID: ${video.id} | Added: ${formatDate(video.uploadDate)}</small>
            </div>
            <div class="video-list-actions">
                <span class="action-icon action-edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </span>
                <span class="action-icon action-delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </span>
            </div>
        `;
        
        videoList.appendChild(listItem);
    });
    
    // Add event listeners
    videoList.querySelectorAll('.action-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.closest('.video-list-item').dataset.id;
            editVideo(videoId);
        });
    });
    
    videoList.querySelectorAll('.action-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.closest('.video-list-item').dataset.id;
            deleteVideoFromList(videoId);
        });
    });
    
    // Click to preview
    videoList.querySelectorAll('.video-list-item').forEach(item => {
        item.addEventListener('click', function() {
            const videoId = this.dataset.id;
            previewVideo(videoId);
        });
    });
}

// Edit video
function editVideo(videoId) {
    const video = getVideoById(videoId);
    if (!video) {
        showToast('Video not found', 'error');
        return;
    }
    
    // Fill form with video data
    document.getElementById('videoTitle').value = video.title;
    document.getElementById('videoId').value = video.id;
    document.getElementById('embedUrl').value = video.embedUrl;
    document.getElementById('thumbnailUrl').value = video.thumbnail;
    document.getElementById('videoCategory').value = video.category;
    document.getElementById('videoDuration').value = formatDuration(video.duration);
    document.getElementById('videoDescription').value = video.description;
    document.getElementById('videoViews').value = video.views;
    
    // Update tags
    const tagsContainer = document.getElementById('tagsContainer');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        video.tags.forEach((tag, index) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="tag-remove" data-index="${index}">&times;</span>
            `;
            tagsContainer.appendChild(tagElement);
        });
        
        // Update tags array
        window.currentTags = video.tags;
    }
    
    // Update preview
    document.getElementById('previewThumb').src = video.thumbnail;
    document.getElementById('previewTitle').textContent = video.title;
    
    showToast('Edit video details and submit to update', 'info');
}

// Delete video from list
function deleteVideoFromList(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        const success = deleteVideo(videoId);
        
        if (success) {
            showToast('Video deleted successfully', 'success');
            loadExistingVideos();
        } else {
            showToast('Failed to delete video', 'error');
        }
    }
}

// Preview video
function previewVideo(videoId) {
    const video = getVideoById(videoId);
    if (!video) return;
    
    // Open video in new tab
    window.open(`/video.html?id=${videoId}`, '_blank');
}

// Add some styles for the admin panel
function addAdminStyles() {
    if (!document.getElementById('admin-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-styles';
        styles.textContent = `
            .no-results {
                text-align: center;
                padding: 40px;
                color: var(--text-secondary);
            }
            
            .form-text {
                color: var(--text-muted);
                font-size: 12px;
                margin-top: 5px;
            }
            
            .video-list-item {
                cursor: pointer;
                transition: var(--transition-fast);
            }
            
            .video-list-item:hover {
                background: var(--bg-hover);
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize admin styles
addAdminStyles();