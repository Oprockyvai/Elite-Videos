/**
 * Search Page Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search
    initSearch();
    
    // Load categories for filter
    loadCategoryFilter();
    
    // Load popular searches
    loadPopularSearches();
});

// Initialize search
function initSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || '';
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput && searchQuery) {
        searchInput.value = decodeURIComponent(searchQuery);
        performSearch(searchQuery);
    }
    
    // Setup search input event
    if (searchInput) {
        const debouncedSearch = debounce(function() {
            const query = searchInput.value.trim();
            if (query) {
                // Update URL without reload
                const url = new URL(window.location);
                url.searchParams.set('q', query);
                window.history.replaceState({}, '', url);
                
                // Perform search
                performSearch(query);
            }
        }, 500);
        
        searchInput.addEventListener('input', debouncedSearch);
    }
    
    // Setup filter events
    const sortBy = document.getElementById('sortBy');
    const categoryFilter = document.getElementById('categoryFilter');
    const durationFilter = document.getElementById('durationFilter');
    
    if (sortBy) {
        sortBy.addEventListener('change', updateSearch);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateSearch);
    }
    
    if (durationFilter) {
        durationFilter.addEventListener('change', updateSearch);
    }
}

// Perform search
function performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultCount = document.getElementById('resultCount');
    
    if (!resultsContainer) return;
    
    // Show loading
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
    
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    resultsContainer.innerHTML = '';
    
    // Simulate loading delay
    setTimeout(() => {
        // Get filters
        const filters = {
            sortBy: document.getElementById('sortBy')?.value || 'relevance',
            category: document.getElementById('categoryFilter')?.value || 'all',
            duration: document.getElementById('durationFilter')?.value || 'all'
        };
        
        // Perform search
        const results = searchVideos(query, filters);
        
    // Update result count
        if (resultCount) {
            resultCount.textContent = `${results.length} video${results.length !== 1 ? 's' : ''} found`;
        }
        
        // Display results
        if (results.length > 0) {
            results.forEach(video => {
                resultsContainer.appendChild(createVideoCard(video));
            });
            
            // Load recommendations based on search
            loadSearchRecommendations(results);
        } else {
            if (noResults) {
                noResults.style.display = 'block';
            }
        }
        
        // Hide loading
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }, 500);
}

// Update search when filters change
function updateSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (query) {
        performSearch(query);
    }
}

// Load categories for filter
function loadCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const categories = getAllCategories();
    
    // Clear existing options except first one
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// Load popular searches
function loadPopularSearches() {
    const popularTags = document.getElementById('popularTags');
    if (!popularTags) return;
    
    // Popular search tags
    const tags = [
        'HD Videos', 'New Releases', 'Popular', 'Trending', 
        'Long Videos', 'Short Videos', 'Premium', 'Exclusive',
        'Amateur', 'Professional', '4K', 'Ultra HD'
    ];
    
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'search-tag';
        span.textContent = tag;
        span.dataset.search = tag.toLowerCase();
        
        span.addEventListener('click', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = tag;
                performSearch(tag);
                
                // Update URL
                const url = new URL(window.location);
                url.searchParams.set('q', tag);
                window.history.replaceState({}, '', url);
            }
        });
        
        popularTags.appendChild(span);
    });
}

// Load search recommendations
function loadSearchRecommendations(searchResults) {
    const container = document.getElementById('searchRecommendations');
    if (!container) return;
    
    // If few results, get related videos
    if (searchResults.length < 4) {
        const allVideos = getAllVideos();
        const recommended = allVideos
            .filter(video => !searchResults.some(result => result.id === video.id))
            .slice(0, 6);
        
        displayRecommendations(container, recommended);
    } else {
        // Get recommendations based on search results
        const categories = [...new Set(searchResults.map(video => video.category))];
        const tags = [...new Set(searchResults.flatMap(video => video.tags))];
        
        const preferences = {
            categories,
            tags,
            viewedVideos: searchResults.map(video => video.id)
        };
        
        // Save temporary preferences for recommendations
        localStorage.setItem('temp_search_preferences', JSON.stringify(preferences));
        
        // Get recommendations
        const allVideos = getAllVideos();
        let scoredVideos = allVideos
            .filter(video => !searchResults.some(result => result.id === video.id))
            .map(video => {
                let score = 0;
                
                if (categories.includes(video.category)) score += 10;
                
                video.tags.forEach(tag => {
                    if (tags.includes(tag)) score += 5;
                });
                
                score += Math.random() * 2;
                return { video, score };
            });
        
        scoredVideos.sort((a, b) => b.score - a.score);
        const recommended = scoredVideos.slice(0, 6).map(item => item.video);
        
        displayRecommendations(container, recommended);
    }
}

// Display recommendations
function displayRecommendations(container, videos) {
    container.innerHTML = '';
    
    if (videos.length === 0) {
        container.innerHTML = '<p class="no-results">No recommendations available</p>';
        return;
    }
    
    videos.forEach(video => {
        container.appendChild(createVideoCard(video));
    });
}

// Create video card for search results
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
    
    card.addEventListener('click', function() {
        window.location.href = `/video.html?id=${video.id}`;
    });
    
    return card;
}