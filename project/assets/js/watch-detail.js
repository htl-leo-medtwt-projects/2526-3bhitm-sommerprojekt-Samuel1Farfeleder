let currentWatch = null
let selectedRating = 0

function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
  // Die App kann in unterschiedlichen lokalen Pfaden laufen, deshalb wird die API-Basis aus der aktuellen URL abgeleitet.
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
    const response = await fetch(`${apiBase}/api/watches.php?id=${watchId}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Failed to load watch')
    }

    const payload = await response.json()
    
    if (payload.ok && payload.watch) {
      // Standardfall: Die API liefert direkt ein einzelnes Watch-Objekt zurück.
      currentWatch = payload.watch
      renderWatchDetail(currentWatch)
      await loadAndRenderReviews(currentWatch.id)
    } else if (Array.isArray(payload.watches)) {
      // Fallback: Falls die API eine Liste zurückgibt, wird die gesuchte Uhr daraus herausgefiltert.
      const found = payload.watches.find((w) => String(w.id) === String(watchId))
      if (!found) {
        showError('Uhr nicht gefunden')
        return
      }
      currentWatch = found
      renderWatchDetail(currentWatch)
      await loadAndRenderReviews(currentWatch.id)
    } else {
      showError('Uhr nicht gefunden')
    }
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
    // Die Sterne werden als HTML gerendert, weil die gefüllten und leeren Icons dynamisch wechseln.
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
  // Die Preisformatierung nutzt das deutsche Zahlenformat, aber mit USD als Währung.
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

  const apiBase = getApiBase()
  
  try {
    if (currentWatch.is_favorite) {
      // Bei aktivem Favorit-Status wird der Eintrag per DELETE entfernt.
      const response = await fetch(`${apiBase}/api/favorites.php?watch_id=${currentWatch.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }
      
      currentWatch.is_favorite = false
      updateFavoriteButtonState(false)
    } else {
      // Andernfalls wird die Uhr per POST in die Favoriten geschrieben.
      const response = await fetch(`${apiBase}/api/favorites.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          watch_id: currentWatch.id,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          alert('Bitte melden Sie sich an um Favoriten zu erstellen')
          return
        }
        throw new Error('Failed to add favorite')
      }
      
      currentWatch.is_favorite = true
      updateFavoriteButtonState(true)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    alert('Fehler beim Aktualisieren des Favorits: ' + error.message)
  }
}

async function loadReviews(watchId) {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/reviews.php?watch_id=${watchId}`)

  if (!response.ok) {
    throw new Error('Reviews konnten nicht geladen werden')
  }

  const payload = await response.json()
  if (!payload.ok || !Array.isArray(payload.reviews)) {
    throw new Error('Ungültige API-Antwort für Reviews')
  }

  return payload.reviews
}

function formatReviewDate(dateString) {
  // Reviews sollen in einer kurzen, lesbaren Datumsform angezeigt werden.
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE')
}

function renderReviewsList(reviews) {
  const reviewsList = document.getElementById('reviewsList')
  if (!reviewsList) return

  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p class="no-reviews">Noch keine Bewertungen vorhanden. Sei der Erste!</p>'
    return
  }

  reviewsList.innerHTML = reviews.map((review) => `
    <article class="review-item">
      <div class="review-head">
        <h4>${review.username}</h4>
        <div class="review-meta">
          <div class="review-stars">
            ${'★'.repeat(review.rating)}<span class="empty-stars">${'☆'.repeat(5 - review.rating)}</span>
          </div>
          <time datetime="${new Date(review.created_at).toISOString().split('T')[0]}">
            ${formatReviewDate(review.created_at)}
          </time>
        </div>
      </div>
      <p class="review-comment">${review.comment}</p>
    </article>
  `).join('')
}

async function loadAndRenderReviews(watchId) {
  try {
    const reviews = await loadReviews(watchId)
    renderReviewsList(reviews)
  } catch (error) {
    console.error('Error loading reviews:', error)
    const reviewsList = document.getElementById('reviewsList')
    if (reviewsList) {
      reviewsList.innerHTML = '<p class="error">Bewertungen konnten nicht geladen werden</p>'
    }
  }
}

function attachRatingControls() {
  const rateButtons = Array.from(document.querySelectorAll('#rateInput button'))

  rateButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const rating = parseInt(button.dataset.rating, 10)
      selectedRating = rating

      // Beim Klicken werden alle Sterne bis zur gewählten Bewertung aktiv markiert.
      rateButtons.forEach((btn, index) => {
        const btnRating = parseInt(btn.dataset.rating, 10)
        if (btnRating <= rating) {
          btn.classList.add('active')
          const icon = btn.querySelector('i')
          if (icon) {
            icon.classList.remove('fa-regular')
            icon.classList.add('fa-solid')
          }
        } else {
          btn.classList.remove('active')
          const icon = btn.querySelector('i')
          if (icon) {
            icon.classList.add('fa-regular')
            icon.classList.remove('fa-solid')
          }
        }
      })
    })
  })
}

async function submitReview(watchId, rating, comment) {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/reviews.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      watch_id: watchId,
      rating,
      comment,
    }),
  })

  if (!response.ok) {
    let serverMessage = ''
    try {
      const errorPayload = await response.json()
      serverMessage = errorPayload?.error || ''
    } catch (_error) {
      serverMessage = ''
    }
    
    if (response.status === 401) {
      throw new Error('Bitte melden Sie sich an um eine Bewertung zu schreiben')
    }
    throw new Error(serverMessage || 'Bewertung konnte nicht gespeichert werden')
  }

  const payload = await response.json()
  if (!payload.ok) {
    throw new Error(payload.error || 'Bewertung konnte nicht gespeichert werden')
  }
}

function setReviewStatus(message, isError = false) {
  const reviewStatus = document.getElementById('reviewStatus')
  if (!reviewStatus) return

  reviewStatus.textContent = message
  reviewStatus.style.color = isError ? '#c62828' : '#2e7d32'
  reviewStatus.style.display = 'block'

  if (!isError) {
    setTimeout(() => {
      reviewStatus.style.display = 'none'
    }, 3000)
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
  const submitReviewBtn = document.getElementById('submitReviewBtn')
  const reviewText = document.getElementById('reviewText')

  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', toggleFavorite)
  }

  if (addToFavBtn) {
    addToFavBtn.addEventListener('click', toggleFavorite)
  }

  attachRatingControls()

  if (submitReviewBtn && reviewText) {
    submitReviewBtn.addEventListener('click', async () => {
      const comment = reviewText.value.trim()

      // Eine Bewertung ist nur sinnvoll, wenn Uhr, Sternzahl und Text vorhanden sind.
      if (!currentWatch || !selectedRating || comment === '') {
        setReviewStatus('Bitte Bewertung auswählen und Text eingeben', true)
        return
      }

      try {
        await submitReview(currentWatch.id, selectedRating, comment)
        reviewText.value = ''
        selectedRating = 0
        // Nach dem Absenden werden die Sterne zurückgesetzt, damit klar ist, dass die Eingabe abgeschlossen ist.
        document.querySelectorAll('#rateInput button').forEach((btn) => {
          btn.classList.remove('active')
          const icon = btn.querySelector('i')
          if (icon) {
            icon.classList.add('fa-regular')
            icon.classList.remove('fa-solid')
          }
        })
        await loadAndRenderReviews(currentWatch.id)
        setReviewStatus('Bewertung erfolgreich gespeichert!', false)
      } catch (error) {
        console.error('Error submitting review:', error)
        setReviewStatus(error.message || 'Bewertung konnte nicht gespeichert werden', true)
      }
    })
  }

  loadWatchDetail()
})
