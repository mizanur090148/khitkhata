<?php

namespace App\Services;

use App\Models\AuthOtp;
use App\Models\Factory;
use App\Models\Partner;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        protected TenantService $tenantService,
        protected SubscriptionService $subscriptionService
    ) {
    }

    /**
     * Clean Bengali numerals, spaces, and prefixes to standardize phone.
     */
    public function normalizePhone(string $phone): string
    {
        $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $clean = str_replace($bn, $en, trim($phone));
        $clean = preg_replace('/[\s\-]/', '', $clean);
        $clean = preg_replace('/^\+?88/', '', $clean);

        return $clean;
    }

    /**
     * Authenticate user with mobile phone OR email, password, and expected role.
     */
    public function authenticate(string $identifier, string $password, ?string $role = null): array
    {
        $identifier = trim($identifier);
        $user = null;

        // 1. Check if identifier is an email address
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL) || str_contains($identifier, '@')) {
            $user = User::where('email', strtolower($identifier))->first();
        } else {
            // 2. Otherwise treat as mobile phone number
            $normPhone = $this->normalizePhone($identifier);
            if (!empty($normPhone)) {
                $user = User::where('phone', $normPhone)->first();
            }
        }

        // 3. Fallback for demo credentials
        if (!$user) {
            $isDemo = in_array(strtolower($identifier), [
                'demo', 'admin', '01711000000', '01711889900', '01xxxxxxxxx',
                'demo@silposetu.com', 'demo@knitkhata.com', 'owner@knitkhata.com'
            ]);

            if ($isDemo) {
                $user = $this->createDemoUser($identifier, $role ?? 'fac');
            } else {
                throw ValidationException::withMessages([
                    'identifier' => ['এই মোবাইল নম্বর বা ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।'],
                ]);
            }
        }

        // 4. Verify password strictly
        if (!Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['পাসওয়ার্ড সঠিক নয়। পুনরায় চেষ্টা করুন।'],
            ]);
        }

        // 5. Update last login
        $user->update([
            'last_login_label' => 'এখন',
            'is_active' => true,
        ]);

        // 6. Load relevant model relations
        if ($user->role === 'fac' && $user->factory_id) {
            $user->load(['factory.machines']);
        } elseif ($user->role === 'ven' && $user->vendor_id) {
            $user->load('vendor');
        } elseif ($user->role === 'sup' && $user->supplier_id) {
            $user->load('supplier');
        } elseif ($user->role === 'par') {
            $user->load('partner');
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $this->formatUserPayload($user),
        ];
    }

    /**
     * Register a new user across any B2B ecosystem role.
     */
    public function register(array $data): array
    {
        $phone = $this->normalizePhone($data['phone']);
        $email = !empty($data['email']) ? strtolower(trim($data['email'])) : null;

        if (empty($phone) || strlen($phone) < 11) {
            throw ValidationException::withMessages([
                'phone' => ['সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'],
            ]);
        }

        if (User::where('phone', $phone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => ['এই মোবাইল নম্বর দিয়ে ইতিমধ্যেই অ্যাকাউন্ট রয়েছে। লগইন করুন।'],
            ]);
        }

        if ($email && User::where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['এই ইমেইল দিয়ে ইতিমধ্যেই অ্যাকাউন্ট রয়েছে। লগইন করুন।'],
            ]);
        }

        $role = $data['role'] ?? 'fac';

        return DB::transaction(function () use ($data, $phone, $email, $role) {
            $user = new User();
            $user->name = $data['name'];
            $user->phone = $phone;
            $user->email = $email;
            $user->password = Hash::make($data['password'] ?? '12345678');
            $user->role = $role;
            $user->organization_name = $data['organization_name'] ?? null;
            $user->designation = $data['designation'] ?? ($role === 'fac' ? 'মালিক' : 'প্রতিনিধি');
            $user->phone_verified_at = Carbon::now();

            // Factory Tenant Registration
            if ($role === 'fac') {
                $factory = $this->tenantService->provisionFactory([
                    'name' => $data['organization_name'] ?? ($data['name'] . ' নিটিং'),
                    'area' => $data['area'] ?? 'গাজীপুর',
                    'phone' => $phone,
                    'machines_count' => $data['machines_count'] ?? 12,
                    'plan_code' => $data['plan_code'] ?? 'g',
                    'billing_cycle' => $data['billing_cycle'] ?? 'm',
                ]);

                $user->factory_id = $factory->id;
                $user->subscription_plan = $factory->plan_code;
                $user->billing_cycle = $factory->billing_cycle;
                $user->trial_ends_at = $factory->trial_ends_at;

                $factory->owner_id = null; // will be updated after user save
            }

            // Vendor Registration
            if ($role === 'ven') {
                $vendor = Vendor::create([
                    'code' => 'ven_' . Str::random(6),
                    'name' => $data['organization_name'] ?? $data['name'],
                    'type' => $data['vendor_type'] ?? 'বায়িং হাউস',
                    'contact_person' => $data['name'],
                    'phone' => $phone,
                    'email' => $email,
                    'area' => $data['area'] ?? 'উত্তরা, ঢাকা',
                    'is_verified' => true,
                ]);
                $user->vendor_id = $vendor->id;
            }

            // Supplier Registration
            if ($role === 'sup') {
                $supplier = Supplier::create([
                    'code' => 'sup_' . Str::random(6),
                    'name' => $data['organization_name'] ?? $data['name'],
                    'contact_person' => $data['name'],
                    'phone' => $phone,
                    'email' => $email,
                    'area' => $data['area'] ?? 'ঢাকা',
                    'supplied_items_json' => $data['items'] ?? ['মেশিন', 'স্পেয়ার পার্টস'],
                    'is_verified' => true,
                ]);
                $user->supplier_id = $supplier->id;
            }

            // Partner Registration
            if ($role === 'par') {
                $partnerCode = 'PAR-' . strtoupper(Str::random(5));
                $partner = Partner::create([
                    'user_id' => 1,
                    'partner_code' => $partnerCode,
                    'status' => 'active',
                ]);
                $user->partner_code = $partnerCode;
            }

            $user->save();

            // Link Factory Owner
            if ($role === 'fac' && isset($factory)) {
                $factory->owner_id = $user->id;
                $factory->saveQuietly();
            }

            // Link Vendor Owner
            if ($role === 'ven' && isset($vendor)) {
                $vendor->user_id = $user->id;
                $vendor->saveQuietly();
            }

            // Link Supplier Owner
            if ($role === 'sup' && isset($supplier)) {
                $supplier->user_id = $user->id;
                $supplier->saveQuietly();
            }

            // Link Partner User
            if ($role === 'par' && isset($partner)) {
                $partner->user_id = $user->id;
                $partner->saveQuietly();
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return [
                'token' => $token,
                'user' => $this->formatUserPayload($user),
            ];
        });
    }

    /**
     * Send OTP to mobile phone.
     */
    public function sendOtp(string $phone, string $purpose = 'register'): string
    {
        $phone = $this->normalizePhone($phone);
        $code = (string) mt_rand(100000, 999999);

        AuthOtp::create([
            'phone' => $phone,
            'code' => $code,
            'purpose' => $purpose,
            'expires_at' => Carbon::now()->addMinutes(10),
            'is_used' => false,
        ]);

        return $code;
    }

    /**
     * Verify OTP for mobile phone.
     */
    public function verifyOtp(string $phone, string $code): bool
    {
        $phone = $this->normalizePhone($phone);

        // Demo fallback allows 123456 or identical digits
        if ($code === '123456' || preg_match('/^(\d)\1{5}$/', $code)) {
            return true;
        }

        $otp = AuthOtp::where('phone', $phone)
            ->where('code', $code)
            ->where('is_used', false)
            ->where('expires_at', '>=', Carbon::now())
            ->latest()
            ->first();

        if ($otp) {
            $otp->is_used = true;
            $otp->save();
            return true;
        }

        return false;
    }

    /**
     * Reset password with verified OTP
     */
    public function resetPassword(string $identifier, string $code, string $newPassword): array
    {
        $identifier = trim($identifier);
        $user = null;

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL) || str_contains($identifier, '@')) {
            $user = User::where('email', strtolower($identifier))->first();
            $phone = $user?->phone ?? '';
        } else {
            $phone = $this->normalizePhone($identifier);
            $user = User::where('phone', $phone)->first();
        }

        if (!$user) {
            throw ValidationException::withMessages([
                'identifier' => ['এই মোবাইল নম্বর বা ইমেইলে কোনো অ্যাকাউন্ট নেই।'],
            ]);
        }

        if (!$this->verifyOtp($phone, $code)) {
            throw ValidationException::withMessages([
                'code' => ['ওটিপি কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।'],
            ]);
        }

        $user->password = Hash::make($newPassword);
        $user->save();

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $this->formatUserPayload($user),
        ];
    }

    /**
     * Helper to format User model for API response.
     */
    public function formatUserPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => $user->role,
            'designation' => $user->designation,
            'organization_name' => $user->organization_name,
            'factory_id' => $user->factory_id,
            'vendor_id' => $user->vendor_id,
            'supplier_id' => $user->supplier_id,
            'partner_code' => $user->partner_code,
            'subscription_plan' => $user->subscription_plan,
            'billing_cycle' => $user->billing_cycle,
            'trial_ends_at' => $user->trial_ends_at,
        ];
    }

    /**
     * Create seamless Demo user if not existing in MySQL.
     */
    protected function createDemoUser(string $identifier, string $role): User
    {
        $factory = Factory::first();
        if (!$factory) {
            $factory = $this->tenantService->provisionFactory([
                'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
                'area' => 'গাজীপুর',
                'phone' => '01711889900',
                'machines_count' => 12,
                'plan_code' => 'g',
            ]);
        }

        $isEmail = str_contains($identifier, '@');
        $phone = $isEmail ? '01711' . rand(100000, 999999) : $this->normalizePhone($identifier);
        $email = $isEmail ? strtolower($identifier) : 'demo@silposetu.com';

        return User::create([
            'name' => $role === 'fac' ? 'হাজী মোঃ রফিকুল ইসলাম' : 'ডেমো ইউজার',
            'phone' => !empty($phone) ? $phone : '01711889900',
            'email' => $email,
            'password' => Hash::make('demo1234'),
            'role' => $role,
            'factory_id' => $factory->id,
            'organization_name' => $factory->name,
            'designation' => $role === 'fac' ? 'মালিক / এমডি' : 'মার্চেন্ডাইজার',
            'phone_verified_at' => Carbon::now(),
        ]);
    }
}
