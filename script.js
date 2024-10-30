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
            
            // Update the page content
            document.querySelector('.page-content')?.remove();
            document.querySelector('main')?.remove();
            
            const newContent = newDoc.querySelector('.page-content') || newDoc.querySelector('main');
            if (newContent) {
                document.body.appendChild(newContent);
            }
            
            // Update the title
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

// Add this if you have the platforms modal functionality
function togglePlatformsList(event) {
    event.preventDefault();
    const modal = document.getElementById('platformsList');
    modal?.classList.toggle('active');
}
