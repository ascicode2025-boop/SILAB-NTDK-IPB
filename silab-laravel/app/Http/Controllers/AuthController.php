<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Otp;
use App\Mail\WelcomeEmail;
use App\Mail\SendOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use Carbon\Carbon;


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


        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal kirim welcome email: ' . $e->getMessage());
        }


       $token = $user->createToken('auth_token')->plainTextToken;


        return response()->json([
            'message' => 'Akun berhasil dibuat! Silakan cek email Anda.',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Handle (Login) - MENGGUNAKAN KOLOM 'NAME' UNTUK LOGIN
     * frontend mengirim 'email' tapi kita anggap itu 'name'
     */
    public function login(Request $request)
    {
        // 1. Validasi input
        $credentials = $request->validate([
            'email' => ['required', 'string'], // Frontend kirim sebagai 'email'
            'password' => ['required'],
        ]);


        $credentials['name'] = $credentials['email'];
        unset($credentials['email']);


        if (Auth::attempt($credentials)) {

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
