function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
  // Die Favoriten-Seite soll unabhängig vom genauen lokalen Pfad funktionieren.
  if (idx !== -1) return path.substring(0, idx + '/project'.length)
  return '/project'
}

async function checkAuthStatus() {
  try {
    const response = await fetch(`${getApiBase()}/api/auth.php`, {
      credentials: 'include'
    })
    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    // Nur angemeldete Benutzer bekommen ihre Favoritenliste angezeigt.
    return payload.authenticated ? payload.user : null
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

async function fetchFavorites() {
  try {
    const response = await fetch(`${getApiBase()}/api/favorites.php`, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Favoriten konnten nicht geladen werden.')
    }

    const payload = await response.json()
    if (!payload.ok || !Array.isArray(payload.favorites)) {
      throw new Error('Ungueltige API-Antwort fuer Favoriten.')
    }

    return payload.favorites
  } catch (error) {
    console.error('Fetch favorites error:', error)
    throw error
  }
}

function renderWatchCard(watch, reviewsHtml = '') {
  const query = new URLSearchParams({
    id: String(watch.watch_id),
    brand: watch.brand,
    model: watch.model,
    year: String(watch.year),
    rating: String(watch.rating),
  }).toString()

  return `
    <article class="watch-card favorite-card">
      <a class="watch-link" href="watch-detail.html?${query}" aria-label="${watch.brand} ${watch.model} ansehen">
        <div class="watch-media">
          <img class="watch-image" src="${watch.pic || '../assets/img/placeholder.svg'}" alt="${watch.brand} ${watch.model}">
          <!-- Der Herz-Button liegt innerhalb des anklickbaren Cards, darum wird der Klick später bewusst abgefangen. -->
          <button class="heart-btn is-active" aria-label="Favorit entfernen" data-watch-id="${watch.watch_id}" type="button"></button>
        </div>
        <div class="watch-info">
          <small>${watch.brand}</small>
          <h3>${watch.model}</h3>
          <div class="watch-meta">
            <span class="meta-year">${watch.year}</span>
            <span class="meta-rating">${'★'.repeat(watch.rating)}<span class="empty-stars">${'☆'.repeat(5 - watch.rating)}</span></span>
            <span class="meta-count">(${watch.review_count ?? 0})</span>
          </div>
        </div>
      </a>
      ${reviewsHtml}
    </article>
  `
}

// Reviews preview removed from favorites view per user request

async function removeFavorite(watchId) {
  try {
    const url = new URL(`${getApiBase()}/api/favorites.php`, window.location.href)
    url.searchParams.set('watch_id', String(watchId))

    // Der Favorit wird per DELETE entfernt, damit der Zustand direkt serverseitig stimmt.
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Favorit konnte nicht entfernt werden.')
    }

    const payload = await response.json()
    if (!payload.ok) {
      throw new Error(payload.error || 'Favorit konnte nicht entfernt werden.')
    }
  } catch (error) {
    console.error('Remove favorite error:', error)
    throw error
  }
}

async function renderFavorites() {
  const favoritesView = document.getElementById('favoritesView')
  const favoritesSection = document.getElementById('favoritesSection')
  const emptyState = document.getElementById('emptyState')
  const container = document.getElementById('favoritesContainer')

  if (favoritesView) favoritesView.style.display = 'block'
  if (favoritesSection) favoritesSection.style.display = 'block'
  if (!container) return

  let favorites = []

  try {
    favorites = await fetchFavorites()
  } catch (error) {
    console.error(error)
  }

  if (favorites.length === 0) {
    container.innerHTML = ''
    if (emptyState) {
      // Leerer Zustand: Statt leerer Fläche wird ein Hinweis mit Call-to-Action gezeigt.
      emptyState.style.display = 'block'
    }
    return
  }

  if (emptyState) {
    emptyState.style.display = 'none'
  }

  const cards = favorites.map((watch) => renderWatchCard(watch))

  container.innerHTML = cards.join('')

  // Attach heart button listeners
  container.querySelectorAll('.heart-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      // Der Klick soll nur den Favoriten entfernen und nicht den Link zur Detailseite öffnen.
      e.preventDefault()
      e.stopPropagation()

      const watchId = parseInt(btn.dataset.watchId, 10)
      try {
        await removeFavorite(watchId)
        // Nach dem Löschen wird die Karte direkt aus dem Grid entfernt, damit die UI sofort korrekt ist.
        btn.closest('.watch-card').remove()

        if (container.children.length === 0 && emptyState) {
          emptyState.style.display = 'block'
        }
      } catch (error) {
        console.error('Error removing favorite:', error)
        alert(error.message || 'Fehler beim Entfernen des Favorits')
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  renderFavorites()
})
