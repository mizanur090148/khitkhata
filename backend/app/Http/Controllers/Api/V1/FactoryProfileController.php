<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FactoryProfileController extends Controller
{
    public function updateFactoryProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'area' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'total_machines' => ['nullable', 'integer', 'min:1'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();
        $factory->update($validated);

        return $this->success($factory, 'ফ্যাক্টরি প্রোফাইল ও সেটিংস সংরক্ষিত হয়েছে।');
    }
}
