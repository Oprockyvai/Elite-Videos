/**
 * Database Management for EliteVideos
 * Handles all video data operations
 */

const DATABASE_KEY = 'elitevideos_database';
const RECOMMENDATIONS_KEY = 'elitevideos_recommendations';
const USER_PREFERENCES_KEY = 'elitevideos_preferences';
const VIEW_HISTORY_KEY = 'elitevideos_history';
const FAVORITES_KEY = 'elitevideos_favorites';

// Default video data structure
const defaultVideos = [
    {
        id: '1',
        title: 'Premium HD Experience',
        description: 'Experience the best in HD quality with our premium content.',
        embedUrl: 'https://example.com/embed/video1',
        thumbnail: '/assets/thumbnails/thumb1.jpg',
        category: 'premium',
        tags: ['hd', 'premium', 'exclusive'],
        duration: 634, // seconds
        views: 12500,
        rating: 4.8,
        uploadDate: '2024-01-10',
        likes: 850,
        dislikes: 25
    },
    {
        id: '2',
        title: 'Trending Now - Exclusive',
        description: 'Currently trending video with exclusive content.',
        embedUrl: 'https://example.com/embed/video2',
        thumbnail: '/assets/thumbnails/thumb2.jpg',
        category: 'trending',
        tags: ['trending', 'popular', 'hot'],
        duration: 452,
        views: 8900,
        rating: 4.5,
        uploadDate: '2024-01-12',
        likes: 620,
        dislikes: 18
    },
    {
        id: '3',
        title: 'New Release Today',
        description: 'Fresh content just released today.',
        embedUrl: 'https://example.com/embed/video3',
        thumbnail: '/assets/thumbnails/thumb3.jpg',
        category: 'new',
        tags: ['new', 'fresh', 'latest'],
        duration: 721,
        views: 3400,
        rating: 4.2,
        uploadDate: '2024-01-15',
        likes: 280,
        dislikes: 12
    },
    {
        id: '4',
        title: 'Amateur Collection',
        description: 'Authentic amateur content for real experiences.',
        embedUrl: 'https://example.com/embed/video4',
        thumbnail: '/assets/thumbnails/thumb4.jpg',
        category: 'amateur',
        tags: ['amateur', 'real', 'authentic'],
        duration: 512,
        views: 6700,
        rating: 4.3,
        uploadDate: '2024-01-08',
        likes: 450,
        dislikes: 20
    },
    {
        id: '5',
        title: 'Professional Production',
        description: 'High quality professional production.',
        embedUrl: 'https://example.com/embed/video5',
        thumbnail: '/assets/thumbnails/thumb5.jpg',
        category: 'professional',
        tags: ['professional', 'quality', 'production'],
        duration: 890,
        views: 11200,
        rating: 4.7,
        uploadDate: '2024-01-05',
        likes: 780,
        dislikes: 15
    },
    {
        id: '6',
        title: 'HD Quality Exclusive',
        description: 'Exclusive content in full HD quality.',
        embedUrl: 'https://example.com/embed/video6',
        thumbnail: '/assets/thumbnails/thumb6.jpg',
        category: 'hd',
        tags: ['hd', 'quality', 'exclusive'],
        duration: 345,
        views: 7800,
        rating: 4.4,
        uploadDate: '2024-01-03',
        likes: 520,
        dislikes: 22
    }
];

// Default categories
const defaultCategories = [
    { id: 'trending', name: 'Trending', icon: 'fas fa-fire', count: 24 },
    { id: 'new', name: 'New Releases', icon: 'fas fa-star', count: 18 },
    { id: 'popular', name: 'Popular', icon: 'fas fa-chart-line', count: 32 },
    { id: 'hd', name: 'HD Quality', icon: 'fas fa-hd', count: 15 },
    { id: 'premium', name: 'Premium', icon: 'fas fa-crown', count: 12 },
    { id: 'exclusive', name: 'Exclusive', icon: 'fas fa-lock', count: 8 },
    { id: 'amateur', name: 'Amateur', icon: 'fas fa-user', count: 28 },
    { id: 'professional', name: 'Professional', icon: 'fas fa-video', count: 16 }
];

// Initialize database
function initDatabase() {
    if (!localStorage.getItem(DATABASE_KEY)) {
        localStorage.setItem(DATABASE_KEY, JSON.stringify(defaultVideos));
    }
    
    if (!localStorage.getItem(RECOMMENDATIONS_KEY)) {
        localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(USER_PREFERENCES_KEY)) {
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify({
            categories: [],
            tags: [],
            viewedVideos: []
        }));
    }
    
    if (!localStorage.getItem(VIEW_HISTORY_KEY)) {
        localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(FAVORITES_KEY)) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
    }
}

// Get all videos
function getAllVideos() {
    try {
        const videos = JSON.parse(localStorage.getItem(DATABASE_KEY) || '[]');
        return Array.isArray(videos) ? videos : defaultVideos;
    } catch (error) {
        console.error('Error getting videos:', error);
        return defaultVideos;
    }
}

// Get video by ID
function getVideoById(id) {
    const videos = getAllVideos();
    return videos.find(video => video.id === id);
}

// Get videos by category
function getVideosByCategory(category, limit = null) {
    const videos = getAllVideos();
    const filtered = videos.filter(video => video.category === category);
    
    if (limit && limit > 0) {
        return filtered.slice(0, limit);
    }
    
    return filtered;
}

// Search videos
function searchVideos(query, filters = {}) {
    const videos = getAllVideos();
    const searchTerm = query.toLowerCase().trim();
    
    let results = videos.filter(video => {
        // Search in title
        if (video.title.toLowerCase().includes(searchTerm)) return true;
        
        // Search in description
        if (video.description.toLowerCase().includes(searchTerm)) return true;
        
        // Search in tags
        if (video.tags.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
        
        // Search in category
        if (video.category.toLowerCase().includes(searchTerm)) return true;
        
        return false;
    });
    
    // Apply filters
    if (filters.category && filters.category !== 'all') {
        results = results.filter(video => video.category === filters.category);
    }
    
    if (filters.duration) {
        switch (filters.duration) {
            case 'short':
                results = results.filter(video => video.duration < 300); // < 5 min
                break;
            case 'medium':
                results = results.filter(video => video.duration >= 300 && video.duration <= 900); // 5-15 min
                break;
            case 'long':
                results = results.filter(video => video.duration > 900); // > 15 min
                break;
        }
    }
    
    // Apply sorting
    if (filters.sortBy) {
        switch (filters.sortBy) {
            case 'newest':
                results.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                break;
            case 'oldest':
                results.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
                break;
            case 'views':
                results.sort((a, b) => b.views - a.views);
                break;
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'duration':
                results.sort((a, b) => b.duration - a.duration);
                break;
            default: // relevance
                // Keep search relevance order
                break;
        }
    }
    
    return results;
}

// Get trending videos
function getTrendingVideos(limit = 6) {
    const videos = getAllVideos();
    return videos
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

// Get new videos
function getNewVideos(limit = 6) {
    const videos = getAllVideos();
    return videos
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, limit);
}

// Add new video
function addVideo(videoData) {
    const videos = getAllVideos();
    
    // Generate ID if not provided
    if (!videoData.id) {
        videoData.id = Date.now().toString();
    }
    
    // Set default values
    const newVideo = {
        id: videoData.id,
        title: videoData.title || 'Untitled Video',
        description: videoData.description || '',
        embedUrl: videoData.embedUrl || '',
        thumbnail: videoData.thumbnail || '/assets/thumbnails/default.jpg',
        category: videoData.category || 'uncategorized',
        tags: videoData.tags || [],
        duration: parseInt(videoData.duration) || 0,
        views: parseInt(videoData.views) || 0,
        rating: parseFloat(videoData.rating) || 0,
        uploadDate: videoData.uploadDate || new Date().toISOString().split('T')[0],
        likes: parseInt(videoData.likes) || 0,
        dislikes: parseInt(videoData.dislikes) || 0
    };
    
    videos.push(newVideo);
    localStorage.setItem(DATABASE_KEY, JSON.stringify(videos));
    
    // Update recommendations
    updateRecommendations();
    
    return newVideo;
}

// Update video
function updateVideo(id, updates) {
    const videos = getAllVideos();
    const index = videos.findIndex(video => video.id === id);
    
    if (index === -1) return null;
    
    // Merge updates
    videos[index] = { ...videos[index], ...updates };
    localStorage.setItem(DATABASE_KEY, JSON.stringify(videos));
    
    // Update recommendations
    updateRecommendations();
    
    return videos[index];
}

// Delete video
function deleteVideo(id) {
    const videos = getAllVideos();
    const filtered = videos.filter(video => video.id !== id);
    
    if (filtered.length === videos.length) return false;
    
    localStorage.setItem(DATABASE_KEY, JSON.stringify(filtered));
    
    // Update recommendations
    updateRecommendations();
    
    return true;
}

// Increment video views
function incrementViews(id) {
    const video = getVideoById(id);
    if (video) {
        video.views = (video.views || 0) + 1;
        updateVideo(id, { views: video.views });
    }
}

// Like video
function likeVideo(id) {
    const video = getVideoById(id);
    if (video) {
        video.likes = (video.likes || 0) + 1;
        updateVideo(id, { likes: video.likes });
        
        // Add to user preferences
        addUserPreference('liked', id);
    }
}

// Dislike video
function dislikeVideo(id) {
    const video = getVideoById(id);
    if (video) {
        video.dislikes = (video.dislikes || 0) + 1;
        updateVideo(id, { dislikes: video.dislikes });
    }
}

// Get all categories
function getAllCategories() {
    return defaultCategories;
}

// Get category by ID
function getCategoryById(id) {
    return defaultCategories.find(cat => cat.id === id);
}

// Get recommendations based on user preferences
function getRecommendations(limit = 6) {
    const preferences = getUserPreferences();
    const videos = getAllVideos();
    
    // If no preferences, return trending videos
    if (preferences.viewedVideos.length === 0 && 
        preferences.categories.length === 0 && 
        preferences.tags.length === 0) {
        return getTrendingVideos(limit);
    }
    
    let scoredVideos = videos.map(video => {
        let score = 0;
        
        // Score based on viewed categories
        if (preferences.categories.includes(video.category)) {
            score += 10;
        }
        
        // Score based on tags
        video.tags.forEach(tag => {
            if (preferences.tags.includes(tag)) {
                score += 5;
            }
        });
        
        // Score based on view history (avoid showing recently watched)
        if (!preferences.viewedVideos.includes(video.id)) {
            score += 3;
        }
        
        // Add some randomness to mix things up
        score += Math.random() * 2;
        
        return { video, score };
    });
    
    // Sort by score
    scoredVideos.sort((a, b) => b.score - a.score);
    
    // Get top videos
    const recommended = scoredVideos.slice(0, limit).map(item => item.video);
    
    // Save recommendations for consistency
    saveRecommendations(recommended);
    
    return recommended;
}

// Get consistent recommendations (won't change until user interacts)
function getConsistentRecommendations() {
    const saved = JSON.parse(localStorage.getItem(RECOMMENDATIONS_KEY) || '[]');
    
    if (saved.length > 0) {
        return saved;
    }
    
    // Generate new recommendations if none saved
    const recommendations = getRecommendations();
    saveRecommendations(recommendations);
    return recommendations;
}

// Save recommendations
function saveRecommendations(recommendations) {
    localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
}

// Update recommendations
function updateRecommendations() {
    const recommendations = getRecommendations();
    saveRecommendations(recommendations);
}

// Get user preferences
function getUserPreferences() {
    try {
        return JSON.parse(localStorage.getItem(USER_PREFERENCES_KEY) || '{}');
    } catch (error) {
        return {
            categories: [],
            tags: [],
            viewedVideos: []
        };
    }
}

// Add user preference
function addUserPreference(type, value) {
    const preferences = getUserPreferences();
    
    switch (type) {
        case 'category':
            if (!preferences.categories.includes(value)) {
                preferences.categories.push(value);
            }
            break;
        case 'tag':
            if (!preferences.tags.includes(value)) {
                preferences.tags.push(value);
            }
            break;
        case 'viewed':
            if (!preferences.viewedVideos.includes(value)) {
                preferences.viewedVideos.push(value);
                // Keep only last 50 viewed videos
                if (preferences.viewedVideos.length > 50) {
                    preferences.viewedVideos = preferences.viewedVideos.slice(-50);
                }
            }
            break;
        case 'liked':
            // Track liked videos for better recommendations
            preferences.tags.push('liked');
            break;
    }
    
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
}

// Get view history
function getViewHistory() {
    try {
        const history = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]');
        return history.map(item => {
            const video = getVideoById(item.videoId);
            return video ? { ...item, video } : null;
        }).filter(item => item !== null);
    } catch (error) {
        return [];
    }
}

// Add to view history
function addToHistory(videoId) {
    const history = getViewHistory();
    
    // Remove if already exists
    const filtered = history.filter(item => item.videoId !== videoId);
    
    // Add to beginning
    filtered.unshift({
        videoId,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
    });
    
    // Keep only last 100 items
    const limited = filtered.slice(0, 100);
    
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(limited));
    
    // Update user preferences
    addUserPreference('viewed', videoId);
    
    // Get video category for preferences
    const video = getVideoById(videoId);
    if (video) {
        addUserPreference('category', video.category);
    }
}

// Get favorites
function getFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        return favorites.map(videoId => getVideoById(videoId)).filter(video => video !== null);
    } catch (error) {
        return [];
    }
}

// Add to favorites
function addToFavorites(videoId) {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    
    if (!favorites.includes(videoId)) {
        favorites.push(videoId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    }
    
    return false;
}

// Remove from favorites
function removeFromFavorites(videoId) {
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    
    const index = favorites.indexOf(videoId);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    }
    
    return false;
}

// Check if video is favorited
function isFavorited(videoId) {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return favorites.includes(videoId);
}

// Get video suggestions based on current video
function getVideoSuggestions(videoId, limit = 6) {
    const currentVideo = getVideoById(videoId);
    if (!currentVideo) return getTrendingVideos(limit);
    
    const videos = getAllVideos();
    
    let scoredVideos = videos
        .filter(video => video.id !== videoId)
        .map(video => {
            let score = 0;
            
            // Same category
            if (video.category === currentVideo.category) {
                score += 20;
            }
            
            // Shared tags
            const sharedTags = video.tags.filter(tag => currentVideo.tags.includes(tag));
            score += sharedTags.length * 10;
            
            // Similar duration (±30%)
            const durationDiff = Math.abs(video.duration - currentVideo.duration);
            if (durationDiff < currentVideo.duration * 0.3) {
                score += 5;
            }
            
            // Popularity boost
            score += Math.log(video.views + 1);
            
            // Rating boost
            score += video.rating * 2;
            
            return { video, score };
        });
    
    // Sort by score
    scoredVideos.sort((a, b) => b.score - a.score);
    
    // Get top videos
    return scoredVideos.slice(0, limit).map(item => item.video);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDatabase,
        getAllVideos,
        getVideoById,
        getVideosByCategory,
        searchVideos,
        getTrendingVideos,
        getNewVideos,
        addVideo,
        updateVideo,
        deleteVideo,
        incrementViews,
        likeVideo,
        dislikeVideo,
        getAllCategories,
        getCategoryById,
        getRecommendations,
        getConsistentRecommendations,
        getUserPreferences,
        addUserPreference,
        getViewHistory,
        addToHistory,
        getFavorites,
        addToFavorites,
        removeFromFavorites,
        isFavorited,
        getVideoSuggestions
    };
}