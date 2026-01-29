-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: silab_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target` int NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'klien',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'Pendatang Baru','Login pertama kali ke aplikasi','login',1,'klien','2026-01-28 11:23:01','2026-01-28 11:23:01'),(2,'Warga Tetap','Telah login sebanyak 50 kali','login',50,'klien','2026-01-28 11:23:01','2026-01-28 11:23:01'),(3,'Order Pertama','Berhasil membuat pesanan pertama','orders',1,'klien','2026-01-28 11:23:01','2026-01-28 11:23:01'),(4,'Pelanggan Setia','Telah membuat 10 pesanan','orders',10,'klien','2026-01-28 11:23:01','2026-01-28 11:23:01'),(5,'Sultan','Telah membuat 50 pesanan','orders',50,'klien','2026-01-28 11:23:01','2026-01-28 11:23:01');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analysis_prices`
--

DROP TABLE IF EXISTS `analysis_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analysis_prices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `jenis_analisis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `harga` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Metabolit',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analysis_prices`
--

LOCK TABLES `analysis_prices` WRITE;
/*!40000 ALTER TABLE `analysis_prices` DISABLE KEYS */;
INSERT INTO `analysis_prices` VALUES (1,'Glukosa',40000,NULL,NULL,'Metabolit'),(2,'Total Protein',40000,NULL,NULL,'Metabolit'),(3,'Albumin',40000,NULL,NULL,'Metabolit'),(4,'Trigliserida',65000,NULL,NULL,'Metabolit'),(5,'Kolestrol',55000,NULL,NULL,'Metabolit'),(6,'HDL-kol',90000,NULL,NULL,'Metabolit'),(7,'LDL-kol',110000,NULL,NULL,'Metabolit'),(8,'Urea/BUN',40000,NULL,NULL,'Metabolit'),(9,'Kreatinin',40000,NULL,NULL,'Metabolit'),(10,'Kalsium',50000,NULL,NULL,'Metabolit'),(11,'BDM',25000,NULL,NULL,'Hematologi'),(12,'BDP',25000,NULL,NULL,'Hematologi'),(13,'Hemoglobin Darah',15000,NULL,NULL,'Hematologi'),(14,'Hematokrit',15000,NULL,NULL,'Hematologi'),(15,'Diferensiasi Leukosit',30000,NULL,NULL,'Hematologi');
/*!40000 ALTER TABLE `analysis_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_analysis_items`
--

DROP TABLE IF EXISTS `booking_analysis_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_analysis_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `nama_item` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','revised') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `hasil` text COLLATE utf8mb4_unicode_ci,
  `metode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_analisis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_analysis_items_booking_id_foreign` (`booking_id`),
  CONSTRAINT `booking_analysis_items_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_analysis_items`
--

LOCK TABLES `booking_analysis_items` WRITE;
/*!40000 ALTER TABLE `booking_analysis_items` DISABLE KEYS */;
INSERT INTO `booking_analysis_items` VALUES (1,1,'BDM','pending','[HMMET-DOM-260129-01]: INPUT=1000 HASIL=10.00 (10⁶/µL)','Spectrophotometer','hematologi dan metabolit','2026-01-28 12:38:22','2026-01-28 12:40:15'),(2,1,'HDL-kol','pending','[HMMET-DOM-260129-01]: STD=1000 SPL=1000 HASIL=50.00 mg/dL','Spectrophotometer','hematologi dan metabolit','2026-01-28 12:38:22','2026-01-28 12:40:16'),(4,3,'Albumin','pending',NULL,NULL,NULL,'2026-01-28 13:44:41','2026-01-28 13:44:41'),(12,11,'Total Protein','pending',NULL,NULL,NULL,'2026-01-28 14:47:39','2026-01-28 14:47:39'),(14,13,'Glukosa','pending','[MET-KAM-260130-01]: STD=1000 SPL=1 HASIL=0.11 mg/dL','Spectrophotometer','metabolit','2026-01-28 14:55:10','2026-01-28 15:01:45');
/*!40000 ALTER TABLE `booking_analysis_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `kode_sampel` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `kode_batch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis_analisis` enum('hematologi','metabolit','hematologi dan metabolit') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_kirim` date NOT NULL,
  `status` enum('menunggu','disetujui','ditolak','proses','selesai','dibatalkan','menunggu_verifikasi','menunggu_ttd','menunggu_ttd_koordinator','menunggu_sign','ditandatangani','menunggu_verifikasi_kepala','menunggu_pembayaran','ditolak_kepala','dikirim_ke_teknisi','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menunggu',
  `status_updated_at` timestamp NULL DEFAULT NULL,
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_proof_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alasan_penolakan` text COLLATE utf8mb4_unicode_ci,
  `alasan_tolak` text COLLATE utf8mb4_unicode_ci,
  `alasan_teknisi` text COLLATE utf8mb4_unicode_ci,
  `jenis_hewan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_hewan_lain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis_kelamin` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `umur` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_fisiologis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_sampel` int NOT NULL,
  `hasil_analisis` text COLLATE utf8mb4_unicode_ci,
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_user_id_foreign` (`user_id`),
  CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,5,'[\"HMMET-DOM-260129-01\"]','HMMET-DOM-260129-771','hematologi dan metabolit','2026-01-29','selesai','2026-01-28 12:52:15','hasil_pdfs/6m8rh0VR7E18StJVq0kaByWh0vwirPBocRA59Aqi.pdf','payment_proofs/PpAY9AsxBTI9VUPSGEGeELesQbdtesm7wdBVA0Z8.jpg',NULL,NULL,NULL,'Domba',NULL,'Jantan','2 Tahun','Bunting/Hamil',1,NULL,1,'2026-01-28 12:38:22','2026-01-28 12:52:15'),(3,5,'[\"MET-BEB-260130-01\"]','MET-BEB-260130-F8B','metabolit','2026-01-30','ditolak','2026-01-28 13:47:52',NULL,NULL,'sampel rusak',NULL,NULL,'Bebek',NULL,'Jantan','2 Tahun','Tidak Bunting/Tidak Hamil',1,NULL,0,'2026-01-28 13:44:41','2026-01-28 13:47:53'),(11,5,'[\"MET-KAM-260130-01\"]','MET-KAM-260130-9BE','metabolit','2026-01-30','ditolak','2026-01-28 14:48:12',NULL,NULL,'tutup',NULL,NULL,'Kambing',NULL,'Betina','2 Tahun','Bunting/Hamil',1,NULL,0,'2026-01-28 14:47:39','2026-01-28 14:48:13'),(13,5,'[\"MET-KAM-260130-01\"]','MET-KAM-260130-335','metabolit','2026-01-30','selesai','2026-01-28 15:06:59','hasil_pdfs/c2H3HwVAo5UbpveLACzdXW1e8gc2Tfj4mAB1i9Jv.pdf','payment_proofs/UFYXqUPqpVxczygaQUrzxzusnuTTIjPB2waWmNUF.png',NULL,'nilai nya masih salah','nilai nya masih salah','Kambing',NULL,'Jantan','2 Tahun','Bunting/Hamil',1,NULL,1,'2026-01-28 14:55:10','2026-01-28 15:06:59');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba','i:5;',1769630786),('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer','i:1769630786;',1769630786),('laravel-cache-admin.ipb|127.0.0.1','i:1;',1769638713),('laravel-cache-admin.ipb|127.0.0.1:timer','i:1769638713;',1769638713);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `booking_id` bigint unsigned DEFAULT NULL,
  `amount` bigint NOT NULL DEFAULT '0',
  `due_date` date DEFAULT NULL,
  `status` enum('DRAFT','UNPAID','PAID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `payment_proof_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `confirmed_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  KEY `invoices_user_id_foreign` (`user_id`),
  KEY `invoices_booking_id_foreign` (`booking_id`),
  KEY `invoices_confirmed_by_foreign` (`confirmed_by`),
  CONSTRAINT `invoices_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_confirmed_by_foreign` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-HMMET-DOM-260129-771',5,1,115000,'2026-02-04','PAID',NULL,'2026-01-28 12:52:15',NULL,'2026-01-28 12:44:46','2026-01-28 12:52:15'),(2,'INV-MET-KAM-260130-335',5,13,40000,'2026-02-04','PAID',NULL,'2026-01-28 15:06:59',NULL,'2026-01-28 15:03:53','2026-01-28 15:06:59');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2025_11_07_194656_create_personal_access_tokens_table',1),(5,'2025_11_07_203555_create_sessions_table',1),(6,'2025_11_17_165025_create_password_resets_table',1),(7,'2025_12_04_150540_create_silab_tables',1),(8,'2025_12_16_101914_update_status_enum_on_bookings_table',1),(9,'2025_12_20_064050_add_login_count_to_users_table',1),(10,'2025_12_20_064119_create_achievements_table',1),(11,'2025_12_20_070419_add_avatar_bio_to_users_table',1),(12,'2025_12_20_071926_add_full_name_to_users_table',1),(13,'2025_12_20_083237_make_profile_fields_nullable',1),(14,'2025_12_22_183558_add_hasil_fields_to_booking_analysis_items_table',1),(15,'2025_12_22_185116_add_menunggu_verifikasi_status_to_bookings',1),(16,'2025_12_23_185053_update_jenis_analisis_format',1),(17,'2025_12_23_195544_create_notifications_table',1),(18,'2025_12_30_000000_add_menunggu_pembayaran_status_to_bookings',1),(19,'2026_01_08_210257_add_role_to_achievements_table',1),(20,'2026_01_08_211114_add_kode_batch_to_bookings_table',1),(21,'2026_01_08_220808_add_draft_status_to_bookings_table',1),(22,'2026_01_09_000001_create_analysis_prices_table',1),(23,'2026_01_09_100000_add_kategori_to_analysis_prices_table',1),(24,'2026_01_09_100000_add_menunggu_verifikasi_kepala_status',1),(25,'2026_01_09_120000_add_pdf_path_to_bookings',1),(26,'2026_01_10_070914_add_rejection_fields_to_bookings_table',1),(27,'2026_01_10_090000_add_status_updated_at_to_bookings',1),(28,'2026_01_10_091500_add_menunggu_ttd_koordinator_to_status',1),(29,'2026_01_10_101500_add_payment_proof_path_to_bookings',1),(30,'2026_01_10_110000_create_invoices_table',1),(31,'2026_01_10_120000_add_paid_fields_to_invoices_table',1),(32,'2026_01_11_000001_create_signatures_table',1),(33,'2026_01_21_000001_add_status_to_users_table',1),(34,'2026_01_23_000001_add_status_to_booking_analysis_items_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` bigint unsigned DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  KEY `notifications_booking_id_foreign` (`booking_id`),
  CONSTRAINT `notifications_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'booking_baru','Booking Baru','Booking baru dari bedil22 perlu diverifikasi.',1,0,'2026-01-28 12:38:22','2026-01-28 12:38:22'),(2,5,'booking_disetujui','Booking Disetujui','Booking Anda telah disetujui oleh teknisi.',1,0,'2026-01-28 12:39:41','2026-01-28 12:39:41'),(3,3,'hasil_dikirim_ke_koordinator','Hasil Analisis Dikirim','Teknisi telah mengirim hasil analisis untuk diverifikasi.',1,1,'2026-01-28 12:40:41','2026-01-28 12:43:59'),(4,4,'verifikasi_kepala','Permintaan Verifikasi oleh Koordinator','Ada hasil analisis yang perlu diverifikasi oleh Kepala Lab.',1,1,'2026-01-28 12:41:41','2026-01-28 12:42:52'),(5,4,'verifikasi_kepala','Permintaan Verifikasi oleh Koordinator','Ada hasil analisis yang perlu diverifikasi oleh Kepala Lab.',1,0,'2026-01-28 12:44:38','2026-01-28 12:44:38'),(6,4,'bukti_pembayaran','Bukti Pembayaran Diupload','Bukti pembayaran telah diunggah untuk booking HMMET-DOM-260129-771',1,0,'2026-01-28 12:51:24','2026-01-28 12:51:24'),(7,5,'pembayaran_disetujui','Pembayaran Disetujui','Pembayaran Anda telah disetujui oleh Koordinator. Hasil analisis dapat diakses.',1,0,'2026-01-28 12:52:15','2026-01-28 12:52:15'),(9,2,'booking_baru','Booking Baru','Booking baru dari bedil22 perlu diverifikasi.',3,0,'2026-01-28 13:44:41','2026-01-28 13:44:41'),(10,5,'booking_ditolak','Booking Ditolak','Booking Anda ditolak. Alasan: sampel rusak',3,0,'2026-01-28 13:47:53','2026-01-28 13:47:53'),(20,2,'booking_baru','Booking Baru','Booking baru dari bedil22 perlu diverifikasi.',11,0,'2026-01-28 14:47:39','2026-01-28 14:47:39'),(21,5,'booking_ditolak','Booking Ditolak','Booking Anda ditolak. Alasan: tutup',11,0,'2026-01-28 14:48:13','2026-01-28 14:48:13'),(24,2,'booking_baru','Booking Baru','Booking baru dari bedil22 perlu diverifikasi.',13,0,'2026-01-28 14:55:10','2026-01-28 14:55:10'),(25,5,'booking_disetujui','Booking Disetujui','Booking Anda telah disetujui oleh teknisi.',13,0,'2026-01-28 14:55:52','2026-01-28 14:55:52'),(26,3,'hasil_dikirim_ke_koordinator','Hasil Analisis Dikirim','Teknisi telah mengirim hasil analisis untuk diverifikasi.',13,0,'2026-01-28 14:57:43','2026-01-28 14:57:43'),(27,4,'verifikasi_kepala','Permintaan Verifikasi oleh Koordinator','Ada hasil analisis yang perlu diverifikasi oleh Kepala Lab.',13,0,'2026-01-28 14:58:35','2026-01-28 14:58:35'),(28,3,'hasil_dikirim_ke_koordinator','Hasil Analisis Dikirim','Teknisi telah mengirim hasil analisis untuk diverifikasi.',13,0,'2026-01-28 15:01:56','2026-01-28 15:01:56'),(29,4,'verifikasi_kepala','Permintaan Verifikasi oleh Koordinator','Ada hasil analisis yang perlu diverifikasi oleh Kepala Lab.',13,0,'2026-01-28 15:02:34','2026-01-28 15:02:34'),(30,4,'bukti_pembayaran','Bukti Pembayaran Diupload','Bukti pembayaran telah diunggah untuk booking MET-KAM-260130-335',13,0,'2026-01-28 15:06:21','2026-01-28 15:06:21'),(31,5,'pembayaran_disetujui','Pembayaran Disetujui','Pembayaran Anda telah disetujui oleh Koordinator. Hasil analisis dapat diakses.',13,0,'2026-01-28 15:06:59','2026-01-28 15:06:59');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',5,'auth_token','fa193ff8e8e98ab74b0d9fe64a28e29b9437f3fb062013d1b74088b45c330b56','[\"*\"]',NULL,NULL,'2026-01-28 12:36:27','2026-01-28 12:36:27'),(2,'App\\Models\\User',5,'auth_token','c41d58bcd48b803ba02c7082aee084c76781082c22126dbda164114aa990c949','[\"*\"]','2026-01-28 12:38:56',NULL,'2026-01-28 12:36:44','2026-01-28 12:38:56'),(3,'App\\Models\\User',2,'auth_token','a7cb994dd0585f4c0bd79d4fa62f83b54b64a81c87a90dabe6fff6b4923a6245','[\"*\"]','2026-01-28 12:40:55',NULL,'2026-01-28 12:39:17','2026-01-28 12:40:55'),(4,'App\\Models\\User',3,'auth_token','f6982c4a6e97624903d49acbe42841b6182bab724886babc74577a6610372c38','[\"*\"]','2026-01-28 12:42:28',NULL,'2026-01-28 12:41:02','2026-01-28 12:42:28'),(5,'App\\Models\\User',4,'auth_token','da33f61bbd2b66ee9e8e8c62995dd6e9568b5fe1a5354e5154472df3fe5427ea','[\"*\"]','2026-01-28 12:43:38',NULL,'2026-01-28 12:42:40','2026-01-28 12:43:38'),(6,'App\\Models\\User',3,'auth_token','47c048936638b430fa8ae66db1e7d885ba42946ada9c86d65d9c716185a8781b','[\"*\"]','2026-01-28 12:45:54',NULL,'2026-01-28 12:43:47','2026-01-28 12:45:54'),(7,'App\\Models\\User',5,'auth_token','2115d35efa8adf3d435289fa19c73e3daf2ed77bc6df04e7fb79676b3d501e7b','[\"*\"]','2026-01-28 12:51:32',NULL,'2026-01-28 12:46:16','2026-01-28 12:51:32'),(8,'App\\Models\\User',3,'auth_token','340e35b98bdc4620035549181da97385493fb678f49f82a77da030f3d64e6227','[\"*\"]','2026-01-28 13:01:17',NULL,'2026-01-28 12:51:41','2026-01-28 13:01:17'),(9,'App\\Models\\User',5,'auth_token','eab8a8518324938efbe9d89712368c9bcd31248dce224e69db215afa1b6e8adf','[\"*\"]','2026-01-28 13:07:32',NULL,'2026-01-28 13:07:14','2026-01-28 13:07:32'),(10,'App\\Models\\User',5,'auth_token','9597e7b83e537534c5e52a45f48df5822471c3fcd240303990a8e00b206ebf58','[\"*\"]','2026-01-28 13:08:16',NULL,'2026-01-28 13:08:08','2026-01-28 13:08:16'),(11,'App\\Models\\User',5,'auth_token','60912f533f14204a37802db6c1a64f9d78ab2d68feb5fec82f14b3bfe1ca0c1c','[\"*\"]','2026-01-28 13:23:49',NULL,'2026-01-28 13:23:38','2026-01-28 13:23:49'),(12,'App\\Models\\User',5,'auth_token','c044a9421ca98ed70d97ebd0474022ecf20e8483d971d228d147b8b836e26c5b','[\"*\"]','2026-01-28 13:30:31',NULL,'2026-01-28 13:25:23','2026-01-28 13:30:31'),(13,'App\\Models\\User',5,'auth_token','887e5129a678bccac3e483dd53632107423e13abe2d0d1c210645f8adb7c0e64','[\"*\"]','2026-01-28 13:41:48',NULL,'2026-01-28 13:36:17','2026-01-28 13:41:48'),(14,'App\\Models\\User',5,'auth_token','78ed7190250cf0f19c1864ffbf9291fcfdb0604aefd007b7648bd7ad5f3a5ad7','[\"*\"]','2026-01-28 13:44:54',NULL,'2026-01-28 13:43:06','2026-01-28 13:44:54'),(15,'App\\Models\\User',2,'auth_token','205a5b2fbe3123748adeeab41ee1ea603260c0051d13a6c37731f3ec0ddb5349','[\"*\"]','2026-01-28 13:54:36',NULL,'2026-01-28 13:44:57','2026-01-28 13:54:36'),(16,'App\\Models\\User',5,'auth_token','0856ca59138ecf853aecc032073d971c52dfbb4ede820124a29d17ea2922c8f8','[\"*\"]','2026-01-28 13:55:38',NULL,'2026-01-28 13:54:48','2026-01-28 13:55:38'),(17,'App\\Models\\User',2,'auth_token','90cf906466393ba2715e3f96cc4e6d35e2f17dd94b9ce464fb9d0c46e4529cf9','[\"*\"]','2026-01-28 13:56:01',NULL,'2026-01-28 13:55:47','2026-01-28 13:56:01'),(18,'App\\Models\\User',5,'auth_token','981d43b1527e0c4fdec98c160b03916b7f468cde31cda5616e5b204499909354','[\"*\"]','2026-01-28 13:56:45',NULL,'2026-01-28 13:56:19','2026-01-28 13:56:45'),(19,'App\\Models\\User',2,'auth_token','2eda0e907816901ca35f5d419628c9aedc48e1bc6df4694e36d424a7c21b6fae','[\"*\"]','2026-01-28 13:59:34',NULL,'2026-01-28 13:56:55','2026-01-28 13:59:34'),(20,'App\\Models\\User',5,'auth_token','7b4ac5fb43cfeeb1b22b8d61f536a48b5292edb12b2b68a8fe46d000ad6a3aad','[\"*\"]','2026-01-28 14:00:23',NULL,'2026-01-28 13:59:46','2026-01-28 14:00:23'),(21,'App\\Models\\User',2,'auth_token','68c0050f1e9d94c57ab156d6d91c4abedc6c3cf64f66a473a3bc998400584738','[\"*\"]','2026-01-28 14:05:33',NULL,'2026-01-28 14:00:36','2026-01-28 14:05:33'),(22,'App\\Models\\User',5,'auth_token','1ec0ee7035e44dd20370475edb7e8115429f243f47d7f81be245512125b39550','[\"*\"]','2026-01-28 14:06:36',NULL,'2026-01-28 14:05:47','2026-01-28 14:06:36'),(23,'App\\Models\\User',2,'auth_token','907a12718e785b5dd1954560bbecbee579781a49dfe11fcda972e125ecd3c610','[\"*\"]','2026-01-28 14:09:28',NULL,'2026-01-28 14:06:52','2026-01-28 14:09:28'),(24,'App\\Models\\User',2,'auth_token','b4186bc9d9f25d0c47aea935edd35feefedef4f34fa9fef13155ae8337dcbce6','[\"*\"]','2026-01-28 14:14:39',NULL,'2026-01-28 14:14:21','2026-01-28 14:14:39'),(25,'App\\Models\\User',5,'auth_token','7f74d43870e84f6598dc428cb536c50f9cad90fa6bdf4dc21c3091e51662c927','[\"*\"]','2026-01-28 14:15:41',NULL,'2026-01-28 14:14:48','2026-01-28 14:15:41'),(26,'App\\Models\\User',2,'auth_token','7eadc126211d911091ae032bdc77dd97d48a0b69f0a2f2131f1821b6d032ce0a','[\"*\"]','2026-01-28 14:16:25',NULL,'2026-01-28 14:15:55','2026-01-28 14:16:25'),(27,'App\\Models\\User',5,'auth_token','14391cce3b9150d7b27e87f256bc8e77d3adf25640db2bd881aade96a1b7b2b0','[\"*\"]','2026-01-28 14:17:23',NULL,'2026-01-28 14:16:42','2026-01-28 14:17:23'),(28,'App\\Models\\User',2,'auth_token','158e34b1ac892f9a73795c630f14a29442fcb84748d0ed925fb2244f3216f699','[\"*\"]','2026-01-28 14:18:42',NULL,'2026-01-28 14:17:27','2026-01-28 14:18:42'),(29,'App\\Models\\User',5,'auth_token','c4a0cac15887f8b278c311b84b7092dc4e2ca889071361cbb0db1ce703b2a982','[\"*\"]','2026-01-28 14:20:08',NULL,'2026-01-28 14:18:59','2026-01-28 14:20:08'),(30,'App\\Models\\User',2,'auth_token','5d26992490fb2e4ff5d69abda9e7a75fc0a1f6745d0e64733ae1c81279a4b1b1','[\"*\"]','2026-01-28 14:21:20',NULL,'2026-01-28 14:20:20','2026-01-28 14:21:20'),(31,'App\\Models\\User',5,'auth_token','ecd83b6455b127b6a1df8797df0d27540e5403c122b3604b50a518f64bc94128','[\"*\"]','2026-01-28 14:24:40',NULL,'2026-01-28 14:21:35','2026-01-28 14:24:40'),(32,'App\\Models\\User',2,'auth_token','44dd580913a31a869272bec60e63f38ceb51f209d103e783328ec0f861367619','[\"*\"]','2026-01-28 14:31:29',NULL,'2026-01-28 14:24:53','2026-01-28 14:31:29'),(33,'App\\Models\\User',2,'auth_token','97adbb772d66a7b44a4c4a9f4041d27553f53aa40f08a8ff45e4e884bc509157','[\"*\"]','2026-01-28 14:45:23',NULL,'2026-01-28 14:44:08','2026-01-28 14:45:23'),(34,'App\\Models\\User',5,'auth_token','ae6b43825b165c9b61b6575556f0faab74cab5a9d44f196f338de5704ba9c401','[\"*\"]','2026-01-28 14:46:17',NULL,'2026-01-28 14:45:36','2026-01-28 14:46:17'),(35,'App\\Models\\User',2,'auth_token','6f0c3398025dac70aa8cd05ed6c5abfcbdbdcb8d96873c3f2a809d81ddf662dd','[\"*\"]','2026-01-28 14:47:05',NULL,'2026-01-28 14:46:28','2026-01-28 14:47:05'),(36,'App\\Models\\User',5,'auth_token','29a03d1791c76ffeead6ccd6b78e0a7749a69c992fc8676bbffe040a98550934','[\"*\"]','2026-01-28 14:47:46',NULL,'2026-01-28 14:47:19','2026-01-28 14:47:46'),(37,'App\\Models\\User',2,'auth_token','b6613e12c6d804082fe45ede5661b7150486d1cd7f840a3e5116e08ef4f689b0','[\"*\"]','2026-01-28 14:48:32',NULL,'2026-01-28 14:47:54','2026-01-28 14:48:32'),(38,'App\\Models\\User',5,'auth_token','69826b62a1a76cc60d3ba888a0a9e9dab79416bed96e31dd0f59ecfd7415299a','[\"*\"]','2026-01-28 14:49:28',NULL,'2026-01-28 14:48:46','2026-01-28 14:49:28'),(39,'App\\Models\\User',2,'auth_token','96d5387a1af15366c5a7356be8da2c773dd19308da78a487625c0291ae004019','[\"*\"]','2026-01-28 14:50:06',NULL,'2026-01-28 14:49:32','2026-01-28 14:50:06'),(40,'App\\Models\\User',5,'auth_token','252b10dd3687a5c6b12ce293eed4cb04634a49fe56bf5e233a5561a2b8981095','[\"*\"]','2026-01-28 14:51:27',NULL,'2026-01-28 14:50:22','2026-01-28 14:51:27'),(41,'App\\Models\\User',2,'auth_token','b7a7af819a94b574c3ef1c4de4e2488fa7c270b103dd74070e34c6432bb23b77','[\"*\"]','2026-01-28 14:54:18',NULL,'2026-01-28 14:51:43','2026-01-28 14:54:18'),(42,'App\\Models\\User',5,'auth_token','f2c3f0ae491711fdd78bc8b84f8c80e2aa0c969f00cc9990d291e04ff7369387','[\"*\"]','2026-01-28 14:55:20',NULL,'2026-01-28 14:54:34','2026-01-28 14:55:20'),(43,'App\\Models\\User',2,'auth_token','aa6c6e2bd70beabba0633e1bce1ff804bf55a2c31d17d2c3bae93deb37778c39','[\"*\"]','2026-01-28 14:57:51',NULL,'2026-01-28 14:55:40','2026-01-28 14:57:51'),(44,'App\\Models\\User',3,'auth_token','fa6f6d88810b11713b0a6709eb1fd71e7bb2fcb3f27db902d6d8967fa5807091','[\"*\"]','2026-01-28 14:58:41',NULL,'2026-01-28 14:58:03','2026-01-28 14:58:41'),(45,'App\\Models\\User',5,'auth_token','8f4aa6d16d806ad442ff91bec756288948297b383e7915a13103c19dfe54383f','[\"*\"]','2026-01-28 14:59:26',NULL,'2026-01-28 14:59:00','2026-01-28 14:59:26'),(46,'App\\Models\\User',4,'auth_token','c1c434d7ea3839540017b06dc6bcf98e01f9fb7f54553762716bc896c9f53ba2','[\"*\"]','2026-01-28 15:00:23',NULL,'2026-01-28 14:59:46','2026-01-28 15:00:23'),(47,'App\\Models\\User',3,'auth_token','cea2402754918059ceaaa68a57fb388dfe703d53df25c0638f574235068956e3','[\"*\"]','2026-01-28 15:00:53',NULL,'2026-01-28 15:00:35','2026-01-28 15:00:53'),(48,'App\\Models\\User',2,'auth_token','e8c351c1ee27a8411ff13c4ae7a05101fda78bdef62a4162cda65669a9d2ca5e','[\"*\"]','2026-01-28 15:01:57',NULL,'2026-01-28 15:01:07','2026-01-28 15:01:57'),(49,'App\\Models\\User',3,'auth_token','bba768ab150c0e079b55290481a565073e87dca20acf0123defda7f11740334a','[\"*\"]','2026-01-28 15:02:39',NULL,'2026-01-28 15:02:08','2026-01-28 15:02:39'),(50,'App\\Models\\User',4,'auth_token','f26b0d0fa443011fed40be4f96da122aaa8dacbb862052e71991f6dfdce60b4e','[\"*\"]','2026-01-28 15:03:20',NULL,'2026-01-28 15:02:48','2026-01-28 15:03:20'),(51,'App\\Models\\User',3,'auth_token','1b5229a548306647aefa84fbb4e174172933322a6f10c4a743882c210c9f44e3','[\"*\"]','2026-01-28 15:04:54',NULL,'2026-01-28 15:03:27','2026-01-28 15:04:54'),(52,'App\\Models\\User',5,'auth_token','15edecd02b0eef2ac67ed8642e5fceefef7448e7137c432c58b0127c7f4e0cf3','[\"*\"]','2026-01-28 15:06:28',NULL,'2026-01-28 15:05:30','2026-01-28 15:06:28'),(53,'App\\Models\\User',3,'auth_token','c75849e65d3f9b19b132f77779c6ddabf28fba4bdecfa4cc041b5ea183df1623','[\"*\"]','2026-01-28 15:07:13',NULL,'2026-01-28 15:06:35','2026-01-28 15:07:13'),(54,'App\\Models\\User',5,'auth_token','89a8e2f6b37a05d4dc2fd231689ffb961833dd7747f0636e28f907ffb992539a','[\"*\"]','2026-01-28 15:09:02',NULL,'2026-01-28 15:07:31','2026-01-28 15:09:02'),(55,'App\\Models\\User',3,'auth_token','ebb08968bd60c3da1c383d6214c17d4b9a443a316a0b225bd351e5804f240d34','[\"*\"]','2026-01-28 15:10:50',NULL,'2026-01-28 15:09:16','2026-01-28 15:10:50'),(56,'App\\Models\\User',6,'auth_token','eb5e15c31b9d127d0b7f136dd7878fe69ce6ce3634ea511196af881566768b69','[\"*\"]','2026-01-28 15:12:02',NULL,'2026-01-28 15:11:06','2026-01-28 15:12:02'),(57,'App\\Models\\User',2,'auth_token','a2a3ce0295f9d17e472967ba03e8a4f76f01d843fa14689580319ab048d70c6c','[\"*\"]','2026-01-28 15:12:25',NULL,'2026-01-28 15:12:14','2026-01-28 15:12:25'),(58,'App\\Models\\User',3,'auth_token','0da9a803a9082c42cbb34f208021866384476db3d9ddf44ae96aa29cc2053e92','[\"*\"]','2026-01-28 15:13:17',NULL,'2026-01-28 15:12:35','2026-01-28 15:13:17'),(59,'App\\Models\\User',7,'auth_token','b18933b1ad628517eb3b6eb9cda6fe65a30ec522ef2858341bb8adade7024c26','[\"*\"]','2026-01-29 04:57:41',NULL,'2026-01-28 15:13:44','2026-01-29 04:57:41');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quota_settings`
--

DROP TABLE IF EXISTS `quota_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quota_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tanggal` date DEFAULT NULL,
  `jenis_analisis` enum('hematologi','metabolit','hematologi dan metabolit') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kuota_maksimal` int NOT NULL DEFAULT '15',
  `is_strict` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quota_settings`
--

LOCK TABLES `quota_settings` WRITE;
/*!40000 ALTER TABLE `quota_settings` DISABLE KEYS */;
INSERT INTO `quota_settings` VALUES (1,NULL,'metabolit',999,0,'2026-01-28 11:23:01','2026-01-28 11:23:01'),(2,NULL,'hematologi',30,1,'2026-01-28 11:23:01','2026-01-28 11:23:01'),(3,NULL,'hematologi dan metabolit',999,0,'2026-01-28 11:23:01','2026-01-28 11:23:01'),(4,'2026-01-29','metabolit',0,1,'2026-01-28 13:45:29','2026-01-28 13:45:29'),(5,'2026-01-29','hematologi',100,1,'2026-01-28 13:45:51','2026-01-28 13:45:51');
/*!40000 ALTER TABLE `quota_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signatures`
--

DROP TABLE IF EXISTS `signatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `signatures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kepala_approval',
  `created_by` bigint unsigned DEFAULT NULL,
  `signed_by` bigint unsigned DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','signed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `signed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `signatures_booking_id_foreign` (`booking_id`),
  CONSTRAINT `signatures_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signatures`
--

LOCK TABLES `signatures` WRITE;
/*!40000 ALTER TABLE `signatures` DISABLE KEYS */;
INSERT INTO `signatures` VALUES (1,1,'kepala_approval',4,3,'hasil_pdfs/6m8rh0VR7E18StJVq0kaByWh0vwirPBocRA59Aqi.pdf','signed','2026-01-28 12:44:46','2026-01-28 12:43:22','2026-01-28 12:44:46'),(2,13,'kepala_approval',4,3,'hasil_pdfs/c2H3HwVAo5UbpveLACzdXW1e8gc2Tfj4mAB1i9Jv.pdf','signed','2026-01-28 15:03:53','2026-01-28 15:03:13','2026-01-28 15:03:53');
/*!40000 ALTER TABLE `signatures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `achievement_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_achievements_user_id_foreign` (`user_id`),
  KEY `user_achievements_achievement_id_foreign` (`achievement_id`),
  CONSTRAINT `user_achievements_achievement_id_foreign` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES (1,5,1,'2026-01-28 12:36:44','2026-01-28 12:36:44'),(2,5,3,'2026-01-28 12:38:22','2026-01-28 12:38:22'),(3,3,1,'2026-01-28 12:41:02','2026-01-28 12:41:02'),(4,4,1,'2026-01-28 12:42:40','2026-01-28 12:42:40'),(5,7,1,'2026-01-28 15:13:44','2026-01-28 15:13:44');
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `institusi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_telpon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('klien','teknisi','koordinator','kepala') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'klien',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Aktif',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_count` int NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_name_unique` (`name`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User',NULL,'test@example.com',NULL,NULL,NULL,'umum','081234567890','klien','Aktif','$2y$12$7WE4.kTRseYg/WHtsj1y/Oi5god3nSrxj.lOmJukBATR8hF8FNhm6',0,NULL,'2026-01-28 11:23:00','2026-01-28 11:23:00'),(2,'yudha.teknisi',NULL,'teknisi@lab.com',NULL,NULL,NULL,'Internal Lab','081234567890','teknisi','Aktif','$2y$12$630tHwc9hQ8kuGMgBxXBaus0wzC5SW/2FNKPJHyAQ0Iyv4pdaLceS',19,NULL,'2026-01-28 11:23:00','2026-01-28 15:12:14'),(3,'kokom.koordinator','Kokom Komalasari','koordinator@lab.com',NULL,'HAI INI AKU',NULL,'Internal Lab','081234567891','koordinator','Aktif','$2y$12$2929MVLKeWtTJG8/lpV2fuVQpGaxTjKHMJDsxV6wpxQMLgEcY8c4W',10,NULL,'2026-01-28 11:23:00','2026-01-28 15:12:35'),(4,'prof.dewi',NULL,'kepala@lab.com',NULL,NULL,NULL,'Internal Lab','081234567892','kepala','Aktif','$2y$12$M.M239glUHXAujFcXAsXounT9BGycVbLZgEgjzytCoISTlAwaQ0K.',3,NULL,'2026-01-28 11:23:01','2026-01-28 15:02:48'),(5,'bedil22','Yahdillah','adiyahdillah434@gmail.com',NULL,'hai ini saya',NULL,'Umum','082111485562','klien','Aktif','$2y$12$neB0JWU0CFCuAVXEKhpHEODGmr6t/TMg13bEtEUvL/q8fqVzoOrJq',24,NULL,'2026-01-28 12:36:20','2026-01-28 15:07:31'),(6,'riko','Riko Waiya','riko@gmail.com',NULL,'hai',NULL,'TeknisiIPB','08988291333','teknisi','Aktif','$2y$12$nwfgfAYmhJu32/DFnW1yKOfOuZK9w4MvkohCC9gD1wXkuelteEQde',1,NULL,'2026-01-28 15:10:39','2026-01-28 15:11:39'),(7,'admin',NULL,'admin@gmail.com',NULL,NULL,NULL,'Koordinator Lab','08988291333','koordinator','Aktif','$2y$12$vZlRzyz6aBvaMqmG8CKCWuH.e8QzPFZGiSwe/KZRtV./lN1GvIZjq',1,NULL,'2026-01-28 15:13:16','2026-01-28 15:13:44'),(8,'admin super',NULL,'adminsuper@gmail.com',NULL,NULL,NULL,'Kepala Lab','08988291333','kepala','Aktif','$2y$12$z1ibt0NEGoJ2damYeCF4VO9SCtl2OtEZwq85bHQC4fIj05LtSoWwC',0,NULL,'2026-01-28 15:30:51','2026-01-28 15:30:51'),(9,'teknisi',NULL,'teknisi99@gmail.com',NULL,NULL,NULL,'Teknisi IPB','0892829922909','teknisi','Non-Aktif','$2y$12$CGCmlqDbdvV7nerQ7KjtuOH5R4SZ8RWKH390TFrxCZ3i97wKwuDTa',0,NULL,'2026-01-28 15:32:29','2026-01-28 15:33:13'),(10,'abcd',NULL,'adiyahdillah@gmail.com',NULL,NULL,NULL,'Koordinator Lab','97090909089','kepala','Aktif','$2y$12$.7oWb4Mv5ZjHx5VI02GFhuFrM7vxdDt4RevOe28YVr0YvieBEExcW',0,NULL,'2026-01-28 15:32:59','2026-01-28 15:32:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-29 23:21:51
