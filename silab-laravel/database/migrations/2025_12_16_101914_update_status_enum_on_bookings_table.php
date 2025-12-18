<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Masukkan SEMUA status yang mungkin digunakan di aplikasi
        DB::statement("
            ALTER TABLE bookings
            MODIFY status ENUM(
              'Menunggu Persetujuan',
              'Disetujui',
              'Sampel Diterima',
              'Sedang Dianalisis',
              'Sedang Diverifikasi',
              'Selesai',
              'Ditolak'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE bookings
            MODIFY status ENUM(
              'Menunggu Persetujuan',
              'Disetujui',
              'Sampel Diterima',
              'Ditolak'
            ) NOT NULL
        ");
    }
};
