<?php

namespace App\Services;

use App\Models\Factory;
use Carbon\Carbon;

class SubscriptionService
{
    public const PLAN_STARTER = 's';
    public const PLAN_GROWTH = 'g';
    public const PLAN_PRO = 'p';
    public const PLAN_ENTERPRISE = 'e';

    public const PLANS = [
        self::PLAN_STARTER => [
            'code' => 's',
            'name' => 'স্টার্টার',
            'min_machines' => 1,
            'max_machines' => 10,
            'monthly_price' => 1000,
            'annual_price' => 10000, // 2 months free
            'features' => [
                'orders' => true,
                'production' => true,
                'qc' => true,
                'challans' => true,
                'bills' => true,
                'yarn_tracker' => true,
                'qr_stickers' => true,
                'attendance' => false,
                'payroll' => false,
                'custom_api' => false,
            ],
        ],
        self::PLAN_GROWTH => [
            'code' => 'g',
            'name' => 'গ্রোথ',
            'min_machines' => 11,
            'max_machines' => 25,
            'monthly_price' => 1500,
            'annual_price' => 15000,
            'features' => [
                'orders' => true,
                'production' => true,
                'qc' => true,
                'challans' => true,
                'bills' => true,
                'yarn_tracker' => true,
                'qr_stickers' => true,
                'attendance' => true,
                'payroll' => true,
                'store_inventory' => true,
                'custom_api' => false,
            ],
        ],
        self::PLAN_PRO => [
            'code' => 'p',
            'name' => 'প্রো',
            'min_machines' => 26,
            'max_machines' => 60,
            'monthly_price' => 2500,
            'annual_price' => 25000,
            'features' => [
                'orders' => true,
                'production' => true,
                'qc' => true,
                'challans' => true,
                'bills' => true,
                'yarn_tracker' => true,
                'qr_stickers' => true,
                'attendance' => true,
                'payroll' => true,
                'store_inventory' => true,
                'vendor_direct_sign' => true,
                'multi_shift_planning' => true,
                'custom_api' => false,
            ],
        ],
        self::PLAN_ENTERPRISE => [
            'code' => 'e',
            'name' => 'এন্টারপ্রাইজ',
            'min_machines' => 61,
            'max_machines' => 9999,
            'monthly_price' => 4000,
            'annual_price' => 40000,
            'features' => [
                'orders' => true,
                'production' => true,
                'qc' => true,
                'challans' => true,
                'bills' => true,
                'yarn_tracker' => true,
                'qr_stickers' => true,
                'attendance' => true,
                'payroll' => true,
                'store_inventory' => true,
                'vendor_direct_sign' => true,
                'multi_shift_planning' => true,
                'custom_api' => true,
                'dedicated_account_manager' => true,
            ],
        ],
    ];

    /**
     * Determine recommended plan code given machine count.
     */
    public function getPlanForMachineCount(int $count): string
    {
        if ($count <= 10) {
            return self::PLAN_STARTER;
        }
        if ($count <= 25) {
            return self::PLAN_GROWTH;
        }
        if ($count <= 60) {
            return self::PLAN_PRO;
        }
        return self::PLAN_ENTERPRISE;
    }

    /**
     * Get plan configuration.
     */
    public function getPlan(string $planCode): ?array
    {
        return self::PLANS[$planCode] ?? self::PLANS[self::PLAN_STARTER];
    }

    /**
     * Check if tenant is currently in active trial.
     */
    public function isTrialActive(Factory $factory): bool
    {
        if (!$factory->trial_ends_at) {
            return false;
        }
        return Carbon::parse($factory->trial_ends_at)->isFuture();
    }

    /**
     * Check if tenant can add another machine under current plan quota.
     */
    public function canAddMachine(Factory $factory): bool
    {
        $plan = $this->getPlan($factory->plan_code ?? self::PLAN_STARTER);
        $currentCount = $factory->machines()->count();
        return $currentCount < $plan['max_machines'];
    }

    /**
     * Check if a specific feature is enabled for the tenant.
     */
    public function canAccessFeature(Factory $factory, string $feature): bool
    {
        $plan = $this->getPlan($factory->plan_code ?? self::PLAN_STARTER);
        return !empty($plan['features'][$feature]);
    }
}

