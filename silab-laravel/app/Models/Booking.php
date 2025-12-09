<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_kirim' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function analysisItems()
    {
        return $this->hasMany(BookingAnalysisItem::class);
    }
}
