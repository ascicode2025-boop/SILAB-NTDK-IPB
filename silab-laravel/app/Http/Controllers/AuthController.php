<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\WelcomeEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // ==========================================
    // 1. REGISTER (Username, Email, Pass, Institusi, NoHP)
    // ==========================================
    public function register(Request $request)
    {
        // Validasi
        $request->validate([
            // Akun Dasar
            'name' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],

            // [DIKEMBALIKAN] Data ini wajib diisi saat register agar muncul di edit profil nanti
            'institusi' => ['required', 'string', 'in:Umum,Dosen IPB,Mahasiswa IPB,Tendik IPB'],
            'nomor_telpon' => ['required', 'string', 'max:20'],
        ]);

        // Buat User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // Simpan data ini agar nanti tertampil otomatis di form Edit Profil
            'institusi' => $request->institusi,
            'nomor_telpon' => $request->nomor_telpon,

            'role' => 'klien',
            'login_count' => 0,

            // [PENTING] full_name dibiarkan NULL.
            // Ini menjadi penanda bagi Frontend bahwa user ini "Belum Lengkap"
            // sehingga akan di-redirect ke halaman Edit Profil.
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        } catch (\Exception $e) {
            Log::error('Gagal kirim welcome email: ' . $e->getMessage());
        }

        /** @var string $token */
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil! Silakan lengkapi Nama Lengkap Anda.',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // ==========================================
    // 2. LOGIN
    // ==========================================
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

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Logika Keaktifan
        $user->increment('login_count');
        $this->checkLoginAchievements($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'full_name' => $user->full_name, // Jika ini null, frontend akan redirect
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'institusi' => $user->institusi,
                'nomor_telpon' => $user->nomor_telpon,
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil'], 200);
    }

    // ==========================================
    // 3. ME (DATA USER)
    // ==========================================
    public function me(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $totalOrders = DB::table('bookings')->where('user_id', $user->id)->count();
        $totalLogin = $user->login_count;
        $totalAchievements = DB::table('user_achievements')->where('user_id', $user->id)->count();

        $myAchievements = DB::table('user_achievements')
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->where('user_achievements.user_id', $user->id)
            ->select('achievements.name', 'achievements.description', 'achievements.type')
            ->get();

        return response()->json([
            'user' => $user,
            'stats' => [
                'total_orders' => $totalOrders,
                'total_login' => $totalLogin,
                'total_achievements' => $totalAchievements
            ],
            'achievements_list' => $myAchievements
        ]);
    }

    // ==========================================
    // 4. UPDATE PROFILE
    // ==========================================
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Validasi Input
        $validated = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            // Di sini user WAJIB mengisi Nama Lengkap
            'full_name' => ['required', 'string', 'max:255'],

            // Institusi & No Telpon tetap divalidasi (data dari register akan otomatis terisi)
            'institusi' => 'required|string|in:Umum,Dosen IPB,Mahasiswa IPB,Tendik IPB',
            'nomor_telpon' => 'required|string|max:20',

            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,bmp,webp,tiff,tif',
        ]);

        try {
            if ($request->hasFile('avatar')) {
                $file = $request->file('avatar');

                // Validasi file upload
                if (!$file->isValid()) {
                    return response()->json([
                        'message' => 'File avatar tidak valid atau upload gagal.',
                        'errors' => ['avatar' => ['The avatar failed to upload.']]
                    ], 422);
                }

                // Hapus avatar lama jika ada
                if ($user->avatar && Storage::exists('public/' . $user->avatar)) {
                    Storage::delete('public/' . $user->avatar);
                }

                // Upload avatar baru
                $path = $file->store('avatars', 'public');

                if (!$path) {
                    return response()->json([
                        'message' => 'Gagal menyimpan avatar.',
                        'errors' => ['avatar' => ['Failed to save avatar to storage.']]
                    ], 500);
                }

                $user->avatar = $path;
            }

            // Update Data
            $user->name = $request->name;
            $user->full_name = $request->full_name;
            $user->institusi = $request->institusi;
            $user->nomor_telpon = $request->nomor_telpon;
            $user->bio = $request->bio;

            $user->save();

            return response()->json([
                'message' => 'Profil berhasil diperbarui!',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Update Profile Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat update profil.',
                'errors' => ['avatar' => [$e->getMessage()]]
            ], 500);
        }
    }

    // ==========================================
    // FUNGSI HELPER
    // ==========================================
    private function checkLoginAchievements($user)
    {
        $achievements = DB::table('achievements')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->get();

        foreach ($achievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}
