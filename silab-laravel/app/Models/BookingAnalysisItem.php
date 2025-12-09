<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BookingAnalysisItem extends Model
{
    use HasFactory;
    protected $table = 'booking_analysis_items';

    protected $fillable = [
        'booking_id',
        'nama_item',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
