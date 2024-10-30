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
    modal?.classList.toggle('active');

    // When opening the modal, add click listener with a slight delay
    if (modal?.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('click', handleModalOutsideClick);
        }, 100);
    } else {
        document.removeEventListener('click', handleModalOutsideClick);
    }
}

// New function to handle clicks outside the modal
function handleModalOutsideClick(event) {
    const modal = document.getElementById('platformsList');
    const modalContent = modal?.querySelector('.platforms-modal-content');
    const moreButton = document.querySelector('.more-platforms');
    
    // Check if click is outside modal content and not on menu items, header, or the "More Platforms" button
    if (modal?.classList.contains('active') && 
        !modalContent?.contains(event.target) && 
        !event.target.closest('.menu-items') && 
        !event.target.closest('.header-title') &&
        !moreButton?.contains(event.target)) {
        
        modal.classList.remove('active');
        document.removeEventListener('click', handleModalOutsideClick);
    }
}
