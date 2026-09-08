<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$klien = \App\Models\User::where('role', 'klien')->first();
echo "Client ID: " . $klien->id . "\n";
echo "Rentals user_ids: \n";
print_r(\App\Models\InstrumentRental::pluck('user_id')->toArray());
