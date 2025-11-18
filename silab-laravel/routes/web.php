<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

// Rute ini akan menggantikan halaman utama Anda (HANYA UNTUK TES)
Route::get('/', function () {

    echo "Mencoba mengirim email... <br><br>";

    try {
        Mail::raw('Ini adalah tes email dari rute web Laravel.', function ($message) {

            // GANTI INI dengan email Anda
            $message->to('email-tes-penerima@gmail.com')
                   ->subject('Tes Koneksi Email Berhasil!');
        });

        // Jika berhasil
        return "<h2>BERHASIL!</h2> Email tes telah dikirim. Silakan cek inbox Anda.";

    } catch (\Exception $e) {

        // Jika GAGAL, tampilkan error yang sebenarnya
        return "<h2>GAGAL MENGIRIM EMAIL:</h2><pre>" . $e->getMessage() . "</pre>";
    }
});
