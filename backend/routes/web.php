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

// Single Page Application (SPA) entry point for all web routes
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return Response::file($indexPath, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    return response()->json([
        'name' => 'Silposetu (নিটখাতা) Enterprise API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => PHP_VERSION,
        'status' => 'operational',
        'notice' => 'Frontend React SPA has not been deployed to public/ yet.',
    ]);
})->where('any', '^(?!api).*$');


