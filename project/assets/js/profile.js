function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
  // Die App kann aus einem Unterordner laufen, daher wird die API-Basis dynamisch berechnet.
  if (idx !== -1) return path.substring(0, idx + '/project'.length)
  return '/project'
}

function setAuthStatus(message, isError = false) {
  const status = document.getElementById('authStatus')
  if (!status) return
  
  status.textContent = message
  status.className = `form-status ${isError ? 'error' : 'success'}`
  
  if (!isError) {
    setTimeout(() => {
      status.textContent = ''
      status.className = 'form-status'
    }, 3000)
  }
}

function setSettingsStatus(message, isError = false) {
  const status = document.getElementById('settingsStatus')
  if (!status) return
  
  status.textContent = message
  status.className = `form-status ${isError ? 'error' : 'success'}`
  
  if (!isError) {
    setTimeout(() => {
      status.textContent = ''
      status.className = 'form-status'
    }, 3000)
  }
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function updateAuthUI(authenticated, user = null) {
  const authSectionWrapper = document.getElementById('authSectionWrapper')
  const accountSectionWrapper = document.getElementById('accountSectionWrapper')
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')
  const logoutBtn = document.getElementById('logoutBtn')

  if (!authenticated) {
    // Nicht angemeldet: Login- und Registrierungsbereich sichtbar machen, Einstellungen ausblenden.
    if (authSectionWrapper) authSectionWrapper.style.display = 'block'
    if (accountSectionWrapper) accountSectionWrapper.style.display = 'none'
    if (loginForm) loginForm.style.display = 'block'
    if (registerForm) registerForm.style.display = 'block'
    if (logoutBtn) logoutBtn.style.display = 'none'
  } else {
    // Angemeldet: Profil-Einstellungen anzeigen und Felder mit den aktuellen Daten füllen.
    if (authSectionWrapper) authSectionWrapper.style.display = 'none'
    if (accountSectionWrapper) accountSectionWrapper.style.display = 'block'
    if (logoutBtn) {
      logoutBtn.style.display = 'flex'
      // Stelle sicher, dass der Logout-Button nicht im authWrapper versteckt ist
      logoutBtn.style.margin = '20px auto 0'
    }
    
    if (user) {
      const settingsUsername = document.getElementById('settingsUsername')
      const settingsEmail = document.getElementById('settingsEmail')
      
      if (settingsUsername) settingsUsername.value = user.username || ''
      if (settingsEmail) settingsEmail.value = user.email || ''
    }
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })
}

async function checkAuth() {
  try {
    const response = await fetch(`${getApiBase()}/api/auth.php`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (data.authenticated && data.user) {
      // Erst wenn die Session gültig ist, werden die Profildaten nachgeladen.
      updateAuthUI(true, data.user)
      await loadProfile()
    } else {
      updateAuthUI(false)
    }
  } catch (error) {
    console.error('Auth check error:', error)
    updateAuthUI(false)
  }
}

async function loadProfile() {
  try {
    const response = await fetch(`${getApiBase()}/api/profile.php`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to load profile')

    const data = await response.json()
    if (!data.ok) throw new Error(data.error || 'Failed to load profile')

    const user = data.user
    const favCount = data.favorites_count
    const revCount = data.reviews_count
    const recentFavorites = data.recent_favorites
    const recentReviews = data.recent_reviews

    // Banner Avatar initial
    const bannerAvatar = document.getElementById('bannerAvatar')
    if (bannerAvatar) bannerAvatar.textContent = getInitials(user.username)

    // Banner Username
    const bannerUsername = document.getElementById('bannerUsername')
    if (bannerUsername) bannerUsername.textContent = user.username

    // Member since
    const memberSince = document.getElementById('memberSince')
    if (memberSince) memberSince.textContent = `Seit ${formatDate(user.created_at)}`

    // Mini stats in banner
    const miniFavCount = document.getElementById('miniFavCount')
    if (miniFavCount) miniFavCount.textContent = favCount

    const miniRevCount = document.getElementById('miniRevCount')
    if (miniRevCount) miniRevCount.textContent = revCount

    // Profil Info Account
    const profileUsername = document.getElementById('profileUsername')
    if (profileUsername) profileUsername.textContent = user.username

    const profileEmail = document.getElementById('profileEmail')
    if (profileEmail) profileEmail.textContent = user.email

    const profileMemberSince = document.getElementById('profileMemberSince')
    if (profileMemberSince) profileMemberSince.textContent = formatDate(user.created_at)

    // Stat Cards
    const favCountEl = document.getElementById('favCount')
    if (favCountEl) favCountEl.textContent = favCount

    const reviewCountEl = document.getElementById('reviewCount')
    if (reviewCountEl) reviewCountEl.textContent = revCount

    // Die letzten Favoriten werden als kompakte Kacheln gerendert, damit die Seite nicht zu lang wird.
    const favContainer = document.getElementById('favoritesContainer')
    if (favContainer) {
      if (recentFavorites.length === 0) {
        favContainer.innerHTML = '<p class="empty-message">Noch keine Favoriten.</p>'
      } else {
        favContainer.innerHTML = recentFavorites.map(fav => `
          <div class="recent-card">
            <small>${fav.brand_name}</small>
            <h3>${fav.watch_name}</h3>
            <p><a href="watch-detail.html?id=${fav.watch_id}" class="view-link">Ansehen <i class="fa-solid fa-arrow-right"></i></a></p>
          </div>
        `).join('')
      }
    }

    // Reviews bekommen eine Vorschau, damit man schnell erkennt, was zuletzt bewertet wurde.
    const revContainer = document.getElementById('reviewsContainer')
    if (revContainer) {
      if (recentReviews.length === 0) {
        revContainer.innerHTML = '<p class="empty-message">Noch keine Bewertungen.</p>'
      } else {
        revContainer.innerHTML = recentReviews.map(rev => `
          <div class="recent-card">
            <div class="review-header">
              <small>${rev.brand_name} ${rev.watch_name}</small>
              <div class="stars">${'★'.repeat(rev.rating)}<span class="empty-stars">${'☆'.repeat(5 - rev.rating)}</span></div>
            </div>
            <p class="review-text">"${rev.comment.substring(0, 100)}${rev.comment.length > 100 ? '...' : ''}"</p>
            <p><a href="watch-detail.html?id=${rev.watch_id}" class="view-link">Ansehen <i class="fa-solid fa-arrow-right"></i></a></p>
          </div>
        `).join('')
      }
    }
  } catch (error) {
    console.error('Profile load error:', error)
    const favCountEl = document.getElementById('favCount')
    if (favCountEl) favCountEl.textContent = 'Fehler'
    const reviewCountEl = document.getElementById('reviewCount')
    if (reviewCountEl) reviewCountEl.textContent = 'Fehler'
  }
}

async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById('loginEmail').value.trim()
  const password = document.getElementById('loginPassword').value

  if (!email || !password) {
    setAuthStatus('E-Mail und Passwort sind erforderlich.', true)
    return
  }

  try {
    const response = await fetch(`${getApiBase()}/api/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'login',
        email,
        password
      })
    })

    const data = await response.json()

    if (!data.ok) {
      setAuthStatus(data.error || 'Login fehlgeschlagen.', true)
      return
    }

    setAuthStatus('Erfolgreich angemeldet!')
    updateAuthUI(true, data.user)
    
    // Das Formular wird geleert, damit keine alten Zugangsdaten sichtbar bleiben.
    document.getElementById('loginForm').reset()
    
    // Kurze Verzögerung, damit die Session serverseitig sicher gesetzt ist, bevor das Profil neu geladen wird.
    setTimeout(() => {
      loadProfile()
    }, 500)
  } catch (error) {
    console.error('Login error:', error)
    setAuthStatus('Login fehlgeschlagen.', true)
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const username = document.getElementById('registerUsername').value.trim()
  const email = document.getElementById('registerEmail').value.trim()
  const password = document.getElementById('registerPassword').value

  if (!username || !email || !password) {
    setAuthStatus('Alle Felder sind erforderlich.', true)
    return
  }

  try {
    const response = await fetch(`${getApiBase()}/api/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'register',
        username,
        email,
        password
      })
    })

    const data = await response.json()

    if (!data.ok) {
      setAuthStatus(data.error || 'Registrierung fehlgeschlagen.', true)
      return
    }

    setAuthStatus('Registrierung erfolgreich!')
    updateAuthUI(true, data.user)
    
    // Das Registrierungsformular wird direkt zurückgesetzt, damit der neue Account sauber bestätigt wird.
    document.getElementById('registerForm').reset()
    
    await loadProfile()
  } catch (error) {
    console.error('Register error:', error)
    setAuthStatus('Registrierung fehlgeschlagen.', true)
  }
}

async function handleLogout(e) {
  e.preventDefault()

  try {
    const response = await fetch(`${getApiBase()}/api/auth.php`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })

    const data = await response.json()

    if (data.ok) {
      // Nach dem Logout wird die UI wieder in den unauthentifizierten Zustand versetzt.
      updateAuthUI(false)
      document.getElementById('loginForm').reset()
      document.getElementById('registerForm').reset()
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

async function handleSettings(e) {
  e.preventDefault()

  const username = document.getElementById('settingsUsername').value.trim()
  const email = document.getElementById('settingsEmail').value.trim()
  const password = document.getElementById('settingsPassword').value

  if (!username || !email) {
    setSettingsStatus('Benutzername und E-Mail sind erforderlich.', true)
    return
  }

  try {
    const response = await fetch(`${getApiBase()}/api/profile.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username,
        email,
        password
      })
    })

    const data = await response.json()

    if (!data.ok) {
      setSettingsStatus(data.error || 'Speichern fehlgeschlagen.', true)
      return
    }

    setSettingsStatus('Änderungen erfolgreich gespeichert!')
    
    // Nach dem Speichern werden die angezeigten Daten direkt aus der API aktualisiert.
    await loadProfile()
  } catch (error) {
    console.error('Settings save error:', error)
    setSettingsStatus('Speichern fehlgeschlagen.', true)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Event-Listener werden gebunden, sobald die Seite fertig geladen ist.
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')
  const settingsForm = document.getElementById('settingsForm')
  const logoutBtn = document.getElementById('logoutBtn')
  const manageAccountBtn = document.getElementById('manageAccountBtn')
  const manageAccountBtn2 = document.getElementById('manageAccountBtn2')

  if (loginForm) loginForm.addEventListener('submit', handleLogin)
  if (registerForm) registerForm.addEventListener('submit', handleRegister)
  if (settingsForm) settingsForm.addEventListener('submit', handleSettings)
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)
  
  function scrollToSettings() {
    const accountSectionWrapper = document.getElementById('accountSectionWrapper')
    if (accountSectionWrapper) {
      accountSectionWrapper.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (manageAccountBtn) {
    manageAccountBtn.addEventListener('click', scrollToSettings)
  }

  if (manageAccountBtn2) {
    manageAccountBtn2.addEventListener('click', scrollToSettings)
  }

  // Beim Laden wird zuerst geprüft, ob bereits eine gültige Session existiert.
  checkAuth()
})