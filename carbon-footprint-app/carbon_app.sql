-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2025 at 02:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `carbon_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `blocks`
--

CREATE TABLE `blocks` (
  `blocker_id` int(10) UNSIGNED NOT NULL,
  `blocked_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friendships`
--

CREATE TABLE `friendships` (
  `user_id_low` int(10) UNSIGNED NOT NULL,
  `user_id_high` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `friendships`
--

INSERT INTO `friendships` (`user_id_low`, `user_id_high`, `created_at`) VALUES
(4, 5, '2025-09-16 02:31:32');

--
-- Triggers `friendships`
--
DELIMITER $$
CREATE TRIGGER `friendships_bi_norm` BEFORE INSERT ON `friendships` FOR EACH ROW BEGIN
  IF NEW.user_id_low = NEW.user_id_high THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot friend yourself';
  END IF;
  IF NEW.user_id_low > NEW.user_id_high THEN
    SET @tmp := NEW.user_id_low;
    SET NEW.user_id_low  = NEW.user_id_high;
    SET NEW.user_id_high = @tmp;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `friendships_bu_norm` BEFORE UPDATE ON `friendships` FOR EACH ROW BEGIN
  IF NEW.user_id_low = NEW.user_id_high THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot friend yourself';
  END IF;
  IF NEW.user_id_low > NEW.user_id_high THEN
    SET @tmp := NEW.user_id_low;
    SET NEW.user_id_low  = NEW.user_id_high;
    SET NEW.user_id_high = @tmp;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `friend_requests`
--

CREATE TABLE `friend_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `requester_id` int(10) UNSIGNED NOT NULL,
  `addressee_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','declined','canceled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `responded_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `friend_requests`
--

INSERT INTO `friend_requests` (`id`, `requester_id`, `addressee_id`, `status`, `created_at`, `responded_at`) VALUES
(4, 4, 2, 'pending', '2025-09-16 02:08:19', NULL),
(7, 6, 2, 'pending', '2025-09-16 02:08:38', NULL),
(9, 3, 2, 'pending', '2025-09-16 02:09:06', NULL),
(10, 5, 2, 'pending', '2025-09-16 02:09:27', NULL),
(14, 4, 6, 'pending', '2025-09-16 02:28:25', NULL),
(16, 4, 3, 'pending', '2025-09-16 02:28:26', NULL),
(17, 5, 6, 'pending', '2025-09-16 02:29:00', NULL),
(18, 5, 3, 'pending', '2025-09-16 02:29:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `units` enum('kg','lb') NOT NULL DEFAULT 'kg',
  `privacy_public` tinyint(1) NOT NULL DEFAULT 0,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `units`, `privacy_public`, `password`, `created_at`, `updated_at`) VALUES
(2, 'fin shaw', 'x3n80@students.keele.ac.uk', 'kg', 0, '$2y$10$fLdVLtyJe0wXtik2I4sWCeZH1odeX9rj1/4bbu6O9rtGmVjuOR3D2', '2025-08-09 01:42:17', '2025-08-09 01:42:17'),
(3, 'Finlay Shaw', 'shawjonfin1@gmail.com', 'lb', 0, '$2y$10$fAvDfMpfOqRl0BUfKtfNOeoNco3uEccQ8anKjeNe8gNLTMPK2C6Ku', '2025-08-09 23:08:29', '2025-08-09 23:17:18'),
(4, 'Finlay john', 'shawfinlay02@gmail.com', 'kg', 1, '$2y$10$.CP6hh1rkFKeSCfqfM9x6uG7PQhpFecQCDBS9wJG5ZE86dsbynwXe', '2025-08-09 23:26:44', '2025-09-16 02:48:33'),
(5, 'Finlay Shaw', 'fin@gmail.com', 'kg', 1, '$2y$10$vrtEHzCHB2rfMLbEUN/..ePdr5VytTWv7K7s9Gk0iAHc3/QS3Xgri', '2025-09-13 05:06:11', '2025-10-02 01:40:40'),
(6, 'shaw fin', 'shaw@gmail.com', 'kg', 0, '$2y$10$I5aIFf/HPOIQhVjtJl1EeeT8CdVt3eUrjfIpJHks4xhkdS0cSUcv.', '2025-09-13 05:06:38', '2025-09-13 05:06:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_activities`
--

CREATE TABLE `user_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `activity_id` varchar(64) NOT NULL,
  `activity_name` varchar(150) NOT NULL,
  `category` varchar(40) NOT NULL,
  `type` varchar(30) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `emission_factor` decimal(12,6) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `emissions_kg_co2e` decimal(12,3) GENERATED ALWAYS AS (`quantity` * `emission_factor`) STORED,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `occurred_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_activities`
--

INSERT INTO `user_activities` (`id`, `user_id`, `activity_id`, `activity_name`, `category`, `type`, `unit`, `emission_factor`, `quantity`, `meta`, `occurred_at`, `created_at`, `updated_at`) VALUES
(19, 4, 'business_travel_air_with_rf_passengerkm', 'Fly with Radiative Forcing', 'business_travel_air', 'general', 'passenger.km', 0.222551, 5.000, '[]', '2025-08-09 23:51:44', '2025-08-09 23:51:44', '2025-08-09 23:51:44'),
(20, 4, 'iron_clothes_per_hour', 'Iron Clothes', 'general', 'general', 'hours', 0.424800, 5.000, '[]', '2025-08-09 23:51:47', '2025-08-09 23:51:47', '2025-08-09 23:51:47'),
(21, 4, 'dish_handwash_hot_per_min', 'Handwash Dishes with Hot Water', 'general', 'general', 'minutes', 0.202510, 5.000, '[]', '2025-08-09 23:51:51', '2025-08-09 23:51:51', '2025-08-09 23:51:51'),
(22, 4, 'food_bagels', 'Eat Bagels', 'food', 'ate', 'kg', 0.802813, 5.000, '[]', '2025-08-09 23:51:53', '2025-08-09 23:51:53', '2025-08-09 23:51:53'),
(23, 4, 'food_bagels', 'Eat Bagels', 'food', 'ate', 'kg', 0.802813, 5.000, '[]', '2025-08-09 23:51:53', '2025-08-09 23:51:53', '2025-08-09 23:51:53'),
(24, 4, 'food_chicken_wings', 'Eat Chicken wings', 'food', 'ate', 'kg', 9.583456, 2.000, '[]', '2025-08-09 23:51:56', '2025-08-09 23:51:56', '2025-08-09 23:51:56'),
(25, 4, 'food_eggs', 'Eat Eggs', 'food', 'ate', 'kg', 4.436600, 2.000, '[]', '2025-08-09 23:51:59', '2025-08-09 23:51:59', '2025-08-09 23:51:59'),
(26, 4, 'food_lettuce', 'Eat Lettuce', 'food', 'ate', 'kg', 4.926023, 2.000, '[]', '2025-08-09 23:52:01', '2025-08-09 23:52:01', '2025-08-09 23:52:01'),
(27, 4, 'food_pitta_bread', 'Eat Pitta bread', 'food', 'ate', 'kg', 0.563561, 2.000, '[]', '2025-08-09 23:52:04', '2025-08-09 23:52:04', '2025-08-09 23:52:04'),
(28, 4, 'food_salmon_fishcakes', 'Eat Salmon fishcakes', 'food', 'ate', 'kg', 6.505735, 7.000, '[]', '2025-08-09 23:52:08', '2025-08-09 23:52:08', '2025-08-09 23:52:08'),
(29, 4, 'food_tuna', 'Eat Tuna', 'food', 'ate', 'kg', 13.075355, 5.000, '[]', '2025-08-09 23:52:12', '2025-08-09 23:52:12', '2025-08-09 23:52:12'),
(30, 4, 'passenger_vehicles_diesel_km', 'Drive a diesel car', 'passenger_vehicles', 'general', 'km', 0.301111, 50.000, '[]', '2025-08-11 02:05:01', '2025-08-11 02:05:01', '2025-08-11 02:05:01'),
(31, 4, 'passenger_vehicles_petrol_km', 'Drive a petrol car', 'passenger_vehicles', 'general', 'km', 0.342733, 5.000, '[]', '2025-08-11 02:05:21', '2025-08-11 02:05:21', '2025-08-11 02:05:21'),
(32, 4, 'uk_electricity_for_evs_plugin_hybrid_car', 'Drive a plug-in hybrid', 'uk_electricity_for_evs', 'general', 'km', 0.023359, 5.000, '[]', '2025-08-11 02:05:23', '2025-08-11 02:05:23', '2025-08-11 02:05:23'),
(33, 4, 'delivery_vehicles_petrol_kgkm', 'Receive a delivery (petrol van)', 'delivery_vehicles', 'general', 'kg·km', 0.000864, 50.000, '[]', '2025-08-11 02:05:46', '2025-08-11 02:05:46', '2025-08-11 02:05:46'),
(34, 4, 'food_beef_mince', 'Eat Beef mince', 'food', 'ate', 'kg', 95.034572, 5.000, '[]', '2025-08-11 04:05:10', '2025-08-11 04:05:10', '2025-08-11 04:05:10'),
(35, 4, 'food_cashew_nuts', 'Eat Cashew nuts', 'food', 'ate', 'kg', 2.087644, 5.000, '[]', '2025-08-11 04:05:13', '2025-08-11 04:05:13', '2025-08-11 04:05:13'),
(36, 4, 'food_croissants', 'Eat Croissants', 'food', 'ate', 'kg', 1.682228, 5.000, '[]', '2025-08-11 04:05:15', '2025-08-11 04:05:15', '2025-08-11 04:05:15'),
(37, 4, 'food_haddock_risotto', 'Eat Haddock risotto', 'food', 'ate', 'kg', 4.898891, 5.000, '[]', '2025-08-11 04:05:17', '2025-08-11 04:05:17', '2025-08-11 04:05:17'),
(38, 4, 'food_melon', 'Eat Melon', 'food', 'ate', 'kg', 1.056536, 5.000, '[]', '2025-08-11 04:05:20', '2025-08-11 04:05:20', '2025-08-11 04:05:20'),
(39, 4, 'food_salmon', 'Eat Salmon', 'food', 'ate', 'kg', 10.412581, 5.000, '[]', '2025-08-11 04:05:22', '2025-08-11 04:05:22', '2025-08-11 04:05:22'),
(40, 4, 'food_chocolate_cereals', 'Eat Chocolate cereals', 'food', 'ate', 'kg', 2.877626, 5.000, '[]', '2025-08-11 04:05:48', '2025-08-11 04:05:48', '2025-08-11 04:05:48'),
(41, 4, 'food_cottage_cheese', 'Eat Cottage cheese', 'food', 'ate', 'kg', 25.278503, 5.000, '[]', '2025-08-11 04:05:50', '2025-08-11 04:05:50', '2025-08-11 04:05:50'),
(42, 4, 'food_chocolate_cake', 'Eat Chocolate cake', 'food', 'ate', 'kg', 3.952118, 5.000, '[]', '2025-08-11 04:05:53', '2025-08-11 04:05:53', '2025-08-11 04:05:53'),
(43, 4, 'food_chocolate_biscuits', 'Eat Chocolate biscuits', 'food', 'ate', 'kg', 5.083679, 5.000, '[]', '2025-08-12 04:05:55', '2025-08-12 04:05:55', '2025-08-12 04:05:55'),
(44, 4, 'food_cracker_biscuits', 'Eat Cracker biscuits', 'food', 'ate', 'kg', 2.448466, 5.000, '[]', '2025-08-11 04:05:58', '2025-08-11 04:05:58', '2025-08-11 04:05:58'),
(45, 4, 'food_crisps', 'Eat Crisps', 'food', 'ate', 'kg', 3.031724, 5.000, '[]', '2025-08-11 04:06:00', '2025-08-11 04:06:00', '2025-08-11 04:06:00'),
(46, 4, 'food_croissants', 'Eat Croissants', 'food', 'ate', 'kg', 1.682228, 5.000, '[]', '2025-08-11 04:06:02', '2025-08-11 04:06:02', '2025-08-11 04:06:02'),
(47, 4, 'food_dairy-free_ice_cream', 'Eat Dairy-free ice cream', 'food', 'ate', 'kg', 2.451197, 5.000, '[]', '2025-08-11 04:06:04', '2025-08-11 04:06:04', '2025-08-11 04:06:04'),
(48, 4, 'food_dark_chocolate', 'Eat Dark chocolate', 'food', 'ate', 'kg', 20.620037, 5.000, '[]', '2025-08-11 04:06:06', '2025-08-11 04:06:06', '2025-08-11 04:06:06'),
(49, 4, 'food_doughnuts', 'Eat Doughnuts', 'food', 'ate', 'kg', 2.199665, 5.000, '[]', '2025-08-11 04:06:08', '2025-08-11 04:06:08', '2025-08-11 04:06:08'),
(50, 4, 'food_egg_noodles', 'Eat Egg noodles', 'food', 'ate', 'kg', 1.381512, 5.000, '[]', '2025-08-11 04:06:10', '2025-08-11 04:06:10', '2025-08-11 04:06:10'),
(51, 4, 'food_granola', 'Eat Granola', 'food', 'ate', 'kg', 1.781193, 5.000, '[]', '2025-08-11 04:06:13', '2025-08-11 04:06:13', '2025-08-11 04:06:13'),
(52, 4, 'food_goats_cheese', 'Eat Goat\'s cheese', 'food', 'ate', 'kg', 19.312073, 5.000, '[]', '2025-08-11 04:06:16', '2025-08-11 04:06:16', '2025-08-11 04:06:16'),
(53, 4, 'food_garden_peas', 'Eat Garden peas', 'food', 'ate', 'kg', 1.003837, 5.000, '[]', '2025-08-11 04:06:19', '2025-08-11 04:06:19', '2025-08-11 04:06:19'),
(54, 4, 'food_fruit_cake', 'Eat Fruit cake', 'food', 'ate', 'kg', 3.452116, 5.000, '[]', '2025-08-11 04:06:21', '2025-08-11 04:06:21', '2025-08-11 04:06:21'),
(55, 4, 'food_ice_cream', 'Eat Ice cream', 'food', 'ate', 'kg', 3.661809, 5.000, '[]', '2025-08-11 04:06:23', '2025-08-11 04:06:23', '2025-08-11 04:06:23'),
(56, 4, 'food_halloumi_cheese', 'Eat Halloumi cheese', 'food', 'ate', 'kg', 16.172452, 5.000, '[]', '2025-08-11 04:06:24', '2025-08-11 04:06:24', '2025-08-11 04:06:24'),
(57, 4, 'food_haddock_risotto', 'Eat Haddock risotto', 'food', 'ate', 'kg', 4.898891, 5.000, '[]', '2025-08-11 04:06:26', '2025-08-11 04:06:26', '2025-08-11 04:06:26'),
(58, 4, 'food_grapes', 'Eat Grapes', 'food', 'ate', 'kg', 8.278876, 5.000, '[]', '2025-08-11 04:06:29', '2025-08-11 04:06:29', '2025-08-11 04:06:29'),
(59, 4, 'food_lamb_curry', 'Eat Lamb curry', 'food', 'ate', 'kg', 10.192565, 5.000, '[]', '2025-08-11 04:06:30', '2025-08-11 04:06:30', '2025-08-11 04:06:30'),
(60, 4, 'food_lamb_chops', 'Eat Lamb chops', 'food', 'ate', 'kg', 30.901993, 5.000, '[]', '2025-08-11 04:06:32', '2025-08-11 04:06:32', '2025-08-11 04:06:32'),
(61, 4, 'shower_hot_per_min', 'Take a Hot Shower', 'general', 'general', 'minutes', 1.115584, 100.000, '[]', '2025-09-09 04:41:04', '2025-09-09 04:41:04', '2025-09-09 04:41:04'),
(62, 4, 'shower_hot_per_min', 'Take a Hot Shower', 'general', 'general', 'minutes', 1.115584, 4.000, '[]', '2025-09-13 01:24:04', '2025-09-13 01:24:04', '2025-09-13 01:24:04'),
(63, 4, 'use_tv_per_min', 'Watch TV', 'general', 'general', 'minutes', 0.001770, 4.000, '[]', '2025-09-13 01:24:07', '2025-09-13 01:24:07', '2025-09-13 01:24:07'),
(64, 4, 'vacuum_clean_per_room', 'Vacuum a Room', 'general', 'general', 'uses', 0.053100, 4.000, '[]', '2025-09-13 01:24:11', '2025-09-13 01:24:11', '2025-09-13 01:24:11'),
(65, 4, 'vacuum_clean_per_room', 'Vacuum a Room', 'general', 'general', 'uses', 0.053100, 4.000, '[]', '2025-09-13 01:24:11', '2025-09-13 01:24:11', '2025-09-13 01:24:11'),
(66, 4, 'uk_electricity_for_evs_electric_freight_bev', 'Electric freight (BEV)', 'uk_electricity_for_evs', 'general', 'tonne.km', 0.180818, 4.000, '[]', '2025-09-13 01:24:14', '2025-09-13 01:24:14', '2025-09-13 01:24:14'),
(67, 4, 'food_apple_juice', 'Drink Apple juice', 'food', 'drank', 'litres', 0.458378, 4.000, '[]', '2025-09-13 01:24:17', '2025-09-13 01:24:17', '2025-09-13 01:24:17'),
(68, 4, 'business_travel_air_without_rf_passengerkm', 'Fly without Radiative Forcing', 'business_travel_air', 'general', 'passenger.km', 0.131581, 5.000, '[]', '2025-09-16 02:11:26', '2025-09-16 02:11:26', '2025-09-16 02:11:26'),
(69, 4, 'delivery_vehicles_electric_van_kgkm', 'Receive a delivery (electric van)', 'delivery_vehicles', 'general', 'kg·km', 0.000234, 275.000, '[]', '2025-09-16 02:11:30', '2025-09-16 02:11:30', '2025-09-16 02:11:30'),
(70, 4, 'boil_kettle_full', 'Boil Electric Kettle (Full 1.5L)', 'general', 'general', 'uses', 0.017700, 5.000, '[]', '2025-09-16 02:11:34', '2025-09-16 02:11:34', '2025-09-16 02:11:34'),
(71, 4, 'microwave_per_min', 'Use Microwave', 'general', 'general', 'minutes', 0.017700, 5.000, '[]', '2025-09-16 02:11:38', '2025-09-16 02:11:38', '2025-09-16 02:11:38'),
(72, 4, 'hair_straighteners_10min', 'Use Hair Straighteners', 'general', 'general', '10 minutes', 0.017700, 5.000, '[]', '2025-09-16 02:11:41', '2025-09-16 02:11:41', '2025-09-16 02:11:41'),
(73, 4, 'passenger_vehicles_petrol_km', 'Drive a petrol car', 'passenger_vehicles', 'general', 'km', 0.342733, 5.000, '[]', '2025-09-16 02:11:43', '2025-09-16 02:11:43', '2025-09-16 02:11:43'),
(74, 5, 'business_travel_air_without_rf_passengerkm', 'Fly without Radiative Forcing', 'business_travel_air', 'general', 'passenger.km', 0.131581, 5.000, '[]', '2025-09-16 02:32:22', '2025-09-16 02:32:22', '2025-09-16 02:32:22'),
(75, 5, 'shower_hot_per_min', 'Take a Hot Shower', 'general', 'general', 'minutes', 1.115584, 5.000, '[]', '2025-09-16 02:32:24', '2025-09-16 02:32:24', '2025-09-16 02:32:24'),
(76, 5, 'shower_hot_per_min', 'Take a Hot Shower', 'general', 'general', 'minutes', 1.115584, 5.000, '[]', '2025-09-16 02:32:25', '2025-09-16 02:32:25', '2025-09-16 02:32:25'),
(77, 5, 'shower_hot_per_min', 'Take a Hot Shower', 'general', 'general', 'minutes', 1.115584, 5.000, '[]', '2025-09-16 02:32:26', '2025-09-16 02:32:26', '2025-09-16 02:32:26'),
(78, 5, 'brush_teeth_tap_per_min', 'Brush Teeth with Tap Running', 'general', 'general', 'minutes', 0.543809, 5.000, '[]', '2025-09-16 02:32:28', '2025-09-16 02:32:28', '2025-09-16 02:32:28'),
(79, 5, 'hair_straighteners_10min', 'Use Hair Straighteners', 'general', 'general', '10 minutes', 0.017700, 5.000, '[]', '2025-09-16 02:32:30', '2025-09-16 02:32:30', '2025-09-16 02:32:30'),
(80, 5, 'streaming_video_per_hour', 'Stream Video Content', 'general', 'general', 'hours', 0.002655, 5.000, '[]', '2025-09-16 02:32:33', '2025-09-16 02:32:33', '2025-09-16 02:32:33'),
(81, 5, 'hotel_stay_unspecified_room_per_night', 'Stay in a hotel', 'hotel_stay', 'general', 'Room per night', 38.782051, 5.000, '[]', '2025-09-16 02:32:35', '2025-09-16 02:32:35', '2025-09-16 02:32:35'),
(82, 5, 'waste_disposal_openloop_kilograms', 'Recycle (open-loop)', 'waste_disposal', 'general', 'kilograms', 0.003920, 5.000, '[]', '2025-09-16 02:32:38', '2025-09-16 02:32:38', '2025-09-16 02:32:38'),
(83, 5, 'food_almond_butter', 'Eat Almond butter', 'food', 'ate', 'kg', 0.387011, 5.000, '[]', '2025-09-16 02:32:40', '2025-09-16 02:32:40', '2025-09-16 02:32:40'),
(84, 5, 'food_beef_noodles', 'Eat Beef noodles', 'food', 'ate', 'kg', 2.290114, 5.000, '[]', '2025-09-16 02:32:42', '2025-09-16 02:32:42', '2025-09-16 02:32:42'),
(85, 5, 'food_cereal_bars', 'Eat Cereal bars', 'food', 'ate', 'kg', 2.853384, 5.000, '[]', '2025-09-16 02:32:45', '2025-09-16 02:32:45', '2025-09-16 02:32:45'),
(86, 5, 'food_coconut_oil', 'Use Coconut oil', 'food', 'used', 'kg', 0.528741, 5.000, '[]', '2025-09-16 02:32:48', '2025-09-16 02:32:48', '2025-09-16 02:32:48'),
(87, 5, 'food_eggs', 'Eat Eggs', 'food', 'ate', 'kg', 4.436600, 5.000, '[]', '2025-09-16 02:32:51', '2025-09-16 02:32:51', '2025-09-16 02:32:51'),
(88, 5, 'business_travel_sea_unspecified_passengerkm', 'Sail', 'business_travel_sea', 'general', 'passenger.km', 0.086913, 5.000, '[]', '2025-10-02 01:41:10', '2025-10-02 01:41:10', '2025-10-02 01:41:10'),
(89, 5, 'oven_electric_per_min', 'Use Electric Oven', 'general', 'general', 'minutes', 0.008850, 5.000, '[]', '2025-10-02 01:41:13', '2025-10-02 01:41:13', '2025-10-02 01:41:13'),
(90, 5, 'uk_electricity_for_evs_electric_freight_bev', 'Electric freight (BEV)', 'uk_electricity_for_evs', 'general', 'tonne.km', 0.180818, 5.000, '[]', '2025-10-02 01:41:16', '2025-10-02 01:41:16', '2025-10-02 01:41:16'),
(91, 5, 'food_biscuits', 'Eat Biscuits', 'food', 'ate', 'kg', 3.989251, 5.000, '[]', '2025-10-02 01:41:19', '2025-10-02 01:41:19', '2025-10-02 01:41:19'),
(92, 5, 'food_chicken_noodles', 'Eat Chicken noodles', 'food', 'ate', 'kg', 2.383996, 5.000, '[]', '2025-10-02 01:41:22', '2025-10-02 01:41:22', '2025-10-02 01:41:22'),
(93, 5, 'food_cracker_biscuits', 'Eat Cracker biscuits', 'food', 'ate', 'kg', 2.448466, 5.000, '[]', '2025-10-02 01:41:24', '2025-10-02 01:41:24', '2025-10-02 01:41:24'),
(94, 5, 'food_lamb_hotpot', 'Eat Lamb Hotpot', 'food', 'ate', 'kg', 11.226254, 5.000, '[]', '2025-10-02 01:41:26', '2025-10-02 01:41:26', '2025-10-02 01:41:26'),
(95, 5, 'food_parmesan_cheese', 'Eat Parmesan cheese', 'food', 'ate', 'kg', 24.016480, 5.000, '[]', '2025-10-02 01:41:29', '2025-10-02 01:41:29', '2025-10-02 01:41:29'),
(96, 5, 'food_spaghetti_bolognese', 'Eat Spaghetti bolognese', 'food', 'ate', 'kg', 7.834703, 5.000, '[]', '2025-10-02 01:41:31', '2025-10-02 01:41:31', '2025-10-02 01:41:31'),
(97, 5, 'food_sugar', 'Eat Sugar', 'food', 'ate', 'kg', 1.851686, 5.000, '[]', '2025-10-02 01:41:33', '2025-10-02 01:41:33', '2025-10-02 01:41:33'),
(98, 4, 'business_travel_air_with_rf_passengerkm', 'Fly with Radiative Forcing', 'business_travel_air', 'general', 'passenger.km', 0.222551, 5.000, '[]', '2025-10-03 04:00:44', '2025-10-03 04:00:44', '2025-10-03 04:00:44'),
(99, 4, 'vacuum_clean_per_room', 'Vacuum a Room', 'general', 'general', 'uses', 0.053100, 5.000, '[]', '2025-10-03 04:00:46', '2025-10-03 04:00:46', '2025-10-03 04:00:46'),
(100, 4, 'passenger_vehicles_cng_km', 'Drive a CNG car', 'passenger_vehicles', 'general', 'km', 0.338897, 5.000, '[]', '2025-10-03 04:00:49', '2025-10-03 04:00:49', '2025-10-03 04:00:49'),
(101, 4, 'food_beef_meatballs', 'Eat Beef meatballs', 'food', 'ate', 'kg', 70.787474, 5.000, '[]', '2025-10-03 04:00:51', '2025-10-03 04:00:51', '2025-10-03 04:00:51'),
(102, 4, 'food_chicken_burger', 'Eat Chicken burger', 'food', 'ate', 'kg', 5.434487, 5.000, '[]', '2025-10-03 04:00:54', '2025-10-03 04:00:54', '2025-10-03 04:00:54'),
(103, 4, 'food_chicken_burger', 'Eat Chicken burger', 'food', 'ate', 'kg', 5.434487, 5.000, '[]', '2025-10-03 04:00:54', '2025-10-03 04:00:54', '2025-10-03 04:00:54'),
(104, 4, 'food_falafels', 'Eat Falafels', 'food', 'ate', 'kg', 1.098106, 5.000, '[]', '2025-10-03 04:00:56', '2025-10-03 04:00:56', '2025-10-03 04:00:56'),
(105, 4, 'food_meat-free_burger', 'Eat Meat-free burger', 'food', 'ate', 'kg', 1.018329, 5.000, '[]', '2025-10-03 04:00:59', '2025-10-03 04:00:59', '2025-10-03 04:00:59'),
(106, 4, 'food_potatoes', 'Eat Potatoes', 'food', 'ate', 'kg', 0.207276, 5.000, '[]', '2025-10-03 04:01:01', '2025-10-03 04:01:01', '2025-10-03 04:01:01');

-- --------------------------------------------------------

--
-- Table structure for table `user_goals`
--

CREATE TABLE `user_goals` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `type` enum('cap') NOT NULL DEFAULT 'cap',
  `period` enum('week','month','year') NOT NULL,
  `category` varchar(40) DEFAULT NULL,
  `target_kg` decimal(12,3) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_goals`
--

INSERT INTO `user_goals` (`id`, `user_id`, `name`, `type`, `period`, `category`, `target_kg`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 4, 'Reduce transport', 'cap', 'month', 'passenger_vehicles', 22.680, 1, '2025-08-11 02:04:30', '2025-08-11 02:04:30'),
(2, 4, 'general', 'cap', 'month', 'general', 22.680, 1, '2025-08-11 02:06:22', '2025-08-11 02:06:22'),
(3, 4, 'food', 'cap', 'month', 'food', 2.268, 1, '2025-08-11 02:06:31', '2025-08-11 02:06:31');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_user_friends`
-- (See below for the actual view)
--
CREATE TABLE `v_user_friends` (
`user_id` int(10) unsigned
,`friend_id` int(10) unsigned
,`created_at` datetime
);

-- --------------------------------------------------------

--
-- Structure for view `v_user_friends`
--
DROP TABLE IF EXISTS `v_user_friends`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_user_friends`  AS SELECT `f`.`user_id_low` AS `user_id`, `f`.`user_id_high` AS `friend_id`, `f`.`created_at` AS `created_at` FROM `friendships` AS `f`union all select `f`.`user_id_high` AS `user_id`,`f`.`user_id_low` AS `friend_id`,`f`.`created_at` AS `created_at` from `friendships` `f`  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blocks`
--
ALTER TABLE `blocks`
  ADD PRIMARY KEY (`blocker_id`,`blocked_id`),
  ADD KEY `idx_blocked_lookup` (`blocked_id`);

--
-- Indexes for table `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`user_id_low`,`user_id_high`),
  ADD KEY `idx_friend_low` (`user_id_low`),
  ADD KEY `idx_friend_high` (`user_id_high`);

--
-- Indexes for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_fr_pair` (`requester_id`,`addressee_id`),
  ADD KEY `idx_fr_incoming` (`addressee_id`,`status`,`created_at`),
  ADD KEY `idx_fr_outgoing` (`requester_id`,`status`,`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_name` (`name`);

--
-- Indexes for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_activity_user` (`user_id`);

--
-- Indexes for table `user_goals`
--
ALTER TABLE `user_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_goals_user` (`user_id`),
  ADD KEY `idx_goals_category` (`category`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `friend_requests`
--
ALTER TABLE `friend_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_activities`
--
ALTER TABLE `user_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `user_goals`
--
ALTER TABLE `user_goals`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blocks`
--
ALTER TABLE `blocks`
  ADD CONSTRAINT `fk_blocks_blocked` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_blocks_blocker` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `friendships`
--
ALTER TABLE `friendships`
  ADD CONSTRAINT `fk_friend_high` FOREIGN KEY (`user_id_high`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_friend_low` FOREIGN KEY (`user_id_low`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD CONSTRAINT `fk_fr_req_addressee` FOREIGN KEY (`addressee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fr_req_requester` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD CONSTRAINT `fk_user_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_goals`
--
ALTER TABLE `user_goals`
  ADD CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
