<?php

namespace App\Services;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantService
{
    public function __construct(protected SubscriptionService $subscriptionService)
    {
    }

    /**
     * Provision a new Factory Tenant.
     */
    public function provisionFactory(array $data): Factory
    {
        return DB::transaction(function () use ($data) {
            $machineCount = max(1, (int) ($data['machines_count'] ?? 12));
            $planCode = $data['plan_code'] ?? $this->subscriptionService->getPlanForMachineCount($machineCount);
            $billingCycle = $data['billing_cycle'] ?? 'm';

            $code = 'fac_' . Str::slug(Str::substr($data['name'] ?? 'factory', 0, 10)) . '_' . mt_rand(100, 999);

            $factory = Factory::create([
                'code' => $code,
                'name' => $data['name'] ?? 'নতুন নিটিং ফ্যাক্টরি',
                'area' => $data['area'] ?? 'গাজীপুর',
                'address' => $data['address'] ?? ($data['area'] ?? 'গাজীপুর'),
                'phone' => $data['phone'] ?? null,
                'total_machines' => $machineCount,
                'plan_code' => $planCode,
                'billing_cycle' => $billingCycle,
                'trial_ends_at' => Carbon::now()->addDays(30),
                'qr_sticker_enabled' => true,
                'last_update_label' => 'আজ ' . date('h:i A'),
                'settings_json' => [
                    'currency' => 'BDT',
                    'default_rate_kg' => 28.50,
                    'shifts' => ['Day (8:00 AM - 8:00 PM)', 'Night (8:00 PM - 8:00 AM)'],
                ],
            ]);

            // Seed initial machines according to machine count
            $this->seedInitialMachines($factory, $machineCount);

            return $factory;
        });
    }

    /**
     * Seed default circular & flat knitting machines.
     */
    public function seedInitialMachines(Factory $factory, int $count): void
    {
        $dias = [30, 32, 34, 28];
        $gauges = [24, 28, 20];
        $fabrics = ['Single Jersey', 'Interlock', 'Fleece', 'Rib 1x1', 'Terry'];

        $toCreate = min($count, 24); // seed up to 24 machines initially
        for ($i = 1; $i <= $toCreate; $i++) {
            $dia = $dias[($i - 1) % count($dias)];
            $gauge = $gauges[($i - 1) % count($gauges)];
            $code = 'M-' . str_pad($i, 2, '0', STR_PAD_LEFT);

            FactoryMachine::create([
                'factory_id' => $factory->id,
                'code' => $code,
                'knit_type' => 'c',
                'dia' => $dia,
                'gauge' => $gauge,
                'spec_label' => "{$dia}\" × {$gauge}G",
                'brand' => ($i % 2 === 0) ? 'Mayer & Cie' : 'Terrot',
                'status' => 'idle',
                'daily_capacity_kg' => 180 + (($i % 4) * 15),
                'rate_label' => '২৮.৫০ ৳/কেজি',
                'supported_fabrics_json' => array_slice($fabrics, 0, 3),
            ]);
        }
    }

    /**
     * Add a machine to an existing factory tenant with quota check.
     */
    public function addMachine(Factory $factory, array $machineData): FactoryMachine
    {
        if (!$this->subscriptionService->canAddMachine($factory)) {
            throw new \RuntimeException('আপনার বর্তমান প্যাকেজের মেশিনের লিমিট পূর্ণ হয়েছে। অনুগ্রহ করে প্যাকেজ আপগ্রেড করুন।');
        }

        return FactoryMachine::create(array_merge($machineData, [
            'factory_id' => $factory->id,
        ]));
    }
}

