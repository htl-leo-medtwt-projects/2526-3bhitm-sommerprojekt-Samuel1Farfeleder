const USER_ID = 1

let currentWatch = null

function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
  if (idx !== -1) return path.substring(0, idx + '/project'.length)
  return '/project'
}

async function loadWatchDetail() {
  const params = new URLSearchParams(window.location.search)
  const watchId = params.get('id')

  if (!watchId) {
    showError('Uhr-ID erforderlich')
    return
  }

  try {
    const apiBase = getApiBase()
    const response = await fetch(`${apiBase}/api/watches.php`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Failed to load watches list')
    }

    const payload = await response.json()
    const watches = Array.isArray(payload.watches) ? payload.watches : []
    const found = watches.find((w) => String(w.id) === String(watchId))
    if (!found) {
      showError('Uhr nicht gefunden')
      return
    }

    currentWatch = found
    renderWatchDetail(currentWatch)
  } catch (error) {
    console.error('Error loading watch:', error)
    showError('Fehler beim Laden der Uhr-Details')
  }
}

function renderWatchDetail(watch) {
  const container = document.getElementById('detailContainer')
  const spinner = document.getElementById('loadingSpinner')

  if (!container) return

  document.title = `ChronoVault | ${watch.brand} ${watch.model}`

  const watchImage = document.getElementById('watchImage')
  if (watchImage) {
    watchImage.src = watch.pic
    watchImage.alt = `${watch.brand} ${watch.model}`
  }

  const brandLabel = document.getElementById('brandLabel')
  if (brandLabel) brandLabel.textContent = watch.brand

  const modelName = document.getElementById('modelName')
  if (modelName) modelName.textContent = watch.model

  const starRating = document.getElementById('starRating')
  if (starRating) {
    starRating.innerHTML = renderStars(watch.rating, false)
  }

  const reviewCount = document.getElementById('reviewCount')
  if (reviewCount) {
    reviewCount.textContent = `${watch.review_count} ${watch.review_count === 1 ? 'Bewertung' : 'Bewertungen'}`
  }

  const productionYear = document.getElementById('productionYear')
  if (productionYear) productionYear.textContent = watch.production_year

  const price = document.getElementById('price')
  if (price) price.textContent = formatPrice(watch.price_usd)

  const movement = document.getElementById('movement')
  if (movement) movement.textContent = watch.movement || 'Nicht verfügbar'

  const description = document.getElementById('description')
  if (description) description.textContent = watch.description || 'Keine Beschreibung verfügbar'

  updateFavoriteButtonState(watch.is_favorite)

  if (spinner) spinner.style.display = 'none'
  if (container) container.style.display = 'block'
}

function renderStars(rating, interactive = false) {
  let html = ''
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= rating
    html += `<span class="star ${isFilled ? 'filled' : ''}" data-value="${i}">
      <i class="fa-${isFilled ? 'solid' : 'regular'} fa-star"></i>
    </span>`
  }
  return html
}

function formatPrice(priceUsd) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
  }).format(priceUsd)
}

function updateFavoriteButtonState(isFavorite) {
  const favoriteBtn = document.getElementById('favoriteBtn')
  const favBtnText = document.getElementById('favBtnText')

  if (favoriteBtn) {
    if (isFavorite) {
      favoriteBtn.classList.add('is-favorite')
      favoriteBtn.setAttribute('aria-label', 'Aus Favoriten entfernen')
    } else {
      favoriteBtn.classList.remove('is-favorite')
      favoriteBtn.setAttribute('aria-label', 'Zu Favoriten hinzufügen')
    }
  }

  if (favBtnText) {
    favBtnText.textContent = isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'
  }
}

async function toggleFavorite() {
  if (!currentWatch) return

  const action = currentWatch.is_favorite ? 'remove' : 'add'
  const endpoint = action === 'add' ? '../api/add-favorite.php' : '../api/remove-favorite.php'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: USER_ID,
        watch_id: currentWatch.id,
      }),
    })

    if (response.ok) {
      currentWatch.is_favorite = !currentWatch.is_favorite
      updateFavoriteButtonState(currentWatch.is_favorite)
    } else {
      console.error('Failed to toggle favorite')
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

function showError(message) {
  const errorMsg = document.getElementById('errorMessage')
  const spinner = document.getElementById('loadingSpinner')

  if (spinner) spinner.style.display = 'none'
  if (errorMsg) {
    errorMsg.textContent = message
    errorMsg.style.display = 'block'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const favoriteBtn = document.getElementById('favoriteBtn')
  const addToFavBtn = document.getElementById('addToFavBtn')

  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', toggleFavorite)
  }

  if (addToFavBtn) {
    addToFavBtn.addEventListener('click', toggleFavorite)
  }

  loadWatchDetail()
})
