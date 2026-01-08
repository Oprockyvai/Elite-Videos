/**
 * Utility Functions for EliteVideos
 * Common helper functions used across the application
 */

// Toast Notification System
class Toast {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const icon = icons[type] || icons.info;
        
        toast.innerHTML = `
            <i class="${icon} toast-icon"></i>
            <div class="toast-content">
                <h4>${this.capitalize(type)}</h4>
                <p>${message}</p>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize toast system
const toast = new Toast();

// Export showToast function
function showToast(message, type = 'info', duration = 3000) {
    return toast.show(message, type, duration);
}

// Format number with commas
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    
    // Convert to number if string
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(number)) return '0';
    
    // Format with commas
    return number.toLocaleString('en-US', {
        maximumFractionDigits: 0
    });
}

// Format duration (seconds to MM:SS or HH:MM:SS)
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const secs = Math.floor(seconds);
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Format date (relative or absolute)
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function
function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
        result[key] = decodeURIComponent(value);
    }
    
    return result;
}

// Set URL parameter
function setUrlParam(key, value) {
    const url = new URL(window.location);
    
    if (value === null || value === undefined) {
        url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, encodeURIComponent(value));
    }
    
    window.history.replaceState({}, '', url);
}

// Remove URL parameter
function removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

// Get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    
    return null;
}

// Set cookie
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Delete cookie
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Check if user is on mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if user is on touch device
function isTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sanitize HTML
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            return success;
        }
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
}

// Load script dynamically
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    if (callback) {
        script.onload = callback;
    }
    
    document.head.appendChild(script);
    return script;
}

// Load CSS dynamically
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// Detect dark mode preference
function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Add event listener with cleanup
function addEventWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    return () => {
        element.removeEventListener(event, handler, options);
    };
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate URL
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Truncate text with ellipsis
function truncateText(text, maxLength, ellipsis = '...') {
    if (!text || text.length <= maxLength) return text;
    
    return text.substr(0, maxLength - ellipsis.length) + ellipsis;
}

// Create element with attributes
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        } else if (Array.isArray(child)) {
            child.forEach(c => element.appendChild(c));
        }
    });
    
    return element;
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Random number in range
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

// Group array by property
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const val = item[key];
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups;
    }, {});
}

// Deep clone object
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    
    const cloned = {};
    
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    
    return cloned;
}

// Merge objects
function mergeObjects(target, source) {
    const merged = { ...target };
    
    Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            merged[key] = mergeObjects(merged[key] || {}, source[key]);
        } else {
            merged[key] = source[key];
        }
    });
    
    return merged;
}

// Storage helper with fallback
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('LocalStorage set failed:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn('LocalStorage get failed:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('LocalStorage remove failed:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('LocalStorage clear failed:', error);
            return false;
        }
    }
};

// Session storage helper
const session = {
    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('SessionStorage set failed:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const value = sessionStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn('SessionStorage get failed:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('SessionStorage remove failed:', error);
            return false;
        }
    }
};

// DOM ready helper
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0) {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Toggle class with animation
function toggleClassWithAnimation(element, className, duration = 300) {
    if (!element) return;
    
    if (element.classList.contains(className)) {
        element.classList.remove(className);
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    } else {
        element.style.display = '';
        setTimeout(() => {
            element.classList.add(className);
        }, 10);
    }
}

// Get element position
function getElementPosition(element) {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        width: rect.width,
        height: rect.height
    };
}

// Check if element is in viewport
function isInViewport(element, offset = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Parse query string
function parseQueryString(query) {
    const params = {};
    
    query.replace(/^\?/, '').split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    
    return params;
}

// String to query string
function toQueryString(params) {
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
}

// Export all functions
window.utils = {
    showToast,
    formatNumber,
    formatDuration,
    formatDate,
    formatFileSize,
    debounce,
    throttle,
    getUrlParams,
    setUrlParam,
    removeUrlParam,
    getCookie,
    setCookie,
    deleteCookie,
    isMobile,
    isTouchDevice,
    generateId,
    sanitizeHTML,
    copyToClipboard,
    loadScript,
    loadCSS,
    isDarkMode,
    addEventWithCleanup,
    validateEmail,
    validateURL,
    truncateText,
    createElement,
    delay,
    randomInRange,
    shuffleArray,
    groupBy,
    deepClone,
    mergeObjects,
    storage,
    session,
    domReady,
    smoothScrollTo,
    toggleClassWithAnimation,
    getElementPosition,
    isInViewport,
    lazyLoadImages,
    parseQueryString,
    toQueryString
};

// Auto-initialize lazy loading
domReady(() => {
    lazyLoadImages();
    
    // Add CSS for toast notifications
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .toast {
                background: var(--bg-card);
                border-left: 4px solid var(--primary);
                border-radius: var(--border-radius);
                padding: 15px 20px;
                min-width: 300px;
                max-width: 400px;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: 0;
                transform: translateX(100%);
                transition: opacity 0.3s, transform 0.3s;
            }
            
            .toast.success {
                border-left-color: var(--success);
            }
            
            .toast.error {
                border-left-color: var(--danger);
            }
            
            .toast.warning {
                border-left-color: var(--warning);
            }
            
            .toast.info {
                border-left-color: var(--accent);
            }
            
            .toast-icon {
                font-size: 20px;
            }
            
            .toast.success .toast-icon {
                color: var(--success);
            }
            
            .toast.error .toast-icon {
                color: var(--danger);
            }
            
            .toast.warning .toast-icon {
                color: var(--warning);
            }
            
            .toast.info .toast-icon {
                color: var(--accent);
            }
            
            .toast-content {
                flex: 1;
            }
            
            .toast-content h4 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 2px;
                color: var(--text