document.addEventListener('DOMContentLoaded', function() {
    // Burger menu functionality
    const menuIcon = document.querySelector('.menu-icon');
    const menuItems = document.querySelector('.menu-items');

    menuIcon?.addEventListener('click', function() {
        this.classList.toggle('active');
        menuItems.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.burger-menu')) {
            menuIcon?.classList.remove('active');
            menuItems?.classList.remove('active');
        }
    });

    // Add click handlers for navigation links
    document.querySelectorAll('.menu-items a, .header-title, .artist-name').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('href');
            
            // Close the burger menu when a link is clicked
            menuIcon?.classList.remove('active');
            menuItems?.classList.remove('active');
            
            navigateToPage(page);
        });
    });
});

function navigateToPage(page) {
    // Don't fetch if it's an external link
    if (page.startsWith('http')) {
        window.location.href = page;
        return;
    }

    fetch(page)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Update the main content
            const oldContent = document.querySelector('.page-content') || document.querySelector('main');
            const newContent = newDoc.querySelector('.page-content') || newDoc.querySelector('main');
            
            if (oldContent && newContent) {
                oldContent.replaceWith(newContent);
            } else if (newContent) {
                document.body.appendChild(newContent);
            }

            // Ensure header title exists
            const headerTitle = document.querySelector('.header-title');
            if (!headerTitle) {
                const newHeaderTitle = newDoc.querySelector('.header-title');
                if (newHeaderTitle) {
                    const headerContainer = document.querySelector('.header-container');
                    if (headerContainer) {
                        headerContainer.appendChild(newHeaderTitle.cloneNode(true));
                    }
                }
            }

            // Scroll to top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Update the page title
            document.title = newDoc.title;
            
            // Update the URL without the .html extension
            const newPath = page.replace('.html', '');
            history.pushState({}, '', newPath);
        })
        .catch(error => {
            console.error('Navigation error:', error);
            window.location.href = page; // Fallback to traditional navigation
        });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    const page = window.location.pathname.slice(1) || 'index.html';
    navigateToPage(page + (page.endsWith('.html') ? '' : '.html'));
});

// Update the platforms modal functionality
function togglePlatformsList(event) {
    event.preventDefault();
    const modal = document.getElementById('platformsList');
    const body = document.body;
    const streamingButtons = document.querySelector('.streaming-buttons');
    
    modal?.classList.toggle('active');
    
    // Toggle body scroll lock and button interactions
    if (modal?.classList.contains('active')) {
        body.style.overflow = 'hidden'; // Prevent background scrolling
        streamingButtons.style.pointerEvents = 'none'; // Disable streaming buttons
        setTimeout(() => {
            document.addEventListener('click', handleModalOutsideClick);
        }, 100);
    } else {
        body.style.overflow = ''; // Restore scrolling
        streamingButtons.style.pointerEvents = ''; // Re-enable streaming buttons
        document.removeEventListener('click', handleModalOutsideClick);
    }
}

// Update handleModalOutsideClick to also restore pointer events
function handleModalOutsideClick(event) {
    const modal = document.getElementById('platformsList');
    const modalContent = modal?.querySelector('.platforms-modal-content');
    const moreButton = document.querySelector('.more-platforms');
    const streamingButtons = document.querySelector('.streaming-buttons');
    
    if (modal?.classList.contains('active') && 
        !modalContent?.contains(event.target) && 
        !event.target.closest('.menu-items') && 
        !event.target.closest('.header-title') &&
        !moreButton?.contains(event.target)) {
        
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        streamingButtons.style.pointerEvents = ''; // Re-enable streaming buttons
        document.removeEventListener('click', handleModalOutsideClick);
    }
}
