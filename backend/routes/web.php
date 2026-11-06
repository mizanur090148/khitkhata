<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Silposetu (নিটখাতা) Enterprise API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => PHP_VERSION,
        'status' => 'operational',
        'documentation' => '/api/v1/health',
    ]);
});

