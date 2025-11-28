<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\WelcomeEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // --- 1. FITUR REGISTER (KHUSUS KLIEN) ---
    public function register(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'institusi' => ['required', 'string'],
            'nomor_telpon' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Buat user baru (Role otomatis 'klien')
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'institusi' => $request->institusi,
            'nomor_telpon' => $request->nomor_telpon,
            'password' => Hash::make($request->password),
            'role' => 'klien', // Default role untuk pendaftar umum
        ]);

        // Kirim email welcome (Opsional)
        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        } catch (\Exception $e) {
            Log::error('Gagal kirim welcome email: ' . $e->getMessage());
        }

        // Buat token langsung agar user bisa langsung login
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // --- 2. FITUR LOGIN (MENGGUNAKAN USERNAME/NAME) ---
    public function login(Request $request)
    {
        // 1. Validasi input: Pastikan 'name' yang divalidasi, BUKAN email
        $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required'],
        ]);

        // 2. Cek Login: Gunakan 'name' untuk mencocokkan di database
        // PERBAIKAN: Ganti 'email' menjadi 'name' di sini
        if (!Auth::attempt($request->only('name', 'password'))) {
            return response()->json([
                'message' => 'Username atau password salah.'
            ], 401);
        }

        // 3. Ambil user yang berhasil login
        $user = Auth::user();

        // 4. Buat token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kembalikan response dengan data user & role
        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Penting untuk redirect di React
            ]
        ], 200);
    }

    // --- 3. FITUR LOGOUT ---
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil'], 200);
    }
}
