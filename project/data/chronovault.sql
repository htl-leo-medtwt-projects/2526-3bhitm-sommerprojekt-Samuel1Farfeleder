-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db_server
-- Erstellungszeit: 20. Apr 2026 um 14:49
-- Server-Version: 9.3.0
-- PHP-Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `chronovault`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `brands`
--

CREATE TABLE `brands` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `founded_year` smallint UNSIGNED DEFAULT NULL,
  `country` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `brands`
--

INSERT INTO `brands` (`id`, `name`, `founded_year`, `country`, `description`, `created_at`) VALUES
(1, 'Rolex', 1905, 'Switzerland', 'Rolex is known for precision and iconic sports watches.', '2026-04-14 18:20:50'),
(2, 'Patek Philippe', 1839, 'Switzerland', 'Independent Swiss high-end watchmaker with deep heritage.', '2026-04-14 18:20:50'),
(3, 'Audemars Piguet', 1875, 'Switzerland', 'Avant-garde haute horlogerie, famous for Royal Oak.', '2026-04-14 18:20:50'),
(4, 'Omega', 1848, 'Switzerland', 'Strong chronometry and space-exploration legacy.', '2026-04-14 18:20:50'),
(5, 'Richard Mille', 2001, 'Switzerland', 'High-tech materials and modern luxury watchmaking.', '2026-04-14 18:20:50'),
(6, 'Vacheron Constantin', 1755, 'Switzerland', 'One of the oldest continuously operating maisons.', '2026-04-14 18:20:50');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `favorites`
--

CREATE TABLE `favorites` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `watch_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `watch_id`, `created_at`) VALUES
(1, 1, 1, '2026-04-14 18:20:50'),
(2, 1, 3, '2026-04-14 18:20:50'),
(4, 1, 10, '2026-04-14 18:28:41'),
(5, 1, 4, '2026-04-14 18:28:43'),
(6, 1, 9, '2026-04-14 18:28:44'),
(7, 3, 10, '2026-04-14 18:35:28'),
(8, 3, 3, '2026-04-14 18:35:34'),
(9, 3, 4, '2026-04-14 18:35:36'),
(10, 3, 9, '2026-04-14 18:35:37'),
(11, 3, 6, '2026-04-14 18:35:38'),
(12, 4, 10, '2026-04-14 18:48:01'),
(13, 4, 9, '2026-04-14 18:48:03'),
(14, 4, 4, '2026-04-14 18:48:04'),
(15, 4, 6, '2026-04-14 18:48:03'),
(16, 4, 3, '2026-04-15 06:49:41'),
(17, 4, 11, '2026-04-15 06:49:54'),
(18, 4, 5, '2026-04-15 06:49:56'),
(19, 4, 2, '2026-04-16 06:33:37');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `reviews`
--

CREATE TABLE `reviews` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `watch_id` int UNSIGNED NOT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Daten für Tabelle `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `watch_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 1, 5, 'An absolute masterpiece. The build quality is unmatched, and it looks stunning on the wrist.', '2026-04-14 18:20:50'),
(2, 1, 1, 5, 'Worth every penny. The classic design never goes out of style.', '2026-04-14 18:20:50');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(1, 'Watch Enthusiast', 'demo@chronovault.com', NULL, '2026-04-14 18:20:50'),
(2, 'TestUser', 'test@example.com', '$2y$10$1/y1QWFiRmlahF38Svk4kea/xwKd6jy7hSwcpfYU7MRwN1whZL7eq', '2026-04-14 18:27:54'),
(3, 'it230197', 'samuelfarfeleder1709@gmail.com', '$2y$10$gZpDAE6SPfNxg.A4pwEfNOIDriWmGCZRzKbvtWsG6Uvuu9BFdUTRu', '2026-04-14 18:29:07'),
(4, 'Samuel', 'samuelfarfeleder@gmail.com', '$2y$10$wlaJJu6Jd8F9c439b69f1esVe.f.Us7hLSsqTYmXp0QnKbBNMb396', '2026-04-14 18:47:55');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `watches`
--

CREATE TABLE `watches` (
  `id` int UNSIGNED NOT NULL,
  `brand_id` int UNSIGNED NOT NULL,
  `model` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `production_year` smallint UNSIGNED NOT NULL,
  `price_usd` decimal(12,2) DEFAULT NULL,
  `movement` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pic` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `watches`
--

INSERT INTO `watches` (`id`, `brand_id`, `model`, `production_year`, `price_usd`, `movement`, `description`, `created_at`, `pic`) VALUES
(1, 1, 'Submariner Date', 2023, 14300.00, 'Automatic Caliber 3235', 'The quintessential diving watch with timeless design.', '2026-04-14 18:20:50', 'https://www.rabat.net/media/catalog/product/r/o/rolex-submariner-m126613lb-0002.png\r\n'),
(2, 2, 'Nautilus 5711', 2021, 32000.00, 'Caliber 26-330 S C', 'One of the most iconic luxury sports watches.', '2026-04-14 18:20:50', 'https://assets.hautehorlogerie.org/md/73c77374-274c-5c34-cf9e-1c9f3c4adfdd.png'),
(3, 3, 'Royal Oak', 2022, 27500.00, 'Caliber 4302', 'A benchmark for integrated bracelet sports watches.', '2026-04-14 18:20:50', 'https://assets.hautehorlogerie.org/xl/66c22399-d017-c34b-52b4-b3f9bfe00304.png'),
(4, 4, 'Seamaster Diver 300M', 2023, 6400.00, 'Omega Co-Axial Master Chronometer', 'Professional dive watch with modern engineering.', '2026-04-14 18:20:50', 'https://vonkoeck.com/wp-content/uploads/2024/03/products-118198.png'),
(5, 1, 'Daytona Cosmograph', 2024, 15500.00, 'Caliber 4131', 'Rolex chronograph icon with motorsport DNA.', '2026-04-14 18:20:50', 'https://asset.bucherer.com/image/upload/f_auto,w_1620/Assets/Watches/ROLEX/Rolex/Automatic/m126500ln-0001_FP.webp'),
(6, 2, 'Aquanaut', 2020, 26000.00, 'Caliber 26-330 S C', 'Contemporary luxury sports model by Patek Philippe.', '2026-04-14 18:20:50', 'https://res.cloudinary.com/wc-photo/image/upload/v1707278115/product/3ac12dbd49b6f89dd1cb0945fdf2fb4b/2850869c821d9327910c2144f8de3102.png'),
(7, 5, 'RM 011', 2022, 220000.00, 'Automatic Flyback Chronograph', 'A modern high-tech statement piece by Richard Mille.', '2026-04-14 18:20:50', 'https://amz.luxewatches.co.uk/app/uploads/2021/09/17154552/Richard-Mille-RM-11-01-LW9583-F-4-1.png'),
(8, 6, 'Overseas', 2023, 28000.00, 'Caliber 5100', 'Elegant luxury sports watch from Vacheron Constantin.', '2026-04-14 18:20:50', 'https://www.vacheron-constantin.com/dam/rcq/vac/Ic/V0/Ik/vD/xE/ek/5W/vG/JO/l4/Jw/IcV0IkvDxEek5WvGJOl4Jw.png.transform.vaccard.png'),
(9, 4, 'Speedmaster', 2021, 7200.00, 'Caliber 3861', 'Moonwatch heritage with Master Chronometer movement.', '2026-04-14 18:20:50', 'https://vonkoeck.com/wp-content/uploads/2025/03/119628.png'),
(10, 3, 'Code 11.59', 2024, 30500.00, 'Caliber 4302', 'Modern AP design with high finishing quality.', '2026-04-14 18:20:50', 'https://www.audemarspiguet.com/content/dam/ap/com/products/watches/MTR009695AB/importer/watch.png.transform.appdpmain.png'),
(11, 1, 'Day-Date 40', 2023, 42000.00, 'Caliber 3255', 'Flagship Rolex classic in precious metals.', '2026-04-14 18:20:50', 'https://www.smwild.at/wp-content/uploads/rolex-upload-tool/rolex_watch_assets/upright_watch_assets_landscape/m228239-0033.webp'),
(12, 2, 'Calatrava', 2022, 29000.00, 'Caliber 30-255 PS', 'Classic dress watch with timeless proportions.', '2026-04-14 18:20:50', 'https://www.chronoto.de/uploads/images/f-5/ce7/ff4/f-5ce7ff493243a2.30685795.png');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_brands_name` (`name`);

--
-- Indizes für die Tabelle `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_favorites_user_watch` (`user_id`,`watch_id`),
  ADD KEY `fk_favorites_watch` (`watch_id`);

--
-- Indizes für die Tabelle `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reviews_user` (`user_id`),
  ADD KEY `idx_reviews_watch_created` (`watch_id`,`created_at`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- Indizes für die Tabelle `watches`
--
ALTER TABLE `watches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_watches_brand_model_year` (`brand_id`,`model`,`production_year`),
  ADD KEY `idx_watches_year` (`production_year`),
  ADD KEY `idx_watches_model` (`model`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT für Tabelle `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT für Tabelle `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `watches`
--
ALTER TABLE `watches`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_favorites_watch` FOREIGN KEY (`watch_id`) REFERENCES `watches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_watch` FOREIGN KEY (`watch_id`) REFERENCES `watches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `watches`
--
ALTER TABLE `watches`
  ADD CONSTRAINT `fk_watches_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
