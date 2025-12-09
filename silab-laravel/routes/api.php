<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\Api\QuotaController;
use App\Http\Controllers\Api\BookingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Reset Password
Route::post('/send-otp', [PasswordResetController::class, 'sendOtp']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::get('/hello', function () {
    return response()->json(['message' => 'Koneksi API Berhasil']);
});

Route::get('/calendar-quota', [QuotaController::class, 'getMonthlyQuota']);

Route::middleware('auth:sanctum')->group(function () {

    // Data User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-quota', [QuotaController::class, 'updateQuota']);


    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);


    Route::get('/bookings/all', [BookingController::class, 'indexAll']);


    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

});


