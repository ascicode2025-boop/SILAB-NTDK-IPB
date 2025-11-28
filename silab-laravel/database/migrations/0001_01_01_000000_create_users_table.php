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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // gunakan untuk 'username'
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();

            // --- TAMBAHAN KITA ---
            $table->string('institusi'); // 'umum' atau 'mahasiswa'
            $table->string('nomor_telpon')->nullable();
            // --- BATAS TAMBAHAN ---

             $table->enum('role', ['klien', 'teknisi', 'koordinator', 'kepala'])->default('klien');

            $table->string('password');
            $table->rememberToken();
            $table->timestamps();



        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
