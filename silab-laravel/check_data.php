<?php
$instrument = App\Models\Instrument::find(2);
echo json_encode($instrument->toArray(), JSON_PRETTY_PRINT);
$rentals = App\Models\InstrumentRental::whereHas('instruments', function($q){
    $q->where('instrument_id', 2);
})->with('instruments')->get();
echo "\nRentals:\n";
echo json_encode($rentals->toArray(), JSON_PRETTY_PRINT);
