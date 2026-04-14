
import { Nav } from './components/nav.js';
import { MobileBottomNav } from './components/mobileBottomNav.js';

let routes = [];           // Stores navigation routes from JSON
let cachedItems = [];      // Caches items to avoid repeated fetches

// Load routes from webpages.json
async function loadRoutes() {
  const res = await fetch('./data/webpages.json');
  routes = await res.json();
}

// Fetch items.json once and cache for reuse
async function fetchItems() {
  if (cachedItems.length > 0) return cachedItems;

    const res = await fetch('./data/items.json');
    cachedItems = await res.json();
    return cachedItems;

}

// Render static shell: header + content placeholder + mobile nav
function renderShell() {
  return `
    <header>
      ${Nav(routes)}
    </header>
    <div id="page-view"></div>
    ${MobileBottomNav()}
  `;
}

// Load page component based on current URL hash
async function loadPageContent() {
  const hash = window.location.hash.slice(1) || '/';
  const route = routes.find(r => r.lnk === hash) || routes[0];
  const componentName = route.component;
  const pageView = document.getElementById('page-view');

    // Dynamic import of page module
    const module = await import(`./pages/${componentName}.js`);
    const renderFn = module[componentName];  // e.g., homepage(items)
    const items = await fetchItems();
    const content = renderFn(items);
    pageView.innerHTML = content;
 

  highlightActiveNav(hash);
  
  // Attach event listeners after page loads
  const { initSearchListeners } = await import('./eventListeners/search.js');
  initSearchListeners();
  const { initFilterListeners } = await import('./eventListeners/filters.js');
  initFilterListeners();
}

// Highlight current page in desktop and mobile navigation
function highlightActiveNav(hash) {
  document.querySelectorAll('.nav-center a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${hash}`) link.classList.add('active');
  });
  document.querySelectorAll('.bottom-nav a').forEach(link => {
    link.classList.remove('mobile-active');
    if (link.getAttribute('href') === `#${hash}`) link.classList.add('mobile-active');
  });
}

// Main render: shell first, then page content
async function render() {
  document.getElementById('app').innerHTML = renderShell();
  await loadPageContent();
}

// Initialize app: load routes, render, listen for hash changes
(async () => {
  await loadRoutes();
  await render();
  window.addEventListener('hashchange', render);
})();