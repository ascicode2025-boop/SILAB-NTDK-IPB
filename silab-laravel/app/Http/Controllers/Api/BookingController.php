<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\QuotaSetting;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized: Token tidak valid atau sesi habis.'], 401);
        }

        $bookings = Booking::with('analysisItems')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $bookings]);
    }
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Sesi Anda telah berakhir. Silakan Logout dan Login ulang.'], 401);
        }

        try {

            $request->validate([
                'tanggal_kirim' => 'required|date',
                'jenis_analisis' => 'required',
                'jenis_hewan' => 'required|string',
                'jenis_kelamin' => 'required|string',
                'umur' => 'required|string',
                'status_fisiologis' => 'required|string',
                'jumlah_sampel' => 'required|integer|min:1',
                'analisis_items' => 'array'
            ]);

            $inputAnalisis = strtolower($request->jenis_analisis);
            $jenisAnalisisDb = '';

            if ($inputAnalisis == 'hematologi') $jenisAnalisisDb = 'Hematologi';
            elseif ($inputAnalisis == 'metabolit') $jenisAnalisisDb = 'Metabolit';
            else $jenisAnalisisDb = 'Hematologi & Metabolit';


            $tanggal = Carbon::parse($request->tanggal_kirim);
            $dayOfWeek = $tanggal->dayOfWeek;

            $isHemLibur = in_array($dayOfWeek, [0, 5, 6]);
            $isMetLibur = in_array($dayOfWeek, [0, 6]);

            if ($jenisAnalisisDb == 'Hematologi' && $isHemLibur) return response()->json(['message' => 'Maaf, Hematologi tutup Jumat-Minggu.'], 422);
            if ($jenisAnalisisDb == 'Metabolit' && $isMetLibur) return response()->json(['message' => 'Maaf, Metabolit tutup Sabtu-Minggu.'], 422);
            if ($jenisAnalisisDb == 'Hematologi & Metabolit' && ($isHemLibur || $isMetLibur)) return response()->json(['message' => 'Layanan Gabungan tidak tersedia (Lab Tutup).'], 422);


            $quotaHem = QuotaSetting::where('tanggal', $request->tanggal_kirim)->where('jenis_analisis', 'hematologi')->first();
            $quotaMet = QuotaSetting::where('tanggal', $request->tanggal_kirim)->where('jenis_analisis', 'metabolit')->first();

            $maxHem = $quotaHem ? $quotaHem->kuota_maksimal : 15;
            $maxMet = $quotaMet ? $quotaMet->kuota_maksimal : 15;

            $usedHem = Booking::where('tanggal_kirim', $request->tanggal_kirim)
                ->whereIn('jenis_analisis', ['Hematologi', 'Hematologi & Metabolit'])
                ->where('status', '!=', 'Ditolak')
                ->sum('jumlah_sampel');

            $usedMet = Booking::where('tanggal_kirim', $request->tanggal_kirim)
                ->whereIn('jenis_analisis', ['Metabolit', 'Hematologi & Metabolit'])
                ->where('status', '!=', 'Ditolak')
                ->sum('jumlah_sampel');

            $jumlahDiminta = $request->jumlah_sampel;

            if ($jenisAnalisisDb == 'Hematologi') {
                if (($usedHem + $jumlahDiminta) > $maxHem) return response()->json(['message' => "Kuota Hematologi Penuh. Sisa: " . ($maxHem - $usedHem)], 422);
            } elseif ($jenisAnalisisDb == 'Metabolit') {
                if (($usedMet + $jumlahDiminta) > $maxMet) return response()->json(['message' => "Kuota Metabolit Penuh. Sisa: " . ($maxMet - $usedMet)], 422);
            } else {
                if (($usedHem + $jumlahDiminta) > $maxHem || ($usedMet + $jumlahDiminta) > $maxMet) return response()->json(['message' => 'Kuota layanan penuh.'], 422);
            }

            $prefixAnalisis = 'HEM';
            if ($jenisAnalisisDb == 'Metabolit') $prefixAnalisis = 'MET';
            elseif ($jenisAnalisisDb == 'Hematologi & Metabolit') $prefixAnalisis = 'HM';

            $hewanInput = strtolower($request->jenis_hewan);
            $kodeHewan = 'XX';

            switch ($hewanInput) {
                case 'sapi': $kodeHewan = 'SP'; break;
                case 'sapi potong': $kodeHewan = 'SP'; break;
                case 'sapi perah': $kodeHewan = 'SP'; break;
                case 'kerbau': $kodeHewan = 'KB'; break;
                case 'kambing': $kodeHewan = 'KM'; break;
                case 'domba': $kodeHewan = 'DB'; break;
                case 'ayam': $kodeHewan = 'AY'; break;
                case 'bebek': $kodeHewan = 'BB'; break;
                case 'itik': $kodeHewan = 'IT'; break;
                case 'kuda': $kodeHewan = 'KD'; break;
                case 'babi': $kodeHewan = 'BG'; break;
                case 'lainnya':
                    $lain = $request->jenis_hewan_lain;
                    $kodeHewan = $lain ? strtoupper(substr($lain, 0, 2)) : 'LN';
                    break;
                default:
                    $kodeHewan = strtoupper(substr($request->jenis_hewan, 0, 2));
                    break;
            }

            $dateCode = $tanggal->format('ymd');

            $lastBooking = Booking::whereDate('created_at', Carbon::today())
                ->where('jenis_analisis', $jenisAnalisisDb)
                ->latest()
                ->first();

            $sequence = 1;
            if ($lastBooking) {
                $parts = explode('-', $lastBooking->kode_sampel);
                $lastSequence = intval(end($parts));
                $sequence = $lastSequence + 1;
            }

            $kodeSampel = sprintf("%s-%s-%s-%03d", $prefixAnalisis, $kodeHewan, $dateCode, $sequence);

            DB::beginTransaction();

            $booking = Booking::create([
                'user_id' => Auth::id(),
                'kode_sampel' => $kodeSampel,
                'jenis_analisis' => $jenisAnalisisDb,
                'tanggal_kirim' => $request->tanggal_kirim,
                'status' => 'Menunggu Persetujuan',
                'jenis_hewan' => $request->jenis_hewan,
                'jenis_hewan_lain' => $request->jenis_hewan_lain,
                'jenis_kelamin' => $request->jenis_kelamin,
                'umur' => $request->umur,
                'status_fisiologis' => $request->status_fisiologis,
                'jumlah_sampel' => $request->jumlah_sampel,
            ]);

            if ($request->has('analisis_items') && is_array($request->analisis_items)) {
                foreach ($request->analisis_items as $item) {
                    $booking->analysisItems()->create(['nama_item' => $item]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Pemesanan berhasil!', 'data' => $booking], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Booking Error: " . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan Server.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    public function indexAll(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $bookings = Booking::with(['user', 'analysisItems'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $bookings]);
    }

    public function updateStatus(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'status' => 'required|string',
            'alasan' => 'nullable|string'
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;

        if ($request->alasan) {
            $booking->alasan_penolakan = $request->alasan;
        }

        $booking->save();

        return response()->json([
            'message' => 'Status berhasil diperbarui',
            'data' => $booking
        ]);
    }

    public function updateAnalysisResult(Request $request, $id)
{
    if (!Auth::check()) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $request->validate([
        'items' => 'required|array',
        'items.*.id' => 'required|exists:analysis_items,id',
        'items.*.hasil' => 'nullable|string',
        'items.*.metode' => 'nullable|string'
    ]);

    DB::beginTransaction();

    try {
        $booking = Booking::with('analysisItems')->findOrFail($id);

        foreach ($request->items as $item) {
            $analysisItem = $booking->analysisItems
                ->firstWhere('id', $item['id']);

            if ($analysisItem) {
                $analysisItem->update([
                    'hasil'  => $item['hasil'],
                    'metode' => $item['metode'] ?? 'Lab Test',
                ]);
            }
        }

        // OPTIONAL: otomatis set status selesai
        $booking->update([
            'status' => 'Selesai'
        ]);

        DB::commit();

        return response()->json([
            'message' => 'Hasil analisis berhasil disimpan',
            'data' => $booking->fresh('analysisItems')
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        Log::error('Update Analysis Error: '.$e->getMessage());

        return response()->json([
            'message' => 'Gagal menyimpan hasil analisis',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
