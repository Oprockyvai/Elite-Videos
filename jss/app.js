/**
 * Main Application Script for EliteVideos
 * Handles core functionality and initialization
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize database
    initDatabase();
    
    // Check age verification
    checkAgeVerification();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load homepage content
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadHomePage();
    }
});

// Check age verification
function checkAgeVerification() {
    const ageVerified = localStorage.getItem('ageVerified');
    const ageVerificationOverlay = document.getElementById('ageVerification');
    
    if (ageVerificationOverlay) {
        if (!ageVerified) {
            ageVerificationOverlay.style.display = 'flex';
            initAgeVerification();
        } else {
            ageVerificationOverlay.style.display = 'none';
        }
    }
}

// Initialize age verification
function initAgeVerification() {
    const enterBtn = document.getElementById('enterSite');
    const leaveBtn = document.getElementById('leaveSite');
    const birthDateInput = document.getElementById('birthDate');
    const ageConfirm = document.getElementById('ageConfirm');
    const termsConfirm = document.getElementById('termsConfirm');
    
    if (enterBtn) {
        enterBtn.addEventListener('click', function() {
            const birthDate = new Date(birthDateInput.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age >= 18 && ageConfirm.checked && termsConfirm.checked) {
                localStorage.setItem('ageVerified', 'true');
                localStorage.setItem('ageVerificationDate', new Date().toISOString());
                document.getElementById('ageVerification').style.display = 'none';
                showToast('Age verified successfully!', 'success');
            } else {
                showToast('You must be 18+ and agree to terms', 'error');
            }
        });
    }
    
    if (leaveBtn) {
        leaveBtn.addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });
    }
}

// Initialize navigation
function initNavigation() {
    // Category menu
    const categoryMenuBtn = document.getElementById('categoryMenuBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    
    if (categoryMenuBtn && categoryDropdown) {
        categoryMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            categoryDropdown.classList.toggle('active');
            
            // Load categories if not loaded
            if (categoryDropdown.children.length === 0) {
                loadCategoriesToDropdown();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!categoryDropdown.contains(e.target) && !categoryMenuBtn.contains(e.target)) {
                categoryDropdown.classList.remove('active');
            }
        });
    }
    
    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Global search
    const globalSearch = document.getElementById('globalSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (globalSearch && searchSuggestions) {
        // Debounced search
        const debouncedSearch = debounce(function() {
            const query = globalSearch.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query);
            } else {
                searchSuggestions.classList.remove('active');
            }
        }, 300);
        
        globalSearch.addEventListener('input', debouncedSearch);
        
        // Handle enter key
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = globalSearch.value.trim();
                if (query) {
                    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchSuggestions.contains(e.target) && e.target !== globalSearch) {
                searchSuggestions.classList.remove('active');
            }
        });
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // Toggle mobile menu
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown) {
                userDropdown.classList.toggle('active');
            }
        });
    }
}

// Load categories to dropdown
function loadCategoriesToDropdown() {
    const categoryDropdown = document.getElementById('categoryDropdown');
    if (!categoryDropdown) return;
    
    const categories = getAllCategories();
    
    categories.forEach(category => {
        const link = document.createElement('a');
        link.href = `/category.html?cat=${category.id}`;
        link.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
        categoryDropdown.appendChild(link);
    });
}

// Show search suggestions
function showSearchSuggestions(query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (!searchSuggestions) return;
    
    const videos = getAllVideos();
    const suggestions = videos
        .filter(video => 
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5); // Limit to 5 suggestions
    
    searchSuggestions.innerHTML = '';
    
    if (suggestions.length > 0) {
        suggestions.forEach(video => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <i class="fas fa-search"></i>
                <span>${video.title}</span>
            `;
            item.addEventListener('click', function() {
                window.location.href = `/video.html?id=${video.id}`;
            });
            searchSuggestions.appendChild(item);
        });
        
        searchSuggestions.classList.add('active');
    } else {
        searchSuggestions.classList.remove('active');
    }
}

// Initialize event listeners
function initEventListeners() {
    // Favorites button
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showFavorites();
        });
    }
    
    // History button
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showHistory();
        });
    }
    
    // Mobile favorites
    const mobileFavorites = document.getElementById('mobileFavorites');
    if (mobileFavorites) {
        mobileFavorites.addEventListener('click', function(e) {
            e.preventDefault();
            showFavorites();
        });
    }
    
    // Refresh recommendations
    const refreshRecs = document.getElementById('refreshRecommendations');
    if (refreshRecs) {
        refreshRecs.addEventListener('click', function(e) {
            e.preventDefault();
            refreshRecommendations();
        });
    }
}

// Load homepage content
function loadHomePage() {
    // Update total videos count
    const totalVideos = document.getElementById('totalVideos');
    if (totalVideos) {
        const videos = getAllVideos();
        totalVideos.textContent = formatNumber(videos.length) + '+';
    }
    
    // Load trending videos
    loadTrendingVideos();
    
    // Load new videos
    loadNewVideos();
    
    // Load recommended videos
    loadRecommendedVideos();
    
    // Load categories
    loadCategories();
}

// Load trending videos
function loadTrendingVideos() {
    const container = document.getElementById('trendingVideos');
    if (!container) return;
    
    const videos = getTrendingVideos(8);
    container.innerHTML = '';
    
    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });
}

// Load new videos
function loadNewVideos() {
    const container = document.getElementById('newVideos');
    if (!container) return;
    
    const videos = getNewVideos(8);
    container.innerHTML = '';
    
    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });
}

// Load recommended videos
function loadRecommendedVideos() {
    const container = document.getElementById('recommendedVideos');
    if (!container) return;
    
    const videos = getConsistentRecommendations();
    container.innerHTML = '';
    
    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });
}

// Load categories
function loadCategories() {
    const container = document.getElementById('categoryNav');
    if (!container) return;
    
    const categories = getAllCategories();
    container.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
        button.dataset.category = category.id;
        
        button.addEventListener('click', function() {
            window.location.href = `/category.html?cat=${category.id}`;
        });
        
        container.appendChild(button);
    });
}

// Create video card element
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.dataset.id = video.id;
    
    const duration = formatDuration(video.duration);
    const views = formatNumber(video.views);
    const rating = video.rating.toFixed(1);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            <div class="video-overlay">
                <div class="video-duration">${duration}</div>
                <div class="video-play-btn">
                    <i class="fas fa-play"></i>
                </div>
            </div>
        </div>
        <div class="video-content">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-meta">
                <div class="video-views">
                    <i class="fas fa-eye"></i> ${views} views
                </div>
                <div class="video-rating">
                    <i class="fas fa-star"></i> ${rating}
                </div>
            </div>
            <div class="video-category">${video.category}</div>
        </div>
    `;
    
    // Add click events
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.video-play-btn')) {
            window.location.href = `/video.html?id=${video.id}`;
        }
    });
    
    const playBtn = card.querySelector('.video-play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.location.href = `/video.html?id=${video.id}`;
        });
    }
    
    return card;
}

// Show favorites
function showFavorites() {
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        showToast('No favorites yet', 'info');
        return;
    }
    
    // Create modal for favorites
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-heart"></i> My Favorites</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body favorites-grid">
                ${favorites.map(video => `
                    <div class="favorite-item" data-id="${video.id}">
                        <img src="${video.thumbnail}" alt="${video.title}">
                        <div class="favorite-info">
                            <h4>${video.title}</h4>
                            <button class="remove-favorite" data-id="${video.id}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Remove favorite buttons
    modal.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoId = this.dataset.id;
            removeFromFavorites(videoId);
            showToast('Removed from favorites', 'success');
            this.closest('.favorite-item').remove();
            
            // Close modal if no favorites left
            if (modal.querySelectorAll('.favorite-item').length === 0) {
                modal.remove();
            }
        });
    });
    
    // Click to go to video
    modal.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.remove-favorite')) {
                const videoId = this.dataset.id;
                window.location.href = `/video.html?id=${videoId}`;
            }
        });
    });
}

// Show history
function showHistory() {
    const history = getViewHistory();
    
    if (history.length === 0) {
        showToast('No viewing history', 'info');
        return;
    }
    
    // Create modal for history
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-history"></i> Viewing History</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body history-list">
                ${history.map(item => `
                    <div class="history-item" data-id="${item.videoId}">
                        <img src="${item.video.thumbnail}" alt="${item.video.title}">
                        <div class="history-info">
                            <h4>${item.video.title}</h4>
                            <small>${formatDate(item.timestamp)}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="clearHistory">
                    <i class="fas fa-trash"></i> Clear History
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Clear history button
    modal.querySelector('#clearHistory').addEventListener('click', function() {
        localStorage.removeItem(VIEW_HISTORY_KEY);
        showToast('History cleared', 'success');
        modal.remove();
    });
    
    // Click to go to video
    modal.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
            const videoId = this.dataset.id;
            window.location.href = `/video.html?id=${videoId}`;
        });
    });
}

// Refresh recommendations
function refreshRecommendations() {
    const container = document.getElementById('recommendedVideos');
    if (!container) return;
    
    // Clear saved recommendations to get new ones
    localStorage.removeItem(RECOMMENDATIONS_KEY);
    
    const videos = getConsistentRecommendations();
    container.innerHTML = '';
    
    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });
    
    showToast('Recommendations refreshed', 'success');
}

// Add modal styles if not present
function addModalStyles() {
    if (!document.getElementById('modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: var(--bg-card);
                border-radius: var(--border-radius-lg);
                max-width: 800px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-xl);
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 20px;
                overflow-y: auto;
                max-height: calc(80vh - 130px);
            }
            
            .modal-footer {
                padding: 20px;
                border-top: 1px solid var(--border-color);
                text-align: right;
            }
            
            .favorites-grid,
            .history-list {
                display: grid;
                gap: 15px;
            }
            
            .favorite-it

// Auto Sitemap Generator
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait 5 seconds after page load
        setTimeout(() => {
            updateSitemap();
        }, 5000);
    });
    
    async function updateSitemap() {
        try {
            const videos = getAllVideos(); // Your existing function
            const categories = getAllCategories(); // Your existing function
            
            const sitemap = generateSimpleSitemap(videos, categories);
            
            // Save to localStorage for backup
            localStorage.setItem('last_sitemap', sitemap);
            localStorage.setItem('sitemap_updated', new Date().toISOString());
            
            console.log('Sitemap updated in background');
            
        } catch (error) {
            console.log('Sitemap update skipped:', error.message);
        }
    }
    
    function generateSimpleSitemap(videos, categories) {
        const domain = window.location.origin;
        const date = new Date().toISOString().split('T')[0];
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        // Add basic URLs
        const urls = [
            { loc: '/', priority: 1.0 },
            { loc: '/search', priority: 0.8 },
            { loc: '/category', priority: 0.9 }
        ];
        
        urls.forEach(url => {
            xml += `  <url>\n    <loc>${domain}${url.loc}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${url.priority}</priority>\n  </url>\n`;
        });
        
        // Add video URLs
        videos.forEach(video => {
            xml += `  <url>\n    <loc>${domain}/video/${video.id}</loc>\n    <lastmod>${video.uploadDate || date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        });
        
        xml += `</urlset>`;
        return xml;
    }
}