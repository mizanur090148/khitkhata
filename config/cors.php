<?php

$customOrigins = array_filter(array_map('trim', explode(',', env('ALLOWED_ORIGINS', ''))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        [
            env('FRONTEND_URL', 'https://knitkhata.com'),
            'https://knitkhata.com',
            'https://www.knitkhata.com',
            'http://knitkhata.com',
            'http://www.knitkhata.com',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://silposetu.test',
        ],
        $customOrigins
    )))),

    'allowed_origins_patterns' => [
        '#^https?://(.*\\.)?knitkhata\\.com(:\\d+)?$#u',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization'],

    'max_age' => 86400,

    'supports_credentials' => true,
];

