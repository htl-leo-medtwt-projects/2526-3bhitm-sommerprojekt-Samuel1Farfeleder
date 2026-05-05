# Sprint 2 - Authentifizierung & Profilseite
- Samuel Farfeleder
- https://github.com/htl-leo-medtwt-projects/2526-3bhitm-sommerprojekt-Samuel1Farfeleder.git

## Projekt
ChronoVault

## Stand: Fertige Komponenten

### 1. Profile (profile.html)
- Profilseite mit Benutzer-Informationen und Authentication.
- Profile-Banner mit Avatar, Username und Member-Since Datum.
- Stats-Grid zeigt Favoriten- und Reviews-Zähler.
- Eingebettete Login/Register-Formulare für unauthentifizierte User.
- Account Settings für authentifizierte User (Username, Email, Password update).
- Recent Favorites Liste wird dynamisch aus API geladen.

### 2. Authentication API (api/auth.php)
- GET: Prüft Auth-Status und gibt User-Daten zurück.
- POST (register): Neuer User mit Validierung und Password-Hashing.
- POST (login): Login mit Email & Password Verifikation.
- DELETE: Logout (Session wird gelöscht).
- Alle Responses im Format: `{ ok: true, authenticated: boolean, user: {...} }`

### 3. Profile API (api/profile.php)
- GET: Lädt User-Daten, Favoriten-Zähler, Reviews-Zähler und Recent Items.
- PUT: Aktualisiert Username, Email, Password (optional) mit Validierung.
- Erfordert Authentifizierung für beide Methoden.
- Queries mit LEFT JOINs zu watches und brands Tabellen.

### 4. Bootstrap Helper (api/bootstrap.php)
- Zentralisierte Helper-Funktionen für alle Endpoints.
- json_response() und json_error() für standardisierte JSON-Ausgabe.
- authenticated_user_id() und require_authenticated_user_id() für Auth.
- Session-Start und Global Exception Handler bereits eingebaut.

## Was im Sprint geschafft wurde
- Session-basierte Authentifizierung mit Password-Hashing komplett implementiert.
- Bootstrap-Pattern mit wiederverwendbaren Helper-Funktionen erstellt.
- Profilseite mit eingebetteten Auth-Formularen (nicht separate Login-Seite).
- Profile-API mit GET/PUT und komplexen SQL-Joins für Stats.
- JavaScript-Flow für komplette Auth-Logik (checkAuth, loadProfile, handleLogin/Register/Logout).
- Responsive CSS mit ChronoVault Design System (Dark Theme + Gold Accents).
- Fehlerbehandlung und Status-Messages im Frontend.

## Ziele für den nächsten Sprint
- Startseite Uhren dynamisch laden 
- Startseite autoscroll sobald man wo rauf drückt
- Design auf allen seiten wenn möglich noch etwas anpassen
- Neue Seite wo man uhren mit filtern passend zu einem suchen kann

