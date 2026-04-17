/**
 * Common functions for Cohabitat.cc
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        const exported = factory();
        for (const key in exported) {
            root[key] = exported[key];
        }
    }
}(typeof self !== 'undefined' ? self : this, function () {
    // Mobile Menu Toggle
    function toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    // Load header and footer components
    async function loadComponent(url, placeholderId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = html;
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error loading component from ${url}:`, error);
            return false;
        }
    }

    // Navbar scroll effect
    const onScroll = () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('shadow-md');
                nav.classList.add('bg-secondary/95');
                nav.classList.remove('bg-secondary/80');
            } else {
                nav.classList.remove('shadow-md');
                nav.classList.remove('bg-secondary/95');
                nav.classList.add('bg-secondary/80');
            }
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', onScroll);
    }

    return {
        toggleMobileMenu,
        loadComponent,
        onScroll
    };
}));
