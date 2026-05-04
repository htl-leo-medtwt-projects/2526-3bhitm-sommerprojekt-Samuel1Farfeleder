function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
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

function updateAuthUI(authenticated, user = null) {
  const authSection = document.getElementById('authSection')
  const settingsSection = document.getElementById('settingsSection')
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')
  const logoutBtn = document.getElementById('logoutBtn')

  if (!authenticated) {
    // Zeige Login/Register Formulare
    if (authSection) authSection.style.display = 'block'
    if (settingsSection) settingsSection.style.display = 'none'
    if (loginForm) loginForm.style.display = 'block'
    if (registerForm) registerForm.style.display = 'block'
    if (logoutBtn) logoutBtn.style.display = 'none'
  } else {
    // Zeige Settings
    if (authSection) authSection.style.display = 'none'
    if (settingsSection) settingsSection.style.display = 'block'
    if (logoutBtn) logoutBtn.style.display = 'block'
    
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

    // Aktualisiere UI mit Profildaten
    const bannerUsername = document.getElementById('bannerUsername')
    if (bannerUsername) bannerUsername.textContent = user.username

    const memberSince = document.getElementById('memberSince')
    if (memberSince) memberSince.textContent = `Member since ${formatDate(user.created_at)}`

    const profileUsername = document.getElementById('profileUsername')
    if (profileUsername) profileUsername.textContent = user.username

    const profileEmail = document.getElementById('profileEmail')
    if (profileEmail) profileEmail.textContent = user.email

    const profileMemberSince = document.getElementById('profileMemberSince')
    if (profileMemberSince) profileMemberSince.textContent = formatDate(user.created_at)

    const favCountEl = document.getElementById('favCount')
    if (favCountEl) favCountEl.textContent = favCount

    const reviewCountEl = document.getElementById('reviewCount')
    if (reviewCountEl) reviewCountEl.textContent = revCount

    // Zeige Recent Favorites
    const favContainer = document.getElementById('favoritesContainer')
    if (favContainer) {
      if (recentFavorites.length === 0) {
        favContainer.innerHTML = '<p class="empty-message">No favorites yet.</p>'
      } else {
        favContainer.innerHTML = recentFavorites.map(fav => `
          <div class="recent-card">
            <small>${fav.brand_name}</small>
            <h3>${fav.watch_name}</h3>
            <p><a href="watch-detail.html?id=${fav.watch_id}" class="view-link">View Watch →</a></p>
          </div>
        `).join('')
      }
    }

    // Zeige Recent Reviews
    const revContainer = document.getElementById('reviewsContainer')
    if (revContainer) {
      if (recentReviews.length === 0) {
        revContainer.innerHTML = '<p class="empty-message">No reviews yet.</p>'
      } else {
        revContainer.innerHTML = recentReviews.map(rev => `
          <div class="recent-card">
            <div class="review-header">
              <small>${rev.brand_name} ${rev.watch_name}</small>
              <div class="stars">${'★'.repeat(rev.rating)}<span class="empty-stars">${'☆'.repeat(5 - rev.rating)}</span></div>
            </div>
            <p class="review-text">"${rev.comment.substring(0, 100)}${rev.comment.length > 100 ? '...' : ''}"</p>
            <p><a href="watch-detail.html?id=${rev.watch_id}" class="view-link">View Watch →</a></p>
          </div>
        `).join('')
      }
    }
  } catch (error) {
    console.error('Profile load error:', error)
    const favCountEl = document.getElementById('favCount')
    if (favCountEl) favCountEl.textContent = 'Error'
    const reviewCountEl = document.getElementById('reviewCount')
    if (reviewCountEl) reviewCountEl.textContent = 'Error'
  }
}

async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById('loginEmail').value.trim()
  const password = document.getElementById('loginPassword').value

  if (!email || !password) {
    setAuthStatus('Email and password are required.', true)
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
      setAuthStatus(data.error || 'Login failed.', true)
      return
    }

    setAuthStatus('Login successful!')
    updateAuthUI(true, data.user)
    
    // Reset form
    document.getElementById('loginForm').reset()
    
    // Reload profile with delay to ensure session is set
    setTimeout(() => {
      loadProfile()
    }, 500)
  } catch (error) {
    console.error('Login error:', error)
    setAuthStatus('Login failed.', true)
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const username = document.getElementById('registerUsername').value.trim()
  const email = document.getElementById('registerEmail').value.trim()
  const password = document.getElementById('registerPassword').value

  if (!username || !email || !password) {
    setAuthStatus('All fields are required.', true)
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
      setAuthStatus(data.error || 'Registration failed.', true)
      return
    }

    setAuthStatus('Registration successful!')
    updateAuthUI(true, data.user)
    
    // Reset form
    document.getElementById('registerForm').reset()
    
    await loadProfile()
  } catch (error) {
    console.error('Register error:', error)
    setAuthStatus('Registration failed.', true)
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
    setSettingsStatus('Username and email are required.', true)
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
      setSettingsStatus(data.error || 'Save failed.', true)
      return
    }

    setSettingsStatus('Changes saved successfully!')
    
    // Reload profile
    await loadProfile()
  } catch (error) {
    console.error('Settings save error:', error)
    setSettingsStatus('Save failed.', true)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Setup event listeners
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')
  const settingsForm = document.getElementById('settingsForm')
  const logoutBtn = document.getElementById('logoutBtn')
  const manageAccountBtn = document.getElementById('manageAccountBtn')

  if (loginForm) loginForm.addEventListener('submit', handleLogin)
  if (registerForm) registerForm.addEventListener('submit', handleRegister)
  if (settingsForm) settingsForm.addEventListener('submit', handleSettings)
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)
  
  if (manageAccountBtn) {
    manageAccountBtn.addEventListener('click', () => {
      const settingsSection = document.getElementById('settingsSection')
      if (settingsSection) {
        settingsSection.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  // Check auth status on page load
  checkAuth()
})