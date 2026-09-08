<?php
$rentals = App\Models\InstrumentRental::whereHas('items', function($q){
    $q->where('instrument_id', 2);
})->with('items')->get();
echo json_encode($rentals->toArray(), JSON_PRETTY_PRINT);
