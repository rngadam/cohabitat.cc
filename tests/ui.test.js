const test = require('node:test');
const assert = require('node:assert');

/* global toggleMobileMenu, loadComponent, onScroll */

// Mock DOM environment
global.window = {
    addEventListener: () => {},
    scrollY: 0
};
global.document = {
    getElementById: (_id) => ({
        classList: {
            toggle: (_cls) => {},
            add: (_cls) => {},
            remove: (_cls) => {},
            contains: (_cls) => false
        },
        style: { opacity: 0, setProperty: () => {} },
        innerHTML: '',
        addEventListener: () => {}
    }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};
global.lucide = {
    createIcons: () => {}
};
global.fetch = () => Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<div>mock</div>')
});

// Load common.js and map its exports to global for easy testing
const common = require('../common.js');
Object.assign(global, common);

test('common.js - toggleMobileMenu', () => {
    toggleMobileMenu();
    assert.strictEqual(typeof toggleMobileMenu, 'function');
});

test('common.js - loadComponent', async () => {
    const success = await loadComponent('test.html', 'placeholder');
    assert.strictEqual(success, true);
});

test('common.js - onScroll', () => {
    global.window.scrollY = 100;
    onScroll();

    global.window.scrollY = 0;
    onScroll();
});

test('common.js - loadComponent error handling', async () => {
    // Mock fetch throw
    const originalFetch = global.fetch;
    global.fetch = () => Promise.reject(new Error('Network failure'));
    const success = await loadComponent('fail.html', 'placeholder');
    assert.strictEqual(success, false);
    global.fetch = originalFetch;
});

test('common.js - loadComponent 404 handling', async () => {
    const originalFetch = global.fetch;
    global.fetch = () => Promise.resolve({ ok: false, status: 404 });
    const success = await loadComponent('fail.html', 'placeholder');
    assert.strictEqual(success, false);
    global.fetch = originalFetch;
});
