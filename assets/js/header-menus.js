// Header menu handlers: toggle user dropdown and nav (hamburger) menu
document.addEventListener('click', function(event) {
    const userDropdownBtnEl = document.getElementById('userDropdownBtn');
    const userDropdownMenuEl = document.getElementById('userDropdownMenu');
    const navMenuBtnEl = document.getElementById('navMenuBtn');
    const navMenuEl = document.getElementById('navMenu');

    // user menu
    if (userDropdownBtnEl && userDropdownBtnEl.contains(event.target)) {
        if (userDropdownMenuEl) userDropdownMenuEl.classList.toggle('hidden');
    } else if (userDropdownMenuEl && !userDropdownMenuEl.contains(event.target)) {
        userDropdownMenuEl.classList.add('hidden');
    }

    // nav menu
    if (navMenuBtnEl && navMenuBtnEl.contains(event.target)) {
        if (navMenuEl) navMenuEl.classList.toggle('hidden');
    } else if (navMenuEl && !navMenuEl.contains(event.target)) {
        navMenuEl.classList.add('hidden');
    }
});

// Optional: Attach basic handlers for profile, settings, logout if present
document.addEventListener('DOMContentLoaded', function() {
    const profileLinkEl = document.getElementById('profileLink');
    const settingsLinkEl = document.getElementById('settingsLink');
    const logoutBtnEl = document.getElementById('logoutBtn');
    if (profileLinkEl) profileLinkEl.addEventListener('click', function(e) { e.preventDefault(); alert('Profile page coming soon!'); });
    if (settingsLinkEl) settingsLinkEl.addEventListener('click', function(e) { e.preventDefault(); alert('Settings page coming soon!'); });
    if (logoutBtnEl) logoutBtnEl.addEventListener('click', function(e) { e.preventDefault(); try { localStorage.removeItem('currentUser'); localStorage.removeItem('userRole'); } catch(e){} window.location.href = 'login.html'; });
});
