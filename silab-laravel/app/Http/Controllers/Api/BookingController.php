<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingAnalysisItem;
use App\Models\QuotaSetting;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    // =================================================================
    // 1. FUNGSI SIMPAN PESANAN (STORE)
    // =================================================================
    public function store(Request $request)
    {
        try {
            // 1. Normalisasi Nama Jenis Analisis
            $jenisRaw = strtolower($request->jenis_analisis);
            $jenisNormalized = '';

            if (stripos($jenisRaw, 'hematologi') !== false && stripos($jenisRaw, 'metabolit') !== false) {
                $jenisNormalized = 'hematologi dan metabolit';
            } elseif (stripos($jenisRaw, 'hematologi') !== false) {
                $jenisNormalized = 'hematologi';
            } else {
                $jenisNormalized = 'metabolit';
            }

            // 2. Validasi Input
            // Metabolit & Hematologi dan Metabolit = Unlimited (9999), Hematologi = 30
            $maxSampel = ($jenisNormalized === 'hematologi') ? 30 : 9999;

            $request->validate([
                'tanggal_kirim' => 'required|date',
                'jenis_analisis' => 'required|string',
                'jenis_hewan' => 'required|string',
                'jenis_kelamin' => 'required|string',
                'umur' => 'required|string',
                'status_fisiologis' => 'required|string',
                'jumlah_sampel' => "required|integer|min:1|max:{$maxSampel}",
                'analisis_items' => 'required|array|min:1',
            ]);

            $tanggalKirim = Carbon::parse($request->tanggal_kirim)->format('Y-m-d');
            $jumlahSampel = (int) $request->jumlah_sampel;

            // 3. Cek Ketersediaan Quota (SHARED LOGIC)
            // Ini akan memastikan Hematologi & Gabungan memakan kuota yang sama
            $quotaCheck = $this->checkQuotaAvailability($tanggalKirim, $jenisNormalized, $jumlahSampel);

            if (!$quotaCheck['available']) {
                return response()->json([
                    'success' => false,
                    'message' => $quotaCheck['message']
                ], 422); // 422 Unprocessable Entity
            }

            // 4. Generate Kode Sampel dengan format: [JENIS]-[HEWAN]-[TANGGAL]-[NOMOR]
            $prefix = '';
            if ($jenisNormalized == 'hematologi') $prefix = 'HM';
            elseif ($jenisNormalized == 'metabolit') $prefix = 'MET';
            else $prefix = 'HMMET';

            // Ambil kode hewan (3 huruf pertama, uppercase)
            $jenisHewan = $request->jenis_hewan;
            if ($jenisHewan === 'lainnya' && $request->jenis_hewan_lain) {
                $jenisHewan = $request->jenis_hewan_lain;
            }
            $hewanCode = strtoupper(substr($jenisHewan, 0, 3)); // Contoh: AYA, SAP, KAM

            $dateCode = Carbon::parse($tanggalKirim)->format('ymd');
            $kodeSampelArray = [];
            for ($i = 1; $i <= $jumlahSampel; $i++) {
                $kodeSampelArray[] = sprintf("%s-%s-%s-%02d", $prefix, $hewanCode, $dateCode, $i); // Contoh: HM-AYA-251224-01
            }
            $kodeSampelJson = json_encode($kodeSampelArray);

            // 6. Simpan Booking
            DB::beginTransaction(); // Pakai Transaction biar aman

            $booking = Booking::create([
                'user_id' => Auth::id(),
                'tanggal_kirim' => $tanggalKirim,
                'jenis_analisis' => $jenisNormalized, // Simpan format standar (hematologi, metabolit, hematologi dan metabolit)
                'jenis_hewan' => $request->jenis_hewan,
                'jenis_hewan_lain' => $request->jenis_hewan_lain,
                'jenis_kelamin' => $request->jenis_kelamin,
                'umur' => $request->umur,
                'status_fisiologis' => $request->status_fisiologis,
                'jumlah_sampel' => $jumlahSampel,
                'kode_sampel' => $kodeSampelJson,
                'status' => 'menunggu',
                'is_paid' => 0,
            ]);

            // Simpan Item Analisis
            foreach ($request->analisis_items as $item) {
                BookingAnalysisItem::create([
                    'booking_id' => $booking->id,
                    'nama_item' => $item
                ]);
            }

            DB::commit();

            // Cek achievement untuk pesanan
            $this->checkOrderAchievements($booking->user_id);

            // Trigger notifikasi untuk teknisi bahwa ada booking baru
            // Ambil semua user dengan role 'teknisi'
            $teknisiUsers = \App\Models\User::where('role', 'teknisi')->get();
            foreach ($teknisiUsers as $teknisi) {
                Notification::create([
                    'user_id' => $teknisi->id,
                    'type' => 'booking_baru',
                    'title' => 'Booking Baru',
                    'message' => 'Booking baru dari ' . Auth::user()->name . ' perlu diverifikasi.',
                    'booking_id' => $booking->id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat',
                'data' => $booking
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Booking Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    // =================================================================
    // 2. HELPER FUNCTION: CEK QUOTA (LOGIKA UTAMA)
    // =================================================================
    private function checkQuotaAvailability($date, $jenis, $jumlahSampel)
    {
        // A. Tentukan Group Quota (Shared Logic)
        // Jika Hematologi ATAU Gabungan, kita cek aturan 'hematologi'
        $quotaRuleName = ($jenis === 'metabolit') ? 'metabolit' : 'hematologi';

        // Tentukan apa saja yang dihitung
        // Jika Hematologi, hitung (Hematologi + Gabungan)
        $typesToCount = [];
        if ($jenis === 'metabolit') {
            $typesToCount = ['metabolit'];
        } else {
            $typesToCount = ['hematologi', 'hematologi dan metabolit'];
        }

        // B. Ambil Aturan (Prioritas: Tanggal Spesifik -> Master Rule)
        $quotaSetting = QuotaSetting::where('jenis_analisis', $quotaRuleName)
            ->where('tanggal', $date)
            ->first();

        if (!$quotaSetting) {
            // Ambil Master Rule (tanggal = NULL)
            $quotaSetting = QuotaSetting::where('jenis_analisis', $quotaRuleName)
                ->whereNull('tanggal')
                ->first();
        }

        if (!$quotaSetting) {
            return ['available' => false, 'message' => 'Pengaturan quota tidak ditemukan.'];
        }

        // C. Cek Hari Libur
        $dayOfWeek = Carbon::parse($date)->dayOfWeek; // 0=Minggu, 6=Sabtu
        $isHoliday = false;

        if ($quotaRuleName === 'hematologi' && in_array($dayOfWeek, [5, 6, 0])) $isHoliday = true; // Jum, Sab, Min
        if ($quotaRuleName === 'metabolit' && in_array($dayOfWeek, [6, 0])) $isHoliday = true; // Sab, Min

        // Jika hari libur, tapi teknisi set kuota > 0, maka BUKA (Override)
        // Jika kuota = 0, maka TUTUP
        if ($quotaSetting->kuota_maksimal === 0) {
            return ['available' => false, 'message' => 'Laboratorium tutup pada tanggal ini.'];
        }
        if ($isHoliday && $quotaSetting->kuota_maksimal <= 0) { // Default libur dan tidak dibuka manual
             return ['available' => false, 'message' => 'Layanan tutup pada hari libur.'];
        }

        // D. Hitung Pemakaian Saat Ini (SHARED CALCULATION)
        $usedQuota = Booking::where('tanggal_kirim', $date)
            ->whereIn('jenis_analisis', $typesToCount) // Hitung total gabungan
            ->whereNotIn('status', ['ditolak', 'dibatalkan'])
            ->sum('jumlah_sampel');

        $remainingQuota = $quotaSetting->kuota_maksimal - $usedQuota;

        // E. Cek Limit (Hanya jika Strict Mode = 1)
        // Jika Strict = 0 (Soft Limit), user boleh booking meski minus (nanti jadi kuning di kalender)
        if ($quotaSetting->is_strict == 1 && $remainingQuota < $jumlahSampel) {
            return [
                'available' => false,
                'message' => "Kuota penuh! Tersisa: {$remainingQuota}, Diminta: {$jumlahSampel}"
            ];
        }

        return ['available' => true];
    }

    // =================================================================
    // 3. FUNGSI DATA KALENDER (UPDATE AGAR WARNA AKURAT)
    // =================================================================
    public function getCalendarData(Request $request)
    {
        try {
            $month = $request->input('month', Carbon::now()->month);
            $year = $request->input('year', Carbon::now()->year);
            $jenisInput = strtolower($request->input('jenis_analisis', 'metabolit'));

            // Tentukan Group untuk ditampilkan di kalender
            $quotaRuleName = ($jenisInput === 'metabolit') ? 'metabolit' : 'hematologi';
            $typesToCount = [];

            if ($jenisInput === 'metabolit') {
                $typesToCount = ['metabolit'];
            } else {
                // Jika user melihat kalender hematologi, tampilkan total (Hema + Gabungan)
                $typesToCount = ['hematologi', 'hematologi dan metabolit'];
            }

            // Ambil Aturan (Master & Spesifik)
            $masterRule = QuotaSetting::where('jenis_analisis', $quotaRuleName)->whereNull('tanggal')->first();
            $specificRules = QuotaSetting::where('jenis_analisis', $quotaRuleName)
                ->whereYear('tanggal', $year)
                ->whereMonth('tanggal', $month)
                ->get()
                ->keyBy(function ($item) { return $item->tanggal->format('Y-m-d'); });

            // Ambil Data Booking (Grouped by Date)
            $bookings = Booking::select(DB::raw('DATE(tanggal_kirim) as date'), DB::raw('SUM(jumlah_sampel) as total'))
                ->whereYear('tanggal_kirim', $year)
                ->whereMonth('tanggal_kirim', $month)
                ->whereIn('jenis_analisis', $typesToCount) // <--- LOGIKA SHARED
                ->whereNotIn('status', ['ditolak', 'dibatalkan'])
                ->groupBy(DB::raw('DATE(tanggal_kirim)'))
                ->get()
                ->keyBy('date');

            // Generate Response
            $startDate = Carbon::create($year, $month, 1);
            $endDate = $startDate->copy()->endOfMonth();
            $result = [];

            for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                $dateStr = $date->format('Y-m-d');
                $dayOfWeek = $date->dayOfWeek;

                // Default Rule
                $maxQuota = $masterRule ? $masterRule->kuota_maksimal : 15;
                $isStrict = $masterRule ? $masterRule->is_strict : 0;

                // Override jika ada aturan spesifik tanggal ini
                if (isset($specificRules[$dateStr])) {
                    $maxQuota = $specificRules[$dateStr]->kuota_maksimal;
                    $isStrict = $specificRules[$dateStr]->is_strict;
                }

                // Cek Libur
                $isHoliday = false;
                if ($quotaRuleName === 'hematologi' && in_array($dayOfWeek, [5, 6, 0])) $isHoliday = true;
                if ($quotaRuleName === 'metabolit' && in_array($dayOfWeek, [6, 0])) $isHoliday = true;

                // Logika Buka/Tutup
                $isAvailable = true;
                if ($maxQuota === 0) {
                    $isAvailable = false; // Tutup Manual
                } elseif ($isHoliday && !isset($specificRules[$dateStr])) {
                    $isAvailable = false; // Tutup Libur Standar (kecuali dibuka manual)
                } elseif ($isHoliday && isset($specificRules[$dateStr]) && $maxQuota > 0) {
                    $isAvailable = true; // Buka Manual di Hari Libur
                }

                $usedQuota = isset($bookings[$dateStr]) ? (int) $bookings[$dateStr]->total : 0;
                $remaining = max(0, $maxQuota - $usedQuota);

                // Status untuk Frontend
                $statusLabel = 'available';
                if (!$isAvailable) $statusLabel = 'closed';
                else if ($usedQuota >= $maxQuota) {
                    if ($isStrict) $statusLabel = 'full'; // Merah
                    else $statusLabel = 'warning'; // Kuning (Soft Limit)
                }

                $result[] = [
                    'date' => $dateStr,
                    'status' => $statusLabel, // helper untuk frontend
                    'is_available' => $isAvailable,
                    'max_quota' => $maxQuota,
                    'used_quota' => $usedQuota,
                    'remaining_quota' => $remaining,
                    'is_strict' => (bool) $isStrict,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Calendar Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal mengambil data kalender'], 500);
        }
    }

    // =================================================================
    // 4. FUNGSI LAINNYA (Index, Update Status, dll)
    // =================================================================
    public function index(Request $request)
    {
        $bookings = Booking::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $bookings]);
    }

    public function indexAll(Request $request)
    {
        $query = Booking::with(['user', 'analysisItems']);
        if ($request->filled('status')) $query->where('status', $request->status);
        $bookings = $query->orderBy('created_at', 'desc')->get();

        // Transform analysisItems to analysis_items for frontend consistency
        $bookings = $bookings->map(function($booking) {
            $data = $booking->toArray();
            if (isset($data['analysis_items'])) {
                // Already in snake_case, keep it
            } elseif (isset($data['analysisItems'])) {
                // Convert camelCase to snake_case
                $data['analysis_items'] = $data['analysisItems'];
                unset($data['analysisItems']);
            }
            return $data;
        });

        return response()->json(['success' => true, 'data' => $bookings]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:disetujui,ditolak,proses,selesai']);
        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $booking->status = $request->status;
        if ($request->filled('alasan_penolakan')) $booking->alasan_penolakan = $request->alasan_penolakan;
        $booking->save();

        // Trigger notifikasi berdasarkan status
        if ($request->status === 'disetujui' && $oldStatus !== 'disetujui') {
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_disetujui',
                'title' => 'Booking Disetujui',
                'message' => 'Booking Anda telah disetujui oleh teknisi.',
                'booking_id' => $booking->id
            ]);
        } elseif ($request->status === 'ditolak' && $oldStatus !== 'ditolak') {
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'booking_ditolak',
                'title' => 'Booking Ditolak',
                'message' => 'Booking Anda ditolak. Alasan: ' . ($booking->alasan_penolakan ?: '-'),
                'booking_id' => $booking->id
            ]);
        }

        return response()->json(['success' => true, 'data' => $booking]);
    }

    public function cancelBooking($id)
    {
        $booking = Booking::findOrFail($id);

        // Validasi: hanya user pemilik yang bisa cancel
        if ($booking->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk membatalkan pesanan ini.'
            ], 403);
        }

        // Validasi: hanya status tertentu yang bisa dibatalkan
        $cancellableStatuses = ['menunggu', 'disetujui'];
        if (!in_array($booking->status, $cancellableStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan dengan status "' . $booking->status . '" tidak dapat dibatalkan.'
            ], 422);
        }

        // Update status menjadi dibatalkan
        $booking->status = 'dibatalkan';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan.',
            'data' => $booking
        ]);
    }

    public function updateAnalysisResult(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // Update setiap item analisis dengan hasil yang dikirim
        if ($request->has('items')) {
            foreach ($request->items as $itemData) {
                $item = BookingAnalysisItem::find($itemData['id']);
                if ($item && $item->booking_id == $booking->id) {
                    $item->hasil = $itemData['hasil'] ?? null;
                    $item->metode = $itemData['metode'] ?? null;
                    $item->nama_analisis = $itemData['nama_analisis'] ?? null;
                    $item->save();

                    Log::info("Saved item {$item->id}: {$item->nama_item} = {$item->hasil}");
                }
            }
        }

        // Reload booking with items
        $booking = Booking::with('analysisItems')->find($id);

        // Status tetap 'proses' - bukan 'selesai' (simpan draft)
        // Booking updated_at akan otomatis terupdate

        return response()->json([
            'success' => true,
            'message' => 'Draft hasil analisis berhasil disimpan',
            'data' => $booking->toArray()
        ]);
    }

    public function finalizeAnalysis(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // Ubah status menjadi menunggu verifikasi koordinator (bukan langsung selesai)
        $booking->status = 'menunggu_verifikasi';
        $booking->save();

        // Notifikasi ke klien bahwa analisis selesai
        Notification::create([
            'user_id' => $booking->user_id,
            'type' => 'analisis_selesai',
            'title' => 'Analisis Selesai',
            'message' => 'Hasil analisis Anda telah selesai dan sedang menunggu verifikasi.',
            'booking_id' => $booking->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Analisis selesai dan menunggu verifikasi koordinator'
        ]);
    }

    public function kirimKeKoordinator(Request $request, $id)
    {
        $booking = Booking::with('analysisItems', 'user')->findOrFail($id);

        // Ubah status menjadi menunggu verifikasi setelah teknisi kirim
        $booking->status = 'menunggu_verifikasi';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Hasil analisis berhasil dikirim ke Koordinator Lab',
            'data' => $booking
        ]);
    }

    public function verifikasiKoordinator(Request $request, $id)
    {
        $booking = Booking::with('analysisItems', 'user')->findOrFail($id);

        // Ubah status menjadi selesai setelah diverifikasi
        $booking->status = 'selesai';
        $booking->save();

        // Notifikasi ke klien bahwa hasil sudah diverifikasi dan dapat didownload
        Notification::create([
            'user_id' => $booking->user_id,
            'type' => 'hasil_terverifikasi',
            'title' => 'Hasil Terverifikasi',
            'message' => 'Hasil analisis Anda telah diverifikasi dan dapat didownload.',
            'booking_id' => $booking->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hasil analisis berhasil diverifikasi',
            'data' => $booking
        ]);
    }

    // =================================================================
    // HELPER: CEK ACHIEVEMENT PESANAN
    // =================================================================
    private function checkOrderAchievements($userId)
    {
        $totalOrders = Booking::where('user_id', $userId)->count();

        $achievements = DB::table('achievements')
            ->where('type', 'orders')
            ->where('target', '<=', $totalOrders)
            ->get();

        foreach ($achievements as $achievement) {
            $exists = DB::table('user_achievements')
                ->where('user_id', $userId)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (!$exists) {
                DB::table('user_achievements')->insert([
                    'user_id' => $userId,
                    'achievement_id' => $achievement->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}
