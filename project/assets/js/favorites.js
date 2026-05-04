function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
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

async function fetchReviews(watchId) {
  try {
    const url = new URL(`${getApiBase()}/api/reviews.php`, window.location.href)
    url.searchParams.set('watch_id', String(watchId))

    const response = await fetch(url, {
      credentials: 'include'
    })
    if (!response.ok) {
      return []
    }

    const payload = await response.json()
    return payload.ok && Array.isArray(payload.reviews) ? payload.reviews : []
  } catch (error) {
    console.error('Fetch reviews error:', error)
    return []
  }
}

function pickRandomReviews(reviews, count = 3) {
  if (reviews.length <= count) return reviews

  const shuffled = [...reviews].sort(() => Math.random() - 0.5)
  const desiredCount = Math.min(reviews.length, Math.random() < 0.5 ? 2 : 3)
  return shuffled.slice(0, desiredCount)
}

async function removeFavorite(watchId) {
  try {
    const url = new URL(`${getApiBase()}/api/favorites.php`, window.location.href)
    url.searchParams.set('watch_id', String(watchId))

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
      emptyState.style.display = 'block'
    }
    return
  }

  if (emptyState) {
    emptyState.style.display = 'none'
  }

  const cards = await Promise.all(
    favorites.map(async (watch) => {
      const reviews = await fetchReviews(watch.watch_id)
      const pickedReviews = pickRandomReviews(reviews)
      const reviewsHtml = pickedReviews.length > 0 ? `
        <div class="review-preview">
          ${pickedReviews.map((r) => `
            <blockquote class="mini-review">
              <p>"${r.comment.substring(0, 80)}${r.comment.length > 80 ? '...' : ''}"</p>
              <footer>— ${r.username}</footer>
            </blockquote>
          `).join('')}
        </div>
      ` : ''
      return renderWatchCard(watch, reviewsHtml)
    })
  )

  container.innerHTML = cards.join('')

  // Attach heart button listeners
  container.querySelectorAll('.heart-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()

      const watchId = parseInt(btn.dataset.watchId, 10)
      try {
        await removeFavorite(watchId)
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
