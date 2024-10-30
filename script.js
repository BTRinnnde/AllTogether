// Detect environment once at start
const isOffline = window.location.protocol === 'file:';

function navigateToPage(page) {
    // Handle external links and offline mode
    if (page.startsWith('http') || isOffline) {
        window.location.href = page;
        return;
    }

    const fetchPage = page.endsWith('.html') ? page : `${page}.html`;
    
    fetch(fetchPage)
        .then(response => {
            if (!response.ok) throw new Error('Page not found');
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Update content more efficiently
            updatePageContent(newDoc);
            document.title = newDoc.title;
            
            // Update URL
            const baseDir = '/Version5/';
            const newPath = page === 'index.html' ? baseDir : `${baseDir}${page.replace('.html', '')}`;
            history.pushState({}, '', newPath);

            initializeEventListeners();
        })
        .catch(error => {
            console.error('Navigation error:', error);
            window.location.href = page;
        });
}

function updatePageContent(newDoc) {
    // Update main content
    const oldContent = document.querySelector('.page-content') || document.querySelector('main');
    const newContent = newDoc.querySelector('.page-content') || newDoc.querySelector('main');
    if (oldContent && newContent) oldContent.replaceWith(newContent);

    // Update header
    const headerContainer = document.querySelector('.header-container');
    const newHeader = newDoc.querySelector('.header-container');
    if (headerContainer && newHeader) headerContainer.innerHTML = newHeader.innerHTML;
}

function initializeEventListeners() {
    // Burger menu
    const menuIcon = document.querySelector('.menu-icon');
    const menuItems = document.querySelector('.menu-items');

    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            menuIcon.classList.toggle('active');
            menuItems?.classList.toggle('active');
        });
    }

    // Navigation links
    document.querySelectorAll('.menu-items a, .header-title').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.getAttribute('href');
            
            // Close burger menu
            menuIcon?.classList.remove('active');
            menuItems?.classList.remove('active');
            
            navigateToPage(page);
        });
    });
}

// Modal handling
function togglePlatformsList(event) {
    event.preventDefault();
    const modal = document.getElementById('platformsList');
    const isOpening = !modal?.classList.contains('active');
    
    modal?.classList.toggle('active');
    
    if (isOpening) {
        setTimeout(() => document.addEventListener('click', handleModalOutsideClick), 100);
    } else {
        document.removeEventListener('click', handleModalOutsideClick);
    }
}

function handleModalOutsideClick(event) {
    const modal = document.getElementById('platformsList');
    const modalContent = modal?.querySelector('.platforms-modal-content');
    const moreButton = document.querySelector('.more-platforms');
    
    if (modal?.classList.contains('active') && 
        !modalContent?.contains(event.target) && 
        !moreButton?.contains(event.target)) {
        
        modal.classList.remove('active');
        document.removeEventListener('click', handleModalOutsideClick);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeEventListeners);

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    let page = window.location.pathname.replace(baseDir, '') || 'index.html';
    navigateToPage(page + (page.endsWith('.html') ? '' : '.html'));
});

