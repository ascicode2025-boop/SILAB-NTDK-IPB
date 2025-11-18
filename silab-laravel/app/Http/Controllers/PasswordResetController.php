<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Mail\SendOtpMail; // <-- Pastikan ini di-import

class PasswordResetController extends Controller
{
    /**
     * Kirim OTP ke email pengguna.
     */
    public function sendOtp(Request $request)
    {
        // 1. Validasi request
        $request->validate([
            'email' => 'required|email',
        ]);

        // 2. Cek apakah user ada
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar.'], 404);
        }

        // 3. Buat OTP
        $otp = rand(100000, 999999); // 6 digit OTP
        $expires_at = Carbon::now()->addMinutes(10); // OTP berlaku 10 menit

        // 4. Simpan atau Update OTP di database
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => $expires_at,
                'created_at' => Carbon::now()
            ]
        );

        // 5. Kirim email
        try {
            Mail::to($request->email)->send(new SendOtpMail($otp));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim email OTP. Cek konfigurasi SMTP Anda.'], 500);
        }

        return response()->json(['message' => 'OTP telah dikirim ke email Anda.'], 200);
    }

    /**
     * Verifikasi OTP dan Reset Password.
     */
    public function resetPassword(Request $request)
    {
        // 1. Validasi request
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|min:6|max:6',
            'password' => 'required|string|min:8|confirmed', // 'confirmed' akan cek 'password_confirmation'
        ]);

        // 2. Cari record reset password
        $resetRecord = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        // 3. Cek apakah OTP valid atau expired
        if (!$resetRecord) {
            return response()->json(['message' => 'OTP tidak valid.'], 400);
        }

        if (Carbon::now()->isAfter($resetRecord->expires_at)) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            return response()->json(['message' => 'OTP sudah kedaluwarsa. Silakan minta OTP baru.'], 400);
        }

        // 4. Cari user dan update password
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // 5. Hapus record OTP dari database setelah berhasil
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password berhasil direset.'], 200);
    }
}
