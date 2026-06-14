/* Uhrfinder Feed – Social Feed für Uhren-Beiträge mit Kommentaren */
(function () {
  'use strict';

  function getApiBase() {
    var path = window.location.pathname;
    var idx = path.indexOf('/project');
    if (idx !== -1) return path.substring(0, idx + '/project'.length);
    return '/project';
  }

  var ENTITY_MAP = {};
  ENTITY_MAP['&'] = String.fromCharCode(38,97,109,112,59);
  ENTITY_MAP['<'] = String.fromCharCode(38,108,116,59);
  ENTITY_MAP['>'] = String.fromCharCode(38,103,116,59);
  ENTITY_MAP['"'] = String.fromCharCode(38,113,117,111,116,59);
  ENTITY_MAP["'"] = String.fromCharCode(38,35,51,57,59);

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return ENTITY_MAP[m];
    });
  }

  function timeAgo(ts) {
    var diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return 'Gerade eben';
    if (diff < 3600) return 'Vor ' + Math.floor(diff / 60) + ' Min.';
    if (diff < 86400) return 'Vor ' + Math.floor(diff / 3600) + ' Std.';
    if (diff < 604800) return 'Vor ' + Math.floor(diff / 86400) + ' Tagen';
    return new Date(ts * 1000).toLocaleDateString('de-DE');
  }

  function getInitials(name) {
    return name.charAt(0).toUpperCase();
  }

  var watchesCache = [];
  var selectedWatch = null;
  var openReplyForm = null;

  var form = document.getElementById('announceForm');
  var authorInput = document.getElementById('author');
  var titleInput = document.getElementById('title');
  var messageInput = document.getElementById('message');
  var watchSelect = document.getElementById('watchSelect');
  var preview = document.getElementById('selectedWatchPreview');
  var previewImg = document.getElementById('selectedWatchImg');
  var previewBrand = document.getElementById('swpBrand');
  var previewModel = document.getElementById('swpModel');
  var clearBtn = document.getElementById('clearWatchBtn');
  var statusDiv = document.getElementById('status');
  var feedContainer = document.getElementById('announcementsList');

  var currentUser = null;
  var isAdmin = false;

  async function checkAuth() {
    try {
      var apiBase = getApiBase();
      var res = await fetch(apiBase + '/api/auth.php', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      var data = await res.json();
      if (data.authenticated && data.user) {
        currentUser = data.user;
        isAdmin = (data.user.username || '').toLowerCase() === 'admin';
      } else {
        currentUser = null;
        isAdmin = false;
      }
    } catch (err) {
      currentUser = null;
      isAdmin = false;
    }
    updatePostFormVisibility();
  }

  function updatePostFormVisibility() {
    var formCard = document.querySelector('.post-form-card');
    if (!formCard) return;
    if (isAdmin) {
      formCard.style.display = 'block';
    } else {
      formCard.style.display = 'none';
    }
  }

  async function loadWatches() {
    try {
      var apiBase = getApiBase();
      var res = await fetch(apiBase + '/api/watches.php', { headers: { Accept: 'application/json' } });
      var data = await res.json();
      if (!data.ok || !Array.isArray(data.watches)) { return; }
      watchesCache = data.watches;
      populateSelect(watchesCache);
      if (window.watchesData && Array.isArray(window.watchesData) && window.watchesData.length > watchesCache.length) {
        watchesCache = window.watchesData;
        populateSelect(watchesCache);
      }
    } catch (err) {
      if (window.watchesData && Array.isArray(window.watchesData)) {
        watchesCache = window.watchesData;
        populateSelect(watchesCache);
      }
    }
  }

  function populateSelect(watches) {
    watchSelect.innerHTML = '<option value="">— Bitte wähle eine Uhr —</option>';
    var sorted = watches.slice().sort(function (a, b) {
      var cmp = a.brand.localeCompare(b.brand);
      if (cmp !== 0) return cmp;
      return a.model.localeCompare(b.model);
    });
    sorted.forEach(function (w) {
      var opt = document.createElement('option');
      opt.value = String(w.id);
      opt.textContent = w.brand + ' – ' + w.model + (w.year ? ' (' + w.year + ')' : '');
      opt.dataset.pic = w.pic || '';
      opt.dataset.brand = w.brand || '';
      opt.dataset.model = w.model || '';
      watchSelect.appendChild(opt);
    });
  }

  function handleWatchSelect() {
    var selectedId = watchSelect.value;
    if (!selectedId) { preview.style.display = 'none'; selectedWatch = null; return; }
    var opt = watchSelect.options[watchSelect.selectedIndex];
    selectedWatch = { id: parseInt(selectedId, 10), brand: opt.dataset.brand, model: opt.dataset.model, pic: opt.dataset.pic };
    if (selectedWatch.pic) { previewImg.src = selectedWatch.pic; previewImg.style.display = ''; }
    else { previewImg.src = ''; previewImg.style.display = 'none'; }
    previewBrand.textContent = selectedWatch.brand;
    previewModel.textContent = selectedWatch.model;
    preview.style.display = 'flex';
  }

  function clearWatch() {
    watchSelect.value = '';
    preview.style.display = 'none';
    selectedWatch = null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    var author = authorInput.value.trim();
    var title = titleInput.value.trim();
    var message = messageInput.value.trim();
    if (!author) { setStatus('Bitte gib deinen Namen ein.', 'error'); return; }
    if (!message) { setStatus('Bitte schreibe eine Nachricht.', 'error'); return; }
    try {
      var apiBase = getApiBase();
      var res = await fetch(apiBase + '/api/announcements.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author, title: title || '', message: message, watch_id: selectedWatch ? selectedWatch.id : null })
      });
      var data = await res.json();
      if (!data.ok) { setStatus(data.error || 'Fehler.', 'error'); return; }
      form.reset(); clearWatch();
      setStatus('Beitrag erfolgreich geteilt!', 'success');
      setTimeout(function () { setStatus('', ''); }, 3000);
      loadFeed();
    } catch (err) { setStatus('Netzwerkfehler.', 'error'); }
  }

  function setStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = 'form-status' + (type ? ' ' + type : '');
  }

  async function handleReplySubmit(postId) {
    var wrapper = document.querySelector('.reply-form-wrapper[data-post-id="' + postId + '"]');
    if (!wrapper) return;
    var authorInput = wrapper.querySelector('.reply-author-input');
    var msgInput = wrapper.querySelector('.reply-message-input');
    var statusEl = wrapper.querySelector('.reply-status');
    var author = authorInput.value.trim();
    var message = msgInput.value.trim();
    if (!author) { statusEl.textContent = 'Name eingeben.'; statusEl.style.color = '#eb5757'; return; }
    if (!message) { statusEl.textContent = 'Nachricht eingeben.'; statusEl.style.color = '#eb5757'; return; }
    try {
      var apiBase = getApiBase();
      var res = await fetch(apiBase + '/api/announcements.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author, message: message, parent_id: postId })
      });
      var data = await res.json();
      if (!data.ok) { statusEl.textContent = data.error || 'Fehler.'; statusEl.style.color = '#eb5757'; return; }
      closeReplyForm(postId);
      loadFeed();
    } catch (err) { statusEl.textContent = 'Netzwerkfehler.'; statusEl.style.color = '#eb5757'; }
  }

  function toggleReplyForm(postId) {
    if (openReplyForm === postId) { closeReplyForm(postId); return; }
    if (openReplyForm !== null) { closeReplyForm(openReplyForm); }
    openReplyForm = postId;
    var wrapper = document.querySelector('.reply-form-wrapper[data-post-id="' + postId + '"]');
    if (wrapper) { wrapper.style.display = 'block'; wrapper.querySelector('.reply-author-input').focus(); }
  }

  function closeReplyForm(postId) {
    if (openReplyForm === postId) openReplyForm = null;
    var wrapper = document.querySelector('.reply-form-wrapper[data-post-id="' + postId + '"]');
    if (wrapper) {
      wrapper.style.display = 'none';
      wrapper.querySelector('.reply-author-input').value = '';
      wrapper.querySelector('.reply-message-input').value = '';
      wrapper.querySelector('.reply-status').textContent = '';
    }
  }

  async function loadFeed() {
    try {
      var apiBase = getApiBase();
      var res = await fetch(apiBase + '/api/announcements.php', { headers: { Accept: 'application/json' } });
      var data = await res.json();
      if (!data.ok || !Array.isArray(data.announcements)) { feedContainer.innerHTML = '<div class="feed-empty">Fehler beim Laden.</div>'; return; }
      if (data.announcements.length === 0) { feedContainer.innerHTML = '<div class="feed-empty"><i class="fa-regular fa-face-smile"></i> Noch keine Beiträge. Sei der Erste!</div>'; return; }
      renderFeed(data.announcements);
    } catch (err) { feedContainer.innerHTML = '<div class="feed-empty">Fehler beim Laden.</div>'; }
  }

  function renderFeed(announcements) {
    feedContainer.innerHTML = announcements.map(function (post) {
      var watch = post.watch || null;
      var hasTitle = post.title && post.title.trim() !== '';
      var replies = post.replies || [];
      var replyCount = replies.length;
      var pid = post.id;
      return '<article class="feed-post" data-post-id="' + pid + '">' +
        '<div class="feed-post-header">' +
          '<div class="feed-post-avatar">' + escapeHtml(getInitials(post.author)) + '</div>' +
          '<span class="feed-post-author">' + escapeHtml(post.author) + '</span>' +
          '<span class="feed-post-time">' + timeAgo(post.ts) + '</span>' +
        '</div>' +
        (watch && watch.pic ? '<div class="feed-post-watch"><img src="' + escapeHtml(watch.pic) + '" alt="' + escapeHtml(watch.brand) + ' ' + escapeHtml(watch.model) + '" loading="lazy" onerror="this.style.display=\'none\'"></div>' : '') +
        '<div class="feed-post-body">' +
          (hasTitle ? '<h3 class="feed-post-title">' + escapeHtml(post.title) + '</h3>' : '') +
          '<p class="feed-post-message">' + escapeHtml(post.message) + '</p>' +
        '</div>' +
        (watch ? '<div class="feed-post-footer" onclick="window.location.href=\'watch-detail.html?id=' + watch.id + '&brand=' + encodeURIComponent(watch.brand) + '&model=' + encodeURIComponent(watch.model) + '\'"><i class="fa-regular fa-clock"></i><span class="feed-post-watch-ref">Bezieht sich auf <strong>' + escapeHtml(watch.brand) + ' ' + escapeHtml(watch.model) + '</strong></span></div>' : '') +
        '<div class="feed-post-actions">' +
          '<button class="comment-toggle-btn" data-toggle-reply="' + pid + '" aria-label="Kommentieren"><i class="fa-regular fa-comment"></i><span>Kommentieren</span></button>' +
          (replyCount > 0 ? '<span class="comment-count">' + replyCount + ' ' + (replyCount === 1 ? 'Kommentar' : 'Kommentare') + '</span>' : '') +
        '</div>' +
        (replyCount > 0 ? '<div class="feed-post-replies">' + replies.map(function (reply) {
          return '<div class="feed-reply"><div class="reply-avatar">' + escapeHtml(getInitials(reply.author)) + '</div><div class="reply-body"><span class="reply-author">' + escapeHtml(reply.author) + '</span><span class="reply-text">' + escapeHtml(reply.message) + '</span><div class="reply-time">' + timeAgo(reply.ts) + '</div></div></div>';
        }).join('') + '</div>' : '') +
        '<div class="reply-form-wrapper" data-post-id="' + pid + '" style="display:none">' +
          '<form class="reply-form" data-reply-form="' + pid + '">' +
            '<div class="reply-form-row">' +
              '<input type="text" class="reply-author-input" placeholder="Dein Name" required maxlength="60">' +
              '<input type="text" class="reply-message-input" placeholder="Schreibe einen Kommentar..." required maxlength="1000">' +
            '</div>' +
            '<div class="reply-form-actions">' +
              '<span class="reply-status" style="font-size:1.2rem;color:#7a7b7f;flex:1"></span>' +
              '<button type="button" class="reply-cancel-btn" data-reply-cancel="' + pid + '">Abbrechen</button>' +
              '<button type="submit" class="reply-btn reply-btn-primary"><i class="fa-regular fa-paper-plane"></i> Senden</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</article>';
    }).join('');

    feedContainer.querySelectorAll('.feed-post-watch img').forEach(function (img) {
      img.addEventListener('error', function () { this.style.display = 'none'; });
    });

    feedContainer.querySelectorAll('[data-toggle-reply]').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleReplyForm(parseInt(this.dataset.toggleReply, 10)); });
    });

    feedContainer.querySelectorAll('[data-reply-cancel]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeReplyForm(parseInt(this.dataset.replyCancel, 10)); });
    });

    feedContainer.querySelectorAll('[data-reply-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleReplySubmit(parseInt(this.dataset.replyForm, 10));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    openReplyForm = null;
    await checkAuth();
    if (typeof loadWatchesFromDb === 'function') { try { await loadWatchesFromDb(); } catch (e) {} }
    await loadWatches();
    await loadFeed();
    watchSelect.addEventListener('change', handleWatchSelect);
    clearBtn.addEventListener('click', clearWatch);
    form.addEventListener('submit', handleSubmit);
  });

})();