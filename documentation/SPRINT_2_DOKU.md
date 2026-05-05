# Sprint 2 - Watch Detail, Profil & Favoriten
- Samuel Farfeleder
- https://github.com/htl-leo-medtwt-projects/2526-3bhitm-sommerprojekt-Samuel1Farfeleder.git

## Projekt
ChronoVault

## Stand: Fertige Komponenten

### 1. Watch Detail (watch-detail.html)
- Detailseite für einzelne Uhren mit dynamischem Laden über die Watch-ID aus der URL.
- Großes Produktbild, Markenname, Modellname, Bewertung und Review-Anzahl.
- Anzeige von Produktionsjahr, Preis, Werk und Beschreibung.
- Favoriten-Button zum Hinzufügen und Entfernen einer Uhr aus den Favoriten.
- Bewertungsbereich mit bestehenden Reviews, Sterneanzeige und Datumsausgabe.
- Formular zum Abgeben einer eigenen Bewertung mit Sternauswahl und Kommentar.

### 2. Profilseite (profile.html)
- Profil-Dashboard mit Avatar, Username und Member-Since-Datum.
- Statistik-Karten für Favoriten und Bewertungen.
- Bereich mit den letzten Favoriten und letzten Reviews aus der API.
- Account-Informationen mit Username, E-Mail und Beitrittsdatum.
- Einstellungen zum Aktualisieren von Username, E-Mail und Passwort.
- Login- und Registrierungsbereich für nicht angemeldete Benutzer.

### 3. Favoriten (favorites.html)
- Übersicht aller gespeicherten Uhren des Benutzers in einem Grid.
- Kartenansicht mit Bild, Marke, Modell, Jahr, Bewertung und Review-Anzahl.
- Herz-Button zum direkten Entfernen aus den Favoriten.
- Leerer Zustand mit Hinweistext und Verweis zur Uhrenübersicht.
- Dynamisches Nachladen und sofortiges Entfernen gelöschter Favoriten.

### 4. API-Anbindung
- `api/watches.php` lädt die Detaildaten der Uhr für die Watch-Detail-Seite.
- `api/reviews.php` liefert vorhandene Bewertungen und nimmt neue Reviews entgegen.
- `api/favorites.php` verwaltet Favoriten beim Laden, Hinzufügen und Entfernen.
- `api/auth.php` prüft den Login-Status und unterstützt Login, Registrierung und Logout.
- `api/profile.php` liefert Profilwerte, Favoriten- und Review-Zähler sowie die letzten Einträge.

## Was im Sprint geschafft wurde
- Die Watch-Detail-Seite wurde als zentrale Produktseite umgesetzt und mit Bewertungen verbunden.
- Favoriten können direkt auf der Detailseite hinzugefügt und auf der Favoriten-Seite wieder entfernt werden.
- Die Profilseite zeigt die wichtigsten Kontodaten sowie persönliche Inhalte dynamisch aus der API.
- Login, Registrierung und Account-Änderungen sind direkt in die Profilansicht integriert.
- Alle drei Seiten arbeiten mit dynamischen Daten, Ladezuständen und Fehlerausgabe.
- Das Design wurde an das ChronoVault-Layout mit dunklem Stil und goldenen Akzenten angepasst.

## Ziele für den nächsten Sprint
- Startseite Uhren dynamisch laden.
- Startseite Autoscroll verbessern, sobald man auf Inhalte klickt.
- Design auf allen Seiten weiter angleichen und feinjustieren.
- Neue Uhren-Suchseite mit Filtern und passender Sortierung erstellen.

