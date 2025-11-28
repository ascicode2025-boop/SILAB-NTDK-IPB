<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'institusi' => 'umum',
            'nomor_telpon' => '081234567890',
        ]);

        // 1. Akun Teknisi
        User::create([
            'name' => 'Petugas Teknisi',
            'email' => 'teknisi@lab.com',
            'password' => Hash::make('123456'),
            'role' => 'teknisi',
            'institusi' => 'Internal Lab', // <-- Tambahkan ini
            'nomor_telpon' => '081234567890' // <-- Tambahkan ini juga jika wajib
        ]);

        // 2. Akun Koordinator
        User::create([
            'name' => 'Bu Siti Koordinator',
            'email' => 'koordinator@lab.com',
            'password' => Hash::make('123456'),
            'role' => 'koordinator',
            'institusi' => 'Internal Lab',
            'nomor_telpon' => '081234567891'
        ]);

        // 3. Akun Kepala Lab
        User::create([
            'name' => 'Prof. Andi Kepala',
            'email' => 'kepala@lab.com',
            'password' => Hash::make('123456'),
            'role' => 'kepala',
            'institusi' => 'Internal Lab', // <-- Tambahkan ini
            'nomor_telpon' => '081234567892'
        ]);
 }
}
