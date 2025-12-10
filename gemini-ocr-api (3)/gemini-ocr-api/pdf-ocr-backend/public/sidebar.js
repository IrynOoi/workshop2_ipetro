/**
 * iPETRO Sidebar Manager
 * Loads menu.html and manages sidebar interactions
 */

const response = await fetch('/menu.html');


(async function() {
    'use strict';

    // =====================================================
    // 1. LOAD MENU.HTML INTO PAGE
    // =====================================================
    async function loadSidebar() {
        try {
            // UPDATED: Use relative path './menu.html' instead of '/private/menu.html'
            // This works better if files are in the same directory
            const response = await fetch('./menu.html');
           
                throw new Error(`Failed to load menu: ${response.status} ${response.statusText}`); 
            if (!response.ok) {
            }
            
            const menuHTML = await response.text();
            
            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = menuHTML;
            
            // Extract sidebar and related elements
            const sidebar = temp.querySelector('#sidebar');
            const overlay = temp.querySelector('#mobile-overlay');
            const mobileBtn = temp.querySelector('#toggle-sidebar-btn');
            const desktopBtn = temp.querySelector('#desktop-collapse-btn');
            const scripts = temp.querySelector('script');
            
            // Insert into page
            if (sidebar) document.body.insertBefore(sidebar, document.body.firstChild);
            if (overlay) document.body.insertBefore(overlay, document.body.firstChild);
            if (mobileBtn) document.body.appendChild(mobileBtn);
            if (desktopBtn) document.body.appendChild(desktopBtn);
            
            // Manually execute script content found in menu.html (logout logic)
            if (scripts) {
                const newScript = document.createElement('script');
                newScript.textContent = scripts.textContent;
                document.body.appendChild(newScript);
            }
            
            return true;
        } catch (error) {
            console.error('Sidebar load error:', error);
            // Visual feedback if menu fails
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = "position:fixed; top:0; left:0; background:red; color:white; padding:10px; z-index:9999;";
            errorDiv.textContent = "Error: Could not load sidebar. Check Console (F12).";
            document.body.appendChild(errorDiv);
            return false;
        }
    }

    // =====================================================
    // 2. INITIALIZE SIDEBAR AFTER LOADING
    // =====================================================
    async function initSidebar() {
        const loaded = await loadSidebar();
        if (!loaded) return;

        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.getElementById('toggle-sidebar-btn');
        const desktopToggle = document.getElementById('desktop-collapse-btn');
        const overlay = document.getElementById('mobile-overlay');

        if (!sidebar) return;

        // Detect current page
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'test';
        
        // Set active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });

        // Toggle Logic
        function toggleMobile() {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }
        
        function toggleCollapse() {
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }

        if (mobileToggle) mobileToggle.addEventListener('click', toggleMobile);
        if (overlay) overlay.addEventListener('click', toggleMobile);
        if (desktopToggle) desktopToggle.addEventListener('click', toggleCollapse);

        // Restore collapsed state
        if (window.innerWidth >= 1024 && localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        }

        // Handle Resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.add('hidden');
            } else {
                sidebar.classList.remove('collapsed');
                document.body.classList.remove('sidebar-collapsed');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        initSidebar();
    }

})();