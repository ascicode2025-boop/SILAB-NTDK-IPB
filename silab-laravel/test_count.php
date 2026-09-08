<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$klien = \App\Models\User::where('role', 'klien')->first();
echo "Total Rentals: " . \App\Models\InstrumentRental::count() . "\n";
echo "Klien Rentals: " . \App\Models\InstrumentRental::where('user_id', $klien->id)->count() . "\n";
