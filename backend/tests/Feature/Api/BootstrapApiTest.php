<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BootstrapApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_bootstrap_endpoint_returns_200_and_complete_payload(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
            'area' => 'কোনাবাড়ী, গাজীপুর',
            'total_machines' => 24,
            'plan_code' => 'g',
        ]);

        FactoryMachine::create([
            'factory_id' => $factory->id,
            'code' => 'M-01',
            'knit_type' => 'c',
            'dia' => 30,
            'gauge' => 24,
            'spec_label' => '30" × 24G',
            'status' => 'idle',
        ]);

        $response = $this->getJson('/api/v1/bootstrap');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'factory',
                'factories',
                'parties',
                'vendors',
                'machines',
                'machineState',
                'freeSet',
                'orders',
                'yarns',
                'qcLogs',
                'prodLog',
                'rolls',
                'challans',
                'bills',
                'store',
                'issueLog',
                'users',
                'threads',
                'jobs',
                'suppliers',
                'rfqs',
                'subcontract_posts',
                'expenses',
                'attendance',
                'vouchers',
            ],
        ]);

        $response->assertJson([
            'success' => true,
        ]);
    }
}
