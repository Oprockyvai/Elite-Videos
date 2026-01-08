/**
 * Video Player Functionality for EliteVideos
 * Handles video playback, controls, and interactions
 */

class VideoPlayer {
    constructor() {
        this.currentVideoId = null;
        this.videoData = null;
        this.isPlaying = false;
        this.videoHistory = [];
        this.init();
    }

    init() {
        // Get video ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.currentVideoId = urlParams.get('id');
        
        if (!this.currentVideoId) {
            this.showError('No video ID found in URL');
            return;
        }

        // Load video data
        this.loadVideoData();
        
        // Initialize player controls
        this.initPlayerControls();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize related videos
        this.loadRelatedVideos();
        
        // Add to view history
        this.addToViewHistory();
    }

    async loadVideoData() {
        try {
            // Try to get video from database
            this.videoData = getVideoById(this.currentVideoId);
            
            if (!this.videoData) {
                // Try to load from API
                const response = await fetch(`/api/videos.json`);
                const videos = await response.json();
                this.videoData = videos.find(v => v.id === this.currentVideoId);
                
                if (!this.videoData) {
                    throw new Error('Video not found');
                }
            }

            // Update page title and metadata
            this.updatePageMetadata();
            
            // Load video player
            this.loadVideoPlayer();
            
            // Update video info
            this.updateVideoInfo();
            
            // Increment view count
            this.incrementViewCount();

        } catch (error) {
            console.error('Error loading video data:', error);
            this.showError('Video not found or cannot be loaded');
        }
    }

    updatePageMetadata() {
        // Update page title
        document.title = `${this.videoData.title} - EliteVideos`;
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = this.videoData.description.substring(0, 160);
        
        // Update Open Graph tags
        this.updateOpenGraphTags();
        
        // Update Schema.org structured data
        this.updateStructuredData();
    }

    updateOpenGraphTags() {
        // OG Title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.content = this.videoData.title;
        
        // OG Description
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
        }
        ogDesc.content = this.videoData.description.substring(0, 200);
        
        // OG Image
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            ogImage = document.createElement('meta');
            ogImage.setAttribute('property', 'og:image');
            document.head.appendChild(ogImage);
        }
        ogImage.content = window.location.origin + this.videoData.thumbnail;
        
        // OG URL
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement('meta');
            ogUrl.setAttribute('property', 'og:url');
            document.head.appendChild(ogUrl);
        }
        ogUrl.content = window.location.href;
        
        // OG Type
        let ogType = document.querySelector('meta[property="og:type"]');
        if (!ogType) {
            ogType = document.createElement('meta');
            ogType.setAttribute('property', 'og:type');
            document.head.appendChild(ogType);
        }
        ogType.content = 'video.other';
        
        // Video OG Tags
        let ogVideo = document.querySelector('meta[property="og:video"]');
        if (!ogVideo) {
            ogVideo = document.createElement('meta');
            ogVideo.setAttribute('property', 'og:video');
            document.head.appendChild(ogVideo);
        }
        ogVideo.content = this.videoData.embedUrl;
        
        let ogVideoType = document.querySelector('meta[property="og:video:type"]');
        if (!ogVideoType) {
            ogVideoType = document.createElement('meta');
            ogVideoType.setAttribute('property', 'og:video:type');
            document.head.appendChild(ogVideoType);
        }
        ogVideoType.content = 'text/html';
        
        let ogVideoWidth = document.querySelector('meta[property="og:video:width"]');
        if (!ogVideoWidth) {
            ogVideoWidth = document.createElement('meta');
            ogVideoWidth.setAttribute('property', 'og:video:width');
            document.head.appendChild(ogVideoWidth);
        }
        ogVideoWidth.content = '1280';
        
        let ogVideoHeight = document.querySelector('meta[property="og:video:height"]');
        if (!ogVideoHeight) {
            ogVideoHeight = document.createElement('meta');
            ogVideoHeight.setAttribute('property', 'og:video:height');
            document.head.appendChild(ogVideoHeight);
        }
        ogVideoHeight.content = '720';
    }

    updateStructuredData() {
        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';
            document.head.appendChild(schemaScript);
        }
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": this.videoData.title,
            "description": this.videoData.description,
            "thumbnailUrl": window.location.origin + this.videoData.thumbnail,
            "uploadDate": this.videoData.uploadDate,
            "duration": `PT${this.videoData.duration}S`,
            "contentUrl": this.videoData.embedUrl.replace('/embed/', '/video/'),
            "embedUrl": this.videoData.embedUrl,
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/WatchAction",
                "userInteractionCount": this.videoData.views
            },
            "author": {
                "@type": "Organization",
                "name": "EliteVideos"
            },
            "regionsAllowed": "US,CA,UK,AU,EU",
            "inLanguage": this.videoData.language || "English"
        };
        
        schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    }

    loadVideoPlayer() {
        const videoIframe = document.getElementById('videoIframe');
        if (!videoIframe) return;
        
        // Set iframe source
        videoIframe.src = this.videoData.embedUrl;
        
        // Add loading state
        videoIframe.onload = () => {
            console.log('Video loaded successfully');
            this.hideLoading();
        };
        
        videoIframe.onerror = () => {
            console.error('Failed to load video');
            this.showError('Failed to load video. Please try another video.');
        };
        
        // Show loading
        this.showLoading();
    }

    updateVideoInfo() {
        // Update title
        const titleElement = document.getElementById('videoTitle');
        if (titleElement) {
            titleElement.textContent = this.videoData.title;
        }
        
        // Update description
        const descElement = document.getElementById('videoDescription');
        if (descElement) {
            descElement.textContent = this.videoData.description;
        }
        
        // Update views
        const viewsElement = document.getElementById('videoViews');
        if (viewsElement) {
            const formattedViews = formatNumber(this.videoData.views);
            viewsElement.innerHTML = `<i class="fas fa-eye"></i> ${formattedViews} views`;
        }
        
        // Update duration
        const durationElement = document.getElementById('videoDuration');
        if (durationElement) {
            const formattedDuration = formatDuration(this.videoData.duration);
            durationElement.innerHTML = `<i class="fas fa-clock"></i> ${formattedDuration}`;
        }
        
        // Update upload date
        const dateElement = document.getElementById('videoUploadDate');
        if (dateElement) {
            const formattedDate = formatDate(this.videoData.uploadDate);
            dateElement.innerHTML = `<i class="fas fa-calendar"></i> ${formattedDate}`;
        }
        
        // Update likes/dislikes
        const likeCount = document.getElementById('likeCount');
        const dislikeCount = document.getElementById('dislikeCount');
        if (likeCount) likeCount.textContent = formatNumber(this.videoData.likes || 0);
        if (dislikeCount) dislikeCount.textContent = formatNumber(this.videoData.dislikes || 0);
        
        // Update category
        const categoryElement = document.getElementById('categoryName');
        if (categoryElement) {
            categoryElement.textContent = this.videoData.category;
        }
        
        const viewAllCategory = document.getElementById('viewAllCategory');
        if (viewAllCategory) {
            viewAllCategory.href = `/category.html?cat=${this.videoData.category}`;
        }
        
        // Update tags
        const tagsContainer = document.getElementById('videoTags');
        if (tagsContainer && this.videoData.tags) {
            tagsContainer.innerHTML = '';
            this.videoData.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'video-tag';
                tagElement.textContent = tag;
                tagElement.addEventListener('click', () => {
                    window.location.href = `/search.html?q=${encodeURIComponent(tag)}`;
                });
                tagsContainer.appendChild(tagElement);
            });
        }
        
        // Update favorite button state
        this.updateFavoriteButton();
    }

    initPlayerControls() {
        // Like button
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.handleLike());
        }
        
        // Dislike button
        const dislikeBtn = document.getElementById('dislikeBtn');
        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', () => this.handleDislike());
        }
        
        // Favorite button
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.handleFavorite());
        }
        
        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShare());
        }
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handleDownload());
        }
        
        // Report button
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.handleReport());
        }
    }

    initEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space bar to play/pause (if not in input field)
            if (e.code === 'Space' && !this.isInputElement(e.target)) {
                e.preventDefault();
                this.togglePlayPause();
            }
            
            // Left arrow for rewind
            if (e.code === 'ArrowLeft') {
                this.rewind();
            }
            
            // Right arrow for forward
            if (e.code === 'ArrowRight') {
                this.forward();
            }
            
            // F for fullscreen
            if (e.code === 'KeyF') {
                this.toggleFullscreen();
            }
            
            // M for mute
            if (e.code === 'KeyM') {
                this.toggleMute();
            }
        });
        
        // Handle browser back button
        window.addEventListener('popstate', () => {
            this.savePlayerState();
        });
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.savePlayerState();
            }
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            this.savePlayerState();
        });
    }

    isInputElement(element) {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.isContentEditable;
    }

    handleLike() {
        if (!this.currentVideoId) return;
        
        // Update in database
        likeVideo(this.currentVideoId);
        
        // Update UI
        const likeBtn = document.getElementById('likeBtn');
        const likeCount = document.getElementById('likeCount');
        
        if (likeBtn) {
            likeBtn.classList.add('active');
            likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Liked`;
        }
        
        if (likeCount) {
            const current = parseInt(likeCount.textContent) || 0;
            likeCount.textContent = formatNumber(current + 1);
        }
        
        // Show notification
        showToast('Video liked', 'success');
        
        // Track in user preferences
        addUserPreference('liked', this.currentVideoId);
    }

    handleDislike() {
        if (!this.currentVideoId) return;
        
        // Update in database
        dislikeVideo(this.currentVideoId);
        
        // Update UI
        const dislikeBtn = document.getElementById('dislikeBtn');
        const dislikeCount = document.getElementById('dislikeCount');
        
        if (dislikeBtn) {
            dislikeBtn.classList.add('active');
            dislikeBtn.innerHTML = `<i class="fas fa-thumbs-down"></i> Disliked`;
        }
        
        if (dislikeCount) {
            const current = parseInt(dislikeCount.textContent) || 0;
            dislikeCount.textContent = formatNumber(current + 1);
        }
        
        // Show notification
        showToast('Video disliked', 'warning');
    }

    handleFavorite() {
        if (!this.currentVideoId) return;
        
        const favoriteBtn = document.getElementById('favoriteBtn');
        
        if (isFavorited(this.currentVideoId)) {
            // Remove from favorites
            removeFromFavorites(this.currentVideoId);
            
            if (favoriteBtn) {
                favoriteBtn.classList.remove('active');
                favoriteBtn.innerHTML = `<i class="fas fa-heart"></i> Add to Favorites`;
            }
            
            showToast('Removed from favorites', 'success');
        } else {
            // Add to favorites
            addToFavorites(this.currentVideoId);
            
            if (favoriteBtn) {
                favoriteBtn.classList.add('active');
                favoriteBtn.innerHTML = `<i class="fas fa-heart"></i> Added to Favorites`;
            }
            
            showToast('Added to favorites', 'success');
        }
    }

    updateFavoriteButton() {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (!favoriteBtn || !this.currentVideoId) return;
        
        if (isFavorited(this.currentVideoId)) {
            favoriteBtn.classList.add('active');
            favoriteBtn.innerHTML = `<i class="fas fa-heart"></i> Added to Favorites`;
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerHTML = `<i class="fas fa-heart"></i> Add to Favorites`;
        }
    }

    handleShare() {
        const shareData = {
            title: this.videoData.title,
            text: `Check out this video: ${this.videoData.title}`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => showToast('Shared successfully', 'success'))
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        this.copyShareLink();
                    }
                });
        } else {
            this.copyShareLink();
        }
    }

    copyShareLink() {
        const shareUrl = window.location.href;
        copyToClipboard(shareUrl)
            .then(() => showToast('Link copied to clipboard', 'success'))
            .catch(() => showToast('Failed to copy link', 'error'));
    }

    toggleFullscreen() {
        const videoContainer = document.querySelector('.player-container');
        if (!videoContainer) return;
        
        if (!document.fullscreenElement) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    togglePlayPause() {
        // This would control the iframe player
        // Note: Cross-origin restrictions may apply
        const videoIframe = document.getElementById('videoIframe');
        if (!videoIframe) return;
        
        try {
            // Try to post message to iframe
            videoIframe.contentWindow.postMessage('playPause', '*');
        } catch (error) {
            console.log('Cannot control iframe due to cross-origin restrictions');
        }
    }

    rewind() {
        const videoIframe = document.getElementById('videoIframe');
        if (!videoIframe) return;
        
        try {
            videoIframe.contentWindow.postMessage('rewind', '*');
        } catch (error) {
            console.log('Cannot control iframe');
        }
    }

    forward() {
        const videoIframe = document.getElementById('videoIframe');
        if (!videoIframe) return;
        
        try {
            videoIframe.contentWindow.postMessage('forward', '*');
        } catch (error) {
            console.log('Cannot control iframe');
        }
    }

    toggleMute() {
        const videoIframe = docu