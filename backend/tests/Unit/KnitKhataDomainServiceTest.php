<?php

namespace Tests\Unit;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\Party;
use App\Models\Production;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use App\Models\SubcontractOrderLine;
use App\Services\KnitKhataDomainService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KnitKhataDomainServiceTest extends TestCase
{
    use RefreshDatabase;

    private KnitKhataDomainService $service;
    private Factory $factory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new KnitKhataDomainService();

        $this->factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
            'area' => 'কোনাবাড়ী, গাজীপুর',
            'phone' => '01711234567',
            'total_machines' => 24,
            'plan_code' => 'g',
        ]);
    }

    public function test_get_bootstrap_payload_returns_expected_keys(): void
    {
        $payload = $this->service->getBootstrapPayload();

        $this->assertIsArray($payload);
        $this->assertArrayHasKey('factory', $payload);
        $this->assertArrayHasKey('factories', $payload);
        $this->assertArrayHasKey('parties', $payload);
        $this->assertArrayHasKey('vendors', $payload);
        $this->assertArrayHasKey('machines', $payload);
        $this->assertArrayHasKey('machineState', $payload);
        $this->assertArrayHasKey('freeSet', $payload);
        $this->assertArrayHasKey('orders', $payload);
        $this->assertArrayHasKey('yarns', $payload);
        $this->assertArrayHasKey('qcLogs', $payload);
        $this->assertArrayHasKey('prodLog', $payload);
        $this->assertArrayHasKey('rolls', $payload);
        $this->assertArrayHasKey('challans', $payload);
        $this->assertArrayHasKey('bills', $payload);
        $this->assertArrayHasKey('store', $payload);
        $this->assertArrayHasKey('issueLog', $payload);
        $this->assertArrayHasKey('users', $payload);
        $this->assertArrayHasKey('threads', $payload);
        $this->assertArrayHasKey('jobs', $payload);
        $this->assertArrayHasKey('suppliers', $payload);
        $this->assertArrayHasKey('rfqs', $payload);
        $this->assertArrayHasKey('subcontract_posts', $payload);
        $this->assertArrayHasKey('expenses', $payload);
        $this->assertArrayHasKey('attendance', $payload);
        $this->assertArrayHasKey('vouchers', $payload);
    }

    public function test_machines_payload_maps_status_and_properties_correctly(): void
    {
        FactoryMachine::create([
            'factory_id' => $this->factory->id,
            'code' => 'M-01',
            'knit_type' => 'c',
            'dia' => 30,
            'gauge' => 24,
            'spec_label' => '30" × 24G',
            'brand' => 'Pailung (Taiwan)',
            'status' => 'run:SC-2610-014',
            'current_order_no' => 'SC-2610-014',
            'broadcast_free' => false,
            'daily_capacity_kg' => 200,
        ]);

        FactoryMachine::create([
            'factory_id' => $this->factory->id,
            'code' => 'M-02',
            'knit_type' => 'c',
            'dia' => 34,
            'gauge' => 24,
            'spec_label' => '34" × 24G',
            'brand' => 'Mayer & Cie',
            'status' => 'down',
            'broadcast_free' => false,
            'daily_capacity_kg' => 210,
        ]);

        FactoryMachine::create([
            'factory_id' => $this->factory->id,
            'code' => 'M-03',
            'knit_type' => 'c',
            'dia' => 30,
            'gauge' => 24,
            'spec_label' => '30" × 24G',
            'brand' => 'Terrot',
            'status' => 'idle',
            'broadcast_free' => true,
            'daily_capacity_kg' => 190,
        ]);

        $payload = $this->service->getBootstrapPayload();
        $machines = collect($payload['machines'])->keyBy('code');

        $this->assertTrue($machines->has('M-01'));
        $this->assertEquals('Running', $machines['M-01']['status']);
        $this->assertEquals('SC-2610-014', $machines['M-01']['orderId']);

        $this->assertTrue($machines->has('M-02'));
        $this->assertEquals('Maint', $machines['M-02']['status']);

        $this->assertTrue($machines->has('M-03'));
        $this->assertEquals('Free', $machines['M-03']['status']);
        $this->assertTrue($machines['M-03']['broadcast_free']);
    }

    public function test_yarns_payload_aggregates_from_orders_yarn_in_json(): void
    {
        $party = Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'abc',
            'name' => 'ABC Knit Composite',
            'type' => 'ven',
        ]);

        SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_id' => $party->id,
            'party_code' => 'abc',
            'order_no' => 'SC-2610-014',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 5000,
            'done_kg' => 2000,
            'status' => 'run',
            'yarn_in_json' => [
                [
                    'd' => '2026-10-01',
                    'count' => '30/1 Combed Cotton',
                    'spin' => 'Square Spinners',
                    'lot' => 'LOT-SQ-412',
                    'bags' => 50,
                    'kg' => 1250,
                ],
                [
                    'd' => '2026-10-02',
                    'count' => '30/1 Combed Cotton',
                    'spin' => 'Square Spinners',
                    'lot' => 'LOT-SQ-419',
                    'bags' => 60,
                    'kg' => 1500,
                ],
            ],
        ]);

        $payload = $this->service->getBootstrapPayload();

        $this->assertCount(2, $payload['yarns']);
        $this->assertEquals('SC-2610-014', $payload['yarns'][0]['orderId']);
        $this->assertEquals('Square Spinners', $payload['yarns'][0]['brand']);
        $this->assertEquals(1250, $payload['yarns'][0]['rcvKg']);
        $this->assertEquals('LOT-SQ-412', $payload['yarns'][0]['lot']);
    }
}

