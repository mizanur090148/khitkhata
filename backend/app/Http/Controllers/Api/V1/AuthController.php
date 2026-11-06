<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService)
    {
    }

    /**
     * User Login (Supports Mobile Phone OR Email Address)
     */
    public function login(Request $request): JsonResponse
    {
        $identifier = $request->input('identifier') ?? $request->input('phone') ?? $request->input('email');

        if (empty($identifier)) {
            return $this->error('মোবাইল নম্বর অথবা ইমেইল অ্যাড্রেস লিখুন।', 422, [
                'identifier' => ['মোবাইল নম্বর অথবা ইমেইল আবশ্যক।'],
            ]);
        }

        $validated = $request->validate([
            'password' => ['required', 'string'],
            'role' => ['nullable', 'string', 'in:fac,ven,sup,par'],
        ]);

        try {
            $result = $this->authService->authenticate(
                (string) $identifier,
                $validated['password'],
                $validated['role'] ?? 'fac'
            );

            return $this->success([
                'token' => $result['token'],
                'user' => $result['user'],
                'redirect' => [
                    'screen' => ($result['user']['role'] ?? 'fac') === 'fac' ? 'factory' :
                               (($result['user']['role'] ?? '') === 'ven' ? 'vendor' :
                               (($result['user']['role'] ?? '') === 'sup' ? 'supplier' : 'factory')),
                    'view' => 'dash',
                ],
            ], 'সফলভাবে সাইন ইন হয়েছে');
        } catch (ValidationException $e) {
            return $this->error($e->getMessage(), 401, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('সাইন ইন করতে সমস্যা হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    /**
     * User Registration
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', 'in:fac,ven,sup,par'],
            'organization_name' => ['nullable', 'string', 'max:180'],
            'area' => ['nullable', 'string', 'max:120'],
            'designation' => ['nullable', 'string', 'max:100'],
            'machines_count' => ['nullable', 'integer', 'min:1'],
            'plan_code' => ['nullable', 'string', 'in:s,g,p,e'],
            'billing_cycle' => ['nullable', 'string', 'in:m,y'],
            'vendor_type' => ['nullable', 'string', 'max:60'],
            'items' => ['nullable', 'array'],
            'partner_code' => ['nullable', 'string', 'max:50'],
        ]);

        try {
            $result = $this->authService->register($validated);

            return $this->success([
                'token' => $result['token'],
                'user' => $result['user'],
                'redirect' => [
                    'screen' => $result['user']['role'] === 'fac' ? 'factory' :
                               ($result['user']['role'] === 'ven' ? 'vendor' :
                               ($result['user']['role'] === 'sup' ? 'supplier' : 'factory')),
                    'view' => 'dash',
                ],
            ], 'অ্যাকাউন্ট সফলভাবে খোলা হয়েছে। ৩০ দিনের ফ্রি ট্রায়াল সক্রিয়।', 201);
        } catch (ValidationException $e) {
            return $this->error($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('অ্যাকাউন্ট খুলতে ত্রুটি হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Send OTP
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'purpose' => ['nullable', 'string', 'in:register,login,reset'],
        ]);

        try {
            $code = $this->authService->sendOtp($validated['phone'], $validated['purpose'] ?? 'register');

            return $this->success([
                'phone' => $validated['phone'],
                'expires_in_minutes' => 10,
                'demo_code' => config('app.debug') ? $code : null,
            ], 'আপনার মোবাইল নম্বরে ৬ সংখ্যার OTP পাঠানো হয়েছে।');
        } catch (\Throwable $e) {
            return $this->error('OTP পাঠাতে ত্রুটি হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $verified = $this->authService->verifyOtp($validated['phone'], $validated['code']);

        if (!$verified) {
            return $this->error('ওটিপি কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।', 422);
        }

        return $this->success([
            'verified' => true,
            'phone' => $validated['phone'],
        ], 'মোবাইল নম্বর সফলভাবে যাচাই করা হয়েছে।');
    }

    /**
     * Reset Password via OTP
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        try {
            $result = $this->authService->resetPassword(
                $validated['identifier'],
                $validated['code'],
                $validated['password']
            );

            return $this->success([
                'token' => $result['token'],
                'user' => $result['user'],
            ], 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
        } catch (ValidationException $e) {
            return $this->error($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('পাসওয়ার্ড রিসেট করতে ত্রুটি হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Current Authenticated User & Tenant Info
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->error('অননুমোদিত অ্যাক্সেস', 401);
        }

        $user->load(['factory.machines', 'vendor', 'supplier', 'partner']);

        return $this->success([
            'user' => $user,
            'factory' => $user->factory,
            'vendor' => $user->vendor,
            'supplier' => $user->supplier,
            'partner' => $user->partner,
        ]);
    }

    /**
     * Update Profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user() ?? User::first();
        if ($user) {
            $user->update([
                'name' => $request->input('name', $user->name),
                'email' => $request->input('email', $user->email),
                'designation' => $request->input('designation', $user->designation),
                'organization_name' => $request->input('organization_name', $user->organization_name),
                'profile_json' => $request->input('profile', $user->profile_json),
            ]);
        }

        return $this->success($user, 'প্রোফাইল তথ্য সফলভাবে সেভ হয়েছে');
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'সফলভাবে লগআউট হয়েছে');
    }
}
