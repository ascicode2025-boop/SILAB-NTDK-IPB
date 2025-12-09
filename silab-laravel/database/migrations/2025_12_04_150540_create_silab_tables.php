<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quota_settings', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->enum('jenis_analisis', ['hematologi', 'metabolit', 'hematologi_metabolit']);
            $table->integer('kuota_maksimal')->default(15);
            $table->timestamps();
            $table->unique(['tanggal', 'jenis_analisis']);
        });
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('kode_sampel')->unique();
            $table->enum('jenis_analisis', ['Hematologi', 'Metabolit', 'Hematologi & Metabolit']);
            $table->date('tanggal_kirim');
            $table->enum('status', ['Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Selesai'])->default('Menunggu Persetujuan');
            $table->text('alasan_penolakan')->nullable();


            $table->string('jenis_hewan');
            $table->string('jenis_hewan_lain')->nullable();
            $table->string('jenis_kelamin');
            $table->string('umur');
            $table->string('status_fisiologis');
            $table->integer('jumlah_sampel');

            $table->timestamps();
        });

        Schema::create('booking_analysis_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->string('nama_item');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_analysis_items');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('quota_settings');
    }
};
