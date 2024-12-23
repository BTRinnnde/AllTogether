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
            
            // Update the URL first
            const newPath = page.replace('.html', '');
            history.pushState({}, '', newPath);

            // Update the page title
            document.title = newDoc.title;

            // Update the main content
            const oldContent = document.querySelector('.page-content') || document.querySelector('main');
            const newContent = newDoc.querySelector('.page-content') || newDoc.querySelector('main');
            
            if (oldContent && newContent) {
                oldContent.replaceWith(newContent);
            } else if (newContent) {
                document.body.appendChild(newContent);
            }

            // Handle header title
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

            // Handle footer
            const oldFooter = document.querySelector('.site-footer');
            const newFooter = newDoc.querySelector('.site-footer');
            
            // Remove old footer if it exists
            if (oldFooter) {
                oldFooter.remove();
            }
            
            // Add new footer if it exists in the new page
            if (newFooter) {
                document.body.insertBefore(newFooter.cloneNode(true), document.querySelector('script'));
            }

            // Handle both modals
            ['legal', 'social'].forEach(modalType => {
                const oldModal = document.getElementById(`${modalType}Modal`);
                const newModal = newDoc.getElementById(`${modalType}Modal`);
                
                if (oldModal) oldModal.remove();
                if (newModal) {
                    document.body.insertBefore(newModal.cloneNode(true), document.querySelector('script'));
                }
            });

            // Scroll to top AFTER content is loaded
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });
        })
        .catch(error => {
            console.error('Navigation error:', error);
            window.location.href = page;
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

function openLegalModal(type) {
    event.preventDefault();
    const modal = document.getElementById('legalModal');
    const title = document.getElementById('legalTitle');
    const content = document.getElementById('legalText');
    
    if (type === 'privacy') {
        title.textContent = 'Privacy Policy';
        content.innerHTML = `
            <p>We do not collect any type of data through this website. The only data collection happens through the streaming platforms you choose to use.</p>
            <p>By using our services, you agree to the privacy policies of the respective streaming platforms.</p>
        `;
    } else if (type === 'terms') {
        title.textContent = 'Terms of Service';
        content.innerHTML = `
            <p>By using our services, you agree to these terms of service.</p>
            <p>All Together does not support or tolerate fraudulent streaming activities, including the use of stream bots or any artificial means to inflate stream counts.</p>
            <p>All Together is committed to transparency and ethical practices. We donate 100% of streaming revenue to meaningful causes.</p>
            <p>The music and content provided through our services are subject to copyright and other intellectual property rights.</p>
        `;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add click event listener for outside clicks
    document.addEventListener('click', handleLegalModalOutsideClick);
}

function handleLegalModalOutsideClick(event) {
    const modal = document.getElementById('legalModal');
    const modalContent = modal?.querySelector('.legal-modal-content');
    
    if (modal?.classList.contains('active') && 
        modalContent && 
        !modalContent.contains(event.target) && 
        !event.target.closest('a[onclick*="openLegalModal"]')) {
        
        toggleLegalModal(event);
    }
}

function toggleLegalModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('legalModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('click', handleLegalModalOutsideClick);
}

// Update the escape key handler
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const legalModal = document.getElementById('legalModal');
        const socialModal = document.getElementById('socialModal');
        const moneyDetailsModal = document.getElementById('moneyDetailsModal');
        
        if (legalModal?.classList.contains('active')) {
            toggleLegalModal();
        }
        if (socialModal?.classList.contains('active')) {
            toggleSocialModal();
        }
        if (moneyDetailsModal?.classList.contains('active')) {
            toggleMoneyDetailsModal(e);
        }
    }
});

// Add these new functions
function openSocialModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('socialModal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.addEventListener('click', handleSocialModalOutsideClick);
    }, 100);
}

function toggleSocialModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('socialModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('click', handleSocialModalOutsideClick);
}

function handleSocialModalOutsideClick(event) {
    const modal = document.getElementById('socialModal');
    const modalContent = modal?.querySelector('.legal-modal-content');
    
    if (modal?.classList.contains('active') && 
        modalContent && 
        !modalContent.contains(event.target) && 
        !event.target.closest('a[onclick*="openSocialModal"]')) {
        
        toggleSocialModal(event);
    }
}

function toggleMoreInfoModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('moreInfoModal');
    if (!modal) return;
    
    modal.classList.toggle('active');
    document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
    
    if (modal.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('click', handleMoreInfoModalOutsideClick);
        }, 100);
    } else {
        document.removeEventListener('click', handleMoreInfoModalOutsideClick);
    }
}

function handleMoreInfoModalOutsideClick(event) {
    const modal = document.getElementById('moreInfoModal');
    const modalContent = modal?.querySelector('.more-info-modal-content');
    
    if (modal?.classList.contains('active') && 
        modalContent && 
        !modalContent.contains(event.target) && 
        !event.target.closest('.more-info-button')) {
        
        toggleMoreInfoModal(event);
    }
}

function toggleMoneyDetailsModal(event) {
    event.preventDefault();
    const modal = document.getElementById('moneyDetailsModal');
    if (!modal) return;
    
    modal.classList.toggle('active');
    document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
    
    if (modal.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('click', handleMoneyDetailsModalOutsideClick);
        }, 100);
    } else {
        document.removeEventListener('click', handleMoneyDetailsModalOutsideClick);
    }
}

function handleMoneyDetailsModalOutsideClick(event) {
    const modal = document.getElementById('moneyDetailsModal');
    const modalContent = modal?.querySelector('.more-info-modal-content');
    const statsTable = document.querySelector('.stats-table.clickable');
    
    if (modal?.classList.contains('active') && 
        modalContent && 
        !modalContent.contains(event.target) && 
        !statsTable.contains(event.target)) {
        
        toggleMoneyDetailsModal(event);
    }
}
