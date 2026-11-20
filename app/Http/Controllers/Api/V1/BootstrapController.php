<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\KnitKhataDomainService;
use Illuminate\Http\JsonResponse;

class BootstrapController extends Controller
{
    public function __construct(
        private readonly KnitKhataDomainService $domainService
    ) {}

    public function index(): JsonResponse
    {
        return $this->success(
            $this->domainService->getBootstrapPayload(),
            'নিটখাতা (Silposetu) ডেটা সফলভাবে লোড হয়েছে'
        );
    }

    public function health(): JsonResponse
    {
        return $this->success([
            'app' => 'Silposetu (নিটখাতা) Enterprise API',
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'timestamp' => now()->toIso8601String(),
        ], 'API সচল রয়েছে');
    }
}

