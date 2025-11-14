<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * Handle (Register)
     */
    public function register(Request $request)
    {
        // 1. Validasi data
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'institusi' => ['required', 'string', 'in:umum,mahasiswa'],
            'nomor_telpon' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // 2. Buat user baru
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'institusi' => $request->institusi,
            'nomor_telpon' => $request->nomor_telpon,
            'password' => Hash::make($request->password), // Password di-hash
        ]);

        // 3. Buat token langsung tanpa login session
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Kembalikan data user dan token
        return response()->json([
            'message' => 'Registrasi berhasil',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Handle (Login) - MENGGUNAKAN KOLOM 'NAME' UNTUK LOGIN
     */
    public function login(Request $request)
    {
        // 1. Validasi input
        $credentials = $request->validate([
            'email' => ['required', 'string'], // Frontend kirim sebagai 'email'
            'password' => ['required'],
        ]);

        // 2. Ubah 'email' menjadi 'name' untuk Auth::attempt
        $credentials['name'] = $credentials['email'];
        unset($credentials['email']);

        // 3. Coba autentikasi TANPA session (karena ini API)
        if (Auth::attempt($credentials)) {
            // 4. Ambil user
            $user = Auth::user();

            // 5. Buat token
            $token = $user->createToken('auth_token')->plainTextToken;


            return response()->json([
                'message' => 'Login berhasil',
                'user' => $user,
                'token' => $token
            ], 200);
        }

        // 7. Jika gagal
        return response()->json([
            'message' => 'Username atau password salah.'
        ], 401);
    }

    /**
     * Handle (Logout)
     */
    public function logout(Request $request)
    {
        // 1. Hapus token saat ini (untuk API)
        $request->user()->currentAccessToken()->delete();

        // 2. Kembalikan response
        return response()->json([
            'message' => 'Logout berhasil'
        ], 200);
    }
}