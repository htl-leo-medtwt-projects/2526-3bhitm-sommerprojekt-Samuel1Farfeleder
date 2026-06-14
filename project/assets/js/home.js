const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const searchBtn = document.querySelector("#searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    window.location.href = "watches.html";
  });
}

document.querySelectorAll(".hero-actions a[href^='#']").forEach((button) => {
  button.addEventListener("click", (event) => {
    const targetSelector = button.getAttribute("href");
    const targetSection = targetSelector ? document.querySelector(targetSelector) : null;

    if (!targetSection) {
      return;
    }

    event.preventDefault();
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".heart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
  });
});

// Force navigation for Uhrfinder link in case a click is intercepted
document.querySelectorAll('.main-nav a[href$="announcements.html"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) window.location.href = href;
  });
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function attachHeartHandlers() {
  document.querySelectorAll('.watches-grid .heart-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.classList.toggle('is-active');
    });
  });
}

async function loadFeaturedWatches() {
  try {
    function getApiBase() {
      const path = window.location.pathname;
      const idx = path.indexOf('/project');
      if (idx !== -1) return path.substring(0, idx + '/project'.length);
      return '';
    }

    const apiBase = getApiBase();
    const apiUrl = apiBase
      ? apiBase + '/api/watches.php?random=1&limit=3'
      : new URL('../api/watches.php', document.location).toString() + '?random=1&limit=3';
    console.debug('Loading featured watches from', apiUrl, 'apiBase=', apiBase);
    const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
    console.debug('watches.php status', res.status);
    const data = await res.json();
    console.debug('watches.php response', data);
    const grid = document.querySelector('#watchesGrid') || document.querySelector('.watches-grid') || document.querySelector('.watch-grid');
    if (!grid) return;

    if (!data.ok || !Array.isArray(data.watches) || data.watches.length === 0) {
      grid.innerHTML = '<div class="empty-message">Keine Uhren gefunden.</div>';
      return;
    }

    // Render same markup as /pages/watches.html -> assets/js/watches.js
    grid.innerHTML = data.watches.map((watch) => {
      const params = new URLSearchParams({
        id: String(watch.id),
        brand: watch.brand,
        model: watch.model,
        year: String(watch.year || ''),
        rating: String(watch.rating || ''),
      }).toString();

      return `
        <article class="watch-card">
          <a class="watch-link" href="watch-detail.html?${params}" aria-label="${escapeHtml(watch.brand)} ${escapeHtml(watch.model)} ansehen">
            <div class="watch-media">
              ${watch.pic ? `<img class="watch-image" src="${escapeHtml(watch.pic)}" alt="${escapeHtml(watch.brand)} ${escapeHtml(watch.model)}" loading="lazy">` : ''}
            </div>
            <div class="watch-info">
              <small>${escapeHtml(watch.brand)}</small>
              <h3>${escapeHtml(watch.model)}</h3>
              <div class="watch-meta">
                <span>${escapeHtml(String(watch.year || ''))}</span>
                <span class="stars">${'★'.repeat(Math.max(0, Math.min(5, watch.rating || 0)))}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join('');

    // Ensure images hide on error like watches.js
    document.querySelectorAll('.watch-image').forEach((image) => {
      image.addEventListener('error', () => { image.style.display = 'none'; });
    });
  } catch (err) {
    console.error('Failed to load featured watches', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFeaturedWatches);
} else {
  loadFeaturedWatches();
}
