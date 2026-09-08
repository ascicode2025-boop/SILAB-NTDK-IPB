<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
print_r(\App\Models\InstrumentRental::where('user_id', 5)->pluck('status')->toArray());
