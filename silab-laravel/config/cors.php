<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS (Cross-Origin Resource Sharing) Options
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    |
    */

    'paths' => ['api/*', 'storage/*'],

    'allowed_methods' => ['*'],

'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://10.20.20.2:3000',   // React CRA
    'http://10.20.20.2:5173',   // React Vite (jika pakai)
],


    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];