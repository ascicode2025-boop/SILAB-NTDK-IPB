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
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'institusi' => ['required', 'string', 'in:Umum,Dosen IPB,Mahasiswa IPB,Tendik IPB'],
            'nomor_telpon' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'institusi' => $request->institusi,
            'nomor_telpon' => $request->nomor_telpon,
            'password' => Hash::make($request->password),
            'role' => 'klien',
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        } catch (\Exception $e) {
            Log::error('Gagal kirim welcome email: ' . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($request->only('name', 'password'))) {
            return response()->json([
                'message' => 'Username atau password salah.'
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil'], 200);
    }

    public function me(Request $request)
{
    return response()->json([
        'user' => $request->user()
    ]);
}



}