document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const menuItems = document.querySelector('.menu-items');

    menuIcon.addEventListener('click', function() {
        const isExpanded = menuItems.classList.contains('active');
        menuItems.classList.toggle('active');
        menuIcon.classList.toggle('active');
        menuIcon.setAttribute('aria-expanded', !isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuIcon.contains(event.target) && !menuItems.contains(event.target)) {
            menuItems.classList.remove('active');
            menuIcon.classList.remove('active');
            menuIcon.setAttribute('aria-expanded', 'false');
        }
    });
});
