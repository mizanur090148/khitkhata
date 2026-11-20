<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

// Health / Status check endpoint
Route::get('/api-status', function () {
    return response()->json([
        'name' => 'Silposetu (নিটখাতা) Enterprise API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => PHP_VERSION,
        'status' => 'operational',
        'health' => url('/api/v1/health'),
    ]);
});

Route::get('/', function () {
    return response()->json([
        'name' => 'Silposetu (নিটখাতা) Enterprise REST API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => PHP_VERSION,
        'status' => 'operational',
        'api_docs' => url('/api/v1/health'),
    ]);
});


