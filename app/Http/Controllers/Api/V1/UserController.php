<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
        public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'designation' => ['required', 'string', 'max:80'],
            'role' => ['required', 'string', 'in:fac,ven,sup,par'],
            'can_message' => ['nullable', 'boolean'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();

        $user = User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'password' => bcrypt('demo1234'),
            'role' => $validated['role'],
            'designation' => $validated['designation'],
            'organization_name' => $factory->name,
            'factory_id' => $factory->id,
            'is_owner' => false,
            'is_vendor_rep' => false,
            'can_message' => (bool) ($validated['can_message'] ?? true),
            'is_active' => true,
            'last_login_label' => 'নতুন যোগকৃত',
        ]);

        return $this->success($user, "{$user->name} টিম মেম্বার হিসেবে যুক্ত হয়েছেন।", 201);
    }

        public function toggleUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return $this->success($user, "{$user->name} এর অ্যাক্টিভেশন স্ট্যাটাস আপডেট হয়েছে।");
    }
}
