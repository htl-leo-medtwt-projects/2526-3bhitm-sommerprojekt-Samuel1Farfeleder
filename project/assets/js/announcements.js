async function fetchAnnouncements() {
  try {
    const res = await fetch('../api/announcements.php', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return Array.isArray(data.announcements) ? data.announcements : [];
  } catch (err) {
    console.error('Failed to load announcements', err);
    return [];
  }
}

async function fetchWatches() {
  try {
    const res = await fetch('../api/watches.php', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Failed to load watches');
    const data = await res.json();
    return Array.isArray(data.watches) ? data.watches : [];
  } catch (err) {
    console.error('Failed to load watches', err);
    return [];
  }
}

function fmtTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

function renderAnnouncements(list) {
  const el = document.getElementById('announcementsList');
  if (!el) return;
  if (!list || list.length === 0) {
    el.innerHTML = '<div class="empty-message">Noch keine Ankündigungen.</div>';
    return;
  }
  el.innerHTML = list.map(a => {
    const watchHtml = (a.watch_id && window.__watchesMap && window.__watchesMap[a.watch_id])
      ? `<a class="announce-watch" href="watch-detail.html?id=${encodeURIComponent(a.watch_id)}">${escapeHtml(window.__watchesMap[a.watch_id].brand)} ${escapeHtml(window.__watchesMap[a.watch_id].model)}</a>`
      : '';
    return `
      <article class="announce-item">
        <div class="announce-head"><strong>${escapeHtml(a.author)}</strong>${a.title ? ` &middot; <span class="announce-title">${escapeHtml(a.title)}</span>` : ''}${watchHtml ? ' &middot; ' + watchHtml : ''}<span class="announce-ts">${fmtTime(a.ts)}</span></div>
        <div class="announce-body">${escapeHtml(a.message)}</div>
      </article>
    `;
  }).join('\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function submitAnnouncement(payload) {
  try {
    const res = await fetch('../api/announcements.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error('Post failed', err);
    return { ok: false };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // load watches first to populate select and map
  const watches = await fetchWatches();
  window.__watchesMap = {};
  const select = document.createElement('select');
  select.id = 'watchSelect';
  select.innerHTML = '<option value="">Keine spezifische Uhr</option>' + watches.map(w => `<option value="${w.id}">${w.brand} ${w.model} (${w.year})</option>`).join('');
  const form = document.getElementById('announceForm');
  form.insertBefore(select, document.getElementById('title'));
  watches.forEach(w => { window.__watchesMap[w.id] = w; });

  const list = await fetchAnnouncements();
  renderAnnouncements(list);

  const form = document.getElementById('announceForm');
  const status = document.getElementById('status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sende...';
    const author = document.getElementById('author').value.trim();
    const title = document.getElementById('title').value.trim();
    const message = document.getElementById('message').value.trim();
    const watchIdVal = document.getElementById('watchSelect')?.value || '';
    const watch_id = watchIdVal === '' ? null : Number(watchIdVal);
    if (!message) {
      status.textContent = 'Bitte eine Nachricht eingeben.';
      return;
    }
    const res = await submitAnnouncement({ author, title, message, watch_id });
    if (res && res.ok) {
      status.textContent = 'Gesendet.';
      // prepend and re-render
      const current = await fetchAnnouncements();
      renderAnnouncements(current);
      form.reset();
      setTimeout(() => status.textContent = '', 2000);
    } else {
      status.textContent = (res && res.error) ? res.error : 'Fehler beim Senden.';
    }
  });
});
