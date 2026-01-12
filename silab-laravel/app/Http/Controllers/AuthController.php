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

        // Cek dan berikan achievement teknisi jika perlu
        $this->checkTechnicianAchievements($user);

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

        // Cek dan berikan achievement untuk user
        if ($user->role === 'teknisi') {
            $this->checkTechnicianAchievements($user);
        } elseif ($user->role === 'koordinator') {
            $this->checkKoordinatorAchievements($user);
        }

        // Stats berbeda berdasarkan role
        if ($user->role === 'teknisi') {
            // Untuk teknisi: Total Analisis = booking selesai
            $totalAnalisis = DB::table('bookings')->where('status', 'selesai')->count();
            $statsKey = 'total_orders';
        } elseif ($user->role === 'koordinator') {
            // Untuk koordinator: Total Verifikasi = booking yang sudah ditandatangani
            $totalAnalisis = DB::table('bookings')->whereIn('status', ['ditandatangani', 'selesai'])->count();
            $statsKey = 'total_verifikasi';
        } else {
            // Untuk klien: Total Orders = booking milik user
            $totalAnalisis = DB::table('bookings')->where('user_id', $user->id)->count();
            $statsKey = 'total_orders';
        }

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
                $statsKey => $totalAnalisis,
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

            // Email bisa diedit
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users')->ignore($user->id)
            ],

            // Institusi & No Telpon tetap divalidasi (data dari register akan otomatis terisi)
            'institusi' => 'required|string|in:Umum,Dosen IPB,Mahasiswa IPB,Tendik IPB,Teknisi Lab IPB,Koordinator Lab IPB',
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
            $user->email = $request->email;
            $user->institusi = $request->institusi;
            $user->nomor_telpon = $request->nomor_telpon;
            $user->bio = $request->bio;

            $user->save();

            // Cek dan berikan achievement teknisi jika perlu
            $this->checkTechnicianAchievements($user);

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

    // Achievement untuk teknisi berdasarkan jumlah analisis selesai dan login
    private function checkTechnicianAchievements($user)
    {
        if ($user->role !== 'teknisi') return;

        // === 1. Cek Achievement LOGIN untuk Teknisi ===
        $loginAchievements = DB::table('achievements')
            ->where('role', 'teknisi')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->get();

        foreach ($loginAchievements as $achievement) {
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

        // === 2. Cek Achievement ANALISIS untuk Teknisi ===
        // Sementara: Hitung jumlah total booking dengan status selesai
        // TODO: Jika ada assignment teknisi ke booking, ubah query ini
        $analysisCount = DB::table('bookings')
            ->where('status', 'selesai')
            ->count();

        $analysisAchievements = DB::table('achievements')
            ->where('role', 'teknisi')
            ->where('type', 'analysis')
            ->where('target', '<=', $analysisCount)
            ->get();

        foreach ($analysisAchievements as $achievement) {
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

    // ==========================================
    // FUNGSI ACHIEVEMENT KOORDINATOR
    // ==========================================
    private function checkKoordinatorAchievements($user)
    {
        if ($user->role !== 'koordinator') return;

        // === 1. Cek Achievement LOGIN untuk Koordinator ===
        $loginAchievements = DB::table('achievements')
            ->where('role', 'koordinator')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->get();

        foreach ($loginAchievements as $achievement) {
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

        // === 2. Cek Achievement VERIFIKASI untuk Koordinator ===
        $verifikasiCount = DB::table('bookings')
            ->whereIn('status', ['ditandatangani', 'selesai'])
            ->count();

        $verifikasiAchievements = DB::table('achievements')
            ->where('role', 'koordinator')
            ->where('type', 'verifikasi')
            ->where('target', '<=', $verifikasiCount)
            ->get();

        foreach ($verifikasiAchievements as $achievement) {
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

    // ==========================================
    // FUNGSI HELPER
    // ==========================================
    private function checkLoginAchievements($user)
    {
        // Untuk klien: cek achievement login tanpa filter role atau dengan role klien
        $achievements = DB::table('achievements')
            ->where('type', 'login')
            ->where('target', '<=', $user->login_count)
            ->where(function($query) use ($user) {
                $query->whereNull('role')
                      ->orWhere('role', 'klien')
                      ->orWhere('role', $user->role);
            })
            ->get();

        foreach ($achievements as $achievement) {
            // Skip jika achievement untuk teknisi tapi user bukan teknisi
            if ($achievement->role === 'teknisi' && $user->role !== 'teknisi') {
                continue;
            }
            // Skip jika achievement untuk klien tapi user bukan klien
            if (($achievement->role === 'klien' || $achievement->role === null) && $user->role === 'teknisi') {
                continue;
            }

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
