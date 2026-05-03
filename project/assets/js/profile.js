const USER_ID = 1

function getApiBase() {
  const path = window.location.pathname
  const idx = path.indexOf('/project')
  if (idx !== -1) return path.substring(0, idx + '/project'.length)
  return '/project'
}

function setProfileStatus(message, isError = false) {
  const status = document.getElementById('profileStatus')
  if (!status) return

  status.textContent = message
  status.classList.add('is-visible')
  status.style.color = isError ? '#f5b5b5' : '#d9edc8'

  if (!isError) {
    window.clearTimeout(setProfileStatus.hideTimer)
    setProfileStatus.hideTimer = window.setTimeout(() => {
      status.classList.remove('is-visible')
      status.textContent = ''
    }, 3000)
  }
}

function applyProfile(profile) {
  const usernameInput = document.getElementById('usernameInput')
  const emailInput = document.getElementById('emailInput')
  const profileDisplayName = document.getElementById('profileDisplayName')
  const profileDisplayEmail = document.getElementById('profileDisplayEmail')

  if (usernameInput) usernameInput.value = profile.username || ''
  if (emailInput) emailInput.value = profile.email || ''
  if (profileDisplayName) profileDisplayName.textContent = profile.username || 'Profil'
  if (profileDisplayEmail) profileDisplayEmail.textContent = profile.email || ''
}

async function loadProfile() {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/profile.php?user_id=${USER_ID}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Profil konnte nicht geladen werden')
  }

  const payload = await response.json()
  if (!payload.ok || !payload.profile) {
    throw new Error(payload.error || 'Profil konnte nicht geladen werden')
  }

  applyProfile(payload.profile)
}

async function saveProfile(username, email) {
  const apiBase = getApiBase()
  const response = await fetch(`${apiBase}/api/profile.php?user_id=${USER_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || 'Profil konnte nicht gespeichert werden')
  }

  return payload.profile
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('profileForm')
  const usernameInput = document.getElementById('usernameInput')
  const emailInput = document.getElementById('emailInput')

  try {
    await loadProfile()
  } catch (error) {
    console.error('Error loading profile:', error)
    setProfileStatus(error.message || 'Profil konnte nicht geladen werden', true)
  }

  if (form && usernameInput && emailInput) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const username = usernameInput.value.trim()
      const email = emailInput.value.trim()

      if (!username || !email) {
        setProfileStatus('Bitte Benutzername und E-Mail ausfuellen.', true)
        return
      }

      try {
        const profile = await saveProfile(username, email)
        applyProfile(profile)
        setProfileStatus('Profil erfolgreich gespeichert.')
      } catch (error) {
        console.error('Error saving profile:', error)
        setProfileStatus(error.message || 'Profil konnte nicht gespeichert werden', true)
      }
    })
  }
})