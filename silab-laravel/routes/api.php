<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Requests\ApiEmailVerificationRequest;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PasswordResetController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/send-otp', [PasswordResetController::class, 'sendOtp']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Koneksi API Berhasil (Hanya Tes /hello)!'
    ]);
});

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {

    $request->fulfill();

    return redirect('http://localhost:3000/verification-success');

})->middleware(['signed'])->name('verification.verify');

Route::get('/email/verify/{id}/{hash}', function (ApiEmailVerificationRequest $request) {
    $request->fulfill();
    return response()->json(['message' => 'Email berhasil diverifikasi']);
})->name('verification.verify');



// =====================================================
//    RUTE YANG MEMERLUKAN LOGIN (auth:sanctum)
// =====================================================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Tautan verifikasi baru telah dikirim!']);
    })->middleware(['throttle:6,1']);

});
