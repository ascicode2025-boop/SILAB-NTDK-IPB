<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\QuotaSetting;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class QuotaController extends Controller
{
    public function getMonthlyQuota(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $month = $request->input('month', date('m'));

        $viewMode = strtolower($request->input('jenis_analisis', 'metabolit'));

        $daysInMonth = Carbon::createFromDate($year, $month)->daysInMonth;
        $calendarData = [];

        $customSettings = QuotaSetting::whereYear('tanggal', $year)
            ->whereMonth('tanggal', $month)
            ->where('jenis_analisis', $viewMode)
            ->get()
            ->keyBy(function ($item) {
                return $item->tanggal->format('Y-m-d');
            });

        $targetTypes = [];
        if ($viewMode == 'hematologi') {
            $targetTypes = ['Hematologi', 'Hematologi & Metabolit'];
        } else {
            $targetTypes = ['Metabolit', 'Hematologi & Metabolit'];
        }

        $bookingsCount = Booking::select(DB::raw('DATE(tanggal_kirim) as tgl'), DB::raw('SUM(jumlah_sampel) as total'))
            ->whereYear('tanggal_kirim', $year)
            ->whereMonth('tanggal_kirim', $month)
            ->whereIn('jenis_analisis', $targetTypes)
            ->where('status', '!=', 'Ditolak')
            ->groupBy('tgl')
            ->get()
            ->keyBy('tgl');

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::createFromDate($year, $month, $day);
            $dateString = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeek;

            $maxQuota = 15;
            if (isset($customSettings[$dateString])) {
                $maxQuota = $customSettings[$dateString]->kuota_maksimal;
            }

            $isAvailable = true;
            $statusLabel = 'Tersedia';

            if ($viewMode == 'hematologi') {
                if (in_array($dayOfWeek, [0, 5, 6])) { // Jum, Sab, Min
                    $isAvailable = false; $statusLabel = 'Libur'; $maxQuota = 0;
                }
            } else {
                if (in_array($dayOfWeek, [0, 6])) { // Sab, Min
                    $isAvailable = false; $statusLabel = 'Libur'; $maxQuota = 0;
                }
            }

            if (isset($customSettings[$dateString])) {
                if ($maxQuota == 0) {
                    $isAvailable = false; $statusLabel = 'Tutup Manual';
                } elseif ($maxQuota > 0) {
                    $isAvailable = true; $statusLabel = 'Tersedia';
                }
            }

            $usedQuota = isset($bookingsCount[$dateString]) ? (int)$bookingsCount[$dateString]->total : 0;

            $remainingQuota = max(0, $maxQuota - $usedQuota);

            if ($isAvailable && $remainingQuota == 0 && $maxQuota > 0) {
                $statusLabel = 'Penuh';
            }

            $calendarData[] = [
                'date' => $dateString,
                'day' => $day,
                'status' => $statusLabel,
                'is_available' => $isAvailable,
                'max_quota' => $maxQuota,
                'used_quota' => $usedQuota,
                'remaining_quota' => $remainingQuota
            ];
        }

        return response()->json([
            'message' => 'Data kalender berhasil diambil',
            'data' => $calendarData
        ]);
    }

    public function updateQuota(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'jenis_analisis' => 'required|in:hematologi,metabolit',
            'kuota_maksimal' => 'required|integer|min:0',
            'terapkan_semua' => 'boolean'
        ]);

        $targetDate = Carbon::parse($request->tanggal);
        $jenis = $request->jenis_analisis;
        $kuota = $request->kuota_maksimal;

        if ($request->terapkan_semua) {
            $startOfWeek = $targetDate->copy()->startOfWeek();
            $endOfWeek = $targetDate->copy()->endOfWeek();
            $current = $startOfWeek;

            while ($current->lte($endOfWeek)) {
                $dayOfWeek = $current->dayOfWeek;
                $isStandardHoliday = false;

                if ($jenis == 'hematologi' && in_array($dayOfWeek, [0, 5, 6])) $isStandardHoliday = true;
                if ($jenis == 'metabolit' && in_array($dayOfWeek, [0, 6])) $isStandardHoliday = true;

                if (!$isStandardHoliday) {
                    QuotaSetting::updateOrCreate(
                        ['tanggal' => $current->format('Y-m-d'), 'jenis_analisis' => $jenis],
                        ['kuota_maksimal' => $kuota]
                    );
                }
                $current->addDay();
            }
            return response()->json(['message' => 'Kuota minggu ini berhasil diperbarui']);

        } else {
            QuotaSetting::updateOrCreate(
                ['tanggal' => $request->tanggal, 'jenis_analisis' => $jenis],
                ['kuota_maksimal' => $kuota]
            );
            return response()->json(['message' => 'Kuota berhasil diperbarui']);
        }
    }
}
