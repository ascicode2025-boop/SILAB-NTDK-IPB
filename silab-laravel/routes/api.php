<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\Api\QuotaController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Reset Password
Route::post('/send-otp', [PasswordResetController::class, 'sendOtp']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::get('/hello', function () {
    return response()->json(['message' => 'Koneksi API Berhasil']);
});

Route::get('/calendar-quota', [QuotaController::class, 'getMonthlyQuota']);


// Protected Routes (Harus Login)
Route::middleware('auth:sanctum')->group(function () {

    // Data User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ==========================================
    // [BARU] ROUTE UPDATE PROFILE
    // ==========================================
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    // ==========================================

    Route::post('/update-quota', [QuotaController::class, 'updateQuota']);

    // Booking Routes
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/all', [BookingController::class, 'indexAll']);
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancelBooking']);
    Route::put('/bookings/{id}/results', [BookingController::class, 'updateAnalysisResult']);
    Route::put('/bookings/{id}/finalize', [BookingController::class, 'finalizeAnalysis']);
    Route::put('/bookings/{id}/kirim-koordinator', [BookingController::class, 'kirimKeKoordinator']);
    Route::put('/bookings/{id}/verifikasi', [BookingController::class, 'verifikasiKoordinator']);

    // Notification Routes
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread']);
    Route::get('/notifications', [NotificationController::class, 'getAll']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

});
